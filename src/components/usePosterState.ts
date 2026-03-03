import { useState } from 'react';

export function usePosterState() {
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

  return {
    title,
    setTitle,
    subtitle,
    setSubtitle,
    tagline,
    setTagline,
    occasion,
    setOccasion,
    customOccasion,
    setCustomOccasion,
    ambiance,
    setAmbiance,
    customAmbiance,
    setCustomAmbiance,
    mainCharacter,
    setMainCharacter,
    characterDescription,
    setCharacterDescription,
    environment,
    setEnvironment,
    environmentDescription,
    setEnvironmentDescription,
    characterAction,
    setCharacterAction,
    actionDescription,
    setActionDescription,
    additionalDetails,
    setAdditionalDetails,
    colorPalette,
    setColorPalette,
    customPalette,
    setCustomPalette,
    titleStyle,
    setTitleStyle,
  };
}
