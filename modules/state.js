import { deobfuscateSep, GH_OBF_TOKEN } from "./constants.js";
import { els } from "./dom.js";

export const state = {
  products: [],
  pending: [],
  admin: false,
  editingId: null,
  gh: { owner: "Aalltrac", repo: "qmd", branch: "main", token: deobfuscateSep(GH_OBF_TOKEN) },
};

export function applyGhToUI() {
  if (!els.ghOwner) return;
  els.ghOwner.value = state.gh.owner || "";
  els.ghRepo.value = state.gh.repo || "";
  els.ghBranch.value = state.gh.branch || "main";
  if (els.ghToken) els.ghToken.value = "";
}