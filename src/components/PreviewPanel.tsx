import { ImageIcon, Download, Sparkles } from 'lucide-react';
import { GeneratedImage } from '../App';
import { useState, useEffect, useRef } from 'react';
import { ImageLightbox } from './ImageLightbox';

interface PreviewPanelProps {
  currentImage: GeneratedImage | null;
  savedGallery: GeneratedImage[];
  isGenerating: boolean;
  onSelectImage: (image: GeneratedImage) => void;
  onSaveToGallery: (image: GeneratedImage) => void;
  onStartGeneration?: () => void;

  // 🔑 NOUVEAU
  mode?: 'poster' | 'camera_angles';
}

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
      setTimeout(() => {
        imagePreviewRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [currentImage, isGenerating]);

  const handleDownload = async (imageUrl: string) => {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `image-${Date.now()}.png`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /* =====================================================
     🎨 STYLE SELON WORKFLOW
     ===================================================== */
  const containerBg =
    mode === 'camera_angles'
      ? 'bg-gray-900'
      : 'bg-black';

  return (
    <div className={`p-6 h-full ${containerBg}`}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <ImageIcon className="w-5 h-5 text-purple-400" />
        <h2 className="text-white">
          {mode === 'camera_angles'
            ? 'Aperçu – Angle de caméra'
            : 'Résultat & Prévisualisation'}
        </h2>
      </div>

      {/* Bouton Générer (OBLIGATOIRE pour camera_angles) */}
      {onStartGeneration && (
        <div className="mb-6">
          <button
            onClick={onStartGeneration}
            disabled={isGenerating}
            className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-white py-3 rounded-lg flex items-center justify-center gap-3"
          >
            <Sparkles className="w-5 h-5" />
            {isGenerating ? 'Génération en cours…' : 'Générer'}
          </button>
        </div>
      )}

      {/* Preview */}
      <div ref={imagePreviewRef} className="flex justify-center">
        {isGenerating ? (
          <div className="w-full max-w-md aspect-square bg-gray-800 rounded-lg flex items-center justify-center">
            <div className="w-14 h-14 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : currentImage ? (
          <div className="text-center">
            <img
              src={currentImage.imageUrl}
              alt="Generated"
              className="rounded-lg max-h-[520px] mx-auto cursor-pointer"
              onClick={() => setLightboxImage(currentImage)}
            />

            <div className="flex gap-3 mt-4 justify-center">
              <button
                onClick={() => onSaveToGallery(currentImage)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
              >
                Sauvegarder
              </button>

              <button
                onClick={() => handleDownload(currentImage.imageUrl)}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Télécharger
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-md aspect-square bg-gray-800 rounded-lg flex items-center justify-center border border-dashed border-gray-700">
            <p className="text-gray-400 text-sm text-center px-6">
              {mode === 'camera_angles'
                ? 'Sélectionne un angle puis clique sur Générer'
                : 'Aucune image générée'}
            </p>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxImage && (
        <ImageLightbox
          open={true}
          onOpenChange={() => setLightboxImage(null)}
          image={lightboxImage}
          gallery={savedGallery}
          onSelectImage={onSelectImage}
        />
      )}
    </div>
  );
}
