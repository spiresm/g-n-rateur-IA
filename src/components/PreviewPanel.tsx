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
  onSaveToGallery: (image: GeneratedImage) => void;
  onStartGeneration?: () => void;
  onFormatChange?: (width: number, height: number) => void;

  /** 🔑 Mode du workflow */
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
  const imagePreviewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentImage && !isGenerating && imagePreviewRef.current) {
      setTimeout(() => {
        imagePreviewRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [currentImage, isGenerating]);

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

  return (
    <div className={`p-6 h-full ${isCamera ? 'bg-gray-950' : 'bg-black'}`}>
      {/* HEADER */}
      <div className="flex items-center gap-2 mb-6">
        <ImageIcon className="w-5 h-5 text-purple-400" />
        <h2 className="text-white">
          {isCamera ? 'Aperçu angle caméra' : 'Résultat & Prévisualisation'}
        </h2>
      </div>

      {/* FORMATS — POSTER UNIQUEMENT */}
      {!isCamera && onStartGeneration && (
        <div className="mb-6">
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
                  className={`p-4 rounded-lg border-2 transition ${
                    isSelected
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-gray-700 bg-gray-800 hover:border-gray-600'
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

      {/* BOUTON GENERER — TOUS LES WORKFLOWS */}
      {onStartGeneration && (
        <button
          onClick={onStartGeneration}
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

      {/* ACTIONS — POSTER UNIQUEMENT */}
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

      {/* LIGHTBOX */}
      {lightboxImage && (
        <ImageLightbox
          open
          image={lightboxImage}
          gallery={savedGallery}
          onOpenChange={() => setLightboxImage(null)}
          onSelectImage={onSelectImage}
        />
      )}

      {/* CHARTE */}
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
