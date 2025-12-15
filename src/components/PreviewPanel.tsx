import { ImageIcon, FileText, Clock, Copy, Download } from 'lucide-react';
import { GeneratedImage } from '../App';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';

interface PreviewPanelProps {
  currentImage: GeneratedImage | null;
  gallery: GeneratedImage[];
  savedGallery: GeneratedImage[];
  isGenerating: boolean;
  onSelectImage: (image: GeneratedImage) => void;
  onCopyParameters: (image: GeneratedImage) => void;
  onSaveToGallery: (image: GeneratedImage) => void;
  generatedPrompt: string;
}

export function PreviewPanel({ 
  currentImage, 
  gallery, 
  savedGallery,
  isGenerating, 
  onSelectImage, 
  onCopyParameters,
  onSaveToGallery,
  generatedPrompt 
}: PreviewPanelProps) {
  const [showCharte, setShowCharte] = useState(false);

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

      {/* Main Preview - TAILLE RÉDUITE SUR PC */}
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

      {/* Galerie Sauvegardée */}
      {savedGallery.length > 0 && (
        <div className="mb-6">
          <h3 className="text-gray-300 mb-3 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-purple-400" />
            Galerie Sauvegardée ({savedGallery.length})
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {savedGallery.slice(0, 6).map((image) => (
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

      {/* Galerie Temporaire (Historique) */}
      <div className="mb-6">
        <h3 className="text-gray-300 mb-3">Historique Récent</h3>
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
            <p className="text-gray-500 text-sm">Aucune image dans l'historique</p>
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

      {/* Dialogue Charte d'Utilisation */}
      <AlertDialog open={showCharte} onOpenChange={setShowCharte}>
        <AlertDialogContent className="bg-gray-800 border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Charte d'Utilisation des Images</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300 space-y-3">
              <p>En sauvegardant cette image dans votre galerie permanente, vous acceptez les conditions suivantes :</p>
              
              <div className="bg-gray-900 p-4 rounded-lg space-y-2 text-sm">
                <p>✓ <strong>Usage Personnel :</strong> Les images générées sont destinées à un usage personnel ou professionnel dans le cadre de vos projets.</p>
                
                <p>✓ <strong>Responsabilité :</strong> Vous êtes responsable de l'utilisation que vous faites des images générées.</p>
                
                <p>✓ <strong>Contenu Approprié :</strong> Vous vous engagez à ne pas générer ou sauvegarder de contenu offensant, illégal ou inapproprié.</p>
                
                <p>✓ <strong>Droits d'Auteur :</strong> Vous reconnaissez que les images générées par IA peuvent être soumises à des restrictions de droits d'auteur selon votre juridiction.</p>
                
                <p>✓ <strong>Stockage Local :</strong> Les images sauvegardées sont stockées localement dans votre navigateur et peuvent être perdues si vous videz le cache.</p>
              </div>
              
              <p className="text-xs text-gray-400 mt-4">En cliquant sur "Accepter et Sauvegarder", vous confirmez avoir lu et accepté cette charte d'utilisation.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-700 text-white hover:bg-gray-600">
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleCharteAccept}
              className="bg-purple-600 text-white hover:bg-purple-700"
            >
              Accepter et Sauvegarder
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
