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
  
  // États de l'interface
  const [workflow, setWorkflow] = useState<WorkflowType>('poster');
  const [imageDimensions, setImageDimensions] = useState({ width: 1080, height: 1920 });
  const [currentImage, setCurrentImage] = useState<GeneratedImage | null>(null);
  const [savedGallery, setSavedGallery] = useState<GeneratedImage[]>([]);
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  
  // États techniques
  const [workflowsLoaded, setWorkflowsLoaded] = useState(false);
  const workflowToUseRef = useRef<string | null>(null);
  
  // Refs pour lier le bouton jaune aux formulaires de gauche
  const generateFunctionsRef = useRef<Record<string, () => void>>({});

  const { isGenerating, progress, error, generatedImage, startGeneration, clearError } = useImageGeneration();

  // 1. Initialisation des Workflows
  useEffect(() => {
    const loadInitialData = async () => {
      if (!isAuthenticated || !token) return;
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
  }, [isAuthenticated, token]);

  // 2. Capture de l'image générée
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
      setSavedGallery(prev => [newImage, ...prev]);
    }
  }, [generatedImage, isGenerating, generatedPrompt, imageDimensions]);

  // 3. Action du Bouton Jaune
  const handleMainGenerate = () => {
    const activeFn = generateFunctionsRef.current[workflow];
    if (activeFn) {
      activeFn();
    } else {
      console.warn("Fonction de génération non trouvée pour :", workflow);
    }
  };

  // Handlers API
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

  const handleGenerateFromCameraAngles = useCallback(async (cameraAnglesParams: CameraAnglesParams) => {
    clearError();
    await startGeneration('multiple-angles.json', cameraAnglesParams);
  }, [startGeneration, clearError]);

  return (
    <div className="bg-[#0f1117] min-h-screen text-white">
      <Header />
      <ProgressOverlay isVisible={isGenerating} progress={progress} label="Création en cours..." />

      <div className="pt-24 sm:pt-32">
        <WorkflowCarousel selectedWorkflow={workflow} onSelectWorkflow={(w) => setWorkflow(w as WorkflowType)} />
        
        <div className="flex flex-col lg:flex-row border-t border-gray-800 bg-[#0c0e14]">
          
          {/* GAUCHE : RÉGLAGES (Contient l'upload image dans CameraAngles) */}
          <div className="w-full lg:w-1/2 bg-gray-900/10 lg:border-r border-gray-800">
            <div className="p-4 sm:p-8">
              {workflow === 'poster' && (
                <PosterGenerator 
                  onGenerate={handleGenerateFromPoster} 
                  isGenerating={isGenerating} 
                  onPromptGenerated={setGeneratedPrompt} 
                  generatedPrompt={generatedPrompt} 
                  imageDimensions={imageDimensions}
                  onGetGenerateFunction={(fn) => { generateFunctionsRef.current['poster'] = fn; }}
                />
              )}
              {workflow === 'parameters' && (
                <GenerationParameters 
                  onGenerate={handleGenerateFromParameters} 
                  isGenerating={isGenerating} 
                  imageDimensions={imageDimensions}
                  onGetGenerateFunction={(fn) => { generateFunctionsRef.current['parameters'] = fn; }}
                />
              )}
              {workflow === 'cameraAngles' && (
                <CameraAnglesGenerator 
                  onGenerate={handleGenerateFromCameraAngles} 
                  isGenerating={isGenerating}
                  onGetGenerateFunction={(fn) => { generateFunctionsRef.current['cameraAngles'] = fn; }}
                />
              )}
            </div>
          </div>

          {/* DROITE : STUDIO ACTIONS (Formats + Bouton Jaune) */}
          <div className="w-full lg:w-1/2 flex flex-col bg-[#0a0c10]">
            
            <div className="p-8 border-b border-gray-800 bg-[#0c0e14]/90 backdrop-blur-2xl sticky top-0 z-10 shadow-xl">
              <div className="max-w-xl mx-auto flex flex-col gap-10">
                
                {/* 1. SÉLECTEURS DE FORMATS (NETS, SANS VOILE) */}
                <div className="flex justify-around items-center px-4">
                  {[
                    { id: 'square', label: 'Carré', w: 1024, h: 1024, style: 'w-10 h-10 rounded-xl' },
                    { id: 'landscape', label: 'Paysage', w: 1216, h: 832, style: 'w-14 h-9 rounded-lg' },
                    { id: 'portrait', label: 'Portrait', w: 832, h: 1216, style: 'w-9 h-14 rounded-lg' }
                  ].map((f) => {
                    const isActive = imageDimensions.width === f.w;
                    return (
                      <button
                        key={f.id}
                        onClick={() => setImageDimensions({ width: f.w, height: f.h })}
                        className={`group flex flex-col items-center gap-3 transition-all duration-300 ${isActive ? 'scale-110 opacity-100' : 'opacity-30 hover:opacity-60'}`}
                      >
                        <div className={`
                          ${f.style} border-2 transition-all duration-500
                          ${isActive 
                            ? 'bg-purple-600 border-purple-400 shadow-[0_0_25px_rgba(168,85,247,0.5)]' 
                            : 'bg-gray-800 border-gray-600'}
                        `} />
                        <span className={`text-[11px] font-black tracking-widest uppercase ${isActive ? 'text-white' : 'text-gray-400'}`}>
                          {f.label}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* 2. LE BOUTON JAUNE PREMIUM */}
                <button 
                  onClick={handleMainGenerate}
                  disabled={isGenerating || !workflowsLoaded}
                  className="relative overflow-hidden w-full group bg-gradient-to-b from-[#FFEA00] to-[#FFB200] text-black font-[900] py-6 rounded-2xl text-2xl uppercase tracking-tighter transition-all active:scale-[0.97] disabled:opacity-30 shadow-[0_20px_50px_rgba(255,215,0,0.25)]"
                >
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                  <span className="relative z-10">
                    {isGenerating ? 'CRÉATION EN COURS...' : "Lancer la création"}
                  </span>
                </button>
              </div>
            </div>

            {/* PREVIEW PANEL */}
            <div className="flex-1 overflow-y-auto min-h-[500px]">
              <PreviewPanel 
                currentImage={currentImage} 
                savedGallery={savedGallery} 
                isGenerating={isGenerating} 
                onSelectImage={setCurrentImage} 
                onSaveToGallery={(img) => setSavedGallery(prev => [img, ...prev])} 
                generatedPrompt={generatedPrompt} 
              />
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="fixed bottom-10 right-10 bg-red-600 text-white px-8 py-4 rounded-2xl shadow-2xl z-[100]">
          <button onClick={clearError} className="font-bold flex items-center gap-3">
            <span>{error}</span> <span className="bg-black/20 p-2 rounded-lg">✕</span>
          </button>
        </div>
      )}
      {!isConfigured && <AdminSetupNotice onDismiss={() => {}} />}
    </div>
  );
}
