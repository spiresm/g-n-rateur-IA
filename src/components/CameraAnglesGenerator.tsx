import { useState, useEffect } from 'react';

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
  const [selectedAngle, setSelectedAngle] = useState<string | null>(null);

  // expose la fonction "générer" au bouton de droite
  useEffect(() => {
    onGetGenerateFunction(() => {
      if (!selectedAngle) return;

      onGenerate({
        angle: selectedAngle,
      });
    });
  }, [selectedAngle, onGenerate, onGetGenerateFunction]);

  const angles = [
    { id: 'close_up', label: 'Close-up' },
    { id: 'wide', label: 'Wide shot' },
    { id: '45_right', label: '45° droite' },
    { id: '90_right', label: '90° droite' },
    { id: 'aerial', label: 'Vue aérienne' },
    { id: 'low', label: 'Contre-plongée' },
    { id: '45_left', label: '45° gauche' },
    { id: '90_left', label: '90° gauche' },
  ];

  return (
    <div className="p-6 text-white">
      <h2 className="text-xl font-bold text-purple-400 mb-4">
        Angle de caméra
      </h2>

      <p className="text-sm text-gray-400 mb-6">
        Choisis un angle avant de générer l’image.
      </p>

      <div className="grid grid-cols-2 gap-3">
        {angles.map((angle) => {
          const isSelected = selectedAngle === angle.id;

          return (
            <button
              key={angle.id}
              onClick={() => setSelectedAngle(angle.id)}
              disabled={isGenerating}
              className={`
                p-3 rounded-lg border text-sm font-semibold transition
                ${
                  isSelected
                    ? 'border-purple-500 bg-purple-500/20 text-purple-300'
                    : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-500'
                }
                ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {angle.label}
            </button>
          );
        })}
      </div>

      {!selectedAngle && (
        <p className="text-xs text-yellow-400 mt-4">
          ⚠️ Sélectionne un angle pour activer la génération
        </p>
      )}
    </div>
  );
}
