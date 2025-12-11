// =========================================================
// CONFIGURATION (FRONTEND)
// =========================================================

const API_BASE_URL = "https://g-n-rateur-backend-1.onrender.com";
// =========================================================
// 🆕 LISTE DES STYLES DE TITRE (NOUVEAU BLOC)
// =========================================================

const STYLE_TITRE_OPTIONS = [
    { label: "Texte sanglant dégoulinant", value: "dripping horror lettering, torn edges, glossy red liquid texture, glowing sinister vibe" },
    { label: "Néon cyberpunk", value: "bright neon tube letters, electric glow, slight chromatic aberration, futuristic vaporwave look" },
    { label: "Typographie givrée / glace", value: "frosted glass letters, icy texture, translucent frozen edges, cold blue inner glow" },
    { label: "Lettrage en bois sculpté", value: "hand-carved wooden lettering, deep grooves, warm grain texture, rustic fantasy aesthetic" },
    { label: "Texte métallique gravé", value: "polished engraved steel letters, sharp reflections, industrial sci-fi shine" },
    { label: "Style cartoon / bulle", value: "rounded bubbly cartoon letters, colorful shading, outlined comic look" },
    { label: "Effet slasher sanglant", value: "sharp jagged letters, blood splatter texture, rough grain, violent horror tone" },
    { label: "Lettrage en cristal / gemme", value: "faceted gemstone letters, prism reflections, diamond-like clarity, luminous highlights" },
    { label: "Runes de pierre anciennes", value: "weathered carved stone letters, cracks, moss details, archaeological fantasy mood" },
    { label: "Texte en flammes", value: "burning fire lettering, glowing embers, smoke trails, intense heat distortion" },
    { label: "Texte liquide / eau", value: "transparent water-textured letters, droplets, soft reflections, fluid organic movement" },
    { label: "Titre doré royal", value: "polished gold lettering, embossed texture, warm specular highlights, luxury vibe" },
    { label: "Graffiti urbain", value: "spray-painted lettering, rough outlines, dripping paint, street-art" },
    { label: "Hologramme futuriste", value: "holographic translucent letters, digital flicker, refraction effects, sci-fi projection" },
    { label: "Gothique médiéval", value: "blackletter-inspired carved metal, dark engraved texture, dramatic gothic atmosphere" },
    { label: "Style pâte à modeler (stop motion)", value: "hand-molded clay letters, fingerprint texture, soft studio lighting, claymation charm" },
    { label: "Découpe papier / collage", value: "layered paper-cut letters, soft shadows, handcrafted collage feel" },
    { label: "Cosmique / nébuleuse", value: "letters filled with nebula textures, stars, glowing cosmic colors, ethereal space vibe" },
    { label: "Steampunk en laiton", value: "aged brass letters, rivets, gears, Victorian industrial detailing" },
    { label: "Texte glitch numérique", value: "distorted corrupted letters, RGB glitch separation, pixel noise, digital malfunction look" }
];

// =========================================================
// 🆕 INJECTION AUTOMATIQUE DANS LE SELECT
// =========================================================

document.addEventListener("DOMContentLoaded", () => {
    const styleSelect = document.getElementById("aff_style_titre");
    if (styleSelect) {
        // Nettoyage avant l'injection, au cas où il y aurait déjà des options
        // Cette boucle est correcte pour les options suggérées
        STYLE_TITRE_OPTIONS.forEach(opt => {
            const o = document.createElement("option");
            o.value = opt.value;
            o.textContent = opt.label;
            styleSelect.appendChild(o);
        });
    }
});


// =========================================================
// CONFIGURATION DU POLLING HTTP
// =========================================================
const POLLING_INTERVAL_MS = 900;
let pollingProgressInterval = null;
let fakeProgress = 0;
let pollingFailureCount = 0; // Compteur de tentatives ratées (Pour la robustesse)
const MAX_POLLING_FAILURES = 5; // Limite d'erreurs avant l'arrêt

// =========================================================
// VARIABLES GLOBALES
// =========================================================
let currentPromptId = null;
let lastGenerationStartTime = null;

// =========================================================
// OUTILS D’AFFICHAGE (LOGS, ERREURS, PROGRESSION VISUELLE)
// =========================================================

function log(...args) {
    console.log(...args);
    const box = document.getElementById("log-box");
    if (!box) return;
    const line = document.createElement("div");
    line.className = "log-line";
    const ts = new Date().toLocaleTimeString("fr-FR", { hour12: false });
    line.innerHTML = `<strong>[${ts}]</strong> ${args.join(" ")}`;
    box.appendChild(line);
    box.scrollTop = box.scrollHeight;
}

