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

  /* =====================================================
     🔁 WORKFLOW STATE
     ===================================================== */
  const [workflow, setWorkflow] = useState<WorkflowType>('poster');
  const [workflowToUse, setWorkflowToUse] = useState('affiche.json');

  /* =====================================================
     🖼️ IMAGE STATE
     ===================================================== */
  const [currentImage, setCurrentImage] = useState<GeneratedImage | null>(null);
  const [savedGallery, setSavedGallery] = useState<GeneratedImage[]>([]);
  const [generatedPrompt, setGeneratedPrompt] = useState('');

  const imageDimensions = { width: 1080, height: 1920 };

  const [showAdminNotice, setShowAdminNotice] = useState(false);

  /* =====================================================
     🔗 GENERATE FUNCTIONS REFS
     ===================================================== */
  const posterGenerateFn = useRef<(() => void) | null>(null);
  const parametersGenerateFn = useRef<(() => void) | null>(null);
  const cameraAnglesGenerateFn = useRef<(() => void) | null>(null);

  /* =====================================================
     ⚙️ GENERATION HOOK
     ===================================================== */
  const {
    startGeneration,
    isGenerating,
    progress,
    error,
    generatedImage,
    clearError,
  } = useImageGeneration();

  /* =====================================================
     📦 LOAD WORKFLOW JSON
     ===================================================== */
  useEffect(() => {
    api.getWorkflows()
      .then(() => {
        if (workflow === 'cameraAngles') {
          setWorkflowToUse('multiple-angles.json');
        } else {
          setWorkflowToUse('affiche.json');
        }
      })
      .catch(() => {
        setWorkflowToUse(
          workflow === 'cameraAngles'
            ? 'multiple-angles.json'
            : 'affiche.json'
        );
      });
  }, [workflow]);

  /* =====================================================
     🖼️ IMAGE READY
     ===================================================== */
  useEffect(() => {
    if (generatedImage && !isGenerating) {
      setCurrentImage({
        id: Date.now().toString(),
        imageUrl: generatedImage,
        params: {
          final_prompt: generatedPrompt,
          width: imageDimensions.width,
          height: imageDimensions.height,
          user: user?.email,
        } as any,
        timestamp: new Date(),
      });
    }
  }, [generatedImage, isGenerating, generatedPrompt, user?.email]);

  /* =====================================================
     🚀 GENERATE HANDLER
     ===================================================== */
  const handleGenerateAction = useCallback(
    async (params: any) => {
      if (isGenerating || !workflowToUse) return;

      const finalParams =
        workflow === 'cameraAngles'
          ? params // ⚠️ PAS de width/height ici
          : {
              ...params,
              width: imageDimensions.width,
              height: imageDimensions.height,
            };

      console.log('[APP] GENERATE →', workflowToUse, finalParams);

      await startGeneration(workflowToUse, finalParams);
    },
    [startGeneration, workflowToUse, isGenerating, workflow]
  );

  /* =====================================================
     🧠 REGISTER GENERATORS
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

  /* =====================================================
     🧩 UI
     ===================================================== */
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
          <button onClick={clearError} className="font-bold hover:opacity-70">
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

          {/* ================= LEFT COLUMN ================= */}
          <div className="w-full md:w-1/2 bg-gray-800 border-r border-gray-700">
            {workflow === 'poster' && (
              <PosterGenerator
                onGenerate={(_, genParams) => handleGenerateAction(genParams)}
                isGenerating={isGenerating}
                onPromptGenerated={setGeneratedPrompt}
                generatedPrompt={generatedPrompt}
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

            {workflow === 'cameraAngles' && (
              <CameraAnglesGenerator
                onGenerate={handleGenerateAction}
                isGenerating={isGenerating}
                onGetGenerateFunction={registerCameraAnglesGenerateFn}
              />
            )}
          </div>

          {/* ================= RIGHT COLUMN ================= */}
          <div
            className={`w-full md:w-1/2 ${
              workflow === 'cameraAngles' ? 'bg-gray-900' : 'bg-black'
            }`}
          >
            <PreviewPanel
              currentImage={currentImage}
              savedGallery={savedGallery}
              isGenerating={isGenerating}
              onSelectImage={setCurrentImage}
              onSaveToGallery={(img) =>
                setSavedGallery((prev) => [img, ...prev])
              }
              onStartGeneration={() => {
                if (workflow === 'poster') posterGenerateFn.current?.();
                else if (workflow === 'parameters')
                  parametersGenerateFn.current?.();
                else if (workflow === 'cameraAngles')
                  cameraAnglesGenerateFn.current?.();
              }}
              mode={workflow === 'cameraAngles' ? 'camera_angles' : 'poster'}
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
