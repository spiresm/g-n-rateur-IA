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
  // console.log('[APP_CONTENT] 🎨 Rendu du composant AppContent'); // DÉSACTIVÉ
  
  const { user } = useAuth();
  const { isConfigured, isChecking } = useQuotaSystemStatus();
  const [showAdminNotice, setShowAdminNotice] = useState(false);
  
  const [workflow, setWorkflow] = useState<WorkflowType>('poster');
  const [currentImage, setCurrentImage] = useState<GeneratedImage | null>(null);
  const [_imageGallery, setImageGallery] = useState<GeneratedImage[]>([]); // Historique de session
  const [savedGallery, setSavedGallery] = useState<GeneratedImage[]>([]);
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [workflowToUse, setWorkflowToUse] = useState<string | null>(null); // ✅ Défini par l'API
  const [workflowsLoaded, setWorkflowsLoaded] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({ width: 1024, height: 1024 });
  
  // ✅ REF pour capturer la valeur ACTUELLE de workflowToUse (évite problème de closure)
  const workflowToUseRef = useRef<string | null>(null);
  
  // ✅ STATES pour les fonctions de génération
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
  
  console.log('[APP_CONTENT] State:', { workflow, isGenerating, progress, error, workflowToUse, workflowsLoaded });
  console.log('[APP_CONTENT] 🎯 posterGenerateFn:', posterGenerateFn ? 'DÉFINIE ✅' : 'NULL ❌');
  console.log('[APP_CONTENT] 🎯 parametersGenerateFn:', parametersGenerateFn ? 'DÉFINIE ✅' : 'NULL ❌');
  console.log('[APP_CONTENT] 🎯 cameraAnglesGenerateFn:', cameraAnglesGenerateFn ? 'DÉFINIE ✅' : 'NULL ❌');
  
  // Charger les workflows disponibles au démarrage
  useEffect(() => {
    const loadWorkflows = async () => {
      try {
        const data = await api.getWorkflows();
        console.log('[APP_CONTENT] 📋 Workflows disponibles:', data?.workflows);
        
        // Correction : Ajout du chaînage optionnel sur data?.workflows
        if (data?.workflows && data.workflows.length > 0) {
          const afficheWorkflow = data.workflows.find((wf: string) => wf === 'affiche.json');
          const selectedWorkflow = afficheWorkflow || data.workflows[0];
          
          console.log(`[APP_CONTENT] ✅ Workflow sélectionné: ${selectedWorkflow}`);
          if (afficheWorkflow) {
            console.log('[APP_CONTENT] 🎬 affiche.json détecté et utilisé !');
          } else {
            console.warn('[APP_CONTENT] ⚠️ affiche.json non trouvé, utilisation du fallback:', selectedWorkflow);
          }
          
          setWorkflowToUse(selectedWorkflow);
          workflowToUseRef.current = selectedWorkflow;
        } else {
          console.error('[APP_CONTENT] ❌ Aucun workflow disponible !');
          // Fallback par défaut pour éviter le crash
          setWorkflowToUse('affiche.json');
          workflowToUseRef.current = 'affiche.json';
        }
        
        setWorkflowsLoaded(true);
      } catch (err) {
        console.error('[APP_CONTENT] ❌ Erreur chargement workflows:', err);
        console.warn('[APP_CONTENT] 🔧 FALLBACK : Utilisation de affiche.json par défaut');
        setWorkflowToUse('affiche.json');
        workflowToUseRef.current = 'affiche.json';
        setWorkflowsLoaded(true);
      }
    };
    
    loadWorkflows();
  }, []);

  // Réinitialiser les fonctions de génération quand on change de workflow
  useEffect(() => {
    console.log('[APP_CONTENT] 🔄 Workflow changé:', workflow);
    if (workflow !== 'poster') setPosterGenerateFn(null);
    if (workflow !== 'parameters') setParametersGenerateFn(null);
    if (workflow !== 'cameraAngles') setCameraAnglesGenerateFn(null);
  }, [workflow]);

  // Charger la galerie sauvegardée
  useEffect(() => {
    try {
      const saved = localStorage.getItem('savedGallery');
      if (saved) {
        const parsed = JSON.parse(saved);
        const images = parsed.map((img: any) => ({
          ...img,
          timestamp: new Date(img.timestamp)
        }));
        setSavedGallery(images);
        console.log('[APP_CONTENT] 📚 Galerie sauvegardée chargée:', images.length, 'images');
      }
    } catch (err) {
      console.error('[APP_CONTENT] ❌ Erreur chargement galerie:', err);
    }
  }, []);

  // Gestion de la nouvelle image générée
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
          width: 1024,
          height: 1024,
        },
        timestamp: new Date(),
      };

      setCurrentImage(newImage);
      setImageGallery((prev) => [newImage, ...prev]);
    }
  }, [generatedImage, isGenerating, generatedPrompt]);

  const handleGenerateFromParameters = useCallback(async (params: GenerationParams) => {
    const currentWorkflow = workflowToUseRef.current;
    if (!currentWorkflow) {
      console.error('[APP_CONTENT] ❌ Aucun workflow chargé, génération impossible');
      return;
    }
    
    if (typeof clearError === 'function') clearError();
    console.log(`[APP_CONTENT] 🚀 Génération avec workflow: ${currentWorkflow}`);
    if (typeof startGeneration !== 'function') {
      console.error('[APP_CONTENT] ❌ startGeneration indisponible');
      return;
    }

    await startGeneration(currentWorkflow, {
      prompt: params.prompt,
      negative_prompt: params.negativePrompt,
      steps: params.steps,
      cfg_scale: params.cfg,
      seed: params.seed,
      sampler_name: params.sampler,
      scheduler: params.scheduler,
      denoise: params.denoise,
      width: params.width,
      height: params.height,
    }, user?.email || undefined);
  }, [startGeneration, clearError, user]);

  const handleGenerateFromPoster = useCallback(async (_posterParams: PosterParams, genParams: GenerationParams) => {
    const currentWorkflow = workflowToUseRef.current;
    if (!currentWorkflow) {
      console.error('[APP_CONTENT] ❌ Aucun workflow chargé, génération impossible');
      return;
    }
    
    if (typeof clearError === 'function') clearError();
    console.log(`[APP_CONTENT] 🚀 Génération affiche avec workflow: ${currentWorkflow}`);
    if (typeof startGeneration !== 'function') {
      console.error('[APP_CONTENT] ❌ startGeneration indisponible');
      return;
    }

    await startGeneration(currentWorkflow, {
      prompt: genParams.prompt,
      negative_prompt: genParams.negativePrompt,
      steps: genParams.steps,
      cfg_scale: genParams.cfg,
      seed: genParams.seed,
      sampler_name: genParams.sampler,
      scheduler: genParams.scheduler,
      denoise: genParams.denoise,
      width: genParams.width,
      height: genParams.height,
    }, user?.email || undefined);
  }, [startGeneration, clearError, user]);

  const handleGenerateFromCameraAngles = useCallback(async (cameraAnglesParams: CameraAnglesParams) => {
    const cameraWorkflow = 'multiple-angles.json';
    if (typeof clearError === 'function') clearError();
    console.log(`[APP_CONTENT] 🎥 Génération angles caméra avec workflow: ${cameraWorkflow}`);

    if (typeof startGeneration !== 'function') {
      console.error('[APP_CONTENT] ❌ startGeneration indisponible');
      return;
    }

    await startGeneration(cameraWorkflow, {
      selected_angle: cameraAnglesParams.selectedAngle,
      prompt_node: cameraAnglesParams.promptNode,
      seed: cameraAnglesParams.seed,
      steps: cameraAnglesParams.steps,
      cfg_scale: cameraAnglesParams.cfg,
      image_file: cameraAnglesParams.imageFile,
    });
  }, [startGeneration, clearError]);

  const handleSelectFromGallery = (image: GeneratedImage) => {
    setCurrentImage(image);
  };

  const handleCopyParameters = (image: GeneratedImage) => {
    console.log('Paramètres copiés:', image.params);
    navigator.clipboard.writeText(JSON.stringify(image.params, null, 2));
  };

  const handleSaveToGallery = (image: GeneratedImage) => {
    setSavedGallery((prev) => {
      const updated = [image, ...prev];
      try {
        localStorage.setItem('savedGallery', JSON.stringify(updated));
        console.log('[APP_CONTENT] 💾 Image sauvegardée');
      } catch (err) {
        console.error('[APP_CONTENT] ❌ Erreur sauvegarde localStorage:', err);
      }
      return updated;
    });
  };

  const handlePosterGenerateFunctionReceived = useCallback((fn: () => void) => {
    console.log('[APP_CONTENT] Fonction de génération POSTER reçue');
    setPosterGenerateFn(() => fn);
  }, []);

  const handleParametersGenerateFunctionReceived = useCallback((fn: () => void) => {
    console.log('[APP_CONTENT] Fonction de génération PARAMETERS reçue');
    setParametersGenerateFn(() => fn);
  }, []);

  const handleCameraGenerateFunctionReceived = useCallback((fn: () => void) => {
    console.log('[APP_CONTENT] Fonction de génération CAMERA reçue');
    setCameraAnglesGenerateFn(() => fn);
  }, []);
  
  useEffect(() => {
    if (!isChecking && isConfigured === false) {
      setShowAdminNotice(true);
    }
  }, [isChecking, isConfigured]);

  return (
    <>
      <Header />
      
      <ProgressOverlay 
        isVisible={isGenerating}
        progress={progress}
        label="Génération en cours…"
      />

      {error && (
        <div className="fixed top-36 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-40 flex items-center gap-3">
          <span>{error}</span>
          <button
            onClick={typeof clearError === 'function' ? clearError : undefined}
            className="hover:bg-red-700 px-2 py-1 rounded"
          >
            ✕
          </button>
        </div>
      )}
      
      <div className="pt-24 sm:pt-32">
        <WorkflowCarousel 
          selectedWorkflow={workflow}
          onSelectWorkflow={setWorkflow}
        />
        
        <div className="flex flex-col md:flex-row min-h-[calc(100vh-128px-140px)]">
          {/* Left Panel - Paramètres */}
          <div className="w-full md:w-1/2 bg-gray-800 md:border-r border-gray-700">
            {workflow === 'parameters' ? (
              <GenerationParameters 
                onGenerate={handleGenerateFromParameters}
                isGenerating={isGenerating}
                imageDimensions={imageDimensions}
                onGetGenerateFunction={handleParametersGenerateFunctionReceived}
              />
            ) : workflow === 'poster' ? (
              <PosterGenerator 
                onGenerate={handleGenerateFromPoster}
                isGenerating={isGenerating}
                onPromptGenerated={setGeneratedPrompt}
                generatedPrompt={generatedPrompt}
                imageDimensions={imageDimensions}
                onGetGenerateFunction={handlePosterGenerateFunctionReceived}
              />
            ) : workflow === 'cameraAngles' ? (
              <CameraAnglesGenerator 
                onGenerate={handleGenerateFromCameraAngles}
                isGenerating={isGenerating}
                onGetGenerateFunction={handleCameraGenerateFunctionReceived} // ✅ Ajouté ici
              />
            ) : (
              <div className="p-6 text-center">
                <p className="text-gray-400">Ce workflow n'est pas encore disponible.</p>
                <p className="text-gray-500 text-sm mt-2">Sélectionnez un autre workflow pour commencer.</p>
              </div>
            )}
          </div>

          {/* Right Panel - Preview & Gallery */}
          <div className="w-full md:w-1/2">
            <PreviewPanel 
              currentImage={currentImage}
              savedGallery={savedGallery}
              isGenerating={isGenerating}
              onSelectImage={handleSelectFromGallery}
              onCopyParameters={handleCopyParameters}
              onSaveToGallery={handleSaveToGallery}
              generatedPrompt={generatedPrompt}
              onStartGeneration={
                // ✅ Correction majeure : Sécurisation de l'appel de fonction
                (workflowsLoaded && workflowToUse)
                  ? () => {
                      if (workflow === 'poster' && typeof posterGenerateFn === 'function') {
                        posterGenerateFn();
                      } else if (workflow === 'parameters' && typeof parametersGenerateFn === 'function') {
                        parametersGenerateFn();
                      } else if (workflow === 'cameraAngles' && typeof cameraAnglesGenerateFn === 'function') {
                        cameraAnglesGenerateFn();
                      } else {
                        console.warn('[APP_CONTENT] ⚠️ La fonction de génération n\'est pas encore prête.');
                      }
                    }
                  : undefined
              }
              onFormatChange={(width: number, height: number) => {
                console.log('[APP_CONTENT] 📐 Format changé:', width, 'x', height);
                setImageDimensions({ width, height });
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
