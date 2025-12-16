import { Download, Trash2, Calendar } from 'lucide-react';
import { GeneratedImage } from '../App';

interface ImageGalleryProps {
  images: GeneratedImage[];
  onDelete: (id: string) => void;
}

export function ImageGallery({ images, onDelete }: ImageGalleryProps) {
  const handleDownload = async (imageUrl: string, prompt: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${prompt.slice(0, 30)}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
    }
  };

  if (images.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-12 border border-gray-100 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-gray-900 mb-2">Aucune image générée</h3>
          <p className="text-gray-500">
            Commencez par créer votre première image en utilisant le formulaire à gauche
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-gray-900">Vos images générées</h2>
        <span className="text-sm text-gray-500">{images.length} image{images.length > 1 ? 's' : ''}</span>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        {images.map((image) => (
          <div
            key={image.id}
            className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow"
          >
            <div className="aspect-square relative group">
              <img
                src={image.imageUrl}
                alt={image.prompt}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <button
                  onClick={() => handleDownload(image.imageUrl, image.prompt)}
                  className="bg-white text-gray-900 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                  title="Télécharger"
                >
                  <Download className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onDelete(image.id)}
                  className="bg-red-600 text-white p-3 rounded-lg hover:bg-red-700 transition-colors"
                  title="Supprimer"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-4">
              <p className="text-gray-900 mb-3 line-clamp-2">{image.prompt}</p>
              
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-4">
                  <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded">
                    {image.style}
                  </span>
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    {image.size}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 mt-3 text-xs text-gray-400">
                <Calendar className="w-3 h-3" />
                <span>{image.timestamp.toLocaleString('fr-FR')}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
