/* =========================================================
   PALETTE PREMIUM OR & NOIR
========================================================= */
:root {
  --bg: #0b0b0b;
  --bg-alt: #131313;
  --panel: #181818;
  --panel-alt: #222;
  --accent: #d4af37;
  --accent-soft: rgba(212,175,55,0.15);
  --accent-strong: #f4d47c;
  --border: #2a2a2a;
  --text: #f2f2f2;
  --muted: #aaaaaa;
  --danger: #ff4f4f;
  --radius-lg: 16px;
  --radius-md: 12px;
  --shadow-soft: 0 18px 50px rgba(0,0,0,0.55);
}

* { box-sizing: border-box; }
html, body { height: 100%; }

body {
  margin: 0;
  padding: 0;
  font-family: "Inter", system-ui, sans-serif;
  background: radial-gradient(circle at top, #1a1a1a 0%, #0b0b0b 70%);
  color: var(--text);
}

.app-shell {
  max-width: 1400px;
  margin: 0 auto;
  padding: 30px;
}

/* =========================================================
   HEADER
========================================================= */
header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
  padding: 10px 0;
  border-bottom: 1px solid var(--border);
}

.title-group {
  display: flex;
  align-items: center;
  gap: 15px;
}

header h1 {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  line-height: 1;
}

.title-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 600;
  background-color: var(--accent-soft);
  color: var(--accent-strong);
  padding: 4px 8px;
  border-radius: 6px;
}

.title-chip span {
  display: block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: var(--accent);
}

.gpu-card {
  display: flex;
  align-items: center;
  background-color: var(--panel-alt);
  padding: 8px 12px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  gap: 15px;
}

.gpu-main { display: flex; flex-direction: column; }
.gpu-label { font-size: 10px; color: var(--muted); font-weight: 600; }
.gpu-main strong { font-size: 14px; font-weight: 700; line-height: 1; margin-top: 2px; }
.gpu-pills { display: flex; gap: 6px; margin-top: 4px; }
.gpu-pill { font-size: 10px; color: var(--muted); }
.gpu-status-indicator { display: flex; align-items: center; gap: 6px; }
.gpu-dot { width: 8px; height: 8px; border-radius: 50%; background-color: #4CAF50; }
.gpu-value { font-size: 14px; font-weight: 600; }

/* =========================================================
   MODE SELECTOR
========================================================= */
.mode-selector {
  display: flex;
  gap: 20px;
  margin-bottom: 24px;
}

.mode-card {
  flex: 1;
  background-color: var(--panel);
  border: 2px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 0;
  height: 180px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
  overflow: hidden;
}

.mode-card:hover {
  border-color: #666;
  transform: translateY(-2px);
  box-shadow: 0 0 10px rgba(255,255,255,0.05);
}

.mode-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.active-mode {
  border-color: var(--accent) !important;
  transform: translateY(-4px);
  box-shadow: 0 0 20px rgba(212,175,55,0.25);
}

/* =========================================================
   LAYOUT / PANELS
========================================================= */
.layout {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 24px;
}

@media (max-width: 900px) {
  .layout { grid-template-columns: 1fr; }
}

.panel {
  background-color: var(--panel);
  border-radius: var(--radius-lg);
  padding: 20px;
  box-shadow: var(--shadow-soft);
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.panel-title .icon { font-size: 20px; line-height: 1; }

.panel-title div {
  font-size: 16px;
  font-weight: 600;
}

.panel-sub {
  font-size: 12px;
  font-weight: 400;
  color: var(--muted);
}

/* pills */
.pill, .pill-green, .pill-warning, .pill-danger {
  font-size: 11px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 12px;
}

.pill { background-color: var(--panel-alt); color: var(--muted); }
.pill-green { background-color: rgba(76,175,80,0.15); color: #4CAF50; }
.pill-warning { background-color: rgba(251,191,36,0.15); color: #fbbf24; }
.pill-danger { background-color: rgba(255,79,79,0.15); color: var(--danger); }

/* =========================================================
   FORM ELEMENTS
========================================================= */
.section {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid var(--border);
}
.section:first-child { border-top: none; padding-top: 0; margin-top: 0; }

label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 5px;
  color: var(--text);
}

.ui-input, .ui-select {
  width: 100%;
  padding: 10px 12px;
  background-color: var(--bg-alt);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  color: var(--text);
  font-size: 14px;
  transition: border-color 0.2s, background-color 0.2s;
}

.ui-input:focus, .ui-select:focus { border-color: var(--accent); outline: none; }

.ui-input.textarea { min-height: 100px; resize: vertical; }

.row { display: flex; gap: 15px; }
.row > div { flex: 1; }

/* Affiche: select + input sur la même ligne */
.input-group-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 10px;
}

/* =========================================================
   SLIDERS
========================================================= */
input[type=range] {
  -webkit-appearance: none;
  width: 100%;
  height: 5px;
  background: #333;
  border-radius: 5px;
  margin-top: 10px;
}

input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background: var(--accent);
  cursor: pointer;
  box-shadow: 0 0 5px rgba(212,175,55,0.5);
}

/* =========================================================
   BUTTONS
========================================================= */
.btn-main, .btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 18px;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: background-color 0.2s, border-color 0.2s;
  text-decoration: none;
  line-height: 1;
}

