import { useState, useEffect } from 'react';
import { Upload, Camera } from 'lucide-react';

interface CameraAnglesGeneratorProps {
  onGenerate: (params: any) => void;
  isGenerating: boolean;
  onGetGenerateFunction: (fn: () => void) => void;
}

type CameraAngle = {
  id: string;
  label: string;
  description: string;
};

const CAMERA_ANGLES: CameraAngle[] = [
  { id: 'close_up', label: 'Close-up', description: 'Plan rapproché du sujet' },
  { id: 'wide_shot', label: 'Wide shot', description: 'Plan large / environnement' },
  { id: 'angle_45_right', label: '45° droite', description: 'Rotation caméra 45° droite' },
  { id: 'angle_90_right', label: '90° droite', description: 'Rotation caméra 90° droite' },
  { id: 'angle_45_left', label: '45° gauche', description: 'Rotation caméra 45° gauche' },
  { id: 'angle_90_left', label: '90° gauche', description: 'Rotation caméra 90° gauche' },
  { id: 'low_angle', label: 'Low angle', description: 'Contre-plongée' },
  { id: 'aerial_view', label: 'Aerial view', description: 'Vue aérienne' },
];

export function CameraAnglesGenerator({
  onGenerate,
  isGenerating,
  onGetGenerateFunction,
}: CameraAnglesGeneratorProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [selectedAngle, setSelectedAngle] = useState<string | null>(null);

  /* =====================================================
     🔌 REGISTER GENERATE FUNCTION (appelée depuis PreviewPanel)
     ===================================================== */
  useEffect(() => {
    onGetGenerateFunction(() => {
      if (!imageFile || !selectedAngle) return;

      onGenerate({
        image: imageFile,
        angle: selectedAngle,
      });
    });
  }, [imageFile, selectedAngle, onGenerate, onGetGenerateFunction]);

  const isReady = Boolean(imageFile && selectedAngle);

  return (
    <div className="p-6 text-white space-y-8">
      {/* HEADER */}
      <div>
        <h2 className="text-xl font-bold text-purple-400 flex items-center gap-2">
          <Camera className="w-5 h-5" />
          Angles de caméra
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          Importe une image puis choisis un angle de vue.
        </p>
      </div>

      {/* IMAGE UPLOAD */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-300">
          Image source (obligatoire)
        </label>

        <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center bg-gray-900">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            id="camera-angle-upload"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                setImageFile(e.target.files[0]);
              }
            }}
            disabled={isGenerating}
          />

          <label
            htmlFor="camera-angle-upload"
            className="cursor-pointer flex flex-col items-center gap-2"
          >
            <Upload className="w-6 h-6 text-gray-400" />
            <span className="text-sm text-gray-300">
              {imageFile ? imageFile.name : 'Clique pour importer une image'}
            </span>
          </label>
        </div>
      </div>

      {/* ANGLE SELECTION */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-gray-300">
          Angle de caméra (un seul)
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {CAMERA_ANGLES.map((angle) => {
            const isSelected = selectedAngle === angle.id;

            return (
              <button
                key={angle.id}
                type="button"
                disabled={isGenerating}
                onClick={() => setSelectedAngle(angle.id)}
                className={`text-left p-4 rounded-lg border transition-all ${
                  isSelected
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-gray-700 bg-gray-800 hover:border-gray-500'
                }`}
              >
                <div className="font-semibold">{angle.label}</div>
                <div className="text-xs text-gray-400">
                  {angle.description}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* STATUS */}
      <div className="text-sm">
        {!imageFile && (
          <p className="text-yellow-400">
            ⚠️ Importe une image pour continuer
          </p>
        )}
        {imageFile && !selectedAngle && (
          <p className="text-yellow-400">
            ⚠️ Sélectionne un angle de caméra
          </p>
        )}
        {isReady && (
          <p className="text-green-400">
            ✔️ Prêt à générer
          </p>
        )}
      </div>
    </div>
  );
}
