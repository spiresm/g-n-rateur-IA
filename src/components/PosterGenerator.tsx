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

// --- RESTAURATION DE VOS DONNÉES DE MENU INITIALES ---
const menuData = {
  occasions: ["Choisir...", "Anniversaire", "Mariage", "Fête", "Cinéma", "Jeu Vidéo", "Spectacle", "Événement", "Autre"],
  ambiances: ["Choisir...", "Épique", "Mystérieux", "Sombre", "Lumineux", "Coloré", "Minimaliste", "Cinématique", "Vintage", "Noir & Blanc", "Surréaliste"],
  personnages: ["Choisir...", "Homme", "Femme", "Enfant", "Animal", "Robot", "Créature", "Groupe", "Objet", "Aucun"],
  environnements: ["Choisir...", "Nature", "Ville", "Espace", "Intérieur", "Fantastique", "Historique", "Abstrait", "Océan", "Désert"],
  actions: ["Choisir...", "Pose statique", "En mouvement", "Combat", "Contemplation", "Vol", "Interaction", "Course", "Magie"],
  palettes: ["Choisir...", "Vibrante", "Pastel", "Monochrome", "Chaude", "Froide", "Sombre", "Néon", "Sépia"],
  titleStyles: ["Choisir...", "Moderne", "Classique", "Manuscrit", "Gras", "Élégant", "Futuriste", "Rétro"]
};

