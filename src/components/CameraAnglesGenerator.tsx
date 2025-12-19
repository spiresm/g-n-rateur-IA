import { useState, useEffect } from 'react';
import { Camera } from 'lucide-react';

/* =====================================================
   🔑 MAPPING EXACT AVEC multiple-angles.json
   ===================================================== */
const ANGLE_TO_PROMPT_NODE: Record<string, string> = {
  close_up: '66',
  wide_shot: '67',
  angle_90_right: '68',
  angle_45_right: '69',
  aerial_view: '70',
  low_angle: '71',
  angle_90_left: '72',
  angle_45_left: '73',
};

interface CameraAnglesGeneratorProps {
  onGenerate: (params: any) => void;
  isGenerating: boolean;
  onGetGenerateFunction: (fn: () => void) => void;
}

export function CameraAnglesGenerator({
  onGenerate,
  isGenerating,
  onGetGenerateFunction,
}: CameraAnglesGeneratorProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [selectedAngle, setSelectedAngle] = useState<string | null>(null);

  /* =====================================================
     🧠 REGISTER GENERATE FUNCTION (appelée depuis PreviewPanel)
     ===================================================== */
  useEffect(() => {
    onGetGenerateFunction(() => {
      if (!imageFile || !selectedAngle) {
        console.warn('[CameraAnglesGenerator] Image ou angle manquant');
        return;
      }

      const activePromptNode = ANGLE_TO_PROMPT_NODE[selectedAngle];

      // Tous les prompts VIDES
      const prompts: Record<string, string> = {
        '66': '',
        '67': '',
        '68': '',
        '69': '',
        '70': '',
        '71': '',
        '72': '',
        '73': '',
      };

      // UN SEUL prompt actif
      prompts[activePromptNode] = 'ACTIVE';

      console.log('[CameraAnglesGenerator] Generate', {
        imageFile,
        prompts,
      });

      onGenerate({
        image: imageFile,
        prompts,
      });
    });
  }, [imageFile, selectedAngle, onGenerate, onGetGenerateFunction]);

  /* =====================================================
     🧩 UI
     ===================================================== */
  return (
    <div className="p-6 text-white space-y-6">
      <div className="flex items-center gap-2">
        <Camera className="w-5 h-5 text-purple-400" />
        <h2 className="text-xl font-bold">Angles de caméra</h2>
      </div>

      {/* Upload image */}
      <div>
        <label className="block text-sm text-gray-300 mb-2">
          Image source
        </label>
        <input
          type="file"
          accept="image/*"
          disabled={isGenerating}
          onChange={(e) => setImageFile(e.target.files?.[0] || null)}
          className="w-full text-sm text-gray-300"
        />
        {imageFile && (
          <p className="text-xs text-green-400 mt-1">
            Image chargée : {imageFile.name}
          </p>
        )}
      </div>

      {/* Choix angle */}
      <div>
        <label className="block text-sm text-gray-300 mb-3">
          Angle de caméra (un seul)
        </label>

        <div className="grid grid-cols-2 gap-3">
          {[
            ['close_up', 'Close-up'],
            ['wide_shot', 'Wide shot'],
            ['angle_45_right', '45° droite'],
            ['angle_90_right', '90° droite'],
            ['angle_45_left', '45° gauche'],
            ['angle_90_left', '90° gauche'],
            ['aerial_view', 'Vue aérienne'],
            ['low_angle', 'Contre-plongée'],
          ].map(([id, label]) => {
            const selected = selectedAngle === id;

            return (
              <button
                key={id}
                type="button"
                disabled={isGenerating}
                onClick={() => setSelectedAngle(id)}
                className={`px-4 py-3 rounded-lg border text-sm font-semibold transition-all
                  ${
                    selected
                      ? 'bg-purple-600 border-purple-500 text-white'
                      : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-500'
                  }
                `}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Feedback */}
      {!imageFile || !selectedAngle ? (
        <p className="text-xs text-yellow-400">
          ⚠️ Sélectionne une image ET un angle avant de générer
        </p>
      ) : (
        <p className="text-xs text-green-400">
          ✔️ Prêt à générer
        </p>
      )}
    </div>
  );
}
