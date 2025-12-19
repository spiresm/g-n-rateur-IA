import { useState, useEffect, useCallback } from 'react';
import { Sparkles, Image as ImageIcon, Smartphone, Monitor, Square } from 'lucide-react';
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
    "Epic cinematic",
    "Dark moody",
    "Bright vibrant",
    "Soft dreamy",
    "Intense action",
    "Mysterious foggy",
    "Warm nostalgic",
    "Cold winter",
    "Neon cyberpunk",
    "Magical enchanted",
    "Gritty realistic",
    "Whimsical playful",
    "Elegant luxury",
    "Raw rustic",
    "Futuristic metallic"
  ],
  personnages: [
    "Heroic warrior",
    "Hooded figure",
    "Young adventurer",
    "Powerful sorceress",
    "Space explorer",
    "Elegant princess",
    "Battle soldier",
    "Curious child",
    "Wise mentor",
    "Female fighter",
    "Charming rogue",
    "Noble knight",
    "Cybernetic android",
    "Creature guardian",
    "Determined survivor"
  ],
  environnements: [
    "Castle ruins",
    "Alien planet",
    "Abandoned city",
    "Enchanted forest",
    "Space station",
    "Snowy mountain",
    "Tropical island",
    "Crystal cavern",
    "Medieval village",
    "Cyberpunk alley",
    "Desert wasteland",
    "Underwater ruins",
    "Sky islands",
    "Volcanic eruption",
    "Mystical temple"
  ],
  actions: [
    "Heroic stance",
    "Running motion",
    "Looking back",
    "Reaching out",
    "Leaping air",
    "Facing enemy",
    "Casting spell",
    "High speed",
    "Climbing cliff",
    "Romantic embrace",
    "Combat stance",
    "Discovering artifact",
    "Protecting someone",
    "Emerging explosion",
    "Dramatic silhouette"
  ],
  palettes: [
    "Warm sunset",
    "Cool blue",
    "Purple pink",
    "Golden black",
    "Emerald silver",
    "Blood red",
    "Pastel rainbow",
    "Monochrome blue",
    "Bronze copper",
    "Neon electric",
    "Earth tones",
    "Icy white",
    "Royal purple",
    "Crimson black",
    "Seafoam coral"
  ],
  styles_titre: [
    "Dripping horror",
    "Neon tubes",
    "Frosted glass",
    "Carved wood",
    "Engraved steel",
    "Bubbly cartoon",
    "Jagged blood",
    "Gemstone facets",
    "Weathered stone",
    "Burning fire",
    "Water texture",
    "Polished gold",
    "Spray paint",
    "Holographic digital",
    "Gothic metal",
    "Molded clay",
    "Paper cut",
    "Cosmic nebula",
    "Steampunk brass",
    "Glitch corrupted"
  ],
  details: [
    "Light rays",
    "Dust particles",
    "Magic sparkles",
    "Falling snow",
    "Swirling mist",
    "Lens flares",
    "Fire embers",
    "Glowing runes",
    "Paper leaves",
    "Atmospheric smoke",
    "Light streaks",
    "Heat distortion",
    "Crystal reflections",
    "Ghostly wisps",
    "Motion blur"
  ],
  themes_full: [
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
  ambiances_full: [
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
  personnages_full: [
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
  environnements_full: [
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
  actions_full: [
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
  palettes_full: [
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
  styles_titre_full: [
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
  details_full: [
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

export function PosterGenerator({
  onGenerate,
  isGenerating,
  onPromptGenerated,
  generatedPrompt: _generatedPrompt,
  imageDimensions,
  onGetGenerateFunction
}: PosterGeneratorProps) {
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
  const [titleStyle, setTitleStyle] = useState('Choisir...');

  // ✅ Format d’image piloté par l’UI
  const [dimensions, setDimensions] = useState({
    width: 1080,
    height: 1920,
    label: 'Portrait'
  });

  const randomChoice = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

  const generateRandomPoster = () => {
    const randomTitle = randomChoice(randomData.titres);
    const randomSubtitle = randomChoice(randomData.sous_titres);
    const randomTagline = randomChoice(randomData.taglines);
    const randomTheme = randomChoice(randomData.themes_full);
    const randomAmbiance = randomChoice(randomData.ambiances_full);
    const randomPersonnage = randomChoice(randomData.personnages_full);
    const randomEnvironnement = randomChoice(randomData.environnements_full);
    const randomAction = randomChoice(randomData.actions_full);
    const randomPalette = randomChoice(randomData.palettes_full);
    const randomTitleStyle = randomChoice(randomData.styles_titre);
    const randomDetails = randomChoice(randomData.details_full);

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

    console.log('[POSTER_GENERATOR] 🎲 Affiche aléatoire générée (champs remplis uniquement)');
  };

  const occasions = ['Choisir...', ...randomData.themes];
  const ambiances = ['Choisir...', ...randomData.ambiances];
  const characters = ['Choisir...', ...randomData.personnages];
  const environments = ['Choisir...', ...randomData.environnements];
  const actions = ['Choisir...', ...randomData.actions];
  const palettes = ['Choisir...', ...randomData.palettes];
  const titleStyles = ['Choisir...', ...randomData.styles_titre];

  const getFullVersion = useCallback((
    shortLabel: string,
    type: 'theme' | 'ambiance' | 'character' | 'environment' | 'action' | 'palette' | 'titleStyle'
  ): string => {
    const index = {
      theme: randomData.themes.indexOf(shortLabel),
      ambiance: randomData.ambiances.indexOf(shortLabel),
      character: randomData.personnages.indexOf(shortLabel),
      environment: randomData.environnements.indexOf(shortLabel),
      action: randomData.actions.indexOf(shortLabel),
      palette: randomData.palettes.indexOf(shortLabel),
      titleStyle: randomData.styles_titre.indexOf(shortLabel)
    }[type];

    if (index === -1) return shortLabel;

    return {
      theme: randomData.themes_full[index],
      ambiance: randomData.ambiances_full[index],
      character: randomData.personnages_full[index],
      environment: randomData.environnements_full[index],
      action: randomData.actions_full[index],
      palette: randomData.palettes_full[index],
      titleStyle: randomData.styles_titre_full[index]
    }[type] || shortLabel;
  }, []);

  const generatePrompt = useCallback(() => {
    const hasTitle = Boolean(title.trim());
    const hasSubtitle = Boolean(subtitle.trim());
    const hasTagline = Boolean(tagline.trim());

    let textBlock = '';

    if (!hasTitle && !hasSubtitle && !hasTagline) {
      textBlock = `
NO TEXT MODE:
The poster must contain ZERO text, letters, symbols or numbers.
Do not invent any title, subtitle or tagline.
Avoid any shapes that resemble typography.
`;
    } else {
      textBlock = `
ALLOWED TEXT ONLY (MODEL MUST NOT INVENT ANYTHING ELSE):

${hasTitle ? `TITLE: "${title}" (top area, clean, sharp, readable, no distortion)` : ''}
${hasSubtitle ? `SUBTITLE: "${subtitle}" (under title, smaller, crisp, readable)` : ''}
${hasTagline ? `TAGLINE: "${tagline}" (bottom area, subtle, readable)` : ''}

RULES FOR TEXT:
- Only the items above are permitted. No additional text, no hallucinated wording.
- **TEXT STYLE/MATERIAL (APPLIES ONLY TO LETTERING)**: ${
        titleStyle === 'Choisir...' || !titleStyle
          ? 'cinematic, elegant contrast'
          : getFullVersion(titleStyle, 'titleStyle')
      }.
- **CRITICAL INSTRUCTION: DO NOT APPLY** the text style (e.g., 'dripping horror', 'neon', 'frosted') to the **characters, environment, lighting, or overall rendering**. The main image's mood and style must be defined exclusively by the 'Visual elements' below.
`;
    }

    const visualParts: string[] = [];

    const selectedOccasion = occasion === 'Choisir...' ? '' : occasion;
    const finalOccasion = selectedOccasion || customOccasion;
    if (finalOccasion) visualParts.push(getFullVersion(finalOccasion, 'theme'));

    const selectedAmbiance = ambiance === 'Choisir...' ? '' : ambiance;
    const finalAmbiance = selectedAmbiance || customAmbiance;
    if (finalAmbiance) visualParts.push(getFullVersion(finalAmbiance, 'ambiance'));

    const selectedCharacter = mainCharacter === 'Choisir...' ? '' : mainCharacter;
    const finalCharacter = characterDescription || selectedCharacter;
    if (finalCharacter) visualParts.push(getFullVersion(finalCharacter, 'character'));

    const selectedEnvironment = environment === 'Choisir...' ? '' : environment;
    const finalEnvironment = environmentDescription || selectedEnvironment;
    if (finalEnvironment) visualParts.push(getFullVersion(finalEnvironment, 'environment'));

    const selectedAction = characterAction === 'Choisir...' ? '' : characterAction;
    const finalAction = actionDescription || selectedAction;
    if (finalAction) visualParts.push(getFullVersion(finalAction, 'action'));

    const selectedPalette = colorPalette === 'Choisir...' ? '' : colorPalette;
    const finalPalette = selectedPalette || customPalette;
    if (finalPalette) visualParts.push(getFullVersion(finalPalette, 'palette'));

    const visualElements = visualParts.join(', ');

    const prompt = `
Ultra detailed cinematic poster, dramatic lighting, depth, atmospheric effects.

${textBlock}

Visual elements:
${visualElements || 'epic cinematic scene'}

Extra details:
${additionalDetails || 'cinematic particles, depth fog, volumetric light'}

Image style:
Premium poster design, professional layout, ultra high resolution, visually striking.
    `
      .trim()
      .replace(/\n\s*\n/g, '\n')
      .replace(/\s{2,}/g, ' ');

    onPromptGenerated(prompt);
    return prompt;
  }, [
    title,
    subtitle,
    tagline,
    occasion,
    customOccasion,
    ambiance,
    customAmbiance,
    mainCharacter,
    characterDescription,
    environment,
    environmentDescription,
    characterAction,
    actionDescription,
    additionalDetails,
    colorPalette,
    customPalette,
    titleStyle,
    getFullVersion,
    onPromptGenerated
  ]);

  // ✅ Fonction de génération stable (pas de callback obsolète)
  const handleStartGeneration = useCallback(() => {
  const prompt = generatePrompt();
  if (!prompt) {
    console.warn('[POSTER_GENERATOR] Prompt vide – génération annulée');
    return;
  }

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
    titleStyle
  };

  // ✅ Format choisi via les boutons
const finalWidth = dimensions.width;
const finalHeight = dimensions.height;

const genParams: GenerationParams = {
  final_prompt: prompt,
  negativePrompt: 'low quality, blurry, distorted text, bad anatomy',
  steps: 9,
  cfg: 1,
  seed: Math.floor(Math.random() * 1_000_000),
  sampler: 'res_multistep',
  scheduler: 'simple',
  denoise: 1.0,
  width: finalWidth,
  height: finalHeight,
};

console.log(
  '[POSTER_GENERATOR] 🖼️ FORMAT UTILISÉ:',
  finalWidth,
  'x',
  finalHeight
);

  console.log('[POSTER_GENERATOR] 🚀 Génération avec prompt ACTUEL:', prompt.slice(0, 120) + '...');

  if (typeof onGenerate === 'function') {
    onGenerate(posterParams, genParams);
  } else {
    console.warn('[POSTER_GENERATOR] onGenerate invalide', onGenerate);
  }
}, [
  generatePrompt,
  title,
  subtitle,
  tagline,
  occasion,
  customOccasion,
  ambiance,
  customAmbiance,
  mainCharacter,
  characterDescription,
  environment,
  environmentDescription,
  characterAction,
  actionDescription,
  additionalDetails,
  colorPalette,
  customPalette,
  titleStyle,
  imageDimensions,
  onGenerate
]);
    
  // ✅ Exposer la fonction de génération au parent (toujours à jour)
  useEffect(() => {
    if (typeof onGetGenerateFunction === 'function') {
      console.log('[POSTER_GENERATOR] Envoi (ou mise à jour) de la fonction de génération au parent');
      onGetGenerateFunction(handleStartGeneration);
    }
  }, [onGetGenerateFunction, handleStartGeneration]);

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
  <div className="grid grid-cols-2 gap-4">
    <div className="space-y-4">

      <div>
        <label className="block text-sm text-gray-300 mb-2">
          Titre de l'affiche
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value.toUpperCase())}
          placeholder="TITRE DE L’AFFICHE"
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg
                     text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500
                     focus:border-transparent text-sm uppercase"
          disabled={isGenerating}
        />
      </div>

      <div>
        <label className="block text-sm text-gray-300 mb-2">
          Sous-titre
        </label>
        <input
          type="text"
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value.toUpperCase())}
          placeholder="ÉDITION SPÉCIALE"
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg
                     text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500
                     focus:border-transparent text-sm uppercase"
          disabled={isGenerating}
        />
      </div>

      <div>
        <label className="block text-sm text-gray-300 mb-2">
          Accroche
        </label>
        <input
          type="text"
          value={tagline}
          onChange={(e) => setTagline(e.target.value.toUpperCase())}
          placeholder="UNE AVENTURE…"
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg
                     text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500
                     focus:border-transparent text-sm uppercase"
          disabled={isGenerating}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">Occasion / Thème</label>
              <select
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm mb-2"
                disabled={isGenerating}
              >
                {occasions.map((o) => (
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

            <div>
              <label className="block text-sm text-gray-300 mb-2">Ambiance</label>
              <select
                value={ambiance}
                onChange={(e) => setAmbiance(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm mb-2"
                disabled={isGenerating}
              >
                {ambiances.map((a) => (
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

            <div>
              <label className="block text-sm text-gray-300 mb-2">Personnage</label>
              <select
                value={mainCharacter}
                onChange={(e) => setMainCharacter(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm mb-2"
                disabled={isGenerating}
              >
                {characters.map((c) => (
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

          <div className="space-y-4">
            <div>
              
            
            </div>
<label className="block text-sm text-gray-300 mb-2">Environnement</label>
              <select
  value={environment}
  onChange={(e) => {
    setEnvironment(e.target.value);
    setEnvironmentDescription(''); // ✅ reset champ libre
  }}
  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm mb-2"
  disabled={isGenerating}
>
  {environments.map((e1) => (
    <option key={e1} value={e1}>{e1}</option>
  ))}
</select>

<input
  type="text"
  value={environmentDescription}
  onChange={(e) => {
    setEnvironmentDescription(e.target.value);
    setEnvironment('Choisir...'); // ✅ reset select
  }}
  placeholder="Description personnelle..."
  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg
             text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500
             focus:border-transparent text-sm"
  disabled={isGenerating}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">Action</label>
              <select
                value={characterAction}
                onChange={(e) => setCharacterAction(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm mb-2"
                disabled={isGenerating}
              >
                {actions.map((a) => (
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

            <div>
              <label className="block text-sm text-gray-300 mb-2">Palette de Couleurs</label>
              <select
                value={colorPalette}
                onChange={(e) => setColorPalette(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm mb-2"
                disabled={isGenerating}
              >
                {palettes.map((p) => (
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

            <div>
              <label className="block text-sm text-gray-300 mb-2">Style du Titre</label>
              <select
                value={titleStyle}
                onChange={(e) => setTitleStyle(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                disabled={isGenerating}
              >
                {titleStyles.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">Détails Supplémentaires</label>
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
      </div>
    </div>
  );
}
