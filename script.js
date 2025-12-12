// =========================================================
// CONFIGURATION (FRONTEND)
// =========================================================

const API_BASE_URL = "https://g-n-rateur-backend-1.onrender.com";
const FRONTEND_URL = "https://genrateuria.netlify.app"; 

// =========================================================
// 🛡️ AUTHENTICATION FUNCTIONS (CORRIGÉES POUR STOPPER LA BOUCLE)
// =========================================================

function handleTokenTransferFromURL() {
    const urlParams = new URLSearchParams(window.location.search);

    if (urlParams.has('token')) {
        const token = urlParams.get('token');
        localStorage.setItem('google_auth_token', token);
        console.log("Token d'authentification enregistré depuis l'URL.");

        // 1. Nettoie l'URL (enlève ?token=...) sans recharger
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // 2. Redirige IMMÉDIATEMENT vers la page principale
        // On utilise location.replace pour ne pas polluer l'historique de navigation
        window.location.replace(FRONTEND_URL + "/index.html"); 
        
        // 🚨 CRITIQUE : Retourne VRAI pour stopper l'exécution du reste du script
        return true; 
    }
    
    if (urlParams.has('error')) {
        console.error("Erreur d'authentification reçue:", urlParams.get('error'));
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    return false;
}

function logout() {
    localStorage.removeItem('google_auth_token');
    // Redirige vers la page de connexion
    window.location.replace(FRONTEND_URL + "/login.html");
}

function checkAuthenticationAndDisplayUI() {
    const token = localStorage.getItem('google_auth_token');
    
    // NOUVELLE MÉTHODE : Vérifie si l'URL contient '/login.html' (plus robuste)
    // Utile si le script est chargé sur login.html ou index.html
    const isLoginPage = window.location.pathname.includes('/login.html');
    
    // Éléments UI (même si le reste du script est incomplet, ces sélecteurs sont généralement corrects)
    const logoutButton = document.getElementById('logout-button');
    const mainContent = document.getElementById('main-content-wrapper');
    const sidebar = document.getElementById('sidebar');
    const loginLink = document.getElementById('login-link'); 
    const errorBox = document.getElementById('error-box');


    // Initialisation UI
    if (mainContent) mainContent.style.display = 'none'; 
    if (sidebar) sidebar.style.display = 'none';
    if (errorBox) errorBox.style.display = 'none';
    if (loginLink) loginLink.style.display = 'none';
    if (logoutButton) logoutButton.style.display = 'none';
    if (loginLink) loginLink.href = `${API_BASE_URL}/auth/google`;


    if (token) {
        // --- UTILISATEUR CONNECTÉ ---
        
        // Si la page est 'login.html', rediriger vers l'application
        if (isLoginPage) {
            console.log("Connecté, redirection vers l'application.");
            // Utilise location.replace pour ne pas polluer l'historique
            window.location.replace(FRONTEND_URL + "/index.html"); 
            return true; // Bloque l'affichage du contenu de login.html
        }

        // Sinon, afficher l'UI d'application (index.html)
        if (logoutButton) logoutButton.style.display = 'block';
        if (mainContent) mainContent.style.display = 'block';
        if (sidebar) sidebar.style.display = 'block'; 

        console.log("Utilisateur authentifié sur l'application.");
        return true;
    } else {
        // --- UTILISATEUR DÉCONNECTÉ ---
        
        // S'il n'est PAS sur la page de connexion, rediriger
        if (!isLoginPage) {
            console.log("Aucun jeton d'authentification trouvé. Redirection vers la page de connexion.");
            window.location.replace(FRONTEND_URL + "/login.html");
            return false; // Bloque l'affichage du contenu de index.html
        }
        
        // S'il est sur login.html, afficher le bouton de connexion
        if (loginLink) loginLink.style.display = 'block';

        console.log("Page de connexion affichée.");
        return false;
    }
}

// =========================================================
// 🆕 TITLE STYLE LIST (reste inchangé)
// =========================================================

const STYLE_TITRE_OPTIONS = [
    // 🚨 NOTE: The value (the actual prompt) remains in English for the AI model's benefit.
    { label: "Dripping bloody text", value: "dripping horror lettering, torn edges, glossy red liquid texture, glowing sinister vibe" },
    { label: "Cyberpunk neon", value: "bright neon tube letters, electric glow, slight chromatic aberration, futuristic vaporwave look" },
    { label: "Frosted / Ice typography", value: "frosted glass letters, icy texture, translucent frozen edges, cold blue inner glow" },
    { label: "Hand-carved wooden lettering", value: "hand-carved wooden lettering, deep grooves, warm grain texture, rustic fantasy aesthetic" },
    { label: "Engraved metallic text", value: "polished engraved steel letters, sharp reflections, industrial sci-fi shine" },
    { label: "Cartoon / Bubble style", value: "rounded bubbly cartoon letters, colorful shading, outlined comic look" },
    { label: "Bloody slasher effect", value: "sharp jagged letters, blood splatter texture, rough grain, violent horror tone" },
    { label: "Crystal / Gemstone lettering", value: "faceted gemstone letters, prism reflections, diamond-like clarity, luminous highlights" },
    { label: "Ancient stone runes", value: "weathered carved stone letters, cracks, moss details, archaeological fantasy mood" },
    { label: "Flaming text", value: "burning fire lettering, glowing embers, smoke trails, intense heat distortion" },
    { label: "Liquid / Water text", value: "transparent water-textured letters, droplets, soft reflections, fluid organic movement" },
    { label: "Royal golden title", value: "polished gold lettering, embossed texture, warm specular highlights, luxury vibe" },
    { label: "Urban graffiti", value: "spray-painted lettering, rough outlines, dripping paint, street-art" },
    { label: "Futuristic hologram", value: "holographic translucent letters, digital flicker, refraction effects, sci-fi projection" },
    { label: "Medieval Gothic", value: "blackletter-inspired carved metal, dark engraved texture, dramatic gothic atmosphere" },
    { label: "Clay style (stop motion)", value: "hand-molded clay letters, fingerprint texture, soft studio lighting, claymation charm" },
    { label: "Paper cut / collage", value: "layered paper-cut letters, soft shadows, handcrafted collage feel" },
    { label: "Cosmic / Nebula", value: "letters filled with nebula textures, stars, glowing cosmic colors, ethereal space vibe" },
    { label: "Brass Steampunk", value: "aged brass letters, rivets, gears, Victorian industrial detailing" },
    { label: "Digital glitch text", value: "distorted corrupted letters, RGB glitch separation, pixel noise, digital malfunction look" }
];

// =========================================================
// AUTOMATIC INJECTION INTO SELECT (reste inchangé)
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
// HTTP POLLING CONFIGURATION (NEW SYSTEM WITHOUT WS) (reste inchangé)
// =========================================================
const POLLING_INTERVAL_MS = 900;
let pollingProgressInterval = null;
let fakeProgress = 0;

// =========================================================
// GLOBAL VARIABLES (reste inchangé)
// =========================================================
let currentPromptId = null;
let lastGenerationStartTime = null;

// =========================================================
// DISPLAY TOOLS (LOGS, ERRORS, VISUAL PROGRESS) (reste inchangé)
// =========================================================

function log(...args) {
    console.log(...args);
    const box = document.getElementById("log-box");
    if (!box) return;
    const line = document.createElement("div");
    line.className = "log-line";
    const ts = new Date().toLocaleTimeString("en-US", { hour12: false });
    line.innerHTML = `<strong>[${ts}]</strong> ${args.join(" ")}`;
    box.appendChild(line);
    box.scrollTop = box.scrollHeight;
}

function setError(msg) {
    const errBox = document.getElementById("error-box");
    if (!errBox) return;
    if (msg) {
        errBox.style.display = "block";
        errBox.textContent = msg;
    } else {
        errBox.style.display = "none";
        errBox.textContent = "";
    }
}

function showProgressOverlay(show, label = "Awaiting…") {
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
// GPU STATUS (SIMPLIFIED) (reste inchangé)
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
        memEl.textContent = `${data.memory_used ?? 0} / ${data.memory_total ?? 0} GB`;
        tempEl.textContent = (data.temperature ?? 0) + "°C";

        card.classList.remove("gpu-status-error");
    } catch (e) {
        card.classList.add("gpu-status-error");
        nameEl.textContent = "GPU unavailable";
        utilEl.textContent = "–%";
        memEl.textContent = "– / – GB";
        tempEl.textContent = "– °C";
        console.warn("GPU status error:", e);
    }
}

