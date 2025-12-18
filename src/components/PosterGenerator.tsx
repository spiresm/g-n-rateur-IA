import { useState, useEffect, useCallback } from 'react';
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

const randomData = {
  titres: [
    "La Nuit des Étoiles", "Royaume d'Hiver", "L'Éveil du Dragon", "Chasseurs de Légendes",
    "Le Grand Mystère", "Voyage Intemporel", "L'Aube des Héros", "Crépuscule Magique",
    "Dernier Refuge", "Échappée Sauvage", "Les Gardiens de l'Ombre", "Renaissance",
    "Le Pacte des Mondes", "Horizon Perdu", "L'Enfant de Lumière", "L'Empire de Cristal",
    "Le Secret des Anciens", "Odyssée Stellaire", "Murmures du Vent", "Le Trône de Fer"
  ],
  sous_titres: [
    "Une aventure épique", "Le chapitre final", "L'histoire commence", "Édition collector",
    "Version remasterisée", "Le retour", "Nouvelle génération", "Saga complète",
    "Origines", "La légende continue", "Chroniques inédites", "Adaptation officielle",
    "Univers étendu", "Deuxième partie", "Trilogie ultime", "L'heure de vérité",
    "Destins croisés", "L'héritage", "Par-delà les frontières", "Le prix de la liberté"
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
    "Action-packed thriller", "Mysterious noir detective", "Superhero origin story",
    "Post-apocalyptic survival", "Period drama historical", "Magical Christmas wonder",
    "Halloween spooky fun", "Summer blockbuster", "Cyberpunk neon future",
    "Western frontier", "Underwater exploration"
  ],
  ambiances: [
    "Epic cinematic", "Dark moody", "Bright vibrant", "Soft dreamy", "Intense action",
    "Mysterious foggy", "Warm nostalgic", "Cold winter", "Neon cyberpunk",
    "Magical enchanted", "Gritty realistic", "Whimsical playful", "Elegant luxury",
    "Raw rustic", "Futuristic metallic"
  ],
  personnages: [
    "Heroic warrior", "Hooded figure", "Young adventurer", "Powerful sorceress",
    "Space explorer", "Elegant princess", "Battle soldier", "Curious child",
    "Wise mentor", "Female fighter", "Charming rogue", "Noble knight",
    "Cybernetic android", "Creature guardian", "Determined survivor"
  ],
  environnements: [
    "Castle ruins", "Alien planet", "Abandoned city", "Enchanted forest",
    "Space station", "Snowy mountain", "Tropical island", "Crystal cavern",
    "Medieval village", "Cyberpunk alley", "Desert wasteland", "Underwater ruins",
    "Sky islands", "Volcanic eruption", "Mystical temple"
  ],
  actions: [
    "Heroic stance", "Running motion", "Looking back", "Reaching out",
    "Leaping air", "Facing enemy", "Casting spell", "High speed",
    "Climbing cliff", "Romantic embrace", "Combat stance", "Discovering artifact",
    "Protecting someone", "Emerging explosion", "Dramatic silhouette"
  ],
  palettes: [
    "Warm sunset", "Cool blue", "Purple pink", "Golden black", "Emerald silver",
    "Blood red", "Pastel rainbow", "Monochrome blue", "Bronze copper",
    "Neon electric", "Earth tones", "Icy white", "Royal purple",
    "Crimson black", "Seafoam coral"
  ],
  styles_titre: [
    "Dripping horror", "Neon tubes", "Frosted glass", "Carved wood",
    "Engraved steel", "Bubbly cartoon", "Jagged blood", "Gemstone facets",
    "Weathered stone", "Burning fire", "Water texture", "Polished gold",
    "Spray paint", "Holographic digital", "Gothic metal", "Molded clay",
    "Paper cut", "Cosmic nebula", "Steampunk brass", "Glitch corrupted"
  ],
  details: [
    "Light rays", "Dust particles", "Magic sparkles", "Falling snow",
    "Swirling mist", "Lens flares", "Fire embers", "Glowing runes",
    "Paper leaves", "Atmospheric smoke", "Light streaks", "Heat distortion",
    "Crystal reflections", "Ghostly wisps", "Motion blur"
  ],
  themes_full: [
    "Epic fantasy adventure", "Sci-fi space opera", "Dark horror atmosphere", "Romantic fairy tale",
    "Action-packed thriller", "Mysterious noir detective", "Superhero origin story",
    "Post-apocalyptic survival", "Period drama historical", "Magical Christmas wonder",
    "Halloween spooky fun", "Summer blockbuster", "Cyberpunk neon future",
    "Western frontier", "Underwater exploration"
  ],
  ambiances_full: [
    "epic dramatic cinematic lighting", "dark moody atmospheric shadows", "bright colorful vibrant energy",
    "soft dreamy ethereal glow", "intense action-packed dynamic", "mysterious foggy suspenseful",
    "warm golden nostalgic", "cold blue winter frost", "neon-lit cyberpunk night",
    "magical sparkles enchanted", "gritty realistic texture", "whimsical playful cartoon",
    "elegant sophisticated luxury", "raw rustic natural", "futuristic sleek metallic"
  ],
  personnages_full: [
    "heroic warrior in armor", "mysterious hooded figure", "young adventurer with backpack",
    "powerful sorceress casting spell", "rugged space explorer", "elegant princess in gown",
    "battle-worn soldier", "curious child protagonist", "wise old mentor",
    "fierce female fighter", "charming rogue thief", "noble knight on horseback",
    "cybernetic android", "mystical creature guardian", "determined survivor"
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
    "looking back over shoulder dramatically", "reaching out hand towards viewer",
    "leaping through the air", "facing off against unseen enemy",
    "casting magical spell with glowing hands", "riding vehicle at high speed",
    "climbing dangerous cliff", "embracing in romantic pose",
    "wielding dual weapons in combat stance", "discovering ancient artifact",
    "protecting someone behind them", "emerging from explosion",
    "silhouetted against dramatic sky"
  ],
  palettes_full: [
    "warm orange and red sunset tones", "cool blue and teal night palette", "vibrant purple and pink gradient",
    "golden yellow and deep black contrast", "emerald green and silver highlights",
    "blood red and dark grey shadows", "pastel rainbow soft colors", "monochromatic blue scale",
    "bronze and copper metallic", "neon cyan and magenta electric", "earth tones brown and beige",
    "icy white and pale blue", "royal purple and gold luxury", "crimson red and pitch black",
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
    "volumetric light rays", "floating dust particles", "magical sparkles and glitter",
    "falling snow or rain", "swirling mist and fog", "lens flares and light leaks",
    "fire embers rising", "glowing runes or symbols", "scattered paper or leaves",
    "atmospheric smoke", "trailing light streaks", "shimmering heat distortion",
    "crystalline reflections", "ethereal ghostly wisps", "dynamic motion blur"
  ]
};
export function PosterGenerator({ 
  onGenerate, isGenerating, onPromptGenerated, imageDimensions, onGetGenerateFunction 
}: PosterGeneratorProps) {
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

  const randomChoice = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

  const generateRandomPoster = () => {
    setTitle(randomChoice(randomData.titres));
    setSubtitle(randomChoice(randomData.sous_titres));
    setTagline(randomChoice(randomData.taglines));
    setCustomOccasion(randomChoice(randomData.themes_full));
    setCustomAmbiance(randomChoice(randomData.ambiances_full));
    setCharacterDescription(randomChoice(randomData.personnages_full));
    setEnvironmentDescription(randomChoice(randomData.environnements_full));
    setActionDescription(randomChoice(randomData.actions_full));
    setCustomPalette(randomChoice(randomData.palettes_full));
    setAdditionalDetails(randomChoice(randomData.details_full));
    setTitleStyle(randomChoice(randomData.styles_titre));
    setOccasion('Choisir...'); setAmbiance('Choisir...'); setMainCharacter('Choisir...'); setEnvironment('Choisir...'); setCharacterAction('Choisir...'); setColorPalette('Choisir...');
  };

  const getFullVersion = (shortLabel: string, type: string): string => {
    if (shortLabel === 'Choisir...' || !shortLabel) return "";
    const mapKeys: any = { theme: 'themes', ambiance: 'ambiances', character: 'personnages', environment: 'environnements', action: 'actions', palette: 'palettes', titleStyle: 'styles_titre' };
    const fullKeys: any = { theme: 'themes_full', ambiance: 'ambiances_full', character: 'personnages_full', environment: 'environnements_full', action: 'actions_full', palette: 'palettes_full', titleStyle: 'styles_titre_full' };
    const index = (randomData as any)[mapKeys[type]].indexOf(shortLabel);
    return index !== -1 ? (randomData as any)[fullKeys[type]][index] : shortLabel;
  };

  const handleStartGeneration = useCallback(() => {
    const hasText = title || subtitle || tagline;
    const prompt = `Ultra detailed cinematic poster. ${hasText ? `TEXT: "${title}" ${subtitle} ${tagline}. STYLE: ${getFullVersion(titleStyle, 'titleStyle')}` : 'NO TEXT.'} Visual: ${characterDescription || getFullVersion(mainCharacter, 'character')}, ${environmentDescription || getFullVersion(environment, 'environment')}, ${actionDescription || getFullVersion(characterAction, 'action')}, ${customPalette || getFullVersion(colorPalette, 'palette')}. Details: ${additionalDetails}.`.replace(/\s+/g, ' ');
    
    onPromptGenerated(prompt);
    onGenerate({ title, subtitle, tagline, occasion, ambiance, mainCharacter, characterDescription, environment, environmentDescription, characterAction, actionDescription, additionalDetails, colorPalette, titleStyle }, {
      prompt, negativePrompt: 'blurry, distorted', steps: 9, cfg: 1, seed: Math.floor(Math.random() * 1000000), sampler: 'res_multistep', scheduler: 'simple', denoise: 1.0, width: imageDimensions?.width || 1024, height: imageDimensions?.height || 1792
    });
  }, [title, subtitle, tagline, titleStyle, mainCharacter, characterDescription, environment, environmentDescription, characterAction, actionDescription, customPalette, colorPalette, additionalDetails, onGenerate, onPromptGenerated, imageDimensions]);

  useEffect(() => { if (onGetGenerateFunction) onGetGenerateFunction(handleStartGeneration); }, [onGetGenerateFunction, handleStartGeneration]);

  return (
    <div className="p-6 space-y-6 bg-gray-900 text-white max-h-[80vh] overflow-y-auto custom-scrollbar">
      <div className="flex items-center gap-2"><ImageIcon className="text-purple-400"/><h2 className="font-bold">POSTER STUDIO</h2></div>
      <button onClick={generateRandomPoster} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-xl font-bold flex items-center justify-center gap-2"><Sparkles/> INSPIRATION ALÉATOIRE</button>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <input placeholder="Titre" value={title} onChange={e=>setTitle(e.target.value)} className="w-full bg-gray-800 p-2 rounded-lg"/>
          <input placeholder="Sous-titre" value={subtitle} onChange={e=>setSubtitle(e.target.value)} className="w-full bg-gray-800 p-2 rounded-lg"/>
          <select value={occasion} onChange={e=>setOccasion(e.target.value)} className="w-full bg-gray-800 p-2 rounded-lg">{['Choisir...', ...randomData.themes].map(o=><option key={o}>{o}</option>)}</select>
        </div>
        <div className="space-y-4">
          <select value={mainCharacter} onChange={e=>setMainCharacter(e.target.value)} className="w-full bg-gray-800 p-2 rounded-lg">{['Choisir...', ...randomData.personnages].map(c=><option key={c}>{c}</option>)}</select>
          <textarea placeholder="Détails visuels" value={additionalDetails} onChange={e=>setAdditionalDetails(e.target.value)} className="w-full bg-gray-800 p-2 rounded-lg h-24"/>
        </div>
      </div>
    </div>
  );
    }
