import { ImageIcon, Download, Sparkles } from 'lucide-react';
import { GeneratedImage } from '../App';
import { useEffect, useRef, useState } from 'react';
import { ImageLightbox } from './ImageLightbox';

interface PreviewPanelProps {
  currentImage: GeneratedImage | null;
  savedGallery: GeneratedImage[];
  isGenerating: boolean;
  onSelectImage: (image: GeneratedImage) => void;
  onSaveToGallery: (image: GeneratedImage) => void;
  onStartGeneration?: () => void;

  // ✅ NOM UNIFIÉ
  mode?: 'poster' | 'camera_angles';
}

const IMAGE_FORMATS = [
  { width: 1920, height: 1080, label: 'Paysage' },
  { width: 1080, height: 1920, label: 'Portrait' },
  { width: 1080, height: 1080, label: 'Carré' },
];

export function PreviewPanel({
  currentImage,
  savedGallery,
  isGenerating,
  onSelectImage,
  onSaveToGallery,
  onStartGeneration,
  mode = 'poster',
}: PreviewPanelProps) {
  const imagePreviewRef = useRef<HTMLDivElement>(null);
  const [lightboxImage, setLightboxImage] = useState<GeneratedImage | null>(null);

  useEffect(() => {
    if (currentImage && !isGenerating) {
      imagePreviewRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentImage, isGenerating]);

  return (
    <div className={`p-6 h-full ${mode === 'camera_angles' ? 'bg-gray-900' : 'bg-black'}`}>
      {/* HEADER */}
      <div className="flex items-center gap-2 mb-6">
        <ImageIcon className="w-5 h-5 text-purple-400" />
        <h2 className="text-white">
          {mode === 'camera_angles'
            ? 'Aperçu – Angle de caméra'
            : 'Résultat & Prévisualisation'}
        </h2>
      </div>

      {/* ✅ FORMATS — UNIQUEMENT POUR POSTER */}
      {mode === 'poster' && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          {IMAGE_FORMATS.map(f => (
            <div
              key={f.label}
              className="bg-gray-800 text-gray-300 text-center py-2 rounded-lg text-sm"
            >
              {f.label}
            </div>
          ))}
        </div>
      )}

      {/* ✅ BOUTON GÉNÉRER */}
      {onStartGeneration && (
        <button
          onClick={onStartGeneration}
          disabled={isGenerating}
          className="w-full mb-6 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-white py-3 rounded-lg flex items-center justify-center gap-3"
        >
          <Sparkles className="w-5 h-5" />
          {isGenerating ? 'Génération…' : 'Générer'}
        </button>
      )}

      {/* PREVIEW */}
      <div ref={imagePreviewRef} className="flex justify-center">
        {currentImage ? (
          <img
            src={currentImage.imageUrl}
            className="max-h-[520px] rounded-lg cursor-pointer"
            onClick={() => setLightboxImage(currentImage)}
          />
        ) : (
          <div className="w-full max-w-md aspect-square bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 text-sm">
            {mode === 'camera_angles'
              ? 'Choisis un angle puis clique sur Générer'
              : 'Aucune image générée'}
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