function setError(msg) {
    const errBox = document.getElementById("error-box");
    const statusPill = document.getElementById("job-status-pill");
    
    if (!errBox) return;

    if (msg) {
        errBox.style.display = "block";
        errBox.textContent = msg;
        if (statusPill) {
             statusPill.textContent = "FAILED";
             statusPill.classList.remove("pill", "pill-green");
             statusPill.classList.add("pill-danger"); 
        }

    } else {
        errBox.style.display = "none";
        errBox.textContent = "";
        if (statusPill && statusPill.textContent === "FAILED") {
            statusPill.textContent = "READY";
            statusPill.classList.remove("pill-danger");
            statusPill.classList.add("pill-green");
        }
    }
}

function showProgressOverlay(show, label = "En attente…") {
    const overlay = document.getElementById("progress-overlay");
    const labelSpan = document.getElementById("progress-label");
    const percentSpan = document.getElementById("progress-percent");
    const innerBar = document.getElementById("progress-inner");

    if (!overlay || !labelSpan || !percentSpan || !innerBar) return;

    if (show) {
        overlay.classList.add("visible");
        labelSpan.textContent = label;
        percentSpan.textContent = "0%";
        innerBar.style.width = "0%";
        fakeProgress = 0;
    } else {
        overlay.classList.remove("visible");
    }
}

// =========================================================
// GPU STATUS (SIMPLIFIÉ)
// =========================================================

async function refreshGPU() {
    const card = document.getElementById("gpu-card");
    const nameEl = document.getElementById("gpu-name");
    const utilEl = document.getElementById("gpu-util");
    const memEl = document.getElementById("gpu-mem");
    const tempEl = document.getElementById("gpu-temp");

    if (!card || !nameEl || !utilEl || !memEl || !tempEl) return;

    try {
        const resp = await fetch(`${API_BASE_URL}/gpu_status`);
        if (!resp.ok) throw new Error("GPU status fetch failed");
        const data = await resp.json();
        nameEl.textContent = data.name || "NVIDIA GPU";
        utilEl.textContent = (data.load ?? 0) + "%";
        memEl.textContent = `${data.memory_used ?? 0} / ${data.memory_total ?? 0} Go`;
        tempEl.textContent = (data.temperature ?? 0) + "°C";

        card.classList.remove("gpu-status-error");
    } catch (e) {
        card.classList.add("gpu-status-error");
        nameEl.textContent = "GPU indisponible";
        utilEl.textContent = "–%";
        memEl.textContent = "– / – Go";
        tempEl.textContent = "– °C";
        console.warn("Erreur GPU status:", e);
    }
}

// =========================================================
// GESTION WORKFLOWS & CHECKPOINTS
// =========================================================

async function loadWorkflows() {
    const container = document.getElementById("workflow-groups-container");
    const hiddenInput = document.getElementById("workflow-select");

    if (!container) return;

    try {
        const resp = await fetch(`${API_BASE_URL}/workflows`);
        if (!resp.ok) throw new Error("Erreur chargement workflows");
        const data = await resp.json();

        const workflows = data.workflows || [];
        log("Workflows reçus:", JSON.stringify(workflows));

        container.innerHTML = "";

        const groupsConfig = [
            {
                label: "ComfyUI",
                filter: (name) => name.endsWith(".json")
            }
        ];

        let firstSelected = false;

        for (const group of groupsConfig) {
            const groupWfs = workflows.filter(group.filter);
            if (!groupWfs.length) continue;

            const wrap = document.createElement("div");
            wrap.className = "workflow-group-wrapper";

            const title = document.createElement("h4");
            title.className = "workflow-group-label";
            title.textContent = group.label;
            wrap.appendChild(title);

            const grid = document.createElement("div");
            grid.className = "workflow-grid";

            groupWfs.forEach(wf => {
                const base = wf.replace(/\.json$/,"");
                const v = document.createElement("div");
                v.className = "workflow-vignette";
                v.dataset.workflowName = wf;

                v.innerHTML = `
                    <div class="workflow-thumb-wrapper">
                        <img class="workflow-thumb" src="./vignettes/${base}.png" onerror="this.src='./vignettes/default.png'">
                    </div>
                    <div class="vignette-label-only">${base}</div>
                `;

                v.addEventListener("click", () => selectWorkflow(wf));
                grid.appendChild(v);
            });

            wrap.appendChild(grid);
            container.appendChild(wrap);

            if (!firstSelected && groupWfs.length > 0) {
                selectWorkflow(groupWfs[0]);
                firstSelected = true;
            }
        }

        if (!firstSelected && workflows.length > 0) {
            selectWorkflow(workflows[0]);
        }

    } catch (e) {
        console.error("Erreur loadWorkflows:", e);
        if (container) {
            container.innerHTML = `<span style="font-size:12px;color:#f97373;">Erreur de chargement des workflows.</span>`;
        }
    }

    try {
        const resp = await fetch(`${API_BASE_URL}/checkpoints`);
        const data = await resp.json();
        const select = document.getElementById("checkpoint-select");
        if (!select) return;

        select.innerHTML = "";
        const optEmpty = document.createElement("option");
        optEmpty.value = "";
        optEmpty.textContent = "Aucun (par défaut du workflow)";
        select.appendChild(optEmpty);

        (data.checkpoints || []).forEach(ckpt => {
            const opt = document.createElement("option");
            opt.value = ckpt;
            opt.textContent = ckpt;
            select.appendChild(opt);
        });

    } catch (e) {
        console.warn("Erreur chargement checkpoints:", e);
    }
}

