const API_BASE_URL = "http://127.0.0.1:8001";
const WS_BASE_URL  = "ws://127.0.0.1:8001/ws/progress";

let isGenerating = false;
let gpuInterval = null;
let wsClient = null;
let lastUsedParams = {}; // Pour stocker les paramètres de la dernière génération
let doneTimeout = null; // Ajout pour le mécanisme de timeout

// Map workflow -> nom du modèle affiché (rempli dynamiquement)
const MODEL_DISPLAY_NAME_BY_WORKFLOW = {};

// -----------------------------
// DOM refs
// -----------------------------
const form = document.getElementById("generation-form");
const workflowSelect = document.getElementById("workflow-select");
const workflowGroupsContainer = document.getElementById("workflow-groups-container");
const checkpointSelect = document.getElementById("checkpoint-select");
const checkpointWrapper = document.getElementById("checkpoint-wrapper");
const sdxlPanel = document.getElementById("sdxl-panel");
const generateButton = document.getElementById("generate-button");

const inputImageSection = document.getElementById("input-image-section");
const inputImageFile = document.getElementById("input-image-file");
const inputImageBrowseBtn = document.getElementById("input-image-browse-btn");
const inputImageLabel = document.getElementById("input-image-label");
const inputImagePathHidden = document.getElementById("input_image_path");

const groupSeed = document.getElementById("group-seed");
const groupSteps = document.getElementById("group-steps");
const groupCfg = document.getElementById("group-cfg");
const groupWidth = document.getElementById("group-width");
const groupHeight = document.getElementById("group-height");
const groupSampler = document.getElementById("group-sampler");
const videoParamsSection = document.getElementById("video-params-section");
const durationInput = document.getElementById("duration");
const ratioSelect = document.getElementById("ratio");

// sliders
const stepsSlider = document.getElementById("steps-slider");
const stepsValue = document.getElementById("steps-value");
const cfgScaleSlider = document.getElementById("cfg_scale-slider");
const cfgScaleValue = document.getElementById("cfg_scale-value");
// Seed
const seedInput = document.getElementById("seed-input");
const seedRandomToggle = document.getElementById("seed-random-toggle");
// Width/Height
const widthInput = document.getElementById("width-input");
const heightInput = document.getElementById("height-input");

// ⭐ AJOUT: Initialisation des valeurs par défaut 1080x1080 pour les inputs masqués
if (widthInput) widthInput.value = 1080;
if (heightInput) heightInput.value = 1080;


// preview / progression
const progressOverlay = document.getElementById("progress-overlay");
const progressInner = document.getElementById("progress-inner");
const progressLabel = document.getElementById("progress-label");
const progressPercent = document.getElementById("progress-percent");
const resultArea = document.getElementById("result-area");
const resultPlaceholder = document.getElementById("result-placeholder");

// SDXL (on garde les refs mais on ne l'utilisera plus dans la logique)
const sdxlStartSlider = document.getElementById("sdxl_start-slider");
const sdxlStartValue = document.getElementById("sdxl_start-value");
const sdxlEndSlider = document.getElementById("sdxl_end-slider");
const sdxlEndValue = document.getElementById("sdxl_end-value");
const sdxlModeSelect = document.getElementById("sdxl_mode");
const sdxlQualitySelect = document.getElementById("sdxl_quality");

// modal
const imageModal = document.getElementById("image-modal");
const modalImage = document.getElementById("modal-image");
const modalCloseBtn = document.querySelector(".modal-close-btn");
const modalDownloadLink = document.getElementById("modal-download-link");

// metadata
const timeTakenDisplay = document.getElementById("time-taken");
const copyParamsBtn = document.getElementById("copy-params-btn");
const metaSeed = document.getElementById("meta-seed");
const metaSteps = document.getElementById("meta-steps");
const metaCfg = document.getElementById("meta-cfg");
const metaSampler = document.getElementById("meta-sampler");

// logs / status
const logBox = document.getElementById("log-box");
const errorBox = document.getElementById("error-box");
const jobStatusPill = document.getElementById("job-status-pill");

