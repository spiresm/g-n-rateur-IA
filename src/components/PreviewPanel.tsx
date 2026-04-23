import { useEffect, useRef, useState } from 'react';
import { GeneratedImage } from '../App';
import { ImageLightbox } from './ImageLightbox';

interface ImageDimensions {
  width: number;
  height: number;
  label: 'Portrait' | 'Paysage' | 'Carré';
}

interface PreviewPanelProps {
  currentImage: GeneratedImage | null;
  savedGallery: GeneratedImage[];
  isGenerating: boolean;
  onSelectImage: (image: GeneratedImage) => void;
  onSaveToGallery: (image: GeneratedImage) => void;
  onStartGeneration?: () => void;
  mode?: 'poster' | 'cameraAngles';
  imageDimensions: ImageDimensions;
  onChangeFormat: (dims: ImageDimensions) => void;
}

const IMAGE_FORMATS: ImageDimensions[] = [
  { label: 'Portrait', width: 1080, height: 1920 },
  { label: 'Paysage',  width: 1920, height: 1080 },
  { label: 'Carré',   width: 1024, height: 1024 },
];

const C = {
  panel:      '#181818',
  panelAlt:   '#222',
  bgAlt:      '#131313',
  border:     '#2a2a2a',
  accent:     '#d4af37',
  accentSoft: 'rgba(212,175,55,0.15)',
  text:       '#f2f2f2',
  muted:      '#aaaaaa',
  radius:     '16px',
  radiusMd:   '12px',
};

const FORMAT_ICONS: Record<string, string> = {
  Portrait: '📱',
  Paysage:  '🖥️',
  Carré:    '⬛',
};

export function PreviewPanel({
  currentImage,
  savedGallery,
  isGenerating,
  onSelectImage,
  onSaveToGallery,
  onStartGeneration,
  imageDimensions,
  onChangeFormat,
  mode = 'poster',
}: PreviewPanelProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [lightboxImage, setLightboxImage] = useState<GeneratedImage | null>(null);

  useEffect(() => {
    if (currentImage && !isGenerating) {
      ref.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentImage, isGenerating]);

  return (
    <div style={{ padding: 24, background: C.panel, height: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* PANEL HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>🖼️</span>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, color: C.text }}>Résultat & Prévisualisation</div>
            <div style={{ fontSize: 12, color: C.muted }}>Prévisualisation en temps réel et image finale.</div>
          </div>
        </div>
        <span style={{
          fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 12,
          background: isGenerating ? 'rgba(212,175,55,0.15)' : 'rgba(76,175,80,0.15)',
          color: isGenerating ? C.accent : '#4CAF50',
        }}>
          {isGenerating ? 'RUNNING' : 'PRÊT'}
        </span>
      </div>

      {/* FORMAT RAPIDE */}
      {mode === 'poster' && (
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 10 }}>
            Format Rapide
          </label>
          <div style={{ display: 'flex', gap: 10 }}>
            {IMAGE_FORMATS.map((fmt) => {
              const active = imageDimensions.label === fmt.label;
              return (
                <button
                  key={fmt.label}
                  type="button"
                  onClick={() => onChangeFormat(fmt)}
                  style={{
                    flex: 1, padding: '9px 8px', borderRadius: C.radiusMd, cursor: 'pointer',
                    border: `1px solid ${active ? C.accent : C.border}`,
                    background: active ? C.accentSoft : C.panelAlt,
                    color: active ? C.accent : C.muted,
                    fontSize: 13, fontWeight: 600,
                    boxShadow: active ? '0 0 10px rgba(212,175,55,0.2)' : 'none',
                    transition: 'all 0.2s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}
                >
                  <span>{FORMAT_ICONS[fmt.label]}</span>
                  <span>{fmt.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* BOUTON GÉNÉRER */}
      {onStartGeneration && (
        <button
          type="button"
          onClick={onStartGeneration}
          disabled={isGenerating}
          style={{
            width: '100%', padding: 13, borderRadius: C.radiusMd, border: 'none', cursor: isGenerating ? 'not-allowed' : 'pointer',
            background: isGenerating ? '#555' : C.accent, color: isGenerating ? '#aaa' : '#0b0b0b',
            fontSize: 15, fontWeight: 700, transition: 'all 0.2s',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          {isGenerating ? '⏳ Génération en cours…' : '✨ Générer'}
        </button>
      )}

      {/* ZONE RÉSULTAT */}
      <div ref={ref} style={{
        flex: 1, minHeight: 200, maxHeight: '40vh',
        background: C.bgAlt, borderRadius: C.radiusMd,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden', padding: 10,
      }}>
        {currentImage ? (
          <img
            src={currentImage.imageUrl}
            alt="Résultat"
            onClick={() => setLightboxImage(currentImage)}
            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 10, cursor: 'zoom-in' }}
          />
        ) : (
          <p style={{ fontSize: 12, color: C.muted, textAlign: 'center', padding: 20 }}>
            Aucune image encore générée.<br />
            Configurez vos paramètres à gauche et cliquez sur <strong style={{ color: C.text }}>"Générer"</strong>.
          </p>
        )}
      </div>

      {/* GALERIE */}
      {savedGallery.length > 0 && (
        <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.muted, marginBottom: 10 }}>Galerie</div>
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', padding: '4px 2px', scrollbarWidth: 'thin' }}>
            {savedGallery.map((img) => (
              <img
                key={img.id}
                src={img.imageUrl}
                alt="Généré"
                onClick={() => { onSelectImage(img); setLightboxImage(img); }}
                style={{
                  flex: '0 0 auto', width: 85, aspectRatio: '9/16',
                  objectFit: 'cover', borderRadius: 8, cursor: 'zoom-in',
                  border: `1px solid ${C.border}`,
                  transition: 'transform 0.15s, box-shadow 0.15s',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.05)'; (e.currentTarget as HTMLImageElement).style.boxShadow = '0 6px 18px rgba(0,0,0,0.4)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLImageElement).style.transform = 'none'; (e.currentTarget as HTMLImageElement).style.boxShadow = 'none'; }}
              />
            ))}
          </div>
        </div>
      )}

      {/* LIGHTBOX */}
      {lightboxImage && (
        <ImageLightbox
          open
          onOpenChange={() => setLightboxImage(null)}
          image={lightboxImage}
          gallery={savedGallery}
          onSelectImage={onSelectImage}
        />
      )}
    </div>
  );
}