function selectWorkflow(workflowName) {
    const hiddenInput = document.getElementById("workflow-select");
    if (hiddenInput) {
        hiddenInput.value = workflowName;
    }

    const all = document.querySelectorAll(".workflow-vignette");
    all.forEach(el => {
        el.classList.toggle("selected", el.dataset.workflowName === workflowName);
    });

    log("Workflow sélectionné:", workflowName);

    const checkpointWrapper = document.getElementById("checkpoint-wrapper");
    const videoParamsSection = document.getElementById("video-params-section");
    const inputImageSection = document.getElementById("input-image-section");
    const groupSteps = document.getElementById("group-steps");
    const groupCfg = document.getElementById("group-cfg");
    const groupSampler = document.getElementById("group-sampler");
    const seedSection = document.getElementById("group-seed");
    const sdxlPanel = document.getElementById("sdxl-panel");

    const afficheMenu = document.getElementById("affiche-menu");

    if (workflowName === "affiche.json") {
        if (afficheMenu) afficheMenu.style.display = "block";
        const wInput = document.getElementById("width-input");
        const hInput = document.getElementById("height-input");
        if (wInput) wInput.value = "1080";
        if (hInput) hInput.value = "1920";

        const fmtIcons = document.querySelectorAll(".fmt-icon");
        fmtIcons.forEach(icon => {
            if (icon.dataset.w === "1080" && icon.dataset.h === "1920") {
                icon.classList.add("selected-format");
            } else {
                icon.classList.remove("selected-format");
            }
        });

        if (groupSteps) groupSteps.style.display = "none";
        if (groupCfg) groupCfg.style.display = "none";
        if (groupSampler) groupSampler.style.display = "none";
        if (seedSection) seedSection.style.display = "none";
        if (sdxlPanel) sdxlPanel.style.display = "none";

    } else {
        if (afficheMenu) afficheMenu.style.display = "none";
    }

    if (workflowName.includes("video")) {
        if (videoParamsSection) videoParamsSection.style.display = "block";
    } else {
        if (videoParamsSection) videoParamsSection.style.display = "none";
    }
}

// =========================================================
 // OUTILS POUR LES CHAMPS (SETVALUE + MERGE SELECT/CUSTOM)
 // =========================================================

function setValue(id, val) {
    const el = document.getElementById(id);
    if (!el) return;
    el.value = val;
}

function mergeSelectAndCustom(selectId, customId) {
    const s = document.getElementById(selectId)?.value.trim() || "";
    const c = document.getElementById(customId)?.value.trim() || "";

    // Si le champ custom est rempli, il prend le pas
    if (c) return c;
    // Sinon, on retourne la valeur du select
    if (s) return s;
    return "";
}

function stripAccents(str) {
    try {
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    } catch {
        return str;
    }
}

// =========================================================
// GÉNÉRATION DU PROMPT POUR LE MODE AFFICHE (FINAL)
// =========================================================

