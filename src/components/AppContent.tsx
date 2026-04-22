import { usePosterState } from "./poster/usePosterState";
import React, { useEffect, useCallback, useState } from 'react';
import { ImageIcon, Sparkles } from 'lucide-react';
import type { PosterParams, GenerationParams } from '../App';

// ✅ Compatible avec AppContent (accepte label optionnel)
type ImageDimensions = {
  width: number;
  height: number;
  label?: 'Portrait' | 'Paysage' | 'Carré';
};

interface PosterGeneratorProps {
  onGenerate: (posterParams: PosterParams, genParams: GenerationParams) => void;
  isGenerating: boolean;
  onPromptGenerated: (prompt: string) => void;
  generatedPrompt: string;
  imageDimensions?: ImageDimensions;
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

  const poster = usePosterState();
  const {
    title, setTitle,
    subtitle, setSubtitle,
    tagline, setTagline,
    occasion, setOccasion,
    customOccasion, setCustomOccasion,
    ambiance, setAmbiance,
    customAmbiance, setCustomAmbiance,
    mainCharacter, setMainCharacter,
    characterDescription, setCharacterDescription,
    environment, setEnvironment,
    environmentDescription, setEnvironmentDescription,
    characterAction, setCharacterAction,
    actionDescription, setActionDescription,
    additionalDetails, setAdditionalDetails,
    colorPalette, setColorPalette,
    customPalette, setCustomPalette,
    titleStyle, setTitleStyle
  } = poster;

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
    // ✅ FORCE LES MAJUSCULES DANS LE PROMPT
    const finalTitle = title.trim().toUpperCase();
    const finalSubtitle = subtitle.trim().toUpperCase();
    const finalTagline = tagline.trim().toUpperCase();

    const hasTitle = Boolean(finalTitle);
    const hasSubtitle = Boolean(finalSubtitle);
    const hasTagline = Boolean(finalTagline);

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

${hasTitle ? `TITLE: "${finalTitle}" (top area, clean, sharp, readable, no distortion)` : ''}
${hasSubtitle ? `SUBTITLE: "${finalSubtitle}" (under title, smaller, crisp, readable)` : ''}
${hasTagline ? `TAGLINE: "${finalTagline}" (bottom area, subtle, readable)` : ''}

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

    // ✅ FORMAT PAR DÉFAUT: 1080x1920 (Portrait)
    const finalWidth = imageDimensions?.width ?? 1080;
    const finalHeight = imageDimensions?.height ?? 1920;

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

