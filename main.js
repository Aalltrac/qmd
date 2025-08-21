import { get, set } from "idb-keyval";
import { KEYS } from "./modules/constants.js";
import { els } from "./modules/dom.js";
import { state, applyGhToUI } from "./modules/state.js";
import { seedData } from "./modules/seed.js";
import { trySyncFromGitHub, autoLoadObfuscatedToken } from "./modules/github.js";
import { bindUI, renderDiscover, renderPending } from "./modules/ui.js";

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
  if (savedGh) Object.assign(state.gh, savedGh, { token: savedGh.token || "" });
  autoLoadObfuscatedToken();
  applyGhToUI();

  await trySyncFromGitHub().catch(() => {});

  state.products = (await get(KEYS.PRODUCTS)) || [];
  state.pending = (await get(KEYS.PENDING)) || [];

  bindUI();
  renderDiscover();
  renderPending();
  if (!HTMLDialogElement.prototype.showModal && els.donateDialog) els.donateDialog.classList.add("hidden");

  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const bg = document.querySelector(".bg-squares");
    const onMove = (x=0,y=0) => {
      const dx = Math.round((x - innerWidth/2) * 0.02);
      const dy = Math.round((y - innerHeight/2) * 0.02);
      bg?.style.setProperty("--bgx", dx + "px");
      bg?.style.setProperty("--bgy", dy + "px");
    };
    window.addEventListener("mousemove", e => onMove(e.clientX, e.clientY), { passive: true });
    window.addEventListener("scroll", () => onMove(innerWidth/2, innerHeight/2 - scrollY*0.15), { passive: true });
  }
}

init();