import { useState } from 'react';
import { Wand2, Sparkles } from 'lucide-react';

interface GenerationFormProps {
  onGenerate: (prompt: string, style: string, size: string) => void;
  isGenerating: boolean;
  credits: number;
}

export function GenerationForm({ onGenerate, isGenerating, credits }: GenerationFormProps) {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('realistic');
  const [size, setSize] = useState('1024x1024');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && credits > 0) {
      onGenerate(prompt, style, size);
    }
  };

  const styles = [
    { value: 'realistic', label: 'Réaliste' },
    { value: 'artistic', label: 'Artistique' },
    { value: 'anime', label: 'Anime' },
    { value: 'digital-art', label: 'Art Digital' },
    { value: '3d-render', label: 'Rendu 3D' },
  ];

  const sizes = [
    { value: '512x512', label: '512×512' },
    { value: '1024x1024', label: '1024×1024' },
    { value: '1024x1792', label: '1024×1792 (Portrait)' },
    { value: '1792x1024', label: '1792×1024 (Paysage)' },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center gap-2 mb-6">
        <Wand2 className="w-5 h-5 text-purple-600" />
        <h2 className="text-gray-900">Générer une image</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="prompt" className="block text-sm text-gray-700 mb-2">
            Description de l'image
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Décrivez l'image que vous souhaitez créer..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            rows={4}
            disabled={isGenerating}
          />
        </div>

        <div>
          <label htmlFor="style" className="block text-sm text-gray-700 mb-2">
            Style
          </label>
          <select
            id="style"
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            disabled={isGenerating}
          >
            {styles.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="size" className="block text-sm text-gray-700 mb-2">
            Dimensions
          </label>
          <select
            id="size"
            value={size}
            onChange={(e) => setSize(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            disabled={isGenerating}
          >
            {sizes.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={isGenerating || !prompt.trim() || credits <= 0}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Génération en cours...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Générer l'image (1 crédit)</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
