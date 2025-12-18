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
  const [savedGallery, setSavedGallery] = useState<GeneratedImage[]>([]);
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [workflowToUse, setWorkflowToUse] = useState<string | null>(null);
  const [workflowsLoaded, setWorkflowsLoaded] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({ width: 1024, height: 1024 });

  const workflowToUseRef = useRef<string | null>(null);

  // Références pour les fonctions de génération des composants enfants
  const [posterGenFn, setPosterGenFn] = useState<(() => void) | null>(null);
  const [paramsGenFn, setParamsGenFn] = useState<(() => void) | null>(null);
  const [cameraGenFn, setCameraGenFn] = useState<(() => void) | null>(null);

  /**
   * ✅ ADAPTATEUR ROBUSTE
   * Sécurise l'accès aux fonctions du hook useImageGeneration
   */
  const imageGenRaw = useImageGeneration() as AnyObj;

  const startGeneration = useMemo(() => {
    return imageGenRaw?.startGeneration ?? imageGenRaw?.generateImage ?? imageGenRaw?.generate ?? null;
  }, [imageGenRaw]);

  const clearError = useMemo(() => {
    return typeof imageGenRaw?.clearError === 'function' ? imageGenRaw.clearError : (() => {});
  }, [imageGenRaw]);

  const isGenerating = Boolean(imageGenRaw?.isGenerating ?? imageGenRaw?.loading ?? false);
  const progress = imageGenRaw?.progress ?? 0;
  const error = imageGenRaw?.error ?? null;
  const generatedImage = imageGenRaw?.generatedImage ?? imageGenRaw?.imageUrl ?? null;

  // Chargement des workflows
  useEffect(() => {
    const loadWorkflows = async () => {
      try {
        const data = await api.getWorkflows();
        const selected = data?.workflows?.find((wf: string) => wf === 'affiche.json') || data?.workflows?.[0] || 'affiche.json';
        setWorkflowToUse(selected);
        workflowToUseRef.current = selected;
      } catch (err) {
        setWorkflowToUse('affiche.json');
        workflowToUseRef.current = 'affiche.json';
      } finally {
        setWorkflowsLoaded(true);
      }
    };
    loadWorkflows();
  }, []);

  // Mise à jour de l'image actuelle après génération
  useEffect(() => {
    if (generatedImage && !isGenerating) {
      const newImg: GeneratedImage = {
        id: Date.now().toString(),
        imageUrl: generatedImage,
        params: { prompt: generatedPrompt } as any,
        timestamp: new Date()
      };
      setCurrentImage(newImg);
    }
  }, [generatedImage, isGenerating, generatedPrompt]);

  // Handler générique de génération
  const handleGenerate = useCallback(async (params: any) => {
    if (!startGeneration || !workflowToUseRef.current) return;
    clearError();
    await startGeneration(workflowToUseRef.current, params, user?.email);
  }, [startGeneration, clearError, user]);

  return (
    <>
      <Header />
      <ProgressOverlay isVisible={isGenerating} progress={progress} label="Génération en cours…" />
      
      {error && (
        <div className="fixed top-36 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-3">
          <span>{String(error)}</span>
          <button onClick={clearError} className="p-1 hover:bg-red-700 rounded">✕</button>
        </div>
      )}

      <div className="pt-32">
        <WorkflowCarousel selectedWorkflow={workflow} onSelectWorkflow={setWorkflow} />

        <div className="flex flex-col md:flex-row min-h-[calc(100vh-250px)]">
          <div className="w-full md:w-1/2 bg-gray-800 border-r border-gray-700">
            {workflow === 'poster' ? (
              <PosterGenerator
                onGenerate={(p, g) => handleGenerate({...g, ...p})}
                isGenerating={isGenerating}
                onPromptGenerated={setGeneratedPrompt}
                generatedPrompt={generatedPrompt}
                onGetGenerateFunction={setPosterGenFn}
              />
            ) : workflow === 'parameters' ? (
              <GenerationParameters
                onGenerate={handleGenerate}
                isGenerating={isGenerating}
                onGetGenerateFunction={setParamsGenFn}
              />
            ) : (
              <CameraAnglesGenerator
                onGenerate={(p) => handleGenerate(p)}
                isGenerating={isGenerating}
                onGetGenerateFunction={setCameraGenFn}
              />
            )}
          </div>

          <div className="w-full md:w-1/2">
            <PreviewPanel
              currentImage={currentImage}
              savedGallery={savedGallery}
              isGenerating={isGenerating}
              onSelectImage={setCurrentImage}
              onSaveToGallery={(img) => setSavedGallery(prev => [img, ...prev])}
              onStartGeneration={workflowsLoaded ? () => {
                if (workflow === 'poster') posterGenFn?.();
                else if (workflow === 'parameters') paramsGenFn?.();
                else cameraGenFn?.();
              } : undefined}
              onFormatChange={(w, h) => setImageDimensions({ width: w, height: h })}
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
