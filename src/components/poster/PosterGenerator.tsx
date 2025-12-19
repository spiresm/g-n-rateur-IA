import { useState, useEffect, useCallback } from 'react';
import { Sparkles, Image as ImageIcon, Smartphone, Monitor, Square } from 'lucide-react';
import type { PosterParams, GenerationParams } from '../App';
import { posterData } from './posterData';
import { usePosterPrompt } from './usePosterPrompt';
import { PosterFormLeft } from './PosterFormLeft';
import { PosterFormRight } from './PosterFormRight';

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
  // --------------------------
  // 1) États
  // --------------------------
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

  // ✅ Format par défaut (Portrait 1080x1920)
  const [dimensions, setDimensions] = useState({ width: 1080, height: 1920, label: 'Portrait' });

  // --------------------------
  // 2) États UI dérivés (affichage)
  // --------------------------
  const hasTitle = Boolean(title?.trim());
  const hasSubtitle = Boolean(subtitle?.trim());
  const hasTagline = Boolean(tagline?.trim());

  // --------------------------
  // 3) Hook prompt
  // --------------------------
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

  // --------------------------
  // 4) Random (identique mécanique)
  // --------------------------
  const randomChoice = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

  const generateRandomPoster = () => {
    const randomTitle = randomChoice(posterData.titres ?? ['AFFICHE']);
    const randomSubtitle = randomChoice(posterData.sous_titres ?? ['']);
    const randomTagline = randomChoice(posterData.taglines ?? ['']);

    const randomOccasion = randomChoice(posterData.themes ?? []);
    const randomAmbiance = randomChoice(posterData.ambiances ?? []);
    const randomCharacter = randomChoice(posterData.personnages ?? []);
    const randomEnvironment = randomChoice(posterData.environnements ?? []);
    const randomAction = randomChoice(posterData.actions ?? []);
    const randomDetails = randomChoice(posterData.details ?? ['']);
    const randomPalette = randomChoice(posterData.palettes ?? []);
    const randomTitleStyle = randomChoice(posterData.styles_titre ?? []);

    setTitle(String(randomTitle).toUpperCase());
    setSubtitle(String(randomSubtitle));
    setTagline(String(randomTagline));

    setOccasion(randomOccasion ? String(randomOccasion) : 'Choisir...');
    setCustomOccasion('');

    setAmbiance(randomAmbiance ? String(randomAmbiance) : 'Choisir...');
    setCustomAmbiance('');

    setMainCharacter(randomCharacter ? String(randomCharacter) : 'Choisir...');
    setCharacterDescription('');

    setEnvironment(randomEnvironment ? String(randomEnvironment) : 'Choisir...');
    setEnvironmentDescription('');

    setCharacterAction(randomAction ? String(randomAction) : 'Choisir...');
    setActionDescription('');

    setAdditionalDetails(String(randomDetails));

    // mécanique identique: palette via champ libre
    setColorPalette('Choisir...');
    setCustomPalette(String(randomPalette || ''));

    setTitleStyle(randomTitleStyle ? String(randomTitleStyle) : 'Choisir...');
  };

  // --------------------------
  // 5) Start generation
  // --------------------------
  const handleStartGeneration = useCallback(() => {
    const prompt = generatePrompt();

    const posterParams: PosterParams = {
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
      titleStyle
    };

    // ✅ Taille: boutons > props imageDimensions > fallback
    const finalWidth =
      typeof dimensions?.width === 'number'
        ? dimensions.width
        : typeof imageDimensions?.width === 'number'
          ? imageDimensions.width
          : 1080;

    const finalHeight =
      typeof dimensions?.height === 'number'
        ? dimensions.height
        : typeof imageDimensions?.height === 'number'
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
      height: finalHeight
    };

    onGenerate(posterParams, genParams);
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
    dimensions,
    onGenerate
  ]);

  // Expose generate function
  useEffect(() => {
    onGetGenerateFunction?.(handleStartGeneration);
  }, [onGetGenerateFunction, handleStartGeneration]);

  // Options (identiques)
  const occasions = ['Choisir...', ...(posterData.themes ?? [])];
  const ambiances = ['Choisir...', ...(posterData.ambiances ?? [])];
  const characters = ['Choisir...', ...(posterData.personnages ?? [])];
  const environments = ['Choisir...', ...(posterData.environnements ?? [])];
  const actions = ['Choisir...', ...(posterData.actions ?? [])];
  const palettes = ['Choisir...', ...(posterData.palettes ?? [])];
  const titleStyles = ['Choisir...', ...(posterData.styles_titre ?? [])];

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <ImageIcon className="w-5 h-5 text-purple-400" />
        <h2 className="text-white">Générateur d'Affiches Ludiques</h2>
      </div>

      {/* Random button (identique) */}
      <div className="bg-purple-900/20 border border-purple-700 rounded-lg p-4 mb-6">
        <button
          type="button"
          onClick={generateRandomPoster}
          className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
          disabled={isGenerating}
        >
          <Sparkles className="w-4 h-4" />
          <span className="text-sm">🎲 Générer une affiche aléatoire</span>
        </button>
        <p className="text-xs text-gray-300 mt-2">
          Remplit automatiquement les champs (tu peux ensuite modifier et générer).
        </p>
      </div>

      {/* Layout identique: gauche + droite */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PosterFormLeft
          title={title}
          setTitle={setTitle}
          subtitle={subtitle}
          setSubtitle={setSubtitle}
          tagline={tagline}
          setTagline={setTagline}
          occasion={occasion}
          setOccasion={setOccasion}
          customOccasion={customOccasion}
          setCustomOccasion={setCustomOccasion}
          ambiance={ambiance}
          setAmbiance={setAmbiance}
          customAmbiance={customAmbiance}
          setCustomAmbiance={setCustomAmbiance}
          mainCharacter={mainCharacter}
          setMainCharacter={setMainCharacter}
          characterDescription={characterDescription}
          setCharacterDescription={setCharacterDescription}
          isGenerating={isGenerating}
          occasions={occasions}
          ambiances={ambiances}
          characters={characters}
          hasTitle={hasTitle}
          hasSubtitle={hasSubtitle}
          hasTagline={hasTagline}
        />

        <PosterFormRight
          environment={environment}
          setEnvironment={setEnvironment}
          environmentDescription={environmentDescription}
          setEnvironmentDescription={setEnvironmentDescription}
          characterAction={characterAction}
          setCharacterAction={setCharacterAction}
          actionDescription={actionDescription}
          setActionDescription={setActionDescription}
          additionalDetails={additionalDetails}
          setAdditionalDetails={setAdditionalDetails}
          colorPalette={colorPalette}
          setColorPalette={setColorPalette}
          customPalette={customPalette}
          setCustomPalette={setCustomPalette}
          titleStyle={titleStyle}
          setTitleStyle={setTitleStyle}
          isGenerating={isGenerating}
          environments={environments}
          actions={actions}
          palettes={palettes}
          titleStyles={titleStyles}
          dimensions={dimensions}
          setDimensions={setDimensions}
        />
      </div>

      {/* Bouton générer (si tu l’avais ici avant, tu peux aussi le mettre dans App) */}
      <div className="mt-6">
        <button
          type="button"
          onClick={handleStartGeneration}
          className="w-full bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white py-3 rounded-lg transition-colors"
          disabled={isGenerating}
        >
          {isGenerating ? 'Génération en cours…' : 'Générer'}
        </button>
      </div>
    </div>
  );
}
