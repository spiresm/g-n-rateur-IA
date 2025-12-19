
import { useCallback, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { usePosterState } from './usePosterState';

interface PosterGeneratorProps {
  onGenerate: (posterParams: any, genParams: any) => void;
  isGenerating: boolean;
  onPromptGenerated: (prompt: string) => void;
  generatedPrompt?: string;
  imageDimensions?: { width: number; height: number };
  onGetGenerateFunction?: (fn: () => void) => void;
}

const capitalizeFirst = (value: string) =>
  value.length > 0 ? value.charAt(0).toUpperCase() + value.slice(1) : value;

export function PosterGenerator({
  onGenerate,
  isGenerating,
  onPromptGenerated,
  imageDimensions,
  onGetGenerateFunction
}: PosterGeneratorProps) {
  const poster = usePosterState();

  const randomChoice = <T,>(arr: T[]): T =>
    arr[Math.floor(Math.random() * arr.length)];

  const generateRandomPoster = () => {
    poster.setTitle(randomChoice(poster.randomData.titres));
    poster.setSubtitle(randomChoice(poster.randomData.sous_titres));
    poster.setTagline(randomChoice(poster.randomData.taglines));
  };

  const generatePrompt = useCallback(() => {
    const title = capitalizeFirst(poster.title.trim());
    const subtitle = capitalizeFirst(poster.subtitle.trim());
    const tagline = capitalizeFirst(poster.tagline.trim());

    const prompt = `
TITLE: "${title}"
SUBTITLE: "${subtitle}"
TAGLINE: "${tagline}"
`.trim();

    onPromptGenerated(prompt);
    return prompt;
  }, [poster, onPromptGenerated]);

  const handleStartGeneration = useCallback(() => {
    const prompt = generatePrompt();

    const genParams = {
      final_prompt: prompt,
      width: imageDimensions?.width ?? 1080,
      height: imageDimensions?.height ?? 1920,
    };

    onGenerate({}, genParams);
  }, [generatePrompt, onGenerate, imageDimensions]);

  useEffect(() => {
    onGetGenerateFunction?.(handleStartGeneration);
  }, [handleStartGeneration, onGetGenerateFunction]);

  return (
    <div className="p-4 space-y-4">
      <button
        type="button"
        onClick={generateRandomPoster}
        className="px-4 py-2 bg-gray-700 text-white rounded"
      >
        🎲 Aléatoire
      </button>

      <button
        type="button"
        disabled={isGenerating}
        onClick={handleStartGeneration}
        className="px-4 py-2 bg-yellow-600 text-white rounded flex gap-2 items-center"
      >
        <Sparkles className="w-4 h-4" />
        Générer
      </button>
    </div>
  );
}
