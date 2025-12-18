import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useImageGeneration } from '../hooks/useImageGeneration';
import { useAuth } from '../contexts/AuthContext';
import { useQuotaSystemStatus } from '../hooks/useQuotaSystemStatus';
import { api } from '../services/api';

import type {
  GenerationParams,
  PosterParams,
  CameraAnglesParams,
  GeneratedImage,
  WorkflowType
} from '../App';

import { Header } from './Header';
import { WorkflowCarousel } from './WorkflowCarousel';
import { GenerationParameters } from './GenerationParameters';
import { PosterGenerator } from './PosterGenerator';
import { CameraAnglesGenerator } from './CameraAnglesGenerator';
import { PreviewPanel } from './PreviewPanel';
import { ProgressOverlay } from './ProgressOverlay';
import { AdminSetupNotice } from './AdminSetupNotice';

type AnyObj = Record<string, any>;

export function AppContent() {
  const { user } = useAuth();
  const { isConfigured, isChecking } = useQuotaSystemStatus();
  const [showAdminNotice, setShowAdminNotice] = useState(false);

  const [workflow, setWorkflow] = useState<WorkflowType>('poster');
  const [currentImage, setCurrentImage] = useState<GeneratedImage | null>(null);
  const [_imageGallery, setImageGallery] = useState<GeneratedImage[]>([]);
  const [savedGallery, setSavedGallery] = useState<GeneratedImage[]>([]);
  const [generatedPrompt, setGeneratedPrompt] = useState('');

  const [workflowToUse, setWorkflowToUse] = useState<string | null>(null);
  const [workflowsLoaded, setWorkflowsLoaded] = useState(false);

  const [imageDimensions, setImageDimensions] = useState({ width: 1024, height: 1024 });

  const workflowToUseRef = useRef<string | null>(null);

  // Fonctions exposées par les générateurs (bouton jaune PreviewPanel)
  const [posterGenerateFn, setPosterGenerateFn] = useState<(() => void) | null>(null);
  const [parametersGenerateFn, setParametersGenerateFn] = useState<(() => void) | null>(null);
  const [cameraAnglesGenerateFn, setCameraAnglesGenerateFn] = useState<(() => void) | null>(null);

  /**
   * ✅ ADAPTATEUR ROBUSTE (LA CORRECTION CLÉ)
   * Ton hook ne renvoie pas forcément { startGeneration, isGenerating, progress, error, clearError }.
   * Ici on mappe automatiquement vers les bons noms sans casser ton code.
   */
  const imageGenRaw = useImageGeneration() as AnyObj;

  const startGeneration = useMemo(() => {
    const fn =
      imageGenRaw?.startGeneration ??
      imageGenRaw?.generateImage ??
      imageGenRaw?.generate ??
      imageGenRaw?.start ??
      imageGenRaw?.run ??
      imageGenRaw?.runGeneration ??
      imageGenRaw?.submit ??
      imageGenRaw?.mutate;

    return typeof fn === 'function' ? fn : null;
  }, [imageGenRaw]);

  const clearError = useMemo(() => {
    const fn =
      imageGenRaw?.clearError ??
      imageGenRaw?.resetError ??
      imageGenRaw?.dismissError ??
      imageGenRaw?.clear ??
      imageGenRaw?.reset;

    return typeof fn === 'function' ? fn : (() => {});
  }, [imageGenRaw]);

  const isGenerating = useMemo(() => {
    const v =
      imageGenRaw?.isGenerating ??
      imageGenRaw?.loading ??
      imageGenRaw?.isLoading ??
      imageGenRaw?.pending ??
      false;

    return Boolean(v);
  }, [imageGenRaw]);

  const progress = useMemo(() => {
    return (
      imageGenRaw?.progress ??
      imageGenRaw?.progressValue ??
      imageGenRaw?.percent ??
      0
    );
  }, [imageGenRaw]);

  const error = useMemo(() => {
    return imageGenRaw?.error ?? imageGenRaw?.err ?? null;
  }, [imageGenRaw]);

  const generatedImage = useMemo(() => {
    return (
      imageGenRaw?.generatedImage ??
      imageGenRaw?.image ??
      imageGenRaw?.imageUrl ??
      imageGenRaw?.result ??
      null
    );
  }, [imageGenRaw]);

  console.log('[APP_CONTENT] State:', { workflow, isGenerating, progress, error, workflowToUse, workflowsLoaded });
  console.log('[APP_CONTENT] 🎯 posterGenerateFn:', posterGenerateFn ? 'DÉFINIE ✅' : 'NULL ❌');
  console.log('[APP_CONTENT] 🎯 parametersGenerateFn:', parametersGenerateFn ? 'DÉFINIE ✅' : 'NULL ❌');
  console.log('[APP_CONTENT] 🎯 cameraAnglesGenerateFn:', cameraAnglesGenerateFn ? 'DÉFINIE ✅' : 'NULL ❌');

  // Charger les workflows disponibles
  useEffect(() => {
    const loadWorkflows = async () => {
      try {
        const data = await api.getWorkflows();
        console.log('[APP_CONTENT] 📋 Workflows disponibles:', data?.workflows);

        if (data?.workflows && data.workflows.length > 0) {
          const afficheWorkflow = data.workflows.find((wf: string) => wf === 'affiche.json');
          const selectedWorkflow = afficheWorkflow || data.workflows[0];

          console.log(`[APP_CONTENT] ✅ Workflow sélectionné: ${selectedWorkflow}`);
          if (afficheWorkflow) console.log('[APP_CONTENT] 🎬 affiche.json détecté et utilisé !');

          setWorkflowToUse(selectedWorkflow);
          workflowToUseRef.current = selectedWorkflow;
        } else {
          console.error('[APP_CONTENT] ❌ Aucun workflow disponible !');
          setWorkflowToUse('affiche.json');
          workflowToUseRef.current = 'affiche.json';
        }

        setWorkflowsLoaded(true);
      } catch (err) {
        console.error('[APP_CONTENT] ❌ Erreur chargement workflows:', err);
        console.warn('[APP_CONTENT] 🔧 FALLBACK : Utilisation de affiche.json par défaut');
        setWorkflowToUse('affiche.json');
        workflowToUseRef.current = 'affiche.json';
        setWorkflowsLoaded(true);
      }
    };

    loadWorkflows();
  }, []);

  // Reset des fonctions de génération quand on change de workflow
  useEffect(() => {
    console.log('[APP_CONTENT] 🔄 Workflow changé:', workflow);
    if (workflow !== 'poster') setPosterGenerateFn(null);
    if (workflow !== 'parameters') setParametersGenerateFn(null);
    if (workflow !== 'cameraAngles') setCameraAnglesGenerateFn(null);
  }, [workflow]);

  // Charger galerie sauvegardée
  useEffect(() => {
    try {
      const saved = localStorage.getItem('savedGallery');
      if (saved) {
        const parsed = JSON.parse(saved);
        const images = parsed.map((img: any) => ({ ...img, timestamp: new Date(img.timestamp) }));
        setSavedGallery(images);
        console.log('[APP_CONTENT] 📚 Galerie sauvegardée chargée:', images.length, 'images');
      }
    } catch (err) {
      console.error('[APP_CONTENT] ❌ Erreur chargement galerie:', err);
    }
  }, []);

  // Nouvelle image générée -> set current image + gallery
  useEffect(() => {
    if (generatedImage && !isGenerating) {
      const newImage: GeneratedImage = {
        id: Date.now().toString(),
        imageUrl: generatedImage,
        params: {
          prompt: generatedPrompt || '',
          negativePrompt: '',
          steps: 30,
          cfg: 7,
          seed: -1,
          sampler: 'euler',
          scheduler: 'normal',
          denoise: 1.0,
          width: 1024,
          height: 1024
        },
        timestamp: new Date()
      };

      setCurrentImage(newImage);
      setImageGallery((prev) => [newImage, ...prev]);
    }
  }, [generatedImage, isGenerating, generatedPrompt]);

  // Génération depuis PARAMETERS
  const handleGenerateFromParameters = useCallback(async (params: GenerationParams) => {
    const currentWorkflow = workflowToUseRef.current;
    if (!currentWorkflow) {
      console.error('[APP_CONTENT] ❌ Aucun workflow chargé, génération impossible');
      return;
    }

    if (!startGeneration) {
      console.error('[APP_CONTENT] ❌ startGeneration indisponible');
      console.log('[APP_CONTENT] Hook keys:', Object.keys(imageGenRaw || {}));
      return;
    }

    clearError();
    console.log(`[APP_CONTENT] 🚀 Génération avec workflow: ${currentWorkflow}`);

    await startGeneration(
      currentWorkflow,
      {
        prompt: params.prompt,
        negative_prompt: params.negativePrompt,
        steps: params.steps,
        cfg_scale: params.cfg,
        seed: params.seed,
        sampler_name: params.sampler,
        scheduler: params.scheduler,
        denoise: params.denoise,
        width: params.width,
        height: params.height
      },
      user?.email || undefined
    );
  }, [startGeneration, clearError, user, imageGenRaw]);

  // Génération depuis POSTER
  const handleGenerateFromPoster = useCallback(async (_posterParams: PosterParams, genParams: GenerationParams) => {
    const currentWorkflow = workflowToUseRef.current;
    if (!currentWorkflow) {
      console.error('[APP_CONTENT] ❌ Aucun workflow chargé, génération impossible');
      return;
    }

    if (!startGeneration) {
      console.error('[APP_CONTENT] ❌ startGeneration indisponible');
      console.log('[APP_CONTENT] Hook keys:', Object.keys(imageGenRaw || {}));
      return;
    }

    clearError();
    console.log(`[APP_CONTENT] 🚀 Génération affiche avec workflow: ${currentWorkflow}`);

    await startGeneration(
      currentWorkflow,
      {
        prompt: genParams.prompt,
        negative_prompt: genParams.negativePrompt,
        steps: genParams.steps,
        cfg_scale: genParams.cfg,
        seed: genParams.seed,
        sampler_name: genParams.sampler,
        scheduler: genParams.scheduler,
        denoise: genParams.denoise,
        width: genParams.width,
        height: genParams.height
      },
      user?.email || undefined
    );
  }, [startGeneration, clearError, user, imageGenRaw]);

  // Génération angles caméra
  const handleGenerateFromCameraAngles = useCallback(async (cameraAnglesParams: CameraAnglesParams) => {
    const cameraWorkflow = 'multiple-angles.json';

    if (!startGeneration) {
      console.error('[APP_CONTENT] ❌ startGeneration indisponible');
      console.log('[APP_CONTENT] Hook keys:', Object.keys(imageGenRaw || {}));
      return;
    }

    clearError();
    console.log(`[APP_CONTENT] 🎥 Génération angles caméra avec workflow: ${cameraWorkflow}`);

    await startGeneration(cameraWorkflow, {
      selected_angle: cameraAnglesParams.selectedAngle,
      prompt_node: cameraAnglesParams.promptNode,
      seed: cameraAnglesParams.seed,
      steps: cameraAnglesParams.steps,
      cfg_scale: cameraAnglesParams.cfg,
      image_file: cameraAnglesParams.imageFile
    });
  }, [startGeneration, clearError, imageGenRaw]);

  const handleSelectFromGallery = (image: GeneratedImage) => setCurrentImage(image);

  const handleCopyParameters = (image: GeneratedImage) => {
    console.log('Paramètres copiés:', image.params);
    navigator.clipboard.writeText(JSON.stringify(image.params, null, 2));
  };

  const handleSaveToGallery = (image: GeneratedImage) => {
    setSavedGallery((prev) => {
      const updated = [image, ...prev];
      try {
        localStorage.setItem('savedGallery', JSON.stringify(updated));
        console.log('[APP_CONTENT] 💾 Image sauvegardée');
      } catch (err) {
        console.error('[APP_CONTENT] ❌ Erreur sauvegarde localStorage:', err);
      }
      return updated;
    });
  };

  const handlePosterGenerateFunctionReceived = useCallback((fn: () => void) => {
    console.log('[APP_CONTENT] Fonction de génération POSTER reçue');
    setPosterGenerateFn(() => fn);
  }, []);

  const handleParametersGenerateFunctionReceived = useCallback((fn: () => void) => {
    console.log('[APP_CONTENT] Fonction de génération PARAMETERS reçue');
    setParametersGenerateFn(() => fn);
  }, []);

  const handleCameraGenerateFunctionReceived = useCallback((fn: () => void) => {
    console.log('[APP_CONTENT] Fonction de génération CAMERA reçue');
    setCameraAnglesGenerateFn(() => fn);
  }, []);

  useEffect(() => {
    if (!isChecking && isConfigured === false) setShowAdminNotice(true);
  }, [isChecking, isConfigured]);

  return (
    <>
      <Header />

      <ProgressOverlay
        isVisible={isGenerating}
        progress={progress}
        label="Génération en cours…"
      />

      {error && (
        <div className="fixed top-36 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-40 flex items-center gap-3">
          <span>{String(error)}</span>
          <button onClick={clearError} className="hover:bg-red-700 px-2 py-1 rounded">✕</button>
        </div>
      )}

      <div className="pt-32">
        <WorkflowCarousel selectedWorkflow={workflow} onSelectWorkflow={setWorkflow} />

        {/* ✅ Responsive demandé: mobile = colonne, tablette+ = 2 colonnes */}
        <div className="flex flex-col md:flex-row min-h-[calc(100vh-128px-140px)]">
          {/* Left Panel */}
          <div className="w-full md:w-1/2 bg-gray-800 md:border-r border-gray-700">
            {workflow === 'parameters' ? (
              <GenerationParameters
                onGenerate={handleGenerateFromParameters}
                isGenerating={isGenerating}
                imageDimensions={imageDimensions}
                onGetGenerateFunction={handleParametersGenerateFunctionReceived}
              />
            ) : workflow === 'poster' ? (
              <PosterGenerator
                onGenerate={handleGenerateFromPoster}
                isGenerating={isGenerating}
                onPromptGenerated={setGeneratedPrompt}
                generatedPrompt={generatedPrompt}
                imageDimensions={imageDimensions}
                onGetGenerateFunction={handlePosterGenerateFunctionReceived}
              />
            ) : workflow === 'cameraAngles' ? (
              <CameraAnglesGenerator
                onGenerate={handleGenerateFromCameraAngles}
                isGenerating={isGenerating}
                onGetGenerateFunction={handleCameraGenerateFunctionReceived}
              />
            ) : (
              <div className="p-6 text-center">
                <p className="text-gray-400">Ce workflow n'est pas encore disponible.</p>
                <p className="text-gray-500 text-sm mt-2">Sélectionnez un autre workflow pour commencer.</p>
              </div>
            )}
          </div>

          {/* Right Panel */}
          <div className="w-full md:w-1/2">
            <PreviewPanel
              currentImage={currentImage}
              savedGallery={savedGallery}
              isGenerating={isGenerating}
              onSelectImage={handleSelectFromGallery}
              onCopyParameters={handleCopyParameters}
              onSaveToGallery={handleSaveToGallery}
              generatedPrompt={generatedPrompt}
              onStartGeneration={
                (workflowsLoaded && workflowToUse)
                  ? () => {
                      if (workflow === 'poster' && typeof posterGenerateFn === 'function') posterGenerateFn();
                      else if (workflow === 'parameters' && typeof parametersGenerateFn === 'function') parametersGenerateFn();
                      else if (workflow === 'cameraAngles' && typeof cameraAnglesGenerateFn === 'function') cameraAnglesGenerateFn();
                      else console.warn('[APP_CONTENT] ⚠️ La fonction de génération n\'est pas encore prête.');
                    }
                  : undefined
              }
              onFormatChange={(width: number, height: number) => {
                console.log('[APP_CONTENT] 📐 Format changé:', width, 'x', height);
                setImageDimensions({ width, height });
              }}
            />
          </div>
        </div>
      </div>

      {showAdminNotice && !isConfigured && !isChecking && (
        <AdminSetupNotice onDismiss={() => setShowAdminNotice(false)} />
      )}
    </>
  );
}
