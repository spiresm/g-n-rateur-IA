import { useState, useEffect } from 'react';
import { Wand2, Sparkles, Image as ImageIcon } from 'lucide-react';
import { PosterParams, GenerationParams } from '../App';

interface PosterGeneratorProps {
  onGenerate: (posterParams: PosterParams, genParams: GenerationParams) => void;
  isGenerating: boolean;
  onPromptGenerated: (prompt: string) => void;
  generatedPrompt: string;
  onGetGenerateFunction?: (fn: () => void) => void;
}

// Données aléatoires pour génération d'affiches
const randomData = {
  titres: [
    "La Grande Aventure",
    "L'Épopée Fantastique",
    "Destination Magique",
    "Le Royaume Perdu",
    "La Nuit des Merveilles",
    "Rêve Éternel",
    "Horizons",
    "Aube Nouvelle",
    "Echo Stellaire",
    "Le Secret des Lumières"
  ],
  sous_titres: [
    "Édition spéciale",
    "Chapitre I",
    "Le voyage commence",
    "Inspiré d'un univers imaginaire",
    "Une création originale",
    "Version remasterisée",
    "Légende moderne",
    "Histoire visuelle",
    "Un monde à découvrir",
    "Aventure cinématographique"
  ],
  themes: [
    "Anniversaire",
    "Noël",
    "Halloween",
    "Saint Nicolas",
    "Nouvel An",
    "Fête foraine",
    "Univers fantastique",
    "Exploration spatiale",
    "Magie hivernale",
    "Carnaval lumineux"
  ],
  ambiances: [
    "festive et colorée",
    "magique et lumineuse",
    "mystérieuse et douce",
    "énergique et joyeuse",
    "sombre mais élégante",
    "cinématique dramatique",
    "enchanted dream atmosphere",
    "vintage années 80",
    "futuriste néon",
    "cosy et chaleureuse"
  ],
  personnages: [
    "un enfant joyeux",
    "un père Noël souriant",
    "une silhouette héroïque",
    "une créature mignonne",
    "un robot stylisé",
    "une sorcière amusante",
    "un chat anthropomorphisé",
    "un petit monstre rigolo",
    "une mascotte cartoon",
    "un explorateur courageux"
  ],
  environnements: [
    "un décor enneigé",
    "une forêt enchantée",
    "une scène nocturne lumineuse",
    "une ville futuriste",
    "un château mystérieux",
    "une fête colorée",
    "un paysage spatial",
    "une plage tropicale stylisée",
    "une salle décorée",
    "un univers miniature"
  ],
  actions: [
    "sourit devant la caméra",
    "marche vers l'avant",
    "observe au loin",
    "flotte dans les airs",
    "tient un objet lumineux",
    "lance des confettis",
    "ouvre un coffre magique",
    "joue avec la lumière",
    "court joyeusement",
    "fait un geste théâtral"
  ],
  palettes: [
    "couleurs chaudes (rouge, orange, jaune)",
    "couleurs froides (bleu, turquoise, violet)",
    "pastels doux",
    "dégradé bleu → violet",
    "dégradé rose → bleu",
    "dégradé or → noir",
    "dégradé rouge → orange",
    "ambiance néon rose et cyan",
    "tons dorés cinématiques",
    "contraste fort noir et or"
  ],
  styles_titre: [
    "blockbuster dramatique",
    "cartoon arrondi",
    "vintage rétro",
    "style manuscrit élégant",
    "chromé métallique",
    "minimaliste moderne",
    "néon futuriste",
    "style gravure",
    "typographie épaisse cinéma",
    "logo stylisé"
  ],
  details: [
    "particules lumineuses",
    "lueurs magiques",
    "flocons subtils",
    "confettis flottants",
    "effets de lumière douce",
    "reflets cinématiques",
    "nuages stylisés",
    "poussière atmosphérique",
    "halo lumineux",
    "effets scintillants"
  ]
};

