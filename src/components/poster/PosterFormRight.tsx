type PosterFormRightProps = {
  environment: string;
  setEnvironment: (v: string) => void;
  environmentDescription: string;
  setEnvironmentDescription: (v: string) => void;

  characterAction: string;
  setCharacterAction: (v: string) => void;
  actionDescription: string;
  setActionDescription: (v: string) => void;

  additionalDetails: string;
  setAdditionalDetails: (v: string) => void;

  colorPalette: string;
  setColorPalette: (v: string) => void;
  customPalette: string;
  setCustomPalette: (v: string) => void;

  titleStyle: string;
  setTitleStyle: (v: string) => void;

  isGenerating: boolean;
  environments: string[];
  actions: string[];
  palettes: string[];
  titleStyles: string[];

  dimensions: { width: number; height: number; label: string };
  setDimensions: (d: any) => void;
};

export function PosterFormRight(props: PosterFormRightProps) {
  const {
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
    isGenerating,
    environments,
    actions,
    palettes,
    titleStyles,
    dimensions,
    setDimensions
  } = props;

  return (
    <div className="space-y-4">
      {/* FORMAT */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Portrait', width: 1080, height: 1920 },
          { label: 'Paysage', width: 1920, height: 1080 },
          { label: 'Carré', width: 1024, height: 1024 }
        ].map(f => (
          <button
            key={f.label}
            type="button"
            onClick={() => setDimensions({ ...f })}
            className={`px-3 py-2 rounded border text-sm ${
              dimensions.label === f.label
                ? 'bg-purple-600 border-purple-500 text-white'
                : 'bg-gray-700 border-gray-600 text-gray-400'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <select
        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
        value={environment}
        onChange={e => setEnvironment(e.target.value)}
      >
        {environments.map(e => (
          <option key={e} value={e}>{e}</option>
        ))}
      </select>

      <textarea
        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
        placeholder="Description de l’environnement"
        value={environmentDescription}
        onChange={e => setEnvironmentDescription(e.target.value)}
      />

      <select
        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
        value={characterAction}
        onChange={e => setCharacterAction(e.target.value)}
      >
        {actions.map(a => (
          <option key={a} value={a}>{a}</option>
        ))}
      </select>

      <textarea
        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
        placeholder="Action détaillée"
        value={actionDescription}
        onChange={e => setActionDescription(e.target.value)}
      />

      <textarea
        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
        placeholder="Détails supplémentaires"
        value={additionalDetails}
        onChange={e => setAdditionalDetails(e.target.value)}
      />
    </div>
  );
}