// =========================================================
// WORKFLOWS & CHECKPOINTS MANAGEMENT (reste inchangé)
// =========================================================

async function loadWorkflows() {
    const container = document.getElementById("workflow-groups-container");
    const hiddenInput = document.getElementById("workflow-select");

    if (!container) return;

    try {
        const resp = await fetch(`${API_BASE_URL}/workflows`);
        if (!resp.ok) throw new Error("Error loading workflows");
        const data = await resp.json();

        const workflows = data.workflows || [];
        log("Workflows received:", JSON.stringify(workflows));

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
        console.error("Error loadWorkflows:", e);
        if (container) {
            container.innerHTML = `<span style="font-size:12px;color:#f97373;">Error loading workflows.</span>`;
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
        optEmpty.textContent = "None (workflow default)";
        select.appendChild(optEmpty);

        (data.checkpoints || []).forEach(cp => {
            const opt = document.createElement("option");
            opt.value = cp;
            opt.textContent = cp.replace(/\.(safetensors|ckpt)$/, "");
            select.appendChild(opt);
        });

    } catch (e) {
        console.error("Error loadCheckpoints:", e);
    }
}

function selectWorkflow(workflowName) {
    const vignettes = document.querySelectorAll(".workflow-vignette");
    vignettes.forEach(v => {
        if (v.dataset.workflowName === workflowName) {
            v.classList.add("active-workflow");
        } else {
            v.classList.remove("active-workflow");
        }
    });

    const hiddenInput = document.getElementById("workflow-select");
    if (hiddenInput) {
        hiddenInput.value = workflowName;
    }

    // --- LOGIC SPECIFIC TO POSTER MODE ---
    const afficheMenu = document.getElementById("affiche-menu-wrapper");
    const videoParamsSection = document.getElementById("video-params-section");
    const groupSteps = document.getElementById("group-steps");
    const groupCfg = document.getElementById("group-cfg");
    const groupSampler = document.getElementById("group-sampler");
    const seedSection = document.getElementById("seed-section");
    const sdxlPanel = document.getElementById("sdxl-panel");

    if (workflowName.includes("affiche")) { // Poster Mode
        if (afficheMenu) afficheMenu.style.display = "block";

        // Hide standard image parameters
        if (groupSteps) groupSteps.style.display = "none";
        if (groupCfg) groupCfg.style.display = "none";
        if (groupSampler) groupSampler.style.display = "none";
        if (seedSection) seedSection.style.display = "none";
        if (sdxlPanel) sdxlPanel.style.display = "none";

    } else {
        if (afficheMenu) afficheMenu.style.display = "none";

        // Show standard image parameters
        if (groupSteps) groupSteps.style.display = "block";
        if (groupCfg) groupCfg.style.display = "block";
        if (groupSampler) groupSampler.style.display = "block";
        if (seedSection) seedSection.style.display = "block";
        if (sdxlPanel) sdxlPanel.style.display = "block";
    }

    // Logic specific to video workflows
    if (workflowName.includes("video")) {
        if (videoParamsSection) videoParamsSection.style.display = "block";
    } else {
        if (videoParamsSection) videoParamsSection.style.display = "none";
    }
}

// =========================================================
// FIELD UTILITIES (SETVALUE + MERGE SELECT/CUSTOM) (reste inchangé)
// =========================================================

function setValue(id, val) {
    const el = document.getElementById(id);
    if (el) el.value = val;
}

function getValue(id) {
    return document.getElementById(id)?.value ?? "";
}

function getMergedValue(selectId, customId) {
    const selectVal = getValue(selectId);
    const customVal = getValue(customId);
    return selectVal || customVal;
}


// =========================================================
// PROMPT BUILDING (reste inchangé)
// =========================================================

function buildPrompt() {
    const wfName = getValue("workflow-select");

    if (wfName.includes("affiche")) {
        // --- POSTER PROMPT LOGIC ---
        const titre = getValue("aff_titre");
        const tagline = getValue("aff_tagline");
        const logo = getValue("aff_logo");
        const theme = getMergedValue("aff_theme_sugg", "aff_theme_custom");
        const ambiance = getMergedValue("aff_ambiance_sugg", "aff_ambiance_custom");
        const perso = getMergedValue("aff_perso_sugg", "aff_perso_desc");
        const env = getMergedValue("aff_env_sugg", "aff_env_desc");
        const action = getMergedValue("aff_action_sugg", "aff_action_desc");
        const styleTitre = getValue("aff_style_titre");
        const details = getValue("aff_details");
        const palette = getMergedValue("aff_palette", "aff_palette_custom");
        
        const hasTitle = !!titre.trim();
        const hasTagline = !!tagline.trim();
        const hasLogo = !!logo.trim();

        let textBlock = `
            Text overlay on image:
            ${hasTitle ? `MAIN TITLE: "${titre}" (centered, prominent, bold, crisp, highly readable)` : ""} 
            ${hasLogo ? `LOGO: "${logo}" (top area, smaller, crisp, readable)` : ""} 
            ${hasTagline ? `TAGLINE: "${tagline}" (bottom area, subtle, readable)` : ""} 
            Rules for text: 
            - Only the items above are permitted. 
            - No additional text, no hallucinated wording. 
            - No extra letters, no random symbols. 
            - No decorative scribbles resembling handwriting. 
            - TEXT STYLE / MATERIAL (APPLIES ONLY TO LETTERING): ${styleTitre}. 
            - IMPORTANT: The text style applies ONLY to the lettering. Do NOT apply this style to the characters, environment, rendering, lighting, textures, materials, or the overall image. The global visual style of the poster must remain independent. 
        `.trim();

        const prompt = `
            Ultra detailed cinematic poster, dramatic lighting, depth, atmospheric effects. 
            ${textBlock} 
            Visual elements: 
            - Theme/mood: ${theme} 
            - Ambiance: ${ambiance} 
            - Main character: ${perso} 
            - Environment: ${env} 
            - Action: ${action} 
            Extra details: ${details || "cinematic particles, depth fog, volumetric light"} 
            Color palette: ${palette || "high contrast cinematic palette"} 
            Image style: Premium poster design, professional layout, ultra high resolution, visually striking. 
        `.trim();

        const promptArea = document.getElementById("prompt");
        if (promptArea) {
            promptArea.value = prompt;
        }

    } else {
        // --- STANDARD PROMPT LOGIC ---
        // Simplement copier les valeurs des champs dédiés au prompt si existant
        const promptArea = document.getElementById("prompt");
        const customPrompt = getValue("custom-prompt-input"); // Assuming you have a standard prompt input
        if (promptArea && customPrompt) {
            promptArea.value = customPrompt;
        }
    }
}

// =========================================================
// RANDOMIZER (reste inchangé)
// =========================================================

function randomizePosterPrompt() {
    // ⚠️ NOTE: La fonction getRandomPosterValues n'est pas fournie ici.
    
    // Vous devez la définir ou la commenter si vous ne l'utilisez pas.
    
    buildPrompt();
}

// =========================================================
// GENERATION FLOW
// =========================================================

async function startGeneration(e) {
    e.preventDefault();
    setError("");

    const generateBtn = document.getElementById("generate-button") || document.getElementById("affiche-generate-button");
    const wfName = getValue("workflow-select");
    const authToken = localStorage.getItem('google_auth_token'); // 🔑 RÉCUPÉRATION DU TOKEN

    if (!authToken) {
        setError("Authentification requise. Veuillez vous connecter pour lancer la génération.");
        return;
    }

    if (generateBtn) {
        generateBtn.disabled = true;
        generateBtn.innerHTML = `Lancement...`;
    }

    buildPrompt(); // Finalise le champ "prompt"
    
    // Créer un FormData
    const formEl = document.getElementById("generation-form");
    const formData = new FormData(formEl); 
    
    // Le header d'autorisation
    const headers = {
        'Authorization': `Bearer ${authToken}` // 🔑 ENVOI DU TOKEN
    };

    if (!wfName) {
        setError("Veuillez sélectionner un workflow.");
        if (generateBtn) {
            generateBtn.disabled = false;
            generateBtn.innerHTML = `Générer l'Image`;
        }
        return;
    }
    
    log("Starting actual generation sequence (Max 3 attempts)...");
    lastGenerationStartTime = Date.now();
    showProgressOverlay(true, "Initialization…");
    fakeProgress = 0;

    const statusPill = document.getElementById("job-status-pill");
    if (statusPill) {
        statusPill.textContent = "PENDING";
        statusPill.classList.remove("pill-green");
        statusPill.classList.add("pill");
    }
    
    const maxAttempts = 3;
    let attempt = 0;
    let success = false;
    let finalPromptId = null;

    while (attempt < maxAttempts && !success) {
        attempt++;
        try {
            log(`[Attempt ${attempt}/${maxAttempts}] Sending generation request.`);

            // Use /generate with the workflow_name query parameter
            const resp = await fetch(`${API_BASE_URL}/generate?workflow_name=${encodeURIComponent(wfName)}`, {
                method: "POST",
                body: formData,
                headers: headers // Utiliser les en-têtes avec le token
            });

            if (!resp.ok) {
                log(`Attempt ${attempt} → HTTP ${resp.status}`);
                if (resp.status === 401) {
                    throw new Error("Authentification échouée (401). Le jeton est invalide ou expiré.");
                }
                if (attempt < maxAttempts) {
                    await new Promise(r => setTimeout(r, 1000)); // Attendre avant de réessayer
                    continue;
                }
                throw new Error(`Erreur HTTP ${resp.status} lors de l'envoi de la requête.`);
            }

            const data = await resp.json();
            if (data.prompt_id) {
                finalPromptId = data.prompt_id;
                success = true;
            } else {
                throw new Error("Réponse de génération invalide (pas d'ID de prompt).");
            }

        } catch (e) {
            console.error(`Attempt ${attempt} failed:`, e);
            if (attempt === maxAttempts) {
                setError(`Échec de la génération après ${maxAttempts} tentatives: ${e.message}`);
                showProgressOverlay(false);
                if (generateBtn) {
                    generateBtn.disabled = false;
                    generateBtn.innerHTML = `Générer l'Image`;
                }
                return;
            }
        }
    }

    if (finalPromptId) {
        currentPromptId = finalPromptId;
        log(`Prompt sent. ID: ${finalPromptId}. Starting progress polling.`);
        pollProgress(finalPromptId);
    }
}


// =========================================================
// FAKE PROGRESS + AUTO /result DETECTION (POLLING) (reste inchangé)
// =========================================================

async function pollProgress(promptId) {
    if (!promptId) return;

    fakeProgress = 0;
    showProgressOverlay(true, "Generation in progress…");

    if (pollingProgressInterval) {
        clearInterval(pollingProgressInterval);
    }

    const percentSpan = document.getElementById("progress-percent");
    const innerBar = document.getElementById("progress-inner");
    const statusPill = document.getElementById("job-status-pill");

    if (statusPill) {
        statusPill.textContent = "RUNNING";
        statusPill.classList.remove("pill-green");
        statusPill.classList.add("pill");
    }

    pollingProgressInterval = setInterval(async () => {
        const authToken = localStorage.getItem('google_auth_token'); // 🔑 RÉCUPÉRATION DU TOKEN

        // FAKE Animation up to 92 %
        fakeProgress = Math.min(fakeProgress + 7, 92);
        if (percentSpan) percentSpan.textContent = fakeProgress + "%";
        if (innerBar) innerBar.style.width = fakeProgress + "%";

        // Direct test if result is available
        try {
            // Use /progress for status
            const resCheck = await fetch(`${API_BASE_URL}/progress/${promptId}`, {
                headers: { 
                    'Authorization': `Bearer ${authToken}` // 🔑 ENVOI DU TOKEN
                } 
            });

            if (resCheck.ok) {
                const data = await resCheck.json();
                if (data.status?.completed) {
                    // Result is ready! Stop polling.
                    clearInterval(pollingProgressInterval);
                    pollingProgressInterval = null;
                    fetchResult(promptId);
                }
            } else if (resCheck.status === 401) {
                 // Gérer l'échec d'authentification pendant le polling
                clearInterval(pollingProgressInterval);
                pollingProgressInterval = null;
                setError("La session a expiré. Veuillez vous reconnecter.");
                logout(); // Rediriger
            }

        } catch (e) {
            console.warn("Polling error:", e);
        }

    }, POLLING_INTERVAL_MS);
}

// =========================================================
// RESULT FETCH (reste inchangé)
// =========================================================

async function fetchResult(promptId) {
    showProgressOverlay(true, "Finalizing and downloading...");
    const generateBtn = document.getElementById("generate-button") || document.getElementById("affiche-generate-button");
    const statusPill = document.getElementById("job-status-pill");
    const authToken = localStorage.getItem('google_auth_token'); // 🔑 RÉCUPÉRATION DU TOKEN


    try {
        const resp = await fetch(`${API_BASE_URL}/result/${promptId}`, {
            headers: { 
                'Authorization': `Bearer ${authToken}` // 🔑 ENVOI DU TOKEN
            } 
        });

        if (resp.status === 404) {
             // Si le résultat n'est pas prêt, on donne une chance de plus
            setTimeout(() => { fetchResult(promptId); }, 3000);
            return;
        }

        if (!resp.ok) {
            if (resp.status === 401) {
                setError("La session a expiré lors de la récupération du résultat. Veuillez vous reconnecter.");
                logout();
                return;
            }
            throw new Error(`Erreur HTTP ${resp.status} lors de la récupération du résultat.`);
        }

        const data = await resp.json();

        // Afficher l'image
        displayImage(data.image_base64, data.filename, data);
        log(`Result received in ${((Date.now() - lastGenerationStartTime) / 1000).toFixed(1)}s.`);
        
        // Mettre à jour l'UI finale
        if (statusPill) {
            statusPill.textContent = "READY";
            statusPill.classList.remove("pill");
            statusPill.classList.add("pill-green");
        }
        
    } catch (e) {
        console.error("Result fetch error:", e);
        setError(`Échec de la récupération du résultat: ${e.message}`);
    } finally {
        showProgressOverlay(false);
        if (generateBtn) {
            generateBtn.disabled = false;
            generateBtn.innerHTML = `Générer l'Image`;
        }
    }
}

// =========================================================
// DISPLAY IMAGE (reste inchangé)
// =========================================================

function displayImage(base64Data, filename, metadata) {
    const img = document.createElement("img");
    img.src = `data:image/png;base64,${base64Data}`;
    img.alt = filename;
    img.id = "result-image";

    // Gère le chargement
    img.onload = () => {
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
            // Update the download link text (translated)
            dlLink.textContent = `Télécharger (${filename})`;
            modal.style.display = "flex";
        }
    });

    const resultImageWrapper = document.getElementById("result-image-wrapper");
    if (resultImageWrapper) {
        // S'assurer que l'ancienne image est retirée et la nouvelle est insérée
        const oldImg = document.getElementById("result-image");
        if (oldImg) oldImg.remove();
        img.id = "result-image";
        resultImageWrapper.appendChild(img);
        img.style.display = 'block'; // Rendre l'image visible
    }

    // Rendre les métadonnées visibles
    const metadataArea = document.getElementById("metadata-area");
    if (metadataArea) metadataArea.style.display = 'flex';

    // Update metadata (translated from the French file)
    const metaSeed = document.getElementById("meta-seed");
    const metaSteps = document.getElementById("meta-steps");
    const metaCfg = document.getElementById("meta-cfg");
    const metaSampler = document.getElementById("meta-sampler");

    if (metaSeed) metaSeed.textContent = metadata.seed ?? "–";
    if (metaSteps) metaSteps.textContent = metadata.steps ?? "–";
    if (metaCfg) metaCfg.textContent = metadata.cfg_scale ?? "–";
    if (metaSampler) metaSampler.textContent = metadata.sampler ?? "–";
}

