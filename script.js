// =========================================================
// CONFIGURATION (FRONTEND)
// =========================================================

const API_BASE_URL = "https://g-n-rateur-backend-1.onrender.com";
// =========================================================
// 🆕 TITLE STYLE LIST
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
// 🆕 AUTOMATIC INJECTION INTO SELECT
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
// HTTP POLLING CONFIGURATION (NEW SYSTEM WITHOUT WS)
// =========================================================
const POLLING_INTERVAL_MS = 900;
let pollingProgressInterval = null;
let fakeProgress = 0;

// =========================================================
// GLOBAL VARIABLES
// =========================================================
let currentPromptId = null;
let lastGenerationStartTime = null;

// =========================================================
// DISPLAY TOOLS (LOGS, ERRORS, VISUAL PROGRESS)
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
// GPU STATUS (SIMPLIFIED)
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
// WORKFLOWS & CHECKPOINTS MANAGEMENT
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

        (data.checkpoints || []).forEach(ckpt => {
            const opt = document.createElement("option");
            opt.value = ckpt;
            opt.textContent = ckpt;
            select.appendChild(opt);
        });

    } catch (e) {
        console.warn("Error loading checkpoints:", e);
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

    log("Selected workflow:", workflowName);

    const checkpointWrapper = document.getElementById("checkpoint-wrapper");
    const videoParamsSection = document.getElementById("video-params-section");
    const inputImageSection = document.getElementById("input-image-section");
    const groupSteps = document.getElementById("group-steps");
    const groupCfg = document.getElementById("group-cfg");
    const groupSampler = document.getElementById("group-sampler");
    const seedSection = document.getElementById("group-seed");
    const sdxlPanel = document.getElementById("sdxl-panel");

    const afficheMenu = document.getElementById("affiche-menu");

    // Logic specific to the "affiche.json" workflow
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

        // Hide specific groups for the poster workflow
        if (groupSteps) groupSteps.style.display = "none";
        if (groupCfg) groupCfg.style.display = "none";
        if (groupSampler) groupSampler.style.display = "none";
        if (seedSection) seedSection.style.display = "none";
        if (sdxlPanel) sdxlPanel.style.display = "none";

    } else {
        if (afficheMenu) afficheMenu.style.display = "none";
        // Ensure standard groups are visible when not in poster mode
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
 // FIELD UTILITIES (SETVALUE + MERGE SELECT/CUSTOM)
 // =========================================================

function setValue(id, val) {
    const el = document.getElementById(id);
    if (!el) return;
    el.value = val;
}

function mergeSelectAndCustom(selectId, customId) {
    const s = document.getElementById(selectId)?.value.trim() || "";
    const c = document.getElementById(customId)?.value.trim() || "";

    if (s && c) return `${s}, ${c}`;
    if (s) return s;
    if (c) return c;
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
// POSTER MODE PROMPT GENERATION
// =========================================================

document.getElementById("affiche-generate-btn")?.addEventListener("click", () => {

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
    
    // 🔥 CORRECTION : Ensure a title style is always used for the title prompt block
    const styleTitre = mergeSelectAndCustom("aff_style_titre", "aff_style_titre_custom") || "cinematic, elegant contrast";


    const hasTitle = Boolean(titre);
    const hasSubtitle = Boolean(sousTitre);
    const hasTagline = Boolean(tagline);

    let textBlock = "";

    // 👉 If no text is provided: total text neutralization
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

${hasTitle ? `TITLE: "${titre}" (top area, clean, sharp, readable, no distortion, TEXT STYLE: ${styleTitre})` : ""}
${hasSubtitle ? `SUBTITLE: "${sousTitre}" (under title, smaller, crisp, readable)` : ""}
${hasTagline ? `TAGLINE: "${tagline}" (bottom area, subtle, readable)` : ""}

Rules for text:
- Only the items above are permitted.
- No additional text, no hallucinated wording.
- No extra letters, no random symbols.
- No decorative scribbles resembling handwriting.
- TEXT STYLE / MATERIAL (APPLIES ONLY TO LETTERING):
  ${styleTitre}.
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
    }

    log("🎨 Poster prompt generated (anti-text-hallucination version)");
});

// =========================================================
// RANDOM POSTER — LOADING + AUTOMATIC GENERATION
// =========================================================

let RANDOM_AFFICHE_DATA = null;

// Load the JSON file once
async function loadRandomAfficheJSON() {
    if (RANDOM_AFFICHE_DATA) return RANDOM_AFFICHE_DATA;

    try {
        const resp = await fetch("random_affiche_data.json");
        if (!resp.ok) {
            console.error("❌ random_affiche_data.json file not found!");
            return null;
        }

        RANDOM_AFFICHE_DATA = await resp.json();
        console.log("📁 random_affiche_data.json loaded!");
        return RANDOM_AFFICHE_DATA;

    } catch (e) {
        console.error("Error loading random JSON:", e);
        return null;
    }
}

// Random pick
function pickRandom(arr) {
    if (!arr || !arr.length) return "";
    const idx = Math.floor(Math.random() * arr.length);
    return arr[idx];
}

// Mass injection into fields
function fillAfficheFieldsFromRandom(randomObj) {
    if (!randomObj) return;

    // ATTENTION: Les clés ici correspondent aux IDs des champs du formulaire
    // et DOIVENT rester en français (aff_titre, aff_sous_titre, etc.).
    // Les valeurs reçues dans randomObj sont les clés anglaises du JSON.
    setValue("aff_titre", randomObj.title || ""); // CORRIGÉ: de randomObj.titre à randomObj.title
    setValue("aff_sous_titre", randomObj.subtitle || ""); // CORRIGÉ: de randomObj.sous_titre à randomObj.subtitle
    setValue("aff_tagline", randomObj.tagline || "");

    if (randomObj.theme) {
        setValue("aff_theme_custom", randomObj.theme);
        const s = document.getElementById("aff_theme");
        if (s) s.value = "";
    }

    if (randomObj.ambience) { // CORRIGÉ: de randomObj.ambiance à randomObj.ambience
        setValue("aff_ambiance_custom", randomObj.ambience);
        const s = document.getElementById("aff_ambiance");
        if (s) s.value = "";
    }

    if (randomObj.character) { // CORRIGÉ: de randomObj.personnage à randomObj.character
        setValue("aff_perso_desc", randomObj.character);
        const s = document.getElementById("aff_perso_sugg");
        if (s) s.value = "";
    }

    if (randomObj.environment) { // CORRIGÉ: de randomObj.environnement à randomObj.environment
        setValue("aff_env_desc", randomObj.environment);
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

    if (randomObj.title_style) { // CORRIGÉ: de randomObj.style_titre à randomObj.title_style
        setValue("aff_style_titre_custom", randomObj.title_style);
        const s = document.getElementById("aff_style_titre");
        if (s) s.value = "";
    }
}

// DOMContentLoaded → hook up random button
document.addEventListener("DOMContentLoaded", () => {

    const randomBtn = document.getElementById("affiche-random-btn");
    if (!randomBtn) return;

    randomBtn.addEventListener("click", async () => {
        console.log("🎲 Random click detected!");

        const data = await loadRandomAfficheJSON();
        if (!data) return;

        // CORRIGÉ: Utilisation des clés en ANGLAIS (titles, themes, etc.) pour pickRandom
        const theme = pickRandom(data.themes);
        const ambiance = pickRandom(data.ambiences);
        const perso = pickRandom(data.characters);
        const env = pickRandom(data.environments);
        const action = pickRandom(data.actions);
        const palette = pickRandom(data.palettes);
        const styleTitre = pickRandom(data.title_styles); // CORRIGÉ: title_styles
        const details = pickRandom(data.details);
        const titre = pickRandom(data.titles); // CORRIGÉ: titles
        const sousTitre = pickRandom(data.subtitles); // CORRIGÉ: subtitles
        const tagline = pickRandom(data.taglines || []);

        const randomObj = {
            title: titre, // CORRIGÉ: Clés de l'objet temporaire en anglais
            subtitle: sousTitre, // CORRIGÉ: Clés de l'objet temporaire en anglais
            tagline,
            theme,
            ambience: ambiance, // CORRIGÉ: Clés de l'objet temporaire en anglais
            character: perso, // CORRIGÉ: Clés de l'objet temporaire en anglais
            environment: env, // CORRIGÉ: Clés de l'objet temporaire en anglais
            action,
            palette,
            title_style: styleTitre, // CORRIGÉ: Clés de l'objet temporaire en anglais
            details
        };

        fillAfficheFieldsFromRandom(randomObj);

        console.log("🎲 Poster fields filled randomly:", randomObj);
    });
});

// =========================================================
// QUICK FORMATS MANAGEMENT
// =========================================================

document.addEventListener("DOMContentLoaded", () => {
    const fmtIcons = document.querySelectorAll(".fmt-icon");
    const widthInput = document.getElementById("width-input");
    const heightInput = document.getElementById("height-input");

    fmtIcons.forEach(icon => {
        icon.addEventListener("click", () => {
            const w = icon.dataset.w;
            const h = icon.dataset.h;
            if (!w || !h) return;

            fmtIcons.forEach(i => i.classList.remove("selected-format"));
            icon.classList.add("selected-format");

            if (widthInput) widthInput.value = w;
            if (heightInput) heightInput.value = h;

            log(`Quick format selected: ${w}x${h}`);
        });
    });
});

// =========================================================
// FAKE PROGRESS + AUTO /result DETECTION (POLLING)
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
        // FAKE Animation up to 92 %
        fakeProgress = Math.min(fakeProgress + 7, 92);

        if (percentSpan) percentSpan.textContent = fakeProgress + "%";
        if (innerBar) innerBar.style.width = fakeProgress + "%";

        // Direct test if result is available
        try {
            // Use /progress for status
            const resCheck = await fetch(`${API_BASE_URL}/progress/${promptId}`); 

            if (resCheck.ok) {
                const data = await resCheck.json();
                
                // Check if status indicates generation is complete
                if (data.status && data.status.completed) {
                    clearInterval(pollingProgressInterval);
                    pollingProgressInterval = null;

                    if (percentSpan) percentSpan.textContent = "100%";
                    if (innerBar) innerBar.style.width = "100%";

                    showProgressOverlay(false);

                    if (statusPill) {
                        statusPill.textContent = "DONE";
                        statusPill.classList.remove("pill");
                        statusPill.classList.add("pill-green");
                    }

                    fetchResult(promptId); // Calls the function to fetch the final image
                    return;
                }
            }

        } catch (e) {
            // Not ready yet or JSON parsing error → continue polling
        }

    }, POLLING_INTERVAL_MS);
}

