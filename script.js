// =========================================================
// 🔐 AUTH UTILITIES (GLOBAL)
// =========================================================

function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const now = Math.floor(Date.now() / 1000);
    return payload.exp < now;
  } catch {
    return true;
  }
}

function authHeaders() {
  const token = localStorage.getItem("google_id_token");
  if (!token || isTokenExpired(token)) {
    throw new Error("Utilisateur non authentifié ou token expiré");
  }
  return {
    Authorization: `Bearer ${token}`
  };
}

// =========================================================
// 🔑 Récupération du token depuis l’URL
// =========================================================
(function storeGoogleTokenFromURL() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  if (token) {
    localStorage.setItem("google_id_token", token);
    const url = new URL(window.location.href);
    url.searchParams.delete("token");
    window.history.replaceState({}, document.title, url.toString());
  }
})();

// =========================================================
// 🔒 ENFORCE AUTH (LOGIN OBLIGATOIRE)
// =========================================================
(function enforceAuth() {
  const isLoginPage = window.location.pathname.endsWith("login.html");
  const token = localStorage.getItem("google_id_token");

  if (!token || isTokenExpired(token)) {
    localStorage.removeItem("google_id_token");
    if (!isLoginPage) {
      window.location.replace("login.html");
    }
  }
})();

// =========================================================
// CONFIGURATION (FRONTEND)
// =========================================================

const API_BASE_URL = "https://g-n-rateur-backend-1.onrender.com";



// =========================================================
// 📸 GALERIE CARROUSEL (thumbs légères + images HD)
// =========================================================
function loadCarrouselGallery(data) {
  const gallery = document.getElementById("gallery-grid");
  if (!gallery || !data || !data.images) return;

  gallery.innerHTML = "";

  data.images.forEach((img, index) => {
    const thumb = document.createElement("img");
    thumb.src = img.thumb;
    thumb.alt = `Generated image ${index + 1}`;
    thumb.classList.add("gallery-thumb");

    thumb.addEventListener("click", () => {
      openImageModal(img.url);
    });

    gallery.appendChild(thumb);
  });

  console.log("✅ galerie remplie");
}
  // L'erreur précédente était probablement causée par une mauvaise fermeture ici.
}
// =========================================================
// 🆕 OUVERTURE MODAL DEPUIS RESULTAT (appelée par la génération)
// =========================================================

const STYLE_TITRE_OPTIONS = [
    { label: "e sanglant dégoulinant", value: "dripping horror lettering, torn edges, glossy red liquid ure, glowing sinister vibe" },
    { label: "Néon cyberpunk", value: "bright neon tube letters, electric glow, slight chromatic aberration, futuristic vaporwave look" },
    { label: "Typographie givrée / glace", value: "frosted glass letters, icy ure, translucent frozen edges, cold blue inner glow" },
    { label: "Lettrage en bois sculpté", value: "hand-carved wooden lettering, deep grooves, warm grain ure, rustic fantasy aesthetic" },
    { label: "e métallique gravé", value: "polished engraved steel letters, sharp reflections, industrial sci-fi shine" },
    { label: "Style cartoon / bulle", value: "rounded bubbly cartoon letters, colorful shading, outlined comic look" },
    { label: "Effet slasher sanglant", value: "sharp jagged letters, blood splatter ure, rough grain, violent horror tone" },
    { label: "Lettrage en cristal / gemme", value: "faceted gemstone letters, prism reflections, diamond-like clarity, luminous highlights" },
    { label: "Runes de pierre anciennes", value: "weathered carved stone letters, cracks, moss details, archaeological fantasy mood" },
    { label: "e en flammes", value: "burning fire lettering, glowing embers, smoke trails, intense heat distortion" },
    { label: "e liquide / eau", value: "transparent water-ured letters, droplets, soft reflections, fluid organic movement" },
    { label: "Titre doré royal", value: "polished gold lettering, embossed ure, warm specular highlights, luxury vibe" },
    { label: "Graffiti urbain", value: "spray-painted lettering, rough outlines, dripping paint, street-art" },
    { label: "Hologramme futuriste", value: "holographic translucent letters, digital flicker, refraction effects, sci-fi projection" },
    { label: "Gothique médiéval", value: "blackletter-inspired carved metal, dark engraved ure, dramatic gothic atmosphere" },
    { label: "Style pâte à modeler (stop motion)", value: "hand-molded clay letters, fingerprint ure, soft studio lighting, claymation charm" },
    { label: "Découpe papier / collage", value: "layered paper-cut letters, soft shadows, handcrafted collage feel" },
    { label: "Cosmique / nébuleuse", value: "letters filled with nebula ures, stars, glowing cosmic colors, ethereal space vibe" },
    { label: "Steampunk en laiton", value: "aged brass letters, rivets, gears, Victorian industrial detailing" },
    { label: "e glitch numérique", value: "distorted corrupted letters, RGB glitch separation, pixel noise, digital malfunction look" }
];