// GPU
const gpuCard = document.getElementById("gpu-card");
const gpuName = document.getElementById("gpu-name");
const gpuUtil = document.getElementById("gpu-util");
const gpuMem = document.getElementById("gpu-mem");
const gpuTemp = document.getElementById("gpu-temp");

// popover workflow
const workflowPopover = document.getElementById("workflow-popover");
const popoverTitle = document.getElementById("popover-title");
const popoverImage = document.getElementById("popover-image");
const popoverDescription = document.getElementById("popover-description");

// carrousel
const workflowCarouselLeft = document.getElementById("workflow-carousel-left");
const workflowCarouselRight = document.getElementById("workflow-carousel-right");


// -----------------------------
// Sliders sync
// -----------------------------
function setupSliderSync(slider, valueDisplay, decimalPlaces = 0) {
    if (!slider || !valueDisplay) return;
    const updateValue = () => {
        valueDisplay.textContent = parseFloat(slider.value).toFixed(decimalPlaces);
    };
    slider.addEventListener("input", updateValue);
    updateValue();
}

setupSliderSync(stepsSlider, stepsValue, 0);
setupSliderSync(cfgScaleSlider, cfgScaleValue, 1);
setupSliderSync(sdxlStartSlider, sdxlStartValue, 0);
setupSliderSync(sdxlEndSlider, sdxlEndValue, 0);


// -----------------------------
// Seed Logic
// -----------------------------
const DEFAULT_FIXED_SEED = 42; 

if (seedRandomToggle && seedInput) {
    seedRandomToggle.addEventListener('change', () => {
        if (seedRandomToggle.checked) {
            // Aléatoire sélectionné
            seedInput.disabled = true;
            // On conserve la valeur affichée pour réutilisation, mais la valeur logique sera -1
            seedInput.placeholder = "Seed Aléatoire (-1)";
            seedInput.value = ""; 
        } else {
            // Fixe sélectionné
            seedInput.disabled = false;
            seedInput.placeholder = "";
            // Si le champ est vide, on remet la valeur par défaut
            if (seedInput.value === "") {
                seedInput.value = DEFAULT_FIXED_SEED;
            }
        }
    });
    // Initialisation
    // Définir la SEED comme aléatoire par défaut
    seedRandomToggle.checked = true; 
    seedInput.disabled = true;
    seedInput.value = "";
    seedInput.placeholder = "Seed Aléatoire (-1)";
}


// -----------------------------
// Logging / erreurs / statut
// -----------------------------
function log(message) {
    const line = document.createElement("div");
    line.className = "log-line";
    line.innerHTML = `<strong>[${new Date().toLocaleTimeString()}]</strong> ${message}`;
    logBox.prepend(line);
}

function setError(msg) {
    errorBox.style.display = "block";
    errorBox.textContent = msg;
}

function clearError() {
    errorBox.style.display = "none";
    errorBox.textContent = "";
}

function setJobStatus(text) {
    jobStatusPill.textContent = text;
}


// -----------------------------
// Popover workflows (autodetect)
// -----------------------------
function showPopover(workflowName, x, y) {
    // Utilise le nom forcé "DEMO TEST"
    const displayName = "DEMO TEST"; 
    const baseName = workflowName.replace(/\.json$/i, "");
    const vignettePath = `./vignettes/${baseName}.png`;

    popoverTitle.textContent = displayName;
    popoverDescription.textContent = workflowName;
    popoverImage.src = vignettePath;

    workflowPopover.style.left = `${x + 15}px`;
    workflowPopover.style.top = `${y + 15}px`;
    workflowPopover.style.display = "block";
}

function hidePopover() {
    workflowPopover.style.display = "none";
}


// -----------------------------
// GPU 
// -----------------------------
async function loadGPU() {
    try {
        const resp = await fetch(API_BASE_URL + "/gpu_status");
        const data = await resp.json();

        // Affiche le nom exact retourné par le backend. 
        gpuName.textContent = data.name || "GPU"; 
        gpuUtil.textContent = data.load + "%";
        gpuMem.textContent = data.memory_used + " / " + data.memory_total + " Go";
        if (data.temperature !== undefined) {
            gpuTemp.textContent = data.temperature + " °C";
        }
    } catch (err) {
        gpuName.textContent = "GPU (Erreur)";
    }
}


