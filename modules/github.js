import { get, set } from "idb-keyval";
import { KEYS } from "./constants.js";
import { state } from "./state.js";
import { els } from "./dom.js";

function setGhStatus(msg) {
  if (els.ghStatus) els.ghStatus.textContent = msg;
}

function ghHeaders(json = true) {
  const h = { Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" };
  if (state.gh.token) h.Authorization = "Bearer " + state.gh.token;
  if (json) h["Content-Type"] = "application/json";
  return h;
}
function ghBase() {
  const { owner, repo } = state.gh;
  if (!owner || !repo) throw new Error("GitHub repo non configuré.");
  return `https://api.github.com/repos/${owner}/${repo}/contents`;
}
async function ghGet(path) {
  const url = `${ghBase()}/${encodeURIComponent(path)}`.replace(/%2F/g,'/');
  const res = await fetch(url + `?ref=${encodeURIComponent(state.gh.branch)}`, { headers: ghHeaders(false) });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("GitHub GET échec");
  return res.json();
}
// Fonction utilitaire pour encoder en base64 avec support UTF-8
function utf8ToBase64(str) {
  try {
    // Encoder en UTF-8 puis en base64
    return btoa(unescape(encodeURIComponent(str)));
  } catch (error) {
    console.error("Erreur d'encodage UTF-8 vers base64:", error);
    // Fallback: essayer avec TextEncoder si disponible
    if (typeof TextEncoder !== 'undefined') {
      const encoder = new TextEncoder();
      const bytes = encoder.encode(str);
      let binary = '';
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return btoa(binary);
    }
    throw error;
  }
}

async function ghPut(path, contentBase64, message, sha) {
  const url = `${ghBase()}/${encodeURIComponent(path)}`.replace(/%2F/g,'/');
  const body = { message, content: contentBase64, branch: state.gh.branch };
  if (sha) body.sha = sha;
  
  console.log("GitHub PUT request:", {
    url,
    message,
    hasSha: !!sha,
    contentLength: contentBase64.length
  });
  
  const res = await fetch(url, { 
    method: "PUT", 
    headers: ghHeaders(), 
    body: JSON.stringify(body) 
  });
  
  console.log("GitHub PUT response:", {
    status: res.status,
    statusText: res.statusText
  });
  
  if (res.status === 304) {
    console.warn("Contenu identique détecté (304), aucune modification effectuée");
    return { status: "not_modified" };
  }
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error("GitHub PUT error:", errorText);
    throw new Error(`GitHub PUT échec: ${res.status} - ${errorText}`);
  }
  
  return res.json();
}

