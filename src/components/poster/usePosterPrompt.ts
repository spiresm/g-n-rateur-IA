import { useCallback } from 'react';
import { posterData } from './posterData';

export function usePosterPrompt(params: any) {
  const getFullVersion = useCallback((shortLabel: string, type: string) => {
    const indexMap: any = {
      theme: posterData.themes,
      ambiance: posterData.ambiances,
      character: posterData.personnages,
      environment: posterData.environnements,
      action: posterData.actions,
      palette: posterData.palettes,
      titleStyle: posterData.styles_titre
    };

    const index = indexMap[type]?.indexOf(shortLabel);
    if (index === -1 || index === undefined) return shortLabel;

    const fullMap: any = {
      theme: posterData.themes_full,
      ambiance: posterData.ambiances_full,
      character: posterData.personnages_full,
      environment: posterData.environnements_full,
      action: posterData.actions_full,
      palette: posterData.palettes_full,
      titleStyle: posterData.styles_titre_full
    };

    return fullMap[type]?.[index] || shortLabel;
  }, []);

  const generatePrompt = useCallback(() => {
    const {
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
    } = params;

    const hasTitle = Boolean(title?.trim());
    const hasSubtitle = Boolean(subtitle?.trim());
    const hasTagline = Boolean(tagline?.trim());

    let textBlock = '';

    if (!hasTitle && !hasSubtitle && !hasTagline) {
      textBlock = `
NO TEXT MODE:
The poster must contain ZERO text.
`;
    } else {
      textBlock = `
TITLE: "${title}"
SUBTITLE: "${subtitle}"
TAGLINE: "${tagline}"
TEXT STYLE: ${
        titleStyle === 'Choisir...'
          ? 'cinematic, elegant contrast'
          : getFullVersion(titleStyle, 'titleStyle')
      }
`;
    }

    const visualParts: string[] = [];

    const finalOccasion = occasion !== 'Choisir...' ? occasion : customOccasion;
    if (finalOccasion) visualParts.push(getFullVersion(finalOccasion, 'theme'));

    const finalAmbiance = ambiance !== 'Choisir...' ? ambiance : customAmbiance;
    if (finalAmbiance) visualParts.push(getFullVersion(finalAmbiance, 'ambiance'));

    const finalCharacter = characterDescription || mainCharacter;
    if (finalCharacter) visualParts.push(getFullVersion(finalCharacter, 'character'));

    const finalEnvironment = environmentDescription || environment;
    if (finalEnvironment) visualParts.push(getFullVersion(finalEnvironment, 'environment'));

    const finalAction = actionDescription || characterAction;
    if (finalAction) visualParts.push(getFullVersion(finalAction, 'action'));

    const finalPalette = colorPalette !== 'Choisir...' ? colorPalette : customPalette;
    if (finalPalette) visualParts.push(getFullVersion(finalPalette, 'palette'));

    const prompt = `
Ultra detailed cinematic poster.

${textBlock}

Visual elements:
${visualParts.join(', ')}

Extra details:
${additionalDetails || 'cinematic atmosphere'}
`.trim();

    onPromptGenerated(prompt);
    return prompt;
  }, [params, getFullVersion]);

  return { generatePrompt };
}
