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

// Données aléatoires pour génération d'affiches
const randomData = {
  titres: [
    "La Nuit des Étoiles",
    "Royaume d'Hiver",
    "L'Éveil du Dragon",
    "Chasseurs de Légendes",
    "Le Grand Mystère",
    "Voyage Intemporel",
    "L'Aube des Héros",
    "Crépuscule Magique",
    "Dernier Refuge",
    "Échappée Sauvage",
    "Les Gardiens de l'Ombre",
    "Renaissance",
    "Le Pacte des Mondes",
    "Horizon Perdu",
    "L'Enfant de Lumière"
  ],
  sous_titres: [
    "Une aventure épique",
    "Le chapitre final",
    "L'histoire commence",
    "Édition collector",
    "Version remasterisée",
    "Le retour",
    "Nouvelle génération",
    "Saga complète",
    "Origines",
    "La légende continue",
    "Chroniques inédites",
    "Adaptation officielle",
    "Univers étendu",
    "Deuxième partie",
    "Trilogie ultime"
  ],
  taglines: [
    "L'aventure ne fait que commencer",
    "Rien ne sera plus jamais pareil",
    "Le destin frappe à votre porte",
    "Une expérience inoubliable",
    "Préparez-vous à l'impossible",
    "Découvrez l'invisible",
    "Quand la magie rencontre le réel",
    "Chaque seconde compte",
    "Au-delà de l'imagination",
    "Ils sont de retour",
    "La fin n'est que le début",
    "Ensemble, tout devient possible",
    "Un monde à découvrir",
    "Plus grand que nature",
    "Laissez-vous transporter"
  ],
  themes: [
    "Epic fantasy adventure",
    "Sci-fi space opera",
    "Dark horror atmosphere",
    "Romantic fairy tale",
    "Action-packed thriller",
    "Mysterious noir detective",
    "Superhero origin story",
    "Post-apocalyptic survival",
    "Period drama historical",
    "Magical Christmas wonder",
    "Halloween spooky fun",
    "Summer blockbuster",
    "Cyberpunk neon future",
    "Western frontier",
    "Underwater exploration"
  ],
  ambiances: [
    "epic dramatic cinematic lighting",
    "dark moody atmospheric shadows",
    "bright colorful vibrant energy",
    "soft dreamy ethereal glow",
    "intense action-packed dynamic",
    "mysterious foggy suspenseful",
    "warm golden nostalgic",
    "cold blue winter frost",
    "neon-lit cyberpunk night",
    "magical sparkles enchanted",
    "gritty realistic texture",
    "whimsical playful cartoon",
    "elegant sophisticated luxury",
    "raw rustic natural",
    "futuristic sleek metallic"
  ],
  personnages: [
    "heroic warrior in armor",
    "mysterious hooded figure",
    "young adventurer with backpack",
    "powerful sorceress casting spell",
    "rugged space explorer",
    "elegant princess in gown",
    "battle-worn soldier",
    "curious child protagonist",
    "wise old mentor",
    "fierce female fighter",
    "charming rogue thief",
    "noble knight on horseback",
    "cybernetic android",
    "mystical creature guardian",
    "determined survivor"
  ],
  environnements: [
    "ancient castle ruins at sunset",
    "vast alien planet landscape",
    "dark abandoned city streets",
    "enchanted forest with glowing trees",
    "futuristic space station interior",
    "snowy mountain peak",
    "tropical island paradise",
    "underground cavern with crystals",
    "medieval village marketplace",
    "neon-lit cyberpunk alley",
    "desert wasteland with ruins",
    "underwater city ruins",
    "floating sky islands",
    "volcanic eruption background",
    "mystical temple entrance"
  ],
  actions: [
    "standing heroically with weapon raised",
    "running towards camera in slow motion",
    "looking back over shoulder dramatically",
    "reaching out hand towards viewer",
    "leaping through the air",
    "facing off against unseen enemy",
    "casting magical spell with glowing hands",
    "riding vehicle at high speed",
    "climbing dangerous cliff",
    "embracing in romantic pose",
    "wielding dual weapons in combat stance",
    "discovering ancient artifact",
    "protecting someone behind them",
    "emerging from explosion",
    "silhouetted against dramatic sky"
  ],
  palettes: [
    "warm orange and red sunset tones",
    "cool blue and teal night palette",
    "vibrant purple and pink gradient",
    "golden yellow and deep black contrast",
    "emerald green and silver highlights",
    "blood red and dark grey shadows",
    "pastel rainbow soft colors",
    "monochromatic blue scale",
    "bronze and copper metallic",
    "neon cyan and magenta electric",
    "earth tones brown and beige",
    "icy white and pale blue",
    "royal purple and gold luxury",
    "crimson red and pitch black",
    "seafoam green and coral pink"
  ],
  styles_titre: [
    "dripping horror lettering, torn edges, glossy red liquid texture, glowing sinister vibe",
    "bright neon tube letters, electric glow, slight chromatic aberration, futuristic vaporwave look",
    "frosted glass letters, icy texture, translucent frozen edges, cold blue inner glow",
    "hand-carved wooden lettering, deep grooves, warm grain texture, rustic fantasy aesthetic",
    "polished engraved steel letters, sharp reflections, industrial sci-fi shine",
    "rounded bubbly cartoon letters, colorful shading, outlined comic look",
    "sharp jagged letters, blood splatter texture, rough grain, violent horror tone",
    "faceted gemstone letters, prism reflections, diamond-like clarity, luminous highlights",
    "weathered carved stone letters, cracks, moss details, archaeological fantasy mood",
    "burning fire lettering, glowing embers, smoke trails, intense heat distortion",
    "transparent water-textured letters, droplets, soft reflections, fluid organic movement",
    "polished gold lettering, embossed texture, warm specular highlights, luxury vibe",
    "spray-painted lettering, rough outlines, dripping paint, street-art graffiti style",
    "holographic translucent letters, digital flicker, refraction effects, sci-fi projection",
    "blackletter-inspired carved metal, dark engraved texture, dramatic gothic atmosphere",
    "hand-molded clay letters, fingerprint texture, soft studio lighting, claymation charm",
    "layered paper-cut letters, soft shadows, handcrafted collage feel",
    "letters filled with nebula textures, stars, glowing cosmic colors, ethereal space vibe",
    "aged brass letters, rivets, gears, Victorian industrial steampunk detailing",
    "distorted corrupted letters, RGB glitch separation, pixel noise, digital malfunction look"
  ],
  details: [
    "volumetric light rays",
    "floating dust particles",
    "magical sparkles and glitter",
    "falling snow or rain",
    "swirling mist and fog",
    "lens flares and light leaks",
    "fire embers rising",
    "glowing runes or symbols",
    "scattered paper or leaves",
    "atmospheric smoke",
    "trailing light streaks",
    "shimmering heat distortion",
    "crystalline reflections",
    "ethereal ghostly wisps",
    "dynamic motion blur"
  ]
};

