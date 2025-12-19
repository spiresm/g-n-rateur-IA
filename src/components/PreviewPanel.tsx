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
  mode?: 'poster' | 'cameraAngles';
}

const IMAGE_FORMATS = [
  { label: 'Paysage' },
  { label: 'Portrait' },
  { label: 'Carré' },
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
  const ref = useRef<HTMLDivElement>(null);
  const [lightboxImage, setLightboxImage] = useState<GeneratedImage | null>(null);

  useEffect(() => {
    if (currentImage && !isGenerating) {
      ref.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentImage, isGenerating]);

  return (
    <div className={`p-6 h-full ${mode === 'cameraAngles' ? 'bg-gray-900' : 'bg-black'}`}>
      <div className="flex items-center gap-2 mb-6">
        <ImageIcon className="w-5 h-5 text-purple-400" />
        <h2 className="text-white">Résultat & Prévisualisation</h2>
      </div>

      {/* FORMATS → AFFICHE UNIQUEMENT */}
      {mode === 'poster' && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          {IMAGE_FORMATS.map(f => (
            <div
              key={f.label}
              className="bg-gray-800 py-2 rounded-lg text-center text-gray-300 text-sm"
            >
              {f.label}
            </div>
          ))}
        </div>
      )}

      {/* BOUTON GÉNÉRER */}
      {onStartGeneration && (
        <button
          onClick={onStartGeneration}
          disabled={isGenerating}
          className="w-full mb-6 bg-yellow-600 hover:bg-yellow-700 text-white py-3 rounded-lg flex items-center justify-center gap-2"
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