export function PosterGenerator({ 
  onGenerate, 
  isGenerating, 
  onPromptGenerated, 
  imageDimensions, 
  onGetGenerateFunction 
}: PosterGeneratorProps) {
  
  // ÉTATS COMPLETS (RÉTABLIS SELON VOTRE ARCHIVE)
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [occasion, setOccasion] = useState('Choisir...');
  const [customOccasion, setCustomOccasion] = useState('');
  const [ambiance, setAmbiance] = useState('Choisir...');
  const [customAmbiance, setCustomAmbiance] = useState('');
  const [mainCharacter, setMainCharacter] = useState('Choisir...');
  const [characterDescription, setCharacterDescription] = useState('');
  const [environment, setEnvironment] = useState('Choisir...');
  const [environmentDescription, setEnvironmentDescription] = useState('');
  const [characterAction, setCharacterAction] = useState('Choisir...');
  const [actionDescription, setActionDescription] = useState('');
  const [additionalDetails, setAdditionalDetails] = useState('');
  const [colorPalette, setColorPalette] = useState('Choisir...');
  const [customPalette, setCustomPalette] = useState('');
  const [titleStyle, setTitleStyle] = useState('Choisir...');

  // Construction du prompt pour l'IA
  const generatePromptText = () => {
    const parts = [
      `Ultra detailed cinematic poster.`,
      title ? `Main Title: "${title}".` : "",
      subtitle ? `Subtitle: "${subtitle}".` : "",
      `Theme: ${occasion !== 'Choisir...' ? occasion : customOccasion}.`,
      `Subject: ${characterDescription || (mainCharacter !== 'Choisir...' ? mainCharacter : '')}.`,
      `Action: ${actionDescription || (characterAction !== 'Choisir...' ? characterAction : '')}.`,
      `Setting: ${environmentDescription || (environment !== 'Choisir...' ? environment : '')}.`,
      `Style: ${ambiance !== 'Choisir...' ? ambiance : customAmbiance}, ${colorPalette !== 'Choisir...' ? colorPalette : customPalette} palette.`,
      `Typography style: ${titleStyle !== 'Choisir...' ? titleStyle : 'Cinematic'}.`,
      `NO TEXT ON IMAGE except specified titles.`
    ];
    return parts.filter(p => p !== "").join(" ");
  };

  // Mise à jour temps réel pour le PreviewPanel
  useEffect(() => {
    onPromptGenerated(generatePromptText());
  }, [title, subtitle, tagline, occasion, customOccasion, ambiance, colorPalette, characterDescription]);

  const handleStartGeneration = () => {
    const posterParams: PosterParams = {
      title, subtitle, tagline, occasion, customOccasion, ambiance, 
      customAmbiance, mainCharacter, characterDescription, environment, 
      environmentDescription, characterAction, actionDescription, 
      additionalDetails, colorPalette, customPalette, titleStyle
    };

    onGenerate(posterParams, {
      prompt: generatePromptText(),
      width: imageDimensions?.width || 1024,
      height: imageDimensions?.height || 1792,
      steps: 9,
      cfg: 1,
      seed: Math.floor(Math.random() * 1000000)
    });
  };

  // Liaison indispensable avec le bouton jaune d'AppContent
  useEffect(() => {
    if (onGetGenerateFunction) {
      onGetGenerateFunction(handleStartGeneration);
    }
  }, [title, subtitle, tagline, occasion, customOccasion, ambiance, additionalDetails, colorPalette, titleStyle]);

  return (
    <div className="p-4 space-y-6 max-h-[85vh] overflow-y-auto custom-scrollbar">
      <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold flex items-center gap-2 text-white">
            <Sparkles className="text-yellow-400 w-5 h-5" /> Menu Affiche Rubens
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
          {/* COLONNE GAUCHE : TEXTES & BASE */}
          <div className="space-y-5">
            <div>
              <label className="block text-gray-400 mb-1.5 font-medium">Titre Principal</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-gray-900 border border-gray-700 p-2.5 rounded-lg text-white outline-none focus:border-purple-500" placeholder="Ex: LA NUIT DES ÉTOILES" />
            </div>
            <div>
              <label className="block text-gray-400 mb-1.5 font-medium">Sous-Titre / Accroche</label>
              <input type="text" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} className="w-full bg-gray-900 border border-gray-700 p-2.5 rounded-lg text-white outline-none focus:border-purple-500" placeholder="Ex: Le chapitre final" />
            </div>
            <div>
              <label className="block text-gray-400 mb-1.5 font-medium">Occasion / Thème</label>
              <select value={occasion} onChange={(e) => setOccasion(e.target.value)} className="w-full bg-gray-900 border border-gray-700 p-2.5 rounded-lg text-white mb-2">
                {menuData.occasions.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
              <input type="text" value={customOccasion} onChange={(e) => setCustomOccasion(e.target.value)} className="w-full bg-gray-900 border border-gray-700 p-2.5 rounded-lg text-white" placeholder="Ou thème personnalisé..." />
            </div>
            <div>
              <label className="block text-gray-400 mb-1.5 font-medium">Sujet (Description précise)</label>
              <textarea value={characterDescription} onChange={(e) => setCharacterDescription(e.target.value)} className="w-full bg-gray-900 border border-gray-700 p-2.5 rounded-lg text-white h-24 resize-none" placeholder="Un chevalier en armure d'or..." />
            </div>
          </div>

          {/* COLONNE DROITE : VISUEL & STYLE */}
          <div className="space-y-5">
            <div>
              <label className="block text-gray-400 mb-1.5 font-medium">Ambiance Visuelle</label>
              <select value={ambiance} onChange={(e) => setAmbiance(e.target.value)} className="w-full bg-gray-900 border border-gray-700 p-2.5 rounded-lg text-white">
                {menuData.ambiances.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-gray-400 mb-1.5 font-medium">Environnement / Lieu</label>
              <select value={environment} onChange={(e) => setEnvironment(e.target.value)} className="w-full bg-gray-900 border border-gray-700 p-2.5 rounded-lg text-white mb-2">
                {menuData.environnements.map(env => <option key={env} value={env}>{env}</option>)}
              </select>
              <input type="text" value={environmentDescription} onChange={(e) => setEnvironmentDescription(e.target.value)} className="w-full bg-gray-900 border border-gray-700 p-2.5 rounded-lg text-white" placeholder="Précisez le lieu..." />
            </div>
            <div>
              <label className="block text-gray-400 mb-1.5 font-medium">Couleurs & Palette</label>
              <select value={colorPalette} onChange={(e) => setColorPalette(e.target.value)} className="w-full bg-gray-900 border border-gray-700 p-2.5 rounded-lg text-white">
                {menuData.palettes.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-gray-400 mb-1.5 font-medium">Style du Titre</label>
              <select value={titleStyle} onChange={(e) => setTitleStyle(e.target.value)} className="w-full bg-gray-900 border border-gray-700 p-2.5 rounded-lg text-white">
                {menuData.titleStyles.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
