import { useState, useEffect } from "react";
import { Button } from "./ui/button";

interface CameraAnglesGeneratorProps {
  onGenerate: (params: {
    final_prompt: string;
    angle: CameraAngle;
    width: number;
    height: number;
  }) => void;
  isGenerating: boolean;
  onGetGenerateFunction?: (fn: () => void) => void;
}

type CameraAngle =
  | "close_up"
  | "wide"
  | "45_right"
  | "90_right"
  | "aerial"
  | "low"
  | "45_left"
  | "90_left";

const CAMERA_ANGLES: {
  id: CameraAngle;
  label: string;
  description: string;
}[] = [
  { id: "close_up", label: "Close-up", description: "Plan serré sur le sujet" },
  { id: "wide", label: "Wide shot", description: "Plan large / grand angle" },
  { id: "45_right", label: "45° Right", description: "Rotation caméra 45° à droite" },
  { id: "90_right", label: "90° Right", description: "Rotation caméra 90° à droite" },
  { id: "aerial", label: "Aerial view", description: "Vue aérienne" },
  { id: "low", label: "Low angle", description: "Contre-plongée" },
  { id: "45_left", label: "45° Left", description: "Rotation caméra 45° à gauche" },
  { id: "90_left", label: "90° Left", description: "Rotation caméra 90° à gauche" },
];

export function CameraAnglesGenerator({
  onGenerate,
  isGenerating,
  onGetGenerateFunction,
}: CameraAnglesGeneratorProps) {
  const [selectedAngle, setSelectedAngle] = useState<CameraAngle>("close_up");
  const [prompt, setPrompt] = useState("");

  // 🔁 Expose la fonction de génération au parent (PreviewPanel)
  useEffect(() => {
    if (!onGetGenerateFunction) return;

    onGetGenerateFunction(() => {
      handleGenerate();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAngle, prompt]);

  const handleGenerate = () => {
    if (!prompt.trim()) return;

    onGenerate({
      final_prompt: prompt,
      angle: selectedAngle,
      width: 1024,
      height: 1024,
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* PROMPT */}
      <div>
        <label className="block text-sm text-gray-300 mb-2">
          Description / intention
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Décris l’intention générale (le workflow s’occupe des angles)"
          rows={4}
          disabled={isGenerating}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
        />
      </div>

      {/* ANGLES */}
      <div>
        <h3 className="text-sm font-semibold text-gray-200 mb-3">
          Angle de caméra
        </h3>

        <div className="grid grid-cols-2 gap-3">
          {CAMERA_ANGLES.map((angle) => {
            const isActive = selectedAngle === angle.id;

            return (
              <button
                key={angle.id}
                type="button"
                disabled={isGenerating}
                onClick={() => setSelectedAngle(angle.id)}
                className={`p-3 rounded-lg border text-left transition-all
                  ${
                    isActive
                      ? "border-purple-500 bg-purple-500/10 text-white"
                      : "border-gray-600 bg-gray-800 text-gray-300 hover:border-gray-400"
                  }
                `}
              >
                <div className="font-semibold text-sm">{angle.label}</div>
                <div className="text-xs text-gray-400">
                  {angle.description}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ACTION */}
      <div className="pt-4">
        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold"
        >
          Générer l’angle sélectionné
        </Button>
      </div>
    </div>
  );
}
