import { Smartphone, Monitor, Square } from 'lucide-react';

type DimensionsState = { width: number; height: number; label: string };

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

  dimensions: DimensionsState;
  setDimensions: (d: DimensionsState) => void;
};

export function PosterFormRight({
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
}: PosterFormRightProps) {
  return (
    <div className="space-y-4">
      {/* ✅ BLOC DES 3 BOUTONS DE FORMAT — intégré au design */}
      <div className="bg-gray-800/40 p-3 rounded-lg border border-gray-600">
        <label className="block text-xs text-gray-400 mb-2 font-medium uppercase tracking-wider">Format</label>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setDimensions({ width: 1080, height: 1920, label: 'Portrait' })}
            className={`p-2 rounded border flex flex-col items-center gap-1 transition-all ${
              dimensions.label === 'Portrait'
                ? 'bg-purple-600 border-purple-500 text-white'
                : 'bg-gray-700 border-gray-600 text-gray-400 hover:border-gray-500'
            }`}
            disabled={isGenerating}
          >
            <Smartphone size={16} />
            <span className="text-[10px]">Portrait</span>
          </button>

          <button
            type="button"
            onClick={() => setDimensions({ width: 1920, height: 1080, label: 'Paysage' })}
            className={`p-2 rounded border flex flex-col items-center gap-1 transition-all ${
              dimensions.label === 'Paysage'
                ? 'bg-purple-600 border-purple-500 text-white'
                : 'bg-gray-700 border-gray-600 text-gray-400 hover:border-gray-500'
            }`}
            disabled={isGenerating}
          >
            <Monitor size={16} />
            <span className="text-[10px]">Paysage</span>
          </button>

          <button
            type="button"
            onClick={() => setDimensions({ width: 1024, height: 1024, label: 'Carré' })}
            className={`p-2 rounded border flex flex-col items-center gap-1 transition-all ${
              dimensions.label === 'Carré'
                ? 'bg-purple-600 border-purple-500 text-white'
                : 'bg-gray-700 border-gray-600 text-gray-400 hover:border-gray-500'
            }`}
            disabled={isGenerating}
          >
            <Square size={16} />
            <span className="text-[10px]">Carré</span>
          </button>
        </div>
      </div>

      {/* ENVIRONNEMENT */}
      <div>
        <label className="block text-sm text-gray-300 mb-2">Environnement</label>
        <select
          value={environment}
          onChange={(e) => setEnvironment(e.target.value)}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
          disabled={isGenerating}
        >
          {environments.map((env) => (
            <option key={env} value={env}>{env}</option>
          ))}
        </select>

        <textarea
          value={environmentDescription}
          onChange={(e) => setEnvironmentDescription(e.target.value)}
          placeholder="Description libre (prioritaire si remplie)…"
          className="mt-2 w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm min-h-[84px]"
          disabled={isGenerating}
        />
      </div>

      {/* ACTION */}
      <div>
        <label className="block text-sm text-gray-300 mb-2">Action</label>
        <select
          value={characterAction}
          onChange={(e) => setCharacterAction(e.target.value)}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
          disabled={isGenerating}
        >
          {actions.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>

        <textarea
          value={actionDescription}
          onChange={(e) => setActionDescription(e.target.value)}
          placeholder="Description libre (prioritaire si remplie)…"
          className="mt-2 w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm min-h-[84px]"
          disabled={isGenerating}
        />
      </div>

      {/* PALETTE */}
      <div>
        <label className="block text-sm text-gray-300 mb-2">Palette de couleurs</label>
        <select
          value={colorPalette}
          onChange={(e) => setColorPalette(e.target.value)}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
          disabled={isGenerating}
        >
          {palettes.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        <input
          type="text"
          value={customPalette}
          onChange={(e) => setCustomPalette(e.target.value)}
          placeholder="Ou palette personnalisée…"
          className="mt-2 w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
          disabled={isGenerating}
        />
      </div>

      {/* STYLE TITRE */}
      <div>
        <label className="block text-sm text-gray-300 mb-2">Style du texte</label>
        <select
          value={titleStyle}
          onChange={(e) => setTitleStyle(e.target.value)}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
          disabled={isGenerating}
        >
          {titleStyles.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* DETAILS */}
      <div>
        <label className="block text-sm text-gray-300 mb-2">Détails supplémentaires</label>
        <textarea
          value={additionalDetails}
          onChange={(e) => setAdditionalDetails(e.target.value)}
          placeholder="Détails, contraintes, intentions visuelles…"
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm min-h-[96px]"
          disabled={isGenerating}
        />
      </div>
    </div>
  );
}
