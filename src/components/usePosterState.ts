import { useMemo, useState } from 'react';

type PosterState = {
  title: string;
  subtitle: string;
  tagline: string;

  occasion: string;
  customOccasion: string;

  ambiance: string;
  customAmbiance: string;

  mainCharacter: string;
  characterDescription: string;

  environment: string;
  environmentDescription: string;

  characterAction: string;
  actionDescription: string;

  additionalDetails: string;

  colorPalette: string;
  customPalette: string;

  titleStyle: string;
};

const initialState: PosterState = {
  title: '',
  subtitle: '',
  tagline: '',

  occasion: '',
  customOccasion: '',

  ambiance: '',
  customAmbiance: '',

  mainCharacter: '',
  characterDescription: '',

  environment: '',
  environmentDescription: '',

  characterAction: '',
  actionDescription: '',

  additionalDetails: '',

  colorPalette: '',
  customPalette: '',

  titleStyle: 'Choisir...',
};

export function usePosterState() {
  const [poster, setPoster] = useState<PosterState>(initialState);

  const setters = useMemo(() => {
    const makeSetter =
      <K extends keyof PosterState>(key: K) =>
      (value: PosterState[K]) =>
        setPoster((p) => ({ ...p, [key]: value }));

    return {
      setTitle: makeSetter('title'),
      setSubtitle: makeSetter('subtitle'),
      setTagline: makeSetter('tagline'),

      setOccasion: makeSetter('occasion'),
      setCustomOccasion: makeSetter('customOccasion'),

      setAmbiance: makeSetter('ambiance'),
      setCustomAmbiance: makeSetter('customAmbiance'),

      setMainCharacter: makeSetter('mainCharacter'),
      setCharacterDescription: makeSetter('characterDescription'),

      setEnvironment: makeSetter('environment'),
      setEnvironmentDescription: makeSetter('environmentDescription'),

      setCharacterAction: makeSetter('characterAction'),
      setActionDescription: makeSetter('actionDescription'),

      setAdditionalDetails: makeSetter('additionalDetails'),

      setColorPalette: makeSetter('colorPalette'),
      setCustomPalette: makeSetter('customPalette'),

      setTitleStyle: makeSetter('titleStyle'),
    };
  }, []);

  const resetPoster = () => setPoster(initialState);

  return {
    ...poster,
    ...setters,
    setPoster,
    resetPoster,
  };
}
