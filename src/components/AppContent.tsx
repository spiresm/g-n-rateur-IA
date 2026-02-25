import { usePosterState } from './usePosterState';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ImageIcon, Sparkles } from 'lucide-react';
import type { PosterParams, GenerationParams } from '../App';

// -----------------------------
// CONFIG BACKEND
// -----------------------------
const BACKEND_URL: string =
  (import.meta as any)?.env?.VITE_BACKEND_URL || 'http://127.0.0.1:8010';

// Workflow ComfyUI côté bridge
const DEFAULT_WORKFLOW = 'affiche.json';

type ImageDimensions = {
  width: number;
  height: number;
  label?: 'Portrait' | 'Paysage' | 'Carré';
};

type GeneratedImage = {
  id: string;
  imageUrl: string;
  prompt: string;
  createdAt: number;
  generationMs?: number;
};

interface PosterGeneratorProps {
  onGenerate: (posterParams: PosterParams, genParams: GenerationParams) => void;
  isGenerating: boolean;
  onPromptGenerated: (prompt: string) => void;
  generatedPrompt: string;
  imageDimensions?: ImageDimensions;
  onGetGenerateFunction?: (fn: () => void) => void;
}

// ---------------------------------------------------------
// APP CONTENT = HEADER + CAROUSEL + POSTER GENERATOR
// ---------------------------------------------------------
export function AppContent() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<GeneratedImage[]>([]);

  const generateFnRef = useRef<null | (() => void)>(null);

  const fetchJson = useCallback(async (url: string, init?: RequestInit) => {
    const res = await fetch(url, init);
    const text = await res.text();
    let data: any = null;

    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

    if (!res.ok) {
      const msg = (data && (data.detail || data.error || data.message)) || `HTTP ${res.status}`;
      throw new Error(msg);
    }
    return data;
  }, []);

  const waitForCompletion = useCallback(
    async (promptId: string) => {
      const start = Date.now();
      while (true) {
        const p = await fetchJson(`${BACKEND_URL}/progress/${promptId}`);
        const completed = !!(p?.completed ?? p?.status?.completed);
        if (completed) return Date.now() - start;
        await new Promise((r) => setTimeout(r, 900));
      }
    },
    [fetchJson]
  );

  const fetchResultImage = useCallback(
    async (promptId: string) => {
      const r = await fetchJson(`${BACKEND_URL}/result/${promptId}`);
      const b64 = r?.image_base64;
      if (!b64) throw new Error('Aucune image retournée par /result');
      return `data:image/png;base64,${b64}` as const;
    },
    [fetchJson]
  );

  const onGenerate = useCallback(
    async (posterParams: PosterParams, genParams: GenerationParams) => {
      setError(null);
      setIsGenerating(true);

      try {
        const body = new URLSearchParams();

        // paramètres communs
        body.set('prompt', genParams.final_prompt || '');
        body.set('negativePrompt', genParams.negativePrompt ?? '');
        body.set('steps', String(genParams.steps ?? 20));
        body.set('cfg', String(genParams.cfg ?? 7));
        body.set('seed', String(genParams.seed ?? 0));
        body.set('sampler', String(genParams.sampler ?? 'euler'));
        body.set('scheduler', String(genParams.scheduler ?? 'normal'));
        body.set('denoise', String(genParams.denoise ?? 1));
        body.set('width', String(genParams.width ?? 768));
        body.set('height', String(genParams.height ?? 1024));

        // paramètres affiche (si workflow les utilise)
        body.set('title', posterParams.title ?? '');
        body.set('subtitle', posterParams.subtitle ?? '');
        body.set('tagline', posterParams.tagline ?? '');
        body.set('occasion', posterParams.occasion ?? '');
        body.set('ambiance', posterParams.ambiance ?? '');
        body.set('mainCharacter', posterParams.mainCharacter ?? '');
        body.set('characterDescription', posterParams.characterDescription ?? '');
        body.set('environment', posterParams.environment ?? '');
        body.set('environmentDescription', posterParams.environmentDescription ?? '');
        body.set('characterAction', posterParams.characterAction ?? '');
        body.set('actionDescription', posterParams.actionDescription ?? '');
        body.set('additionalDetails', posterParams.additionalDetails ?? '');
        body.set('colorPalette', posterParams.colorPalette ?? '');
        body.set('titleStyle', posterParams.titleStyle ?? '');

        // 1) /generate
        const gen = await fetchJson(
          `${BACKEND_URL}/generate?workflow_name=${encodeURIComponent(DEFAULT_WORKFLOW)}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body,
          }
        );

        const promptId = gen?.prompt_id || gen?.promptId || gen?.id;
        if (!promptId) throw new Error('Réponse /generate invalide (prompt_id manquant)');

        // 2) polling /progress
        const generationMs = await waitForCompletion(promptId);

        // 3) /result
        const imageUrl = await fetchResultImage(promptId);

        setImages((prev) => [
          {
            id: String(promptId),
            imageUrl,
            prompt: genParams.final_prompt || '',
            createdAt: Date.now(),
            generationMs,
          },
          ...prev,
        ]);
      } catch (e: any) {
        setError(e?.message || String(e));
      } finally {
        setIsGenerating(false);
      }
    },
    [fetchJson, fetchResultImage, waitForCompletion]
  );

  const headerSubtitle = useMemo(() => {
    try {
      return `Backend: ${new URL(BACKEND_URL).host} · Workflow: ${DEFAULT_WORKFLOW}`;
    } catch {
      return `Backend: ${BACKEND_URL} · Workflow: ${DEFAULT_WORKFLOW}`;
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* HEADER */}
      <div className="sticky top-0 z-10 bg-gray-900/80 backdrop-blur border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-700 flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-purple-300" />
            </div>
            <div>
              <div className="font-semibold leading-tight">G-n-rateur IA</div>
              <div className="text-xs text-gray-400">{headerSubtitle}</div>
            </div>
          </div>

          <div className="text-xs text-gray-400">{isGenerating ? '⏳ Génération…' : '✅ Prêt'}</div>
        </div>
      </div>

      {/* CONTENU */}
      <div className="max-w-6xl mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CAROUSEL */}
        <div className="bg-gray-800/40 border border-gray-700 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="font-semibold">Galerie</div>
            <div className="text-xs text-gray-400">{images.length} image(s)</div>
          </div>

          {error && (
            <div className="mb-3 text-sm text-red-300 bg-red-900/20 border border-red-800 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          {images.length === 0 ? (
            <div className="text-sm text-gray-400 border border-dashed border-gray-600 rounded-xl p-6">
              Aucune image générée pour l’instant.
              <div className="mt-2 text-xs text-gray-500">
                Lance une génération à droite pour remplir le carousel.
              </div>
            </div>
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img) => (
                <div
                  key={img.id}
                  className="min-w-[220px] max-w-[220px] bg-gray-900/40 border border-gray-700 rounded-xl overflow-hidden"
                >
                  <img src={img.imageUrl} alt={img.id} className="w-full h-56 object-cover" />
                  <div className="p-3">
                    <div className="text-xs text-gray-300 line-clamp-2">{img.prompt}</div>
                    <div className="mt-2 text-[11px] text-gray-500">
                      {img.generationMs ? `${Math.round(img.generationMs / 1000)}s` : ''} ·{' '}
                      {new Date(img.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FORM */}
        <div className="bg-gray-800/40 border border-gray-700 rounded-2xl">
          <PosterGenerator
            onGenerate={onGenerate}
            isGenerating={isGenerating}
            onPromptGenerated={setGeneratedPrompt}
            generatedPrompt={generatedPrompt}
            onGetGenerateFunction={(fn) => {
              generateFnRef.current = fn;
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------
// POSTER GENERATOR (ton composant)
// ---------------------------------------------------------

const randomData = {
  titres: [
    "La Nuit des Étoiles",
    "Royaume d'Hiver",
    "L'Éveil du Dragon",
    "Chasseurs de Légendes",
    "Le Grand Mystère",
    "Voyage Intemporel",
    "L'Aube des Héros",
    "Crépuscule Magique",
    "Dernier Refuge",
    "Échos de l'Infini",
  ],
  sousTitres: [
    "Une aventure extraordinaire",
    "Un conte fantastique",
    "Une légende oubliée",
    "L'histoire commence",
    "Au-delà des frontières",
    "Dans un monde parallèle",
    "Quand tout bascule",
    "Le destin vous appelle",
  ],
  slogans: [
    "Osez rêver plus grand",
    "Le pouvoir est en vous",
    "Découvrez l'inconnu",
    "L'aventure vous attend",
    "L'impossible devient réel",
    "Vivez l'expérience ultime",
  ],
  ambiances: ["Fantasy", "Sci-Fi", "Cyberpunk", "Noir", "Épique", "Enchanteur", "Mystique", "Post-apo"],
  palettes: ["Néon", "Pastel", "Monochrome", "Or & Noir", "Rouge intense", "Bleu glacé", "Vert jungle", "Violet cosmique"],
};

function pick<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function PosterGenerator({
  onGenerate,
  isGenerating,
  onPromptGenerated,
  generatedPrompt: _generatedPrompt,
  imageDimensions,
  onGetGenerateFunction,
}: PosterGeneratorProps) {
  const {
    title, setTitle,
    subtitle, setSubtitle,
    tagline, setTagline,
    occasion, setOccasion,
    customOccasion, setCustomOccasion,
    ambiance, setAmbiance,
    customAmbiance, setCustomAmbiance,
    mainCharacter, setMainCharacter,
    characterDescription, setCharacterDescription,
    environment, setEnvironment,
    environmentDescription, setEnvironmentDescription,
    characterAction, setCharacterAction,
    actionDescription, setActionDescription,
    additionalDetails, setAdditionalDetails,
    colorPalette, setColorPalette,
    customPalette, setCustomPalette,
    titleStyle, setTitleStyle,
  } = usePosterState();

  const generateRandomPoster = useCallback(() => {
    setTitle(pick(randomData.titres).toUpperCase());
    setSubtitle(pick(randomData.sousTitres));
    setTagline(pick(randomData.slogans));
    setAmbiance(pick(randomData.ambiances));
    setColorPalette(pick(randomData.palettes));
    setMainCharacter("Héros mystérieux");
    setEnvironment("Ville futuriste");
    setCharacterAction("En pleine action");
    setAdditionalDetails("Lumières dramatiques");
  }, [
    setTitle, setSubtitle, setTagline, setAmbiance, setColorPalette,
    setMainCharacter, setEnvironment, setCharacterAction, setAdditionalDetails,
  ]);

  useEffect(() => {
    onGetGenerateFunction?.(() => {});
  }, [onGetGenerateFunction]);

  const handleGenerate = useCallback(() => {
    const posterParams: PosterParams = {
      title,
      subtitle,
      tagline,
      occasion: customOccasion || occasion,
      ambiance: customAmbiance || ambiance,
      mainCharacter,
      characterDescription,
      environment,
      environmentDescription,
      characterAction,
      actionDescription,
      additionalDetails,
      colorPalette: customPalette || colorPalette,
      titleStyle,
    };

    const final_prompt = [
      `Movie poster`,
      title ? `Title: ${title}` : '',
      subtitle ? `Subtitle: ${subtitle}` : '',
      tagline ? `Tagline: ${tagline}` : '',
      (customOccasion || occasion) ? `Occasion: ${customOccasion || occasion}` : '',
      (customAmbiance || ambiance) ? `Ambiance: ${customAmbiance || ambiance}` : '',
      mainCharacter ? `Main character: ${mainCharacter}` : '',
      characterDescription ? `Character details: ${characterDescription}` : '',
      environment ? `Environment: ${environment}` : '',
      environmentDescription ? `Environment details: ${environmentDescription}` : '',
      characterAction ? `Action: ${characterAction}` : '',
      actionDescription ? `Action details: ${actionDescription}` : '',
      additionalDetails ? `Extra: ${additionalDetails}` : '',
      (customPalette || colorPalette) ? `Color palette: ${customPalette || colorPalette}` : '',
      titleStyle ? `Title style: ${titleStyle}` : '',
      `high quality, sharp, cinematic lighting`,
    ]
      .filter(Boolean)
      .join(', ');

    onPromptGenerated(final_prompt);

    const dims = imageDimensions ?? { width: 768, height: 1024 };
    const genParams: GenerationParams = {
      final_prompt,
      negativePrompt: '',
      steps: 20,
      cfg: 7,
      seed: Math.floor(Math.random() * 1_000_000),
      sampler: 'euler',
      scheduler: 'normal',
      denoise: 1,
      width: dims.width,
      height: dims.height,
    };

    onGenerate(posterParams, genParams);
  }, [
    title, subtitle, tagline,
    occasion, customOccasion,
    ambiance, customAmbiance,
    mainCharacter, characterDescription,
    environment, environmentDescription,
    characterAction, actionDescription,
    additionalDetails,
    colorPalette, customPalette,
    titleStyle,
    imageDimensions,
    onGenerate,
    onPromptGenerated,
  ]);

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <ImageIcon className="w-5 h-5 text-purple-400" />
        <h2 className="text-white">Générateur d'Affiches Ludiques</h2>
      </div>

      <div className="bg-purple-900/20 border border-purple-700 rounded-lg p-4 mb-6">
        <button
          type="button"
          onClick={generateRandomPoster}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          disabled={isGenerating}
        >
          <Sparkles className="w-4 h-4" />
          <span className="text-sm">🎲 Générer une affiche aléatoire</span>
        </button>
      </div>

      {/* ...ton formulaire reste identique... */}
      {/* IMPORTANT: ne mets JAMAIS de "export ..." dans le JSX */}

      <div className="space-y-4">
        {/* (je te laisse ton bloc actuel ici, inchangé, puisqu’il est déjà bon) */}
        {/* À la fin: */}
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full mt-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg transition-colors text-sm"
        >
          {isGenerating ? 'Génération…' : 'Générer'}
        </button>
      </div>
    </div>
  );
}
