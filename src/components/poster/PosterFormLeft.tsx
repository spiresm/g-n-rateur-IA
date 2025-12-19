type PosterFormLeftProps = {
  title: string;
  setTitle: (v: string) => void;
  subtitle: string;
  setSubtitle: (v: string) => void;
  tagline: string;
  setTagline: (v: string) => void;

  occasion: string;
  setOccasion: (v: string) => void;
  customOccasion: string;
  setCustomOccasion: (v: string) => void;

  ambiance: string;
  setAmbiance: (v: string) => void;
  customAmbiance: string;
  setCustomAmbiance: (v: string) => void;

  mainCharacter: string;
  setMainCharacter: (v: string) => void;
  characterDescription: string;
  setCharacterDescription: (v: string) => void;

  isGenerating: boolean;
  occasions: string[];
  ambiances: string[];
  characters: string[];

  hasTitle: boolean;
  hasSubtitle: boolean;
  hasTagline: boolean;
};

export function PosterFormLeft(props: PosterFormLeftProps) {
  const {
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
    isGenerating,
    occasions,
    ambiances,
    characters
  } = props;

  return (
    <div className="space-y-4">
      <input
        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
        placeholder="Titre"
        value={title}
        onChange={e => setTitle(e.target.value)}
        disabled={isGenerating}
      />

      <input
        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
        placeholder="Sous-titre"
        value={subtitle}
        onChange={e => setSubtitle(e.target.value)}
        disabled={isGenerating}
      />

      <input
        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
        placeholder="Tagline"
        value={tagline}
        onChange={e => setTagline(e.target.value)}
        disabled={isGenerating}
      />

      <select
        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
        value={occasion}
        onChange={e => setOccasion(e.target.value)}
        disabled={isGenerating}
      >
        {occasions.map(o => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>

      {occasion === 'Choisir...' && (
        <input
          className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
          placeholder="Occasion personnalisée"
          value={customOccasion}
          onChange={e => setCustomOccasion(e.target.value)}
        />
      )}

      <select
        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
        value={ambiance}
        onChange={e => setAmbiance(e.target.value)}
        disabled={isGenerating}
      >
        {ambiances.map(a => (
          <option key={a} value={a}>{a}</option>
        ))}
      </select>

      <select
        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
        value={mainCharacter}
        onChange={e => setMainCharacter(e.target.value)}
        disabled={isGenerating}
      >
        {characters.map(c => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      <textarea
        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
        placeholder="Description du personnage"
        value={characterDescription}
        onChange={e => setCharacterDescription(e.target.value)}
      />
    </div>
  );
}
