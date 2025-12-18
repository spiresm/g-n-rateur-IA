import { useState, useEffect, useRef, useCallback } from 'react';
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

export function AppContent() {
  const { user } = useAuth();
  const { isConfigured, isChecking } = useQuotaSystemStatus();

  const [workflow, setWorkflow] = useState<WorkflowType>('poster');
  const [workflowToUse, setWorkflowToUse] = useState<string | null>(null);
  const workflowToUseRef = useRef<string | null>(null);

  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [imageDimensions, setImageDimensions] = useState({ width: 1024, height: 1024 });

  // 🔒 États OBLIGATOIRES pour PreviewPanel
  const [currentImage, setCurrentImage] = useState<GeneratedImage | null>(null);
  const [savedGallery, setSavedGallery] = useState<GeneratedImage[]>([]);

  // 🔑 Fonctions de génération (callbacks enfants)
  const [posterGenerateFn, setPosterGenerateFn] = useState<(() => void) | null>(null);
  const [parametersGenerateFn, setParametersGenerateFn] = useState<(() => void) | null>(null);
  const [cameraAnglesGenerateFn, setCameraAnglesGenerateFn] = useState<(() => void) | null>(null);

  const {
    isGenerating,
    progress,
    error,
    generatedImage,
    startGeneration,
    clearError
  } = useImageGeneration();

  // -------------------------
  // Chargement des workflows
  // -------------------------
  useEffect(() => {
    (async () => {
      try {
        const data = await api.getWorkflows();
        const selected =
          data?.workflows?.includes('affiche.json')
            ? 'affiche.json'
            : data?.workflows?.[0];

        setWorkflowToUse(selected);
        workflowToUseRef.current = selected;
      } catch {
        setWorkflowToUse('affiche.json');
        workflowToUseRef.current = 'affiche.json';
      }
    })();
  }, []);

  // ----------------------------------
  // Reset des callbacks au changement
  // ----------------------------------
  useEffect(() => {
    if (workflow !== 'poster') setPosterGenerateFn(null);
    if (workflow !== 'parameters') setParametersGenerateFn(null);
    if (workflow !== 'cameraAngles') setCameraAnglesGenerateFn(null);
  }, [workflow]);

  // ----------------------------------
  // Enregistrement des callbacks
  // ✅ CORRECTION CLÉ (setState(() => fn))
  // ----------------------------------
  const handlePosterGenerateFunctionReceived = useCallback((fn: () => void) => {
    setPosterGenerateFn(() => fn);
  }, []);

  const handleParametersGenerateFunctionReceived = useCallback((fn: () => void) => {
    setParametersGenerateFn(() => fn);
  }, []);

  const handleCameraGenerateFunctionReceived = useCallback((fn: () => void) => {
    setCameraAnglesGenerateFn(() => fn);
  }, []);

  // -------------------------
  // Génération POSTER
  // -------------------------
  const handleGenerateFromPoster = useCallback(
    async (_params: PosterParams, gen: GenerationParams) => {
      if (!workflowToUseRef.current) return;

      clearError();
      await startGeneration(
        workflowToUseRef.current,
        {
          prompt: gen.prompt,
          negative_prompt: gen.negativePrompt,
          steps: gen.steps,
          cfg_scale: gen.cfg,
          seed: gen.seed,
          sampler_name: gen.sampler,
          scheduler: gen.scheduler,
          denoise: gen.denoise,
          width: gen.width,
          height: gen.height
        },
        user?.email
      );
    },
    [startGeneration, clearError, user]
  );

  // -------------------------
  // UI
  // -------------------------
  return (
    <>
      <Header />

      <ProgressOverlay isVisible={isGenerating} progress={progress} />

      {error && (
        <div className="fixed top-36 right-4 bg-red-600 text-white px-4 py-2 rounded z-50">
          {error}
        </div>
      )}

      <WorkflowCarousel selectedWorkflow={workflow} onSelectWorkflow={setWorkflow} />

      <div className="flex">
        {/* LEFT PANEL */}
        <div className="w-1/2">
          {workflow === 'poster' && (
            <PosterGenerator
              onGenerate={handleGenerateFromPoster}
              isGenerating={isGenerating}
              onPromptGenerated={setGeneratedPrompt}
              generatedPrompt={generatedPrompt}
              imageDimensions={imageDimensions}
              onGetGenerateFunction={handlePosterGenerateFunctionReceived}
            />
          )}

          {workflow === 'parameters' && (
            <GenerationParameters
              onGenerate={() => {}}
              isGenerating={isGenerating}
              imageDimensions={imageDimensions}
              onGetGenerateFunction={handleParametersGenerateFunctionReceived}
            />
          )}

          {workflow === 'cameraAngles' && (
            <CameraAnglesGenerator
              onGenerate={() => {}}
              isGenerating={isGenerating}
              onGetGenerateFunction={handleCameraGenerateFunctionReceived}
            />
          )}
        </div>

        {/* RIGHT PANEL */}
        <div className="w-1/2">
          <PreviewPanel
            currentImage={currentImage}
            savedGallery={savedGallery}
            isGenerating={isGenerating}
            generatedPrompt={generatedPrompt}
            onSelectImage={setCurrentImage}
            onCopyParameters={() => {}}
            onSaveToGallery={(img) =>
              setSavedGallery((prev) => [img, ...prev])
            }
            onStartGeneration={() => {
              if (workflow === 'poster' && posterGenerateFn) posterGenerateFn();
              if (workflow === 'parameters' && parametersGenerateFn) parametersGenerateFn();
              if (workflow === 'cameraAngles' && cameraAnglesGenerateFn) cameraAnglesGenerateFn();
            }}
            onFormatChange={(w, h) =>
              setImageDimensions({ width: w, height: h })
            }
          />
        </div>
      </div>

      {!isConfigured && !isChecking && (
        <AdminSetupNotice onDismiss={() => {}} />
      )}
    </>
  );
}