// =========================================================
// RESULT RETRIEVAL /result/{prompt_id}
// =========================================================

async function fetchResult(promptId) {
    try {
        log("Retrieving result for:", promptId);
        // Use /result for the final image
        const resp = await fetch(`${API_BASE_URL}/result/${promptId}`); 
        if (!resp.ok) {
            log("Result HTTP not OK:", resp.status);
            setError("Could not retrieve result at this time.");
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
        img.alt = "Generated image";
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
                
                // Update the download link text (translated)
                dlLink.textContent = `Download (${filename})`; 
                modal.style.display = "flex";
            }
        });

        resultArea.appendChild(img);

        // Update metadata (translated from the French file)
        const metaSeed = document.getElementById("meta-seed");
        const metaSteps = document.getElementById("meta-steps");
        const metaCfg = document.getElementById("meta-cfg");
        const metaSampler = document.getElementById("meta-sampler");

        if (metaSeed) metaSeed.textContent = data.seed || "–";
        if (metaSteps) metaSteps.textContent = data.steps || "–";
        if (metaCfg) metaCfg.textContent = data.cfg_scale || "–";
        if (metaSampler) metaSampler.textContent = data.sampler || "–";


        if (lastGenerationStartTime) {
            const diffMs = Date.now() - lastGenerationStartTime;
            const sec = (diffMs / 1000).toFixed(1);
            const timeTakenEl = document.getElementById("time-taken");
            if (timeTakenEl) timeTakenEl.textContent = `${sec}s`;
        }

        setError("");

    } catch (e) {
        console.error("Error fetchResult:", e);
        setError("Error while retrieving the generated image.");
    }
}