function generateAffichePrompt() {
    const titre = document.getElementById("aff_titre")?.value.trim() || "";
    const sousTitre = document.getElementById("aff_sous_titre")?.value.trim() || "";
    const tagline = document.getElementById("aff_tagline")?.value.trim() || "";

    const theme = mergeSelectAndCustom("aff_theme", "aff_theme_custom");
    const ambiance = mergeSelectAndCustom("aff_ambiance", "aff_ambiance_custom");
    const perso = mergeSelectAndCustom("aff_perso_sugg", "aff_perso_desc");
    const env = mergeSelectAndCustom("aff_env_sugg", "aff_env_desc");
    const action = mergeSelectAndCustom("aff_action_sugg", "aff_action_desc");
    const details = document.getElementById("aff_details")?.value.trim() || "";
    const palette = mergeSelectAndCustom("aff_palette", "aff_palette_custom");
    const styleTitre = mergeSelectAndCustom("aff_style_titre", "aff_style_titre_custom");

    const hasTitle = Boolean(titre);
    const hasSubtitle = Boolean(sousTitre);
    const hasTagline = Boolean(tagline);

    let textBlock = "";

    // 👉 Si aucun texte : neutralisation totale du texte
    if (!hasTitle && !hasSubtitle && !hasTagline) {
        textBlock = `
NO TEXT MODE:
The poster must contain ZERO text, letters, symbols or numbers.
Do not invent any title, subtitle or tagline.
Avoid any shapes that resemble typography.
`;
    } else {
        textBlock = `
ALLOWED TEXT ONLY (MODEL MUST NOT INVENT ANYTHING ELSE):

${hasTitle ? `TITLE: "${titre}" (top area, clean, sharp, readable, no distortion)` : ""}
${hasSubtitle ? `SUBTITLE: "${sousTitre}" (under title, smaller, crisp, readable)` : ""}
${hasTagline ? `TAGLINE: "${tagline}" (bottom area, subtle, readable)` : ""}

Rules for text:
- Only the items above are permitted.
- No additional text, no hallucinated wording.
- No extra letters, no random symbols.
- No decorative scribbles resembling handwriting.
- TEXT STYLE / MATERIAL (APPLIES ONLY TO LETTERING):
  ${styleTitre || "cinematic, elegant contrast"}.
- IMPORTANT: The text style applies ONLY to the lettering.
  Do NOT apply this style to the characters, environment, rendering,
  lighting, textures, materials, or the overall image.
  The global visual style of the poster must remain independent.
`;
    }

    const prompt = `
Ultra detailed cinematic poster, dramatic lighting, depth, atmospheric effects.

${textBlock}

Visual elements:
- Theme/mood: ${theme}
- Ambiance: ${ambiance}
- Main character: ${perso}
- Environment: ${env}
- Action: ${action}

Extra details:
${details || "cinematic particles, depth fog, volumetric light"}

Color palette:
${palette || "high contrast cinematic palette"}

Image style:
Premium poster design, professional layout, ultra high resolution, visually striking.
`.trim();

    const promptArea = document.getElementById("prompt");
    if (promptArea) {
        promptArea.value = prompt;
        // 🔥 CRUCIAL: Déclenche un événement 'input' pour que la soumission du formulaire lise la nouvelle valeur.
        promptArea.dispatchEvent(new Event('input', { bubbles: true }));
    }

    console.log("🎨 prompt affiche généré (version anti-texte parasite)");
}


// =========================================================
// PROGRESSION FAKE + DÉTECTION AUTO /result (CORRIGÉ)
// =========================================================

