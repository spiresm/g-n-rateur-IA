import { useState, useEffect } from 'react';
import { Sparkles, Image as ImageIcon } from 'lucide-react';
import { PosterParams, GenerationParams } from '../App';

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

export default function PosterGenerator({
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

  const generatePromptText = () => {
    return `Ultra detailed cinematic poster, ${lighting} lighting, ${composition} composition, ${posterStyle} style.
Visuals: ${title} - ${subject} - ${environment}. ${additionalDetails}. 
NO TEXT: The image must not contain any letters or numbers.`;
  };

  const handleStartGeneration = () => {
    const finalPrompt = generatePromptText();
    
    const posterParams: PosterParams = {
      title, subject, environment, style: posterStyle,
      lighting, composition, additionalDetails
    };

    const genParams: GenerationParams = {
      prompt: finalPrompt,
      width: imageDimensions.width,
      height: imageDimensions.height
    };

    onGenerate(posterParams, genParams);
  };

  useEffect(() => {
    if (onGetGenerateFunction) {
      onGetGenerateFunction(handleStartGeneration);
    }
  }, [title, subject, environment, posterStyle, lighting, composition, additionalDetails]);

  const handleRandomize = () => {
    setTitle(randomData.titres[Math.floor(Math.random() * randomData.titres.length)]);
    setSubject(randomData.sujets[Math.floor(Math.random() * randomData.sujets.length)]);
    setEnvironment(randomData.environnements[Math.floor(Math.random() * randomData.environnements.length)]);
  };

  return (
    <div className="space-y-6 bg-gray-800/50 p-6 rounded-xl border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-bold flex items-center gap-2">
            <Sparkles className="text-purple-400" /> Configuration
          </h2>
          <button onClick={handleRandomize} className="text-xs bg-purple-600/20 p-2 rounded text-purple-400 border border-purple-600/30 hover:bg-purple-600/40">
            <ImageIcon className="inline w-3 h-3 mr-1" /> Aléatoire
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="Titre" className="bg-gray-700 text-white p-2 rounded border border-gray-600" />
          <input type="text" value={subject} onChange={(e)=>setSubject(e.target.value)} placeholder="Sujet" className="bg-gray-700 text-white p-2 rounded border border-gray-600" />
          <select value={posterStyle} onChange={(e)=>setPosterStyle(e.target.value)} className="bg-gray-700 text-white p-2 rounded border border-gray-600">
            <option value="Cinematic">Cinématique</option>
            <option value="Cyberpunk">Cyberpunk</option>
            <option value="Fantasy">Fantasy</option>
          </select>
          <textarea value={additionalDetails} onChange={(e)=>setAdditionalDetails(e.target.value)} placeholder="Détails (brouillard, étincelles...)" className="bg-gray-700 text-white p-2 rounded border border-gray-600 h-10" />
        </div>
    </div>
  );
}
