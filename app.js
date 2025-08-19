import { get, set } from "idb-keyval";

const KEYS = {
  PRODUCTS: "qmd_products_v1",
  PENDING: "qmd_pending_v1",
  FIRST_RUN: "qmd_first_run_v1",
  GH_CFG: "qmd_gh_cfg_v1",
};

const ADMIN_PASS = "qmd2025";

const GH_OBF_TOKEN = "g$2h$2p$2_$22$2o$20$2H$2G$2i$2H$2v$2P$2U$2x$2F$2a$23$2Q$2X$2G$2f$2S$2h$2Z$20$2v$2R$2b$2f$2w$2C$2k$25$21$28$20$2A$2f$2Y";
function deobfuscateSep(s, sep = "$2") { return (s || "").split(sep).join(""); }

const els = {
  tabs: {
    discover: document.getElementById("tab-discover"),
    submit: document.getElementById("tab-submit"),
    moderate: document.getElementById("tab-moderate"),
  },
  navBtns: [...document.querySelectorAll(".nav-btn")],
  productsGrid: document.getElementById("productsGrid"),
  noProducts: document.getElementById("noProducts"),
  search: document.getElementById("search"),
  minScore: document.getElementById("minScore"),
  minScoreVal: document.getElementById("minScoreVal"),
  submitForm: document.getElementById("submitForm"),
  productImages: document.getElementById("productImages"),
  imagePreview: document.getElementById("imagePreview"),
  submitSuccess: document.getElementById("submitSuccess"),
  modGate: document.getElementById("modGate"),
  modPanel: document.getElementById("modPanel"),
  modPass: document.getElementById("modPass"),
  modEnter: document.getElementById("modEnter"),
  pendingList: document.getElementById("pendingList"),
  noPending: document.getElementById("noPending"),
  year: document.getElementById("year"),
  editor: document.getElementById("editorDialog"),
  editorForm: document.getElementById("editorForm"),
  edName: document.getElementById("edName"),
  edBrand: document.getElementById("edBrand"),
  edPositives: document.getElementById("edPositives"),
  edNegatives: document.getElementById("edNegatives"),
  edAdvice: document.getElementById("edAdvice"),
  edScore: document.getElementById("edScore"),
  editorGallery: document.getElementById("editorGallery"),
  approveBtn: document.getElementById("approveBtn"),
  ghOwner: document.getElementById("ghOwner"),
  ghRepo: document.getElementById("ghRepo"),
  ghBranch: document.getElementById("ghBranch"),
  ghToken: document.getElementById("ghToken"),
  saveGh: document.getElementById("saveGh"),
  syncGh: document.getElementById("syncGh"),
  ghStatus: document.getElementById("ghStatus"),
};

let state = {
  products: [],
  pending: [],
  admin: false,
  editingId: null,
  gh: { owner: "Aalltrac", repo: "qmd", branch: "main", token: deobfuscateSep(GH_OBF_TOKEN) },
};

init();

async function init() {
  els.year.textContent = new Date().getFullYear();

  const firstRun = await get(KEYS.FIRST_RUN);
  if (!firstRun) {
    const demo = await seedData();
    await set(KEYS.PRODUCTS, demo.approved);
    await set(KEYS.PENDING, demo.pending);
    await set(KEYS.FIRST_RUN, true);
  }

  const savedGh = (await get(KEYS.GH_CFG)) || null;
  if (savedGh) {
    state.gh = { ...state.gh, ...savedGh, token: savedGh.token || "" };
  }
  autoLoadObfuscatedToken(); // try URL/local obfuscated token if empty
  if (state.gh.owner && state.gh.repo) applyGhToUI();
  if (state.gh.owner && state.gh.repo) await trySyncFromGitHub();

  state.products = (await get(KEYS.PRODUCTS)) || [];
  state.pending = (await get(KEYS.PENDING)) || [];

  bindUI();
  renderDiscover();
  renderPending();
}