// =========================================================
// 🆕 INJECTION AUTOMATIQUE DANS LE SELECT
// =========================================================

document.addEventListener("DOMContentLoaded", () => {
    const styleSelect = document.getElementById("aff_style_titre");
    if (styleSelect) {
        STYLE_TITRE_OPTIONS.forEach(opt => {
            const o = document.createElement("option");
            o.value = opt.value;
            o.textContent = opt.label;
            styleSelect.appendChild(o);
        });
    }
});

// =========================================================
// 🆕 INJECTION AUTOMATIQUE + QUICK FORMAT
// =========================================================
document.addEventListener("DOMContentLoaded", () => {

  // -----------------------------
  // Injection styles de titre
  // -----------------------------
  const styleSelect = document.getElementById("aff_style_titre");
  if (styleSelect) {
    STYLE_TITRE_OPTIONS.forEach(opt => {
      const o = document.createElement("option");
      o.value = opt.value;
      o.textContent = opt.label;
      styleSelect.appendChild(o);
    });
  }

  // -----------------------------
  // 🧩 QUICK FORMAT BUTTONS (CORRIGÉ)
  // -----------------------------
  document.querySelectorAll(".fmt-icon").forEach(icon => {
    icon.addEventListener("click", () => {
      const w = icon.dataset.w;
      const h = icon.dataset.h;

      const widthInput = document.getElementById("width-input");
      const heightInput = document.getElementById("height-input");

      if (widthInput && heightInput) {
        widthInput.value = w;
        heightInput.value = h;
      }

      // état visuel UNIQUE
      document.querySelectorAll(".fmt-icon").forEach(i =>
        i.classList.remove("active")
      );
      icon.classList.add("active");

      console.log(`📐 Quick Format appliqué : ${w}x${h}`);
    });
  });

});
// =========================================================
// CONFIGURATION DU POLLING HTTP
// =========================================================
const POLLING_INTERVAL_MS = 900;
let pollingProgressInterval = null;
let fakeProgress = 0;
let pollingFailureCount = 0;
const MAX_POLLING_FAILURES = 5;

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
             statusPill.classList.remove("pill", "pill-green", "pill-warning");
             statusPill.classList.add("pill-danger"); 
        }

    } else {
        errBox.style.display = "none";
        errBox.textContent = "";
        if (statusPill && statusPill.textContent === "FAILED") {
            statusPill.textContent = "READY";
            statusPill.classList.remove("pill-danger", "pill-warning");
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
        overlay.classList.add("active"); // ✅ modal fullscreen
        labelSpan.textContent = label;
        percentSpan.textContent = "0%";
        innerBar.style.width = "0%";
        fakeProgress = 0;
    } else {
        overlay.classList.remove("active");
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

        // On peut filtrer ici si besoin, pour l'instant on prend tout
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
        
        // Mise à jour de la résolution pour l'affiche (format vertical 9:16)
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

        // Masquer les options inutiles pour l'affiche
        if (groupSteps) groupSteps.style.display = "none";
        if (groupCfg) groupCfg.style.display = "none";
        if (groupSampler) groupSampler.style.display = "none";
        if (seedSection) seedSection.style.display = "none";
        if (sdxlPanel) sdxlPanel.style.display = "none";

    } else {
        if (afficheMenu) afficheMenu.style.display = "none";
        
        // Afficher les options avancées en mode normal (si elles existent)
        if (groupSteps) groupSteps.style.display = "block";
        if (groupCfg) groupCfg.style.display = "block";
        if (groupSampler) groupSampler.style.display = "block";
        if (seedSection) seedSection.style.display = "block";
        if (sdxlPanel) sdxlPanel.style.display = "block";
    }

    if (workflowName.includes("video")) {
        if (videoParamsSection) videoParamsSection.style.display = "block";
    } else {
        if (videoParamsSection) videoParamsSection.style.display = "none";
    }
}