    console.log('[POSTER_GENERATOR] 🚀 Génération avec prompt:', prompt.slice(0, 120) + '...');

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
            {/* ✅ Titre - Majuscules automatiques à la saisie */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Titre de l'affiche
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value.toUpperCase())}
                placeholder="TITRE DE L'AFFICHE"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg
                           text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500
                           focus:border-transparent text-sm uppercase"
                disabled={isGenerating}
              />
            </div>

            {/* ✅ Sous-titre - Majuscules automatiques à la saisie */}
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

            {/* ✅ Accroche - Majuscules automatiques à la saisie */}
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
              <label className="block text-sm text-gray-300 mb-2">Environnement</label>
              <select
                value={environment}
                onChange={(e) => {
                  setEnvironment(e.target.value);
                  setEnvironmentDescription('');
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
                  setEnvironment('Choisir...');
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


// ─────────────────────────────────────────────
// CSS variables (inline) — palette or/noir
// ─────────────────────────────────────────────
const C = {
  bg:         '#0b0b0b',
  bgAlt:      '#131313',
  panel:      '#181818',
  panelAlt:   '#222',
  border:     '#2a2a2a',
  accent:     '#d4af37',
  accentSoft: 'rgba(212,175,55,0.15)',
  accentStrg: '#f4d47c',
  text:       '#f2f2f2',
  muted:      '#aaaaaa',
  danger:     '#ff4f4f',
  green:      '#4CAF50',
  radius:     '16px',
  radiusMd:   '12px',
  shadow:     '0 18px 50px rgba(0,0,0,0.55)',
} as const;

// ─────────────────────────────────────────────
// App-level wrapper expected by src/App.tsx
// ─────────────────────────────────────────────
export function AppContent() {

  const [mode, setMode]                         = useState<'image' | 'affiche'>('affiche');
  const [generatedPrompt, setGeneratedPrompt]   = useState('');
  const [isGenerating, setIsGenerating]         = useState(false);
  const [error, setError]                       = useState<string | null>(null);
  const [images, setImages]                     = useState<Array<{ id: string; imageUrl: string }>>([]);
  const [generateFn, setGenerateFn]             = useState<(() => void) | null>(null);
  const [modalSrc, setModalSrc]                 = useState<string | null>(null);
  const [imgDim, setImgDim]                     = useState<ImageDimensions>({ width: 1080, height: 1920, label: 'Portrait' });
  const [workflows, setWorkflows]               = useState<string[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState('');
  const [gpu, setGpu]                           = useState({ name: '–', util: '0%', mem: '– / – Go', temp: '– °C' });
  const [user, setUser]                         = useState({ name: '', avatar: '' });
  const [statusPill, setStatusPill]             = useState({ label: 'PRÊT', color: '#4CAF50' });

  const baseUrl = (() => {
    try { return (import.meta as any).env.VITE_BACKEND_URL ?? ''; } catch { return ''; }
  })();

  useEffect(() => {
    try {
      const token = localStorage.getItem('google_id_token');
      if (!token) return;
      const b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(b64));
      setUser({ name: payload.given_name || payload.name || '', avatar: payload.picture || '' });
    } catch {}
  }, []);

  useEffect(() => {
    const fetchGPU = async () => {
      try {
        const r = await fetch(`${baseUrl}/gpu_status`);
        if (!r.ok) return;
        const d = await r.json();
        setGpu({ name: d.name || 'NVIDIA GPU', util: (d.load ?? 0) + '%', mem: `${d.memory_used ?? 0} / ${d.memory_total ?? 0} Go`, temp: (d.temperature ?? 0) + ' °C' });
      } catch {}
    };
    fetchGPU();
    const id = setInterval(fetchGPU, 10_000);
    return () => clearInterval(id);
  }, [baseUrl]);

  useEffect(() => {
    const fetchWF = async () => {
      try {
        const r = await fetch(`${baseUrl}/workflows`);
        if (!r.ok) return;
        const d = await r.json();
        const wfs: string[] = (d.workflows || []).filter((w: string) => w.endsWith('.json'));
        setWorkflows(wfs);
        if (wfs.length) setSelectedWorkflow(wfs[0]);
      } catch {}
    };
    fetchWF();
  }, [baseUrl]);

  const handleLogout = () => {
    localStorage.removeItem('google_id_token');
    window.location.replace('/login.html');
  };

  const handleGenerate = async (posterParams: PosterParams, genParams: GenerationParams) => {
    setError(null);
    setIsGenerating(true);
    setStatusPill({ label: 'RUNNING', color: '#d4af37' });
    const url = baseUrl ? `${baseUrl.replace(/\/$/, '')}/generate` : '/generate';
    try {
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ posterParams, genParams }) });
      if (!res.ok) { const body = await res.text().catch(() => ''); throw new Error(`Backend error ${res.status}: ${body || res.statusText}`); }
      const data = await res.json().catch(() => ({} as any));
      if (data?.imageUrl) {
        setImages(prev => [{ id: data.id ?? String(Date.now()), imageUrl: data.imageUrl }, ...prev].slice(0, 12));
        setStatusPill({ label: 'DONE', color: '#4CAF50' });
      }
    } catch (e: any) {
      setError(e?.message ?? 'Generation failed');
      setStatusPill({ label: 'FAILED', color: '#ff4f4f' });
    } finally {
      setIsGenerating(false);
    }
  };

  const scrollCarousel = (dir: 'left' | 'right') => {
    const el = document.getElementById('wf-scroll');
    if (el) el.scrollBy({ left: dir === 'left' ? -200 : 200, behavior: 'smooth' });
  };

  const panelStyle: React.CSSProperties = { background: C.panel, borderRadius: C.radius, padding: 20, boxShadow: C.shadow, display: 'flex', flexDirection: 'column' };
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 5, color: C.text };

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: 30, background: C.bg, minHeight: '100vh', color: C.text, fontFamily: '"Inter", system-ui, sans-serif' }}>

      {/* HEADER */}
      <header style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '12px 16px', marginBottom: 24, background: C.panel, borderRadius: C.radius, border: `1px solid ${C.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{ background: '#0f172a', padding: '6px 10px', borderRadius: 8, fontWeight: 800, fontSize: 18, color: C.accent, letterSpacing: 3 }}>RUBENS</div>
          <button onClick={handleLogout} title="Déconnexion" style={{ background: C.panelAlt, border: `1px solid ${C.border}`, borderRadius: 8, color: C.muted, padding: '5px 9px', cursor: 'pointer', fontSize: 15 }}>🔓</button>
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: C.text, lineHeight: 1 }}>Générateur de Contenu IA</h1>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 4, fontSize: 11, fontWeight: 600, background: C.accentSoft, color: C.accentStrg, padding: '3px 8px', borderRadius: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.accent, display: 'inline-block' }} />
              Connecté
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
          {user.name && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {user.avatar && <img src={user.avatar} alt="avatar" style={{ width: 34, height: 34, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)' }} />}
              <div>
                <div style={{ fontSize: 10, color: C.muted, fontWeight: 600 }}>Connecté en tant que</div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{user.name}</div>
              </div>
            </div>
          )}
          <div style={{ background: C.panelAlt, border: `1px solid ${C.border}`, borderRadius: C.radiusMd, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 15 }}>
            <div>
              <div style={{ fontSize: 10, color: C.muted, fontWeight: 600 }}>CARTE GRAPHIQUE</div>
              <strong style={{ fontSize: 14, display: 'block', marginTop: 2 }}>{gpu.name}</strong>
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <span style={{ fontSize: 10, color: C.muted }}>{gpu.util} • Utilisation</span>
                <span style={{ fontSize: 10, color: C.muted }}>{gpu.mem}</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.green }} />
              <span style={{ fontSize: 14, fontWeight: 600 }}>{gpu.temp}</span>
            </div>
          </div>
        </div>
      </header>

      {/* MODE SELECTOR */}
      <div style={{ display: 'flex', gap: 20, marginBottom: 24 }}>
        {(['image', 'affiche'] as const).map((m) => (
          <div key={m} onClick={() => setMode(m)} style={{ flex: 1, height: 180, borderRadius: C.radius, border: `2px solid ${mode === m ? C.accent : C.border}`, background: C.panel, cursor: 'pointer', overflow: 'hidden', transform: mode === m ? 'translateY(-4px)' : 'none', boxShadow: mode === m ? '0 0 20px rgba(212,175,55,0.25)' : 'none', transition: 'all 0.2s' }}>
            <img src={`/vignettes/vignette-${m}.png`} alt={m} onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
        ))}
      </div>

      {/* MAIN LAYOUT */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 24 }}>

        {/* LEFT PANEL */}
        <div style={panelStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 20 }}>⚙️</span>
              <div>
                <div style={{ fontSize: 16, fontWeight: 600 }}>Paramètres de Génération</div>
                <div style={{ fontSize: 12, color: C.muted }}>Sélectionnez un flux de travail, puis ajustez le prompt et les paramètres.</div>
              </div>
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 8px', borderRadius: 12, background: C.panelAlt, color: C.muted }}>Mode: Flux de travail uniquement</span>
          </div>

          {mode === 'image' && (
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Flux de travail (requis)</label>
              <div style={{ position: 'relative', padding: '0 32px' }}>
                <button onClick={() => scrollCarousel('left')} style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', background: C.panelAlt, border: `1px solid ${C.border}`, borderRadius: '50%', width: 26, height: 26, cursor: 'pointer', color: C.text, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, zIndex: 10 }}>‹</button>
                <button onClick={() => scrollCarousel('right')} style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', background: C.panelAlt, border: `1px solid ${C.border}`, borderRadius: '50%', width: 26, height: 26, cursor: 'pointer', color: C.text, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, zIndex: 10 }}>›</button>
                <div id="wf-scroll" style={{ display: 'flex', gap: 8, overflowX: 'auto', scrollBehavior: 'smooth', padding: '6px 2px', scrollbarWidth: 'none' }}>
                  {workflows.length === 0
                    ? <span style={{ fontSize: 12, color: '#9ca3af' }}>Chargement des flux de travail…</span>
                    : workflows.map((wf) => {
                        const base = wf.replace(/\.json$/, '');
                        const sel = selectedWorkflow === wf;
                        return (
                          <div key={wf} onClick={() => setSelectedWorkflow(wf)} style={{ flex: '0 0 auto', width: 86, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, cursor: 'pointer', padding: 6, borderRadius: C.radiusMd, border: `2px solid ${sel ? C.accent : C.border}`, background: sel ? C.accentSoft : C.bgAlt, transition: 'all 0.2s' }}>
                            <div style={{ width: '100%', aspectRatio: '1', overflow: 'hidden', borderRadius: 8, background: '#1e1e1e' }}>
                              <img src={`/vignettes/${base}.png`} onError={(e) => { (e.target as HTMLImageElement).src = '/vignettes/default.png'; }} alt={base} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                            </div>
                            <span style={{ fontSize: 10, color: C.muted, textAlign: 'center', wordBreak: 'break-word', lineHeight: 1.2 }}>{base}</span>
                          </div>
                        );
                      })
                  }
                </div>
              </div>
            </div>
          )}

          {mode === 'affiche' && (
            <PosterGenerator
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
              onPromptGenerated={setGeneratedPrompt}
              generatedPrompt={generatedPrompt}
              imageDimensions={imgDim}
              onGetGenerateFunction={setGenerateFn}
            />
          )}
        </div>

        {/* RIGHT PANEL */}
        <div style={panelStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 20 }}>🖼️</span>
              <div>
                <div style={{ fontSize: 16, fontWeight: 600 }}>Résultat & Prévisualisation</div>
                <div style={{ fontSize: 12, color: C.muted }}>Prévisualisation en temps réel et image finale.</div>
              </div>
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 8px', borderRadius: 12, background: 'rgba(76,175,80,0.15)', color: statusPill.color }}>{statusPill.label}</span>
          </div>

          {/* Format rapide */}
          <div style={{ marginBottom: 12 }}>
            <label style={{ ...labelStyle, fontSize: 13 }}>Format Rapide</label>
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              {([
                { w: 1920, h: 1080, icon: '🖥️', label: 'Paysage'  as const },
                { w: 1080, h: 1920, icon: '📱', label: 'Portrait' as const },
                { w: 1080, h: 1080, icon: '⬛', label: 'Carré'    as const },
              ]).map(({ w, h, icon, label }) => {
                const active = imgDim.width === w && imgDim.height === h;
                return (
                  <span key={label} title={label} onClick={() => setImgDim({ width: w, height: h, label })} style={{ padding: '8px 12px', background: active ? C.accentSoft : C.panelAlt, border: `1px solid ${active ? C.accent : C.border}`, borderRadius: C.radiusMd, cursor: 'pointer', fontSize: 18, boxShadow: active ? '0 0 10px rgba(212,175,55,0.2)' : 'none', transition: 'all 0.2s' }}>{icon}</span>
                );
              })}
            </div>
          </div>

          {/* Generate button */}
          <div style={{ marginBottom: 12 }}>
            <button type="button" onClick={() => generateFn?.()} disabled={isGenerating} style={{ width: '100%', padding: 12, background: C.accent, color: C.bg, border: 'none', borderRadius: C.radiusMd, fontSize: 15, fontWeight: 600, cursor: isGenerating ? 'not-allowed' : 'pointer', opacity: isGenerating ? 0.7 : 1 }}>
              {isGenerating ? '⏳ Génération en cours…' : "✨ Générer le Prompt d'Affiche"}
            </button>
          </div>

          {/* Result area */}
          <div style={{ minHeight: 200, maxHeight: '38vh', background: C.bgAlt, borderRadius: C.radiusMd, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 10, marginBottom: 12, overflow: 'hidden' }}>
            {images.length > 0
              ? <img src={images[0].imageUrl} alt="Résultat" onClick={() => setModalSrc(images[0].imageUrl)} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 10, cursor: 'zoom-in' }} />
              : <p style={{ fontSize: 12, color: C.muted, textAlign: 'center' }}>Aucune image encore générée. Configurez votre flux de travail à gauche et cliquez sur <strong>"Générer"</strong>.</p>
            }
          </div>

          {error && <div style={{ color: C.danger, fontSize: 13, padding: '8px 12px', background: 'rgba(255,79,79,0.1)', border: '1px solid rgba(255,79,79,0.3)', borderRadius: C.radiusMd, marginBottom: 12 }}>{error}</div>}

          {/* Prompt textarea */}
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Prompt</label>
            <textarea value={generatedPrompt} onChange={(e) => setGeneratedPrompt(e.target.value)} placeholder="Décrivez précisément l'image à générer…" style={{ width: '100%', minHeight: 100, padding: '10px 12px', background: C.bgAlt, border: `1px solid ${C.border}`, borderRadius: C.radiusMd, color: C.text, fontSize: 14, resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }} />
          </div>

          {/* Gallery */}
          {images.length > 0 && (
            <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.muted, marginBottom: 10 }}>Galerie</div>
              <div style={{ display: 'flex', gap: 12, overflowX: 'auto', padding: '10px 4px', scrollbarWidth: 'thin' }}>
                {images.map((img) => (
                  <img key={img.id} src={img.imageUrl} alt="Généré" onClick={() => setModalSrc(img.imageUrl)} style={{ flex: '0 0 auto', width: 90, aspectRatio: '9/16', objectFit: 'cover', borderRadius: 8, cursor: 'zoom-in', border: `1px solid ${C.border}` }} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* IMAGE MODAL */}
      {modalSrc && (
        <div onClick={() => setModalSrc(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, cursor: 'zoom-out' }}>
          <button onClick={() => setModalSrc(null)} style={{ position: 'absolute', top: 16, right: 20, fontSize: 32, color: 'white', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
          <img src={modalSrc} alt="Aperçu" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: 12 }} />
          <a href={modalSrc} download style={{ position: 'absolute', bottom: 24, background: C.panelAlt, color: C.text, border: `1px solid ${C.border}`, borderRadius: C.radiusMd, padding: '8px 16px', textDecoration: 'none', fontSize: 14 }}>⬇ Télécharger</a>
        </div>
      )}
    </div>
  );
}
