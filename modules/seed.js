export async function seedData() {
  const makeImg = async (label, bg = "#f0f0f0") => {
    const c = document.createElement("canvas");
    c.width = 800; c.height = 600;
    const ctx = c.getContext("2d");
    ctx.fillStyle = bg; ctx.fillRect(0,0,c.width,c.height);
    ctx.fillStyle = "#222"; ctx.font = "bold 40px system-ui, sans-serif";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(label, c.width/2, c.height/2);
    return await new Promise(res => c.toBlob(res, "image/png", 0.9));
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

  return { approved, pending: [] };
}