import { useState, useEffect, useRef, useCallback } from 'react';
import { useImageGeneration } from '../hooks/useImageGeneration';
import { useAuth } from '../contexts/AuthContext';
import { useQuotaSystemStatus } from '../hooks/useQuotaSystemStatus';
import { api } from '../services/api';

import type { GeneratedImage, WorkflowType } from '../App';

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
  const [workflowToUse, setWorkflowToUse] = useState<string>('affiche.json');

  const [currentImage, setCurrentImage] = useState<GeneratedImage | null>(null);
  const [savedGallery, setSavedGallery] = useState<GeneratedImage[]>([]);
  const [generatedPrompt, setGeneratedPrompt] = useState('');

  // ✅ Dimensions utilisées UNIQUEMENT pour affiche / parameters
  const [imageDimensions, setImageDimensions] = useState({
    width: 1080,
    height: 1920,
  });

  // 🔗 Références vers les fonctions "Générer"
  const posterGenerateFn = useRef<(() => void) | null>(null);
  const parametersGenerateFn = useRef<(() => void) | null>(null);
  const cameraAnglesGenerateFn = useRef<(() => void) | null>(null);

  const {
    startGeneration,
    isGenerating,
    progress,
    error,
    generatedImage,
    clearError,
  } = useImageGeneration();

  /* =====================================================
     🔄 WORKFLOW ↔ JSON
     ===================================================== */
  useEffect(() => {
    if (workflow === 'poster') {
      setWorkflowToUse('affiche.json');
    } else if (workflow === 'parameters') {
      setWorkflowToUse('parameters.json');
    } else if (workflow === 'camera_angles') {
      setWorkflowToUse('multiple-angles.json');
    }
  }, [workflow]);

  /* =====================================================
     📦 RÉCEPTION IMAGE GÉNÉRÉE
     ===================================================== */
  useEffect(() => {
    if (generatedImage && !isGenerating) {
      const img: GeneratedImage = {
        id: Date.now().toString(),
        imageUrl: generatedImage,
        params: {
          workflow,
          final_prompt: generatedPrompt,
          ...(workflow !== 'camera_angles'
            ? {
                width: imageDimensions.width,
                height: imageDimensions.height,
              }
            : {}),
          user: user?.email,
        } as any,
        timestamp: new Date(),
      };

      setCurrentImage(img);
    }
  }, [
    generatedImage,
    isGenerating,
    workflow,
    generatedPrompt,
    imageDimensions,
    user?.email,
  ]);

  /* =====================================================
     🚀 GÉNÉRATION CENTRALE
     ===================================================== */
  const handleGenerateAction = useCallback(
    async (params: any) => {
      if (!workflowToUse || isGenerating) return;

      let finalParams = params;

      // ❗ PAS de width/height pour multiple-angles.json
      if (workflow !== 'camera_angles') {
        finalParams = {
          ...params,
          width: imageDimensions.width,
          height: imageDimensions.height,
        };
      }

      console.log('[APP] Workflow:', workflowToUse);
      console.log('[APP] Params envoyés:', finalParams);

      await startGeneration(workflowToUse, finalParams);
    },
    [startGeneration, workflowToUse, workflow, isGenerating, imageDimensions]
  );

  /* =====================================================
     🧩 REGISTER FUNCTIONS (STABLE)
     ===================================================== */
  const registerPosterGenerateFn = useCallback((fn: () => void) => {
    posterGenerateFn.current = fn;
  }, []);

  const registerParametersGenerateFn = useCallback((fn: () => void) => {
    parametersGenerateFn.current = fn;
  }, []);

  const registerCameraAnglesGenerateFn = useCallback((fn: () => void) => {
    cameraAnglesGenerateFn.current = fn;
  }, []);

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
          {/* ================= LEFT ================= */}
          <div className="w-full md:w-1/2 bg-gray-800 border-r border-gray-700">
            {workflow === 'poster' && (
              <PosterGenerator
                onGenerate={(_, params) => handleGenerateAction(params)}
                isGenerating={isGenerating}
                generatedPrompt={generatedPrompt}
                onPromptGenerated={setGeneratedPrompt}
                imageDimensions={imageDimensions}
                onGetGenerateFunction={registerPosterGenerateFn}
              />
            )}

            {workflow === 'parameters' && (
              <GenerationParameters
                onGenerate={handleGenerateAction}
                isGenerating={isGenerating}
                onGetGenerateFunction={registerParametersGenerateFn}
              />
            )}

            {workflow === 'camera_angles' && (
              <CameraAnglesGenerator
                onGenerate={handleGenerateAction}
                isGenerating={isGenerating}
                onGetGenerateFunction={registerCameraAnglesGenerateFn}
              />
            )}
          </div>

          {/* ================= RIGHT ================= */}
          <div className="w-full md:w-1/2 bg-black">
            <PreviewPanel
              currentImage={currentImage}
              savedGallery={savedGallery}
              isGenerating={isGenerating}
              onSelectImage={setCurrentImage}
              onSaveToGallery={(img) =>
                setSavedGallery((prev) => [img, ...prev])
              }
              workflow={workflow} // 👈 clé pour adapter l’UI
              onStartGeneration={() => {
                if (workflow === 'poster') posterGenerateFn.current?.();
                else if (workflow === 'parameters')
                  parametersGenerateFn.current?.();
                else if (workflow === 'camera_angles')
                  cameraAnglesGenerateFn.current?.();
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
