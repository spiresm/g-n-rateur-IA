import { ImageIcon, Sparkles } from 'lucide-react';
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

  /* ✅ FORMAT (piloté par AppContent) */
  imageDimensions: ImageDimensions;
  onChangeFormat: (dims: ImageDimensions) => void;
}

const IMAGE_FORMATS: ImageDimensions[] = [
  { label: 'Portrait', width: 1080, height: 1920 },
  { label: 'Paysage', width: 1920, height: 1080 },
  { label: 'Carré', width: 1024, height: 1024 },
];

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

  /* ✅ Scroll UNIQUEMENT après génération */
  useEffect(() => {
    if (currentImage && !isGenerating) {
      ref.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentImage, isGenerating]);

  return (
    <div
      className={`p-6 h-full ${
        mode === 'cameraAngles' ? 'bg-gray-900' : 'bg-black'
      }`}
    >
      {/* HEADER */}
      <div className="flex items-center gap-2 mb-6">
        <ImageIcon className="w-5 h-5 text-purple-400" />
        <h2 className="text-white">Résultat & Prévisualisation</h2>
      </div>

      {/* FORMATS — COLONNE DE DROITE UNIQUEMENT */}
      {mode === 'poster' && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          {IMAGE_FORMATS.map((format) => {
            const isActive = imageDimensions.label === format.label;

            return (
              <button
                key={format.label}
                type="button"
                onClick={() => onChangeFormat(format)}
                className={`py-2 rounded-lg text-sm font-medium transition-all border
                  ${
                    isActive
                      ? 'bg-purple-600 border-purple-400 text-white'
                      : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                  }`}
              >
                {format.label}
              </button>
            );
          })}
        </div>
      )}

      {/* BOUTON GÉNÉRER */}
      {onStartGeneration && (
        <button
          type="button"
          onClick={onStartGeneration}
          disabled={isGenerating}
          className="w-full mb-6 bg-yellow-600 hover:bg-yellow-700 text-white py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-60"
        >
          <Sparkles className="w-4 h-4" />
          {isGenerating ? 'Génération…' : 'Générer'}
        </button>
      )}

      {/* PREVIEW */}
      <div ref={ref} className="flex justify-center">
        {currentImage ? (
          <img
            src={currentImage.imageUrl}
            className="max-h-[520px] rounded-lg cursor-pointer"
            onClick={() => setLightboxImage(currentImage)}
          />
        ) : (
          <div className="w-full max-w-md aspect-square bg-gray-800 rounded-lg flex items-center justify-center text-gray-400">
            Aucune image générée
          </div>
        )}
      </div>

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
