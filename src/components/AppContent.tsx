import { useState, useEffect, useRef, useCallback } from 'react';
import { useImageGeneration } from '../hooks/useImageGeneration';
import { useAuth } from '../contexts/AuthContext';
import { useQuotaSystemStatus } from '../hooks/useQuotaSystemStatus';
import { api } from '../services/api';
import type { GenerationParams, PosterParams, CameraAnglesParams, GeneratedImage, WorkflowType } from '../App';

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

  // RÉTABLISSEMENT DES FONCTIONS DE GÉNÉRATION (TA LOGIQUE)
  const [posterGenerateFn, setPosterGenerateFn] = useState<(() => void) | null>(null);
  const [parametersGenerateFn, setParametersGenerateFn] = useState<(() => void) | null>(null);
  const [cameraAnglesGenerateFn, setCameraAnglesGenerateFn] = useState<(() => void) | null>(null);

  const { isGenerating, progress, error, generatedImage, startGeneration, clearError } = useImageGeneration();

  // 1. Initialisation
  useEffect(() => {
    const loadInitialData = async () => {
      if (!isAuthenticated || !token) return;
      try {
        const data = await api.getWorkflows();
        const list = Array.isArray(data) ? data : (data?.workflows || []);
        if (list.length > 0) {
          workflowToUseRef.current = list.find((wf: string) => wf === 'affiche.json') || list[0];
          setWorkflowsLoaded(true);
        }
      } catch (err) {
        workflowToUseRef.current = 'affiche.json';
        setWorkflowsLoaded(true);
      }
    };
    loadInitialData();
  }, [isAuthenticated, token]);

  // 2. Gestion de la sortie Image
  useEffect(() => {
    if (generatedImage && !isGenerating) {
      const newImg: GeneratedImage = {
        id: Date.now().toString(),
        imageUrl: generatedImage,
        params: { prompt: generatedPrompt, width: imageDimensions.width, height: imageDimensions.height } as any,
        timestamp: new Date(),
      };
      setCurrentImage(newImg);
      setSavedGallery(prev => [newImg, ...prev]);
    }
  }, [generatedImage, isGenerating]);

  // 3. LOGIQUE DU BOUTON JAUNE (QUELLE FONCTION APPELER ?)
  const handleMainGenerate = () => {
    if (workflow === 'poster' && posterGenerateFn) posterGenerateFn();
    else if (workflow === 'parameters' && parametersGenerateFn) parametersGenerateFn();
    else if (workflow === 'cameraAngles' && cameraAnglesGenerateFn) cameraAnglesGenerateFn();
  };

  // Handlers pour les composants enfants
  const handleGenerateFromPoster = useCallback(async (_p: PosterParams, g: GenerationParams) => {
    if (!workflowToUseRef.current) return;
    clearError();
    await startGeneration(workflowToUseRef.current, { ...g, user_menu_prompt: g.prompt });
  }, [startGeneration, clearError]);

  const handleGenerateFromParameters = useCallback(async (g: GenerationParams) => {
    if (!workflowToUseRef.current) return;
    clearError();
    await startGeneration(workflowToUseRef.current, g);
  }, [startGeneration, clearError]);

  const handleGenerateFromCameraAngles = useCallback(async (p: CameraAnglesParams) => {
    clearError();
    await startGeneration('multiple-angles.json', p);
  }, [startGeneration, clearError]);

  return (
    <div className="bg-[#0f1117] min-h-screen text-white">
      <Header />
      <ProgressOverlay isVisible={isGenerating} progress={progress} label="Création en cours..." />

      <div className="pt-24 sm:pt-32">
        <WorkflowCarousel selectedWorkflow={workflow} onSelectWorkflow={(w) => setWorkflow(w as WorkflowType)} />
        
        <div className="flex flex-col lg:flex-row border-t border-gray-800 bg-[#0c0e14]">
          
          {/* COLONNE GAUCHE (REGLAGES + UPLOAD) */}
          <div className="w-full lg:w-1/2 bg-gray-900/10 lg:border-r border-gray-800">
            {workflow === 'poster' && (
              <PosterGenerator 
                onGenerate={handleGenerateFromPoster} 
                isGenerating={isGenerating} 
                onPromptGenerated={setGeneratedPrompt} 
                imageDimensions={imageDimensions} 
                onGetGenerateFunction={(fn) => setPosterGenerateFn(() => fn)} 
              />
            )}
            {workflow === 'parameters' && (
              <GenerationParameters 
                onGenerate={handleGenerateFromParameters} 
                isGenerating={isGenerating} 
                imageDimensions={imageDimensions} 
                onGetGenerateFunction={(fn) => setParametersGenerateFn(() => fn)} 
              />
            )}
            {workflow === 'cameraAngles' && (
              <CameraAnglesGenerator 
                onGenerate={handleGenerateFromCameraAngles} 
                isGenerating={isGenerating} 
                onGetGenerateFunction={(fn) => setCameraAnglesGenerateFn(() => fn)} 
              />
            )}
          </div>

          {/* COLONNE DROITE (PREMIUM STUDIO) */}
          <div className="w-full lg:w-1/2 flex flex-col bg-[#0a0c10]">
            <div className="p-8 border-b border-gray-800 bg-[#0c0e14]/95 backdrop-blur-2xl">
              <div className="max-w-xl mx-auto flex flex-col gap-10">
                
                {/* FORMATS (AU-DESSUS DU BOUTON) */}
                <div className="flex justify-around items-center px-4">
                  {[
                    { id: 'sq', label: 'CARRÉ', w: 1024, h: 1024, s: 'w-10 h-10 rounded-xl' },
                    { id: 'ls', label: 'PAYSAGE', w: 1216, h: 832, s: 'w-14 h-9 rounded-lg' },
                    { id: 'pt', label: 'PORTRAIT', w: 832, h: 1216, s: 'w-9 h-14 rounded-lg' }
                  ].map((f) => {
                    const active = imageDimensions.width === f.w;
                    return (
                      <button key={f.id} onClick={() => setImageDimensions({width: f.w, height: f.h})} className={`flex flex-col items-center gap-3 transition-all ${active ? 'scale-110 opacity-100' : 'opacity-30 hover:opacity-100'}`}>
                        <div className={`${f.s} border-2 ${active ? 'bg-purple-600 border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.5)]' : 'bg-gray-800 border-gray-600'}`} />
                        <span className={`text-[10px] font-black tracking-widest ${active ? 'text-white' : 'text-gray-500'}`}>{f.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* LE BOUTON JAUNE PREMIUM */}
                <button 
                  onClick={handleMainGenerate}
                  disabled={isGenerating || !workflowsLoaded}
                  className="w-full bg-gradient-to-b from-[#FFEA00] to-[#FFB200] text-black font-[900] py-6 rounded-2xl text-2xl uppercase tracking-tighter shadow-[0_20px_50px_rgba(255,215,0,0.3)] active:scale-[0.98] transition-all disabled:opacity-30"
                >
                  {isGenerating ? 'CRÉATION...' : "Lancer la création"}
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <PreviewPanel currentImage={currentImage} savedGallery={savedGallery} isGenerating={isGenerating} onSelectImage={setCurrentImage} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
