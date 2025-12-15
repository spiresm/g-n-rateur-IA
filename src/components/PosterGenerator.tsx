import randomData from '/public/random_affiche_data.json';

// Fonction utilitaire pour choisir un élément aléatoire
const randomChoice = <T,>(arr: T[]): T => {
  return arr[Math.floor(Math.random() * arr.length)];
};

// Générer une affiche aléatoire
const generateRandomPoster = () => {
  const randomTitle = randomChoice(randomData.titres);
  const randomSubtitle = randomChoice(randomData.sous_titres);
  const randomTheme = randomChoice(randomData.themes);
  const randomAmbiance = randomChoice(randomData.ambiances);
  const randomPersonnage = randomChoice(randomData.personnages);
  const randomEnvironnement = randomChoice(randomData.environnements);
  const randomAction = randomChoice(randomData.actions);
  const randomPalette = randomChoice(randomData.palettes);
  const randomTitleStyle = randomChoice(randomData.styles_titre);
  const randomDetails = randomChoice(randomData.details);

  // Mettre à jour tous les états
  setTitle(randomTitle);
  setSubtitle(randomSubtitle);
  setCustomOccasion(randomTheme);
  setCustomAmbiance(randomAmbiance);
  setCharacterDescription(randomPersonnage);
  setEnvironmentDescription(randomEnvironnement);
  setActionDescription(randomAction);
  setAdditionalDetails(randomDetails);
  setCustomPalette(randomPalette);
  setTitleStyle(randomTitleStyle);

  // Générer automatiquement le prompt
  setTimeout(() => {
    handleGeneratePrompt();
  }, 100);
};
