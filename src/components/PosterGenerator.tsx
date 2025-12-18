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

// Données de ton archive pour le bouton Aléatoire
const randomData = {
  titres: ["La Nuit des Étoiles", "Royaume d'Hiver", "L'Éveil du Dragon", "Chasseurs de Légendes", "Le Grand Mystère", "Voyage Intemporel"],
  sous_titres: ["Une aventure épique", "Le chapitre final", "L'histoire commence", "Édition collector"],
  ambiances: ["Mystérieux", "Épique", "Sombre", "Lumineux", "Coloré", "Minimaliste"]
};

// ON UTILISE "export function" pour correspondre à ton AppContent
export function PosterGenerator({
  onGenerate,
  isGenerating,
  onPromptGenerated,
  imageDimensions = { width: 1080, height: 1920 },
  onGetGenerateFunction
}: PosterGeneratorProps) {
  
  // TOUS LES ÉTATS DE TON ARCHIVE
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [occasion, setOccasion] = useState('Autre');
  const [customOccasion, setCustomOccasion] = useState('');
  const [ambiance, setAmbiance] = useState('Épique');
  const [customAmbiance, setCustomAmbiance] = useState('');
  const [mainCharacter, setMainCharacter] = useState('Aucun');
  const [characterDescription, setCharacterDescription] = useState('');
  const [environment, setEnvironment] = useState('Nature');
  const [environmentDescription, setEnvironmentDescription] = useState('');
  const [characterAction, setCharacterAction] = useState('Pose statique');
  const [actionDescription, setActionDescription] = useState('');
  const [additionalDetails, setAdditionalDetails] = useState('');
  const [colorPalette, setColorPalette] = useState('Vibrante');
  const [customPalette, setCustomPalette] = useState('');
  const [titleStyle, setTitleStyle] = useState('Moderne');

  const generatePromptText = () => {
    return `Ultra detailed cinematic poster. Visual elements: ${title} - ${subtitle}. 
            Subject: ${characterDescription || mainCharacter}. 
            Action: ${actionDescription || characterAction}.
            Environment: ${environmentDescription || environment}. 
            Style: ${ambiance}, ${colorPalette} colors. 
            NO TEXT MODE: ZERO letters.`;
  };

  // Mise à jour du prompt pour le parent
  useEffect(() => {
    onPromptGenerated(generatePromptText());
  }, [title, subtitle, characterDescription, environmentDescription, ambiance]);

  const handleStartGeneration = () => {
    const posterParams: PosterParams = { 
        title, subtitle, tagline, occasion, customOccasion, ambiance, 
        customAmbiance, mainCharacter, characterDescription, environment, 
        environmentDescription, characterAction, actionDescription, 
        additionalDetails, colorPalette, customPalette, titleStyle 
    };
    const genParams: GenerationParams = {
      prompt: generatePromptText(),
      width: imageDimensions.width,
      height: imageDimensions.height
    };
    onGenerate(posterParams, genParams);
  };

  // LIAISON AVEC LE BOUTON JAUNE
  useEffect(() => {
    if (onGetGenerateFunction) {
      onGetGenerateFunction(handleStartGeneration);
    }
  }, [title, subtitle, characterDescription, environmentDescription, ambiance, additionalDetails]);

  const handleRandomize = () => {
    setTitle(randomData.titres[Math.floor(Math.random() * randomData.titres.length)]);
    setSubtitle(randomData.sous_titres[Math.floor(Math.random() * randomData.sous_titres.length)]);
    setAmbiance(randomData.ambiances[Math.floor(Math.random() * randomData.ambiances.length)]);
  };

  return (
    <div className="p-6 space-y-8 bg-gray-900/50 rounded-xl border border-gray-800">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Sparkles className="text-yellow-400" /> Configuration de l'Affiche
        </h2>
        <button onClick={handleRandomize} className="text-sm bg-purple-600/20 px-3 py-1 rounded border border-purple-500/50 text-purple-300 flex items-center gap-1">
          <ImageIcon size={14} /> Aléatoire
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-400">Titre</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-gray-800 border border-gray-700 p-2 rounded text-white" />
          
          <label className="block text-sm font-medium text-gray-400">Sujet principal</label>
          <textarea value={characterDescription} onChange={(e) => setCharacterDescription(e.target.value)} className="w-full bg-gray-800 border border-gray-700 p-2 rounded text-white h-24" />
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-400">Ambiance</label>
          <select value={ambiance} onChange={(e) => setAmbiance(e.target.value)} className="w-full bg-gray-800 border border-gray-700 p-2 rounded text-white">
            {randomData.ambiances.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          
          <label className="block text-sm font-medium text-gray-400">Environnement</label>
          <input type="text" value={environmentDescription} onChange={(e) => setEnvironmentDescription(e.target.value)} className="w-full bg-gray-800 border border-gray-700 p-2 rounded text-white" />
        </div>
      </div>
    </div>
  );
}
