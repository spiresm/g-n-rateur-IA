import { useState, useEffect, useCallback } from 'react';
import { Sparkles, Image as ImageIcon } from 'lucide-react';
import { PosterParams, GenerationParams } from '../App';
import { posterData } from './posterData';
import { usePosterPrompt } from './usePosterPrompt';

interface PosterGeneratorProps {
  onGenerate: (posterParams: PosterParams, genParams: GenerationParams) => void;
  isGenerating: boolean;
  onPromptGenerated: (prompt: string) => void;
  generatedPrompt: string;
  imageDimensions?: { width: number; height: number };
  onGetGenerateFunction?: (fn: () => void) => void;
}



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


  const { generatePrompt } = usePosterPrompt({
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
    onPromptGenerated
  });

  const randomChoice = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

  const generateRandomPoster = () => {
    const randomTitle = randomChoice(posterData.titres);
    const randomSubtitle = randomChoice(posterData.sous_titres);
    const randomTagline = randomChoice(posterData.taglines);
    const randomTheme = randomChoice(posterData.themes_full);
    const randomAmbiance = randomChoice(posterData.ambiances_full);
    const randomPersonnage = randomChoice(posterData.personnages_full);
    const randomEnvironnement = randomChoice(posterData.environnements_full);
    const randomAction = randomChoice(posterData.actions_full);
    const randomPalette = randomChoice(posterData.palettes_full);
    const randomTitleStyle = randomChoice(posterData.styles_titre);
    const randomDetails = randomChoice(posterData.details_full);

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

  const occasions = ['Choisir...', ...posterData.themes];
  const ambiances = ['Choisir...', ...posterData.ambiances];
  const characters = ['Choisir...', ...posterData.personnages];
  const environments = ['Choisir...', ...posterData.environnements];
  const actions = ['Choisir...', ...posterData.actions];
  const palettes = ['Choisir...', ...posterData.palettes];
  const titleStyles = ['Choisir...', ...posterData.styles_titre];

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

  const finalWidth =
  typeof imageDimensions?.width === 'number'
    ? imageDimensions.width
    : 1080;

const finalHeight =
  typeof imageDimensions?.height === 'number'
    ? imageDimensions.height
    : 1080;

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
// 🔧 États UI (utilisés uniquement pour l’affichage)
const hasTitle = Boolean(title?.trim());
const hasSubtitle = Boolean(subtitle?.trim());
const hasTagline = Boolean(tagline?.trim());
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
