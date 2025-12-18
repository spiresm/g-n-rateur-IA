import { useState, useEffect, useRef, useCallback } from 'react';
import { useImageGeneration } from '../hooks/useImageGeneration';
import { useAuth } from '../contexts/AuthContext';
import { useQuotaSystemStatus } from '../hooks/useQuotaSystemStatus';
import { api } from '../services/api';

import type {
  GenerationParams,
  PosterParams,
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

  // -------------------------
  // State
  // -------------------------
  const [workflow, setWorkflow] = useState<WorkflowType>('poster');
  const [workflowToUse, setWorkflowToUse] = useState<string | null>(null);
  const workflowToUseRef = useRef<string | null>(null);

  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [imageDimensions, setImageDimensions] = useState({ width: 1024, height: 1024 });

  const [currentImage, setCurrentImage] = useState<GeneratedImage | null>(null);
  const [savedGallery, setSavedGallery] = useState<GeneratedImage[]>([]);

  // -------------------------
  // Refs callbacks (SAFE)
  // -------------------------
  const posterGenerateRef = useRef<null | (() => void)>(null);
  const parametersGenerateRef = useRef<null | (() => void)>(null);
  const cameraAnglesGenerateRef = useRef<null | (() => void)>(null);

  const {
    isGenerating,
    progress,
    error,
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
            : data?.workflows?.[0] ?? 'affiche.json';

        setWorkflowToUse(selected);
        workflowToUseRef.current = selected;
      } catch {
        setWorkflowToUse('affiche.json');
        workflowToUseRef.current = 'affiche.json';
      }
    })();
  }, []);

  // -------------------------
  // Enregistrement callbacks
  // -------------------------
  const handlePosterGenerateFunctionReceived = useCallback((fn: unknown) => {
    if (typeof fn === 'function') posterGenerateRef.current = fn;
  }, []);

  const handleParametersGenerateFunctionReceived = useCallback((fn: unknown) => {
    if (typeof fn === 'function') parametersGenerateRef.current = fn;
  }, []);

  const handleCameraGenerateFunctionReceived = useCallback((fn: unknown) => {
    if (typeof fn === 'function') cameraAnglesGenerateRef.current = fn;
  }, []);

  // -------------------------
  // Génération POSTER
  // -------------------------
  const handleGenerateFromPoster = useCallback(
    async (_params: PosterParams, gen: GenerationParams) => {
      const wf = workflowToUseRef.current;
      if (!wf) return;

      clearError();
      await startGeneration(
        wf,
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

      {/* Décalage sous le Header fixed */}
      <div className="pt-24 sm:pt-32">
        <WorkflowCarousel
          selectedWorkflow={workflow}
          onSelectWorkflow={setWorkflow}
        />

        {/* ✅ RESPONSIVE LAYOUT */}
        <div className="flex flex-col md:flex-row min-h-[calc(100vh-128px)]">
          {/* LEFT – MENUS */}
          <div className="w-full md:w-1/2 bg-gray-800 md:border-r border-gray-700">
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

          {/* RIGHT – PREVIEW */}
          <div className="w-full md:w-1/2">
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
                if (workflow === 'poster') posterGenerateRef.current?.();
                else if (workflow === 'parameters') parametersGenerateRef.current?.();
                else if (workflow === 'cameraAngles') cameraAnglesGenerateRef.current?.();
              }}
              onFormatChange={(w, h) =>
                setImageDimensions({ width: w, height: h })
              }
            />
          </div>
        </div>
      </div>

      {!isConfigured && !isChecking && (
        <AdminSetupNotice onDismiss={() => {}} />
      )}
    </>
  );
}
