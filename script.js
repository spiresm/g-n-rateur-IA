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

    // ✅ LE CLICK DOIT ÊTRE ICI
    img.addEventListener("click", () => {
      const resultArea = document.getElementById("result-area");
      if (!resultArea) return;

      let mainImg = resultArea.querySelector("img.result-image");

      if (!mainImg) {
        mainImg = document.createElement("img");
        mainImg.className = "result-image";
        mainImg.style.maxWidth = "100%";
        mainImg.style.display = "block";
        mainImg.style.margin = "0 auto";
        resultArea.appendChild(mainImg);
      }

      mainImg.src = fullPath;
    });

    gallery.appendChild(img);
  });

  console.log("✅ gallery populated");
}
