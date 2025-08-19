import { get, set } from "idb-keyval";
import { KEYS } from "modules/constants.js";
import { els } from "modules/dom.js";
import { state, applyGhToUI } from "modules/state.js";
import { seedData } from "modules/seed.js";
import { trySyncFromGitHub, autoLoadObfuscatedToken } from "modules/github.js";
import { bindUI, renderDiscover, renderPending } from "modules/ui.js";

async function init() {
  els.year.textContent = new Date().getFullYear();

  const firstRun = await get(KEYS.FIRST_RUN);
  if (!firstRun) {
    const demo = await seedData();
    await set(KEYS.PRODUCTS, demo.approved);
    await set(KEYS.PENDING, demo.pending);
    await set(KEYS.FIRST_RUN, true);
  }

  // Load persisted GH cfg, then attempt token auto-load
  const savedGh = (await get(KEYS.GH_CFG)) || null;
  if (savedGh) Object.assign(state.gh, savedGh, { token: savedGh.token || "" });
  autoLoadObfuscatedToken();
  applyGhToUI();

  // Try pulling remote data (non-fatal)
  await trySyncFromGitHub().catch(() => {});

  // Load local state for UI
  state.products = (await get(KEYS.PRODUCTS)) || [];
  state.pending = (await get(KEYS.PENDING)) || [];

  bindUI();
  renderDiscover();
  renderPending();
  // Fallback for donate dialog on very old browsers
  if (!HTMLDialogElement.prototype.showModal && els.donateDialog) els.donateDialog.classList.add("hidden");
}

init();