async function pollProgress(promptId) {
    if (!promptId) return;

    fakeProgress = 0;
    pollingFailureCount = 0; // Réinitialisation du compteur
    showProgressOverlay(true, "Génération en cours…");

    if (pollingProgressInterval) {
        clearInterval(pollingProgressInterval);
    }

    const percentSpan = document.getElementById("progress-percent");
    const innerBar = document.getElementById("progress-inner");
    const statusPill = document.getElementById("job-status-pill");

    if (statusPill) {
        statusPill.textContent = "RUNNING";
        statusPill.classList.remove("pill-green", "pill-danger");
        statusPill.classList.add("pill");
    }

    pollingProgressInterval = setInterval(async () => {
        // Animation FAKE jusqu'à 92 %
        fakeProgress = Math.min(fakeProgress + 7, 92);

        if (percentSpan) percentSpan.textContent = fakeProgress + "%";
        if (innerBar) innerBar.style.width = fakeProgress + "%";

        // Test direct si le résultat est disponible
        try {
            const resCheck = await fetch(`${API_BASE_URL}/progress/${promptId}`);

            if (resCheck.ok) {
                // Succès : Réinitialise le compteur d'erreurs et vérifie la fin
                pollingFailureCount = 0;
                const data = await resCheck.json();
                
                if (data.status && data.status.completed) {
                    clearInterval(pollingProgressInterval);
                    pollingProgressInterval = null;

                    if (percentSpan) percentSpan.textContent = "100%";
                    if (innerBar) innerBar.style.width = "100%";

                    showProgressOverlay(false);

                    if (statusPill) {
                        statusPill.textContent = "DONE";
                        statusPill.classList.remove("pill", "pill-danger");
                        statusPill.classList.add("pill-green");
                    }

                    fetchResult(promptId); // Appelle la fonction qui va chercher l'image finale
                    return;
                }
            } else {
                // Si la réponse HTTP n'est pas OK (ex: 404, 500)
                pollingFailureCount++;
                log(`[POLL ERROR] HTTP non OK: ${resCheck.status}. Tentative d'arrêt ${pollingFailureCount}/${MAX_POLLING_FAILURES}`);
                
                if (pollingFailureCount >= MAX_POLLING_FAILURES) {
                    // Arrêt du polling après trop d'échecs
                    clearInterval(pollingProgressInterval);
                    pollingProgressInterval = null;
                    showProgressOverlay(false);

                    setError(`La tâche ${promptId} a été perdue par le serveur (Erreur ${resCheck.status}). La génération a échoué.`);
                    return;
                }
            }

        } catch (e) {
            // Erreur de réseau ou JSON (serveur injoignable)
            pollingFailureCount++;
            log(`[POLL ERROR] Erreur réseau/JSON: ${e.message}. Tentative d'arrêt ${pollingFailureCount}/${MAX_POLLING_FAILURES}`);

            if (pollingFailureCount >= MAX_POLLING_FAILURES) {
                // Arrêt du polling après trop d'échecs
                clearInterval(pollingProgressInterval);
                pollingProgressInterval = null;
                showProgressOverlay(false);
                setError(`Échec de la connexion au serveur après plusieurs tentatives. Vérifiez l'URL de l'API (${API_BASE_URL}).`);
                return;
            }
        }

    }, POLLING_INTERVAL_MS);
}

// =========================================================
// RÉCUPÉRATION RESULTAT /result/{prompt_id}
// =========================================================

async function fetchResult(promptId) {
    try {
        log("Récupération du résultat pour:", promptId);
        const resp = await fetch(`${API_BASE_URL}/result/${promptId}`); 
        if (!resp.ok) {
            log("Result HTTP non OK:", resp.status);
            setError("Impossible de récupérer le résultat pour l’instant.");
            return;
        }

        const data = await resp.json();
        const base64 = data.image_base64;
        const filename = data.filename || "image.png";

        const resultArea = document.getElementById("result-area");
        const placeholder = document.getElementById("result-placeholder");

        if (placeholder) placeholder.style.display = "none";

        const imgExisting = resultArea.querySelector("img.result-image");
        if (imgExisting) imgExisting.remove();

        const img = document.createElement("img");
        img.className = "result-image mj-img mj-blur clickable";
        img.src = `data:image/png;base64,${base64}`;
        img.alt = "Image générée";
        img.style.maxWidth = "100%";
        img.style.height = "auto";
        img.style.display = "block";
        img.style.margin = "0 auto";

        img.onload = () => {
            img.classList.remove("mj-blur");
            img.classList.add("mj-ready");
        };

        img.addEventListener("click", () => {
            const modal = document.getElementById("image-modal");
            const modalImg = document.getElementById("modal-image");
            const dlLink = document.getElementById("modal-download-link");

            if (modal && modalImg && dlLink) {
                modalImg.src = img.src;
                dlLink.href = img.src;
                dlLink.download = filename;
                modal.style.display = "flex";
            }
        });

        resultArea.appendChild(img);

        const metaSeed = document.getElementById("meta-seed");
        const metaSteps = document.getElementById("meta-steps");
        const metaCfg = document.getElementById("meta-cfg");
        const metaSampler = document.getElementById("meta-sampler");

        if (metaSeed) metaSeed.textContent = "–";
        if (metaSteps) metaSteps.textContent = "–";
        if (metaCfg) metaCfg.textContent = "–";
        if (metaSampler) metaSampler.textContent = "–";

        if (lastGenerationStartTime) {
            const diffMs = Date.now() - lastGenerationStartTime;
            const sec = (diffMs / 1000).toFixed(1);
            const timeTakenEl = document.getElementById("time-taken");
            if (timeTakenEl) timeTakenEl.textContent = `${sec}s`;
        }

        setError("");

    } catch (e) {
        console.error("Erreur fetchResult:", e);
        setError("Erreur lors de la récupération de l’image générée.");
    }
}

