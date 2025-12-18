import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { PosterParams, GenerationParams } from '../App';

const randomData = {
  titres: ["La Nuit des Étoiles", "Royaume d'Hiver", "L'Éveil du Dragon", "Mystic Quest"],
  themes: ["Anniversaire", "Mariage", "Fête", "Cinéma", "Jeu Vidéo", "Spectacle", "Noël", "Halloween"],
  ambiances: ["Épique", "Mystérieux", "Sombre", "Lumineux", "Coloré", "Cinématique", "Vintage", "Néon"],
  personnages: ["Homme", "Femme", "Enfant", "Animal", "Robot", "Créature", "Chevalier"],
  environnements: ["Nature", "Ville", "Espace", "Intérieur", "Fantastique", "Océan"],
  styles_titre: ["Moderne", "Classique", "Manuscrit", "Gras", "Futuriste", "Gothique"]
};

export function PosterGenerator({ onGenerate, isGenerating, onPromptGenerated, imageDimensions, onGetGenerateFunction }: any) {
  const [title, setTitle] = useState('');
  const [occasion, setOccasion] = useState('Choisir...');
  const [ambiance, setAmbiance] = useState('Choisir...');
  const [characterDesc, setCharacterDesc] = useState('');
  const [titleStyle, setTitleStyle] = useState('Choisir...');

  const generateRandom = () => {
    setTitle(randomData.titres[Math.floor(Math.random() * randomData.titres.length)]);
    setOccasion(randomData.themes[Math.floor(Math.random() * randomData.themes.length)]);
    setAmbiance(randomData.ambiances[Math.floor(Math.random() * randomData.ambiances.length)]);
  };

  // La fonction que le bouton jaune appellera
  const handleStart = () => {
    onGenerate({ title, occasion, ambiance }, {
      prompt: `Cinematic poster: ${title}. ${characterDesc}. ${ambiance} style.`,
      width: imageDimensions?.width || 1024,
      height: imageDimensions?.height || 1792,
      steps: 9, cfg: 1
    });
  };

  // ✅ CRUCIAL : On envoie la fonction à AppContent
  useEffect(() => {
    if (onGetGenerateFunction) onGetGenerateFunction(handleStart);
  }, [title, occasion, ambiance, characterDesc, titleStyle, imageDimensions]);

  return (
    <div className="p-4 space-y-6 max-h-[80vh] overflow-y-auto">
      <button onClick={generateRandom} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 py-3 rounded-xl text-white font-bold flex items-center justify-center gap-2">
        <Sparkles size={18} /> Générer une affiche aléatoire
      </button>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-4">
          <label className="text-gray-400 text-xs font-bold uppercase">Titre</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-gray-900 border border-gray-700 p-2 rounded text-white" />
          
          <label className="text-gray-400 text-xs font-bold uppercase">Occasion</label>
          <select value={occasion} onChange={e => setOccasion(e.target.value)} className="w-full bg-gray-900 border border-gray-700 p-2 rounded text-white">
            <option>Choisir...</option>
            {randomData.themes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="space-y-4">
          <label className="text-gray-400 text-xs font-bold uppercase">Description Sujet</label>
          <textarea value={characterDesc} onChange={e => setCharacterDesc(e.target.value)} className="w-full bg-gray-900 border border-gray-700 p-2 rounded text-white h-24" />
        </div>
      </div>
    </div>
  );
}
