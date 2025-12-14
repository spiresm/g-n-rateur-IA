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
// - Lit /carrousel.json (liste de fichiers HD)
// - Affiche les vignettes *_thumb.jpg (9/16)
// - Au clic: affiche l'image HD dans #result-area
// =========================================================

async function loadCarrouselGallery() {
  console.log("🟢 loadCarrouselGallery START");

  let images;
  try {
    const resp = await fetch("/carrousel.json");
    images = await resp.json();
  } catch (e) {
    console.error("❌ Cannot load carrousel.json", e);
    return;
  }

  const gallery = document.getElementById("gallery-grid");
  if (!gallery) {
    console.error("❌ #gallery-grid NOT FOUND");
    return;
  }

  gallery.innerHTML = "";

  images.forEach(filename => {
    const fullPath = `/carrousel/${encodeURIComponent(filename)}`;
    const thumbPath = `/carrousel/${encodeURIComponent(
      filename.replace(/\.png$/i, "_thumb.jpg")
    )}`;

    const thumb = document.createElement("img");
    thumb.src = thumbPath;
    thumb.className = "gallery-thumb";
    thumb.loading = "lazy";
    thumb.alt = filename;

    thumb.onerror = () => {
      console.warn("❌ Thumb not found:", thumbPath);
    };

    // ✅ CLIC → OUVERTURE MODAL (PAS PREVIEW)
    thumb.addEventListener("click", () => {
      openImageModal(fullPath);
    });

    gallery.appendChild(thumb);
  });

  console.log("✅ gallery populated");
}

// =========================================================
// 🆕 LISTE DES STYLES DE TITRE
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
// 🧩 DOM READY (INJECTION ET QUICK FORMAT)
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
  // 🧩 QUICK FORMAT BUTTONS
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
    const sdxlPanel = document.getElementById("group-quality-sdxl"); // Correction: utiliser l'ID correct
    const promptSection = document.getElementById("prompt-section");

    const afficheMenu = document.getElementById("affiche-menu");
    const quickFormatImage = document.getElementById("quick-format-image");
    const quickFormatAffiche = document.getElementById("quick-format-affiche");

    if (workflowName === "affiche.json") {
        if (afficheMenu) afficheMenu.style.display = "block";
        if (quickFormatAffiche) quickFormatAffiche.style.display = "block";
        if (quickFormatImage) quickFormatImage.style.display = "none";
        if (promptSection) promptSection.style.display = "none"; // Masquer le prompt standard en mode affiche
        
        // Mise à jour de la résolution pour l'affiche (format vertical 9:16)
        const wInput = document.getElementById("width-input");
        const hInput = document.getElementById("height-input");
        if (wInput) wInput.value = "1080";
        if (hInput) hInput.value = "1920";

        // Mettre à jour l'état visuel des Quick Format (pour l'affiche)
        const fmtIcons = document.querySelectorAll("#quick-format-affiche .fmt-icon");
        fmtIcons.forEach(icon => {
            icon.classList.remove("active");
            if (icon.dataset.w === "1080" && icon.dataset.h === "1920") {
                icon.classList.add("active");
            }
        });

        // Masquer les options inutiles pour l'affiche
        if (groupSteps) groupSteps.style.display = "none";
        if (groupCfg) groupCfg.style.display = "none";
        if (groupSampler) groupSampler.style.display = "none";
        if (seedSection) seedSection.style.display = "none";
        if (sdxlPanel) sdxlPanel.style.display = "none";
        if (checkpointWrapper) checkpointWrapper.style.display = "none";

    } else {
        if (afficheMenu) afficheMenu.style.display = "none";
        if (quickFormatAffiche) quickFormatAffiche.style.display = "none";
        if (quickFormatImage) quickFormatImage.style.display = "block";
        if (promptSection) promptSection.style.display = "block"; // Afficher le prompt standard

        // Afficher les options avancées en mode normal (si elles existent)
        if (groupSteps) groupSteps.style.display = "block";
        if (groupCfg) groupCfg.style.display = "block";
        if (groupSampler) groupSampler.style.display = "block";
        if (seedSection) seedSection.style.display = "block";
        if (sdxlPanel) sdxlPanel.style.display = "block";
        if (checkpointWrapper) checkpointWrapper.style.display = "block";

        // Mettre à jour l'état visuel des Quick Format (pour l'image)
        const fmtIcons = document.querySelectorAll("#quick-format-image .fmt-icon");
        fmtIcons.forEach(icon => icon.classList.remove("active"));
        // Simuler la sélection du format par défaut 1:1
        document.querySelector('#quick-format-image .fmt-icon[data-w="1024"][data-h="1024"]')?.classList.add("active");

        // Rétablir la résolution par défaut (si non définie par Quick Format)
        const wInput = document.getElementById("width-input");
        const hInput = document.getElementById("height-input");
        if (wInput) wInput.value = "1024";
        if (hInput) hInput.value = "1024";
    }

    // Afficher/Masquer les champs d'image en fonction du workflow (à adapter si le backend donne cette info)
    const usesInputImage = workflowName.includes("img2img") || workflowName.includes("controlnet");
    if (inputImageSection) inputImageSection.style.display = usesInputImage ? "block" : "none";
    if (videoParamsSection) videoParamsSection.style.display = workflowName.includes("video") ? "block" : "none";
}