// =========================================================
 // OUTILS POUR LES CHAMPS
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

// =========================================================
// GÉNÉRATION DU PROMPT POUR LE MODE AFFICHE (FINAL)
// =========================================================

function generateAffichePrompt() {
    // Récupération des champs de e simples (Titre, Sous-Titre, Tagline)
    const titre = document.getElementById("aff_titre")?.value.trim() || "";
    const sousTitre = document.getElementById("aff_sous_titre")?.value.trim() || "";
    const tagline = document.getElementById("aff_tagline")?.value.trim() || "";
    const details = document.getElementById("aff_details")?.value.trim() || "";
    const randomSeed = document.getElementById("aff_random_seed")?.value.trim() || ""; // Récupère la seed si elle existe

    // Récupération des champs SELECT + CUSTOM via la fonction utilitaire
    const theme = mergeSelectAndCustom("aff_theme", "aff_theme_custom");
    const ambiance = mergeSelectAndCustom("aff_ambiance", "aff_ambiance_custom");
    const perso = mergeSelectAndCustom("aff_perso_sugg", "aff_perso_desc");
    const env = mergeSelectAndCustom("aff_env_sugg", "aff_env_desc");
    const action = mergeSelectAndCustom("aff_action_sugg", "aff_action_desc");
    const palette = mergeSelectAndCustom("aff_palette", "aff_palette_custom");
    
    // Logique pour le style du titre
    let styleTitre = mergeSelectAndCustom("aff_style_titre", "aff_style_titre_custom");
    
    // Si le style de titre est vide ou 'aleatoire', on pioche un style dans STYLE_TITRE_OPTIONS
    if (styleTitre === "" || styleTitre === "aleatoire") {
        const styleSelect = document.getElementById("aff_style_titre");
        const options = styleSelect ? Array.from(styleSelect.options) : [];
        const relevantOptions = options.filter(opt => opt.value && opt.value !== 'aleatoire');
        
        if (relevantOptions.length > 0) {
            const randomIndex = Math.floor(Math.random() * relevantOptions.length);
            styleTitre = relevantOptions[randomIndex].value;
            styleSelect.value = styleTitre; // Mise à jour visuelle (optionnel)
            log(`Style de titre aléatoire sélectionné : ${relevantOptions[randomIndex].textContent}`);
        } else {
             styleTitre = "cinematic, elegant contrast"; // Valeur de repli
        }
    }


    const hasTitle = Boolean(titre);
    const hasSubtitle = Boolean(sousTitre);
    const hasTagline = Boolean(tagline);


    // 3. Construction des prompts pour le modèle
    
    let textBlock = "";

    // Le prompt de texte complexe est injecté directement dans le prompt principal
    if (hasTitle || hasSubtitle || hasTagline) {
     textBlock = `
ALLOWED TEXT ONLY:

${hasTitle ? `TITLE: "${titre}" (top area, clean, sharp, readable, no distortion)` : ""}
${hasSubtitle ? `SUBTITLE: "${sousTitre}" (under title, smaller, crisp, readable)` : ""}
${hasTagline ? `TAGLINE: "${tagline}" (bottom area, subtle, readable)` : ""}

ONLY ONE INSTANCE OF EACH TEXT ELEMENT.

TEXT STYLE / MATERIAL (APPLIES ONLY TO LETTERING):
${styleTitre}
`;
    }
    
    // Filtrage des éléments visuels vides
    const visualElements = [
        theme,
        ambiance,
        perso,
        env,
        action,
        palette
    ].filter(item => item.trim() !== "").join(', ');
    
    // Construction du prompt principal
    let prompt = `
Ultra detailed cinematic poster, dramatic lighting, depth, atmospheric effects.

${textBlock}

Visual elements:
${visualElements}

Extra details:
${details || "cinematic particles, depth fog, volumetric light"}

Image style:
Premium poster design, professional layout, ultra high resolution, visually striking.
    `.trim().replace(/\n\s*\n/g, '\n').replace(/\s{2,}/g, ' '); // Nettoyage des sauts de ligne inutiles


    // Ajout de la seed
    if (randomSeed) {
        prompt += `, --seed: ${randomSeed}`;
    }

    const promptArea = document.getElementById("prompt");
    if (promptArea) {
        promptArea.value = prompt;
    }

    log("🎨 Prompt affiche généré et prêt à être envoyé.");
    
    return prompt; 
}