// =========================================================
// FORM SUBMISSION → /generate
// =========================================================

async function startGeneration(e) {
    e.preventDefault();

    setError("");

    const formEl = document.getElementById("generation-form");
    if (!formEl) return;

    const formData = new FormData(formEl);

    const wfName = document.getElementById("workflow-select")?.value;
    if (!wfName) {
        setError("Please select a workflow.");
        return;
    }

    log("Starting actual generation sequence (Max 3 attempts)...");

    const generateBtn = document.getElementById("generate-button");
    if (generateBtn) {
        generateBtn.disabled = true;
        generateBtn.querySelector(".dot").style.background = "#fbbf24";
        generateBtn.innerHTML = `<span class="dot"></span>Generation in progress…`;
    }

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
                body: formData
            });

            if (!resp.ok) {
                log(`Attempt ${attempt} → HTTP ${resp.status}`);
                if (attempt < maxAttempts) {
                    await new Promise(r => setTimeout(r, 5000));
                    continue;
                } else {
                    throw new Error("Failed after multiple attempts.");
                }
            }

            const data = await resp.json();
            if (!data.prompt_id) {
                throw new Error("Invalid response from /generate (missing prompt_id)");
            }

            success = true;
            finalPromptId = data.prompt_id;

        } catch (err) {
            console.error(`Error attempt ${attempt}:`, err);
            log(`Attempt ${attempt}/${maxAttempts}: Failed. Retrying in 5 seconds...`);

            if (attempt >= maxAttempts) {
                setError("Failed to send generation after multiple attempts.");
            }

            await new Promise(r => setTimeout(r, 5000));
        }
    }

    if (success && finalPromptId) {
        currentPromptId = finalPromptId;
        log("Final Prompt ID:", finalPromptId);
        pollProgress(finalPromptId);
    }

    if (generateBtn) {
        generateBtn.disabled = false;
        generateBtn.querySelector(".dot").style.background = "rgba(15,23,42,0.9)";
        generateBtn.innerHTML = `<span class="dot"></span>Start Generation`;
    }
}

