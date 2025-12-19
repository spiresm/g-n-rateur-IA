import { ImageIcon, Download, Sparkles } from 'lucide-react';
import { GeneratedImage } from '../App';
import { useState, useEffect, useRef } from 'react';
import { SimpleAlertDialog } from './SimpleAlertDialog';
import { ImageLightbox } from './ImageLightbox';

type ImageFormat = {
  width: number;
  height: number;
  label: string;
};

const IMAGE_FORMATS: ImageFormat[] = [
  { width: 1920, height: 1080, label: 'Paysage' },
  { width: 1080, height: 1920, label: 'Portrait' },
  { width: 1080, height: 1080, label: 'Carré' }
];

interface PreviewPanelProps {
  currentImage: GeneratedImage | null;
  savedGallery: GeneratedImage[];
  isGenerating: boolean;
  onSelectImage: (image: GeneratedImage) => void;
  onCopyParameters: (image: GeneratedImage) => void;
  onSaveToGallery: (image: GeneratedImage) => void;
  generatedPrompt: string;
  onStartGeneration?: () => void;
  onFormatChange?: (width: number, height: number) => void;

  /** ✅ NOUVEAU : type de workflow */
  mode?: 'poster' | 'camera';
}

export function PreviewPanel({
  currentImage,
  savedGallery,
  isGenerating,
  onSelectImage,
  onSaveToGallery,
  onStartGeneration,
  onFormatChange,
  mode = 'poster'
}: PreviewPanelProps) {
  const isCamera = mode === 'camera';

  const [showCharte, setShowCharte] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<ImageFormat>(IMAGE_FORMATS[1]);
  const [lightboxImage, setLightboxImage] = useState<GeneratedImage | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number>(-1);
  const imagePreviewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentImage && !isGenerating && imagePreviewRef.current) {
      setTimeout(() => {
        imagePreviewRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [currentImage, isGenerating]);

  const handleStartGenerationSafe = () => {
    if (typeof onStartGeneration === 'function') {
      onStartGeneration();
    }
  };

  const handleDownload = async (imageUrl: string) => {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `image-${Date.now()}.jpg`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleFormatSelect = (format: ImageFormat) => {
    setSelectedFormat(format);
    onFormatChange?.(format.width, format.height);
  };

  const safeGallery = Array.isArray(savedGallery) ? savedGallery : [];

  return (
    <div className={`p-6 h-full ${isCamera ? 'bg-gray-950' : 'bg-black'}`}>
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-purple-400" />
          <h2 className="text-white">
            {isCamera ? 'Aperçu angle caméra' : 'Résultat & Prévisualisation'}
          </h2>
        </div>
      </div>

      {/* FORMATS — UNIQUEMENT POUR POSTER */}
      {!isCamera && onStartGeneration && (
        <div className="mb-4">
          <h3 className="text-gray-300 mb-3 text-sm">Format de l'image</h3>
          <div className="grid grid-cols-3 gap-3">
            {IMAGE_FORMATS.map(format => {
              const isSelected =
                selectedFormat.width === format.width &&
                selectedFormat.height === format.height;

              return (
                <button
                  key={`${format.width}x${format.height}`}
                  onClick={() => handleFormatSelect(format)}
                  disabled={isGenerating}
                  className={`p-4 rounded-lg border-2 ${
                    isSelected
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-gray-700 bg-gray-800'
                  }`}
                >
                  <p className="text-sm text-gray-300">{format.label}</p>
                  <p className="text-xs text-gray-500">
                    {format.width} × {format.height}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* BOUTON GENERER */}
      {onStartGeneration && (
        <button
          onClick={handleStartGenerationSafe}
          disabled={isGenerating}
          className="w-full mb-6 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-white py-3 rounded-lg flex items-center justify-center gap-3"
        >
          <Sparkles className="w-5 h-5" />
          {isGenerating ? 'Génération en cours…' : 'Générer'}
        </button>
      )}

      {/* PREVIEW */}
      <div ref={imagePreviewRef} className="mb-6">
        {isGenerating ? (
          <div className="h-[420px] bg-gray-800 rounded-lg flex items-center justify-center">
            <div className="w-14 h-14 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : currentImage ? (
          <img
            src={currentImage.imageUrl}
            className="rounded-lg max-h-[600px] mx-auto cursor-pointer"
            onClick={() => setLightboxImage(currentImage)}
          />
        ) : (
          <div className="h-[420px] bg-gray-800 border border-dashed border-gray-700 rounded-lg flex items-center justify-center text-gray-400">
            Aucune image générée
          </div>
        )}
      </div>

      {/* ACTIONS */}
      {currentImage && !isCamera && (
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => setShowCharte(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg"
          >
            Sauvegarder
          </button>
          <button
            onClick={() => handleDownload(currentImage.imageUrl)}
            className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg"
          >
            <Download className="w-5 h-5" />
          </button>
        </div>
      )}

      {lightboxImage && (
        <ImageLightbox
          open
          image={lightboxImage}
          gallery={safeGallery}
          onOpenChange={() => setLightboxImage(null)}
          onSelectImage={onSelectImage}
        />
      )}

      <SimpleAlertDialog
        open={showCharte}
        onOpenChange={setShowCharte}
        title="Charte d'utilisation"
        description="Confirmez la sauvegarde."
        confirmText="Sauvegarder"
        cancelText="Annuler"
        onConfirm={() => {
          if (currentImage) onSaveToGallery(currentImage);
          setShowCharte(false);
        }}
      />
    </div>
  );
}