// =========================================================
// IMAGE MODAL — OUVERTURE CENTRALISÉE (AVEC PATCH INTÉGRÉ)
// =========================================================

function openImageModal(src) {
    const modal = document.getElementById("image-modal");
    const img = document.getElementById("image-modal-img");
    const dl = document.getElementById("image-modal-download");

    if (!modal || !img || !dl) return;

    img.src = src;
    dl.href = src;
    
    // Logique de nom de fichier robuste (intégré du patch)
    const filename = src.startsWith("data:")
      ? "generated-image.png"
      : src.split("/").pop().split("?")[0] || "image.png";

    dl.setAttribute("download", filename);

    // Protection: si href n’est pas une image => on bloque (intégré du patch)
    dl.onclick = (e) => {
      const h = dl.getAttribute("href") || "";
      if (!h || h === "#" || h.includes(".html")) {
        e.preventDefault();
        console.error("❌ Download bloqué: le lien n'est pas une image valide.");
        alert("Erreur de téléchargement: le lien n'est pas une image valide.");
      }
    };

    modal.style.display = "flex";
}

// =========================================================
// CLOSE MODAL LOGIC (Move here for better structure)
// =========================================================
document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("image-modal");
    const closeBtn = document.querySelector(".image-modal-close");

    if (modal) {
        // Fermeture au clic sur le bouton X
        if (closeBtn) {
            closeBtn.addEventListener("click", () => {
                modal.style.display = "none";
            });
        }
        // Fermeture au clic en dehors de l'image
        modal.addEventListener("click", (ev) => {
            if (ev.target === modal) {
                modal.style.display = "none";
            }
        });
    }
});


// =========================================================
// GESTION DU PROMPT DE L’AFFICHE (Merge Select & Custom logic)
// =========================================================

function mergeSelectAndCustom(selectId, customId) {
    const selectEl = document.getElementById(selectId);
    const customEl = document.getElementById(customId);
    if (customEl && customEl.value.trim() !== "") {
        return customEl.value.trim();
    }
    return selectEl ? selectEl.value : "";
}

function generateAffichePrompt() {
    const titre = document.getElementById("aff_titre")?.value.trim() || "";
    const sousTitre = document.getElementById("aff_sous_titre")?.value.trim() || "";
    const tagline = document.getElementById("aff_tagline")?.value.trim() || "";

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
        const relevantOptions = options.filter(opt => opt.value && opt.value !== 'aleatoire' && opt.textContent !== 'Choose…');

        if (relevantOptions.length > 0) {
            const randomIndex = Math.floor(Math.random() * relevantOptions.length);
            styleTitre = relevantOptions[randomIndex].value;
            styleSelect.value = styleTitre; // Mise à jour visuelle
            log(`Style de titre aléatoire sélectionné : ${relevantOptions[randomIndex].textContent}`);
        } else {
            styleTitre = "cinematic, elegant contrast"; // Valeur de repli
        }
    }

    const hasTitle = Boolean(titre);
    const hasSubtitle = Boolean(sousTitre);
    const hasTagline = Boolean(tagline);
    
    // Construction du Prompt
    const promptParts = [];

    // 1. Style / Base
    promptParts.push(`A stunning, intricate, high-quality, cinematic poster for a movie, highly detailed typography, dramatic lighting.`);

    // 2. Texte de l'affiche
    const textElements = [];
    if (hasTitle) textElements.push(`Main Title: "${titre}" in ${styleTitre} style.`);
    if (hasSubtitle) textElements.push(`Subtitle: "${sousTitre}".`);
    if (hasTagline) textElements.push(`Tagline: "${tagline}".`);
    
    if (textElements.length > 0) {
        promptParts.push("WITH TEXT ELEMENTS: " + textElements.join(" | "));
    } else {
        promptParts.push(`WITHOUT TEXT (typography will be generated by the model based on ${styleTitre} style)`);
    }

    // 3. Description de l'image
    const descElements = [];
    if (perso) descElements.push(`Main character: ${perso}`);
    if (action) descElements.push(`Action: ${action}`);
    if (env) descElements.push(`Environment: ${env}`);
    if (ambiance) descElements.push(`Mood/Atmosphere: ${ambiance}`);
    if (theme) descElements.push(`Theme: ${theme}`);
    if (palette) descElements.push(`Color palette: ${palette}`);
    
    promptParts.push(descElements.join(", "));

    // 4. Finalisation
    promptParts.push("Vertical poster art, 9:16 aspect ratio.");


    const finalPrompt = promptParts.join(" | ").trim().replace(/, \s*\|/g, " |").replace(/\| \s*,/g, "|");

    const promptArea = document.getElementById("prompt");
    if (promptArea) {
        promptArea.value = finalPrompt;
        log("Prompt Affiche généré et injecté.");
    }

    return finalPrompt;
}

