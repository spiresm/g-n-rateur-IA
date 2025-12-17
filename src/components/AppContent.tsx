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
  const { isConfigured, isChecking } = useQuotaSystemStatus();
  const [showAdminNotice, setShowAdminNotice] = useState(false);
  
  const [workflow, setWorkflow] = useState<WorkflowType>('poster');
  const [currentImage, setCurrentImage] = useState<GeneratedImage | null>(null);
  const [savedGallery, setSavedGallery] = useState<GeneratedImage[]>([]);
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [workflowToUse, setWorkflowToUse] = useState<string | null>(null);
  const [workflowsLoaded, setWorkflowsLoaded] = useState(false);
  const [quota, setQuota] = useState<any>(null);
  
  const [imageDimensions, setImageDimensions] = useState({ width: 1080, height: 1920 });
  const workflowToUseRef = useRef<string | null>(null);
  
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

  // ✅ CHARGEMENT DES WORKFLOWS ET QUOTAS
  useEffect(() => {
    const loadInitialData = async () => {
      // On attend d'être authentifié pour charger les données privées
      if (!isAuthenticated || !user?.email || !token) return;

      try {
        console.log('[APP_CONTENT] 📥 Chargement des workflows et quotas...');
        
        // Exécution parallèle pour plus de rapidité
        const [workflowsData, quotaData] = await Promise.all([
          api.getWorkflows(),
          api.getUserQuota(user.email, token) // Envoi du token pour éviter le 401
        ]);

        // 📋 Gestion des Workflows (Évite l'erreur .length sur undefined)
        const workflowList = Array.isArray(workflowsData) ? workflowsData : (workflowsData?.workflows || []);
        
        if (workflowList.length > 0) {
          const afficheWorkflow = workflowList.find((wf: string) => wf === 'affiche.json');
          const selected = afficheWorkflow || workflowList[0];
          setWorkflowToUse(selected);
          workflowToUseRef.current = selected;
          console.log(`[APP_CONTENT] ✅ Workflow prêt: ${selected}`);
        }

        // 💰 Gestion du Quota
        setQuota(quotaData);
        setWorkflowsLoaded(true);
      } catch (err) {
        console.error('[APP_CONTENT] ❌ Erreur initialisation:', err);
        // Fallback pour ne pas bloquer l'UI
        setWorkflowToUse('affiche.json');
        workflowToUseRef.current = 'affiche.json';
        setWorkflowsLoaded(true);
      }
    };

    loadInitialData();
  }, [isAuthenticated, user, token]);

  // Réinitialiser les fonctions de génération au changement de workflow
  useEffect(() => {
    if (workflow !== 'poster') setPosterGenerateFn(null);
    if (workflow !== 'parameters') setParametersGenerateFn(null);
    if (workflow !== 'cameraAngles') setCameraAnglesGenerateFn(null);
  }, [workflow]);

  // Gestion de la galerie locale
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

  // Capture de l'image générée
  useEffect(() => {
    if (generatedImage && !isGenerating) {
      const newImage: GeneratedImage = {
        id: Date.now().toString(),
        imageUrl: generatedImage,
        params: {
          prompt: generatedPrompt || '',
          negativePrompt: '',
          steps: 30,
          cfg: 7,
          seed: -1,
          sampler: 'euler',
          scheduler: 'normal',
          denoise: 1.0,
          width: imageDimensions.width, 
          height: imageDimensions.height,
        },
        timestamp: new Date(),
      };
      setCurrentImage(newImage);
    }
  }, [generatedImage, isGenerating]);

  // --- HANDLERS DE GÉNÉRATION ---

  const handleGenerateFromPoster = useCallback(async (_posterParams: PosterParams, genParams: GenerationParams) => {
    const currentWorkflow = workflowToUseRef.current;
    if (!currentWorkflow) return;
    
    clearError();
    await startGeneration(currentWorkflow, {
      user_menu_prompt: genParams.prompt,
      negative_prompt: genParams.negativePrompt,
      steps: genParams.steps,
      cfg_scale: genParams.cfg,
      seed: genParams.seed,
      sampler_name: genParams.sampler,
      scheduler: genParams.scheduler,
      denoise: genParams.denoise,
      width: genParams.width, 
      height: genParams.height,
    });
  }, [startGeneration, clearError]);

  const handleGenerateFromParameters = useCallback(async (params: GenerationParams) => {
    const currentWorkflow = workflowToUseRef.current;
    if (!currentWorkflow) return;
    clearError();
    await startGeneration(currentWorkflow, params);
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
    <>
      <Header />
      
      <ProgressOverlay 
        isVisible={isGenerating}
        progress={progress}
        label="Génération de votre chef-d'œuvre..."
      />

      {error && (
        <div className="fixed top-36 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-3 animate-bounce">
          <span>{error}</span>
          <button onClick={clearError} className="bg-white/20 hover:bg-white/40 p-1 rounded-full">✕</button>
        </div>
      )}
      
      <div className="pt-32">
        <WorkflowCarousel 
          selectedWorkflow={workflow}
          onSelectWorkflow={(w) => setWorkflow(w)}
        />
        
        <div className="flex flex-col lg:flex-row min-h-[calc(100vh-128px-140px)]">
          {/* Panneau Gauche : Formulaires */}
          <div className="w-full lg:w-1/2 bg-gray-800 lg:border-r border-gray-700">
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
              />
            ) : (
              <div className="p-12 text-center text-gray-500">Workflow bientôt disponible...</div>
            )}
          </div>

          {/* Panneau Droit : Preview & Galerie */}
          <div className="w-full lg:w-1/2 bg-gray-900">
            <PreviewPanel 
              currentImage={currentImage}
              savedGallery={savedGallery}
              isGenerating={isGenerating}
              onSelectImage={setCurrentImage}
              onCopyParameters={(img) => navigator.clipboard.writeText(JSON.stringify(img.params))}
              onSaveToGallery={handleSaveToGallery}
              generatedPrompt={generatedPrompt}
              onStartGeneration={
                (workflowsLoaded && workflowToUse) 
                ? (workflow === 'poster' ? posterGenerateFn : workflow === 'parameters' ? parametersGenerateFn : undefined)
                : undefined
              }
              onFormatChange={(width, height) => setImageDimensions({ width, height })}
            />
          </div>
        </div>
      </div>
      
      {showAdminNotice && !isConfigured && (
        <AdminSetupNotice onDismiss={() => setShowAdminNotice(false)} />
      )}
    </>
  );
}
