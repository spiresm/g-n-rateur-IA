import { useCallback } from 'react';
import { posterData } from './posterData';

const getFullVersion = useCallback((
    shortLabel: string,
    type: 'theme' | 'ambiance' | 'character' | 'environment' | 'action' | 'palette' | 'titleStyle'
  ): string => {
    const index = {
      theme: posterData.themes.indexOf(shortLabel),
      ambiance: posterData.ambiances.indexOf(shortLabel),
      character: posterData.personnages.indexOf(shortLabel),
      environment: posterData.environnements.indexOf(shortLabel),
      action: posterData.actions.indexOf(shortLabel),
      palette: posterData.palettes.indexOf(shortLabel),
      titleStyle: posterData.styles_titre.indexOf(shortLabel)
    }[type];

    if (index === -1) return shortLabel;

    return {
      theme: posterData.themes_full[index],
      ambiance: posterData.ambiances_full[index],
      character: posterData.personnages_full[index],
      environment: posterData.environnements_full[index],
      action: posterData.actions_full[index],
      palette: posterData.palettes_full[index],
      titleStyle: posterData.styles_titre_full[index]
    }[type] || shortLabel;
  }, []);

  const generatePrompt = useCallback(() => {
    const hasTitle = Boolean(title.trim());


export function usePosterPrompt(params: any) {
  return { generatePrompt };
}