// =========================================================
// PROGRESSION FAKE + DÉTECTION AUTO /result (MODIFIÉ)
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
        statusPill.classList.remove("pill-green", "pill-danger", "pill-warning");
        statusPill.classList.add("pill");
    }

    pollingProgressInterval = setInterval(async () => {
        // Animation FAKE jusqu'à 92 %
        fakeProgress = Math.min(fakeProgress + 7, 92);

        if (percentSpan) percentSpan.textContent = fakeProgress + "%";
        if (innerBar) innerBar.style.width = fakeProgress + "%";

        // Test direct si le résultat est disponible
        try {
            const resCheck = await fetch(`${API_BASE_URL}/progress/${promptId}`, { headers: { ...authHeaders() } });

            if (resCheck.ok) {
                // Succès : Réinitialise le compteur d'erreurs et vérifie la fin
                pollingFailureCount = 0;
                const data = await resCheck.json();
                
                if (data.status && data.status.completed) {
                    clearInterval(pollingProgressInterval);
                    pollingProgressInterval = null;

                    // On délègue la récupération finale au gestionnaire
                    handleCompletion(promptId); 
                    return;
                }
            } else {
                // Si la réponse HTTP n'est pas OK (ex: 404, 500)
                pollingFailureCount++;
                log(`[POLL ERROR] HTTP non OK: ${resCheck.status}. Tentative d'arrêt ${pollingFailureCount}/${MAX_POLLING_FAILURES}`);
                
                if (pollingFailureCount >= MAX_POLLING_FAILURES) {
                    clearInterval(pollingProgressInterval);
                    pollingProgressInterval = null;
                    showProgressOverlay(false);
                    setError(`La tâche ${promptId} a été perdue par le serveur (HTTP ${resCheck.status}).`);
                    return;
                }
            }

        } catch (e) {
            pollingFailureCount++;
            log(`[POLL ERROR] Erreur réseau/JSON: ${e.message}.`);

            if (pollingFailureCount >= MAX_POLLING_FAILURES) {
                clearInterval(pollingProgressInterval);
                pollingProgressInterval = null;
                showProgressOverlay(false);
                setError(`Échec de la connexion au serveur API (${API_BASE_URL}).`);
                return;
            }
        }

    }, POLLING_INTERVAL_MS);
}

// =========================================================
// GESTIONNAIRE DE COMPLÉTION AVEC RETRY
// =========================================================

