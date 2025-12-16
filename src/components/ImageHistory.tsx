import { History, Trash2 } from 'lucide-react';
import { GeneratedImage } from '../App';

interface ImageHistoryProps {
  images: GeneratedImage[];
  onSelect: (image: GeneratedImage) => void;
  onDelete: (id: string) => void;
  currentImageId?: string;
}

export function ImageHistory({ images, onSelect, onDelete, currentImageId }: ImageHistoryProps) {
  if (images.length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <History className="w-5 h-5 text-purple-400" />
          <h2 className="text-white">Historique</h2>
        </div>
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
            <History className="w-8 h-8 text-gray-500" />
          </div>
          <p className="text-gray-500 text-sm">Aucune image générée</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <History className="w-5 h-5 text-purple-400" />
        <h2 className="text-white">Historique</h2>
        <span className="ml-auto text-xs text-gray-500">{images.length}</span>
      </div>

      <div className="space-y-3">
        {images.map((image) => (
          <div
            key={image.id}
            className={`group relative rounded-lg overflow-hidden cursor-pointer transition-all ${
              currentImageId === image.id
                ? 'ring-2 ring-purple-500'
                : 'hover:ring-2 hover:ring-gray-600'
            }`}
            onClick={() => onSelect(image)}
          >
            <div className="aspect-square relative">
              <img
                src={image.imageUrl}
                alt={image.params.prompt}
                className="w-full h-full object-cover"
              />
              
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(image.id);
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-colors"
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Current indicator */}
              {currentImageId === image.id && (
                <div className="absolute top-2 right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded">
                  Actuelle
                </div>
              )}
            </div>

            {/* Info */}
            <div className="bg-gray-700 p-2">
              <p className="text-white text-xs line-clamp-2">{image.params.prompt}</p>
              <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                <span>{image.params.width}×{image.params.height}</span>
                <span>•</span>
                <span>{image.params.steps} steps</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