export function PosterGenerator({ onGenerate, isGenerating, onPromptGenerated, generatedPrompt, imageDimensions, onGetGenerateFunction }: PosterGeneratorProps) {
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
    const randomTagline = randomChoice(randomData.taglines);
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
    setTagline(randomTagline);
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

    // NE PAS générer automatiquement - juste remplir les champs
    console.log('[POSTER_GENERATOR] 🎲 Affiche aléatoire générée (champs remplis uniquement)');
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
      width: imageDimensions?.width || 1024,
      height: imageDimensions?.height || 1792, // Format poster (9:16)
    };

    onGenerate(posterParams, genParams);
  };

  // Exposer la fonction de génération au parent via callback
  useEffect(() => {
    if (onGetGenerateFunction) {
      console.log('[POSTER_GENERATOR] 📤 Envoi de la fonction de génération au parent');
      onGetGenerateFunction(handleStartGeneration);
    }
  }, [title, subtitle, tagline, occasion, customOccasion, ambiance, customAmbiance, 
      mainCharacter, characterDescription, environment, environmentDescription,
      characterAction, actionDescription, additionalDetails, colorPalette, 
      customPalette, titleStyle, generatedPrompt, onGetGenerateFunction]);

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <ImageIcon className="w-5 h-5 text-purple-400" />
        <h2 className="text-white">Générateur d'Affiches Ludiques</h2>
      </div>

      <div className="bg-purple-900/20 border border-purple-700 rounded-lg p-4 mb-6">
        <button
          type="button"
          onClick={generateRandomPoster}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          disabled={isGenerating}
        >
          <Sparkles className="w-4 h-4" />
          <span className="text-sm">🎲 Générer une affiche aléatoire</span>
        </button>
      </div>

      <div className="space-y-4">
        {/* Grille 2 colonnes pour les champs */}
        <div className="grid grid-cols-2 gap-4">
          {/* Colonne 1 */}
          <div className="space-y-4">
            {/* Titre de l'affiche */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Titre de l'affiche
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: LA GRANDE AVENTURE"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                disabled={isGenerating}
              />
            </div>

            {/* Sous-titre */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Sous-titre
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Ex: Édition spéciale"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                disabled={isGenerating}
              />
            </div>

            {/* Accroche */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Accroche
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="Ex: Une aventure..."
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                disabled={isGenerating}
              />
            </div>

            {/* Occasion/Thème */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Occasion / Thème
              </label>
              <select
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm mb-2"
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
                placeholder="Ou thème personnalisé..."
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                disabled={isGenerating}
              />
            </div>

            {/* Ambiance Générale */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Ambiance
              </label>
              <select
                value={ambiance}
                onChange={(e) => setAmbiance(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm mb-2"
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
                placeholder="Ou ambiance personnalisée..."
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                disabled={isGenerating}
              />
            </div>

            {/* Personnage Principal */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Personnage
              </label>
              <select
                value={mainCharacter}
                onChange={(e) => setMainCharacter(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm mb-2"
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
                placeholder="Description personnelle..."
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                disabled={isGenerating}
              />
            </div>
          </div>

          {/* Colonne 2 */}
          <div className="space-y-4">
            {/* Environnement */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Environnement
              </label>
              <select
                value={environment}
                onChange={(e) => setEnvironment(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm mb-2"
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
                placeholder="Description personnelle..."
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                disabled={isGenerating}
              />
            </div>

            {/* Action du Personnage */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Action
              </label>
              <select
                value={characterAction}
                onChange={(e) => setCharacterAction(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm mb-2"
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
                placeholder="Description personnelle..."
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                disabled={isGenerating}
              />
            </div>

            {/* Palette de Couleurs */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Palette de Couleurs
              </label>
              <select
                value={colorPalette}
                onChange={(e) => setColorPalette(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm mb-2"
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
                placeholder="Ou palette personnalisée..."
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                disabled={isGenerating}
              />
            </div>

            {/* Style du Titre */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Style du Titre
              </label>
              <select
                value={titleStyle}
                onChange={(e) => setTitleStyle(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                disabled={isGenerating}
              >
                {titleStyles.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Détails Supplémentaires */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Détails Supplémentaires
              </label>
              <textarea
                value={additionalDetails}
                onChange={(e) => setAdditionalDetails(e.target.value)}
                placeholder="Ex: Feux d'artifice, neige..."
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm"
                rows={3}
                disabled={isGenerating}
              />
            </div>
          </div>
        </div>

        {/* Affichage du prompt généré (pleine largeur) */}
        {generatedPrompt && (
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 mt-4">
            <h3 className="text-gray-300 mb-2 text-sm">Prompt Généré</h3>
            <p className="text-white text-sm leading-relaxed">{generatedPrompt}</p>
          </div>
        )}
      </div>
    </div>
  );
}
