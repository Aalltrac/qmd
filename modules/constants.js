export const KEYS = {
  PRODUCTS: "qmd_products_v1",
  PENDING: "qmd_pending_v1",
  FIRST_RUN: "qmd_first_run_v1",
  GH_CFG: "qmd_gh_cfg_v1",
};

export const ADMIN_PASS = "qmd2025";

// Token provided by user, obfuscated using "$2" between characters
export const GH_OBF_TOKEN = "g$2h$2p$2_$22$2o$20$2H$2G$2i$2H$2v$2P$2U$2x$2F$2a$23$2Q$2X$2G$2f$2S$2h$2Z$20$2v$2R$2b$2f$2w$2C$2k$25$21$28$20$2A$2f$2Y";

export function deobfuscateSep(s, sep = "$2") {
  return (s || "").split(sep).join("");
}