// -----------------------------
// Checkpoints
// -----------------------------
async function loadCheckpoints() {
    try {
        const resp = await fetch(API_BASE_URL + "/checkpoints");
        const data = await resp.json();
        checkpointSelect.innerHTML = "";

        data.checkpoints.forEach(ck => {
            const opt = document.createElement("option");
            opt.value = ck;
            opt.textContent = ck;
            checkpointSelect.appendChild(opt);
        });
    } catch (err) {
        checkpointSelect.innerHTML = `<option value="">Erreur chargement</option>`;
    }
}


// -----------------------------
// Placeholders : adaptation UI
// -----------------------------
async function fetchWorkflowPlaceholders(wf) {
    try {
        const resp = await fetch(`${API_BASE_URL}/workflows/${wf}`);
        if (!resp.ok) return;
        const wfJson = await resp.json();
        updateUIForWorkflowPlaceholders(wfJson);
    } catch {}
}

function updateUIForWorkflowPlaceholders(workflowJson) {
    const json = JSON.stringify(workflowJson);

    const hasInputImage = json.includes("{{input_image_path}}");
    const hasCheckpoint = json.includes("{{checkpoint}}");

    inputImageSection.style.display = hasInputImage ? "block" : "none";
    
    // groupSeed, groupWidth, groupHeight sont masqués de façon permanente dans index.html

    videoParamsSection.style.display = "none";
    checkpointWrapper.style.display = hasCheckpoint ? "block" : "none";
    sdxlPanel.style.display = "none";
}


// -----------------------------
// Extraction du nom de modèle (Forcé)
// -----------------------------
function prettifyModelName(raw) {
    // Force le nom de la vignette à "DEMO TEST"
    return "DEMO TEST"; 
}

async function extractModelDisplayName(workflowName) {
    // Force le nom de la vignette à "DEMO TEST"
    return "DEMO TEST"; 
}


// -----------------------------
// LOAD WORKFLOWS : auto-détection + vignettes
// -----------------------------
async function loadWorkflows() {
    try {
        const resp = await fetch(API_BASE_URL + "/workflows");
        const data = await resp.json();
        const workflowFiles = data.workflows || [];

        workflowGroupsContainer.innerHTML = "";

        const grid = document.createElement("div");
        grid.className = "workflow-grid";
        workflowGroupsContainer.appendChild(grid);

        let firstWorkflow = null;

        for (const wfName of workflowFiles) {
            if (!firstWorkflow) firstWorkflow = wfName;

            // Nom d'affichage forcé
            const displayName = "DEMO TEST"; 
            MODEL_DISPLAY_NAME_BY_WORKFLOW[wfName] = displayName;

            const baseName = wfName.replace(/\.json$/i, "");
            const vignette = document.createElement("div");
            vignette.className = "workflow-vignette";
            vignette.setAttribute("data-workflow-name", wfName);

            const imgSrc = `./vignettes/${baseName}.png`;

            vignette.innerHTML = `
                <div class="workflow-thumb-wrapper">
                    <img class="workflow-thumb" src="${imgSrc}" alt="${displayName}" />
                </div>
                <div class="vignette-label-only">${displayName}</div>
            `;

            const imgEl = vignette.querySelector(".workflow-thumb");
            if (imgEl) {
                imgEl.onerror = () => {
                    imgEl.src = "./vignettes/default.png";
                };
            }

            vignette.addEventListener("mouseover", (e) => {
                showPopover(wfName, e.clientX, e.clientY);
            });
            vignette.addEventListener("mousemove", (e) => {
                showPopover(wfName, e.clientX, e.clientY);
            });
            vignette.addEventListener("mouseout", hidePopover);

            vignette.addEventListener("click", () => selectWorkflow(wfName));

            grid.appendChild(vignette);
        }

        if (firstWorkflow) {
            setTimeout(() => selectWorkflow(firstWorkflow), 0);
        } else {
            workflowGroupsContainer.innerHTML = `<span style="font-size:12px;color:#9ca3af;">Aucun workflow disponible.</span>`;
        }

    } catch (err) {
        console.error(err);
        workflowGroupsContainer.innerHTML = "Erreur chargement workflows";
    }
}


