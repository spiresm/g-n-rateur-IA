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

// --- RESTAURATION DES DONNÉES DE TON ARCHIVE ---
const randomData = {
  titres: ["La Nuit des Étoiles", "Royaume d'Hiver", "L'Éveil du Dragon", "Les Gardiens de l'Ombre"],
  sous_titres: ["Une aventure épique", "Le chapitre final", "L'histoire commence"],
  
  // Menus affichés à l'utilisateur
  themes: ["Anniversaire", "Mariage", "Baptême", "Fête", "Cinéma", "Jeu Vidéo", "Spectacle", "Noël", "Halloween"],
  ambiances: ["Épique", "Mystérieux", "Sombre", "Lumineux", "Coloré", "Cinématique", "Vintage", "Néon", "Surréaliste"],
  personnages: ["Homme", "Femme", "Enfant", "Animal", "Robot", "Créature", "Super-héros", "Chevalier"],
  environnements: ["Nature", "Ville", "Espace", "Intérieur", "Fantastique", "Historique", "Océan", "Désert"],
  actions: ["Pose statique", "En mouvement", "Combat", "Contemplation", "Vol", "Magie"],
  palettes: ["Vibrante", "Pastel", "Monochrome", "Chaude", "Froide", "Sépia", "Néon", "Or et Noir"],
  styles_titre: ["Moderne", "Classique", "Manuscrit", "Gras", "Élégant", "Futuriste", "Gothique", "Horreur"],

  // Versions pour le prompt IA (Full)
  themes_full: ["Epic birthday celebration atmosphere", "Elegant wedding ceremony style", "Sacred baptism event", "Festive party vibe", "Cinematic movie poster style", "Video game key art", "Live spectacle performance", "Magical Christmas wonder", "Spooky Halloween fun"],
  ambiances_full: ["epic dramatic cinematic lighting", "dark moody atmospheric shadows", "bright colorful vibrant energy", "soft dreamy ethereal glow", "neon-lit cyberpunk night"],
  // ... (les autres versions _full suivent la même logique d'index)
};

export function PosterGenerator({ onGenerate, isGenerating, onPromptGenerated, imageDimensions, onGetGenerateFunction }: PosterGeneratorProps) {
  // ÉTATS (Conservés du fichier réparé)
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
  const [colorPalette, setColorPalette] = useState('Choisir...');
  const [customPalette, setCustomPalette] = useState('');
  const [titleStyle, setTitleStyle] = useState('Choisir...');

  // MÉCANIQUE ALÉATOIRE
  const generateRandomPoster = () => {
    setTitle(randomData.titres[Math.floor(Math.random() * randomData.titres.length)]);
    setSubtitle(randomData.sous_titres[Math.floor(Math.random() * randomData.sous_titres.length)]);
    setCustomOccasion(randomData.themes_full[Math.floor(Math.random() * randomData.themes_full.length)]);
    setCustomAmbiance(randomData.ambiances_full[Math.floor(Math.random() * randomData.ambiances_full.length)]);
  };

  // MÉCANIQUE DE GÉNÉRATION DU PROMPT
  const handleStartGeneration = () => {
    const visualElements = [
      occasion !== 'Choisir...' ? occasion : customOccasion,
      ambiance !== 'Choisir...' ? ambiance : customAmbiance,
      characterDescription || mainCharacter,
      environmentDescription || environment
    ].filter(Boolean).join(", ");

    const prompt = `Ultra detailed cinematic poster. Title: "${title}". Subject: ${visualElements}. Style: ${titleStyle}. 8k resolution.`;
    
    onGenerate({ title, subtitle, tagline, occasion, ambiance, titleStyle }, {
      prompt,
      width: imageDimensions?.width || 1024,
      height: imageDimensions?.height || 1792,
      steps: 9,
      cfg: 1,
      seed: Math.floor(Math.random() * 1000000)
    });
  };

  // LIAISON BOUTON JAUNE (LA RÉPARATION CRUCIALE)
  useEffect(() => {
    if (onGetGenerateFunction) {
      onGetGenerateFunction(handleStartGeneration);
    }
  }, [title, subtitle, occasion, customOccasion, ambiance, characterDescription, titleStyle]);

  return (
    <div className="p-4 space-y-6 max-h-[85vh] overflow-y-auto custom-scrollbar">
      {/* BOUTON ALÉATOIRE DE L'ARCHIVE */}
      <button onClick={generateRandomPoster} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg">
        <Sparkles size={18} /> Générer une affiche aléatoire
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* COLONNE GAUCHE */}
        <div className="space-y-4">
          <input type="text" placeholder="TITRE" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-gray-900 border border-gray-700 p-2.5 rounded-lg text-white" />
          
          <label className="block text-gray-400 text-xs font-bold uppercase">Occasion</label>
          <select value={occasion} onChange={e => setOccasion(e.target.value)} className="w-full bg-gray-900 border border-gray-700 p-2.5 rounded-lg text-white">
            <option>Choisir...</option>
            {randomData.themes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <input type="text" placeholder="Ou thème perso..." value={customOccasion} onChange={e => setCustomOccasion(e.target.value)} className="w-full bg-gray-900 border border-gray-700 p-2.5 rounded-lg text-white" />
        </div>

        {/* COLONNE DROITE */}
        <div className="space-y-4">
          <label className="block text-gray-400 text-xs font-bold uppercase">Ambiance Visuelle</label>
          <select value={ambiance} onChange={e => setAmbiance(e.target.value)} className="w-full bg-gray-900 border border-gray-700 p-2.5 rounded-lg text-white">
            <option>Choisir...</option>
            {randomData.ambiances.map(a => <option key={a} value={a}>{a}</option>)}
          </select>

          <label className="block text-gray-400 text-xs font-bold uppercase">Style du Titre</label>
          <select value={titleStyle} onChange={e => setTitleStyle(e.target.value)} className="w-full bg-gray-900 border border-gray-700 p-2.5 rounded-lg text-white">
            <option>Choisir...</option>
            {randomData.styles_titre.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}