// =========================================================
// HANDLE COMPLETION & FETCH RESULT
// =========================================================

const MAX_FETCH_ATTEMPTS = 5;
const RETRY_DELAY_MS = 2000;

async function fetchResult(promptId) {
  const statusPill = document.getElementById("job-status-pill");
  for (let attempt = 1; attempt <= MAX_FETCH_ATTEMPTS; attempt++) {
    try {
      const resp = await fetch(`${API_BASE_URL}/result/${promptId}`, {
        headers: authHeaders()
      });

      if (resp.ok) {
        const data = await resp.json();
        return data.result; // Contient l'URL de l'image (base64 ou chemin)
      } else {
        // Tente de récupérer l'erreur JSON si possible
        let errorText = `[FETCH RESULT] HTTP non OK: ${resp.status}`;
        try {
            const errData = await resp.json();
            errorText = errData.error || errorText;
        } catch {}
        throw new Error(errorText);
      }
    } catch (e) {
      log(`[FETCH RESULT] Erreur: ${e.message}. Tentative ${attempt}/${MAX_FETCH_ATTEMPTS}.`);
      if (attempt === MAX_FETCH_ATTEMPTS) {
        throw new Error(`Échec de la récupération du résultat après ${MAX_FETCH_ATTEMPTS} tentatives. Dernière erreur: ${e.message}`);
      }
      await new Promise(r => setTimeout(r, RETRY_DELAY_MS));
    }
  }
}

async function handleCompletion(promptId) {
    showProgressOverlay(true, "Finalisation de l'image...");
    const statusPill = document.getElementById("job-status-pill");
    
    try {
        const imageUrl = await fetchResult(promptId);
        
        if (!imageUrl) {
            throw new Error("L'API n'a pas retourné d'URL d'image.");
        }

        updateResultArea({ url: imageUrl });

        log("✅ Génération terminée et image affichée.");
        showProgressOverlay(false); // Masquer l'overlay

        if (statusPill) {
            statusPill.textContent = "DONE";
            statusPill.classList.remove("pill", "pill-danger", "pill-warning");
            statusPill.classList.add("pill-green");
        }
        
    } catch (e) {
        console.error("Erreur handleCompletion:", e);
        showProgressOverlay(false);
        setError(e.message || "Erreur lors de la récupération de l’image générée.");
        if (statusPill) {
            statusPill.textContent = "FAILED";
            statusPill.classList.remove("pill", "pill-green", "pill-warning");
            statusPill.classList.add("pill-danger");
        }
    }
}

// =========================================================
// GESTION DU POLLING DE LA PROGRESSION
// =========================================================