// =========================================================
// MAIN INITIALIZATION
// =========================================================

document.addEventListener('DOMContentLoaded', () => {

    // 🔥 APPEL CRUCIAL 1: Gérer le token reçu dans l'URL (s'applique à login.html ou index.html)
    // Va sauvegarder le token et rediriger vers index.html.
    // Si cette fonction retourne 'true', on stoppe l'exécution du reste du script
    // pour éviter toute interférence.
    if (handleTokenTransferFromURL()) {
        return; 
    }

    // 🔥 APPEL CRUCIAL 2: Vérifier l'authentification et afficher/rediriger 
    // Si la fonction retourne 'false', cela signifie qu'une redirection vers login.html 
    // a été lancée ou que le script est sur login.html sans token.
    if (!checkAuthenticationAndDisplayUI()) {
        // Si checkAuthenticationAndDisplayUI a lancé une redirection, 
        // le reste du script ne s'exécutera pas, mais on peut ajouter un return
        // par précaution (surtout si la redirection ne se fait pas immédiatement).
        // Cependant, le 'return true' à l'intérieur de la fonction est plus efficace.
    }


    // Ajoutez l'événement de déconnexion
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', logout);
    }

    // --- Génération de Prompt (Affichée) ---
    const promptInputs = document.querySelectorAll('#affiche-menu-wrapper input, #affiche-menu-wrapper textarea, #affiche-menu-wrapper select');
    promptInputs.forEach(input => {
        input.addEventListener('change', buildPrompt);
        input.addEventListener('keyup', buildPrompt);
    });

    // --- Bouton Randomize ---
    const randomizeButton = document.getElementById("randomize-button");
    if (randomizeButton) {
        randomizeButton.addEventListener("click", randomizePosterPrompt);
    }
    
    // --- Boutons de Génération ---
    const generateButton = document.getElementById("generate-button");
    const afficheGenerateButton = document.getElementById("affiche-generate-button");

    if (generateButton) {
        generateButton.addEventListener("click", startGeneration);
    }
    if (afficheGenerateButton) {
        afficheGenerateButton.addEventListener("click", startGeneration);
    }

    // --- Modale d'image ---
    const modal = document.getElementById("image-modal");
    if (modal) {
        modal.querySelector(".modal-close-btn").addEventListener('click', () => {
            modal.style.display = "none";
        });
        window.addEventListener('click', (event) => {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        });
    }

    // --- Sélection de Mode (Image / Affiche) ---
    const modeCards = document.querySelectorAll(".mode-card");
    const generateButtonWrapper = document.getElementById("generate-button-wrapper");
    const afficheGenerateBtnWrapper = document.getElementById("affiche-generate-button-wrapper");

    modeCards.forEach(card => {
        card.addEventListener('click', function() {
            modeCards.forEach(c => c.classList.remove('active-mode'));
            this.classList.add('active-mode');

            const mode = this.dataset.mode;
            const afficheMenu = document.getElementById("affiche-menu-wrapper");

            if (mode === "poster") { // Poster Mode
                if (afficheMenu) afficheMenu.style.display = "block";
                selectWorkflow("affiche.json"); 

                // Affiche le bouton Affiche et masque le bouton Image
                if (generateButtonWrapper) generateButtonWrapper.style.display = 'none'; 
                if (afficheGenerateBtnWrapper) afficheGenerateBtnWrapper.style.display = 'block';

            } else { // Image Mode (default)
                // Si pas en mode POSTER, masquer le menu Affiche
                if (afficheMenu) afficheMenu.style.display = "none";
                // selectWorkflow("default_image.json");

                // Affiche le bouton Image et masque le bouton Affiche
                if (generateButtonWrapper) generateButtonWrapper.style.display = 'block'; 
                if (afficheGenerateBtnWrapper) afficheGenerateBtnWrapper.style.display = 'none';
            }
        });
    });
    
    // =========================================================
    // FINAL INITIALIZATION (SIMULATE CLICK TO INITIALIZE DISPLAY)
    // =========================================================
    
    // Simuler un clic sur la carte active par défaut pour initialiser l'affichage
    const defaultModeCard = document.querySelector(".mode-card.active-mode");
    if (defaultModeCard) {
        // Déclencher l'événement de clic pour appliquer la logique de visibilité
        defaultModeCard.dispatchEvent(new Event('click'));
    }

    setInterval(refreshGPU, 10000);
    refreshGPU();
    loadWorkflows();

});