function bindUI() {
  els.navBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const tab = btn.dataset.tab;
      showTab(tab);
    });
  });

  els.search.addEventListener("input", renderDiscover);
  els.minScore.addEventListener("input", () => {
    els.minScoreVal.textContent = els.minScore.value;
    renderDiscover();
  });

  els.productImages.addEventListener("change", updateImagePreview);
  els.submitForm.addEventListener("submit", handleSubmitForm);
  els.submitForm.addEventListener("reset", () => {
    els.imagePreview.innerHTML = "";
    els.submitSuccess.classList.add("hidden");
    clearErrors();
  });

  els.modEnter.addEventListener("click", () => {
    try {
      if (els.modPass.value === ADMIN_PASS) {
        state.admin = true;
        els.modGate.classList.add("hidden");
        els.modPanel.classList.remove("hidden");
        setGhStatus("Mode modérateur activé.");
      } else {
        alert("Mot de passe incorrect.");
      }
    } catch (e) {
      alert("Erreur de connexion modérateur.");
    }
    if (state.admin) applyGhToUI();
  });

  els.editorForm.addEventListener("submit", approveEditing);
  if (!HTMLDialogElement.prototype.showModal) {
    els.editor.setAttribute("open", "");
    els.editor.classList.add("hidden");
  }

  els.saveGh.addEventListener("click", async () => {
    readGhFromUI();
    await set(KEYS.GH_CFG, { ...state.gh });
    setGhStatus("Configuration enregistrée.");
  });
  els.syncGh.addEventListener("click", async () => {
    readGhFromUI();
    await set(KEYS.GH_CFG, { ...state.gh });
    await syncToGitHub();
    await trySyncFromGitHub();
  });
}

function showTab(tab) {
  Object.entries(els.tabs).forEach(([k, el]) => {
    el.classList.toggle("active", k === tab);
  });
  els.navBtns.forEach(b => b.setAttribute("aria-current", b.dataset.tab === tab ? "page" : "false"));
}

function updateImagePreview() {
  els.imagePreview.innerHTML = "";
  const files = [...els.productImages.files].slice(0, 8);
  files.forEach(file => {
    const url = URL.createObjectURL(file);
    const cell = document.createElement("div");
    cell.className = "thumb";
    const img = document.createElement("img");
    img.src = url;
    img.alt = file.name;
    cell.appendChild(img);
    els.imagePreview.appendChild(cell);
  });
}

function clearErrors() {
  [...document.querySelectorAll(".error")].forEach(s => s.textContent = "");
}

async function handleSubmitForm(e) {
  e.preventDefault();
  clearErrors();
  const name = document.getElementById("productName").value.trim();
  const brand = document.getElementById("brandName").value.trim();
  const files = [...els.productImages.files];

  let ok = true;
  if (!name) { setError("productName", "Champ requis"); ok = false; }
  if (!brand) { setError("brandName", "Champ requis"); ok = false; }
  if (files.length < 3) { setError("productImages", "Ajoutez au moins 3 images."); ok = false; }
  if (!ok) return;

  const images = await Promise.all(files.map(f => f.arrayBuffer().then(buf => new Blob([buf], { type: f.type }))));
  const pendingItem = {
    id: crypto.randomUUID(),
    name, brand,
    images,
    submittedAt: Date.now(),
    status: "pending",
  };

  state.pending.unshift(pendingItem);
  await set(KEYS.PENDING, state.pending);
  await pushPendingToGitHub(pendingItem).catch(()=>{
    setGhStatus("Proposition enregistrée localement. Configurez GitHub pour la synchroniser.");
  });
  els.submitForm.reset();
  els.imagePreview.innerHTML = "";
  els.submitSuccess.classList.remove("hidden");
  renderPending();
}

function setError(fieldId, msg) {
  const el = document.querySelector(`.error[data-for="${fieldId}"]`);
  if (el) el.textContent = msg;
}

function renderDiscover() {
  const term = els.search.value.trim().toLowerCase();
  const min = parseInt(els.minScore.value, 10);
  const list = state.products
    .filter(p => (!term || p.name.toLowerCase().includes(term) || p.brand.toLowerCase().includes(term)))
    .filter(p => (isFinite(min) ? (p.score ?? 0) >= min : true));

  els.productsGrid.innerHTML = "";
  if (list.length === 0) {
    els.noProducts.classList.remove("hidden");
    return;
  }
  els.noProducts.classList.add("hidden");

  list.forEach(p => {
    const card = productCard(p);
    els.productsGrid.appendChild(card);
  });
}

