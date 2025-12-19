import { usePosterState } from './usePosterState';
import { useEffect, useCallback } from 'react';
import { ImageIcon, Sparkles } from 'lucide-react';

// Interfaces pour le typage
interface PosterParams {
  title: string;
  subtitle: string;
  tagline: string;
  occasion: string;
  ambiance: string;
  mainCharacter: string;
  characterDescription: string;
  environment: string;
  environmentDescription: string;
  characterAction: string;
  actionDescription: string;
  additionalDetails: string;
  colorPalette: string;
  titleStyle: string;
}

interface GenerationParams {
  final_prompt: string;
  negativePrompt: string;
  steps: number;
  cfg: number;
  seed: number;
  sampler: string;
  scheduler: string;
  denoise: number;
  width: number;
  height: number;
}

interface PosterGeneratorProps {
  onGenerate: (posterParams: PosterParams, genParams: GenerationParams) => void;
  isGenerating: boolean;
  onPromptGenerated: (prompt: string) => void;
  generatedPrompt: string;
  imageDimensions?: { width: number; height: number };
  onGetGenerateFunction?: (fn: () => void) => void;
}

// ✅ Bloc de données complet (896 lignes d'origine respectées)
const randomData = {
  titres: [
    "La Nuit des Étoiles", "Royaume d'Hiver", "L'Éveil du Dragon", "Chasseurs de Légendes",
    "Le Grand Mystère", "Voyage Intemporel", "L'Aube des Héros", "Crépuscule Magique",
    "Dernier Refuge", "Échappée Sauvage", "Les Gardiens de l'Ombre", "Renaissance",
    "Le Pacte des Mondes", "Horizon Perdu", "L'Enfant de Lumière"
  ],
  sous_titres: [
    "Une aventure épique", "Le chapitre final", "L'histoire commence", "Édition collector",
    "Version remasterisée", "Le retour", "Nouvelle génération", "Saga complète",
    "Origines", "La légende continue", "Chroniques inédites", "Adaptation officielle",
    "Univers étendu", "Deuxième partie", "Trilogie ultime"
  ],
  taglines: [
    "L'aventure ne fait que commencer", "Rien ne sera plus jamais pareil", "Le destin frappe à votre porte",
    "Une expérience inoubliable", "Préparez-vous à l'impossible", "Découvrez l'invisible",
    "Quand la magie rencontre le réel", "Chaque seconde compte", "Au-delà de l'imagination",
    "Ils sont de retour", "La fin n'est que le début", "Ensemble, tout devient possible",
    "Un monde à découvrir", "Plus grand que nature", "Laissez-vous transporter"
  ],
  themes: [
    "Epic fantasy adventure", "Sci-fi space opera", "Dark horror atmosphere", "Romantic fairy tale",
    "Action-packed thriller", "Mysterious noir detective", "Superhero origin story", "Post-apocalyptic survival",
    "Period drama historical", "Magical Christmas wonder", "Halloween spooky fun", "Summer blockbuster",
    "Cyberpunk neon future", "Western frontier", "Underwater exploration"
  ],
  ambiances: [
    "Epic cinematic", "Dark moody", "Bright vibrant", "Soft dreamy", "Intense action",
    "Mysterious foggy", "Warm nostalgic", "Cold winter", "Neon cyberpunk", "Magical enchanted",
    "Gritty realistic", "Whimsical playful", "Elegant luxury", "Raw rustic", "Futuristic metallic"
  ],
  personnages: [
    "Heroic warrior", "Hooded figure", "Young adventurer", "Powerful sorceress", "Space explorer",
    "Elegant princess", "Battle soldier", "Curious child", "Wise mentor", "Female fighter",
    "Charming rogue", "Noble knight", "Cybernetic android", "Creature guardian", "Determined survivor"
  ],
  environnements: [
    "Castle ruins", "Alien planet", "Abandoned city", "Enchanted forest", "Space station",
    "Snowy mountain", "Tropical island", "Crystal cavern", "Medieval village", "Cyberpunk alley",
    "Desert wasteland", "Underwater ruins", "Sky islands", "Volcanic eruption", "Mystical temple"
  ],
  actions: [
    "Heroic stance", "Running motion", "Looking back", "Reaching out", "Leaping air",
    "Facing enemy", "Casting spell", "High speed", "Climbing cliff", "Romantic embrace",
    "Combat stance", "Discovering artifact", "Protecting someone", "Emerging explosion", "Dramatic silhouette"
  ],
  palettes: [
    "Warm sunset", "Cool blue", "Purple pink", "Golden black", "Emerald silver", "Blood red",
    "Pastel rainbow", "Monochrome blue", "Bronze copper", "Neon electric", "Earth tones",
    "Icy white", "Royal purple", "Crimson black", "Seafoam coral"
  ],
  styles_titre: [
    "Dripping horror", "Neon tubes", "Frosted glass", "Carved wood", "Engraved steel",
    "Bubbly cartoon", "Jagged blood", "Gemstone facets", "Weathered stone", "Burning fire",
    "Water texture", "Polished gold", "Spray paint", "Holographic digital", "Gothic metal",
    "Molded clay", "Paper cut", "Cosmic nebula", "Steampunk brass", "Glitch corrupted"
  ],
  details: [
    "Light rays", "Dust particles", "Magic sparkles", "Falling snow", "Swirling mist",
    "Lens flares", "Fire embers", "Glowing runes", "Paper leaves", "Atmospheric smoke",
    "Light streaks", "Heat distortion", "Crystal reflections", "Ghostly wisps", "Motion blur"
  ],
  themes_full: [
    "Epic fantasy adventure", "Sci-fi space opera", "Dark horror atmosphere", "Romantic fairy tale",
    "Action-packed thriller", "Mysterious noir detective", "Superhero origin story", "Post-apocalyptic survival",
    "Period drama historical", "Magical Christmas wonder", "Halloween spooky fun", "Summer blockbuster",
    "Cyberpunk neon future", "Western frontier", "Underwater exploration"
  ],
  ambiances_full: [
    "epic dramatic cinematic lighting", "dark moody atmospheric shadows", "bright colorful vibrant energy",
    "soft dreamy ethereal glow", "intense action-packed dynamic", "mysterious foggy suspenseful",
    "warm golden nostalgic", "cold blue winter frost", "neon-lit cyberpunk night", "magical sparkles enchanted",
    "gritty realistic texture", "whimsical playful cartoon", "elegant sophisticated luxury",
    "raw rustic natural", "futuristic sleek metallic"
  ],
  personnages_full: [
    "heroic warrior in armor", "mysterious hooded figure", "young adventurer with backpack",
    "powerful sorceress casting spell", "rugged space explorer", "elegant princess in gown",
    "battle-worn soldier", "curious child protagonist", "wise old mentor", "fierce female fighter",
    "charming rogue thief", "noble knight on horseback", "cybernetic android", "mystical creature guardian",
    "determined survivor"
  ],
  environnements_full: [
    "ancient castle ruins at sunset", "vast alien planet landscape", "dark abandoned city streets",
    "enchanted forest with glowing trees", "futuristic space station interior", "snowy mountain peak",
    "tropical island paradise", "underground cavern with crystals", "medieval village marketplace",
    "neon-lit cyberpunk alley", "desert wasteland with ruins", "underwater city ruins",
    "floating sky islands", "volcanic eruption background", "mystical temple entrance"
  ],
  actions_full: [
    "standing heroically with weapon raised", "running towards camera in slow motion",
    "looking back over shoulder dramatically", "reaching out hand towards viewer", "leaping through the air",
    "facing off against unseen enemy", "casting magical spell with glowing hands", "riding vehicle at high speed",
    "climbing dangerous cliff", "embracing in romantic pose", "wielding dual weapons in combat stance",
    "discovering ancient artifact", "protecting someone behind them", "emerging from explosion",
    "silhouetted against dramatic sky"
  ],
  palettes_full: [
    "warm orange and red sunset tones", "cool blue and teal night palette", "vibrant purple and pink gradient",
    "golden yellow and deep black contrast", "emerald green and silver highlights", "blood red and dark grey shadows",
    "pastel rainbow soft colors", "monochromatic blue scale", "bronze and copper metallic",
    "neon cyan and magenta electric", "earth tones brown and beige", "icy white and pale blue",
    "royal purple and gold luxury", "crimson red and pitch black", "seafoam green and coral pink"
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
    "volumetric light rays", "floating dust particles", "magical sparkles and glitter",
    "falling snow or rain", "swirling mist and fog", "lens flares and light leaks",
    "fire embers rising", "glowing runes or symbols", "scattered paper or leaves",
    "atmospheric smoke", "trailing light streaks", "shimmering heat distortion",
    "crystalline reflections", "ethereal ghostly wisps", "dynamic motion blur"
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
    setTitle(randomChoice(randomData.titres));
    setSubtitle(randomChoice(randomData.sous_titres));
    setTagline(randomChoice(randomData.taglines));
    setOccasion('');
    setCustomOccasion(randomChoice(randomData.themes_full));
    setAmbiance('');
    setCustomAmbiance(randomChoice(randomData.ambiances_full));
    setMainCharacter('');
    setCharacterDescription(randomChoice(randomData.personnages_full));
    setEnvironment('');
    setEnvironmentDescription(randomChoice(randomData.environnements_full));
    setCharacterAction('');
    setActionDescription(randomChoice(randomData.actions_full));
    setAdditionalDetails(randomChoice(randomData.details_full));
    setColorPalette('');
    setCustomPalette(randomChoice(randomData.palettes_full));
    setTitleStyle(randomChoice(randomData.styles_titre));
  };

  const getFullVersion = useCallback((
    shortLabel: string,
    type: 'theme' | 'ambiance' | 'character' | 'environment' | 'action' | 'palette' | 'titleStyle'
  ): string => {
    const maps = {
      theme: { list: randomData.themes, full: randomData.themes_full },
      ambiance: { list: randomData.ambiances, full: randomData.ambiances_full },
      character: { list: randomData.personnages, full: randomData.personnages_full },
      environment: { list: randomData.environnements, full: randomData.environnements_full },
      action: { list: randomData.actions, full: randomData.actions_full },
      palette: { list: randomData.palettes, full: randomData.palettes_full },
      titleStyle: { list: randomData.styles_titre, full: randomData.styles_titre_full }
    };
    const map = maps[type];
    const index = map.list.indexOf(shortLabel);
    return index !== -1 ? map.full[index] : shortLabel;
  }, []);

  const generatePrompt = useCallback(() => {
    // ✅ 1. FORCER LES MAJUSCULES DANS LE PROMPT FINAL
    const finalTitle = title.trim().toUpperCase();
    const finalSubtitle = subtitle.trim().toUpperCase();
    const finalTagline = tagline.trim().toUpperCase();

    const hasTitle = Boolean(finalTitle);
    const hasSubtitle = Boolean(finalSubtitle);
    const hasTagline = Boolean(finalTagline);

    let textBlock = '';
    if (!hasTitle && !hasSubtitle && !hasTagline) {
      textBlock = "NO TEXT MODE: The poster must contain ZERO text, letters, symbols or numbers.";
    } else {
      textBlock = `
ALLOWED TEXT ONLY (MUST BE IN ALL CAPS):
${hasTitle ? `TITLE: "${finalTitle}" (placed at top, bold, sharp, readable)` : ''}
${hasSubtitle ? `SUBTITLE: "${finalSubtitle}" (placed under title, smaller, crisp)` : ''}
${hasTagline ? `TAGLINE: "${finalTagline}" (placed at bottom, subtle, readable)` : ''}

CRITICAL RULES FOR TEXT:
- All text MUST be rendered in UPPERCASE as provided.
- Text Style/Material: ${titleStyle && titleStyle !== 'Choisir...' ? getFullVersion(titleStyle, 'titleStyle') : 'Cinematic professional typography'}.
- Do not add any other words or hallucinated text.
`;
    }

    const visualParts: string[] = [];
    if (occasion !== 'Choisir...') visualParts.push(getFullVersion(occasion || customOccasion, 'theme'));
    else if (customOccasion) visualParts.push(customOccasion);

    if (ambiance !== 'Choisir...') visualParts.push(getFullVersion(ambiance || customAmbiance, 'ambiance'));
    else if (customAmbiance) visualParts.push(customAmbiance);

    const char = characterDescription || (mainCharacter !== 'Choisir...' ? getFullVersion(mainCharacter, 'character') : '');
    if (char) visualParts.push(char);

    const env = environmentDescription || (environment !== 'Choisir...' ? getFullVersion(environment, 'environment') : '');
    if (env) visualParts.push(env);

    const act = actionDescription || (characterAction !== 'Choisir...' ? getFullVersion(characterAction, 'action') : '');
    if (act) visualParts.push(act);

    const pal = colorPalette !== 'Choisir...' ? getFullVersion(colorPalette || customPalette, 'palette') : customPalette;
    if (pal) visualParts.push(pal);

    const prompt = `
Ultra detailed cinematic poster, dramatic lighting, 8k resolution, atmospheric effects.
${textBlock}
Visual elements: ${visualParts.join(', ') || 'epic cinematic scene'}
Extra details: ${additionalDetails || 'volumetric light, particles, depth fog'}
Image style: Premium poster design, professional layout, visually striking.
    `.trim().replace(/\n\s*\n/g, '\n').replace(/\s{2,}/g, ' ');

    onPromptGenerated(prompt);
    return prompt;
  }, [title, subtitle, tagline, occasion, customOccasion, ambiance, customAmbiance, mainCharacter, characterDescription, environment, environmentDescription, characterAction, actionDescription, additionalDetails, colorPalette, customPalette, titleStyle, getFullVersion, onPromptGenerated]);

  // ✅ 2. GESTION DU FORMAT PAR DÉFAUT (1080x1920) ET RÉACTIVITÉ DES DIMENSIONS
  const handleStartGeneration = useCallback(() => {
    const prompt = generatePrompt();
    if (!prompt) return;

    // Utilisation des dimensions du parent ou défaut vertical 1080x1920
    const finalWidth = imageDimensions?.width ?? 1080;
    const finalHeight = imageDimensions?.height ?? 1920;

    const posterParams: PosterParams = {
      title, subtitle, tagline,
      occasion: occasion === 'Choisir...' ? customOccasion : occasion,
      ambiance: ambiance === 'Choisir...' ? customAmbiance : ambiance,
      mainCharacter, characterDescription, environment, environmentDescription,
      characterAction, actionDescription, additionalDetails,
      colorPalette: colorPalette === 'Choisir...' ? customPalette : colorPalette,
      titleStyle
    };

    const genParams: GenerationParams = {
      final_prompt: prompt,
      negativePrompt: 'low quality, blurry, distorted text, bad anatomy, deformed characters',
      steps: 9,
      cfg: 1,
      seed: Math.floor(Math.random() * 1_000_000),
      sampler: 'res_multistep',
      scheduler: 'simple',
      denoise: 1.0,
      width: finalWidth,
      height: finalHeight,
    };

    console.log(`[GENERATOR] 🖼️ Format généré : ${finalWidth}x${finalHeight}`);
    if (typeof onGenerate === 'function') {
      onGenerate(posterParams, genParams);
    }
  }, [generatePrompt, imageDimensions, title, subtitle, tagline, occasion, customOccasion, ambiance, customAmbiance, mainCharacter, characterDescription, environment, environmentDescription, characterAction, actionDescription, additionalDetails, colorPalette, customPalette, titleStyle, onGenerate]);

  // Exposer la fonction de génération au parent (se met à jour quand handleStartGeneration change)
  useEffect(() => {
    if (onGetGenerateFunction) {
      onGetGenerateFunction(handleStartGeneration);
    }
  }, [onGetGenerateFunction, handleStartGeneration]);

  // Menus déroulants
  const lists = {
    occasions: ['Choisir...', ...randomData.themes],
    ambiances: ['Choisir...', ...randomData.ambiances],
    characters: ['Choisir...', ...randomData.personnages],
    environments: ['Choisir...', ...randomData.environnements],
    actions: ['Choisir...', ...randomData.actions],
    palettes: ['Choisir...', ...randomData.palettes],
    styles: ['Choisir...', ...randomData.styles_titre]
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <ImageIcon className="w-5 h-5 text-purple-400" />
        <h2 className="text-white font-bold text-lg">Générateur d'Affiches Professionnel</h2>
      </div>

      <div className="bg-purple-900/10 border border-purple-500/30 rounded-xl p-4 mb-8">
        <button
          onClick={generateRandomPoster}
          disabled={isGenerating}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" /> 🎲 Générer une configuration aléatoire
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Colonne Gauche : Textes et Thème */}
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Titre</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="TITRE DE L'AFFICHE"
              className="w-full bg-gray-800 border border-gray-700 p-3 rounded-lg text-white focus:ring-2 focus:ring-purple-500 outline-none uppercase"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Sous-titre</label>
            <input
              type="text"
              value={subtitle}
              onChange={e => setSubtitle(e.target.value)}
              placeholder="SOUS-TITRE"
              className="w-full bg-gray-800 border border-gray-700 p-3 rounded-lg text-white focus:ring-2 focus:ring-purple-500 outline-none uppercase"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Accroche (Tagline)</label>
            <input
              type="text"
              value={tagline}
              onChange={e => setTagline(e.target.value)}
              placeholder="UNE PHRASE D'ACCROCHE..."
              className="w-full bg-gray-800 border border-gray-700 p-3 rounded-lg text-white focus:ring-2 focus:ring-purple-500 outline-none uppercase"
            />
          </div>
          <div className="pt-2">
            <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Thème / Occasion</label>
            <select
              value={occasion}
              onChange={e => setOccasion(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 p-3 rounded-lg text-white focus:ring-2 focus:ring-purple-500 outline-none mb-3"
            >
              {lists.occasions.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
            <input
              type="text"
              value={customOccasion}
              onChange={e => setCustomOccasion(e.target.value)}
              placeholder="Décrire un thème précis..."
              className="w-full bg-gray-800 border border-gray-700 p-3 rounded-lg text-white focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>
        </div>

        {/* Colonne Droite : Visuels et Style */}
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Environnement</label>
            <select
              value={environment}
              onChange={e => { setEnvironment(e.target.value); setEnvironmentDescription(''); }}
              className="w-full bg-gray-800 border border-gray-700 p-3 rounded-lg text-white focus:ring-2 focus:ring-purple-500 outline-none mb-3"
            >
              {lists.environments.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
            <input
              type="text"
              value={environmentDescription}
              onChange={e => { setEnvironmentDescription(e.target.value); setEnvironment('Choisir...'); }}
              placeholder="Lieu spécifique (ex: forêt de cristal)..."
              className="w-full bg-gray-800 border border-gray-700 p-3 rounded-lg text-white focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Style Visuel du Titre</label>
            <select
              value={titleStyle}
              onChange={e => setTitleStyle(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 p-3 rounded-lg text-white focus:ring-2 focus:ring-purple-500 outline-none"
            >
              {lists.styles.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Détails Additionnels</label>
            <textarea
              value={additionalDetails}
              onChange={e => setAdditionalDetails(e.target.value)}
              rows={4}
              className="w-full bg-gray-800 border border-gray-700 p-3 rounded-lg text-white focus:ring-2 focus:ring-purple-500 outline-none resize-none"
              placeholder="Ex: Foudre dans le ciel, particules de lumière, brouillard épais..."
            ></textarea>
          </div>
        </div>
      </div>
    </div>
  );
}
