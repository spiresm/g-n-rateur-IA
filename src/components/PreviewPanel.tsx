import { ImageIcon, Clock, Copy, Download, Sparkles } from 'lucide-react';
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
}

export function PreviewPanel({
  currentImage,
  savedGallery,
  isGenerating,
  onSelectImage,
  onCopyParameters,
  onSaveToGallery,
  generatedPrompt: _generatedPrompt,
  onStartGeneration,
  onFormatChange
}: PreviewPanelProps) {
  const [showCharte, setShowCharte] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<ImageFormat>(IMAGE_FORMATS[1]);
  const [lightboxImage, setLightboxImage] = useState<GeneratedImage | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number>(-1);
  const imagePreviewRef = useRef<HTMLDivElement>(null);

  // ✅ SAFE scroll
  useEffect(() => {
    if (currentImage && !isGenerating && imagePreviewRef.current) {
      setTimeout(() => {
        imagePreviewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [currentImage, isGenerating]);

  // ✅ SAFE handler pour la génération
  const handleStartGenerationSafe = () => {
    if (typeof onStartGeneration === 'function') {
      onStartGeneration();
    } else {
      console.warn('[PreviewPanel] onStartGeneration invalide:', onStartGeneration);
    }
  };

  const handleDownload = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `poster-${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleSaveToGallery = () => {
    if (currentImage) setShowCharte(true);
  };

  const handleCharteAccept = () => {
    if (currentImage) {
      onSaveToGallery(currentImage);
      setShowCharte(false);
    }
  };

  const handleFormatSelect = (format: ImageFormat) => {
    setSelectedFormat(format);
    onFormatChange?.(format.width, format.height);
  };

  const handleLightboxOpen = (image: GeneratedImage, index: number) => {
    setLightboxImage(image);
    setLightboxIndex(index);
  };

  const handleLightboxClose = () => {
    setLightboxImage(null);
    setLightboxIndex(-1);
  };

  const handleLightboxNavigate = (image: GeneratedImage) => {
    const newIndex = savedGallery.findIndex(img => img.id === image.id);
    setLightboxImage(image);
    setLightboxIndex(newIndex);
    onSelectImage(image);
  };

  const safeGallery = Array.isArray(savedGallery) ? savedGallery : [];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-purple-400" />
          <h2 className="text-white">Résultat & Prévisualisation</h2>
        </div>
        <span className="text-xs bg-green-600 text-white px-3 py-1 rounded-full">PRÊT</span>
      </div>

      {/* Formats + bouton génération */}
      {onStartGeneration && (
        <>
          <div className="mb-4">
            <h3 className="text-gray-300 mb-3 text-sm">Format de l'image</h3>
            <div className="grid grid-cols-3 gap-3">
              {IMAGE_FORMATS.map(format => {
                const isSelected =
                  selectedFormat.width === format.width &&
                  selectedFormat.height === format.height;
                const aspectRatio = format.width / format.height;

                return (
                  <button
                    key={`${format.width}x${format.height}`}
                    onClick={() => handleFormatSelect(format)}
                    disabled={isGenerating}
                    className={`relative p-4 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                    } ${isGenerating ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center justify-center mb-3 h-20">
                      <div
                        className="bg-gradient-to-br from-purple-500 to-blue-500 rounded"
                        style={{
                          width: aspectRatio > 1 ? '80px' : `${80 * aspectRatio}px`,
                          height: aspectRatio < 1 ? '80px' : `${80 / aspectRatio}px`
                        }}
                      />
                    </div>
                    <div className="text-center">
                      <p className={`text-sm mb-1 ${isSelected ? 'text-purple-400' : 'text-gray-300'}`}>
                        {format.label}
                      </p>
                      <p className="text-xs text-gray-500">
                        {format.width} × {format.height}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mb-4">
            <button
              onClick={handleStartGenerationSafe}   {/* ✅ FIX MAJEUR */}
              disabled={isGenerating}
              className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg flex items-center justify-center gap-3 shadow-lg"
            >
              <Sparkles className="w-5 h-5" />
              <span>{isGenerating ? 'Génération en cours...' : "Générer l'image"}</span>
            </button>
          </div>
        </>
      )}

      {/* Galerie */}
      {safeGallery.length > 0 && (
        <div className="mb-6">
          <h3 className="text-gray-300 mb-3">
            Galerie Sauvegardée ({safeGallery.length})
          </h3>
          <div className="grid grid-cols-6 gap-2">
            {safeGallery.slice(0, 12).map((image, index) => (
              <div
                key={image.id}
                onClick={() => handleLightboxOpen(image, index)}
                className="cursor-pointer rounded-lg overflow-hidden hover:ring-2 hover:ring-purple-500"
              >
                <img src={image.imageUrl} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxImage && (
        <ImageLightbox
          open={true}
          onOpenChange={handleLightboxClose}
          image={lightboxImage}
          index={lightboxIndex}
          gallery={safeGallery}
          onSelectImage={handleLightboxNavigate}
        />
      )}

      {/* Charte */}
      <SimpleAlertDialog
        open={showCharte}
        onOpenChange={setShowCharte}
        title="Charte d'Utilisation des Images"
        description={<p>Confirmez la sauvegarde.</p>}
        cancelText="Annuler"
        confirmText="Accepter et Sauvegarder"
        onConfirm={handleCharteAccept}
      />
    </div>
  );
}