// =========================================================
// ENVOI DU FORMULAIRE → /generate
// =========================================================

async function startGeneration(e) {
    e.preventDefault();

    setError("");

    const formEl = document.getElementById("generation-form");
    if (!formEl) return;

    const formData = new FormData(formEl);

    const wfName = document.getElementById("workflow-select")?.value;
    if (!wfName) {
        setError("Veuillez sélectionner un workflow.");
        return;
    }

    log("Début de la séquence de génération réelle (Max 3 tentatives)...");

    const generateBtn = document.getElementById("generate-button");
    // NOTE: On utilise le bouton approprié en fonction du mode actif
    const afficheBtn = document.getElementById("affiche-generate-btn");
    const currentBtn = (generateBtn && generateBtn.style.display !== 'none') ? generateBtn : afficheBtn;

    if (currentBtn) {
        currentBtn.disabled = true;
        // La gestion de l'animation/texte est déjà faite par le click listener pour affiche
        // Pour le bouton générique (Mode Image), on le met en état 'Génération en cours...'
        if (currentBtn === generateBtn) {
            generateBtn.querySelector(".dot").style.background = "#fbbf24";
            generateBtn.innerHTML = `<span class="dot"></span>Génération en cours…`;
        }
    }


    lastGenerationStartTime = Date.now();
    showProgressOverlay(true, "Initialisation…");
    fakeProgress = 0;

    const statusPill = document.getElementById("job-status-pill");
    if (statusPill) {
        statusPill.textContent = "PENDING";
        statusPill.classList.remove("pill-green", "pill-danger");
        statusPill.classList.add("pill");
    }

    const maxAttempts = 3;
    let attempt = 0;
    let success = false;
    let finalPromptId = null;

    while (attempt < maxAttempts && !success) {
        attempt++;
        try {
            log(`[Tentative ${attempt}/${maxAttempts}] Envoi de la requête de génération.`);

            const resp = await fetch(`${API_BASE_URL}/generate?workflow_name=${encodeURIComponent(wfName)}`, { method: "POST", body: formData });

            if (!resp.ok) {
                log(`Tentative ${attempt} → HTTP ${resp.status}`);
                if (attempt < maxAttempts) {
                    await new Promise(r => setTimeout(r, 5000));
                    continue;
                } else {
                    throw new Error("Échec après plusieurs tentatives.");
                }
            }

            const data = await resp.json();
            if (!data.prompt_id) {
                throw new Error("Réponse invalide de /generate (missing prompt_id)");
            }

            success = true;
            finalPromptId = data.prompt_id;

        } catch (err) {
            console.error(`Erreur tentative ${attempt}:`, err);
            log(`Tentative ${attempt}/${maxAttempts} : Échec. Ré-essai dans 5 secondes...`);

            if (attempt >= maxAttempts) {
                setError("Échec de l’envoi de la génération après plusieurs tentatives.");
            }

            await new Promise(r => setTimeout(r, 5000));
        }
    }

    if (success && finalPromptId) {
        currentPromptId = finalPromptId;
        log("Prompt ID final:", finalPromptId);
        pollProgress(finalPromptId);
    }

    // Réactive le bouton
    if (currentBtn) {
        currentBtn.disabled = false;
        // Réinitialise le texte du bouton générique
        if (currentBtn === generateBtn) {
            generateBtn.querySelector(".dot").style.background = "rgba(15,23,42,0.9)";
            generateBtn.innerHTML = `<span class="dot"></span>Démarrer la génération`;
        }
    }
}

// =========================================================
// RANDOM AFFICHE — CHARGEMENT + GÉNÉRATION AUTOMATIQUE
// =========================================================

let RANDOM_AFFICHE_DATA = null;

// Charge le fichier JSON une seule fois
async function loadRandomAfficheJSON() {
    if (RANDOM_AFFICHE_DATA) return RANDOM_AFFICHE_DATA;

    try {
        const resp = await fetch("random_affiche_data.json");
        if (!resp.ok) {
            console.error("❌ Fichier random_affiche_data.json introuvable !");
            return null;
        }

        RANDOM_AFFICHE_DATA = await resp.json();
        console.log("📁 random_affiche_data.json chargé !");
        return RANDOM_AFFICHE_DATA;

    } catch (e) {
        console.error("Erreur lors du chargement JSON random :", e);
        return null;
    }
}