async function pollProgress(promptId) {
    log("Démarrage du polling pour le Prompt ID:", promptId);

    // Initialisation du compteur
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

    pollingFailureCount = 0; // Réinitialisation du compteur d'erreurs

    pollingProgressInterval = setInterval(async () => {
        // Animation FAKE jusqu'à 92 % (pour donner un feedback)
        fakeProgress = Math.min(fakeProgress + 7, 92);
        if (percentSpan) percentSpan.textContent = fakeProgress + "%";
        if (innerBar) innerBar.style.width = fakeProgress + "%";

        // Test direct si le résultat est disponible
        try {
            const resCheck = await fetch(`${API_BASE_URL}/progress/${promptId}`, {
                headers: authHeaders()
            });

            if (resCheck.ok) {
                pollingFailureCount = 0; // Succès : Réinitialise le compteur d'erreurs
                const data = await resCheck.json();

                if (data.status && data.status.completed) {
                    clearInterval(pollingProgressInterval);
                    pollingProgressInterval = null;
                    // On délègue la récupération finale au gestionnaire
                    handleCompletion(promptId);
                    return;
                }
                
                // Si la progression est fournie par l'API, on utilise la vraie valeur
                if (data.status && data.status.progress) {
                    const realProgress = Math.min(95, Math.max(fakeProgress, Math.floor(data.status.progress * 100)));
                    fakeProgress = realProgress; // Synchroniser la fausse progression avec la vraie
                    if (percentSpan) percentSpan.textContent = realProgress + "%";
                    if (innerBar) innerBar.style.width = realProgress + "%";
                }

            } else {
                // Si la réponse HTTP n'est pas OK (ex: 404, 500)
                pollingFailureCount++;
                log(`[POLL ERROR] HTTP non OK: ${resCheck.status}. Tentative d'arrêt: ${pollingFailureCount}/${MAX_POLLING_FAILURES}`);

                if (pollingFailureCount >= MAX_POLLING_FAILURES) {
                    clearInterval(pollingProgressInterval);
                    pollingProgressInterval = null;
                    setError("Le serveur ne répond plus pour la progression. La tâche a peut-être échoué côté serveur.");
                    showProgressOverlay(false);
                }
            }
        } catch (e) {
            pollingFailureCount++;
            log(`[POLL ERROR] Erreur réseau/JSON: ${e.message}. Tentative d'arrêt: ${pollingFailureCount}/${MAX_POLLING_FAILURES}`);
            if (pollingFailureCount >= MAX_POLLING_FAILURES) {
                clearInterval(pollingProgressInterval);
                pollingProgressInterval = null;
                setError("Erreur de connexion au serveur de progression.");
                showProgressOverlay(false);
            }
        }
    }, POLLING_INTERVAL_MS);
}


// =========================================================
// MISE À JOUR DE LA ZONE DE RÉSULTAT
// =========================================================

function updateResultArea({ url, prompt = "", negativePrompt = "" }) {
    const resultArea = document.getElementById("result-area");
    const imgEl = resultArea ? resultArea.querySelector("img.result-image") : null;
    const msgEl = document.getElementById("result-message");
    const downloadLink = document.getElementById("image-modal-download-link");

    if (!imgEl || !msgEl || !downloadLink) return;

    // Affiche l'image
    imgEl.src = url;
    imgEl.style.display = "block";
    msgEl.style.display = "none";
    
    // Met à jour le bouton de téléchargement direct
    downloadLink.href = url;
    downloadLink.style.display = "flex";

    // Si le résultat est base64, force le nom de fichier
    const filename = url.startsWith("data:")
      ? "generated-image.png"
      : url.split("/").pop().split("?")[0] || "image.png";

    downloadLink.setAttribute("download", filename);


    // Met à jour les prompts (si fournis, pour la recopie)
    const promptArea = document.getElementById("prompt");
    const negativePromptArea = document.getElementById("negative_prompt");

    if (promptArea && prompt) {
        promptArea.value = prompt;
    }
    if (negativePromptArea && negativePrompt) {
        negativePromptArea.value = negativePrompt;
    }

    log(`Image affichée. URL: ${url.substring(0, 50)}...`);
}

// =========================================================
// ✅ PATCH: ZOOM au clic sur l'image (mobile) - CONSERVÉ
// Modifie updateResultArea pour ajouter le zoom et l'ouverture auto sur mobile
// =========================================================
(function () {
  const _orig = window.updateResultArea;
  if (typeof _orig !== "function") {
    // Si updateResultArea n'est pas définie (devrait l'être), on crée une version de base
    window.updateResultArea = function(data) {
        updateResultArea(data); // Utilise la fonction juste au-dessus
    };
  }

  window.updateResultArea = function (data) {
    _orig(data); // Exécuter la fonction originale (celle du bloc précédent)

    try {
      const resultArea = document.getElementById("result-area");
      if (!resultArea) return;
      const img = resultArea.querySelector("img.result-image");
      if (!img) return;

      img.style.cursor = "zoom-in";
      // Ouvre la modale en grand au clic sur l'image de prévisualisation
      img.onclick = () => openImageModal(img.src);

      // Ouverture automatique de la modale en grand format sur mobile (pour mieux voir le résultat)
      const isMobile = window.matchMedia("(max-width: 900px)").matches;
      if (isMobile) {
        openImageModal(img.src);
      }
    } catch (e) {
      console.warn("Modal patch failed:", e);
    }
  };
})();