function productCard(p) {
  const card = document.createElement("article");
  card.className = "card";

  const media = document.createElement("div");
  media.className = "card-media";
  const car = document.createElement("div");
  car.className = "carousel";
  let idx = 0;
  const imgs = (p.images || []).filter(Boolean);
  const base = imgs.length > 0 ? imgs : [];
  const ensured = base.length >= 3 ? base : [...base, ...base].slice(0, Math.max(3, base.length));
  ensured.forEach((blob, i) => {
    const img = document.createElement("img");
    img.src = URL.createObjectURL(blob); img.loading = "lazy";
    img.alt = `${p.name} - image ${i+1}`;
    img.className = i === 0 ? "active" : "";
    car.appendChild(img);
  });
  const prev = document.createElement("button");
  prev.className = "ctrl prev";
  prev.setAttribute("aria-label", "Image précédente");
  prev.textContent = "‹";
  const next = document.createElement("button");
  next.className = "ctrl next";
  next.setAttribute("aria-label", "Image suivante");
  next.textContent = "›";
  const dots = document.createElement("div");
  dots.className = "dots";
  ensured.forEach((_, i) => {
    const d = document.createElement("button");
    d.type = "button";
    d.className = "dot" + (i === 0 ? " active" : "");
    d.addEventListener("click", () => goTo(i));
    dots.appendChild(d);
  });
  const updateDots = () => dots.querySelectorAll(".dot").forEach((d,i)=>d.classList.toggle("active", i===idx));
  const goTo = (i) => { const arr=[...car.querySelectorAll("img")]; if(!arr.length) return; arr[idx].classList.remove("active"); idx=i%arr.length; arr[idx].classList.add("active"); updateDots(); };
  const go = (d) => { const arr=[...car.querySelectorAll("img")]; if(!arr.length) return; goTo((idx + d + arr.length) % arr.length); };
  prev.addEventListener("click", () => go(-1));
  next.addEventListener("click", () => go(1));
  media.appendChild(car);
  media.appendChild(prev);
  media.appendChild(next);
  media.appendChild(dots);
  let timerId=null, playing=false;
  const startAuto=()=>{ if(playing) return; playing=true; timerId=setInterval(()=>go(1), 3500); };
  const stopAuto=()=>{ playing=false; if(timerId) clearInterval(timerId); timerId=null; };
  const io=new IntersectionObserver((ents)=>ents.forEach(e=>e.isIntersecting?startAuto():stopAuto()),{threshold:.5});
  io.observe(media);
  let sx=0, dx=0, down=false;
  media.addEventListener("pointerdown",(e)=>{ down=true; sx=e.clientX; dx=0; media.setPointerCapture(e.pointerId); });
  media.addEventListener("pointermove",(e)=>{ if(!down) return; dx=e.clientX-sx; });
  media.addEventListener("pointerup",(e)=>{ if(!down) return; down=false; media.releasePointerCapture(e.pointerId); if(Math.abs(dx)>40) dx<0?go(1):go(-1); dx=0; });
  media.tabIndex = 0;
  media.addEventListener("keydown",(e)=>{ if(e.key==="ArrowLeft") go(-1); if(e.key==="ArrowRight") go(1); });

  const body = document.createElement("div");
  body.className = "card-body";
  const brandline = document.createElement("div");
  brandline.className = "brandline";
  const title = document.createElement("h3");
  title.textContent = p.name;
  const brand = document.createElement("span");
  brand.className = "brand";
  brand.textContent = p.brand;

  const badge = document.createElement("span");
  const score = p.score ?? 0;
  badge.className = "badge " + (score >= 70 ? "good" : score >= 40 ? "ok" : "poor");
  badge.textContent = `Note: ${score}/100`;

  brandline.appendChild(title);
  brandline.appendChild(badge);

  const meta = document.createElement("div");
  meta.className = "meta";

  const brandRow = document.createElement("div");
  brandRow.textContent = `Marque: ${p.brand}`;

  const pos = bulletBlock("Points positifs", p.positives);
  const neg = bulletBlock("Points négatifs", p.negatives);
  const adv = bulletBlock("Conseils de consommation", p.advice ? [p.advice] : []);

  meta.appendChild(brandRow);
  meta.appendChild(pos);
  meta.appendChild(neg);
  meta.appendChild(adv);

  body.appendChild(brandline);
  body.appendChild(meta);

  card.appendChild(media);
  card.appendChild(body);
  return card;
}

