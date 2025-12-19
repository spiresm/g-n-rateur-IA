import { useState, useEffect } from 'react';
import { Upload, AlertTriangle, CheckCircle } from 'lucide-react';

interface Props {
  onGenerate: (params: any) => void;
  isGenerating: boolean;
  onGetGenerateFunction: (fn: () => void) => void;
}

const ANGLES = [
  { key: 'close_up', label: 'Close-up', prompt: 'Turn the camera to a close-up.' },
  { key: 'wide', label: 'Wide shot', prompt: 'Turn the camera to a wide-angle shot.' },
  { key: '45_right', label: '45° droite', prompt: 'Rotate the camera 45 degrees to the right.' },
  { key: '90_right', label: '90° droite', prompt: 'Rotate the camera 90 degrees to the right.' },
  { key: 'aerial', label: 'Vue aérienne', prompt: 'Turn the camera to an aerial view.' },
  { key: 'low', label: 'Contre-plongée', prompt: 'Turn the camera to a low-angle view.' },
  { key: '45_left', label: '45° gauche', prompt: 'Rotate the camera 45 degrees to the left.' },
  { key: '90_left', label: '90° gauche', prompt: 'Rotate the camera 90 degrees to the left.' },
];

export function CameraAnglesGenerator({
  onGenerate,
  isGenerating,
  onGetGenerateFunction,
}: Props) {
  // 1. On stocke le FICHIER réel pour l'envoi API
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  // 2. On stocke l'aperçu juste pour l'affichage UI
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedAngle, setSelectedAngle] = useState<typeof ANGLES[0] | null>(null);

  useEffect(() => {
    onGetGenerateFunction(() => {
      if (!selectedFile || !selectedAngle) return;

      onGenerate({
        // ✅ On envoie le fichier binaire, pas le base64
        image: selectedFile, 
        final_prompt: selectedAngle.prompt,
        angle: selectedAngle.key,
      });
    });
  }, [selectedFile, selectedAngle, onGenerate, onGetGenerateFunction]);

  const handleImageUpload = (file: File) => {
    setSelectedFile(file);
    // Créer une URL temporaire pour l'affichage
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  return (
    <div className="p-6 text-white">
      <h2 className="text-xl font-bold text-purple-400 mb-2">Angle de caméra</h2>
      <p className="text-gray-400 mb-6">
        Upload une image, puis choisis un angle avant de générer.
      </p>

      {/* IMAGE UPLOAD */}
      <div className="mb-6">
        <label className="block text-sm mb-2 text-gray-300">Image source</label>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <label className="cursor-pointer bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg flex items-center gap-2 border border-dashed border-gray-500">
              <Upload className="w-4 h-4" />
              {selectedFile ? 'Changer l\'image' : 'Charger une image'}
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => e.target.files && handleImageUpload(e.target.files[0])}
              />
            </label>

            {selectedFile && (
              <span className="text-green-400 text-sm flex items-center gap-1">
                <CheckCircle className="w-4 h-4" /> Prêt
              </span>
            )}
          </div>
          
          {/* OPTIONNEL: Petit aperçu de l'image chargée */}
          {previewUrl && (
            <div className="w-24 h-24 rounded border border-gray-700 overflow-hidden bg-black">
              <img src={previewUrl} alt="Aperçu" className="w-full h-full object-cover" />
            </div>
          )}
        </div>
      </div>

      {/* GRID DES ANGLES */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {ANGLES.map(angle => {
          const active = selectedAngle?.key === angle.key;
          return (
            <button
              key={angle.key}
              disabled={!selectedFile || isGenerating}
              onClick={() => setSelectedAngle(angle)}
              className={`py-3 rounded-lg border transition-all
                ${active
                  ? 'border-purple-500 bg-purple-500/20 text-white'
                  : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'}
                ${(!selectedFile || isGenerating) ? 'opacity-40 cursor-not-allowed' : ''}
              `}
            >
              {angle.label}
            </button>
          );
        })}
      </div>

      {/* ALERTES STATUT */}
      {!selectedFile ? (
        <div className="p-3 bg-blue-900/20 border border-blue-800 rounded-lg text-blue-400 text-sm">
          Commencez par charger une image de personnage.
        </div>
      ) : !selectedAngle ? (
        <div className="flex items-center gap-2 text-yellow-400 text-sm italic">
          <AlertTriangle className="w-4 h-4" />
          Sélectionnez maintenant un angle de vue
        </div>
      ) : (
        <div className="text-purple-400 text-sm animate-pulse">
          Prêt pour la génération ! Cliquez sur le bouton "Générer" à droite.
        </div>
      )}
    </div>
  );
}
