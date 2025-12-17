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

export function useImageGeneration({
  onGenerate,
  isGenerating,
  onPromptGenerated,
  imageDimensions = { width: 1080, height: 1920 },
  onGetGenerateFunction
}: PosterGeneratorProps) {
  // --- ÉTATS DES MENUS ---
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [environment, setEnvironment] = useState('');
  const [posterStyle, setPosterStyle] = useState('Cinematic');
  const [lighting, setLighting] = useState('Dramatic');
  const [composition, setComposition] = useState('Central');
  const [additionalDetails, setAdditionalDetails] = useState('');

  // --- LOGIQUE DE CONSTRUCTION DU PROMPT ---
  const generatePromptText = () => {
    return `Ultra detailed cinematic poster, dramatic lighting, depth, atmospheric effects.
NO TEXT MODE:
The poster must contain ZERO text, letters, symbols or numbers.
Visual elements:
${title || 'Epic scene'} - ${subject || 'Stunning visuals'} - ${environment || 'Atmospheric background'}
Extra details:
${additionalDetails ? additionalDetails + ', ' : ''}cinematic particles, depth fog, volumetric light
Image style:
${posterStyle}, ${lighting} lighting, ${composition} composition, Premium poster design, professional layout, ultra high resolution, visually striking.`;
  };

  // --- FONCTION DE GÉNÉRATION (APPELÉE PAR LE BOUTON JAUNE) ---
  const handleStartGeneration = () => {
    const finalPrompt = generatePromptText();
    
    console.log("[POSTER_GENERATOR] 🚀 Génération lancée avec le prompt construit:", finalPrompt);
    
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
      prompt: finalPrompt, // C'est ici que l'injection se fait pour le backend
      width: imageDimensions.width,
      height: imageDimensions.height
    };

    onGenerate(posterParams, genParams);
  };

  // On expose la fonction au parent pour le bouton jaune
  useEffect(() => {
    if (onGetGenerateFunction) {
      onGetGenerateFunction(handleStartGeneration);
    }
  }, [title, subject, environment, posterStyle, lighting, composition, additionalDetails]);

  // --- GÉNÉRATION ALÉATOIRE ---
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
            <h2 className="text-lg font-semibold text-white">Configuration de l'Affiche</h2>
          </div>
          <button
            onClick={handleRandomize}
            className="flex items-center gap-2 px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded-lg transition-colors text-sm border border-purple-600/30"
            disabled={isGenerating}
          >
            <ImageIcon className="w-4 h-4" />
            Aléatoire
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-2">Titre de l'affiche</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                placeholder="Ex: La Nuit des Étoiles"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Sujet Principal</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                placeholder="Ex: Un chevalier en armure"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-2">Style d'image</label>
              <select
                value={posterStyle}
                onChange={(e) => setPosterStyle(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              >
                <option value="Cinematic">Cinématique</option>
                <option value="Digital Art">Art Digital</option>
                <option value="Cyberpunk">Cyberpunk</option>
                <option value="Fantasy">Fantasy</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Détails</label>
              <textarea
                value={additionalDetails}
                onChange={(e) => setAdditionalDetails(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white resize-none"
                rows={2}
                placeholder="Ex: Brouillard épais, étincelles..."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
