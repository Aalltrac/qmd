const CATEGORIES = [
  "Processeur",
  "Refroidissement Processeur",
  "Carte Mère",
  "RAM",
  "Stockage",
  "Carte Graphique",
  "Boîtier",
  "Alimentation",
  "Ventilateurs",
  "Ecran",
  "Clavier",
  "Souris",
  "Casque"
];

const state = {
  productsByCategory: {},
  selected: {}
};

const configurator = document.getElementById("configurator");
const summaryList = document.getElementById("summaryList");
const totalPrice = document.getElementById("totalPrice");
const shareResult = document.getElementById("shareResult");

document.getElementById("year").textContent = new Date().getFullYear();

document.getElementById("shareConfig").addEventListener("click", shareConfiguration);
document.getElementById("openMerchants").addEventListener("click", openMerchants);

init();

async function init() {
  const response = await fetch("products.db");
  const data = await response.json();
  state.productsByCategory = data.categories;

  const shared = parseSharedConfig();

  CATEGORIES.forEach((category) => {
    const products = state.productsByCategory[category] || [];
    if (!products.length) return;

    const defaultProductId = shared?.[category]?.productId || products[0].id;
    const defaultProduct = products.find((p) => p.id === defaultProductId) || products[0];
    const cheapestMerchantIndex = getCheapestMerchantIndex(defaultProduct.merchants);
    const merchantIndex = Number.isInteger(shared?.[category]?.merchantIndex)
      ? shared[category].merchantIndex
      : cheapestMerchantIndex;

    state.selected[category] = {
      productId: defaultProduct.id,
      merchantIndex: Math.min(merchantIndex, defaultProduct.merchants.length - 1)
    };

    renderCard(category);
  });

  updateSummary();
}

function renderCard(category) {
  const card = document.createElement("article");
  card.className = "card";
  card.dataset.category = category;

  const title = document.createElement("h3");
  title.textContent = category;

  const productLabel = document.createElement("label");
  productLabel.textContent = "Produit";
  const productSelect = document.createElement("select");

  const merchantLabel = document.createElement("label");
  merchantLabel.textContent = "Marchand";
  const merchantSelect = document.createElement("select");

  const specs = document.createElement("ul");
  specs.className = "specs";

  const bestPrice = document.createElement("p");
  bestPrice.className = "price";

  const chart = document.createElement("canvas");
  chart.width = 600;
  chart.height = 160;

  const dayLegend = document.createElement("small");
  dayLegend.textContent = "Historique du prix minimum (gauche = avant-hier/plus ancien, droite = aujourd'hui).";

  productSelect.addEventListener("change", () => {
    state.selected[category].productId = productSelect.value;
    const product = getSelectedProduct(category);
    state.selected[category].merchantIndex = getCheapestMerchantIndex(product.merchants);
    populateCardDetails({ category, productSelect, merchantSelect, specs, bestPrice, chart });
    updateSummary();
  });

  merchantSelect.addEventListener("change", () => {
    state.selected[category].merchantIndex = Number(merchantSelect.value);
    updateSummary();
  });

  card.append(title, productLabel, productSelect, merchantLabel, merchantSelect, bestPrice, specs, chart, dayLegend);
  configurator.appendChild(card);

  populateCardDetails({ category, productSelect, merchantSelect, specs, bestPrice, chart });
}

