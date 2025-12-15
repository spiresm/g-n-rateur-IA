import { ImageIcon, Clock, Copy, Download } from 'lucide-react';
import { GeneratedImage } from '../App';
import { useState } from 'react';
import { SimpleAlertDialog } from './SimpleAlertDialog';
import { Sparkles } from 'lucide-react';

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
  generatedPrompt: _generatedPrompt, // Non utilisé car supprimé
  onStartGeneration,
  onFormatChange
}: PreviewPanelProps) {
  const [showCharte, setShowCharte] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<ImageFormat>(IMAGE_FORMATS[0]);

  console.log('[PREVIEW_PANEL] 🔍 DEBUG BOUTON JAUNE:', {
    onStartGeneration: onStartGeneration ? 'DÉFINIE ✅' : 'UNDEFINED ❌',
    typeOf: typeof onStartGeneration,
    isGenerating
  });

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
    if (currentImage) {
      setShowCharte(true);
    }
  };

  const handleCharteAccept = () => {
    if (currentImage) {
      onSaveToGallery(currentImage);
      setShowCharte(false);
    }
  };

  const handleFormatSelect = (format: ImageFormat) => {
    setSelectedFormat(format);
    if (onFormatChange) {
      onFormatChange(format.width, format.height);
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

      {/* Format Selection - Au-dessus du bouton de génération */}
      {onStartGeneration && (
        <>
          <div className="mb-4">
            <h3 className="text-gray-300 mb-3 text-sm">Format de l'image</h3>
            <div className="grid grid-cols-3 gap-3">
              {IMAGE_FORMATS.map((format) => {
                const isSelected = selectedFormat.width === format.width && selectedFormat.height === format.height;
                const aspectRatio = format.width / format.height;
                
                return (
                  <button
                    key={`${format.width}x${format.height}`}
                    onClick={() => handleFormatSelect(format)}
                    className={`
                      relative p-4 rounded-lg border-2 transition-all
                      ${isSelected 
                        ? 'border-purple-500 bg-purple-500/10' 
                        : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                      }
                    `}
                  >
                    {/* Visual representation of aspect ratio */}
                    <div className="flex items-center justify-center mb-3 h-20">
                      <div 
                        className={`
                          bg-gradient-to-br from-purple-500 to-blue-500 rounded
                          ${isSelected ? 'opacity-100' : 'opacity-50'}
                        `}
                        style={{
                          width: aspectRatio > 1 ? '80px' : `${80 * aspectRatio}px`,
                          height: aspectRatio < 1 ? '80px' : `${80 / aspectRatio}px`,
                          aspectRatio: `${format.width}/${format.height}`
                        }}
                      />
                    </div>
                    
                    {/* Label and dimensions */}
                    <div className="text-center">
                      <p className={`text-sm mb-1 ${isSelected ? 'text-purple-400' : 'text-gray-300'}`}>
                        {format.label}
                      </p>
                      <p className="text-xs text-gray-500">
                        {format.width} × {format.height}
                      </p>
                    </div>
                    
                    {/* Selected indicator */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bouton Démarrer la Génération */}
          <div className="mb-4">
            <button
              onClick={onStartGeneration}
              disabled={isGenerating}
              className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-3 shadow-lg"
            >
              <Sparkles className="w-5 h-5" />
              <span>
                {isGenerating ? 'Génération en cours...' : 'Générer l\'Image'}
              </span>
            </button>
          </div>
        </>
      )}

      {/* Main Preview - TAILLE AGRANDIE 1.5x (600px max-height) */}
      <div className="mb-6">
        {isGenerating ? (
          <div className="aspect-[9/16] max-h-[600px] mx-auto bg-gray-800 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-300">Génération en cours...</p>
            </div>
          </div>
        ) : currentImage ? (
          <div className="relative max-h-[600px] mx-auto w-fit">
            <img
              src={currentImage.imageUrl}
              alt="Generated"
              className="rounded-lg max-h-[600px] w-auto object-contain"
            />
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={handleSaveToGallery}
                className="bg-purple-600/80 hover:bg-purple-600 text-white px-4 py-3 rounded-lg backdrop-blur-sm transition-colors flex items-center gap-2"
                title="Sauvegarder dans la galerie permanente"
              >
                <ImageIcon className="w-5 h-5" />
                <span className="text-sm">Sauvegarder</span>
              </button>
              <button
                onClick={() => handleDownload(currentImage.imageUrl)}
                className="bg-gray-900/80 hover:bg-gray-900 text-white p-3 rounded-lg backdrop-blur-sm transition-colors"
              >
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="aspect-[9/16] max-h-[600px] mx-auto bg-gray-800 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-700">
            <div className="text-center px-6">
              <ImageIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Aucune image encore générée. Configurez vos paramètres et lancez la génération.</p>
            </div>
          </div>
        )}
      </div>

      {/* Galerie Sauvegardée - VIGNETTES 2x PLUS PETITES */}
      {savedGallery.length > 0 && (
        <div className="mb-6">
          <h3 className="text-gray-300 mb-3 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-purple-400" />
            Galerie Sauvegardée ({savedGallery.length})
          </h3>
          <div className="grid grid-cols-6 gap-2">
            {savedGallery.slice(0, 12).map((image) => (
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
        </div>
      )}

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

          {/* Prompt - COMPACT 4 lignes avec scroll */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-gray-300 mb-2 text-sm">Prompt</h3>
            <div className="max-h-24 overflow-y-auto">
              <p className="text-white text-sm leading-relaxed">
                {currentImage.params.prompt}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Dialogue Charte d'Utilisation */}
      <SimpleAlertDialog
        open={showCharte}
        onOpenChange={setShowCharte}
        title="Charte d'Utilisation des Images"
        description={
          <div className="space-y-3">
            <p>En sauvegardant cette image dans votre galerie permanente, vous acceptez les conditions suivantes :</p>
            
            <div className="bg-gray-900 p-4 rounded-lg space-y-2 text-sm">
              <p>✓ <strong>Usage Personnel :</strong> Les images générées sont destinées à un usage personnel ou professionnel dans le cadre de vos projets.</p>
              
              <p>✓ <strong>Responsabilité :</strong> Vous êtes responsable de l'utilisation que vous faites des images générées.</p>
              
              <p>✓ <strong>Contenu Approprié :</strong> Vous vous engagez à ne pas générer ou sauvegarder de contenu offensant, illégal ou inapproprié.</p>
              
              <p>✓ <strong>Droits d'Auteur :</strong> Vous reconnaissez que les images générées par IA peuvent être soumises à des restrictions de droits d'auteur selon votre juridiction.</p>
              
              <p>✓ <strong>Stockage Local :</strong> Les images sauvegardées sont stockées localement dans votre navigateur et peuvent être perdues si vous videz le cache.</p>
            </div>
            
            <p className="text-xs text-gray-400 mt-4">En cliquant sur "Accepter et Sauvegarder", vous confirmez avoir lu et accepté cette charte d'utilisation.</p>
          </div>
        }
        cancelText="Annuler"
        confirmText="Accepter et Sauvegarder"
        onConfirm={handleCharteAccept}
      />
    </div>
  );
}
