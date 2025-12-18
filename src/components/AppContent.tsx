import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useImageGeneration } from '../hooks/useImageGeneration';
import { useAuth } from '../contexts/AuthContext';
import { useQuotaSystemStatus } from '../hooks/useQuotaSystemStatus';
import { api } from '../services/api';

import type {
  GenerationParams, PosterParams, CameraAnglesParams,
  GeneratedImage, WorkflowType
} from '../App';

import { Header } from './Header';
import { WorkflowCarousel } from './WorkflowCarousel';
import { GenerationParameters } from './GenerationParameters';
import { PosterGenerator } from './PosterGenerator';
import { CameraAnglesGenerator } from './CameraAnglesGenerator';
import { PreviewPanel } from './PreviewPanel';
import { ProgressOverlay } from './ProgressOverlay';

export function AppContent() {
  const { user } = useAuth();
  const { isConfigured } = useQuotaSystemStatus();

  const [workflow, setWorkflow] = useState<WorkflowType>('poster');
  const [currentImage, setCurrentImage] = useState<GeneratedImage | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [workflowToUse, setWorkflowToUse] = useState<string | null>(null);
  const [workflowsLoaded, setWorkflowsLoaded] = useState(false);

  // Fonctions de génération stockées
  const [posterGenFn, setPosterGenFn] = useState<(() => void) | null>(null);
  const [paramsGenFn, setParamsGenFn] = useState<(() => void) | null>(null);
  const [cameraGenFn, setCameraGenFn] = useState<(() => void) | null>(null);

  const { startGeneration, isGenerating, progress, error, generatedImage, clearError } = useImageGeneration();

  // Charger les noms de workflows au démarrage
  useEffect(() => {
    api.getWorkflows().then(data => {
      const selected = data?.workflows?.find((wf: string) => wf === 'affiche.json') || data?.workflows?.[0] || 'affiche.json';
      setWorkflowToUse(selected);
      setWorkflowsLoaded(true);
    }).catch(() => {
      setWorkflowToUse('affiche.json');
      setWorkflowsLoaded(true);
    });
  }, []);

  // ✅ CORRECTION : Ne s'exécute que SI une nouvelle image arrive (pas au chargement)
  useEffect(() => {
    if (generatedImage) {
      const newImg: GeneratedImage = {
        id: Date.now().toString(),
        imageUrl: generatedImage,
        params: { prompt: generatedPrompt } as any,
        timestamp: new Date()
      };
      setCurrentImage(newImg);
    }
  }, [generatedImage]); // On ne surveille QUE generatedImage

  const handleGenerate = useCallback(async (params: any) => {
    if (!startGeneration || !workflowToUse || isGenerating) return;
    await startGeneration(workflowToUse, params, user?.email || '');
  }, [startGeneration, workflowToUse, isGenerating, user]);

  return (
    <>
      <Header />
      <ProgressOverlay isVisible={isGenerating} progress={progress} label="Création de votre chef-d'œuvre..." />
      
      {error && (
        <div className="fixed top-36 right-4 bg-red-600 text-white px-6 py-3 rounded-lg z-50 flex items-center gap-3 shadow-2xl">
          <span>{error}</span>
          <button onClick={clearError} className="bg-white/20 p-1 rounded">✕</button>
        </div>
      )}

      <div className="pt-32">
        <WorkflowCarousel selectedWorkflow={workflow} onSelectWorkflow={setWorkflow} />

        <div className="flex flex-col md:flex-row min-h-[calc(100vh-250px)]">
          <div className="w-full md:w-1/2 bg-gray-900 border-r border-gray-800">
            {workflow === 'poster' ? (
              <PosterGenerator
                onGenerate={(_p: any, g: any) => handleGenerate(g)}
                isGenerating={isGenerating}
                onPromptGenerated={setGeneratedPrompt}
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
                onGenerate={handleGenerate}
                isGenerating={isGenerating}
                onGetGenerateFunction={setCameraGenFn}
              />
            )}
          </div>

          <div className="w-full md:w-1/2 bg-gray-950">
            <PreviewPanel
              currentImage={currentImage}
              isGenerating={isGenerating}
              onStartGeneration={workflowsLoaded ? () => {
                if (workflow === 'poster') posterGenFn?.();
                else if (workflow === 'parameters') paramsGenFn?.();
                else cameraGenFn?.();
              } : undefined}
            />
          </div>
        </div>
      </div>
    </>
  );
}
