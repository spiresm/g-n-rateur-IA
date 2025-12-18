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

// --- VOS DONNÉES COMPLÈTES (ARCHIVE) ---
const randomData = {
  titres: ["La Nuit des Étoiles", "Royaume d'Hiver", "L'Éveil du Dragon", "Chasseurs de Légendes", "Le Grand Mystère", "Voyage Intemporel", "L'Aube des Héros", "Les Gardiens de l'Ombre"],
  sous_titres: ["Une aventure épique", "Le chapitre final", "L'histoire commence", "Édition collector", "La légende continue"],
  taglines: ["L'aventure ne fait que commencer", "Rien ne sera plus jamais pareil", "Le destin frappe à votre porte"],
  themes: ["Epic fantasy adventure", "Sci-fi space opera", "Dark horror atmosphere", "Romantic fairy tale", "Action-packed thriller", "Cyberpunk neon future"],
  ambiances: ["Epic cinematic", "Dark moody", "Bright vibrant", "Soft dreamy", "Neon cyberpunk", "Magical enchanted"],
  personnages: ["Heroic warrior", "Hooded figure", "Young adventurer", "Powerful sorceress", "Space explorer", "Cybernetic android"],
  environnements: ["Castle ruins", "Alien planet", "Abandoned city", "Enchanted forest", "Space station", "Cyberpunk alley"],
  actions: ["Heroic stance", "Running motion", "Looking back", "Casting spell", "Combat stance"],
  palettes: ["Warm sunset", "Cool blue", "Purple pink", "Golden black", "Neon electric", "Icy white"],
  styles_titre: ["Dripping horror", "Neon tubes", "Frosted glass", "Carved wood", "Engraved steel", "Holographic digital", "Gothic metal"]
};

export function PosterGenerator({ onGenerate, isGenerating, onPromptGenerated, imageDimensions, onGetGenerateFunction }: PosterGeneratorProps) {
  // ÉTATS DE TOUS VOS CHAMPS
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

  // FONCTION ALÉATOIRE COMPLÈTE
  const generateRandomPoster = () => {
    setTitle(randomData.titres[Math.floor(Math.random() * randomData.titres.length)]);
    setSubtitle(randomData.sous_titres[Math.floor(Math.random() * randomData.sous_titres.length)]);
    setTagline(randomData.taglines[Math.floor(Math.random() * randomData.taglines.length)]);
    setCustomOccasion(randomData.themes[Math.floor(Math.random() * randomData.themes.length)]);
    setCustomAmbiance(randomData.ambiances[Math.floor(Math.random() * randomData.ambiances.length)]);
    setCharacterDescription(randomData.personnages[Math.floor(Math.random() * randomData.personnages.length)]);
    setEnvironmentDescription(randomData.environnements[Math.floor(Math.random() * randomData.environnements.length)]);
    setActionDescription(randomData.actions[Math.floor(Math.random() * randomData.actions.length)]);
    setCustomPalette(randomData.palettes[Math.floor(Math.random() * randomData.palettes.length)]);
    setTitleStyle(randomData.styles_titre[Math.floor(Math.random() * randomData.styles_titre.length)]);
  };

  const handleStartGeneration = () => {
    const prompt = `Ultra detailed cinematic poster. Subject: ${characterDescription || mainCharacter}. Action: ${actionDescription || characterAction}. Atmosphere: ${customAmbiance || ambiance}. Palette: ${customPalette || colorPalette}. Style: ${titleStyle}.`;
    onGenerate({ title, subtitle, tagline, occasion, customOccasion, ambiance, customAmbiance, mainCharacter, characterDescription, environment, environmentDescription, characterAction, actionDescription, additionalDetails, colorPalette, customPalette, titleStyle }, {
      prompt,
      width: imageDimensions?.width || 1024,
      height: imageDimensions?.height || 1792
    });
  };

  useEffect(() => {
    if (onGetGenerateFunction) onGetGenerateFunction(handleStartGeneration);
  }, [title, subtitle, characterDescription, environmentDescription, ambiance, colorPalette, titleStyle]);

  return (
    <div className="p-4 space-y-6 max-h-[85vh] overflow-y-auto custom-scrollbar">
      {/* BOUTON ALÉATOIRE */}
      <div className="bg-purple-900/20 border border-purple-700 rounded-xl p-4">
        <button onClick={generateRandomPoster} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg">
          <Sparkles className="w-5 h-5" />
          <span className="font-bold">Générer une affiche aléatoire</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* COLONNE GAUCHE */}
        <div className="space-y-4">
          <h3 className="text-purple-400 font-bold text-xs uppercase tracking-widest">Textes & Titres</h3>
          <input type="text" placeholder="Titre" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-gray-900 border border-gray-700 p-2.5 rounded-lg text-white" />
          <input type="text" placeholder="Sous-titre" value={subtitle} onChange={e => setSubtitle(e.target.value)} className="w-full bg-gray-900 border border-gray-700 p-2.5 rounded-lg text-white" />
          <input type="text" placeholder="Accroche" value={tagline} onChange={e => setTagline(e.target.value)} className="w-full bg-gray-900 border border-gray-700 p-2.5 rounded-lg text-white" />
          
          <h3 className="text-purple-400 font-bold text-xs uppercase tracking-widest pt-2">Sujet & Action</h3>
          <select value={mainCharacter} onChange={e => setMainCharacter(e.target.value)} className="w-full bg-gray-900 border border-gray-700 p-2.5 rounded-lg text-white">
            <option>Choisir Personnage...</option>
            {randomData.personnages.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <textarea placeholder="Description du personnage..." value={characterDescription} onChange={e => setCharacterDescription(e.target.value)} className="w-full bg-gray-900 border border-gray-700 p-2.5 rounded-lg text-white h-20 resize-none" />
        </div>

        {/* COLONNE DROITE */}
        <div className="space-y-4">
          <h3 className="text-purple-400 font-bold text-xs uppercase tracking-widest">Ambiance & Style</h3>
          <select value={ambiance} onChange={e => setAmbiance(e.target.value)} className="w-full bg-gray-900 border border-gray-700 p-2.5 rounded-lg text-white">
            <option>Choisir Ambiance...</option>
            {randomData.ambiances.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <input type="text" placeholder="Ou ambiance perso..." value={customAmbiance} onChange={e => setCustomAmbiance(e.target.value)} className="w-full bg-gray-900 border border-gray-700 p-2.5 rounded-lg text-white" />
          
          <select value={titleStyle} onChange={e => setTitleStyle(e.target.value)} className="w-full bg-gray-900 border border-gray-700 p-2.5 rounded-lg text-white">
            <option>Style du titre...</option>
            {randomData.styles_titre.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <h3 className="text-purple-400 font-bold text-xs uppercase tracking-widest pt-2">Environnement</h3>
          <textarea placeholder="Détails du lieu..." value={environmentDescription} onChange={e => setEnvironmentDescription(e.target.value)} className="w-full bg-gray-900 border border-gray-700 p-2.5 rounded-lg text-white h-20 resize-none" />
          
          <select value={colorPalette} onChange={e => setColorPalette(e.target.value)} className="w-full bg-gray-900 border border-gray-700 p-2.5 rounded-lg text-white">
            <option>Palette de couleurs...</option>
            {randomData.palettes.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}