function bulletBlock(title, items = []) {
  const wrap = document.createElement("div");
  const h = document.createElement("h4");
  h.textContent = title;
  const ul = document.createElement("ul");
  ul.className = "list-bullets";
  (items || []).forEach(t => {
    if (!t) return;
    const li = document.createElement("li");
    li.textContent = t;
    ul.appendChild(li);
  });
  wrap.appendChild(h);
  wrap.appendChild(ul);
  return wrap;
}

function renderPending() {
  if (!state.admin) {
  }
  els.pendingList.innerHTML = "";
  const list = state.pending;
  if (list.length === 0) {
    els.noPending.classList.remove("hidden");
    return;
  }
  els.noPending.classList.add("hidden");

  list.forEach(item => {
    const row = document.createElement("div");
    row.className = "pending-item";

    const thumb = document.createElement("div");
    thumb.className = "pending-thumb";
    const img = document.createElement("img");
    if (item.images?.[0]) img.src = URL.createObjectURL(item.images[0]);
    img.alt = `${item.name} aperçu`;
    thumb.appendChild(img);

    const info = document.createElement("div");
    const title = document.createElement("div");
    title.innerHTML = `<strong>${item.name}</strong> <span class="muted">— ${item.brand}</span>`;
    const date = document.createElement("div");
    date.className = "muted tiny";
    date.textContent = new Date(item.submittedAt).toLocaleString();
    info.appendChild(title);
    info.appendChild(date);

    const actions = document.createElement("div");
    actions.className = "pending-actions";
    const edit = document.createElement("button");
    edit.className = "primary";
    edit.textContent = "Éditer/Approuver";
    edit.addEventListener("click", () => openEditor(item.id));
    const discard = document.createElement("button");
    discard.className = "ghost";
    discard.textContent = "Supprimer";
    discard.addEventListener("click", async () => {
      if (confirm("Supprimer cette proposition ?")) {
        state.pending = state.pending.filter(p => p.id !== item.id);
        await set(KEYS.PENDING, state.pending);
        renderPending();
      }
    });

    actions.appendChild(edit);
    actions.appendChild(discard);

    row.appendChild(thumb);
    row.appendChild(info);
    row.appendChild(actions);
    els.pendingList.appendChild(row);
  });
}

function openEditor(id) {
  const item = state.pending.find(p => p.id === id);
  if (!item) return;

  state.editingId = id;

  els.edName.value = item.name;
  els.edBrand.value = item.brand;
  els.edPositives.value = "";
  els.edNegatives.value = "";
  els.edAdvice.value = "";
  els.edScore.value = 50;

  els.editorGallery.innerHTML = "";
  (item.images || []).forEach((blob, i) => {
    const cell = document.createElement("div");
    cell.className = "cell";
    const img = document.createElement("img");
    img.src = URL.createObjectURL(blob);
    img.alt = `Image ${i+1}`;
    cell.appendChild(img);
    els.editorGallery.appendChild(cell);
  });

  if (els.editor.showModal) els.editor.showModal();
  else {
    els.editor.classList.remove("hidden");
  }
}

async function approveEditing(e) {
  e.preventDefault();
  const id = state.editingId;
  const item = state.pending.find(p => p.id === id);
  if (!item) return;

  const name = els.edName.value.trim();
  const brand = els.edBrand.value.trim();
  const positives = els.edPositives.value.split("\n").map(s => s.trim()).filter(Boolean);
  const negatives = els.edNegatives.value.split("\n").map(s => s.trim()).filter(Boolean);
  const advice = els.edAdvice.value.trim();
  const score = clamp(parseInt(els.edScore.value, 10) || 0, 0, 100);

  const approved = {
    id: crypto.randomUUID(),
    name, brand,
    images: item.images,
    positives, negatives, advice,
    score,
    approvedAt: Date.now(),
  };

  state.products.unshift(approved);
  state.pending = state.pending.filter(p => p.id !== id);

  await set(KEYS.PRODUCTS, state.products);
  await set(KEYS.PENDING, state.pending);
  await appendApprovedToGitHub(approved, item).catch(()=>{});
  if (els.editor.close) els.editor.close(); else els.editor.classList.add("hidden");
  state.editingId = null;

  renderDiscover();
  renderPending();
  showTab("discover");
}

