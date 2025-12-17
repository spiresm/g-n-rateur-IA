import { useState, useEffect, useRef, useCallback } from 'react';
import { useImageGeneration } from '../hooks/useImageGeneration';
import { useAuth } from '../contexts/AuthContext';
import { useQuotaSystemStatus } from '../hooks/useQuotaSystemStatus';
import { api } from '../services/api';
import type { GenerationParams, PosterParams, CameraAnglesParams, GeneratedImage, WorkflowType } from '../App';

// Composants
import { Header } from './Header';
import { WorkflowCarousel } from './WorkflowCarousel';
import { GenerationParameters } from './GenerationParameters';
import { PosterGenerator } from './PosterGenerator';
import { CameraAnglesGenerator } from './CameraAnglesGenerator';
import { PreviewPanel } from './PreviewPanel';
import { ProgressOverlay } from './ProgressOverlay';
import { AdminSetupNotice } from './AdminSetupNotice';

export function AppContent() {
  const { user, token, isAuthenticated } = useAuth();
  const { isConfigured } = useQuotaSystemStatus();
  
  const [workflow, setWorkflow] = useState<WorkflowType>('poster');
  const [imageDimensions, setImageDimensions] = useState({ width: 1080, height: 1920 });
  const [currentImage, setCurrentImage] = useState<GeneratedImage | null>(null);
  const [savedGallery, setSavedGallery] = useState<GeneratedImage[]>([]);
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  
  const [workflowsLoaded, setWorkflowsLoaded] = useState(false);
  const workflowToUseRef = useRef<string | null>(null);
  
  const [posterGenerateFn, setPosterGenerateFn] = useState<(() => void) | null>(null);
  const [parametersGenerateFn, setParametersGenerateFn] = useState<(() => void) | null>(null);
  const [cameraAnglesGenerateFn, setCameraAnglesGenerateFn] = useState<(() => void) | null>(null);

  const { isGenerating, progress, error, generatedImage, startGeneration, clearError } = useImageGeneration();

  // CHARGEMENT WORKFLOWS
  useEffect(() => {
    const loadInitialData = async () => {
      if (!isAuthenticated || !user?.email || !token) return;
      try {
        const workflowsData = await api.getWorkflows();
        const workflowList = Array.isArray(workflowsData) ? workflowsData : (workflowsData?.workflows || []);
        if (workflowList.length > 0) {
          const selected = workflowList.find((wf: string) => wf === 'affiche.json') || workflowList[0];
          workflowToUseRef.current = selected;
          setWorkflowsLoaded(true);
        }
      } catch (err) {
        workflowToUseRef.current = 'affiche.json';
        setWorkflowsLoaded(true);
      }
    };
    loadInitialData();
  }, [isAuthenticated, user, token]);

  // CAPTURE IMAGE
  useEffect(() => {
    if (generatedImage && !isGenerating) {
      const newImage: GeneratedImage = {
        id: Date.now().toString(),
        imageUrl: generatedImage,
        params: {
          prompt: generatedPrompt || '',
          negativePrompt: '',
          steps: 30, cfg: 7, seed: -1, sampler: 'euler', scheduler: 'normal', denoise: 1.0,
          width: imageDimensions.width, height: imageDimensions.height,
        },
        timestamp: new Date(),
      };
      setCurrentImage(newImage);
    }
  }, [generatedImage, isGenerating, generatedPrompt, imageDimensions]);

  const handleMainGenerate = () => {
    if (workflow === 'poster') posterGenerateFn?.();
    else if (workflow === 'parameters') parametersGenerateFn?.();
    else if (workflow === 'cameraAngles') cameraAnglesGenerateFn?.();
  };

  // HANDLERS
  const handleGenerateFromPoster = useCallback(async (_posterParams: PosterParams, genParams: GenerationParams) => {
    if (!workflowToUseRef.current) return;
    clearError();
    await startGeneration(workflowToUseRef.current, { ...genParams, user_menu_prompt: genParams.prompt });
  }, [startGeneration, clearError]);

  const handleGenerateFromParameters = useCallback(async (params: GenerationParams) => {
    if (!workflowToUseRef.current) return;
    clearError();
    await startGeneration(workflowToUseRef.current, params);
  }, [startGeneration, clearError]);

  return (
    <div className="bg-[#0f1117] min-h-screen text-white">
      <Header />
      <ProgressOverlay isVisible={isGenerating} progress={progress} label="Création de votre chef-d'œuvre..." />

      <div className="pt-24 sm:pt-32">
        <WorkflowCarousel selectedWorkflow={workflow} onSelectWorkflow={(w) => setWorkflow(w as WorkflowType)} />
        
        <div className="flex flex-col lg:flex-row border-t border-gray-800 bg-[#0c0e14]">
          {/* GAUCHE */}
          <div className="w-full lg:w-1/2 bg-gray-900/10 lg:border-r border-gray-800">
            {workflow === 'poster' && <PosterGenerator onGenerate={handleGenerateFromPoster} isGenerating={isGenerating} onPromptGenerated={setGeneratedPrompt} generatedPrompt={generatedPrompt} imageDimensions={imageDimensions} onGetGenerateFunction={(fn) => setPosterGenerateFn(() => fn)} />}
            {workflow === 'parameters' && <GenerationParameters onGenerate={handleGenerateFromParameters} isGenerating={isGenerating} imageDimensions={imageDimensions} onGetGenerateFunction={(fn) => setParametersGenerateFn(() => fn)} />}
          </div>

          {/* DROITE */}
          <div className="w-full lg:w-1/2 flex flex-col bg-[#0a0c10]">
            
            {/* PANNEAU DE COMMANDE AVEC DESIGN FORMATS AMÉLIORÉ */}
            <div className="p-8 border-b border-gray-800 bg-gray-900/60 backdrop-blur-xl sticky top-0 z-10 shadow-2xl">
              <div className="max-w-xl mx-auto flex flex-col gap-8">
                
                <button 
                  onClick={handleMainGenerate}
                  disabled={isGenerating || !workflowsLoaded}
                  className="w-full bg-[#FFD700] hover:bg-[#FFC400] text-black font-black py-5 rounded-2xl text-2xl uppercase tracking-tighter transition-all active:scale-[0.98] disabled:opacity-30 shadow-[0_15px_45px_rgba(255,215,0,0.2)]"
                >
                  {isGenerating ? 'Génération...' : "Lancer la création"}
                </button>

                {/* SÉLECTEURS DE FORMATS DESIGNÉS */}
                <div className="flex justify-between items-center px-4">
                  {[
                    { id: 'square', label: 'Carré', w: 1024, h: 1024, style: 'w-10 h-10 rounded-lg' },
                    { id: 'landscape', label: 'Paysage', w: 1216, h: 832, style: 'w-14 h-9 rounded-md' },
                    { id: 'portrait', label: 'Portrait', w: 832, h: 1216, style: 'w-9 h-14 rounded-md' }
                  ].map((f) => {
                    const isActive = imageDimensions.width === f.w;
                    return (
                      <button
                        key={f.id}
                        onClick={() => setImageDimensions({ width: f.w, height: f.h })}
                        className={`group flex flex-col items-center gap-3 transition-all duration-300 ${isActive ? 'scale-110' : 'opacity-40 hover:opacity-100'}`}
                      >
                        <div className={`
                          ${f.style} border-2 transition-all duration-500 flex items-center justify-center
                          ${isActive 
                            ? 'bg-purple-600/30 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.4)] rotate-0' 
                            : 'bg-transparent border-gray-600 rotate-3 group-hover:rotate-0'}
                        `}>
                           {isActive && <div className="w-2 h-2 bg-white rounded-full animate-pulse" />}
                        </div>
                        <span className={`text-[10px] font-black tracking-[0.2em] uppercase ${isActive ? 'text-purple-400' : 'text-gray-500'}`}>
                          {f.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex-1">
              <PreviewPanel currentImage={currentImage} savedGallery={savedGallery} isGenerating={isGenerating} onSelectImage={setCurrentImage} onSaveToGallery={(img) => setSavedGallery([img, ...savedGallery])} generatedPrompt={generatedPrompt} />
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="fixed bottom-10 right-10 bg-red-600 text-white px-8 py-4 rounded-2xl shadow-2xl z-[100] animate-bounce">
          <button onClick={clearError} className="font-bold flex items-center gap-3">
            <span>{error}</span> <span className="bg-black/20 p-1 rounded">✕</span>
          </button>
        </div>
      )}
      {!isConfigured && <AdminSetupNotice onDismiss={() => {}} />}
    </div>
  );
}
