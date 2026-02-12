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

function generatePriceHistory(basePrice, days = 30) {
    const history = [];
    let currentPrice = basePrice * 1.1;
    
    for (let i = 0; i < days; i++) {
        const change = (Math.random() - 0.5) * 0.1;
        currentPrice = currentPrice * (1 + change);
        currentPrice = Math.max(basePrice * 0.9, Math.min(basePrice * 1.2, currentPrice));
        history.push(parseFloat(currentPrice.toFixed(2)));
    }
    
    history[history.length - 1] = basePrice;
    return history;
}

const COMPONENTS_DATA = {
    "Processeur": [
        {
            id: 1,
            name: "AMD Ryzen 7 7800X3D",
            merchants: ["LDLC", "TopAchat", "Materiel.net"],
            prices: [449.99, 459.99, 454.90],
            urls: [
                "https://www.ldlc.com/processeur-amd-ryzen-7-7800x3d",
                "https://www.topachat.com/amd-ryzen-7-7800x3d",
                "https://www.materiel.net/amd-ryzen-7-7800x3d"
            ],
            priceHistory: generatePriceHistory(449.99),
            specs: {
                "Cœurs": "8",
                "Threads": "16",
                "Fréquence": "4.2 GHz (5.0 GHz Boost)",
                "Socket": "AM5",
                "TDP": "120W"
            }
        },
        {
            id: 2,
            name: "Intel Core i7-14700K",
            merchants: ["LDLC", "TopAchat", "Amazon"],
            prices: [429.90, 439.99, 424.99],
            urls: [
                "https://www.ldlc.com/intel-core-i7-14700k",
                "https://www.topachat.com/intel-core-i7-14700k",
                "https://www.amazon.fr/intel-core-i7-14700k"
            ],
            priceHistory: generatePriceHistory(424.99),
            specs: {
                "Cœurs": "20 (8P+12E)",
                "Threads": "28",
                "Fréquence": "3.4 GHz (5.6 GHz Boost)",
                "Socket": "LGA1700",
                "TDP": "125W"
            }
        },
        {
            id: 3,
            name: "AMD Ryzen 5 7600X",
            merchants: ["Materiel.net", "LDLC", "Rue du Commerce"],
            prices: [229.90, 234.99, 239.90],
            urls: [
                "https://www.materiel.net/amd-ryzen-5-7600x",
                "https://www.ldlc.com/amd-ryzen-5-7600x",
                "https://www.rueducommerce.fr/amd-ryzen-5-7600x"
            ],
            priceHistory: generatePriceHistory(229.90),
            specs: {
                "Cœurs": "6",
                "Threads": "12",
                "Fréquence": "4.7 GHz (5.3 GHz Boost)",
                "Socket": "AM5",
                "TDP": "105W"
            }
        }
    ],
    "Refroidissement Processeur": [
        {
            id: 4,
            name: "Noctua NH-D15",
            merchants: ["TopAchat", "LDLC", "Amazon"],
            prices: [109.90, 114.99, 107.50],
            urls: [
                "https://www.topachat.com/noctua-nh-d15",
                "https://www.ldlc.com/noctua-nh-d15",
                "https://www.amazon.fr/noctua-nh-d15"
            ],
            priceHistory: generatePriceHistory(107.50),
            specs: {
                "Type": "Tour double",
                "Ventilateurs": "2x 140mm",
                "TDP Max": "220W",
                "Hauteur": "165mm",
                "Compatibilité": "AM5, LGA1700"
            }
        },
        {
            id: 5,
            name: "be quiet! Dark Rock Pro 4",
            merchants: ["Materiel.net", "LDLC", "TopAchat"],
            prices: [89.90, 94.99, 92.50],
            urls: [
                "https://www.materiel.net/be-quiet-dark-rock-pro-4",
                "https://www.ldlc.com/be-quiet-dark-rock-pro-4",
                "https://www.topachat.com/be-quiet-dark-rock-pro-4"
            ],
            priceHistory: generatePriceHistory(89.90),
            specs: {
                "Type": "Tour double",
                "Ventilateurs": "2x 120mm/135mm",
                "TDP Max": "250W",
                "Hauteur": "163mm",
                "Compatibilité": "AM5, LGA1700"
            }
        },
        {
            id: 6,
            name: "Arctic Liquid Freezer III 360",
            merchants: ["LDLC", "TopAchat", "Materiel.net"],
            prices: [139.90, 144.99, 142.50],
            urls: [
                "https://www.ldlc.com/arctic-liquid-freezer-iii-360",
                "https://www.topachat.com/arctic-liquid-freezer-iii-360",
                "https://www.materiel.net/arctic-liquid-freezer-iii-360"
            ],
            priceHistory: generatePriceHistory(139.90),
            specs: {
                "Type": "Watercooling AIO",
                "Radiateur": "360mm",
                "Ventilateurs": "3x 120mm",
                "TDP Max": "420W",
                "Compatibilité": "AM5, LGA1700"
            }
        }
    ],
    "Carte Mère": [
        {
            id: 7,
            name: "MSI MAG B650 TOMAHAWK WIFI",
            merchants: ["TopAchat", "Materiel.net", "LDLC"],
            prices: [229.90, 234.99, 239.90],
            urls: [
                "https://www.topachat.com/msi-mag-b650-tomahawk-wifi",
                "https://www.materiel.net/msi-mag-b650-tomahawk-wifi",
                "https://www.ldlc.com/msi-mag-b650-tomahawk-wifi"
            ],
            priceHistory: generatePriceHistory(229.90),
            specs: {
                "Socket": "AM5",
                "Chipset": "B650",
                "Format": "ATX",
                "RAM": "DDR5 jusqu'à 128GB",
                "Connectivité": "WiFi 6E, 2.5G LAN"
            }
        },
        {
            id: 8,
            name: "ASUS ROG STRIX Z790-E GAMING WIFI",
            merchants: ["LDLC", "Amazon", "TopAchat"],
            prices: [449.90, 439.99, 459.90],
            urls: [
                "https://www.ldlc.com/asus-rog-strix-z790-e-gaming-wifi",
                "https://www.amazon.fr/asus-rog-strix-z790-e-gaming-wifi",
                "https://www.topachat.com/asus-rog-strix-z790-e-gaming-wifi"
            ],
            priceHistory: generatePriceHistory(439.99),
            specs: {
                "Socket": "LGA1700",
                "Chipset": "Z790",
                "Format": "ATX",
                "RAM": "DDR5 jusqu'à 192GB",
                "Connectivité": "WiFi 6E, 2.5G LAN, Thunderbolt 4"
            }
        }
    ],
    "RAM": [
        {
            id: 9,
            name: "Corsair Vengeance DDR5 32GB (2x16GB) 6000MHz",
            merchants: ["Materiel.net", "LDLC", "Amazon"],
            prices: [119.90, 124.99, 117.50],
            urls: [
                "https://www.materiel.net/corsair-vengeance-ddr5-32gb",
                "https://www.ldlc.com/corsair-vengeance-ddr5-32gb",
                "https://www.amazon.fr/corsair-vengeance-ddr5-32gb"
            ],
            priceHistory: generatePriceHistory(117.50),
            specs: {
                "Capacité": "32GB (2x16GB)",
                "Type": "DDR5",
                "Fréquence": "6000MHz",
                "Latence": "CL30",
                "RGB": "Non"
            }
        },
        {
            id: 10,
            name: "G.Skill Trident Z5 RGB 32GB (2x16GB) 6400MHz",
            merchants: ["TopAchat", "LDLC", "Materiel.net"],
            prices: [149.90, 154.99, 152.50],
            urls: [
                "https://www.topachat.com/gskill-trident-z5-rgb-32gb",
                "https://www.ldlc.com/gskill-trident-z5-rgb-32gb",
                "https://www.materiel.net/gskill-trident-z5-rgb-32gb"
            ],
            priceHistory: generatePriceHistory(149.90),
            specs: {
                "Capacité": "32GB (2x16GB)",
                "Type": "DDR5",
                "Fréquence": "6400MHz",
                "Latence": "CL32",
                "RGB": "Oui"
            }
        }
    ],
    "Stockage": [
        {
            id: 11,
            name: "Samsung 990 PRO 2TB NVMe",
            merchants: ["LDLC", "Amazon", "Materiel.net"],
            prices: [179.90, 174.99, 182.50],
            urls: [
                "https://www.ldlc.com/samsung-990-pro-2tb",
                "https://www.amazon.fr/samsung-990-pro-2tb",
                "https://www.materiel.net/samsung-990-pro-2tb"
            ],
            priceHistory: generatePriceHistory(174.99),
            specs: {
                "Capacité": "2TB",
                "Interface": "PCIe 4.0 x4 NVMe",
                "Lecture": "7450 MB/s",
                "Écriture": "6900 MB/s",
                "Durabilité": "1200 TBW"
            }
        },
        {
            id: 12,
            name: "WD Black SN850X 1TB NVMe",
            merchants: ["TopAchat", "Materiel.net", "LDLC"],
            prices: [89.90, 94.99, 92.50],
            urls: [
                "https://www.topachat.com/wd-black-sn850x-1tb",
                "https://www.materiel.net/wd-black-sn850x-1tb",
                "https://www.ldlc.com/wd-black-sn850x-1tb"
            ],
            priceHistory: generatePriceHistory(89.90),
            specs: {
                "Capacité": "1TB",
                "Interface": "PCIe 4.0 x4 NVMe",
                "Lecture": "7300 MB/s",
                "Écriture": "6300 MB/s",
                "Durabilité": "600 TBW"
            }
        }
    ],
    "Carte Graphique": [
        {
            id: 13,
            name: "NVIDIA RTX 4070 Ti SUPER 16GB",
            merchants: ["LDLC", "TopAchat", "Materiel.net"],
            prices: [899.90, 919.99, 909.50],
            urls: [
                "https://www.ldlc.com/nvidia-rtx-4070-ti-super",
                "https://www.topachat.com/nvidia-rtx-4070-ti-super",
                "https://www.materiel.net/nvidia-rtx-4070-ti-super"
            ],
            priceHistory: generatePriceHistory(899.90),
            specs: {
                "GPU": "NVIDIA Ada Lovelace",
                "VRAM": "16GB GDDR6X",
                "Cœurs CUDA": "8448",
                "TDP": "285W",
                "Sorties": "3x DP 1.4a, 1x HDMI 2.1"
            }
        },
        {
            id: 14,
            name: "AMD Radeon RX 7900 XTX 24GB",
            merchants: ["Materiel.net", "LDLC", "Amazon"],
            prices: [1049.90, 1069.99, 1039.00],
            urls: [
                "https://www.materiel.net/amd-radeon-rx-7900-xtx",
                "https://www.ldlc.com/amd-radeon-rx-7900-xtx",
                "https://www.amazon.fr/amd-radeon-rx-7900-xtx"
            ],
            priceHistory: generatePriceHistory(1039.00),
            specs: {
                "GPU": "AMD RDNA 3",
                "VRAM": "24GB GDDR6",
                "Cœurs Stream": "6144",
                "TDP": "355W",
                "Sorties": "2x DP 2.1, 2x HDMI 2.1"
            }
        },
        {
            id: 15,
            name: "NVIDIA RTX 4060 Ti 8GB",
            merchants: ["TopAchat", "LDLC", "Rue du Commerce"],
            prices: [449.90, 459.99, 454.50],
            urls: [
                "https://www.topachat.com/nvidia-rtx-4060-ti",
                "https://www.ldlc.com/nvidia-rtx-4060-ti",
                "https://www.rueducommerce.fr/nvidia-rtx-4060-ti"
            ],
            priceHistory: generatePriceHistory(449.90),
            specs: {
                "GPU": "NVIDIA Ada Lovelace",
                "VRAM": "8GB GDDR6",
                "Cœurs CUDA": "4352",
                "TDP": "160W",
                "Sorties": "3x DP 1.4a, 1x HDMI 2.1"
            }
        }
    ],
    "Boîtier": [
        {
            id: 16,
            name: "Lian Li O11 Dynamic EVO",
            merchants: ["LDLC", "TopAchat", "Materiel.net"],
            prices: [169.90, 174.99, 172.50],
            urls: [
                "https://www.ldlc.com/lian-li-o11-dynamic-evo",
                "https://www.topachat.com/lian-li-o11-dynamic-evo",
                "https://www.materiel.net/lian-li-o11-dynamic-evo"
            ],
            priceHistory: generatePriceHistory(169.90),
            specs: {
                "Format": "Mid Tower ATX",
                "Panneaux": "Verre trempé",
                "Emplacements": "7x 120mm ventilateurs",
                "GPU Max": "420mm",
                "Radiateur": "360mm support"
            }
        },
        {
            id: 17,
            name: "Fractal Design Torrent",
            merchants: ["Materiel.net", "LDLC", "Amazon"],
            prices: [219.90, 224.99, 217.50],
            urls: [
                "https://www.materiel.net/fractal-design-torrent",
                "https://www.ldlc.com/fractal-design-torrent",
                "https://www.amazon.fr/fractal-design-torrent"
            ],
            priceHistory: generatePriceHistory(217.50),
            specs: {
                "Format": "Mid Tower ATX",
                "Panneaux": "Verre trempé + mesh",
                "Emplacements": "6x 180mm/140mm ventilateurs",
                "GPU Max": "461mm",
                "Radiateur": "420mm support"
            }
        }
    ],
    "Alimentation": [
        {
            id: 18,
            name: "Corsair RM850e 850W 80+ Gold",
            merchants: ["LDLC", "TopAchat", "Materiel.net"],
            prices: [129.90, 134.99, 132.50],
            urls: [
                "https://www.ldlc.com/corsair-rm850e-850w",
                "https://www.topachat.com/corsair-rm850e-850w",
                "https://www.materiel.net/corsair-rm850e-850w"
            ],
            priceHistory: generatePriceHistory(129.90),
            specs: {
                "Puissance": "850W",
                "Certification": "80+ Gold",
                "Modularité": "Full modulaire",
                "Format": "ATX",
                "Garantie": "10 ans"
            }
        },
        {
            id: 19,
            name: "be quiet! Straight Power 11 750W Platinum",
            merchants: ["Materiel.net", "LDLC", "Amazon"],
            prices: [149.90, 154.99, 147.50],
            urls: [
                "https://www.materiel.net/be-quiet-straight-power-11-750w",
                "https://www.ldlc.com/be-quiet-straight-power-11-750w",
                "https://www.amazon.fr/be-quiet-straight-power-11-750w"
            ],
            priceHistory: generatePriceHistory(147.50),
            specs: {
                "Puissance": "750W",
                "Certification": "80+ Platinum",
                "Modularité": "Full modulaire",
                "Format": "ATX",
                "Garantie": "10 ans"
            }
        }
    ],
    "Ventilateurs": [
        {
            id: 20,
            name: "Noctua NF-A12x25 PWM (Pack de 2)",
            merchants: ["TopAchat", "LDLC", "Amazon"],
            prices: [39.90, 42.99, 38.50],
            urls: [
                "https://www.topachat.com/noctua-nf-a12x25-pwm",
                "https://www.ldlc.com/noctua-nf-a12x25-pwm",
                "https://www.amazon.fr/noctua-nf-a12x25-pwm"
            ],
            priceHistory: generatePriceHistory(38.50),
            specs: {
                "Taille": "120mm",
                "Vitesse": "450-2000 RPM",
                "Débit": "102.1 CFM",
                "Niveau sonore": "22.6 dB(A)",
                "RGB": "Non"
            }
        },
        {
            id: 21,
            name: "Arctic P12 PWM PST RGB (Pack de 3)",
            merchants: ["Materiel.net", "LDLC", "TopAchat"],
            prices: [29.90, 32.99, 31.50],
            urls: [
                "https://www.materiel.net/arctic-p12-pwm-pst-rgb",
                "https://www.ldlc.com/arctic-p12-pwm-pst-rgb",
                "https://www.topachat.com/arctic-p12-pwm-pst-rgb"
            ],
            priceHistory: generatePriceHistory(29.90),
            specs: {
                "Taille": "120mm",
                "Vitesse": "200-1800 RPM",
                "Débit": "56.3 CFM",
                "Niveau sonore": "22.5 dB(A)",
                "RGB": "Oui"
            }
        }
    ],
    "Ecran": [
        {
            id: 22,
            name: "LG 27GP850-B 27\" 1440p 165Hz",
            merchants: ["LDLC", "Amazon", "Materiel.net"],
            prices: [349.90, 339.99, 354.50],
            urls: [
                "https://www.ldlc.com/lg-27gp850-b",
                "https://www.amazon.fr/lg-27gp850-b",
                "https://www.materiel.net/lg-27gp850-b"
            ],
            priceHistory: generatePriceHistory(339.99),
            specs: {
                "Taille": "27 pouces",
                "Résolution": "2560x1440 (QHD)",
                "Taux de rafraîchissement": "165Hz",
                "Dalle": "IPS",
                "Temps de réponse": "1ms (GtG)"
            }
        },
        {
            id: 23,
            name: "Samsung Odyssey G7 32\" 1440p 240Hz",
            merchants: ["TopAchat", "LDLC", "Materiel.net"],
            prices: [599.90, 619.99, 609.50],
            urls: [
                "https://www.topachat.com/samsung-odyssey-g7-32",
                "https://www.ldlc.com/samsung-odyssey-g7-32",
                "https://www.materiel.net/samsung-odyssey-g7-32"
            ],
            priceHistory: generatePriceHistory(599.90),
            specs: {
                "Taille": "32 pouces",
                "Résolution": "2560x1440 (QHD)",
                "Taux de rafraîchissement": "240Hz",
                "Dalle": "VA incurvée",
                "Temps de réponse": "1ms (GtG)"
            }
        }
    ],
    "Clavier": [
        {
            id: 24,
            name: "Keychron Q1 Pro QMK/VIA",
            merchants: ["Amazon", "LDLC", "TopAchat"],
            prices: [189.90, 194.99, 192.50],
            urls: [
                "https://www.amazon.fr/keychron-q1-pro",
                "https://www.ldlc.com/keychron-q1-pro",
                "https://www.topachat.com/keychron-q1-pro"
            ],
            priceHistory: generatePriceHistory(189.90),
            specs: {
                "Type": "Mécanique 75%",
                "Switches": "Gateron Pro",
                "Connectivité": "Sans fil + USB-C",
                "Rétroéclairage": "RGB",
                "Programmable": "QMK/VIA"
            }
        },
        {
            id: 25,
            name: "Logitech G Pro X TKL",
            merchants: ["Materiel.net", "LDLC", "Amazon"],
            prices: [149.90, 154.99, 147.50],
            urls: [
                "https://www.materiel.net/logitech-g-pro-x-tkl",
                "https://www.ldlc.com/logitech-g-pro-x-tkl",
                "https://www.amazon.fr/logitech-g-pro-x-tkl"
            ],
            priceHistory: generatePriceHistory(147.50),
            specs: {
                "Type": "Mécanique TKL",
                "Switches": "GX Blue/Brown/Red",
                "Connectivité": "USB-C détachable",
                "Rétroéclairage": "RGB LIGHTSYNC",
                "Programmable": "G HUB"
            }
        }
    ],
    "Souris": [
        {
            id: 26,
            name: "Logitech G Pro X Superlight 2",
            merchants: ["LDLC", "Amazon", "TopAchat"],
            prices: [159.90, 154.99, 164.50],
            urls: [
                "https://www.ldlc.com/logitech-g-pro-x-superlight-2",
                "https://www.amazon.fr/logitech-g-pro-x-superlight-2",
                "https://www.topachat.com/logitech-g-pro-x-superlight-2"
            ],
            priceHistory: generatePriceHistory(154.99),
            specs: {
                "Type": "Gaming sans fil",
                "Capteur": "HERO 2",
                "DPI": "32000",
                "Poids": "60g",
                "Autonomie": "95 heures"
            }
        },
        {
            id: 27,
            name: "Razer Viper V3 Pro",
            merchants: ["TopAchat", "Materiel.net", "LDLC"],
            prices: [169.90, 174.99, 172.50],
            urls: [
                "https://www.topachat.com/razer-viper-v3-pro",
                "https://www.materiel.net/razer-viper-v3-pro",
                "https://www.ldlc.com/razer-viper-v3-pro"
            ],
            priceHistory: generatePriceHistory(169.90),
            specs: {
                "Type": "Gaming sans fil",
                "Capteur": "Focus Pro 30K",
                "DPI": "30000",
                "Poids": "54g",
                "Autonomie": "95 heures"
            }
        }
    ],
    "Casque": [
        {
            id: 28,
            name: "SteelSeries Arctis Nova Pro Wireless",
            merchants: ["LDLC", "Amazon", "Materiel.net"],
            prices: [349.90, 339.99, 354.50],
            urls: [
                "https://www.ldlc.com/steelseries-arctis-nova-pro-wireless",
                "https://www.amazon.fr/steelseries-arctis-nova-pro-wireless",
                "https://www.materiel.net/steelseries-arctis-nova-pro-wireless"
            ],
            priceHistory: generatePriceHistory(339.99),
            specs: {
                "Type": "Gaming sans fil",
                "Connexion": "2.4GHz + Bluetooth",
                "Audio": "Hi-Res certifié",
                "Autonomie": "2x 22h (batteries)",
                "ANC": "Oui"
            }
        },
        {
            id: 29,
            name: "HyperX Cloud III Wireless",
            merchants: ["TopAchat", "LDLC", "Materiel.net"],
            prices: [149.90, 154.99, 152.50],
            urls: [
                "https://www.topachat.com/hyperx-cloud-iii-wireless",
                "https://www.ldlc.com/hyperx-cloud-iii-wireless",
                "https://www.materiel.net/hyperx-cloud-iii-wireless"
            ],
            priceHistory: generatePriceHistory(149.90),
            specs: {
                "Type": "Gaming sans fil",
                "Connexion": "2.4GHz",
                "Audio": "DTS Headphone:X Spatial",
                "Autonomie": "120 heures",
                "ANC": "Non"
            }
        }
    ]
};