// =========================================================
// GLOBAL INIT (DOMContentLoaded)
// =========================================================

function autoClearOnSelect(selectId, customId) {
    const sel = document.getElementById(selectId);
    const custom = document.getElementById(customId);

    if (!sel || !custom) return;

    sel.addEventListener("change", () => {
        if (sel.value && custom.value.trim() !== "") {
            custom.value = ""; // Clear the custom field
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {

    // =========================================================
    // AUTO-CLEAR FOR EACH SELECT → CUSTOM FIELD
    // =========================================================
    autoClearOnSelect("aff_style_titre", "aff_style_titre_custom");
    autoClearOnSelect("aff_theme", "aff_theme_custom");
    autoClearOnSelect("aff_ambiance", "aff_ambiance_custom");
    autoClearOnSelect("aff_perso_sugg", "aff_perso_desc");
    autoClearOnSelect("aff_env_sugg", "aff_env_desc");
    autoClearOnSelect("aff_action_sugg", "aff_action_desc");
    autoClearOnSelect("aff_palette", "aff_palette_custom");

    // =========================================================
    // GENERAL INIT
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

    // Copy parameters button (translated)
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
                log("Parameters copied to clipboard.");
            });
        });
    }

    // Generate Poster Prompt button (translated)
    const btnPrompt = document.getElementById("affiche-generate-btn");
    if (btnPrompt) {
        btnPrompt.addEventListener("click", () => {
            btnPrompt.classList.add("clicked");
            btnPrompt.innerHTML = "✨ Generating...";
            setTimeout(() => {
                btnPrompt.classList.remove("clicked");
                btnPrompt.innerHTML = "✨ Generate Poster Prompt";
            }, 600);
        });
    }

    // =========================================================
    // MODE SWITCHER LOGIC
    // =========================================================
    const modeCards = document.querySelectorAll(".mode-card");
    const afficheMenu = document.getElementById("affiche-menu");
    const generateButton = document.getElementById("generate-button");
    const afficheGenerateBtnWrapper = document.getElementById("affiche-generate-button-wrapper");

    modeCards.forEach(card => {
        card.addEventListener("click", () => {
            modeCards.forEach(c => c.classList.remove("active-mode"));
            card.classList.add("active-mode");

            const mode = card.dataset.mode;

            if (mode === "affiche") { // Poster Mode
                if (afficheMenu) afficheMenu.style.display = "block";
                selectWorkflow("affiche.json"); 

                // The SUBMIT button and the POSTER wrapper are visible
                if (generateButton) generateButton.style.display = 'block'; 
                if (afficheGenerateBtnWrapper) afficheGenerateBtnWrapper.style.display = 'block';

            } else { // Image Mode (default)
                // If not POSTER mode, hide it
                if (afficheMenu) afficheMenu.style.display = "none";
                // selectWorkflow("default_image.json"); could be added here

                // The SUBMIT button is visible, the POSTER wrapper is hidden
                if (generateButton) generateButton.style.display = 'block'; 
                if (afficheGenerateBtnWrapper) afficheGenerateBtnWrapper.style.display = 'none';
            }
        });
    });
    // =========================================================
    // FINAL INITIALIZATION (SIMULATE CLICK TO INITIALIZE DISPLAY)
    // =========================================================
    
    // Simulate a click on the default active card to initialize display
    const defaultModeCard = document.querySelector(".mode-card.active-mode");
    if (defaultModeCard) {
        // Trigger the click event to apply visibility logic
        defaultModeCard.dispatchEvent(new Event('click'));
    }

    setInterval(refreshGPU, 10000);
    refreshGPU();
    loadWorkflows();

});