function populateCardDetails({ category, productSelect, merchantSelect, specs, bestPrice, chart }) {
  const products = state.productsByCategory[category];
  const selectedProduct = getSelectedProduct(category);

  productSelect.innerHTML = products
    .map((p) => `<option value="${p.id}">${p.name}</option>`)
    .join("");
  productSelect.value = selectedProduct.id;

  const cheapest = selectedProduct.merchants[getCheapestMerchantIndex(selectedProduct.merchants)];
  bestPrice.textContent = `Prix le plus bas : ${formatPrice(cheapest.price)} chez ${cheapest.name}`;

  merchantSelect.innerHTML = selectedProduct.merchants
    .map((m, index) => `<option value="${index}">${m.name} - ${formatPrice(m.price)}</option>`)
    .join("");
  const merchantIndex = Math.min(state.selected[category].merchantIndex, selectedProduct.merchants.length - 1);
  state.selected[category].merchantIndex = merchantIndex;
  merchantSelect.value = String(merchantIndex);

  specs.innerHTML = Object.entries(selectedProduct.specs)
    .map(([k, v]) => `<li><strong>${k}:</strong> ${v}</li>`)
    .join("");

  drawHistoryChart(chart, selectedProduct.priceHistory);
}

function drawHistoryChart(canvas, history) {
  const ctx = canvas.getContext("2d");
  const { width, height } = canvas;
  ctx.clearRect(0, 0, width, height);

  const min = Math.min(...history);
  const max = Math.max(...history);
  const pad = 18;
  const usableW = width - pad * 2;
  const usableH = height - pad * 2;

  ctx.strokeStyle = "#334155";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pad, height - pad);
  ctx.lineTo(width - pad, height - pad);
  ctx.stroke();

  ctx.strokeStyle = "#22d3ee";
  ctx.lineWidth = 3;
  ctx.beginPath();

  history.forEach((price, i) => {
    const x = pad + (history.length === 1 ? 0 : (i / (history.length - 1)) * usableW);
    const y = pad + ((max - price) / Math.max(max - min, 1)) * usableH;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);

    ctx.fillStyle = "#67e8f9";
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x, y);
  });

  ctx.stroke();

  ctx.fillStyle = "#cbd5e1";
  ctx.font = "14px sans-serif";
  ctx.fillText(`${formatPrice(min)} min`, pad, 14);
  ctx.fillText(`${formatPrice(max)} max`, width - 120, 14);
}

function updateSummary() {
  let total = 0;
  summaryList.innerHTML = "";

  CATEGORIES.forEach((category) => {
    const product = getSelectedProduct(category);
    if (!product) return;
    const merchant = product.merchants[state.selected[category].merchantIndex];
    total += merchant.price;

    const li = document.createElement("li");
    li.textContent = `${category}: ${product.name} - ${merchant.name} (${formatPrice(merchant.price)})`;
    summaryList.appendChild(li);
  });

  totalPrice.textContent = `Total : ${formatPrice(total)}`;
}

function openMerchants() {
  CATEGORIES.forEach((category) => {
    const product = getSelectedProduct(category);
    if (!product) return;
    const merchant = product.merchants[state.selected[category].merchantIndex];
    window.open(merchant.url, "_blank", "noopener,noreferrer");
  });
}

function shareConfiguration() {
  const payload = {};
  CATEGORIES.forEach((category) => {
    if (!state.selected[category]) return;
    payload[category] = { ...state.selected[category] };
  });

  const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
  const url = `${location.origin}${location.pathname}?config=${encodeURIComponent(encoded)}`;

  navigator.clipboard.writeText(url)
    .then(() => {
      shareResult.textContent = `Lien copié : ${url}`;
    })
    .catch(() => {
      shareResult.textContent = `Lien généré : ${url}`;
    });
}

function parseSharedConfig() {
  const params = new URLSearchParams(location.search);
  const configParam = params.get("config");
  if (!configParam) return null;

  try {
    const decoded = decodeURIComponent(escape(atob(configParam)));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

function getSelectedProduct(category) {
  const products = state.productsByCategory[category] || [];
  const selectedId = state.selected[category]?.productId;
  return products.find((p) => p.id === selectedId) || products[0];
}

function getCheapestMerchantIndex(merchants) {
  return merchants.reduce((bestIndex, merchant, i, arr) => (merchant.price < arr[bestIndex].price ? i : bestIndex), 0);
}

function formatPrice(price) {
  return `${price.toFixed(2).replace('.', ',')} €`;
}