async function handleCompletion(promptId) {
    
    const statusPill = document.getElementById("job-status-pill");
    const percentSpan = document.getElementById("progress-percent");
    const innerBar = document.getElementById("progress-inner");

    // Mise à jour UI pour indiquer le début de la récupération finale
    if (statusPill) {
        statusPill.textContent = "FETCHING";
        statusPill.classList.remove("pill", "pill-green", "pill-danger");
        statusPill.classList.add("pill-warning"); 
    }
    if (percentSpan) percentSpan.textContent = "92%";
    if (innerBar) innerBar.style.width = "92%";


    const MAX_FETCH_ATTEMPTS = 10;
    const RETRY_DELAY_MS = 2000;

    for (let attempt = 1; attempt <= MAX_FETCH_ATTEMPTS; attempt++) {
        log(`[FETCH RESULT] Tentative ${attempt}/${MAX_FETCH_ATTEMPTS} pour ${promptId}...`);
        
        try {
            const resp = await fetch(`${API_BASE_URL}/result/${promptId}`, { headers: { ...authHeaders() } }); 

            if (resp.ok) {
                // SUCCESS! Finish UI and display image
                const data = await resp.json();
                
                // FINAL UI UPDATE 
                if (percentSpan) percentSpan.textContent = "100%";
                if (innerBar) innerBar.style.width = "100%";
                showProgressOverlay(false);
                if (statusPill) {
                    statusPill.textContent = "DONE";
                    statusPill.classList.remove("pill", "pill-danger", "pill-warning");
                    statusPill.classList.add("pill-green");
                }
                
                displayImageAndMetadata(data);
                setError("");
                return; // FINISHED SUCCESSFULLY
            } 
            
            // HTTP NOT OK
            log(`[FETCH RESULT] HTTP non OK: ${resp.status}. Ré-essai dans ${RETRY_DELAY_MS / 1000}s.`);
            
            if (attempt === MAX_FETCH_ATTEMPTS) {
                throw new Error(`Échec de la récupération du résultat après ${MAX_FETCH_ATTEMPTS} tentatives.`);
            }
            
            await new Promise(r => setTimeout(r, RETRY_DELAY_MS));

        } catch (e) {
            console.error("Erreur fetchResult/handleCompletion:", e);
            showProgressOverlay(false);
            setError(e.message || "Erreur lors de la récupération de l’image générée.");
            if (statusPill) {
                statusPill.textContent = "FAILED";
                statusPill.classList.remove("pill", "pill-green", "pill-warning");
                statusPill.classList.add("pill-danger");
            }
            return; 
        }
    }
}

// =========================================================
// IMAGE MODAL — OUVERTURE CENTRALISÉE
// =========================================================

function openImageModal(src) {
    const modal = document.getElementById("image-modal");
    const img = document.getElementById("image-modal-img");
    const dl = document.getElementById("image-modal-download");

    if (!modal || !img || !dl) return;

    img.src = src;
    dl.href = src;

    // nom de fichier propre
    const filename = src.startsWith("data:")
        ? "generated-image.png"
        : src.split("/").pop().split("?")[0];

    dl.setAttribute("download", filename);

    modal.style.display = "flex";
}

// =========================================================
// AFFICHAGE DU RÉSULTAT ET DES METADATAS
// =========================================================

function displayImageAndMetadata(data) {
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

    img.onload = () => {
        img.classList.remove("mj-blur");
        img.classList.add("mj-ready");
    };

    img.addEventListener("click", () => {
        openImageModal(img.src);
    });

    resultArea.appendChild(img);

    // metas
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
}

// =========================================================
// ENVOI DU FORMULAIRE → /generate (CORRIGÉ COMPLET)
// =========================================================