export function PosterGenerator({ onGenerate, isGenerating, onPromptGenerated, generatedPrompt, onGetGenerateFunction }: PosterGeneratorProps) {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [occasion, setOccasion] = useState('');
  const [customOccasion, setCustomOccasion] = useState('');
  const [ambiance, setAmbiance] = useState('');
  const [customAmbiance, setCustomAmbiance] = useState('');
  const [mainCharacter, setMainCharacter] = useState('');
  const [characterDescription, setCharacterDescription] = useState('');
  const [environment, setEnvironment] = useState('');
  const [environmentDescription, setEnvironmentDescription] = useState('');
  const [characterAction, setCharacterAction] = useState('');
  const [actionDescription, setActionDescription] = useState('');
  const [additionalDetails, setAdditionalDetails] = useState('');
  const [colorPalette, setColorPalette] = useState('');
  const [customPalette, setCustomPalette] = useState('');
  const [titleStyle, setTitleStyle] = useState('sanglant dégouttant');

  // Fonction utilitaire pour choisir un élément aléatoire
  const randomChoice = <T,>(arr: T[]): T => {
    return arr[Math.floor(Math.random() * arr.length)];
  };

  // Générer une affiche aléatoire
  const generateRandomPoster = () => {
    const randomTitle = randomChoice(randomData.titres);
    const randomSubtitle = randomChoice(randomData.sous_titres);
    const randomTheme = randomChoice(randomData.themes);
    const randomAmbiance = randomChoice(randomData.ambiances);
    const randomPersonnage = randomChoice(randomData.personnages);
    const randomEnvironnement = randomChoice(randomData.environnements);
    const randomAction = randomChoice(randomData.actions);
    const randomPalette = randomChoice(randomData.palettes);
    const randomTitleStyle = randomChoice(randomData.styles_titre);
    const randomDetails = randomChoice(randomData.details);

    // Mettre à jour tous les états
    setTitle(randomTitle);
    setSubtitle(randomSubtitle);
    setTagline(''); // Pas de tagline prédéfini
    setOccasion('');
    setCustomOccasion(randomTheme);
    setAmbiance('');
    setCustomAmbiance(randomAmbiance);
    setMainCharacter('');
    setCharacterDescription(randomPersonnage);
    setEnvironment('');
    setEnvironmentDescription(randomEnvironnement);
    setCharacterAction('');
    setActionDescription(randomAction);
    setAdditionalDetails(randomDetails);
    setColorPalette('');
    setCustomPalette(randomPalette);
    setTitleStyle(randomTitleStyle);

    // Générer automatiquement le prompt après avoir rempli les champs
    setTimeout(() => {
      handleGeneratePrompt();
    }, 100);
  };

  const occasions = [
    'Choisir...', 'Halloween', 'Noël', 'Science-Fiction', 'Fantasy', 
    'Horreur', 'Aventure', 'Romance', 'Thriller', 'Action'
  ];

  const ambiances = [
    'Choisir...', 'Sombre et inquiétante', 'Joyeuse et festive', 
    'Mystérieuse', 'Épique', 'Romantique', 'Intense', 'Calme'
  ];

  const characters = [
    'Choisir...', 'Héros solitaire', 'Groupe d\'aventuriers', 
    'Créature mystique', 'Détective', 'Guerrier', 'Magicien', 'Robot'
  ];

  const environments = [
    'Choisir...', 'Forêt sombre', 'Ville futuriste', 'Château hanté',
    'Désert aride', 'Océan profond', 'Montagne enneigée', 'Ruines antiques'
  ];

  const actions = [
    'Choisir...', 'Combat épique', 'Exploration', 'Fuite',
    'Méditation', 'Découverte', 'Confrontation', 'Transformation'
  ];

  const palettes = [
    'Choisir...', 'Rouge et noir', 'Bleu et or', 'Vert et brun',
    'Violet et argent', 'Orange et noir', 'Monochrome', 'Arc-en-ciel'
  ];

  const titleStyles = [
    'sanglant dégouttant', 'élégant', 'graffiti', 'néon',
    'classique', 'futuriste', 'manuscrit', 'relief 3D'
  ];

  const generatePrompt = () => {
    const parts = [];
    
    if (title) parts.push(`Movie poster titled "${title}"`);
    if (subtitle) parts.push(`subtitle: "${subtitle}"`);
    if (tagline) parts.push(`tagline: "${tagline}"`);
    
    const selectedOccasion = occasion === 'Choisir...' ? '' : occasion;
    const finalOccasion = selectedOccasion || customOccasion;
    if (finalOccasion) parts.push(`theme: ${finalOccasion}`);
    
    const selectedAmbiance = ambiance === 'Choisir...' ? '' : ambiance;
    const finalAmbiance = selectedAmbiance || customAmbiance;
    if (finalAmbiance) parts.push(`atmosphere: ${finalAmbiance}`);
    
    if (mainCharacter && mainCharacter !== 'Choisir...') {
      parts.push(`featuring ${mainCharacter.toLowerCase()}`);
      if (characterDescription) parts.push(characterDescription);
    }
    
    if (environment && environment !== 'Choisir...') {
      parts.push(`in ${environment.toLowerCase()}`);
      if (environmentDescription) parts.push(environmentDescription);
    }
    
    if (characterAction && characterAction !== 'Choisir...') {
      parts.push(`${characterAction.toLowerCase()}`);
      if (actionDescription) parts.push(actionDescription);
    }
    
    const selectedPalette = colorPalette === 'Choisir...' ? '' : colorPalette;
    const finalPalette = selectedPalette || customPalette;
    if (finalPalette) parts.push(`color palette: ${finalPalette}`);
    
    if (titleStyle) parts.push(`title style: ${titleStyle}`);
    
    if (additionalDetails) parts.push(additionalDetails);
    
    parts.push('cinematic, professional movie poster design, high quality');
    
    const prompt = parts.join(', ');
    onPromptGenerated(prompt);
    
    return prompt;
  };

  const handleGeneratePrompt = () => {
    generatePrompt();
  };

  const handleStartGeneration = () => {
    const prompt = generatedPrompt || generatePrompt();
    
    const posterParams: PosterParams = {
      title,
      subtitle,
      tagline,
      occasion: occasion === 'Choisir...' ? customOccasion : occasion,
      ambiance: ambiance === 'Choisir...' ? customAmbiance : ambiance,
      mainCharacter,
      characterDescription,
      environment,
      environmentDescription,
      characterAction,
      actionDescription,
      additionalDetails,
      colorPalette: colorPalette === 'Choisir...' ? customPalette : colorPalette,
      titleStyle,
    };

    const genParams: GenerationParams = {
      prompt,
      negativePrompt: 'low quality, blurry, distorted text, bad anatomy',
      steps: 9, // Optimisé pour Z-Image Turbo
      cfg: 1, // Optimisé pour Z-Image Turbo
      seed: Math.floor(Math.random() * 1000000), // Seed aléatoire
      sampler: 'res_multistep', // Optimisé pour Z-Image Turbo
      scheduler: 'simple', // Optimisé pour Z-Image Turbo
      denoise: 1.0,
      width: 1024,
      height: 1792, // Format poster (9:16)
    };

    onGenerate(posterParams, genParams);
  };

  // Exposer la fonction de génération au parent via callback
  useEffect(() => {
    if (onGetGenerateFunction) {
      onGetGenerateFunction(handleStartGeneration);
    }
  }, [title, subtitle, tagline, occasion, customOccasion, ambiance, customAmbiance, 
      mainCharacter, characterDescription, environment, environmentDescription,
      characterAction, actionDescription, additionalDetails, colorPalette, 
      customPalette, titleStyle, generatedPrompt]);

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <ImageIcon className="w-5 h-5 text-purple-400" />
        <h2 className="text-white">Générateur d'Affiches Ludiques</h2>
      </div>

      <div className="bg-purple-900/20 border border-purple-700 rounded-lg p-4 mb-6">
        <button
          onClick={generateRandomPoster}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          disabled={isGenerating}
        >
          <Sparkles className="w-4 h-4" />
          <span className="text-sm">🎲 Générer une affiche aléatoire</span>
        </button>
      </div>

      <form className="space-y-5">
        {/* Titre de l'affiche */}
        <div>
          <label className="block text-sm text-gray-300 mb-2">
            Titre de l'affiche (optionnel)
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: LA GRANDE AVENTURE"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            disabled={isGenerating}
          />
        </div>

        {/* Sous-titre */}
        <div>
          <label className="block text-sm text-gray-300 mb-2">
            Sous-titre (optionnel)
          </label>
          <input
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="Ex: Nuit magique, édition spéciale"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            disabled={isGenerating}
          />
        </div>

        {/* Accroche */}
        <div>
          <label className="block text-sm text-gray-300 mb-2">
            Accroche (texte en bas de l'affiche - optionnel)
          </label>
          <input
            type="text"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            placeholder="Ex: Une aventure inoubliable..."
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            disabled={isGenerating}
          />
        </div>

        {/* Occasion/Thème */}
        <div>
          <label className="block text-sm text-gray-300 mb-2">
            Occasion / Thème
          </label>
          <div className="grid grid-cols-2 gap-2">
            <select
              value={occasion}
              onChange={(e) => setOccasion(e.target.value)}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={isGenerating}
            >
              {occasions.map(o => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
            <input
              type="text"
              value={customOccasion}
              onChange={(e) => setCustomOccasion(e.target.value)}
              placeholder="Ou écrivez votre propre thème..."
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              disabled={isGenerating}
            />
          </div>
        </div>

        {/* Ambiance Générale */}
        <div>
          <label className="block text-sm text-gray-300 mb-2">
            Ambiance Générale
          </label>
          <div className="grid grid-cols-2 gap-2">
            <select
              value={ambiance}
              onChange={(e) => setAmbiance(e.target.value)}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={isGenerating}
            >
              {ambiances.map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
            <input
              type="text"
              value={customAmbiance}
              onChange={(e) => setCustomAmbiance(e.target.value)}
              placeholder="Ou écrivez une ambiance personnalisée..."
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              disabled={isGenerating}
            />
          </div>
        </div>

        {/* Personnage Principal */}
        <div>
          <label className="block text-sm text-gray-300 mb-2">
            Personnage Principal
          </label>
          <select
            value={mainCharacter}
            onChange={(e) => setMainCharacter(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-2"
            disabled={isGenerating}
          >
            {characters.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <input
            type="text"
            value={characterDescription}
            onChange={(e) => setCharacterDescription(e.target.value)}
            placeholder="Description personnelle (optionnel)"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
            disabled={isGenerating}
          />
        </div>

        {/* Environnement */}
        <div>
          <label className="block text-sm text-gray-300 mb-2">
            Environnement
          </label>
          <select
            value={environment}
            onChange={(e) => setEnvironment(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-2"
            disabled={isGenerating}
          >
            {environments.map(e => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
          <input
            type="text"
            value={environmentDescription}
            onChange={(e) => setEnvironmentDescription(e.target.value)}
            placeholder="Description personnelle (optionnel)"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
            disabled={isGenerating}
          />
        </div>

        {/* Action du Personnage */}
        <div>
          <label className="block text-sm text-gray-300 mb-2">
            Action du Personnage
          </label>
          <select
            value={characterAction}
            onChange={(e) => setCharacterAction(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-2"
            disabled={isGenerating}
          >
            {actions.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
          <input
            type="text"
            value={actionDescription}
            onChange={(e) => setActionDescription(e.target.value)}
            placeholder="Description personnelle (optionnel)"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
            disabled={isGenerating}
          />
        </div>

        {/* Détails Supplémentaires */}
        <div>
          <label className="block text-sm text-gray-300 mb-2">
            Détails Supplémentaires
          </label>
          <textarea
            value={additionalDetails}
            onChange={(e) => setAdditionalDetails(e.target.value)}
            placeholder="Ex: Feux d'artifice, neige légère, ballons colorés..."
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            rows={3}
            disabled={isGenerating}
          />
        </div>

        {/* Palette de Couleurs */}
        <div>
          <label className="block text-sm text-gray-300 mb-2">
            Palette de Couleurs
          </label>
          <div className="grid grid-cols-2 gap-2">
            <select
              value={colorPalette}
              onChange={(e) => setColorPalette(e.target.value)}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={isGenerating}
            >
              {palettes.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <input
              type="text"
              value={customPalette}
              onChange={(e) => setCustomPalette(e.target.value)}
              placeholder="Ou définissez votre propre palette..."
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              disabled={isGenerating}
            />
          </div>
        </div>

        {/* Style du Titre */}
        <div>
          <label className="block text-sm text-gray-300 mb-2">
            Style du Titre
          </label>
          <select
            value={titleStyle}
            onChange={(e) => setTitleStyle(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            disabled={isGenerating}
          >
            {titleStyles.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-4">
          {/* Affichage du prompt généré */}
          {generatedPrompt && (
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <h3 className="text-gray-300 mb-2 text-sm">Prompt Généré (Prévisualisation)</h3>
              <p className="text-white text-sm leading-relaxed">{generatedPrompt}</p>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