let appState = {
    components: COMPONENTS_DATA,
    selectedComponents: {},
    selectedMerchants: {}
};

function initializeUI() {
    const componentsList = document.getElementById('componentsList');
    componentsList.innerHTML = '';
    
    CATEGORIES.forEach((category, index) => {
        const card = createComponentCard(category);
        card.style.animationDelay = `${index * 0.05}s`;
        componentsList.appendChild(card);
    });
    
    updateTotalPrice();
    checkIfConfigReady();
    loadConfigFromURL();
}

function createComponentCard(category) {
    const card = document.createElement('div');
    card.className = 'component-card';
    card.dataset.category = category;
    
    const selectedComponent = appState.selectedComponents[category];
    
    if (selectedComponent) {
        card.innerHTML = `
            <div class="component-header">
                <div class="component-category">${category}</div>
                <button class="select-btn" onclick="openComponentModal('${category}')">Changer</button>
            </div>
            <div class="component-selected">
                <div class="component-details">
                    <div class="component-name">${selectedComponent.name}</div>
                    <div class="component-specs">
                        ${Object.entries(selectedComponent.specs).map(([key, value]) => `
                            <div class="spec-item">
                                <span class="spec-label">${key}:</span>
                                <span class="spec-value">${value}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="component-price-section">
                    <div class="component-price">${formatPrice(getSelectedPrice(category))} €</div>
                    <div class="merchant-info">${getSelectedMerchant(category)}</div>
                    <button class="change-merchant-btn" onclick="openMerchantModal('${category}')">
                        Choisir marchand
                    </button>
                </div>
            </div>
            <div class="price-chart">
                <div class="chart-title">Évolution des prix (30 jours)</div>
                <div class="chart-container">
                    ${createPriceChart(selectedComponent.priceHistory)}
                </div>
            </div>
        `;
    } else {
        card.innerHTML = `
            <div class="component-header">
                <div class="component-category">${category}</div>
                <button class="select-btn" onclick="openComponentModal('${category}')">Sélectionner</button>
            </div>
            <div class="component-info">Aucun composant sélectionné</div>
        `;
    }
    
    return card;
}

function createPriceChart(priceHistory) {
    const width = 600;
    const height = 80;
    const padding = 10;
    
    const minPrice = Math.min(...priceHistory);
    const maxPrice = Math.max(...priceHistory);
    const priceRange = maxPrice - minPrice;
    
    const points = priceHistory.map((price, index) => {
        const x = padding + (index / (priceHistory.length - 1)) * (width - 2 * padding);
        const y = height - padding - ((price - minPrice) / priceRange) * (height - 2 * padding);
        return `${x},${y}`;
    }).join(' ');
    
    const areaPoints = `${padding},${height - padding} ${points} ${width - padding},${height - padding}`;
    
    return `
        <svg class="chart-svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
            <defs>
                <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:#00d9ff;stop-opacity:0.5" />
                    <stop offset="100%" style="stop-color:#00d9ff;stop-opacity:0" />
                </linearGradient>
            </defs>
            <polygon class="chart-area" points="${areaPoints}" />
            <polyline class="chart-line" points="${points}" />
        </svg>
    `;
}

function openComponentModal(category) {
    const modal = document.getElementById('componentModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const searchInput = document.getElementById('componentSearch');
    
    modalTitle.textContent = `Sélectionner ${category}`;
    
    const components = appState.components[category] || [];
    
    function displayComponents(filter = '') {
        const filteredComponents = components.filter(component => 
            component.name.toLowerCase().includes(filter.toLowerCase()) ||
            Object.values(component.specs).some(spec => 
                spec.toString().toLowerCase().includes(filter.toLowerCase())
            )
        );
        
        if (filteredComponents.length === 0) {
            modalBody.innerHTML = `
                <div class="no-results">
                    <div class="no-results-icon">🔍</div>
                    <div class="no-results-text">Aucun composant trouvé</div>
                    <div class="no-results-hint">Essayez avec d'autres mots-clés</div>
                </div>
            `;
            return;
        }
        
        modalBody.innerHTML = filteredComponents.map(component => {
            const minPrice = Math.min(...component.prices);
            return `
                <div class="component-option" onclick="selectComponent('${category}', ${component.id})">
                    <div class="option-header">
                        <div class="option-name">${component.name}</div>
                        <div class="option-price">${formatPrice(minPrice)} €</div>
                    </div>
                    <div class="option-specs">
                        ${Object.entries(component.specs).map(([key, value]) => `
                            <div class="spec-item">
                                <span class="spec-label">${key}:</span>
                                <span class="spec-value">${value}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }).join('');
    }
    
    displayComponents();
    
    searchInput.value = '';
    
    searchInput.oninput = (e) => displayComponents(e.target.value);
    
    setTimeout(() => searchInput.focus(), 100);
    
    modal.classList.add('active');
}

function openMerchantModal(category) {
    const modal = document.getElementById('merchantModal');
    const modalTitle = document.getElementById('merchantModalTitle');
    const modalBody = document.getElementById('merchantModalBody');
    
    const component = appState.selectedComponents[category];
    if (!component) return;
    
    modalTitle.textContent = `Choisir un marchand pour ${component.name}`;
    
    modalBody.innerHTML = component.merchants.map((merchant, index) => `
        <div class="merchant-option" onclick="selectMerchant('${category}', ${index})">
            <div class="merchant-name">${merchant}</div>
            <div class="merchant-price">${formatPrice(component.prices[index])} €</div>
        </div>
    `).join('');
    
    modal.classList.add('active');
}

function selectComponent(category, componentId) {
    const components = appState.components[category];
    const component = components.find(c => c.id === componentId);
    
    if (component) {
        appState.selectedComponents[category] = component;
        const minPriceIndex = component.prices.indexOf(Math.min(...component.prices));
        appState.selectedMerchants[category] = minPriceIndex;
        
        const card = document.querySelector(`[data-category="${category}"]`);
        const newCard = createComponentCard(category);
        card.replaceWith(newCard);
        
        updateTotalPrice();
        checkIfConfigReady();
    }
    
    closeModal('componentModal');
}

function selectMerchant(category, merchantIndex) {
    appState.selectedMerchants[category] = merchantIndex;
    
    const card = document.querySelector(`[data-category="${category}"]`);
    const newCard = createComponentCard(category);
    card.replaceWith(newCard);
    
    updateTotalPrice();
    
    closeModal('merchantModal');
}

function getSelectedPrice(category) {
    const component = appState.selectedComponents[category];
    if (!component) return 0;
    
    const merchantIndex = appState.selectedMerchants[category] ?? 
        component.prices.indexOf(Math.min(...component.prices));
    
    return component.prices[merchantIndex];
}

function getSelectedMerchant(category) {
    const component = appState.selectedComponents[category];
    if (!component) return '';
    
    const merchantIndex = appState.selectedMerchants[category] ?? 
        component.prices.indexOf(Math.min(...component.prices));
    
    return component.merchants[merchantIndex];
}

function updateTotalPrice() {
    let total = 0;
    let count = 0;
    
    for (const category of CATEGORIES) {
        if (appState.selectedComponents[category]) {
            total += getSelectedPrice(category);
            count++;
        }
    }
    
    document.getElementById('totalPrice').textContent = formatPrice(total) + ' €';
    document.getElementById('priceDetail').textContent = `${count} composant(s) sélectionné(s)`;
}

function checkIfConfigReady() {
    const hasSelection = Object.keys(appState.selectedComponents).length > 0;
    
    document.getElementById('shareBtn').disabled = !hasSelection;
    document.getElementById('shareBtnSide').disabled = !hasSelection;
    document.getElementById('buyBtn').disabled = !hasSelection;
    document.getElementById('buyBtnSide').disabled = !hasSelection;
}

function formatPrice(price) {
    return price.toFixed(2).replace('.', ',');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('active');
}

function buyConfig() {
    const urls = [];
    
    for (const [category, component] of Object.entries(appState.selectedComponents)) {
        const merchantIndex = appState.selectedMerchants[category] ?? 
            component.prices.indexOf(Math.min(...component.prices));
        urls.push(component.urls[merchantIndex]);
    }
    
    if (urls.length === 0) {
        alert('Veuillez sélectionner au moins un composant.');
        return;
    }
    
    showBuyModal(urls);
}

function showBuyModal(urls) {
    const existingModal = document.getElementById('buyLinksModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    const modal = document.createElement('div');
    modal.id = 'buyLinksModal';
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2 class="modal-title">Liens d'achat</h2>
                <button class="modal-close" onclick="document.getElementById('buyLinksModal').remove()">&times;</button>
            </div>
            <div class="modal-body">
                <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">
                    Cliquez sur chaque lien pour ouvrir la page du marchand dans un nouvel onglet :
                </p>
                <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                    ${urls.map((url, index) => {
                        const category = Object.keys(appState.selectedComponents)[index];
                        const component = appState.selectedComponents[category];
                        return `
                            <a href="${url}" target="_blank" class="buy-link">
                                <span class="buy-link-icon">🛒</span>
                                <span class="buy-link-text">
                                    <strong>${component.name}</strong><br>
                                    <small style="color: var(--text-muted);">${getSelectedMerchant(category)}</small>
                                </span>
                                <span class="buy-link-price">${formatPrice(getSelectedPrice(category))} €</span>
                                <span class="buy-link-arrow">→</span>
                            </a>
                        `;
                    }).join('')}
                </div>
                <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid rgba(157, 78, 221, 0.2);">
                    <button onclick="openAllBuyLinks()" class="action-btn primary" style="width: 100%;">
                        <span>Ouvrir tous les liens (${urls.length})</span>
                        <span class="arrow">→</span>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    window.currentBuyUrls = urls;
}

function openAllBuyLinks() {
    if (!window.currentBuyUrls) return;
    
    window.currentBuyUrls.forEach((url, index) => {
        setTimeout(() => {
            window.open(url, '_blank');
        }, index * 200);
    });
    
    document.getElementById('buyLinksModal').remove();
}

function shareConfig() {
    const configData = {
        selected: {},
        merchants: appState.selectedMerchants
    };
    
    for (const [category, component] of Object.entries(appState.selectedComponents)) {
        configData.selected[category] = component.id;
    }
    
    const configString = btoa(JSON.stringify(configData));
    const shareUrl = `${window.location.origin}${window.location.pathname}?config=${configString}`;
    
    document.getElementById('shareLinkInput').value = shareUrl;
    document.getElementById('shareModal').classList.add('active');
}

function copyShareLink() {
    const input = document.getElementById('shareLinkInput');
    input.select();
    input.setSelectionRange(0, 99999);
    
    try {
        document.execCommand('copy');
        showCopySuccess();
    } catch (err) {
        navigator.clipboard.writeText(input.value).then(() => {
            showCopySuccess();
        }).catch(err => {
            alert('Impossible de copier le lien. Veuillez le copier manuellement.');
        });
    }
}

function showCopySuccess() {
    const successMsg = document.getElementById('shareSuccess');
    successMsg.style.display = 'block';
    
    setTimeout(() => {
        successMsg.style.display = 'none';
    }, 2000);
}

function loadConfigFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const configParam = urlParams.get('config');
    
    if (configParam) {
        try {
            const configData = JSON.parse(atob(configParam));
            
            for (const [category, componentId] of Object.entries(configData.selected)) {
                const components = appState.components[category];
                const component = components?.find(c => c.id === componentId);
                
                if (component) {
                    appState.selectedComponents[category] = component;
                }
            }
            
            appState.selectedMerchants = configData.merchants || {};
            
            const componentsList = document.getElementById('componentsList');
            componentsList.innerHTML = '';
            
            CATEGORIES.forEach((category, index) => {
                const card = createComponentCard(category);
                card.style.animationDelay = `${index * 0.05}s`;
                componentsList.appendChild(card);
            });
            
            updateTotalPrice();
            checkIfConfigReady();
        } catch (error) {
            console.error('Erreur lors du chargement de la configuration:', error);
        }
    }
}

function resetConfig() {
    if (confirm('Êtes-vous sûr de vouloir réinitialiser votre configuration ?')) {
        appState.selectedComponents = {};
        appState.selectedMerchants = {};
        
        const url = new URL(window.location);
        url.searchParams.delete('config');
        window.history.pushState({}, '', url);
        
        initializeUI();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initializeUI();
    
    document.getElementById('newConfigBtn').addEventListener('click', resetConfig);
    document.getElementById('shareBtn').addEventListener('click', shareConfig);
    document.getElementById('contactBtn').addEventListener('click', () => {
        document.getElementById('contactModal').classList.add('active');
    });
    document.getElementById('buyBtn').addEventListener('click', buyConfig);
    
    document.getElementById('buyBtnSide').addEventListener('click', buyConfig);
    document.getElementById('shareBtnSide').addEventListener('click', shareConfig);
    document.getElementById('resetBtn').addEventListener('click', resetConfig);
    
    document.getElementById('modalClose').addEventListener('click', () => closeModal('componentModal'));
    document.getElementById('shareModalClose').addEventListener('click', () => closeModal('shareModal'));
    document.getElementById('contactModalClose').addEventListener('click', () => closeModal('contactModal'));
    document.getElementById('merchantModalClose').addEventListener('click', () => closeModal('merchantModal'));
    
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
    
    document.getElementById('copyLinkBtn').addEventListener('click', copyShareLink);
});