// Pioche aléatoire
function pickRandom(arr) {
    if (!arr || !arr.length) return "";
    const idx = Math.floor(Math.random() * arr.length);
    return arr[idx];
}

// Injection massive dans les champs
function fillAfficheFieldsFromRandom(randomObj) {
    if (!randomObj) return;

    setValue("aff_titre", randomObj.titre || "");
    setValue("aff_sous_titre", randomObj.sous_titre || "");
    setValue("aff_tagline", randomObj.tagline || "");

    if (randomObj.theme) {
        setValue("aff_theme_custom", randomObj.theme);
        const s = document.getElementById("aff_theme");
        if (s) s.value = "";
    }

    if (randomObj.ambiance) {
        setValue("aff_ambiance_custom", randomObj.ambiance);
        const s = document.getElementById("aff_ambiance");
        if (s) s.value = "";
    }

    if (randomObj.personnage) {
        setValue("aff_perso_desc", randomObj.personnage);
        const s = document.getElementById("aff_perso_sugg");
        if (s) s.value = "";
    }

    if (randomObj.environnement) {
        setValue("aff_env_desc", randomObj.environnement);
        const s = document.getElementById("aff_env_sugg");
        if (s) s.value = "";
    }

    if (randomObj.action) {
        setValue("aff_action_desc", randomObj.action);
        const s = document.getElementById("aff_action_sugg");
        if (s) s.value = "";
    }

    if (randomObj.details) {
        setValue("aff_details", randomObj.details);
    }

    if (randomObj.palette) {
        setValue("aff_palette_custom", randomObj.palette);
        const s = document.getElementById("aff_palette");
        if (s) s.value = "";
    }

    if (randomObj.style_titre) {
        setValue("aff_style_titre_custom", randomObj.style_titre);
        const s = document.getElementById("aff_style_titre");
        if (s) s.value = "";
    }
}

// =========================================================
// INIT GLOBAL (DOMContentLoaded)
// =========================================================

