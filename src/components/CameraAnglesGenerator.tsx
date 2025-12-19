import { useState, useEffect } from "react";
import { Button } from "./ui/button";

interface CameraAnglesGeneratorProps {
  onGenerate: (params: {
    image: File;
    angle: CameraAngle;
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

const CAMERA_ANGLES: { id: CameraAngle; label: string }[] = [
  { id: "close_up", label: "Close-up" },
  { id: "wide", label: "Wide shot" },
  { id: "45_right", label: "45° droite" },
  { id: "90_right", label: "90° droite" },
  { id: "aerial", label: "Vue aérienne" },
  { id: "low", label: "Contre-plongée" },
  { id: "45_left", label: "45° gauche" },
  { id: "90_left", label: "90° gauche" },
];

export function CameraAnglesGenerator({
  onGenerate,
  isGenerating,
  onGetGenerateFunction,
}: CameraAnglesGeneratorProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [selectedAngle, setSelectedAngle] =
    useState<CameraAngle>("close_up");

  // 🔁 Expose la fonction de génération au parent
  useEffect(() => {
    if (!onGetGenerateFunction) return;

    onGetGenerateFunction(() => {
      if (!imageFile) return;

      onGenerate({
        image: imageFile,
        angle: selectedAngle,
      });
    });
  }, [imageFile, selectedAngle, onGenerate, onGetGenerateFunction]);

  return (
    <div className="p-6 space-y-6">
      {/* UPLOAD IMAGE */}
      <div>
        <label className="block text-sm text-gray-300 mb-2">
          Image à transformer
        </label>
        <input
          type="file"
          accept="image/*"
          disabled={isGenerating}
          onChange={(e) => setImageFile(e.target.files?.[0] || null)}
          className="block w-full text-sm text-gray-300
            file:mr-4 file:py-2 file:px-4
            file:rounded-lg file:border-0
            file:text-sm file:font-semibold
            file:bg-purple-600 file:text-white
            hover:file:bg-purple-700
          "
        />
      </div>

      {/* ANGLES */}
      <div>
        <h3 className="text-sm font-semibold text-gray-200 mb-3">
          Angle de caméra
        </h3>

        <div className="grid grid-cols-2 gap-3">
          {CAMERA_ANGLES.map((angle) => {
            const active = selectedAngle === angle.id;

            return (
              <button
                key={angle.id}
                type="button"
                disabled={isGenerating}
                onClick={() => setSelectedAngle(angle.id)}
                className={`p-3 rounded-lg border text-sm font-medium transition-all
                  ${
                    active
                      ? "border-purple-500 bg-purple-500/10 text-white"
                      : "border-gray-600 bg-gray-800 text-gray-300 hover:border-gray-400"
                  }
                `}
              >
                {angle.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* INFO */}
      {!imageFile && (
        <p className="text-xs text-gray-400 italic">
          Sélectionne une image pour activer la génération
        </p>
      )}
    </div>
  );
}
