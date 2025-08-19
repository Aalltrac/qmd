import { get, set } from "idb-keyval";

const KEYS = {
  PRODUCTS: "qmd_products_v1", // approved
  PENDING: "qmd_pending_v1",   // submissions
  FIRST_RUN: "qmd_first_run_v1",
};
const ADMIN_PASS = "qmd2025";

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
};

let state = {
  products: [],
  pending: [],
  admin: false,
  editingId: null,
};

init();

async function init() {
  els.year.textContent = new Date().getFullYear();

  // First run seed
  const firstRun = await get(KEYS.FIRST_RUN);
  if (!firstRun) {
    const demo = await seedData();
    await set(KEYS.PRODUCTS, demo.approved);
    await set(KEYS.PENDING, demo.pending);
    await set(KEYS.FIRST_RUN, true);
  }

  state.products = (await get(KEYS.PRODUCTS)) || [];
  state.pending = (await get(KEYS.PENDING)) || [];

  bindUI();
  renderDiscover();
  renderPending();
}

function bindUI() {
  // Tab nav
  els.navBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const tab = btn.dataset.tab;
      showTab(tab);
    });
  });

  // Filters
  els.search.addEventListener("input", renderDiscover);
  els.minScore.addEventListener("input", () => {
    els.minScoreVal.textContent = els.minScore.value;
    renderDiscover();
  });

  // Submit form
  els.productImages.addEventListener("change", updateImagePreview);
  els.submitForm.addEventListener("submit", handleSubmitForm);
  els.submitForm.addEventListener("reset", () => {
    els.imagePreview.innerHTML = "";
    els.submitSuccess.classList.add("hidden");
    clearErrors();
  });

  // Admin gate
  els.modEnter.addEventListener("click", () => {
    if (els.modPass.value === ADMIN_PASS) {
      state.admin = true;
      els.modGate.classList.add("hidden");
      els.modPanel.classList.remove("hidden");
    } else {
      alert("Mot de passe incorrect.");
    }
  });

  // Editor approve
  els.editorForm.addEventListener("submit", approveEditing);
  if (!HTMLDialogElement.prototype.showModal) {
    // simple fallback
    els.editor.setAttribute("open", "");
    els.editor.classList.add("hidden");
  }
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
    images, // Blobs in IndexedDB
    submittedAt: Date.now(),
    status: "pending",
  };

  state.pending.unshift(pendingItem);
  await set(KEYS.PENDING, state.pending);

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
  p.images.forEach((blob, i) => {
    const img = document.createElement("img");
    img.src = URL.createObjectURL(blob);
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
  const imgs = () => [...car.querySelectorAll("img")];
  const go = (d) => {
    const arr = imgs();
    if (arr.length === 0) return;
    arr[idx].classList.remove("active");
    idx = (idx + d + arr.length) % arr.length;
    arr[idx].classList.add("active");
  };
  prev.addEventListener("click", () => go(-1));
  next.addEventListener("click", () => go(1));

  media.appendChild(car);
  if ((p.images || []).length > 1) {
    media.appendChild(prev);
    media.appendChild(next);
  }

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
    // Show count in gate?
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
    images: item.images, // carry over blobs
    positives, negatives, advice,
    score,
    approvedAt: Date.now(),
  };

  state.products.unshift(approved);
  state.pending = state.pending.filter(p => p.id !== id);

  await set(KEYS.PRODUCTS, state.products);
  await set(KEYS.PENDING, state.pending);

  if (els.editor.close) els.editor.close(); else els.editor.classList.add("hidden");
  state.editingId = null;

  renderDiscover();
  renderPending();
  showTab("discover");
}

function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }

// Seed demo content
async function seedData() {
  // Create placeholder images using canvas to avoid external URLs
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

