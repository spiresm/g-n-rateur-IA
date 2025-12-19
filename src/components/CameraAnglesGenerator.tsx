import { useState, useEffect } from 'react';
import { Upload, AlertTriangle } from 'lucide-react';

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
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [selectedAngle, setSelectedAngle] = useState<typeof ANGLES[0] | null>(null);

  useEffect(() => {
    onGetGenerateFunction(() => {
      if (!imageBase64 || !selectedAngle) return;

      onGenerate({
        image: imageBase64,

        // 🔑 OBLIGATOIRE → corrige ton erreur backend
        final_prompt: selectedAngle.prompt,

        // utile pour debug / workflow
        angle: selectedAngle.key,
      });
    });
  }, [imageBase64, selectedAngle, onGenerate, onGetGenerateFunction]);

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setImageBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
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
        <div className="flex items-center gap-4">
          <label className="cursor-pointer bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Charger une image
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => e.target.files && handleImageUpload(e.target.files[0])}
            />
          </label>

          {imageBase64 && (
            <span className="text-green-400 text-sm">Image chargée ✓</span>
          )}
        </div>
      </div>

      {/* ANGLES */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {ANGLES.map(angle => {
          const active = selectedAngle?.key === angle.key;
          return (
            <button
              key={angle.key}
              disabled={!imageBase64}
              onClick={() => setSelectedAngle(angle)}
              className={`py-3 rounded-lg border transition-all
                ${active
                  ? 'border-purple-500 bg-purple-500/20'
                  : 'border-gray-700 bg-gray-800 hover:border-gray-600'}
                ${!imageBase64 ? 'opacity-40 cursor-not-allowed' : ''}
              `}
            >
              {angle.label}
            </button>
          );
        })}
      </div>

      {/* WARNING */}
      {!selectedAngle && (
        <div className="flex items-center gap-2 text-yellow-400 text-sm">
          <AlertTriangle className="w-4 h-4" />
          Sélectionne un angle pour activer la génération
        </div>
      )}
    </div>
  );
}