.btn-main {
  background-color: var(--accent);
  color: #0b0b0b;
  border: 1px solid var(--accent);
}

.btn-main:hover { background-color: var(--accent-strong); border-color: var(--accent-strong); }

.btn-secondary {
  background-color: var(--panel-alt);
  color: var(--text);
  border: 1px solid var(--border);
}

.btn-secondary:hover { background-color: #333; border-color: #444; }

.btn-main .dot { width: 8px; height: 8px; border-radius: 50%; background-color: #0b0b0b; }

/* =========================================================
   RESULT AREA (✅ plein largeur + centré + pas bridé)
   Le HTML met #progress-overlay à l'intérieur de #result-area :contentReference[oaicite:1]{index=1}
========================================================= */
#result-area {
  width: 100%;
  border-radius: var(--radius-md);
  background: rgba(0,0,0,0.15);
  border: 1px solid var(--border);
  padding: 12px;

  display: flex;
  align-items: center;
  justify-content: center;

  /* hauteur raisonnable sans casser */
  min-height: 220px;
  max-height: 60vh;

  overflow: hidden;
}

#result-area img.result-image {
  width: 100%;         /* ✅ prend la largeur de la box */
  height: 100%;
  max-height: 100%;
  object-fit: contain; /* ✅ pas déformée */
  border-radius: 12px;
  display: block;
}

/* placeholder */
#result-placeholder p { margin: 0; }

/* =========================================================
   GALERIE (✅ visible + thumbs visibles)
   HTML: #gallery + #gallery-grid :contentReference[oaicite:2]{index=2}
========================================================= */
#gallery {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid var(--border);
  display: block;
}

.gallery-header {
  font-size: 13px;
  font-weight: 600;
  color: var(--muted);
  margin-bottom: 10px;
}

#gallery-grid {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  overflow-y: hidden;
  scroll-behavior: smooth;
  padding: 10px 4px;
  min-height: 120px; /* ✅ évite “galerie vide invisible” */
}

#gallery-grid::-webkit-scrollbar { height: 6px; }
#gallery-grid::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.25); border-radius: 3px; }

.gallery-thumb {
  flex: 0 0 auto;
  width: 110px;
  aspect-ratio: 9 / 16;
  object-fit: cover;
  border-radius: 10px;
  cursor: pointer;
  border: 1px solid rgba(255,255,255,0.08);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.gallery-thumb:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 18px rgba(0,0,0,0.35);
}

@media (max-width: 900px) {
  .gallery-thumb { width: 90px; border-radius: 8px; }
  #generate-button { width: 100%; }
}

/* =========================================================
   QUICK FORMAT
========================================================= */
.quick-format-icons {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.fmt-icon {
  display: inline-block;
  padding: 8px 12px;
  background-color: var(--panel-alt);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  transition: all 0.2s;
}
.fmt-icon:hover { background-color: #333; border-color: var(--accent); transform: translateY(-2px); }
.fmt-icon.active { background-color: var(--accent-soft); border-color: var(--accent); box-shadow: 0 0 10px rgba(212,175,55,0.2); }

/* =========================================================
   PROGRESS OVERLAY (✅ une seule définition, cohérente avec JS: .active)
========================================================= */
#progress-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.75);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  z-index: 10000;

  display: none;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

#progress-overlay.active { display: flex; }

#progress-spinner {
  border: 4px solid rgba(255,255,255,0.3);
  border-top: 4px solid var(--accent);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

#progress-meta { font-size: 14px; font-weight: 600; color: var(--text); margin-bottom: 10px; text-align: center; }
#progress-percent { margin-left: 10px; color: var(--accent); }

.progress-bar-large {
  width: min(420px, 90vw);
  height: 8px;
  background-color: rgba(255,255,255,0.1);
  border-radius: 4px;
  overflow: hidden;
  margin-top: 5px;
}

.progress-inner-large {
  height: 100%;
  width: 0%;
  background-color: var(--accent);
  transition: width 0.1s linear;
}

/* =========================================================
   MODAL IMAGE (✅ correspond à ton HTML: #image-modal.image-modal)
========================================================= */
.image-modal {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.85);
  display: none;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 24px;
}

.image-modal.active { display: flex; }

.image-modal-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.image-modal img {
  max-width: 90vw;
  max-height: 90vh;
  object-fit: contain;
  border-radius: 12px;
}

.image-modal-close {
  position: absolute;
  top: 16px;
  right: 20px;
  font-size: 28px;
  color: white;
  cursor: pointer;
  user-select: none;
  background: transparent;
  border: 0;
}

/* =========================================================
   MISC
========================================================= */
.separator {
  border: none;
  border-top: 1px solid #333;
  margin: 22px 0;
  opacity: 0.4;
}

.metadata-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px 15px;
  font-size: 13px;
  color: var(--muted);
}
.metadata-grid strong { color: var(--text); font-weight: 600; }