async function startGeneration(e) {
    e.preventDefault();

    setError("");

    const formEl = document.getElementById("generation-form");
    if (!formEl) return;

    const generateBtn = document.getElementById("generate-button");
    const currentBtn = generateBtn;

    // 1. Désactiver le bouton immédiatement et initialiser l'état
    if (currentBtn) {
        currentBtn.disabled = true;
        currentBtn.querySelector(".dot").style.background = "#fbbf24";
        currentBtn.innerHTML = `<span class="dot"></span>Initialisation…`;
    }

    lastGenerationStartTime = Date.now();
    showProgressOverlay(true, "Initialisation…");
    fakeProgress = 0;

    const statusPill = document.getElementById("job-status-pill");
    if (statusPill) {
        statusPill.textContent = "PENDING";
        statusPill.classList.remove("pill-green", "pill-danger", "pill-warning");
        statusPill.classList.add("pill");
    }

    let success = false;
    let finalPromptId = null;
    let formData;
    let finalPromptText = ""; // Variable pour stocker le prompt final

    // 2. Le bloc try/finally garantit la réactivation du bouton.
    try {
        const wfName = document.getElementById("workflow-select")?.value;

        if (!wfName) {
            setError("Veuillez sélectionner un workflow.");
            throw new Error("No workflow selected."); 
        }

        // ÉTAPE 1 : Créer le FormData avec toutes les données existantes
        formData = new FormData(formEl);

        // ÉTAPE 2 : Gérer le prompt pour le mode AFFICHE (Injection directe)
        if (wfName === "affiche.json") {
            log("Workflow Affiche détecté. Génération automatique et injection du prompt.");
            
            // La fonction generateAffichePrompt est modifiée pour RETOURNER le prompt généré.
            // Si votre fonction n'a pas été modifiée, veuillez appliquer la modification suivante:
            // Remplacer :
            // function generateAffichePrompt() { ... (calcul prompt) ... promptArea.value = prompt; }
            // Par :
            // function generateAffichePrompt() { ... (calcul prompt) ... promptArea.value = prompt; return prompt; }
            
            const generatedPrompt = generateAffichePrompt();
            
            // 🔥 INJECTION DIRECTE : On s'assure que le champ 'prompt' dans le FormData a la bonne valeur.
            // Ceci garantit que la valeur est envoyée, même si le DOM n'est pas synchrone.
            formData.set('prompt', generatedPrompt);
            finalPromptText = generatedPrompt;

        } else {
            // Pour tous les autres workflows, on prend le prompt tel qu'il a été saisi dans le textarea
            finalPromptText = formData.get('prompt') || "Prompt par défaut si vide";
        }
        
        log(`Contenu du prompt envoyé: "${finalPromptText.substring(0, 80)}..."`);
        
        log("Début de la séquence de génération réelle...");
        if (currentBtn) currentBtn.innerHTML = `<span class="dot"></span>Génération en cours…`;

        const maxAttempts = 3;
        let attempt = 0;

        // ... Reste du code de l'envoi HTTP, qui est correct ...

        while (attempt < maxAttempts && !success) {
            attempt++;
            try {
                log(`[Tentative ${attempt}/${maxAttempts}] Envoi de la requête de génération.`);

                const resp = await fetch(`${API_BASE_URL}/generate?workflow_name=${encodeURIComponent(wfName)}`, { method: "POST", headers: { ...authHeaders() }, body: formData });

                if (!resp.ok) {
                    // ... (gestion des erreurs de tentative) ...
                    log(`Tentative ${attempt} → HTTP ${resp.status}`);
                    if (attempt < maxAttempts) {
                        await new Promise(r => setTimeout(r, 5000));
                        continue;
                    } else {
                        throw new Error(`Échec après plusieurs tentatives. (HTTP ${resp.status})`);
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
                log(`Tentative ${attempt}/${maxAttempts} : Échec.`);

                if (attempt >= maxAttempts) {
                    setError(`❌ Échec de l’envoi initial de la tâche au serveur API.`);
                }

                await new Promise(r => setTimeout(r, 5000));
            }
        }

        if (success && finalPromptId) {
            currentPromptId = finalPromptId;
            log("Prompt ID final:", finalPromptId);
            pollProgress(finalPromptId);
        } else {
            showProgressOverlay(false);
        }

    } catch (globalErr) {
        console.warn("Generation stopped early:", globalErr.message);
        if (!document.getElementById("error-box")?.textContent) {
            setError(`Erreur d'initialisation : ${globalErr.message}`);
        }
        showProgressOverlay(false);
        
    } finally {
        if (currentBtn) {
            currentBtn.disabled = false;
            currentBtn.querySelector(".dot").style.background = "rgba(15,23,42,0.9)";
            currentBtn.innerHTML = `<span class="dot"></span>Démarrer la génération`;
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
// 🔓 LOGOUT
// =========================================================
const logoutBtn = document.getElementById("logout-btn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    console.log("🔓 Déconnexion utilisateur");

    // Supprime le token
    localStorage.removeItem("google_id_token");

    // Redirection vers la page login
    window.location.replace("login.html");
  });
}
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
    // RANDOM AFFICHE — CHARGEMENT + REMPLISSAGE SEUL
    // =========================================================

    const randomBtn = document.getElementById("affiche-random-btn");
    if (randomBtn && formEl) {
        randomBtn.addEventListener("click", async () => {
            console.log("🎲 Clic random détecté !");

            const data = await loadRandomAfficheJSON();
            if (!data) return;

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
            generateAffichePrompt(); 
            
            randomBtn.classList.add("clicked");
            randomBtn.innerHTML = "🎲 Champs remplis !";
            setTimeout(() => {
                randomBtn.classList.remove("clicked");
                randomBtn.innerHTML = "🎲 Aléatoire";
            }, 600);
            
            console.log("🎲 Champs affiche remplis aléatoirement:", randomObj);
        });
    }

    // =========================================================
    // GENERATE PROMPT BUTTON LISTENER (PROMPT SEUL)
    // =========================================================

    const btnPrompt = document.getElementById("affiche-generate-btn");
    if (btnPrompt && formEl) {
        btnPrompt.addEventListener("click", () => {
            
            generateAffichePrompt(); // Met à jour le champ
            
            btnPrompt.classList.add("clicked");
            btnPrompt.innerHTML = "✨ Prompt généré !";
            setTimeout(() => {
                btnPrompt.classList.remove("clicked");
                btnPrompt.innerHTML = "✨ Générer le prompt de l’affiche";
            }, 600);
        });
    }

    // =========================================================
// ACTIVATION DES MENUS & BOUTONS (AFFICHE / IMAGE)
// =========================================================

const modeCards = document.querySelectorAll(".mode-card");
const afficheMenu = document.getElementById("affiche-menu");
const generateButton = document.getElementById("generate-button");
const afficheGenerateBtnWrapper = document.getElementById("affiche-generate-button-wrapper");

modeCards.forEach(card => {
    card.addEventListener("click", () => {
        const mode = card.dataset.mode;

        // Visuel actif
        modeCards.forEach(c => c.classList.remove("active-mode"));
        card.classList.add("active-mode");

        if (mode === "affiche") {
            afficheMenu.style.display = "block";
            selectWorkflow("affiche.json");

            if (generateButton) generateButton.style.display = "block";
            if (afficheGenerateBtnWrapper) afficheGenerateBtnWrapper.style.display = "block";
        } else {
            afficheMenu.style.display = "none";

            if (generateButton) generateButton.style.display = "block";
            if (afficheGenerateBtnWrapper) afficheGenerateBtnWrapper.style.display = "none";
        }
    });
});

// =========================================================
// INITIALISATION FINALE
// =========================================================

// Simuler un clic sur la carte active par défaut
const defaultModeCard = document.querySelector(".mode-card.active-mode");
if (defaultModeCard) {
    defaultModeCard.dispatchEvent(new Event("click"));
}
// Rétablissement de la visibilité des conteneurs principaux (utilise de nouveaux noms de variables)
    var _resultAreaFix = document.getElementById("result-area");
    var _generateButtonFix = document.getElementById("generate-btn"); 
    if (_resultAreaFix) _resultAreaFix.style.display = 'block';
    if (_generateButtonFix) _generateButtonFix.style.display = 'block';
// GPU
refreshGPU();
setInterval(refreshGPU, 10000);

// Données
loadWorkflows();
loadCarrouselGallery();
// =========================================================
// IMAGE MODAL (GALERIE) — FERMETURE
// =========================================================

const galleryModal = document.getElementById("image-modal");
const galleryModalImg = document.getElementById("image-modal-img");
const galleryModalClose = document.querySelector(".image-modal-close");

if (galleryModal) {

  // ❌ clic sur la croix
  if (galleryModalClose) {
    galleryModalClose.addEventListener("click", (e) => {
      e.stopPropagation();
      galleryModal.style.display = "none";
      if (galleryModalImg) galleryModalImg.src = "";
    });
  }

  // ❌ clic hors image
  galleryModal.addEventListener("click", (e) => {
    if (e.target === galleryModal) {
      galleryModal.style.display = "none";
      if (galleryModalImg) galleryModalImg.src = "";
    }
  });

  // ❌ touche ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && galleryModal.style.display === "flex") {
      galleryModal.style.display = "none";
      if (galleryModalImg) galleryModalImg.src = "";
    }
  });
}

});




