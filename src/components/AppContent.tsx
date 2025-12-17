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
  const { isConfigured, isChecking } = useQuotaSystemStatus();
  const [showAdminNotice, setShowAdminNotice] = useState(false);
  
  // États de l'interface
  const [workflow, setWorkflow] = useState<WorkflowType>('poster');
  const [imageDimensions, setImageDimensions] = useState({ width: 1080, height: 1920 });
  const [currentImage, setCurrentImage] = useState<GeneratedImage | null>(null);
  const [savedGallery, setSavedGallery] = useState<GeneratedImage[]>([]);
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  
  // États techniques & Quotas
  const [workflowToUse, setWorkflowToUse] = useState<string | null>(null);
  const [workflowsLoaded, setWorkflowsLoaded] = useState(false);
  const [quota, setQuota] = useState<any>(null);
  const workflowToUseRef = useRef<string | null>(null);
  
  // Fonctions de déclenchement à distance
  const [posterGenerateFn, setPosterGenerateFn] = useState<(() => void) | null>(null);
  const [parametersGenerateFn, setParametersGenerateFn] = useState<(() => void) | null>(null);
  const [cameraAnglesGenerateFn, setCameraAnglesGenerateFn] = useState<(() => void) | null>(null);

  const { 
    isGenerating, 
    progress, 
    error, 
    generatedImage,
    startGeneration, 
    clearError 
  } = useImageGeneration();

  // 1. CHARGEMENT DES WORKFLOWS ET QUOTAS (Silencieux mais complet)
  useEffect(() => {
    const loadInitialData = async () => {
      if (!isAuthenticated || !user?.email || !token) return;
      try {
        const [workflowsData, quotaData] = await Promise.all([
          api.getWorkflows(),
          api.getUserQuota(user.email, token)
        ]);

        const workflowList = Array.isArray(workflowsData) ? workflowsData : (workflowsData?.workflows || []);
        if (workflowList.length > 0) {
          const afficheWorkflow = workflowList.find((wf: string) => wf === 'affiche.json');
          const selected = afficheWorkflow || workflowList[0];
          setWorkflowToUse(selected);
          workflowToUseRef.current = selected;
        }
        setQuota(quotaData);
        setWorkflowsLoaded(true);
      } catch (err) {
        console.error('Erreur initialisation:', err);
        setWorkflowToUse('affiche.json');
        workflowToUseRef.current = 'affiche.json';
        setWorkflowsLoaded(true);
      }
    };
    loadInitialData();
  }, [isAuthenticated, user, token]);

  // 2. GESTION DE LA GALERIE LOCALE (LocalStorage)
  useEffect(() => {
    const saved = localStorage.getItem('savedGallery');
    if (saved) {
      try {
        const images = JSON.parse(saved).map((img: any) => ({
          ...img,
          timestamp: new Date(img.timestamp)
        }));
        setSavedGallery(images);
      } catch (e) { console.error(e); }
    }
  }, []);

  // 3. CAPTURE DE L'IMAGE GÉNÉRÉE
  useEffect(() => {
    if (generatedImage && !isGenerating) {
      const newImage: GeneratedImage = {
        id: Date.now().toString(),
        imageUrl: generatedImage,
        params: {
          prompt: generatedPrompt || '',
          negativePrompt: '',
          steps: 30, cfg: 7, seed: -1, sampler: 'euler', scheduler: 'normal', denoise: 1.0,
          width: imageDimensions.width, 
          height: imageDimensions.height,
        },
        timestamp: new Date(),
      };
      setCurrentImage(newImage);
    }
  }, [generatedImage, isGenerating]);

  // 4. HANDLERS DE GÉNÉRATION (Logique métier)
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

  const handleSaveToGallery = (image: GeneratedImage) => {
    setSavedGallery((prev) => {
      const updated = [image, ...prev];
      localStorage.setItem('savedGallery', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <div className="bg-[#0f1117] min-h-screen text-white font-sans">
      <Header />
      
      <ProgressOverlay isVisible={isGenerating} progress={progress} label="Génération de votre chef-d'œuvre..." />

      <div className="pt-24 sm:pt-32">
        <WorkflowCarousel 
          selectedWorkflow={workflow}
          onSelectWorkflow={(w) => setWorkflow(w as WorkflowType)}
        />
        
        <div className="flex flex-col lg:flex-row border-t border-gray-800 bg-[#0c0e14]">
          
          {/* COLONNE GAUCHE : PARAMÈTRES */}
          <div className="w-full lg:w-1/2 bg-gray-900/20 lg:border-r border-gray-800">
            {workflow === 'poster' ? (
              <PosterGenerator 
                onGenerate={handleGenerateFromPoster}
                isGenerating={isGenerating}
                onPromptGenerated={setGeneratedPrompt}
                generatedPrompt={generatedPrompt}
                imageDimensions={imageDimensions}
                onGetGenerateFunction={(fn) => setPosterGenerateFn(() => fn)}
              />
            ) : workflow === 'parameters' ? (
              <GenerationParameters 
                onGenerate={handleGenerateFromParameters}
                isGenerating={isGenerating}
                imageDimensions={imageDimensions}
                onGetGenerateFunction={(fn) => setParametersGenerateFn(() => fn)}
              />
            ) : workflow === 'cameraAngles' ? (
              <CameraAnglesGenerator 
                onGenerate={handleGenerateFromCameraAngles}
                isGenerating={isGenerating}
                onGetGenerateFunction={(fn) => setCameraAnglesGenerateFn(() => fn)}
              />
            ) : (
              <div className="p-20 text-center text-gray-600 font-black uppercase tracking-[0.3em] opacity-20">
                Workflow non sélectionné
              </div>
            )}
          </div>

          {/* COLONNE DROITE : BOUTON GÉNÉRER + PREVIEW */}
          <div className="w-full lg:w-1/2 flex flex-col bg-[#0a0c10]">
            
            {/* PANNEAU DE COMMANDE SUPÉRIEUR */}
            <div className="p-8 border-b border-gray-800 bg-gray-900/40 sticky top-0 z-10 backdrop-blur-md">
              <div className="max-w-xl mx-auto flex flex-col gap-6">
                
                <button 
                  onClick={() => {
                    if (workflow === 'poster') posterGenerateFn?.();
                    else if (workflow === 'parameters') parametersGenerateFn?.();
                    else if (workflow === 'cameraAngles') cameraAnglesGenerateFn?.();
                  }}
                  disabled={isGenerating || !workflowsLoaded}
                  className="w-full bg-[#FFD700] hover:bg-[#FFC400] text-black font-black py-5 rounded-2xl text-2xl uppercase tracking-tighter transition-all active:scale-[0.98] disabled:opacity-30 shadow-[0_10px_40px_rgba(255,215,0,0.15)]"
                >
                  {isGenerating ? 'Génération...' : "Générer l'image"}
                </button>

                <div className="flex justify-center items-center gap-10">
                  {[
                    { id: 'square', label: 'CARRÉ', w: 1024, h: 1024, icon: 'w-5 h-5' },
                    { id: 'landscape', label: 'PAYSAGE', w: 1216, h: 832, icon: 'w-7 h-5' },
                    { id: 'portrait', label: 'PORTRAIT', w: 832, h: 1216, icon: 'w-5 h-7' }
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setImageDimensions({ width: f.w, height: f.h })}
                      className={`flex items-center gap-2 transition-all ${imageDimensions.width === f.w ? 'text-purple-500' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                      <div className={`border-2 border-current rounded-sm ${f.icon} ${imageDimensions.width === f.w ? 'bg-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.2)]' : ''}`} />
                      <span className="text-[10px] font-black tracking-widest uppercase">{f.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex-1">
              <PreviewPanel 
                currentImage={currentImage}
                savedGallery={savedGallery}
                isGenerating={isGenerating}
                onSelectImage={setCurrentImage}
                onCopyParameters={(img) => navigator.clipboard.writeText(JSON.stringify(img.params))}
                onSaveToGallery={handleSaveToGallery}
                generatedPrompt={generatedPrompt}
              />
            </div>
          </div>
        </div>
      </div>

      {/* NOTIFICATIONS ET ALERTES */}
      {error && (
        <div className="fixed bottom-10 right-10 bg-red-600 text-white px-8 py-4 rounded-2xl shadow-2xl z-[100] animate-bounce">
          <div className="flex items-center gap-4 font-bold uppercase text-sm">
            <span>{error}</span>
            <button onClick={clearError} className="bg-black/20 p-1 rounded-lg">✕</button>
          </div>
        </div>
      )}

      {showAdminNotice && !isConfigured && (
        <AdminSetupNotice onDismiss={() => setShowAdminNotice(false)} />
      )}
    </div>
  );
}
