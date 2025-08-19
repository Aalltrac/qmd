import { get, set } from "idb-keyval";
import { KEYS, ADMIN_PASS } from "./constants.js";
import { els } from "./dom.js";
import { state, applyGhToUI } from "./state.js";
import { pushPendingToGitHub, appendApprovedToGitHub, syncToGitHub } from "./github.js";

export function bindUI() {
  els.navBtns.forEach(btn => btn.addEventListener("click", () => showTab(btn.dataset.tab)));

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
    if (els.modPass.value === ADMIN_PASS) {
      state.admin = true;
      els.modGate.classList.add("hidden");
      els.modPanel.classList.remove("hidden");
    } else {
      alert("Mot de passe incorrect.");
    }
    if (state.admin) applyGhToUI();
  });

  els.editorForm.addEventListener("submit", approveEditing);
  if (!HTMLDialogElement.prototype.showModal) {
    els.editor.setAttribute("open", "");
    els.editor.classList.add("hidden");
  }

  els.donateBtn?.addEventListener("click", () => {
    if (els.donateDialog?.showModal) els.donateDialog.showModal();
    else els.donateDialog?.classList.remove("hidden");
  });
  document.addEventListener("click", async (e) => {
    const btn = e.target.closest(".copy-btn");
    if (!btn) return;
    const text = btn.getAttribute("data-copy") || "";
    try {
      await navigator.clipboard.writeText(text);
      const old = btn.textContent;
      btn.textContent = "Copié !";
      setTimeout(() => (btn.textContent = old), 1200);
    } catch {/* no-op */}
  });

  els.saveGh?.addEventListener("click", async () => {
    readGhFromUI();
    await set(KEYS.GH_CFG, { ...state.gh });
  });
  els.syncGh?.addEventListener("click", async () => {
    readGhFromUI();
    await set(KEYS.GH_CFG, { ...state.gh });
    await syncToGitHub();
  });
}

function readGhFromUI() {
  if (!els.ghOwner) return;
  state.gh.owner = (els.ghOwner.value || "").trim();
  state.gh.repo = (els.ghRepo.value || "").trim();
  state.gh.branch = (els.ghBranch.value || "main").trim();
  const maybeToken = (els.ghToken.value || "").trim();
  if (maybeToken) state.gh.token = maybeToken;
}

export function showTab(tab) {
  Object.entries(els.tabs).forEach(([k, el]) => el.classList.toggle("active", k === tab));
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
    img.src = url; img.alt = file.name;
    cell.appendChild(img);
    els.imagePreview.appendChild(cell);
  });
}

function clearErrors() {
  [...document.querySelectorAll(".error")].forEach(s => s.textContent = "");
}
function setError(fieldId, msg) {
  const el = document.querySelector(`.error[data-for="${fieldId}"]`);
  if (el) el.textContent = msg;
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

  await pushPendingToGitHub(pendingItem).catch(() => {});
  els.submitForm.reset();
  els.imagePreview.innerHTML = "";
  els.submitSuccess.classList.remove("hidden");
  renderPending();
}

export function renderDiscover() {
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

  list.forEach(p => els.productsGrid.appendChild(productCard(p)));
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
  prev.className = "ctrl prev"; prev.type = "button"; prev.setAttribute("aria-label", "Image précédente"); prev.textContent = "‹";
  const next = document.createElement("button");
  next.className = "ctrl next"; next.type = "button"; next.setAttribute("aria-label", "Image suivante"); next.textContent = "›";
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
  const goTo = (i) => {
    const arr=[...car.querySelectorAll("img")];
    if(!arr.length) return;
    arr[idx].classList.remove("active");
    idx=i%arr.length;
    arr[idx].classList.add("active");
    updateDots();
  };
  const go = (d) => {
    const arr=[...car.querySelectorAll("img")];
    if(!arr.length) return;
    goTo((idx + d + arr.length) % arr.length);
  };
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
  (items || []).forEach(t => { if (!t) return; const li = document.createElement("li"); li.textContent = t; ul.appendChild(li); });
  wrap.appendChild(h);
  wrap.appendChild(ul);
  return wrap;
}

export function renderPending() {
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
    edit.className = "primary"; edit.textContent = "Éditer/Approuver";
    edit.addEventListener("click", () => openEditor(item.id));
    const discard = document.createElement("button");
    discard.className = "ghost"; discard.textContent = "Supprimer";
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
  else els.editor.classList.remove("hidden");
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