// -----------------------------
// Sélection workflow
// -----------------------------
function selectWorkflow(workflowName) {
    workflowSelect.value = workflowName;

    document.querySelectorAll(".workflow-vignette").forEach(v => {
        if (v.getAttribute("data-workflow-name") === workflowName) {
            v.classList.add("selected");
        } else {
            v.classList.remove("selected");
        }
    });

    // On charge seulement les placeholders réels
    fetchWorkflowPlaceholders(workflowName);
}


// -----------------------------
// Progress / Form
// -----------------------------
function updateProgress(pct, label) {
    progressInner.style.width = pct + "%";
    progressPercent.textContent = pct + "%";
    if (label) progressLabel.textContent = label;
}

function toggleForm(disabled) {
    isGenerating = disabled;
    generateButton.disabled = disabled;

    if (disabled) {
        progressOverlay.classList.add("visible");
    } else {
        progressOverlay.classList.remove("visible");
    }
}


// -----------------------------
// Modal image
// -----------------------------
function openModal(imageSrc, savedFileName) {
    modalImage.src = imageSrc;
    modalDownloadLink.href = imageSrc;
    modalDownloadLink.textContent = "Télécharger (" + (savedFileName || "image.png") + ")";
    imageModal.style.display = "flex";
}

function closeModal() {
    imageModal.style.display = "none";
}

modalCloseBtn.addEventListener("click", closeModal);
imageModal.addEventListener("click", e => {
    if (e.target === imageModal) closeModal();
});


// -----------------------------
// Fallback HTTP pour l'image
// -----------------------------
async function checkForResult(promptId) {
    // Si l'image est déjà affichée, on ne fait rien
    if (resultPlaceholder.innerHTML.includes("result-image")) {
        return;
    }

    try {
        log("WS fermé. Tentative de récupération du résultat par HTTP...");
        const resp = await fetch(`${API_BASE_URL}/result/${promptId}`);
        if (!resp.ok) {
            throw new Error("Erreur HTTP: " + resp.status);
        }
        const data = await resp.json();

        if (data.image_base64) {
            log("Image récupérée avec succès via HTTP.");
            
            const src = `data:image/png;base64,${data.image_base64}`;
            const filename = data.filename || "output.png";
            resultPlaceholder.innerHTML = `
                <img class="result-image clickable"
                     src="${src}"
                     data-original-src="${src}"
                     data-file-name="${filename}" />
            `;

            const clickable = document.querySelector(".result-image.clickable");
            if (clickable) {
                clickable.addEventListener("click", () => {
                    openModal(src, filename);
                });
            }
            if (isGenerating) {
                toggleForm(false);
                updateProgress(100, "Terminé (HTTP Fallback)");
                setJobStatus("DONE");
            }
        } else {
            log("Réponse HTTP reçue, mais aucune image trouvée.");
        }
    } catch (err) {
        log(`Échec de la récupération HTTP: ${err.message}`);
        setError("L'image n'a pas pu être récupérée après l'exécution.");
    }
}