function autoClearOnSelect(selectId, customId) {
    const sel = document.getElementById(selectId);
    const custom = document.getElementById(customId);

    if (!sel || !custom) return;

    sel.addEventListener("change", () => {
        if (sel.value && custom.value.trim() !== "") {
            custom.value = ""; // Efface le champ libre
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {

    // =========================================================
    // AUTO-CLEAR POUR CHAQUE SELECT → CHAMP CUSTOM
    // =========================================================
    autoClearOnSelect("aff_style_titre", "aff_style_titre_custom");
    autoClearOnSelect("aff_theme", "aff_theme_custom");
    autoClearOnSelect("aff_ambiance", "aff_ambiance_custom");
    autoClearOnSelect("aff_perso_sugg", "aff_perso_desc");
    autoClearOnSelect("aff_env_sugg", "aff_env_desc");
    autoClearOnSelect("aff_action_sugg", "aff_action_desc");
    autoClearOnSelect("aff_palette", "aff_palette_custom");

    // =========================================================
    // LISTENERS GÉNÉRAUX
    // =========================================================

    const formEl = document.getElementById("generation-form");
    if (formEl) {
        formEl.addEventListener("submit", startGeneration);
    }

    const modal = document.getElementById("image-modal");
    const modalClose = document.querySelector(".modal-close-btn");

    if (modalClose && modal) {
        modalClose.addEventListener("click", () => {
            modal.style.display = "none";
        });
    }

    if (modal) {
        modal.addEventListener("click", (ev) => {
            if (ev.target === modal) {
                modal.style.display = "none";
            }
        });
    }

    const copyBtn = document.getElementById("copy-params-btn");
    if (copyBtn) {
        copyBtn.addEventListener("click", () => {
            const wfName = document.getElementById("workflow-select")?.value || "–";
            const width = document.getElementById("width-input")?.value || "–";
            const height = document.getElementById("height-input")?.value || "–";
            const steps = document.getElementById("steps-slider")?.value || "–";
            const cfg = document.getElementById("cfg_scale-slider")?.value || "–";
            const sampler = document.getElementById("sampler")?.value || "–";
            const seed = document.getElementById("seed-input")?.value || "–";

            const txt = `Workflow: ${wfName}\nResolution: ${width}x${height}\nSteps: ${steps}\nCFG: ${cfg}\nSampler: ${sampler}\nSeed: ${seed}`;
            navigator.clipboard.writeText(txt).then(() => {
                log("Paramètres copiés dans le presse-papiers.");
            });
        });
    }
    
    // =========================================================
    // RANDOM AFFICHE BUTTON LISTENER (CORRIGÉ FINAL)
    // =========================================================

    const randomBtn = document.getElementById("affiche-random-btn");
    if (randomBtn && formEl) {
        randomBtn.addEventListener("click", async () => {
            console.log("🎲 Clic random détecté !");

            const data = await loadRandomAfficheJSON();
            if (!data) return;

            // ... (logique de pioche aléatoire) ...
            const theme = pickRandom(data.themes);
            const ambiance = pickRandom(data.ambiances);
            const perso = pickRandom(data.personnages);
            const env = pickRandom(data.environnements);
            const action = pickRandom(data.actions);
            const palette = pickRandom(data.palettes);
            const styleTitre = pickRandom(data.styles_titre);
            const details = pickRandom(data.details);
            const titre = pickRandom(data.titres);
            const sousTitre = pickRandom(data.sous_titres);
            const tagline = pickRandom(data.taglines || []);

            const randomObj = {
                titre,
                sous_titre: sousTitre,
                tagline,
                theme,
                ambiance,
                personnage: perso,
                environnement: env,
                action,
                palette,
                style_titre: styleTitre,
                details
            };

            fillAfficheFieldsFromRandom(randomObj);
            generateAffichePrompt(); // 1. Génère le prompt immédiatement après le remplissage
            
            // 2. Déclenche la soumission du formulaire pour démarrer la génération
            formEl.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
            
            // 3. Animation du bouton
            randomBtn.classList.add("clicked");
            randomBtn.innerHTML = "🎲 Génération...";
            setTimeout(() => {
                randomBtn.classList.remove("clicked");
                randomBtn.innerHTML = "🎲 Aléatoire";
            }, 600);
            
            console.log("🎲 Champs affiche remplis aléatoirement:", randomObj);
        });
    }

    // =========================================================
    // GENERATE PROMPT BUTTON LISTENER (CORRIGÉ)
    // =========================================================

    const btnPrompt = document.getElementById("affiche-generate-btn");
    // formEl est disponible dans ce scope
    if (btnPrompt && formEl) {
        btnPrompt.addEventListener("click", () => {
            
            generateAffichePrompt(); // 1. Génère le prompt et met à jour le champ caché
            
            // 2. Déclenche la soumission du formulaire pour démarrer la génération
            formEl.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })); 
            
            // 3. Animation du bouton
            btnPrompt.classList.add("clicked");
            btnPrompt.innerHTML = "✨ Génération...";
            setTimeout(() => {
                btnPrompt.classList.remove("clicked");
                btnPrompt.innerHTML = "✨ Générer le prompt de l’affiche";
            }, 600);
        });
    }

    // =========================================================
    // ACTIVATION DES MENUS & BOUTONS (AFFICHE / IMAGE) - CORRIGÉ
    // =========================================================
    const modeCards = document.querySelectorAll(".mode-card");
    const afficheMenu = document.getElementById("affiche-menu");
    const generateButton = document.getElementById("generate-button"); // Le bouton standard
    const afficheGenerateBtnWrapper = document.getElementById("affiche-generate-button-wrapper"); // Le conteneur du bouton Affiche


    modeCards.forEach(card => {
        card.addEventListener("click", () => {
            const mode = card.dataset.mode;

            // visuel actif
            modeCards.forEach(c => c.classList.remove("active-mode"));
            card.classList.add("active-mode");

            // Le mode AFFICHE affiche le menu Affiche
            if (mode === "affiche") {
                afficheMenu.style.display = "block";
                selectWorkflow("affiche.json"); 

                // LOGIQUE DE BOUTON : Masquer le bouton Générique, Afficher le conteneur Affiche
                if (generateButton) generateButton.style.display = 'none';
                if (afficheGenerateBtnWrapper) afficheGenerateBtnWrapper.style.display = 'block';

            } else { // Mode Image
                // Si ce n'est pas le mode AFFICHE, on le masque
                afficheMenu.style.display = "none";
                // L'appel selectWorkflow("default_image.json"); peut être ajouté ici

                // LOGIQUE DE BOUTON : Afficher le bouton Générique, Masquer le conteneur Affiche
                if (generateButton) generateButton.style.display = 'block'; // <-- CECI REND LE BOUTON VISIBLE
                if (afficheGenerateBtnWrapper) afficheGenerateBtnWrapper.style.display = 'none';
            }
        });
    });
    // =========================================================
    // INITIALISATION FINAL
    // =========================================================
    setInterval(refreshGPU, 10000);
    refreshGPU();
    loadWorkflows();

});
