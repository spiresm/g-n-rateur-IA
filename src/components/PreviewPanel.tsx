import { ImageIcon, FileText, Clock, Copy, Download } from 'lucide-react';
import { GeneratedImage } from '../App';

interface PreviewPanelProps {
  currentImage: GeneratedImage | null;
  gallery: GeneratedImage[];
  isGenerating: boolean;
  onSelectImage: (image: GeneratedImage) => void;
  onCopyParameters: (image: GeneratedImage) => void;
  generatedPrompt: string;
}

export function PreviewPanel({ 
  currentImage, 
  gallery, 
  isGenerating, 
  onSelectImage, 
  onCopyParameters,
  generatedPrompt 
}: PreviewPanelProps) {
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
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-purple-400" />
          <h2 className="text-white">Résultat & Prévisualisation</h2>
        </div>
        <span className="text-xs bg-green-600 text-white px-3 py-1 rounded-full">PRÊT</span>
      </div>

      {/* Main Preview */}
      <div className="mb-6">
        {isGenerating ? (
          <div className="aspect-[9/16] bg-gray-800 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-300">Génération en cours...</p>
            </div>
          </div>
        ) : currentImage ? (
          <div className="relative">
            <img
              src={currentImage.imageUrl}
              alt="Generated"
              className="w-full rounded-lg"
            />
            <div className="absolute top-4 right-4">
              <button
                onClick={() => handleDownload(currentImage.imageUrl)}
                className="bg-gray-900/80 hover:bg-gray-900 text-white p-3 rounded-lg backdrop-blur-sm transition-colors"
              >
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="aspect-[9/16] bg-gray-800 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-700">
            <div className="text-center px-6">
              <ImageIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Aucune image encore générée. Configurez vos paramètres et lancez la génération.</p>
            </div>
          </div>
        )}
      </div>

      {/* Format Rapide */}
      <div className="mb-6">
        <h3 className="text-gray-300 text-sm mb-3">Format Rapide</h3>
        <div className="flex gap-3">
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
            <ImageIcon className="w-4 h-4" />
            <span className="text-sm">Image</span>
          </button>
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
            <FileText className="w-4 h-4" />
            <span className="text-sm">Document</span>
          </button>
        </div>
      </div>

      {/* Galeria */}
      <div className="mb-6">
        <h3 className="text-gray-300 mb-3">Galeria</h3>
        {gallery.length > 0 ? (
          <div className="grid grid-cols-3 gap-3">
            {gallery.slice(0, 6).map((image) => (
              <div
                key={image.id}
                onClick={() => onSelectImage(image)}
                className={`aspect-[9/16] rounded-lg overflow-hidden cursor-pointer transition-all hover:ring-2 hover:ring-purple-500 ${
                  currentImage?.id === image.id ? 'ring-2 ring-purple-500' : ''
                }`}
              >
                <img
                  src={image.imageUrl}
                  alt="Gallery"
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <p className="text-gray-500 text-sm">Aucune image dans la galerie</p>
          </div>
        )}
      </div>

      {/* Generation Info */}
      {currentImage && (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Clock className="w-4 h-4" />
              <span>Temps de Génération ~</span>
            </div>
            <button
              onClick={() => onCopyParameters(currentImage)}
              className="flex items-center gap-2 text-sm bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Copy className="w-4 h-4" />
              <span>Copier les Paramètres</span>
            </button>
          </div>

          {/* Parameters Info */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-gray-300 mb-3">Paramètres (Info)</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-400">Graine (Seed):</span>
                <p className="text-white">{currentImage.params.seed}</p>
              </div>
              <div>
                <span className="text-gray-400">Étapes:</span>
                <p className="text-white">{currentImage.params.steps}</p>
              </div>
              <div>
                <span className="text-gray-400">CFG:</span>
                <p className="text-white">{currentImage.params.cfg}</p>
              </div>
              <div>
                <span className="text-gray-400">Échantillonneur:</span>
                <p className="text-white">{currentImage.params.sampler}</p>
              </div>
            </div>
          </div>

          {/* Prompt */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-gray-300 mb-2">Prompt</h3>
            <p className="text-white text-sm leading-relaxed">
              {currentImage.params.prompt}
            </p>
          </div>
        </div>
      )}

      {/* Generated Prompt Display */}
      {generatedPrompt && !currentImage && (
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-gray-300 mb-2">Prompt Généré</h3>
          <p className="text-white text-sm leading-relaxed">
            {generatedPrompt}
          </p>
        </div>
      )}
    </div>
  );
}
