import { useState } from 'react';
import { Upload, Camera, X } from 'lucide-react';

type CameraAngle = {
  id: string;
  label: string;
  promptNode: string;
  icon: string;
};

const CAMERA_ANGLES: CameraAngle[] = [
  { id: 'close_up', label: 'Close-up', promptNode: '66', icon: '📷' },
  { id: 'wide_shot', label: 'Wide Shot', promptNode: '67', icon: '🎬' },
  { id: '45_right', label: '45° Droite', promptNode: '69', icon: '↗️' },
  { id: '90_right', label: '90° Droite', promptNode: '68', icon: '→' },
  { id: 'aerial_view', label: 'Vue Aérienne', promptNode: '70', icon: '🚁' },
  { id: 'low_angle', label: 'Contre-plongée', promptNode: '71', icon: '⬆️' },
  { id: '45_left', label: '45° Gauche', promptNode: '73', icon: '↖️' },
  { id: '90_left', label: '90° Gauche', promptNode: '72', icon: '←' },
];

interface CameraAnglesGeneratorProps {
  onGenerate: (params: {
    workflowType: 'camera-angles'; // Type littéral strict
    selectedAngle: string;
    promptNode: string;
    seed: number;
    steps: number;
    cfg: number;
    imageFile: File;
  }) => void;
  isGenerating: boolean;
}

export function CameraAnglesGenerator({ onGenerate, isGenerating }: CameraAnglesGeneratorProps) {
  const [selectedAngle, setSelectedAngle] = useState<CameraAngle>(CAMERA_ANGLES[0]);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadedImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    setImageFile(null);
  };

  const handleGenerate = () => {
    if (!imageFile) {
      alert('Veuillez uploader une image avant de générer.');
      return;
    }

    // Générer un seed aléatoire
    const seed = Math.floor(Math.random() * 1000000000000000);

    onGenerate({
      workflowType: 'camera-angles',
      selectedAngle: selectedAngle.id,
      promptNode: selectedAngle.promptNode,
      seed,
      steps: 4, // Fixé à 4 pour ce workflow
      cfg: 1, // Fixé à 1 pour ce workflow
      imageFile,
    });
  };

  return (
    <div className="h-full bg-gray-900 rounded-lg">
      <div className="h-full overflow-y-auto p-6">
        <div className="space-y-6">
          {/* En-tête */}
          <div className="flex items-center gap-3 pb-4 border-b border-gray-700">
            <Camera className="w-6 h-6 text-purple-400" />
            <div>
              <h2 className="text-white text-lg">Angles de Caméra</h2>
              <p className="text-gray-400 text-sm">Uploadez une image et choisissez un angle</p>
            </div>
          </div>

          {/* Zone d'upload */}
          <div className="space-y-3">
            <label className="text-gray-300 text-sm block">Image Source</label>
            
            {!uploadedImage ? (
              <label className="block w-full aspect-square max-h-[300px] cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={isGenerating}
                />
                <div className="w-full h-full border-2 border-dashed border-gray-600 rounded-lg hover:border-purple-500 transition-colors flex flex-col items-center justify-center gap-3 bg-gray-800/50">
                  <Upload className="w-12 h-12 text-gray-500" />
                  <div className="text-center px-4">
                    <p className="text-gray-300 mb-1">Cliquez pour uploader</p>
                    <p className="text-gray-500 text-xs">PNG, JPG jusqu'à 10MB</p>
                  </div>
                </div>
              </label>
            ) : (
              <div className="relative aspect-square max-h-[300px] rounded-lg overflow-hidden bg-gray-800">
                <img 
                  src={uploadedImage} 
                  alt="Uploaded" 
                  className="w-full h-full object-contain"
                />
                <button
                  onClick={handleRemoveImage}
                  disabled={isGenerating}
                  className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition-colors disabled:opacity-50"
                  title="Supprimer l'image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Sélection de l'angle */}
          <div className="space-y-3">
            <label className="text-gray-300 text-sm block">Angle de Caméra</label>
            <div className="grid grid-cols-2 gap-2">
              {CAMERA_ANGLES.map((angle) => (
                <button
                  key={angle.id}
                  onClick={() => setSelectedAngle(angle)}
                  disabled={isGenerating}
                  className={`p-3 rounded-lg transition-all text-left border-2 ${
                    selectedAngle.id === angle.id
                      ? 'bg-purple-600 border-purple-500 text-white'
                      : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-purple-500'
                  } disabled:opacity-50`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{angle.icon}</span>
                    <span className="text-sm">{angle.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Info technique */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <h3 className="text-gray-300 text-sm mb-2">Paramètres Techniques</h3>
            <div className="space-y-1 text-xs text-gray-400">
              <div className="flex justify-between">
                <span>Steps:</span>
                <span className="text-gray-300">4 (fixe)</span>
              </div>
              <div className="flex justify-between">
                <span>CFG Scale:</span>
                <span className="text-gray-300">1.0 (fixe)</span>
              </div>
              <div className="flex justify-between">
                <span>Sampler:</span>
                <span className="text-gray-300">Euler</span>
              </div>
              <div className="flex justify-between">
                <span>Modèle:</span>
                <span className="text-gray-300">Qwen Image Edit</span>
              </div>
            </div>
          </div>

          {/* Bouton Générer */}
          <button
            onClick={handleGenerate}
            disabled={!uploadedImage || isGenerating}
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 disabled:from-gray-700 disabled:to-gray-700 text-white py-4 rounded-lg transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Génération en cours...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Camera className="w-5 h-5" />
                Générer l'Angle
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