function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }

async function seedData() {
  const makeImg = async (label, bg = "#f0f0f0") => {
    const c = document.createElement("canvas");
    c.width = 800; c.height = 600;
    const ctx = c.getContext("2d");
    ctx.fillStyle = bg; ctx.fillRect(0,0,c.width,c.height);
    ctx.fillStyle = "#222"; ctx.font = "bold 40px system-ui, sans-serif";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(label, c.width/2, c.height/2);
    const blob = await new Promise(res => c.toBlob(res, "image/png", 0.9));
    return blob;
  };

  const cerealImgs = [
    await makeImg("Céréales — face", "#f7efe7"),
    await makeImg("Céréales — dos", "#eef7ea"),
    await makeImg("Céréales — valeurs", "#eaf0fb"),
  ];
  const yaourtImgs = [
    await makeImg("Yaourt — pack", "#eef5ff"),
    await makeImg("Yaourt — pot", "#fff5ef"),
    await makeImg("Yaourt — ingrédients", "#eefaf1"),
  ];

  const approved = [
    {
      id: crypto.randomUUID(),
      name: "Céréales croustillantes nature",
      brand: "Grain+",
      images: cerealImgs,
      positives: ["Riche en fibres", "Faible en additifs"],
      negatives: ["Peut contenir des traces de sucre ajouté"],
      advice: "À associer avec un yaourt nature pour un meilleur équilibre.",
      score: 72,
      approvedAt: Date.now(),
    },
    {
      id: crypto.randomUUID(),
      name: "Yaourt brassé sucré",
      brand: "LactoDélice",
      images: yaourtImgs,
      positives: ["Source de calcium et protéines"],
      negatives: ["Teneur en sucre élevée", "Arômes ajoutés"],
      advice: "Privilégier la version nature et sucrer avec des fruits.",
      score: 45,
      approvedAt: Date.now(),
    },
  ];

  const pending = [];

  return { approved, pending };
}

