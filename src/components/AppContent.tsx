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
  const [_imageGallery, setImageGallery] = useState<GeneratedImage[]>([]); // Historique de session (non affiché dans UI, uniquement savedGallery)
  const [savedGallery, setSavedGallery] = useState<GeneratedImage[]>([]);
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [workflowToUse, setWorkflowToUse] = useState<string | null>(null); // ✅ Sera défini par l'API au chargement
  const [workflowsLoaded, setWorkflowsLoaded] = useState(false);
  
  // 🚨 Correction pour le format par défaut
  const [imageDimensions, setImageDimensions] = useState({ width: 1080, height: 1920 });
  // 🚨 Correction fin
  
  // ✅ REF pour capturer la valeur ACTUELLE de workflowToUse (évite problème de closure)
  const workflowToUseRef = useRef<string | null>(null);
  
  // ✅ UTILISER DES STATES AU LIEU DE REFS pour forcer le re-render
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
        console.log('[APP_CONTENT] 📋 Workflows disponibles:', data.workflows);
        
        if (data.workflows.length > 0) {
          // 🎯 PRIORISER affiche.json si disponible
          const afficheWorkflow = data.workflows.find((wf: string) => wf === 'affiche.json');
          const selectedWorkflow = afficheWorkflow || data.workflows[0];
          
          console.log(`[APP_CONTENT] ✅ Workflow sélectionné: ${selectedWorkflow}`);
          if (afficheWorkflow) {
            console.log('[APP_CONTENT] 🎬 affiche.json détecté et utilisé !');
          } else {
            console.warn('[APP_CONTENT] ⚠️ affiche.json non trouvé, utilisation du fallback:', selectedWorkflow);
          }
          
          setWorkflowToUse(selectedWorkflow);
          workflowToUseRef.current = selectedWorkflow; // ✅ Mettre à jour la ref
        } else {
          console.error('[APP_CONTENT] ❌ Aucun workflow disponible !');
        }
        
        setWorkflowsLoaded(true);
      } catch (err) {
        console.error('[APP_CONTENT] ❌ Erreur chargement workflows:', err);
        // 🚨 FALLBACK : Si l'API échoue, utiliser affiche.json par défaut
        console.warn('[APP_CONTENT] 🔧 FALLBACK : Utilisation de affiche.json par défaut');
        setWorkflowToUse('affiche.json');
        workflowToUseRef.current = 'affiche.json'; // ✅ Mettre à jour la ref
        setWorkflowsLoaded(true);
      }
    };
    
    loadWorkflows();
  }, []);

  // Réinitialiser les fonctions de génération quand on change de workflow
  useEffect(() => {
    console.log('[APP_CONTENT] 🔄 Workflow changé:', workflow);
    // ✅ Réinitialiser seulement les workflows qui ne sont PAS actifs
    if (workflow !== 'poster') setPosterGenerateFn(null);
    if (workflow !== 'parameters') setParametersGenerateFn(null);
    if (workflow !== 'cameraAngles') setCameraAnglesGenerateFn(null);
  }, [workflow]);

  // Charger la galerie sauvegardée depuis localStorage au démarrage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('savedGallery');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Reconvertir les dates
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

  // Quand une nouvelle image est générée, l'ajouter à la galerie
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
          // ✅ Utilise la dimension actuelle du state
          width: imageDimensions.width, 
          height: imageDimensions.height, // ✅ Utilise la dimension actuelle du state
        },
        timestamp: new Date(),
      };

      setCurrentImage(newImage);
      setImageGallery((prev) => [newImage, ...prev]);
    }
  }, [generatedImage, isGenerating, generatedPrompt, imageDimensions]); // Ajouté imageDimensions aux dépendances pour être précis

  const handleGenerateFromParameters = useCallback(async (params: GenerationParams) => {
    const currentWorkflow = workflowToUseRef.current; // ✅ Utiliser la ref pour avoir la valeur ACTUELLE
    
    if (!currentWorkflow) {
      console.error('[APP_CONTENT] ❌ Aucun workflow chargé, génération impossible');
      return;
    }
    
    clearError();
    console.log(`[APP_CONTENT] 🚀 Génération avec workflow: ${currentWorkflow}`);
    // Adapter les noms de paramètres pour l'API (workflow default.json)
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
    });
  }, [startGeneration, clearError]);

  const handleGenerateFromPoster = useCallback(async (_posterParams: PosterParams, genParams: GenerationParams) => {
    const currentWorkflow = workflowToUseRef.current; // ✅ Utiliser la ref pour avoir la valeur ACTUELLE
    
    if (!currentWorkflow) {
      console.error('[APP_CONTENT] ❌ Aucun workflow chargé, génération impossible');
      return;
    }
    
    clearError();
    console.log(`[APP_CONTENT] 🚀 Génération affiche avec workflow: ${currentWorkflow}`);
    
    // 🚨 CORRECTION MAJEURE : Utiliser la nouvelle clé 'user_menu_prompt' pour injecter le contenu du menu
    await startGeneration(currentWorkflow, {
      user_menu_prompt: genParams.prompt, // <- Le prompt généré par le formulaire
      negative_prompt: genParams.negativePrompt,
      steps: genParams.steps,
      cfg_scale: genParams.cfg,
      seed: genParams.seed,
      sampler_name: genParams.sampler,
      scheduler: genParams.scheduler,
      denoise: genParams.denoise,
      // ✅ Envoi des dimensions sélectionnées par l'utilisateur
      width: genParams.width, 
      height: genParams.height,
    });
  }, [startGeneration, clearError]);

  const handleGenerateFromCameraAngles = useCallback(async (cameraAnglesParams: CameraAnglesParams) => {
    const cameraWorkflow = 'multiple-angles.json'; // Nom avec tiret comme sur le backend
    
    clearError();
    console.log(`[APP_CONTENT] 🎥 Génération angles caméra avec workflow: ${cameraWorkflow}`);
    console.log('[APP_CONTENT] 📸 Params:', cameraAnglesParams);
    
    // Adapter les paramètres pour l'API du workflow multiple-angles
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
      // Sauvegarder dans localStorage
      try {
        localStorage.setItem('savedGallery', JSON.stringify(updated));
        console.log('[APP_CONTENT] 💾 Image sauvegardée dans la galerie permanente');
      } catch (err) {
        console.error('[APP_CONTENT] ❌ Erreur sauvegarde localStorage:', err);
      }
      return updated;
    });
  };

  // 🔧 Callbacks mémorisés pour éviter les boucles infinies
  const handlePosterGenerateFunctionReceived = useCallback((fn: () => void) => {
    console.log('[APP_CONTENT] Fonction de génération POSTER reçue');
    setPosterGenerateFn(() => fn); // ✅ Wrapper pour éviter que React l'exécute
  }, []);

  const handleParametersGenerateFunctionReceived = useCallback((fn: () => void) => {
    console.log('[APP_CONTENT] Fonction de génération PARAMETERS reçue');
    setParametersGenerateFn(() => fn); // ✅ Wrapper pour éviter que React l'exécute
  }, []);
  
  // Effect to show admin notice when quota system is not configured
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
            onClick={clearError}
            className="hover:bg-red-700 px-2 py-1 rounded"
          >
              ✕
          </button>
        </div>
      )}
      
      {/* Container scrollable qui commence sous le header fixe */}
      <div className="pt-32">
        {/* Carrousel de Workflows - Toute la largeur */}
        <WorkflowCarousel 
          selectedWorkflow={workflow}
          onSelectWorkflow={(w) => setWorkflow(w)}
        />
        
        {/* Deux panneaux côte à côte - scrollent avec le carrousel */}
        <div className="flex flex-col lg:flex-row min-h-[calc(100vh-128px-140px)]">
          {/* Left Panel - Paramètres */}
          <div className="w-full lg:w-1/2 bg-gray-800 lg:border-r border-gray-700">
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
              />
            ) : (
              <div className="p-6 text-center">
                <p className="text-gray-400">Ce workflow n'est pas encore disponible.</p>
                <p className="text-gray-500 text-sm mt-2">Sélectionnez un autre workflow pour commencer.</p>
              </div>
            )}
          </div>

          {/* Right Panel - Preview & Gallery */}
          <div className="w-full lg:w-1/2">
            <PreviewPanel 
              currentImage={currentImage}
              savedGallery={savedGallery}
              isGenerating={isGenerating}
              onSelectImage={handleSelectFromGallery}
              onCopyParameters={handleCopyParameters}
              onSaveToGallery={handleSaveToGallery}
              generatedPrompt={generatedPrompt}
              onStartGeneration={
                // ✅ Ne passer la fonction QUE si les workflows sont chargés
                (workflowsLoaded && workflowToUse)
                  ? (
                      workflow === 'poster' 
                        ? (posterGenerateFn || undefined)
                        : workflow === 'parameters'
                        ? (parametersGenerateFn || undefined)
                        : workflow === 'cameraAngles'
                        ? (cameraAnglesGenerateFn || undefined)
                        : undefined
                    )
                  : undefined
              }
              // ✅ Enregistre le format sélectionné dans AppContent
              onFormatChange={(width: number, height: number) => {
                console.log('[APP_CONTENT] 📐 Format changé:', width, 'x', height);
                setImageDimensions({ width, height });
              }}
            />
          </div>
        </div>
      </div>
      
      {/* Admin Setup Notice */}
      {showAdminNotice && !isConfigured && !isChecking && (
        <AdminSetupNotice 
          onDismiss={() => setShowAdminNotice(false)}
        />
      )}
    </>
  );
}