// =========================================================
// START GENERATION (Handle Form Submission)
// =========================================================

async function startGeneration(event) {
    event.preventDefault();
    setError("");

    const formEl = event.target;
    let formData;
    let finalPromptText = "";
    const currentBtn = document.getElementById("generate-button");

    if (currentBtn) {
        currentBtn.disabled = true;
        currentBtn.querySelector(".dot").style.background = "#fff"; // White dot while working
        currentBtn.innerHTML = `<span class="dot" style="animation: pulse 1.5s infinite;"></span>Envoi au serveur...`;
    }

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
            const generatedPrompt = generateAffichePrompt(); // Récupère le prompt généré
            formData.set('prompt', generatedPrompt); // 🔥 INJECTION DIRECTE dans le FormData
            finalPromptText = generatedPrompt;
        } else {
            // Pour tous les autres workflows, on utilise la valeur du textarea
            finalPromptText = formData.get('prompt');
        }

        // --- ENVOI AU SERVEUR ---
        let finalPromptId = null;
        let success = false;
        
        for (let attempt = 0; attempt < 3; attempt++) {
            try {
                const resp = await fetch(`${API_BASE_URL}/prompt`, {
                    method: "POST",
                    headers: { ...authHeaders() },
                    body: formData,
                });

                if (resp.ok) {
                    const data = await resp.json();
                    finalPromptId = data.prompt_id;
                    success = true;
                    break; // Sortir de la boucle de ré-essai
                } else {
                    const errorData = await resp.json();
                    throw new Error(errorData.error || `Erreur HTTP ${resp.status}`);
                }
            } catch (e) {
                log(`[SUBMIT ERROR] Échec de l’envoi (Tentative ${attempt + 1}/3): ${e.message}`);
                setError(`❌ Échec de l’envoi initial de la tâche au serveur API.`);
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

function getRandomElement(arr) {
    if (!arr || arr.length === 0) return "";
    return arr[Math.floor(Math.random() * arr.length)];
}

async function generateRandomAffiche() {
    const data = await loadRandomAfficheJSON();
    if (!data) return;

    // 1. Piocher des valeurs aléatoires
    const randomTheme = getRandomElement(data.themes);
    const randomAmbiance = getRandomElement(data.ambiances);
    const randomPerso = getRandomElement(data.personnages);
    const randomEnv = getRandomElement(data.environnements);
    const randomAction = getRandomElement(data.actions);
    const randomPalette = getRandomElement(data.palettes);
    const randomTitle = getRandomElement(data.titres);
    const randomSubtitle = getRandomElement(data.sousTitres);
    const randomTagline = getRandomElement(data.taglines);
    // Le style de titre sera géré automatiquement par generateAffichePrompt (option 'Random Style')

    // 2. Mettre à jour les champs de l'interface
    document.getElementById("aff_theme").value = randomTheme || "";
    document.getElementById("aff_theme_custom").value = "";
    document.getElementById("aff_ambiance").value = randomAmbiance || "";
    document.getElementById("aff_ambiance_custom").value = "";
    document.getElementById("aff_perso_sugg").value = randomPerso || "";
    document.getElementById("aff_perso_desc").value = "";
    document.getElementById("aff_env_sugg").value = randomEnv || "";
    document.getElementById("aff_env_desc").value = "";
    document.getElementById("aff_action_sugg").value = randomAction || "";
    document.getElementById("aff_action_desc").value = "";
    document.getElementById("aff_palette").value = randomPalette || "";
    document.getElementById("aff_palette_custom").value = "";
    document.getElementById("aff_style_titre").value = "aleatoire"; // Force le style aléatoire

    // Remplir les champs texte
    document.getElementById("aff_titre").value = randomTitle || "";
    document.getElementById("aff_sous_titre").value = randomSubtitle || "";
    document.getElementById("aff_tagline").value = randomTagline || "";
    
    log("🎲 Paramètres aléatoires appliqués.");
    
    // 3. Générer le prompt (mettra à jour le champ prompt et choisira le style de titre)
    generateAffichePrompt();
}


// =========================================================
// UTILITAIRES DIVERS
// =========================================================

// Fonction pour effacer le champ custom si une option de select est choisie
function autoClearOnSelect(selectId, customId) {
    const selectEl = document.getElementById(selectId);
    const customEl = document.getElementById(customId);
    if (selectEl && customEl) {
        selectEl.addEventListener("change", () => {
            if (selectEl.value !== "") {
                customEl.value = "";
            }
        });
    }
}

function handleCopyParams() {
    const formEl = document.getElementById("generation-form");
    if (!formEl) return;
    
    // Récupérer les données
    const prompt = document.getElementById("prompt")?.value || "";
    const negativePrompt = document.getElementById("negative_prompt")?.value || "";
    const steps = document.getElementById("steps-slider")?.value || "—";
    const cfgScale = document.getElementById("cfg_scale-slider")?.value || "—";
    const sampler = document.getElementById("sampler-select")?.value || "—";
    const checkpoint = document.getElementById("checkpoint-select")?.value || "—";

    // Construire le texte
    const params = `
Prompt:
${prompt}

Negative Prompt:
${negativePrompt}

--- Settings ---
Model: ${checkpoint}
Sampler: ${sampler}
Steps: ${steps}
CFG Scale: ${cfgScale}
`;

    navigator.clipboard.writeText(params.trim())
        .then(() => {
            log("Paramètres copiés dans le presse-papiers.");
            const btn = document.getElementById("copy-params-btn");
            const originalText = btn.innerHTML;
            btn.innerHTML = "✅ Copié !";
            setTimeout(() => {
                btn.innerHTML = originalText;
            }, 1500);
        })
        .catch(err => {
            console.error('Erreur de copie:', err);
            alert("Erreur lors de la copie des paramètres.");
        });
}

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

const copyBtn = document.getElementById("copy-params-btn");
if (copyBtn) {
    copyBtn.addEventListener("click", handleCopyParams);
}

// Listener pour le bouton de génération de prompt de l'affiche
const btnPrompt = document.getElementById("generate-affiche-prompt-btn");
if (btnPrompt) {
    btnPrompt.addEventListener("click", () => {
        generateAffichePrompt();
        btnPrompt.classList.add("clicked");
        btnPrompt.innerHTML = "✅ Prompt généré !";
        setTimeout(() => {
            btnPrompt.classList.remove("clicked");
            btnPrompt.innerHTML = "✨ Générer le prompt de l’affiche";
        }, 600);
    });
}

// Listener pour le bouton de génération d'affiche aléatoire
const randomBtn = document.getElementById("affiche-random-btn");
if (randomBtn) {
    randomBtn.addEventListener("click", async () => {
        await generateRandomAffiche();
        randomBtn.classList.add("clicked");
        randomBtn.innerHTML = "✅ Aléatoire appliqué !";
        setTimeout(() => {
            randomBtn.classList.remove("clicked");
            randomBtn.innerHTML = "🎲 Generate Random Poster";
        }, 600);
    });
}

// =========================================================
// ACTIVATION DES MENUS & BOUTONS (AFFICHE / IMAGE)
// =========================================================
const modeCards = document.querySelectorAll(".mode-card");
modeCards.forEach(card => {
    card.addEventListener("click", () => {
        const mode = card.dataset.mode;
        // Visuel actif
        modeCards.forEach(c => c.classList.remove("active-mode"));
        card.classList.add("active-mode");

        // Afficher/masquer les menus et sélectionner le workflow par défaut du mode
        if (mode === "affiche") {
            selectWorkflow("affiche.json");
        } else {
            // Workflow par défaut pour l'image (à adapter si un autre est nécessaire)
            selectWorkflow("sdxl_turbo.json"); 
        }
    });
});

// =========================================================
// INITIALISATION FINALE
// =========================================================
// 1. Rafraîchir le statut GPU et les workflows
refreshGPU();
loadWorkflows();

// 2. Simuler un clic sur la carte active par défaut (pour initialiser les contrôles)
document.addEventListener("DOMContentLoaded", () => {
    const defaultModeCard = document.querySelector(".mode-card.active-mode");
    if (defaultModeCard) {
        defaultModeCard.click();
    }
    // Charger la galerie après l'initialisation des autres éléments
    loadCarrouselGallery(); 
});
