import { Download, Copy, Loader2 } from 'lucide-react';
import { GeneratedImage } from '../App';

interface ImagePreviewProps {
  image: GeneratedImage | null;
  isGenerating: boolean;
}

export function ImagePreview({ image, isGenerating }: ImagePreviewProps) {
  const handleDownload = async () => {
    if (!image) return;
    
    try {
      const response = await fetch(image.imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `generated-${image.id}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
    }
  };

  const copyPrompt = () => {
    if (!image) return;
    navigator.clipboard.writeText(image.params.prompt);
  };

  if (isGenerating) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-900">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-300 text-lg">Génération en cours...</p>
          <p className="text-gray-500 text-sm mt-2">Veuillez patienter</p>
        </div>
      </div>
    );
  }

  if (!image) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-900">
        <div className="text-center max-w-md px-6">
          <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-12 h-12 text-gray-600" />
          </div>
          <h3 className="text-gray-300 text-xl mb-2">Aucune image générée</h3>
          <p className="text-gray-500">
            Utilisez le panneau de gauche pour configurer les paramètres et générer votre première image
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-900 overflow-y-auto">
      <div className="p-6">
        {/* Image Container */}
        <div className="bg-gray-800 rounded-lg overflow-hidden mb-6">
          <div className="relative">
            <img
              src={image.imageUrl}
              alt={image.params.prompt}
              className="w-full h-auto"
            />
            
            {/* Action Buttons Overlay */}
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={handleDownload}
                className="bg-gray-900/80 hover:bg-gray-900 text-white p-3 rounded-lg backdrop-blur-sm transition-colors"
                title="Télécharger"
              >
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Image Info */}
        <div className="bg-gray-800 rounded-lg p-6 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-300">Prompt</h3>
              <button
                onClick={copyPrompt}
                className="text-purple-400 hover:text-purple-300 p-1"
                title="Copier le prompt"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <p className="text-white bg-gray-700 p-3 rounded">{image.params.prompt}</p>
          </div>

          {image.params.negativePrompt && (
            <div>
              <h3 className="text-gray-300 mb-2">Negative Prompt</h3>
              <p className="text-white bg-gray-700 p-3 rounded">{image.params.negativePrompt}</p>
            </div>
          )}

          {/* Parameters Grid */}
          <div>
            <h3 className="text-gray-300 mb-3">Paramètres de génération</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              <div className="bg-gray-700 p-3 rounded">
                <p className="text-xs text-gray-400">Steps</p>
                <p className="text-white">{image.params.steps}</p>
              </div>
              <div className="bg-gray-700 p-3 rounded">
                <p className="text-xs text-gray-400">CFG Scale</p>
                <p className="text-white">{image.params.cfg}</p>
              </div>
              <div className="bg-gray-700 p-3 rounded">
                <p className="text-xs text-gray-400">Seed</p>
                <p className="text-white">{image.params.seed}</p>
              </div>
              <div className="bg-gray-700 p-3 rounded">
                <p className="text-xs text-gray-400">Sampler</p>
                <p className="text-white">{image.params.sampler}</p>
              </div>
              <div className="bg-gray-700 p-3 rounded">
                <p className="text-xs text-gray-400">Scheduler</p>
                <p className="text-white">{image.params.scheduler}</p>
              </div>
              <div className="bg-gray-700 p-3 rounded">
                <p className="text-xs text-gray-400">Denoise</p>
                <p className="text-white">{image.params.denoise.toFixed(2)}</p>
              </div>
              <div className="bg-gray-700 p-3 rounded">
                <p className="text-xs text-gray-400">Dimensions</p>
                <p className="text-white">{image.params.width}×{image.params.height}</p>
              </div>
              <div className="bg-gray-700 p-3 rounded">
                <p className="text-xs text-gray-400">Refiner</p>
                <p className="text-white">{image.params.refinerEnabled ? 'Activé' : 'Désactivé'}</p>
              </div>
            </div>

            {image.params.refinerEnabled && (
              <div className="mt-3 grid grid-cols-3 gap-3">
                <div className="bg-gray-700 p-3 rounded">
                  <p className="text-xs text-gray-400">Refiner Steps</p>
                  <p className="text-white">{image.params.refinerSteps}</p>
                </div>
                <div className="bg-gray-700 p-3 rounded">
                  <p className="text-xs text-gray-400">Refiner CFG</p>
                  <p className="text-white">{image.params.refinerCfg}</p>
                </div>
                <div className="bg-gray-700 p-3 rounded">
                  <p className="text-xs text-gray-400">Refiner Denoise</p>
                  <p className="text-white">{image.params.refinerDenoise.toFixed(2)}</p>
                </div>
              </div>
            )}
          </div>

          {/* Timestamp */}
          <div className="pt-4 border-t border-gray-700">
            <p className="text-xs text-gray-500">
              Généré le {image.timestamp.toLocaleDateString('fr-FR')} à {image.timestamp.toLocaleTimeString('fr-FR')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
