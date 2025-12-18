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

// LISTES COMPLÈTES POUR LES MENUS DÉROULANTS
const occasions = ["Autre", "Anniversaire", "Mariage", "Fête", "Cinéma", "Jeu Vidéo", "Spectacle", "Événement"];
const ambiances = ["Épique", "Mystérieux", "Sombre", "Lumineux", "Coloré", "Minimaliste", "Cinématique", "Vintage", "Noir & Blanc", "Surréaliste"];
const mainCharacters = ["Aucun", "Homme", "Femme", "Enfant", "Animal", "Robot", "Créature", "Groupe", "Objet"];
const environments = ["Nature", "Ville", "Espace", "Intérieur", "Fantastique", "Historique", "Abstrait", "Océan", "Désert"];
const actions = ["Pose statique", "En mouvement", "Combat", "Contemplation", "Vol", "Interaction", "Course", "Magie"];
const palettes = ["Vibrante", "Pastel", "Monochrome", "Chaude", "Froide", "Sombre", "Néon", "Sépia", "Complémentaire"];
const titleStyles = ["Moderne", "Classique", "Manuscrit", "Gras", "Élégant", "Futuriste", "Rétro", "Minimaliste"];

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
  
  // ÉTATS COMPLETS (ARCHIVE)
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
    Title focus: ${title || 'Legend'}. Subtitle: ${subtitle}. Tagline: ${tagline}.
    Main Subject: ${characterDescription || mainCharacter} performing ${actionDescription || characterAction}.
    Setting: ${environmentDescription || environment}.
    Artistic Style: ${ambiance}, ${colorPalette} palette, Title Style: ${titleStyle}.
    Cinematic lighting, 8k, professional composition. NO TEXT ON IMAGE.`;
  };

  useEffect(() => {
    if (onPromptGenerated) onPromptGenerated(generatePromptText());
  }, [title, subtitle, tagline, characterDescription, environmentDescription, ambiance, colorPalette, titleStyle]);

  const handleStartGeneration = () => {
    const posterParams: PosterParams = {
      title, subtitle, tagline, occasion, customOccasion, ambiance, 
      customAmbiance, mainCharacter, characterDescription, environment, 
      environmentDescription, characterAction, actionDescription, 
      additionalDetails, colorPalette, customPalette, titleStyle
    };
    onGenerate(posterParams, {
      prompt: generatePromptText(),
      width: imageDimensions.width,
      height: imageDimensions.height
    });
  };

  useEffect(() => {
    if (onGetGenerateFunction) onGetGenerateFunction(handleStartGeneration);
  }, [title, subtitle, tagline, characterDescription, environmentDescription, ambiance, additionalDetails, colorPalette, titleStyle]);

  const handleRandomize = () => {
    setTitle(randomData.titres[Math.floor(Math.random() * randomData.titres.length)]);
    setSubtitle(randomData.sous_titres[Math.floor(Math.random() * randomData.sous_titres.length)]);
  };

  return (
    <div className="p-4 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
      <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2"><Sparkles className="text-yellow-400" /> Configuration de l'Affiche</h2>
          <button onClick={handleRandomize} className="bg-purple-600/20 text-purple-300 px-3 py-1 rounded-lg border border-purple-500/30 flex items-center gap-1 text-sm"><ImageIcon size={14} /> Aléatoire</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          {/* TEXTES */}
          <div className="space-y-4">
            <h3 className="text-purple-400 font-bold uppercase text-xs">Textes & Titres</h3>
            <input type="text" placeholder="Titre principal" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-gray-900 border border-gray-700 p-2 rounded" />
            <input type="text" placeholder="Sous-titre" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} className="w-full bg-gray-900 border border-gray-700 p-2 rounded" />
            <input type="text" placeholder="Accroche (Tagline)" value={tagline} onChange={(e) => setTagline(e.target.value)} className="w-full bg-gray-900 border border-gray-700 p-2 rounded" />
            <select value={titleStyle} onChange={(e) => setTitleStyle(e.target.value)} className="w-full bg-gray-900 border border-gray-700 p-2 rounded">
               {titleStyles.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* PERSONNAGE & ACTION */}
          <div className="space-y-4">
            <h3 className="text-purple-400 font-bold uppercase text-xs">Sujet & Action</h3>
            <select value={mainCharacter} onChange={(e) => setMainCharacter(e.target.value)} className="w-full bg-gray-900 border border-gray-700 p-2 rounded">
               {mainCharacters.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <textarea placeholder="Description du sujet..." value={characterDescription} onChange={(e) => setCharacterDescription(e.target.value)} className="w-full bg-gray-900 border border-gray-700 p-2 rounded h-20 resize-none" />
            <select value={characterAction} onChange={(e) => setCharacterAction(e.target.value)} className="w-full bg-gray-900 border border-gray-700 p-2 rounded">
               {actions.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>

          {/* VISUEL & AMBIANCE */}
          <div className="space-y-4">
            <h3 className="text-purple-400 font-bold uppercase text-xs">Ambiance & Style</h3>
            <select value={ambiance} onChange={(e) => setAmbiance(e.target.value)} className="w-full bg-gray-900 border border-gray-700 p-2 rounded">
               {ambiances.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
            <select value={colorPalette} onChange={(e) => setColorPalette(e.target.value)} className="w-full bg-gray-900 border border-gray-700 p-2 rounded">
               {palettes.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          {/* ENVIRONNEMENT */}
          <div className="space-y-4">
            <h3 className="text-purple-400 font-bold uppercase text-xs">Environnement</h3>
            <select value={environment} onChange={(e) => setEnvironment(e.target.value)} className="w-full bg-gray-900 border border-gray-700 p-2 rounded">
               {environments.map(env => <option key={env} value={env}>{env}</option>)}
            </select>
            <textarea placeholder="Détails de l'environnement..." value={environmentDescription} onChange={(e) => setEnvironmentDescription(e.target.value)} className="w-full bg-gray-900 border border-gray-700 p-2 rounded h-20 resize-none" />
          </div>
        </div>
      </div>
    </div>
  );
}
