import { useState, useEffect, useRef, useCallback } from 'react';
import { useImageGeneration } from '../hooks/useImageGeneration';
import { useAuth } from '../contexts/AuthContext';
import { useQuotaSystemStatus } from '../hooks/useQuotaSystemStatus';
import { api } from '../services/api';

import type {
  GenerationParams,
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
  const [showAdminNotice, setShowAdminNotice] = useState(false);

  const [workflow, setWorkflow] = useState<WorkflowType>('poster');
  const [currentImage, setCurrentImage] = useState<GeneratedImage | null>(null);
  const [savedGallery, setSavedGallery] = useState<GeneratedImage[]>([]);
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [workflowToUse, setWorkflowToUse] = useState<string | null>(null);
  const [workflowsLoaded, setWorkflowsLoaded] = useState(false);

  /* ✅ SOURCE UNIQUE DE VÉRITÉ FORMAT IMAGE */
  const [imageDimensions, setImageDimensions] = useState({
    width: 1080,
    height: 1920, // portrait par défaut
  });

  /* refs génération */
  const posterGenerateFn = useRef<(() => void) | null>(null);
  const parametersGenerateFn = useRef<(() => void) | null>(null);
  const cameraAnglesGenerateFn = useRef<(() => void) | null>(null);

  const { 
    startGeneration, 
    isGenerating, 
    progress, 
    error, 
    generatedImage, 
    clearError 
  } = useImageGeneration();

  /* -------------------------------------------------- */
  /* Chargement workflows */
  useEffect(() => {
    api.getWorkflows()
      .then(data => {
        if (data?.workflows?.length > 0) {
          const selected =
            data.workflows.find((wf: string) => wf === 'affiche.json')
            || data.workflows[0];
          setWorkflowToUse(selected);
        }
        setWorkflowsLoaded(true);
      })
      .catch(() => {
        setWorkflowToUse('affiche.json');
        setWorkflowsLoaded(true);
      });
  }, []);

  /* -------------------------------------------------- */
  /* Réception image finale */
  useEffect(() => {
    if (generatedImage && !isGenerating) {
      const newImg: GeneratedImage = {
        id: Date.now().toString(),
        imageUrl: generatedImage,
        params: {
          final_prompt: generatedPrompt,
          width: imageDimensions.width,
          height: imageDimensions.height,
        } as any,
        timestamp: new Date(),
      };
      setCurrentImage(newImg);
    }
  }, [generatedImage, isGenerating, generatedPrompt, imageDimensions]);

  /* -------------------------------------------------- */
  /* Handler génération CENTRALISÉ */
  const handleGenerateAction = useCallback(
    async (params: any) => {
      if (!startGeneration || !workflowToUse || isGenerating) return;

      const finalParams = {
        ...params,
        width: imageDimensions.width,
        height: imageDimensions.height,
      };

      console.log(
        '[GENERATION]',
        finalParams.width,
        finalParams.height
      );

      await startGeneration(workflowToUse, finalParams);
    },
    [startGeneration, workflowToUse, isGenerating, imageDimensions]
  );

  /* -------------------------------------------------- */
  return (
    <>
      <Header />
      <ProgressOverlay
        isVisible={isGenerating}
        progress={progress}
        label="Génération en cours..."
      />

      {error && (
        <div className="fixed top-36 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-xl z-50 flex items-center gap-3">
          <span>{error}</span>
          <button
            onClick={clearError}
            className="hover:opacity-70 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      <div className="pt-32">
        <WorkflowCarousel
          selectedWorkflow={workflow}
          onSelectWorkflow={setWorkflow}
        />

        <div className="flex flex-col md:flex-row min-h-[calc(100vh-268px)]">
          <div className="w-full md:w-1/2 bg-gray-800 border-r border-gray-700">
            {workflow === 'poster' ? (
              <PosterGenerator
                onGenerate={(_p: any, g: any) => handleGenerateAction(g)}
                isGenerating={isGenerating}
                onPromptGenerated={setGeneratedPrompt}
                onGetGenerateFunction={(fn: any) => {
                  posterGenerateFn.current = fn;
                }}
                /* ✅ FIX CRITIQUE */
                imageDimensions={imageDimensions}
                setImageDimensions={setImageDimensions}
              />
            ) : workflow === 'parameters' ? (
              <GenerationParameters
                onGenerate={handleGenerateAction}
                isGenerating={isGenerating}
                onGetGenerateFunction={(fn: any) => {
                  parametersGenerateFn.current = fn;
                }}
              />
            ) : (
              <CameraAnglesGenerator
                onGenerate={handleGenerateAction}
                isGenerating={isGenerating}
                onGetGenerateFunction={(fn: any) => {
                  cameraAnglesGenerateFn.current = fn;
                }}
              />
            )}
          </div>

          <div className="w-full md:w-1/2 bg-black">
            <PreviewPanel
              currentImage={currentImage}
              savedGallery={savedGallery}
              isGenerating={isGenerating}
              onSelectImage={setCurrentImage}
              onSaveToGallery={(img) =>
                setSavedGallery(prev => [img, ...prev])
              }
              onStartGeneration={() => {
                if (workflow === 'poster') posterGenerateFn.current?.();
                else if (workflow === 'parameters') parametersGenerateFn.current?.();
                else cameraAnglesGenerateFn.current?.();
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
