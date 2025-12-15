import { X, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { GeneratedImage } from '../App';

interface ImageLightboxProps {
  image: GeneratedImage;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  index: number;
  gallery: GeneratedImage[];
  onSelectImage: (image: GeneratedImage) => void;
}

export function ImageLightbox({ 
  image, 
  open, 
  onOpenChange,
  index,
  gallery,
  onSelectImage
}: ImageLightboxProps) {
  if (!open) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onOpenChange(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onOpenChange(false);
    if (e.key === 'ArrowLeft' && index > 0) {
      onSelectImage(gallery[index - 1]);
    }
    if (e.key === 'ArrowRight' && index < gallery.length - 1) {
      onSelectImage(gallery[index + 1]);
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

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Header avec boutons */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => handleDownload(image.imageUrl)}
            className="bg-gray-900/80 hover:bg-gray-800 text-white px-4 py-2 rounded-lg backdrop-blur-sm transition-colors flex items-center gap-2"
            title="Télécharger"
          >
            <Download className="w-5 h-5" />
            <span className="hidden sm:inline">Télécharger</span>
          </button>
        </div>
        
        <button
          onClick={() => onOpenChange(false)}
          className="bg-gray-900/80 hover:bg-gray-800 text-white p-2 rounded-lg backdrop-blur-sm transition-colors"
          title="Fermer (Esc)"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Navigation gauche */}
      {index > 0 && (
        <button
          onClick={() => onSelectImage(gallery[index - 1])}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-gray-900/80 hover:bg-gray-800 text-white p-3 rounded-full backdrop-blur-sm transition-colors z-10"
          title="Image précédente (←)"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* Image principale */}
      <div className="relative max-w-7xl max-h-[90vh] flex items-center justify-center">
        <img
          src={image.imageUrl}
          alt="Full size preview"
          className="max-w-full max-h-[90vh] object-contain rounded-lg"
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      {/* Navigation droite */}
      {index < gallery.length - 1 && (
        <button
          onClick={() => onSelectImage(gallery[index + 1])}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-gray-900/80 hover:bg-gray-800 text-white p-3 rounded-full backdrop-blur-sm transition-colors z-10"
          title="Image suivante (→)"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Info en bas */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
        <div className="max-w-4xl mx-auto">
          <div className="text-gray-300 text-sm">
            <p className="mb-2">
              <span className="text-gray-400">Seed:</span> {image.params.seed} 
              <span className="mx-3">•</span>
              <span className="text-gray-400">Steps:</span> {image.params.steps}
              <span className="mx-3">•</span>
              <span className="text-gray-400">CFG:</span> {image.params.cfg}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