// -----------------------------
// WebSocket progression
// -----------------------------
function connectWebSocket(promptId) {
    const ws = new WebSocket(`${WS_BASE_URL}/${promptId}`);
    wsClient = ws;

    if (doneTimeout) {
        clearTimeout(doneTimeout);
        doneTimeout = null;
    }

    ws.onopen = () => {
        log("WS connecté");
        setJobStatus("RUNNING");
    };

    ws.onmessage = evt => {
        const msg = JSON.parse(evt.data);
        console.log("WS MESSAGE TYPE:", msg.type, "PROMPT ID:", promptId);

        if (msg.type === "progress" || msg.type === "preview") {
            if (doneTimeout) {
                clearTimeout(doneTimeout);
                doneTimeout = null;
            }
        }

        if (msg.type === "progress") {
            const pct = Math.floor((msg.value / msg.max_value) * 100);
            updateProgress(pct, "Exécution workflow…");
            
            if (pct >= 99 && !doneTimeout) {
                doneTimeout = setTimeout(() => {
                    log("Timeout atteint: Fermeture forcée de l'overlay.");
                    toggleForm(false);
                    updateProgress(100, "Terminé (Force Close)");
                    setJobStatus("DONE");
                    ws.close();
                }, 12000);
            }
        }

        if (msg.type === "preview" && msg.image_base64) {
            resultPlaceholder.innerHTML =
                `<img class="result-image" src="data:image/png;base64,${msg.image_base64}" />`;
        }
        
        if (msg.type === "output" && msg.image_base64) {
            if (doneTimeout) clearTimeout(doneTimeout);
            
            toggleForm(false);
            updateProgress(100, "Terminé");
            setJobStatus("DONE");

            const src = `data:image/png;base64,${msg.image_base64}`;
            resultPlaceholder.innerHTML = `
                <img class="result-image clickable"
                     src="${src}"
                     data-original-src="${src}"
                     data-file-name="${msg.filename || "output.png"}" />
            `;

            const clickable = document.querySelector(".result-image.clickable");
            if (clickable) {
                clickable.addEventListener("click", () => {
                    openModal(src, msg.filename);
                });
            }
            ws.close();
            return;
        }

        const completionTypes = [
            "result", "executed", "final_result", "done", "execution_done", "execution_end"
        ];

        if (completionTypes.includes(msg.type)) {
            if (doneTimeout) clearTimeout(doneTimeout);
            if (isGenerating) {
                toggleForm(false);
                updateProgress(100, "Terminé");
                setJobStatus("DONE");
            }
            ws.close();
        }
    };

    ws.onerror = () => {
        if (doneTimeout) clearTimeout(doneTimeout);
        toggleForm(false);
        setError("Erreur connexion WebSocket");
    };

    ws.onclose = () => {
        log("WS fermé");
        if (doneTimeout) clearTimeout(doneTimeout);
        checkForResult(promptId);
    };
}


// -----------------------------
// Carrousel boutons
// -----------------------------
function getWorkflowGridElement() {
    return document.querySelector(".workflow-grid");
}

if (workflowCarouselLeft) {
    workflowCarouselLeft.addEventListener("click", () => {
        const grid = getWorkflowGridElement();
        if (grid) {
            grid.scrollBy({ left: -200, behavior: "smooth" });
        }
    });
}

if (workflowCarouselRight) {
    workflowCarouselRight.addEventListener("click", () => {
        const grid = getWorkflowGridElement();
        if (grid) {
            grid.scrollBy({ left: 200, behavior: "smooth" });
        }
    });
}


// -----------------------------
// Submit génération
// -----------------------------
form.addEventListener("submit", async e => {
    e.preventDefault();
    if (isGenerating) return;

    clearError();

    const workflowName = workflowSelect.value;
    if (!workflowName) {
        setError("Sélectionne un workflow.");
        return;
    }

    const formData = new FormData();

    const prompt = document.getElementById("prompt").value;
    const negative_prompt = ""; 
    
    // Valeurs par défaut forcées
    const steps = 10; 
    const cfg_scale = 1.0;
    const sampler = "euler"; 

    // LOGIQUE SEED : utilise la valeur -1 si Aléatoire est cochée (par défaut)
    let seed;
    if (seedRandomToggle.checked) {
        seed = -1;
    } else {
        const fixedSeed = parseInt(seedInput.value, 10);
        seed = fixedSeed;
        if (isNaN(seed)) {
            // Fallback si la saisie fixe est vide
            seed = DEFAULT_FIXED_SEED;
            seedInput.value = seed;
        }
    }

    // ⭐ CORRECTION: Lit les valeurs des inputs cachés (widthInput, heightInput), 
    // qui sont mises à jour par les formats rapides et initialisées à 1080.
    const width = parseInt(widthInput.value, 10); 
    const height = parseInt(heightInput.value, 10); 
    
    // Assurer que les valeurs sont numériques (au cas où)
    const finalWidth = isNaN(width) ? 1080 : width;
    const finalHeight = isNaN(height) ? 1080 : height;
    
    const input_image_path = inputImagePathHidden.value;
    const duration = parseFloat(durationInput ? durationInput.value : "0");
    const ratio = ratioSelect ? ratioSelect.value : ""; 

    lastUsedParams = {
        workflow: workflowName,
        prompt: prompt,
        negative_prompt: negative_prompt,
        steps: steps, // 10
        cfg_scale: cfg_scale, // 1.0
        seed: seed, // Seed finale
        sampler: sampler, // "euler"
        width: finalWidth,
        height: finalHeight
    };

    formData.append("prompt", prompt);
    formData.append("negative_prompt", negative_prompt);
    formData.append("steps", steps);
    formData.append("cfg_scale", cfg_scale);
    formData.append("seed", seed);
    formData.append("sampler", sampler);
    formData.append("width", finalWidth); // Utilisation de la valeur lue ou par défaut (1080)
    formData.append("height", finalHeight); // Utilisation de la valeur lue ou par défaut (1080)
    
    if (input_image_path) {
        formData.append("input_image_path", input_image_path);
    }

    if (!Number.isNaN(duration)) formData.append("duration", duration);
    if (ratio) formData.append("ratio", ratio);

    toggleForm(true);
    setJobStatus("RUNNING");
    updateProgress(0, "Envoi…");

    const startTime = performance.now();

    try {
        const resp = await fetch(`${API_BASE_URL}/generate?workflow_name=${workflowName}`, {
            method: "POST",
            body: formData
        });

        const data = await resp.json();
        if (data.status === "processing_started") {
            connectWebSocket(data.prompt_id);
        } else {
            toggleForm(false);
            setError(data.detail || "Erreur bridge.");
        }

        const endTime = performance.now();
        const seconds = ((endTime - startTime) / 1000).toFixed(1);
        timeTakenDisplay.textContent = seconds + " s";
        // Mise à jour des métadonnées avec les valeurs forcées/déterminées
        metaSeed.textContent = seed;
        metaSteps.textContent = steps;
        metaCfg.textContent = cfg_scale;
        metaSampler.textContent = sampler;

    } catch (err) {
        console.error(err);
        toggleForm(false);
        setError("Erreur bridge.");
    }
});


