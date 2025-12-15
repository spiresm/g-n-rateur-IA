import { useState, useEffect } from 'react';
import { GenerationParams } from '../App';

interface GenerationParametersProps {
  onGenerate: (params: GenerationParams) => void;
  isGenerating: boolean;
  imageDimensions?: { width: number; height: number };
  onGetGenerateFunction?: (fn: () => void) => void;
}

export function GenerationParameters({ onGenerate, isGenerating, imageDimensions, onGetGenerateFunction }: GenerationParametersProps) {
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

  // Mettre à jour les dimensions quand elles changent
  useEffect(() => {
    if (imageDimensions) {
      setWidth(imageDimensions.width);
      setHeight(imageDimensions.height);
    }
  }, [imageDimensions]);

  const handleStartGeneration = () => {
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
    });
  };

  // Exposer la fonction de génération au parent
  useEffect(() => {
    if (onGetGenerateFunction) {
      console.log('[GENERATION_PARAMETERS] 📤 Envoi de la fonction de génération au parent');
      onGetGenerateFunction(handleStartGeneration);
    }
  }, [prompt, negativePrompt, steps, cfg, seed, sampler, scheduler, denoise, width, height, onGetGenerateFunction]);

  const samplers = [
    'euler', 'euler_ancestral', 'heun', 'dpm_2', 'dpm_2_ancestral',
    'lms', 'dpm_fast', 'dpmpp_2m', 'ddim', 'res_multistep'
  ];

  const schedulers = ['normal', 'karras', 'exponential', 'simple'];

  return (
    <div className="p-6">
      <div className="space-y-5">
        <div>
          <label className="block text-sm text-gray-300 mb-2">Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Décrivez votre image..."
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 resize-none"
            rows={3}
            disabled={isGenerating}
          />
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-2">Negative Prompt</label>
          <textarea
            value={negativePrompt}
            onChange={(e) => setNegativePrompt(e.target.value)}
            placeholder="Ce que vous ne voulez pas..."
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 resize-none"
            rows={2}
            disabled={isGenerating}
          />
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-2">Steps: {steps}</label>
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

        <div>
          <label className="block text-sm text-gray-300 mb-2">CFG Scale: {cfg}</label>
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

        <div>
          <label className="block text-sm text-gray-300 mb-2">Seed</label>
          <input
            type="number"
            value={seed}
            onChange={(e) => setSeed(Number(e.target.value))}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            disabled={isGenerating}
          />
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-2">Sampler</label>
          <select
            value={sampler}
            onChange={(e) => setSampler(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            disabled={isGenerating}
          >
            {samplers.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-2">Scheduler</label>
          <select
            value={scheduler}
            onChange={(e) => setScheduler(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            disabled={isGenerating}
          >
            {schedulers.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-2">Denoise: {denoise.toFixed(2)}</label>
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

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm text-gray-300 mb-2">Width</label>
            <input
              type="number"
              value={width}
              onChange={(e) => setWidth(Number(e.target.value))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              disabled={isGenerating}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-2">Height</label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              disabled={isGenerating}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
