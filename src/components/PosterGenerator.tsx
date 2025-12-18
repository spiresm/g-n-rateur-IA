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

const menuData = {
  occasions: ["Anniversaire", "Mariage", "Fête", "Cinéma", "Jeu Vidéo", "Spectacle"],
  ambiances: ["Épique", "Mystérieux", "Sombre", "Lumineux", "Coloré", "Cinématique"],
  personnages: ["Homme", "Femme", "Enfant", "Animal", "Robot", "Créature"],
  environnements: ["Nature", "Ville", "Espace", "Intérieur", "Fantastique"],
  actions: ["Pose statique", "En mouvement", "Combat", "Vol", "Magie"],
  palettes: ["Vibrante", "Pastel", "Monochrome", "Chaude", "Froide", "Néon"],
  styles_titre: ["Moderne", "Classique", "Manuscrit", "Gras", "Futuriste", "Gothique"]
};

export function PosterGenerator({ onGenerate, isGenerating, onPromptGenerated, imageDimensions, onGetGenerateFunction }: PosterGeneratorProps) {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [occasion, setOccasion] = useState('Choisir...');
  const [customOccasion, setCustomOccasion] = useState('');
  const [ambiance, setAmbiance] = useState('Choisir...');
  const [characterDescription, setCharacterDescription] = useState('');
  const [environmentDescription, setEnvironmentDescription] = useState('');
  const [colorPalette, setColorPalette] = useState('Choisir...');
  const [titleStyle, setTitleStyle] = useState('Choisir...');

  const generateRandomPoster = () => {
    setTitle(["La Nuit des Étoiles", "Royaume d'Hiver", "L'Éveil du Dragon"][Math.floor(Math.random() * 3)]);
    setSubtitle(["Une aventure épique", "Le chapitre final"][Math.floor(Math.random() * 2)]);
    setAmbiance(menuData.ambiances[Math.floor(Math.random() * menuData.ambiances.length)]);
    setCustomOccasion(menuData.occasions[Math.floor(Math.random() * menuData.occasions.length)]);
  };

  const handleStartGeneration = () => {
    onGenerate({ title, subtitle, tagline, occasion, customOccasion, ambiance, colorPalette, titleStyle }, {
      prompt: `Ultra detailed cinematic poster: ${title}. ${characterDescription}. ${ambiance} atmosphere.`,
      width: imageDimensions?.width || 1024,
      height: imageDimensions?.height || 1792
    });
  };

  useEffect(() => {
    if (onGetGenerateFunction) onGetGenerateFunction(handleStartGeneration);
  }, [title, subtitle, characterDescription, ambiance]);

  return (
    <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
      <button onClick={generateRandomPoster} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg">
        <Sparkles size={18} /> Générer une affiche aléatoire
      </button>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-4">
          <input type="text" placeholder="Titre" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-gray-800 border border-gray-700 p-2 rounded text-white" />
          <input type="text" placeholder="Sous-titre" value={subtitle} onChange={e => setSubtitle(e.target.value)} className="w-full bg-gray-800 border border-gray-700 p-2 rounded text-white" />
          <select value={ambiance} onChange={e => setAmbiance(e.target.value)} className="w-full bg-gray-800 border border-gray-700 p-2 rounded text-white">
            <option>Ambiance...</option>
            {menuData.ambiances.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <div className="space-y-4">
          <textarea placeholder="Description sujet" value={characterDescription} onChange={e => setCharacterDescription(e.target.value)} className="w-full bg-gray-800 border border-gray-700 p-2 rounded text-white h-24" />
          <select value={colorPalette} onChange={e => setColorPalette(e.target.value)} className="w-full bg-gray-800 border border-gray-700 p-2 rounded text-white">
            <option>Palette...</option>
            {menuData.palettes.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}
