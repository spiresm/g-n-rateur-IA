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

export function PosterFormLeft({
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
}: PosterFormLeftProps) {
  return (
    <div className="space-y-4">
      {/* TITRE */}
      <div>
        <label className="block text-sm text-gray-300 mb-2">Titre de l'affiche</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value.toUpperCase())}
          placeholder="TITRE DE L’AFFICHE"
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm uppercase"
          disabled={isGenerating}
        />
      </div>

      {/* SOUS-TITRE */}
      <div>
        <label className="block text-sm text-gray-300 mb-2">Sous-titre</label>
        <input
          type="text"
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          placeholder="Sous-titre..."
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
          disabled={isGenerating}
        />
      </div>

      {/* TAGLINE */}
      <div>
        <label className="block text-sm text-gray-300 mb-2">Tagline</label>
        <input
          type="text"
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
          placeholder="Une phrase d'accroche..."
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
          disabled={isGenerating}
        />
      </div>

      {/* OCCASION / THEME */}
      <div>
        <label className="block text-sm text-gray-300 mb-2">Thème / Occasion</label>
        <select
          value={occasion}
          onChange={(e) => setOccasion(e.target.value)}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
          disabled={isGenerating}
        >
          {occasions.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>

        {occasion === 'Choisir...' && (
          <input
            type="text"
            value={customOccasion}
            onChange={(e) => setCustomOccasion(e.target.value)}
            placeholder="Ou thème personnalisé..."
            className="mt-2 w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
            disabled={isGenerating}
          />
        )}
      </div>

      {/* AMBIANCE */}
      <div>
        <label className="block text-sm text-gray-300 mb-2">Ambiance</label>
        <select
          value={ambiance}
          onChange={(e) => setAmbiance(e.target.value)}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
          disabled={isGenerating}
        >
          {ambiances.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>

        {ambiance === 'Choisir...' && (
          <input
            type="text"
            value={customAmbiance}
            onChange={(e) => setCustomAmbiance(e.target.value)}
            placeholder="Ou ambiance personnalisée..."
            className="mt-2 w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
            disabled={isGenerating}
          />
        )}
      </div>

      {/* PERSONNAGE */}
      <div>
        <label className="block text-sm text-gray-300 mb-2">Personnage</label>
        <select
          value={mainCharacter}
          onChange={(e) => setMainCharacter(e.target.value)}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
          disabled={isGenerating}
        >
          {characters.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <textarea
          value={characterDescription}
          onChange={(e) => setCharacterDescription(e.target.value)}
          placeholder="Description libre (prioritaire si remplie)…"
          className="mt-2 w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm min-h-[84px]"
          disabled={isGenerating}
        />
      </div>
    </div>
  );
}
