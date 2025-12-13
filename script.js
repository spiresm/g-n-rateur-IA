/* =========================================================
   UTILITAIRES
========================================================= */

function decodeJwt(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

/* =========================================================
   GPU STATUS
========================================================= */

async function refreshGPU() {
  try {
    const resp = await fetch("/gpu_status");
    if (!resp.ok) throw new Error("GPU API down");

    const data = await resp.json();
    const pill = document.getElementById("gpu-pill");

    if (pill) {
      pill.textContent = data.status || "OK";
      pill.className = "pill pill-green";
    }
  } catch {
    const pill = document.getElementById("gpu-pill");
    if (pill) {
      pill.textContent = "GPU OFF";
      pill.className = "pill pill-danger";
    }
  }
}

/* =========================================================
   WORKFLOWS
========================================================= */

async function loadWorkflows() {
  try {
    const resp = await fetch("/workflows");
    if (!resp.ok) return;
    const data = await resp.json();
    console.log("Workflows loaded:", data);
  } catch (e) {
    console.warn("Workflows not loaded");
  }
}

/* =========================================================
   GALERIE CARROUSEL (VIGNETTES)
========================================================= */

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

    const img = document.createElement("img");
    img.src = thumbPath;
    img.className = "gallery-thumb";
    img.loading = "lazy";
    img.alt = filename;

    img.onerror = () => {
      console.warn("❌ Thumb not found:", thumbPath);
    };

    img.addEventListener("click", () => {
  const resultArea = document.getElementById("result-area");
  if (!resultArea) return;

  let mainImg = resultArea.querySelector("img.result-image");

  // 👉 si aucune image n’existe encore, on la crée
  if (!mainImg) {
    mainImg = document.createElement("img");
    mainImg.className = "result-image";
    mainImg.style.maxWidth = "100%";
    mainImg.style.display = "block";
    mainImg.style.margin = "0 auto";
    resultArea.appendChild(mainImg);
  }

  // 👉 on affiche l’image HD
  mainImg.src = fullPath;
});
/* =========================================================
   AUTH GOOGLE UI
========================================================= */

function initGoogleUserUI() {
  const token = localStorage.getItem("google_id_token");
  if (!token) return;

  const payload = decodeJwt(token);
  if (!payload) return;

  const avatar = document.getElementById("user-avatar");
  const name = document.getElementById("user-name");
  const info = document.getElementById("user-info");
  const status = document.getElementById("user-status");

  if (avatar && payload.picture) avatar.src = payload.picture;
  if (name) name.textContent = payload.name || payload.email || "";
  if (status) status.textContent = `Connected as ${payload.given_name || "user"}`;
  if (info) info.style.display = "flex";
}

/* =========================================================
   DOM READY — POINT D’ENTRÉE UNIQUE
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  console.log("🟢 App init");

  // Auth UI
  initGoogleUserUI();

  // GPU
  refreshGPU();
  setInterval(refreshGPU, 10000);

  // App data
  loadWorkflows();
  loadCarrouselGallery();
});