// =========================================================
// 🔧 NON-DESTRUCTIVE FIXES (APPENDED)
// These fixes DO NOT remove any existing logic.
// They only patch modal, download, mobile behavior,
// and prevent duplicated handlers from breaking UX.
// =========================================================

// ---- Central image modal (safe override) ----
function openImageModal(src) {
  const modal = document.getElementById("image-modal");
  const img = document.getElementById("image-modal-img");
  const dl = document.getElementById("image-modal-download");
  if (!modal || !img || !dl) return;

  img.src = src;
  dl.href = src;

  const filename = src.startsWith("data:")
    ? "generated-image.png"
    : src.split("/").pop().split("?")[0];

  dl.setAttribute("download", filename);
  modal.classList.add("active");
}

// ---- Patch displayImageAndMetadata without removing existing calls ----
(function () {
  const _orig = window.displayImageAndMetadata;
  if (typeof _orig !== "function") return;

  window.displayImageAndMetadata = function (data) {
    _orig(data);

    try {
      const resultArea = document.getElementById("result-area");
      if (!resultArea) return;
      const img = resultArea.querySelector("img.result-image");
      if (!img) return;

      img.style.cursor = "zoom-in";
      img.onclick = () => openImageModal(img.src);

      const isMobile = window.matchMedia("(max-width: 900px)").matches;
      if (isMobile) {
        openImageModal(img.src);
      }
    } catch (e) {
      console.warn("Modal patch failed:", e);
    }
  };
})();