function applyGhToUI() {
  els.ghOwner.value = state.gh.owner || "";
  els.ghRepo.value = state.gh.repo || "";
  els.ghBranch.value = state.gh.branch || "main";
  els.ghToken.value = "";
}
function readGhFromUI() {
  state.gh.owner = (els.ghOwner.value || "").trim();
  state.gh.repo = (els.ghRepo.value || "").trim();
  state.gh.branch = (els.ghBranch.value || "main").trim();
  const maybeToken = els.ghToken.value.trim();
  if (maybeToken) state.gh.token = maybeToken;
}
function setGhStatus(msg) {
  els.ghStatus.textContent = msg;
}
function ghHeaders(json=true) {
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
async function ghPut(path, contentBase64, message, sha) {
  const url = `${ghBase()}/${encodeURIComponent(path)}`.replace(/%2F/g,'/');
  const body = { message, content: contentBase64, branch: state.gh.branch };
  if (sha) body.sha = sha;
  const res = await fetch(url, { method: "PUT", headers: ghHeaders(), body: JSON.stringify(body) });
  if (!res.ok) throw new Error("GitHub PUT échec");
  return res.json();
}
function b64FromBlob(blob) {
  return new Promise((resolve, reject) => {
    try {
      const r = new FileReader();
      r.onload = () => {
        const dataUrl = r.result || "";
        const base64 = String(dataUrl).split(",")[1] || "";
        resolve(base64);
      };
      r.onerror = reject;
      r.readAsDataURL(blob);
    } catch (e) { reject(e); }
  });
}
async function trySyncFromGitHub() {
  try {
    const prod = await ghGet("data/products.json");
    const pend = await ghGet("data/pending.json");
    if (prod?.content) {
      const arr = JSON.parse(atob(prod.content));
      const withImgs = await fetchProductsImages(arr);
      state.products = withImgs;
      await set(KEYS.PRODUCTS, state.products);
      renderDiscover();
    }
    if (pend?.content) {
      const arr = JSON.parse(atob(pend.content));
      const withImgs = await fetchPendingImages(arr);
      state.pending = withImgs;
      await set(KEYS.PENDING, state.pending);
      renderPending();
    }
    setGhStatus("Synchronisation distante terminée.");
  } catch (e) {
    setGhStatus("Impossible de lire le dépôt (vérifiez config/permissions).");
  }
}
async function syncToGitHub() {
  try {
    const prodMeta = (await ghGet("data/products.json")) || {};
    const pendMeta = (await ghGet("data/pending.json")) || {};
    const prodB64 = btoa(JSON.stringify(state.products.map(stripBlobsToPaths), null, 2));
    const pendB64 = btoa(JSON.stringify(state.pending.map(stripBlobsToPaths), null, 2));
    await ghPut("data/products.json", prodB64, "sync: products.json", prodMeta.sha);
    await ghPut("data/pending.json", pendB64, "sync: pending.json", pendMeta.sha);
    setGhStatus("Synchronisation des métadonnées effectuée.");
  } catch {
    setGhStatus("Échec de la synchronisation des métadonnées.");
  }
}
function stripBlobsToPaths(item) {
  return {
    ...item,
    images: item.images.map((img, i) =>
      typeof img === "string" ? img : (img.path || `data/images/pending/${item.id}_${i}.png`)
    ),
  };
}
async function pushPendingToGitHub(item) {
  if (!state.gh.owner || !state.gh.repo) { setGhStatus("Repo GitHub non configuré."); return; }
  if (!state.gh.token) { setGhStatus("Token GitHub manquant. Enregistrez-le dans la section Modération."); return; }
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
async function appendApprovedToGitHub(approved, sourcePending) {
  if (!state.gh.owner || !state.gh.repo || !state.gh.token) return;
  const images = (sourcePending.images || []).map((img, i) => {
    if (typeof img === "string") return img;
    return `data/images/pending/${sourcePending.id}_${i}.png`;
  });
  const approvedEntry = { ...approved, images };
  const prodMeta = (await ghGet("data/products.json")) || {};
  const current = prodMeta.content ? JSON.parse(atob(prodMeta.content)) : [];
  current.unshift(approvedEntry);
  await ghPut("data/products.json", btoa(JSON.stringify(current, null, 2)), `approve: ${approved.id}`, prodMeta.sha);
  const pendMeta = (await ghGet("data/pending.json")) || {};
  if (pendMeta.content) {
    const list = JSON.parse(atob(pendMeta.content)).filter(p => p.id !== sourcePending.id);
    await ghPut("data/pending.json", btoa(JSON.stringify(list, null, 2)), `pending: remove ${sourcePending.id}`, pendMeta.sha);
  }
}
async function fetchProductsImages(list) {
  return Promise.all(list.map(async p => ({
    ...p,
    images: await Promise.all((p.images || []).map(loadImageFromPath)),
  })));
}
async function fetchPendingImages(list) {
  return Promise.all(list.map(async p => ({
    ...p,
    images: await Promise.all((p.images || []).map(loadImageFromPath)),
  })));
}
async function loadImageFromPath(path) {
  if (!path || typeof path !== "string") return new Blob();
  const rawBase = `https://raw.githubusercontent.com/${state.gh.owner}/${state.gh.repo}/${encodeURIComponent(state.gh.branch)}/${path}`;
  const res = await fetch(rawBase);
  if (!res.ok) return new Blob();
  const blob = await res.blob();
  return blob;
}

function obfuscateToken(t) {
  try { return btoa(t).split("").reverse().join(""); } catch { return ""; }
}
function autoLoadObfuscatedToken() {
  try {
    if (!state.gh.token) {
      const fromLocal = localStorage.getItem("qmd_enc_token");
      if (fromLocal) state.gh.token = deobfuscateSep(fromLocal) || "";
    }
    const params = new URLSearchParams(location.hash.replace(/^#\??/, ""));
    const enc = params.get("gh");
    if (!state.gh.token && enc) {
      state.gh.token = deobfuscateSep(enc) || "";
    }
    if (state.gh.token) {
      set(KEYS.GH_CFG, { ...state.gh });
      applyGhToUI();
      setGhStatus("Token chargé via obfuscation.");
    }
  } catch {/* no-op */}
}