// -----------------------------
// Upload image
// -----------------------------
if (inputImageBrowseBtn) {
    inputImageBrowseBtn.addEventListener("click", () => {
        inputImageFile.click();
    });

    inputImageFile.addEventListener("change", async () => {
        const file = inputImageFile.files[0];
        if (!file) return;

        inputImageLabel.textContent = "Upload…";

        const fd = new FormData();
        fd.append("file", file);

        try {
            const resp = await fetch(`${API_BASE_URL}/upload/image`, {
                method: "POST",
                body: fd
            });

            const data = await resp.json();
            inputImagePathHidden.value = data.comfy_path;
            inputImageLabel.textContent = data.local_path;

        } catch {
            inputImageLabel.textContent = "Échec upload";
        }
    });
}


// -----------------------------
// Bouton "Copier paramètres"
// -----------------------------
if (copyParamsBtn) {
    copyParamsBtn.addEventListener("click", () => {
        const txt = JSON.stringify(lastUsedParams, null, 2);
        navigator.clipboard.writeText(txt).then(() => {
            log("Paramètres copiés dans le presse-papiers.");
        });
    });
}


// -----------------------------
// INIT
// -----------------------------
(async function init() {
    log("Initialisation…");
    await loadWorkflows();
    await loadCheckpoints();
    await loadGPU();
    gpuInterval = setInterval(loadGPU, 6000);
})();

// Steeve quick format icons
document.querySelectorAll(".fmt-icon").forEach(icon=>{
   icon.addEventListener("click",()=>{
      const w=parseInt(icon.dataset.w), h=parseInt(icon.dataset.h);
      const wi=document.getElementById("width-input");
      const hi=document.getElementById("height-input");
      if(wi) wi.value=w;
      if(hi) hi.value=h;
      const preset=document.getElementById("image-size-preset");
      if(preset) preset.value = `${w}x${h}`;
      log(`Format: ${w}x${h}`);
   });
});


// === Quick format icons ===
document.querySelectorAll(".fmt-icon").forEach(icon=>{
    icon.addEventListener("click", ()=>{
        const w = icon.dataset.w;
        const h = icon.dataset.h;
        const widthInput = document.getElementById("width-input");
        const heightInput = document.getElementById("height-input");
        if(widthInput && heightInput){
            widthInput.value = w;
            heightInput.value = h;
        }
        console.log("Format sélectionné:", w, h);
    });
});