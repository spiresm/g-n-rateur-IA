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

// --- DONNÉES MANQUANTES QUI FAISAIENT PLANTER LE MENU ---
const occasions = ["Autre", "Anniversaire", "Mariage", "Fête", "Cinéma", "Jeu Vidéo"];
const ambiances = ["Épique", "Mystérieux", "Sombre", "Lumineux", "Coloré", "Minimaliste", "Cinématique", "Vintage"];
const mainCharacters = ["Aucun", "Homme", "Femme", "Enfant", "Animal", "Robot", "Créature", "Groupe"];
const environments = ["Nature", "Ville", "Espace", "Intérieur", "Fantastique", "Historique", "Abstrait"];
const actions = ["Pose statique", "En mouvement", "Combat", "Contemplation", "Vol", "Interaction"];
const palettes = ["Vibrante", "Pastel", "Monochrome", "Chaude", "Froide", "Sombre", "Néon"];
const titleStyles = ["Moderne", "Classique", "Manuscrit", "Gras", "Élégant", "Futuriste"];

const randomData = {
  titres: ["La Nuit des Étoiles", "Royaume d'Hiver", "L'Éveil du Dragon", "Chasseurs de Légendes", "Le Grand Mystère", "Voyage Intemporel"],
  sous_titres: ["Une aventure épique", "Le chapitre final", "L'histoire commence", "Édition collector"]
};

export function PosterGenerator({
  onGenerate,
  isGenerating,
  onPromptGenerated,
  imageDimensions = { width: 1080, height: 1920 },
  onGetGenerateFunction
}: PosterGeneratorProps) {
  
  // TOUS LES ÉTATS DU FORMULAIRE
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
    return `Ultra detailed cinematic poster. 
    Title: ${title || 'Epic Movie'}. ${subtitle ? `Subtitle: ${subtitle}.` : ''}
    Character: ${characterDescription || mainCharacter}.
    Action: ${actionDescription || characterAction}.
    Environment: ${environmentDescription || environment}.
    Style: ${ambiance}, ${colorPalette} color palette. 
    Professional lighting, 8k resolution, trending on artstation. NO TEXT ON IMAGE.`;
  };

  // Mise à jour du prompt pour le parent (PreviewPanel)
  useEffect(() => {
    if (onPromptGenerated) onPromptGenerated(generatePromptText());
  }, [title, subtitle, characterDescription, environmentDescription, ambiance, colorPalette]);

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

  // Enregistre la fonction pour le bouton jaune
  useEffect(() => {
    if (onGetGenerateFunction) {
      onGetGenerateFunction(handleStartGeneration);
    }
  }, [title, subtitle, characterDescription, environmentDescription, ambiance, additionalDetails, colorPalette]);

  const handleRandomize = () => {
    setTitle(randomData.titres[Math.floor(Math.random() * randomData.titres.length)]);
    setSubtitle(randomData.sous_titres[Math.floor(Math.random() * randomData.sous_titres.length)]);
  };

  return (
    <div className="p-4 space-y-6">
      <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold flex items-center gap-2 text-white">
            <Sparkles className="text-yellow-400" /> Menu Affiche Rubens
          </h2>
          <button onClick={handleRandomize} className="flex items-center gap-1 bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 px-3 py-1.5 rounded-lg border border-purple-500/30 transition-all text-sm">
            <ImageIcon size={16} /> Aléatoire
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* COLONNE GAUCHE */}
          <div className="space-y-5">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Titre du film / Projet</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-gray-900/80 border border-gray-700 p-2.5 rounded-lg text-white focus:border-purple-500 outline-none" placeholder="L'aventure Rubens..." />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Sujet (Description)</label>
              <textarea value={characterDescription} onChange={(e) => setCharacterDescription(e.target.value)} className="w-full bg-gray-900/80 border border-gray-700 p-2.5 rounded-lg text-white h-24 resize-none focus:border-purple-500 outline-none" placeholder="Décrivez le personnage principal..." />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Palette de couleurs</label>
              <select value={colorPalette} onChange={(e) => setColorPalette(e.target.value)} className="w-full bg-gray-900/80 border border-gray-700 p-2.5 rounded-lg text-white">
                {palettes.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          {/* COLONNE DROITE */}
          <div className="space-y-5">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Ambiance visuelle</label>
              <select value={ambiance} onChange={(e) => setAmbiance(e.target.value)} className="w-full bg-gray-900/80 border border-gray-700 p-2.5 rounded-lg text-white">
                {ambiances.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Environnement</label>
              <textarea value={environmentDescription} onChange={(e) => setEnvironmentDescription(e.target.value)} className="w-full bg-gray-900/80 border border-gray-700 p-2.5 rounded-lg text-white h-24 resize-none focus:border-purple-500 outline-none" placeholder="Où se passe la scène ?" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Action du personnage</label>
              <select value={characterAction} onChange={(e) => setCharacterAction(e.target.value)} className="w-full bg-gray-900/80 border border-gray-700 p-2.5 rounded-lg text-white">
                {actions.map(act => <option key={act} value={act}>{act}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
