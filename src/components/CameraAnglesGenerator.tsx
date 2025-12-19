import { useState, useEffect, useCallback } from "react";

type AngleKey =
  | "close_up"
  | "wide"
  | "left_45"
  | "left_90"
  | "right_45"
  | "right_90"
  | "aerial"
  | "low";

const ANGLES: { key: AngleKey; label: string }[] = [
  { key: "close_up", label: "Gros plan" },
  { key: "wide", label: "Plan large" },
  { key: "left_45", label: "45° gauche" },
  { key: "left_90", label: "90° gauche" },
  { key: "right_45", label: "45° droite" },
  { key: "right_90", label: "90° droite" },
  { key: "aerial", label: "Vue aérienne" },
  { key: "low", label: "Contre-plongée" },
];

type FormatKey = "portrait" | "landscape" | "square";

const FORMATS: Record<FormatKey, { width: number; height: number; label: string }> = {
  portrait: { width: 1080, height: 1920, label: "Portrait 1080×1920" },
  landscape: { width: 1920, height: 1080, label: "Paysage 1920×1080" },
  square: { width: 1080, height: 1080, label: "Carré 1080×1080" },
};

interface Props {
  onGenerate: (params: any) => void;
  isGenerating: boolean;
  onGetGenerateFunction?: (fn: () => void) => void;
}

export function CameraAnglesGenerator({
  onGenerate,
  isGenerating,
  onGetGenerateFunction,
}: Props) {
  // 🔒 états stables (ne se reset jamais tout seuls)
  const [finalPrompt, setFinalPrompt] = useState("");
  const [angle, setAngle] = useState<AngleKey>("close_up");
  const [format, setFormat] = useState<FormatKey>("portrait");

  // dimensions dérivées (jamais stockées ailleurs)
  const { width, height } = FORMATS[format];

  // 🔁 fonction unique de génération
  const generate = useCallback(() => {
    if (!finalPrompt.trim() || isGenerating) return;

    onGenerate({
      final_prompt: finalPrompt.trim(),
      angle,
      width,
      height,
    });
  }, [finalPrompt, angle, width, height, isGenerating, onGenerate]);

  // 📤 expose la fonction au parent (PreviewPanel bouton)
  useEffect(() => {
    onGetGenerateFunction?.(generate);
  }, [generate, onGetGenerateFunction]);

  return (
    <div className="p-6 space-y-6">
      {/* TITRE */}
      <div>
        <h2 className="text-xl font-bold text-white">Angles de caméra</h2>
        <p className="text-sm text-gray-400">
          Choisis un angle et un format, puis génère une image.
        </p>
      </div>

      {/* PROMPT FINAL */}
      <div className="space-y-2">
        <label className="text-sm text-gray-300">
          Prompt final (généré par ton outil)
        </label>
        <textarea
          value={finalPrompt}
          onChange={(e) => setFinalPrompt(e.target.value)}
          disabled={isGenerating}
          className="w-full min-h-[100px] px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
          placeholder="Colle ici le prompt final…"
        />
      </div>

      {/* FORMATS */}
      <div className="flex flex-wrap gap-2">
        {(Object.keys(FORMATS) as FormatKey[]).map((key) => (
          <button
            key={key}
            disabled={isGenerating}
            onClick={() => setFormat(key)}
            className={`px-3 py-2 rounded-lg text-sm border transition ${
              format === key
                ? "bg-purple-600 border-purple-500 text-white"
                : "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
            }`}
          >
            {FORMATS[key].label}
          </button>
        ))}
      </div>

      {/* ANGLES */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {ANGLES.map((a) => (
          <button
            key={a.key}
            disabled={isGenerating}
            onClick={() => setAngle(a.key)}
            className={`p-3 rounded-lg border text-sm transition ${
              angle === a.key
                ? "bg-purple-600/20 border-purple-500 text-white"
                : "bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700"
            }`}
          >
            {a.label}
          </button>
        ))}
      </div>

      {/* BOUTON GENERER */}
      <button
        disabled={isGenerating || !finalPrompt.trim()}
        onClick={generate}
        className="w-full py-3 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold"
      >
        Générer avec cet angle
      </button>
    </div>
  );
}