// ---- Progress overlay: force modal mode on mobile ----
(function () {
  const _origShow = window.showProgressOverlay;
  if (typeof _origShow !== "function") return;

  window.showProgressOverlay = function (show, label) {
    _origShow(show, label);
    const overlay = document.getElementById("progress-overlay");
    if (!overlay) return;
    if (show) overlay.classList.add("active");
    else overlay.classList.remove("active");
  };
})();

// ---- Modal close (idempotent) ----
document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("image-modal");
  const close = document.querySelector(".image-modal-close");
  if (!modal || !close) return;

  close.onclick = (e) => {
    e.stopPropagation();
    modal.classList.remove("active");
  };

  modal.onclick = (e) => {
    if (e.target === modal) modal.classList.remove("active");
  };

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") modal.classList.remove("active");
  });
});

// =========================================================
// END OF NON-DESTRUCTIVE FIXES
// =========================================================
// =========================================================
// ✅ MOBILE: rester en modal après génération + ouvrir résultat
// =========================================================
(function () {
  const _orig = window.displayImageAndMetadata;
  if (typeof _orig !== "function") return;

  window.displayImageAndMetadata = function (data) {
    _orig(data);

    const isMobile = window.matchMedia("(max-width: 900px)").matches;
    if (!isMobile) return;

    // On garde l’overlay actif en mobile (fond sombre + flou)
    if (typeof window.showProgressOverlay === "function") {
      window.showProgressOverlay(true, "Done");
    }

    // On force la barre à 100% si elle existe
    const inner = document.getElementById("progress-inner");
    const pct = document.getElementById("progress-percent");
    if (inner) inner.style.width = "100%";
    if (pct) pct.textContent = "100%";

    // Ouvrir le résultat en modal, sans quitter l’ambiance
    const resultArea = document.getElementById("result-area");
    const img = resultArea ? resultArea.querySelector("img.result-image") : null;
    if (img && typeof window.openImageModal === "function") {
      window.openImageModal(img.src);
    }
  };
})();
// =========================================================
// ✅ DOWNLOAD: ne jamais télécharger la page HTML
// =========================================================
(function () {
  const _orig = window.openImageModal;
  if (typeof _orig !== "function") return;

  window.openImageModal = function (src) {
    _orig(src);

    const dl = document.getElementById("image-modal-download");
    if (!dl) return;

    // Force href correct (sinon certains navigateurs retombent sur la page)
    dl.href = src;

    const filename = src.startsWith("data:")
      ? "generated-image.png"
      : src.split("/").pop().split("?")[0] || "image.png";

    dl.setAttribute("download", filename);

    // Protection: si href n’est pas une image => on bloque
    dl.onclick = (e) => {
      const h = dl.getAttribute("href") || "";
      if (!h || h === "#" || h.includes(".html")) {
        e.preventDefault();
        console.warn("Download blocked: href not an image", h);
      }
    };
  };
})();
