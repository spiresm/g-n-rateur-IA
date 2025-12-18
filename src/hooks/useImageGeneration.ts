import { useState, useEffect, useCallback } from 'react';
import { Sparkles, Image as ImageIcon } from 'lucide-react';
import type { PosterParams, GenerationParams } from '../App';

interface PosterGeneratorProps {
  onGenerate: (posterParams: PosterParams, genParams: GenerationParams) => void;
  isGenerating: boolean;
  onPromptGenerated: (prompt: string) => void;
  generatedPrompt: string;
  imageDimensions?: { width: number; height: number };
  onGetGenerateFunction?: (fn: () => void) => void;
}

const randomData = {
  titres: ["La Nuit des Étoiles", "Royaume d'Hiver", "L'Éveil du Dragon", "Chasseurs de Légendes", "Le Grand Mystère"],
  sujets: ["Un guerrier solitaire", "Une cité futuriste", "Une forêt enchantée", "Un vaisseau spatial", "Un lion majestueux"],
  environnements: ["sous la pleine lune", "dans une tempête de neige", "au sommet d'une montagne", "au fond de l'océan", "dans le désert"]
};

export function PosterGenerator({
  onGenerate,
  isGenerating,
  onPromptGenerated,
  imageDimensions = { width: 1080, height: 1920 },
  onGetGenerateFunction
}: PosterGeneratorProps) {

  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [environment, setEnvironment] = useState('');
  const [posterStyle, setPosterStyle] = useState('Cinematic');
  const [lighting, setLighting] = useState('Dramatic');
  const [composition, setComposition] = useState('Central');
  const [additionalDetails, setAdditionalDetails] = useState('');

  const generatePromptText = useCallback(() => {
    const prompt = `Ultra detailed cinematic poster, dramatic lighting, depth, atmospheric effects.
NO TEXT MODE:
The poster must contain ZERO text, letters, symbols or numbers.
Visual elements:
${title || 'Epic scene'} - ${subject || 'Stunning visuals'} - ${environment || 'Atmospheric background'}
Extra details:
${additionalDetails ? additionalDetails + ', ' : ''}cinematic particles, depth fog, volumetric light
Image style:
${posterStyle}, ${lighting} lighting, ${composition} composition, Premium poster design, professional layout, ultra high resolution, visually striking.`;

    onPromptGenerated(prompt);
    return prompt;
  }, [
    title,
    subject,
    environment,
    posterStyle,
    lighting,
    composition,
    additionalDetails,
    onPromptGenerated
  ]);

  const handleStartGeneration = useCallback(() => {
    const finalPrompt = generatePromptText();

    const posterParams: PosterParams = {
      title,
      subject,
      environment,
      style: posterStyle,
      lighting,
      composition,
      additionalDetails
    };

    const genParams: GenerationParams = {
      prompt: finalPrompt,
      width: imageDimensions.width,
      height: imageDimensions.height
    };

    if (typeof onGenerate === 'function') {
      onGenerate(posterParams, genParams);
    }
  }, [
    generatePromptText,
    title,
    subject,
    environment,
    posterStyle,
    lighting,
    composition,
    additionalDetails,
    imageDimensions,
    onGenerate
  ]);

  useEffect(() => {
    if (typeof onGetGenerateFunction === 'function') {
      onGetGenerateFunction(handleStartGeneration);
    }
  }, [handleStartGeneration, onGetGenerateFunction]);

  const handleRandomize = () => {
    setTitle(randomData.titres[Math.floor(Math.random() * randomData.titres.length)]);
    setSubject(randomData.sujets[Math.floor(Math.random() * randomData.sujets.length)]);
    setEnvironment(randomData.environnements[Math.floor(Math.random() * randomData.environnements.length)]);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-semibold text-white">
              Configuration de l'Affiche
            </h2>
          </div>
          <button
            onClick={handleRandomize}
            type="button"
            disabled={isGenerating}
            className="flex items-center gap-2 px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded-lg border border-purple-600/30"
          >
            <ImageIcon className="w-4 h-4" />
            Aléatoire
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-gray-300 mb-2">Titre</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">Sujet</label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
