import { useState } from 'react';
import { Wand2, Settings } from 'lucide-react';
import { GenerationParams } from '../App';

interface ParametersPanelProps {
  onGenerate: (params: GenerationParams) => void;
  isGenerating: boolean;
}

export function ParametersPanel({ onGenerate, isGenerating }: ParametersPanelProps) {
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [steps, setSteps] = useState(20);
  const [cfg, setCfg] = useState(7);
  const [seed, setSeed] = useState(-1);
  const [sampler, setSampler] = useState('euler');
  const [scheduler, setScheduler] = useState('normal');
  const [denoise, setDenoise] = useState(1.0);
  const [width, setWidth] = useState(1024);
  const [height, setHeight] = useState(1024);
  const [refinerEnabled, setRefinerEnabled] = useState(false);
  const [refinerSteps, setRefinerSteps] = useState(10);
  const [refinerCfg, setRefinerCfg] = useState(7);
  const [refinerDenoise, setRefinerDenoise] = useState(0.3);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate({
      prompt,
      negativePrompt,
      steps,
      cfg,
      seed,
      sampler,
      scheduler,
      denoise,
      width,
      height,
      refinerEnabled,
      refinerSteps,
      refinerCfg,
      refinerDenoise,
    });
  };

  const samplers = [
    'euler', 'euler_ancestral', 'heun', 'dpm_2', 'dpm_2_ancestral',
    'lms', 'dpm_fast', 'dpm_adaptive', 'dpmpp_2s_ancestral', 
    'dpmpp_sde', 'dpmpp_2m', 'ddim', 'uni_pc'
  ];

  const schedulers = ['normal', 'karras', 'exponential', 'simple'];

  const dimensions = [
    { label: '512×512', width: 512, height: 512 },
    { label: '768×768', width: 768, height: 768 },
    { label: '1024×1024', width: 1024, height: 1024 },
    { label: '1024×768', width: 1024, height: 768 },
    { label: '768×1024', width: 768, height: 1024 },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="w-5 h-5 text-purple-400" />
        <h2 className="text-white">Paramètres</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Prompt */}
        <div>
          <label className="block text-sm text-gray-300 mb-2">
            Prompt
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Décrivez votre image..."
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            rows={3}
            disabled={isGenerating}
          />
        </div>

        {/* Negative Prompt */}
        <div>
          <label className="block text-sm text-gray-300 mb-2">
            Negative Prompt
          </label>
          <textarea
            value={negativePrompt}
            onChange={(e) => setNegativePrompt(e.target.value)}
            placeholder="Ce que vous ne voulez pas voir..."
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            rows={2}
            disabled={isGenerating}
          />
        </div>

        {/* Steps */}
        <div>
          <label className="block text-sm text-gray-300 mb-2">
            Steps: {steps}
          </label>
          <input
            type="range"
            min="1"
            max="150"
            value={steps}
            onChange={(e) => setSteps(Number(e.target.value))}
            className="w-full accent-purple-500"
            disabled={isGenerating}
          />
        </div>

        {/* CFG Scale */}
        <div>
          <label className="block text-sm text-gray-300 mb-2">
            CFG Scale: {cfg}
          </label>
          <input
            type="range"
            min="1"
            max="20"
            step="0.5"
            value={cfg}
            onChange={(e) => setCfg(Number(e.target.value))}
            className="w-full accent-purple-500"
            disabled={isGenerating}
          />
        </div>

        {/* Seed */}
        <div>
          <label className="block text-sm text-gray-300 mb-2">
            Seed (-1 = aléatoire)
          </label>
          <input
            type="number"
            value={seed}
            onChange={(e) => setSeed(Number(e.target.value))}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            disabled={isGenerating}
          />
        </div>

        {/* Sampler */}
        <div>
          <label className="block text-sm text-gray-300 mb-2">
            Sampler
          </label>
          <select
            value={sampler}
            onChange={(e) => setSampler(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            disabled={isGenerating}
          >
            {samplers.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Scheduler */}
        <div>
          <label className="block text-sm text-gray-300 mb-2">
            Scheduler
          </label>
          <select
            value={scheduler}
            onChange={(e) => setScheduler(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            disabled={isGenerating}
          >
            {schedulers.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Denoise */}
        <div>
          <label className="block text-sm text-gray-300 mb-2">
            Denoise: {denoise.toFixed(2)}
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={denoise}
            onChange={(e) => setDenoise(Number(e.target.value))}
            className="w-full accent-purple-500"
            disabled={isGenerating}
          />
        </div>

        {/* Dimensions */}
        <div>
          <label className="block text-sm text-gray-300 mb-2">
            Dimensions
          </label>
          <div className="grid grid-cols-3 gap-2 mb-2">
            {dimensions.map(dim => (
              <button
                key={dim.label}
                type="button"
                onClick={() => {
                  setWidth(dim.width);
                  setHeight(dim.height);
                }}
                className={`px-2 py-1 rounded text-xs transition-colors ${
                  width === dim.width && height === dim.height
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                disabled={isGenerating}
              >
                {dim.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <input
                type="number"
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
                placeholder="Width"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={isGenerating}
              />
            </div>
            <div>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                placeholder="Height"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={isGenerating}
              />
            </div>
          </div>
        </div>

        {/* SDXL Refiner */}
        <div className="border border-gray-600 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-300">
              SDXL Refiner
            </label>
            <button
              type="button"
              onClick={() => setRefinerEnabled(!refinerEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                refinerEnabled ? 'bg-purple-600' : 'bg-gray-600'
              }`}
              disabled={isGenerating}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  refinerEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {refinerEnabled && (
            <>
              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Refiner Steps: {refinerSteps}
                </label>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={refinerSteps}
                  onChange={(e) => setRefinerSteps(Number(e.target.value))}
                  className="w-full accent-purple-500"
                  disabled={isGenerating}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Refiner CFG: {refinerCfg}
                </label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  step="0.5"
                  value={refinerCfg}
                  onChange={(e) => setRefinerCfg(Number(e.target.value))}
                  className="w-full accent-purple-500"
                  disabled={isGenerating}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Refiner Denoise: {refinerDenoise.toFixed(2)}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={refinerDenoise}
                  onChange={(e) => setRefinerDenoise(Number(e.target.value))}
                  className="w-full accent-purple-500"
                  disabled={isGenerating}
                />
              </div>
            </>
          )}
        </div>

        {/* Generate Button */}
        <button
          type="submit"
          disabled={isGenerating || !prompt.trim()}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Génération en cours...</span>
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5" />
              <span>Générer l'image</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