export function autoLoadObfuscatedToken() {
  try {
    if (!state.gh.token) {
      const fromLocal = localStorage.getItem("qmd_enc_token");
      if (fromLocal) state.gh.token = fromLocal.split("$2").join("");
    }
    const params = new URLSearchParams(location.hash.replace(/^#\??/, ""));
    const enc = params.get("gh");
    if (!state.gh.token && enc) state.gh.token = enc.split("$2").join("");
    if (state.gh.token) set(KEYS.GH_CFG, { ...state.gh });
  } catch {/* no-op */}
}

export async function trySyncFromGitHub() {
  try {
    const prod = await ghGet("data/products.json");
    const pend = await ghGet("data/pending.json");
    if (prod?.content) {
      const arr = JSON.parse(atob(prod.content));
      state.products = await fetchImagesForList(arr);
      await set(KEYS.PRODUCTS, state.products);
    }
    if (pend?.content) {
      const arr = JSON.parse(atob(pend.content));
      state.pending = await fetchImagesForList(arr);
      await set(KEYS.PENDING, state.pending);
    }
    setGhStatus("Synchronisation distante terminée.");
  } catch {
    setGhStatus("Impossible de lire le dépôt (vérifiez config/permissions).");
  }
}

export async function syncToGitHub() {
  try {
    const prodMeta = (await ghGet("data/products.json")) || {};
    const pendMeta = (await ghGet("data/pending.json")) || {};
    const prodB64 = utf8ToBase64(JSON.stringify(state.products.map(stripBlobsToPaths), null, 2));
    const pendB64 = utf8ToBase64(JSON.stringify(state.pending.map(stripBlobsToPaths), null, 2));
    await ghPut("data/products.json", prodB64, "sync: products.json", prodMeta.sha);
    await ghPut("data/pending.json", pendB64, "sync: pending.json", pendMeta.sha);
    setGhStatus("Synchronisation des métadonnées effectuée.");
  } catch {
    setGhStatus("Échec de la synchronisation des métadonnées.");
  }
}

export async function pushPendingToGitHub(item) {
  if (!state.gh.owner || !state.gh.repo) { setGhStatus("Repo GitHub non configuré."); return; }
  if (!state.gh.token) { setGhStatus("Token GitHub manquant."); return; }
  for (let i = 0; i < item.images.length; i++) {
    const blob = item.images[i];
    const ext = (blob.type && blob.type.includes("jpeg")) ? "jpg" : (blob.type?.split("/")[1] || "png");
    const path = `data/images/pending/${item.id}_${i}.${ext}`;
    const exists = await ghGet(path);
    if (!exists) {
      const b64 = await b64FromBlob(blob);
      await ghPut(path, b64, `pending: image ${item.id} #${i}`);
    }
    item.images[i] = path;
  }
  const pendMeta = (await ghGet("data/pending.json")) || {};
  const current = pendMeta.content ? JSON.parse(atob(pendMeta.content)) : [];
  const filtered = current.filter(p => p.id !== item.id);
  filtered.unshift({ ...item, status: "pending" });
  const b64 = btoa(JSON.stringify(filtered, null, 2));
  await ghPut("data/pending.json", b64, `pending: add ${item.id}`, pendMeta.sha);
  await set(KEYS.PENDING, filtered);
}

export async function appendApprovedToGitHub(approved, sourcePending) {
  if (!state.gh.owner || !state.gh.repo || !state.gh.token) {
    throw new Error("Configuration GitHub incomplète");
  }
  
  // Préparer les images pour le produit approuvé
  const images = (sourcePending.images || []).map((img, i) =>
    typeof img === "string" ? img : `data/images/pending/${sourcePending.id}_${i}.png`
  );
  const approvedEntry = { ...approved, images };
  
  // Ajouter aux produits approuvés sur GitHub
  const prodMeta = (await ghGet("data/products.json")) || {};
  const currentProducts = prodMeta.content ? JSON.parse(atob(prodMeta.content)) : [];
  
  // Vérifier si le produit n'existe pas déjà (éviter les doublons)
  const existingProduct = currentProducts.find(p => p.id === approved.id || p.name === approved.name);
  if (!existingProduct) {
    currentProducts.unshift(approvedEntry);
    
    // Générer le JSON avec un formatage cohérent
    const newProductsJson = JSON.stringify(currentProducts, null, 2);
    const newProductsB64 = utf8ToBase64(newProductsJson);
    
    console.log("Mise à jour products.json avec:", {
      productsCount: currentProducts.length,
      newProduct: approvedEntry.name
    });
    
    const result = await ghPut("data/products.json", newProductsB64, `approve: ${approved.name} (${approved.id})`, prodMeta.sha);
    console.log("Résultat products.json:", result);
  }
  
  // Supprimer des produits en attente sur GitHub
  const pendMeta = (await ghGet("data/pending.json")) || {};
  if (pendMeta.content) {
    const currentPending = JSON.parse(atob(pendMeta.content));
    const updatedPending = currentPending.filter(p => p.id !== sourcePending.id);
    
    // Seulement mettre à jour si quelque chose a changé
    if (updatedPending.length !== currentPending.length) {
      const newPendingJson = JSON.stringify(updatedPending, null, 2);
      const newPendingB64 = utf8ToBase64(newPendingJson);
      
      console.log("Mise à jour pending.json:", {
        removed: sourcePending.id,
        remainingCount: updatedPending.length
      });
      
      const result = await ghPut("data/pending.json", newPendingB64, `pending: remove ${sourcePending.name} (${sourcePending.id})`, pendMeta.sha);
      console.log("Résultat pending.json:", result);
    }
  }
  
  // Mettre à jour le state local pour être sûr qu'il soit synchronisé
  await set(KEYS.PRODUCTS, state.products);
  await set(KEYS.PENDING, state.pending);
}

/* remove a pending item by id from pending.json */
export async function removePendingOnGitHubById(id) {
  if (!state.gh.owner || !state.gh.repo || !state.gh.token) {
    throw new Error("Configuration GitHub incomplète");
  }
  
  try {
    // Récupérer le fichier pending.json actuel depuis GitHub
    const pendMeta = (await ghGet("data/pending.json")) || {};
    const current = pendMeta.content ? JSON.parse(atob(pendMeta.content)) : [];
    
    // Filtrer pour supprimer l'élément avec l'id spécifié
    const next = current.filter(p => p.id !== id);
    
    // Si rien n'a changé, pas besoin de mettre à jour
    if (next.length === current.length) {
      console.warn(`Aucun élément avec l'id ${id} trouvé dans pending.json`);
      return;
    }
    
    // Générer le JSON avec un formatage cohérent
    const newPendingJson = JSON.stringify(next, null, 2);
    const newPendingB64 = utf8ToBase64(newPendingJson);
    
    console.log("Suppression de pending.json:", {
      removedId: id,
      remainingCount: next.length
    });
    
    // Mettre à jour sur GitHub
    const result = await ghPut("data/pending.json", newPendingB64, `pending: remove item ${id}`, pendMeta.sha);
    console.log("Résultat suppression:", result);
    
    // Synchroniser le state local avec GitHub
    await set(KEYS.PENDING, state.pending);
    
  } catch (error) {
    console.error("Erreur lors de la suppression sur GitHub:", error);
    throw error; // Re-lancer l'erreur pour que l'interface utilisateur puisse la gérer
  }
}

function stripBlobsToPaths(item) {
  return {
    ...item,
    images: (item.images || []).map((img, i) =>
      typeof img === "string" ? img : (img.path || `data/images/pending/${item.id}_${i}.png`)
    ),
  };
}
async function fetchImagesForList(list) {
  return Promise.all((list || []).map(async p => ({
    ...p,
    images: await Promise.all((p.images || []).map(loadImageFromPath)),
  })));
}
async function loadImageFromPath(path) {
  if (!path || typeof path !== "string") return new Blob();
  const rawBase = `https://raw.githubusercontent.com/${state.gh.owner}/${state.gh.repo}/${encodeURIComponent(state.gh.branch)}/${path}`;
  const res = await fetch(rawBase);
  if (!res.ok) return new Blob();
  return await res.blob();
}
function b64FromBlob(blob) {
  return new Promise((resolve, reject) => {
    try {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result || "").split(",")[1] || "");
      r.onerror = reject;
      r.readAsDataURL(blob);
    } catch (e) { reject(e); }
  });
}
