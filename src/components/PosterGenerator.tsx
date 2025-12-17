import { useState, useEffect } from 'react';
import { Sparkles, Image as ImageIcon } from 'lucide-react';
import { PosterParams, GenerationParams } from '../App';

interface PosterGeneratorProps {
  onGenerate: (posterParams: PosterParams, genParams: GenerationParams) => void;
  isGenerating: boolean;
  onPromptGenerated?: (prompt: string) => void;
  generatedPrompt?: string;
  imageDimensions?: { width: number; height: number };
  onGetGenerateFunction?: (fn: () => void) => void;
}

const randomData = {
  titres: ["La Nuit des Étoiles", "Royaume d'Hiver", "L'Éveil du Dragon", "Chasseurs de Légendes", "Le Grand Mystère"],
  sujets: ["Un guerrier solitaire", "Une cité futuriste", "Une forêt enchantée", "Un vaisseau spatial", "Un lion majestueux"],
  environnements: ["sous la pleine lune", "dans une tempête de neige", "au sommet d'une montagne", "au fond de l'océan", "dans le désert"]
};

// Utilisation d'un export nommé pour correspondre à l'import dans AppContent
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

  // Fonction de construction du prompt
  const generatePromptText = () => {
    return `Ultra detailed cinematic poster, dramatic lighting, depth, atmospheric effects.
NO TEXT MODE:
The poster must contain ZERO text.
Visual elements: ${title || 'Epic scene'} - ${subject || 'Stunning visuals'} - ${environment || 'Atmospheric background'}
Style: ${posterStyle}, ${lighting} lighting, ${composition} composition.`;
  };

  // Met à jour le prompt dans le parent dès qu'un champ change
  useEffect(() => {
    if (onPromptGenerated) {
      onPromptGenerated(generatePromptText());
    }
  }, [title, subject, environment, posterStyle, lighting, composition, onPromptGenerated]);

  const handleStartGeneration = () => {
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

    if (onGenerate) {
      onGenerate(posterParams, genParams);
    }
  };

  // Envoie la fonction de déclenchement au bouton jaune du parent
  useEffect(() => {
    if (onGetGenerateFunction) {
      onGetGenerateFunction(handleStartGeneration);
    }
    // Dépendances incluses pour que le bouton jaune utilise les données à jour
  }, [title, subject, environment, posterStyle, lighting, composition, additionalDetails, onGetGenerateFunction]);

  const handleRandomize = () => {
    setTitle(randomData.titres[Math.floor(Math.random() * randomData.titres.length)]);
    setSubject(randomData.sujets[Math.floor(Math.random() * randomData.sujets.length)]);
    setEnvironment(randomData.environnements[Math.floor(Math.random() * randomData.environnements.length)]);
  };

  return (
    <div className="space-y-6 p-4">
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-semibold text-white">Configuration de l'Affiche</h2>
          </div>
          <button
            onClick={handleRandomize}
            type="button"
            className="flex items-center gap-2 px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded-lg transition-colors text-sm border border-purple-600/30"
            disabled={isGenerating}
          >
            <ImageIcon className="w-4 h-4" /> Aléatoire
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2 font-medium">Titre suggéré</label>
              <input 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                className="w-full px-4 py-2 bg-gray-900/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all" 
                placeholder="Ex: La Nuit des Étoiles"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2 font-medium">Sujet Principal</label>
              <input 
                type="text" 
                value={subject} 
                onChange={(e) => setSubject(e.target.value)} 
                className="w-full px-4 py-2 bg-gray-900/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all" 
                placeholder="Ex: Un chevalier"
              />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2 font-medium">Style visuel</label>
              <select 
                value={posterStyle} 
                onChange={(e) => setPosterStyle(e.target.value)} 
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 outline-none appearance-none cursor-pointer"
              >
                <option value="Cinematic">Cinématique</option>
                <option value="Cyberpunk">Cyberpunk</option>
                <option value="Fantasy">Fantasy</option>
                <option value="Digital Art">Art Digital</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2 font-medium">Environnement</label>
              <input 
                type="text" 
                value={environment} 
                onChange={(e) => setEnvironment(e.target.value)} 
                className="w-full px-4 py-2 bg-gray-900/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all" 
                placeholder="Ex: Une forêt sombre"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
