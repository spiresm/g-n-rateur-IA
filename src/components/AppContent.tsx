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
  
  // UTILISATION DE REFS POUR LES FONCTIONS (plus stable que des states)
  const posterRef = useRef<(() => void) | null>(null);
  const parametersRef = useRef<(() => void) | null>(null);
  const cameraRef = useRef<(() => void) | null>(null);

  const { isGenerating, progress, error, generatedImage, startGeneration, clearError } = useImageGeneration();

  // Initialisation des Workflows
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

  // Capture Image
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

  // LA FONCTION DU BOUTON JAUNE (CORRIGÉE)
  const handleMainGenerate = () => {
    console.log("Clic sur bouton jaune, workflow actuel:", workflow);
    if (workflow === 'poster' && posterRef.current) posterRef.current();
    else if (workflow === 'parameters' && parametersRef.current) parametersRef.current();
    else if (workflow === 'cameraAngles' && cameraRef.current) cameraRef.current();
    else console.warn("Aucune fonction de génération liée pour ce workflow");
  };

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
          
          {/* COLONNE GAUCHE : RÉGLAGES */}
          <div className="w-full lg:w-1/2 bg-gray-900/10 lg:border-r border-gray-800">
            {workflow === 'poster' && (
              <PosterGenerator 
                onGenerate={handleGenerateFromPoster} 
                isGenerating={isGenerating} 
                onPromptGenerated={setGeneratedPrompt} 
                generatedPrompt={generatedPrompt} 
                imageDimensions={imageDimensions} 
                onGetGenerateFunction={(fn) => { posterRef.current = fn; }} 
              />
            )}
            {workflow === 'parameters' && (
              <GenerationParameters 
                onGenerate={handleGenerateFromParameters} 
                isGenerating={isGenerating} 
                imageDimensions={imageDimensions} 
                onGetGenerateFunction={(fn) => { parametersRef.current = fn; }} 
              />
            )}
            {workflow === 'cameraAngles' && (
              <CameraAnglesGenerator 
                onGenerate={handleGenerateFromCameraAngles} 
                isGenerating={isGenerating} 
                onGetGenerateFunction={(fn) => { cameraRef.current = fn; }} 
              />
            )}
          </div>

          {/* COLONNE DROITE : LE STUDIO PREMIUM */}
          <div className="w-full lg:w-1/2 flex flex-col bg-[#0a0c10]">
            
            <div className="p-8 border-b border-gray-800 bg-[#0c0e14]/80 backdrop-blur-2xl sticky top-0 z-10">
              <div className="max-w-xl mx-auto flex flex-col gap-10">
                
                {/* 1. SÉLECTEURS DE FORMATS */}
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
                        className={`group flex flex-col items-center gap-3 transition-all duration-300 ${isActive ? 'scale-110' : 'opacity-40 hover:opacity-100'}`}
                      >
                        <div className={`
                          ${f.style} border-2 transition-all duration-500
                          ${isActive 
                            ? 'bg-purple-600 border-purple-400 shadow-[0_0_30px_rgba(168,85,247,0.6)]' 
                            : 'bg-gray-800 border-gray-600'}
                        `} />
                        <span className={`text-[11px] font-black tracking-[0.2em] uppercase ${isActive ? 'text-white' : 'text-gray-500'}`}>
                          {f.label}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* 2. LE BOUTON JAUNE ULTRA-PREMIUM */}
                <button 
                  onClick={handleMainGenerate}
                  disabled={isGenerating || !workflowsLoaded}
                  className="relative overflow-hidden w-full group bg-gradient-to-b from-[#FFEA00] to-[#FFB200] text-black font-[900] py-6 rounded-2xl text-2xl uppercase tracking-tighter transition-all active:scale-[0.97] disabled:opacity-30 shadow-[0_20px_50px_rgba(255,215,0,0.3)]"
                >
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                  <span className="relative z-10">
                    {isGenerating ? 'CRÉATION EN COURS...' : "Lancer la création"}
                  </span>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
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
    </div>
  );
}
