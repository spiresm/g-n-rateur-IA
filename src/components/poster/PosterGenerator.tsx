import { useState, useCallback, useEffect } from 'react';
import type { PosterParams, GenerationParams } from '../App';
import { posterData } from './posterData';
import { usePosterPrompt } from './usePosterPrompt';
import { PosterFormLeft } from './PosterFormLeft';
import { PosterFormRight } from './PosterFormRight';

type PosterGeneratorProps = {
  onGenerate: (params: GenerationParams) => void;
  isGenerating: boolean;
  onPromptGenerated: (prompt: string) => void;
  generatedPrompt?: string;
  imageDimensions?: { width: number; height: number };
  onGetGenerateFunction?: (fn: () => void) => void;
};

export function PosterGenerator({
  onGenerate,
  isGenerating,
  onPromptGenerated,
  generatedPrompt: _generatedPrompt,
  imageDimensions,
  onGetGenerateFunction
}: PosterGeneratorProps) {
  /* ------------------------------------------------------------------
   * 1️⃣ États
   * ------------------------------------------------------------------ */
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

  // 🎯 Format image (par défaut Portrait)
  const [dimensions, setDimensions] = useState({
    width: 1080,
    height: 1920,
    label: 'Portrait'
  });

  /* ------------------------------------------------------------------
   * 2️⃣ États UI dérivés (AFFICHAGE UNIQUEMENT)
   * ------------------------------------------------------------------ */
  const hasTitle = Boolean(title.trim());
  const hasSubtitle = Boolean(subtitle.trim());
  const hasTagline = Boolean(tagline.trim());

  /* ------------------------------------------------------------------
   * 3️⃣ Hook IA (PROMPT)
   * ------------------------------------------------------------------ */
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

  /* ------------------------------------------------------------------
   * 4️⃣ Génération
   * ------------------------------------------------------------------ */
  const handleStartGeneration = useCallback(() => {
    const prompt = generatePrompt();

    const params: GenerationParams = {
      prompt,
      width: dimensions.width,
      height: dimensions.height
    };

    onGenerate(params);
  }, [generatePrompt, dimensions, onGenerate]);

  /* ------------------------------------------------------------------
   * 5️⃣ Exposition de la fonction generate (parent)
   * ------------------------------------------------------------------ */
  useEffect(() => {
    onGetGenerateFunction?.(handleStartGeneration);
  }, [onGetGenerateFunction, handleStartGeneration]);

  /* ------------------------------------------------------------------
   * 6️⃣ Options UI
   * ------------------------------------------------------------------ */
  const occasions = ['Choisir...', ...posterData.themes];
  const ambiances = ['Choisir...', ...posterData.ambiances];
  const characters = posterData.personnages;
  const environments = posterData.environnements;
  const actions = posterData.actions;
  const palettes = ['Choisir...', ...posterData.palettes];
  const titleStyles = posterData.styles_titre;

  /* ------------------------------------------------------------------
   * 7️⃣ RENDER
   * ------------------------------------------------------------------ */
  return (
    <div className="w-full">
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
    </div>
  );
}
