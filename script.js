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

function decodeGoogleToken() {
  const token = localStorage.getItem("google_id_token");
  if (!token) return null;

  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;

    // ✅ conversion Base64URL → Base64
    const base64 = base64Url
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(base64Url.length + (4 - base64Url.length % 4) % 4, "=");

    const payload = JSON.parse(atob(base64));
    return payload;
  } catch (e) {
    console.error("❌ Erreur décodage token Google", e);
    return null;
  }
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
// ✅ HELPERS: SIZE / FORMAT
// =========================================================

function getSizeInputs() {
  const wInput = document.getElementById("width-input");
  const hInput = document.getElementById("height-input");
  return { wInput, hInput };
}

function getCurrentSize() {
  const { wInput, hInput } = getSizeInputs();
  const w = parseInt(wInput?.value || "0", 10);
  const h = parseInt(hInput?.value || "0", 10);
  return {
    width: Number.isFinite(w) && w > 0 ? w : 0,
    height: Number.isFinite(h) && h > 0 ? h : 0
  };
}

function inferFormatFromSize(w, h) {
  if (w === 1920 && h === 1080) return "horizontal";
  if (w === 1080 && h === 1920) return "vertical";
  if (w === 1080 && h === 1080) return "carre";
  return "";
}

// =========================================================
// 📸 GALERIE CARROUSEL
// =========================================================

async function loadCarrouselGallery() {
  console.log("🟢 loadCarrouselGallery START");

  let images;
  try {
    const resp = await fetch("/carrousel.json", { cache: "no-store" });
    if (!resp.ok) throw new Error("HTTP " + resp.status);
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

  images.forEach((filename) => {
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
      thumb.src = fullPath;
    };

    thumb.addEventListener("click", () => {
      openImageModal(fullPath, filename);
    });

    gallery.appendChild(thumb);
  });

  console.log("✅ gallery populated:", images.length);
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
// 🆕 INJECTION AUTOMATIQUE + QUICK FORMAT (FIX)
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

  document.querySelectorAll(".fmt-icon").forEach(icon => {
    icon.addEventListener("click", () => {
      const w = icon.dataset.w;
      const h = icon.dataset.h;

      const { wInput: widthInput, hInput: heightInput } = getSizeInputs();

      if (widthInput && heightInput) {
        widthInput.value = w;
        heightInput.value = h;
      }

      document.querySelectorAll(".fmt-icon").forEach(i => i.classList.remove("active"));
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
    overlay.classList.add("active");
    labelSpan.textContent = label;
    percentSpan.textContent = "0%";
    innerBar.style.width = "0%";
    fakeProgress = 0;
  } else {
    overlay.classList.remove("active");
  }
}

// =========================================================
// ✅ NEW: CONTAINER POUR MULTI-IMAGES (ANGLES)
// =========================================================

function ensureAnglesGrid() {
  let grid = document.getElementById("angles-grid");
  if (grid) return grid;

  const resultArea = document.getElementById("result-area");
  if (!resultArea) return null;

  grid = document.createElement("div");
  grid.id = "angles-grid";
  grid.style.display = "grid";
  grid.style.gridTemplateColumns = "repeat(auto-fit, minmax(220px, 1fr))";
  grid.style.gap = "12px";
  grid.style.marginTop = "14px";

  resultArea.appendChild(grid);
  return grid;
}

function clearAnglesGrid() {
  const grid = document.getElementById("angles-grid");
  if (grid) grid.innerHTML = "";
}

function renderAnglesImages(imagesArray) {
  const grid = ensureAnglesGrid();
  if (!grid) return;

  grid.innerHTML = "";

  imagesArray.forEach((imgObj, idx) => {
    const wrap = document.createElement("div");
    wrap.style.borderRadius = "14px";
    wrap.style.overflow = "hidden";
    wrap.style.background = "rgba(15,23,42,0.35)";
    wrap.style.border = "1px solid rgba(255,255,255,0.08)";
    wrap.style.padding = "8px";

    const img = document.createElement("img");
    img.src = `data:image/png;base64,${imgObj.image_base64}`;
    img.style.width = "100%";
    img.style.borderRadius = "12px";
    img.style.cursor = "pointer";
    img.alt = imgObj.filename || `Angle ${idx + 1}`;

    img.addEventListener("click", () => {
      openImageModal(img.src);
    });

    const label = document.createElement("div");
    label.style.marginTop = "6px";
    label.style.fontSize = "12px";
    label.style.opacity = "0.85";
    label.textContent = imgObj.filename || `Angle ${idx + 1}`;

    wrap.appendChild(img);
    wrap.appendChild(label);
    grid.appendChild(wrap);
  });
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
// ... (le reste de ton script ne change pas)
// =========================================================


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

  const filename = src.startsWith("data:")
    ? "generated-image.png"
    : src.split("/").pop().split("?")[0];

  dl.setAttribute("download", filename);

  modal.style.display = "flex";
}

// =========================================================
// ✅ AFFICHAGE DU RÉSULTAT (FIX POUR MULTI-IMAGES)
// =========================================================

function displayImageAndMetadata(data) {
  const resultArea = document.getElementById("result-area");
  const placeholder = document.getElementById("result-placeholder");
  if (!resultArea) return;

  if (placeholder) placeholder.style.display = "none";

  // Nettoyage
  const imgExisting = resultArea.querySelector("img.result-image");
  if (imgExisting) imgExisting.remove();
  clearAnglesGrid();

  // ✅ CAS 1 : MULTI IMAGES (Angles)
  if (data.images && Array.isArray(data.images) && data.images.length > 0) {
    log(`✅ Résultat angles reçu : ${data.images.length} images`);
    renderAnglesImages(data.images);

    // status time
    if (lastGenerationStartTime) {
      const diffMs = Date.now() - lastGenerationStartTime;
      const sec = (diffMs / 1000).toFixed(1);
      const timeTakenEl = document.getElementById("time-taken");
      if (timeTakenEl) timeTakenEl.textContent = `${sec}s`;
    }

    return;
  }

  // ✅ CAS 2 : SINGLE IMAGE (Affiche / autres)
  const base64 = data.image_base64;
  if (!base64) {
    setError("Résultat invalide : aucune image reçue.");
    return;
  }

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
    openImageModal(img.src);
  });

  resultArea.appendChild(img);

  // reset metas
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
// ✅ IMPORTANT: le reste est identique à ton fichier original
// (pollProgress / startGeneration / init etc.)
// =========================================================
