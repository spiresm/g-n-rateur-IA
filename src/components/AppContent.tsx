import { useState, useEffect } from 'react';
import { Header } from './Header';
import { WorkflowSelector } from './WorkflowSelector';
import { GenerationParameters } from './GenerationParameters';
import { PosterGenerator } from './PosterGenerator';
import { PreviewPanel } from './PreviewPanel';
import { ProgressOverlay } from './ProgressOverlay';
import { WorkflowDebug } from './WorkflowDebug';
import { useImageGeneration } from '../hooks/useImageGeneration';

type WorkflowType = 'poster' | 'parameters';

export interface GenerationParams {
  prompt: string;
  negativePrompt: string;
  steps: number;
  cfg: number;
  seed: number;
  sampler: string;
  scheduler: string;
  denoise: number;
  width: number;
  height: number;
}

export interface PosterParams {
  titre: string;
  sousTitre: string;
  tagline: string;
  occasion: string;
  ambiance: string;
  personnage: string;
  environnement: string;
  action: string;
  palette: string;
  styleTitre: string;
}

export interface GeneratedImage {
  id: string;
  imageUrl: string;
  params: GenerationParams;
  posterParams?: PosterParams;
  timestamp: Date;
  generationTime?: number;
}

export function AppContent() {
  console.log('[APP_CONTENT] 🎨 Rendu du composant AppContent');
  
  const [workflow, setWorkflow] = useState<WorkflowType>('poster');
  const [currentImage, setCurrentImage] = useState<GeneratedImage | null>(null);
  const [imageGallery, setImageGallery] = useState<GeneratedImage[]>([]);
  const [generatedPrompt, setGeneratedPrompt] = useState('');

  const { 
    isGenerating, 
    progress, 
    error, 
    generatedImage,
    startGeneration, 
    clearError 
  } = useImageGeneration();
  
  console.log('[APP_CONTENT] State:', { workflow, isGenerating, progress, error });

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
          width: 1024,
          height: 1024,
        },
        timestamp: new Date(),
      };

      setCurrentImage(newImage);
      setImageGallery((prev) => [newImage, ...prev]);
    }
  }, [generatedImage, isGenerating, generatedPrompt]);

  const handleGenerateFromParameters = async (params: GenerationParams) => {
    clearError();
    // Adapter les noms de paramètres pour l'API
    await startGeneration('default.json', {
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
  };

  const handleGenerateFromPoster = async (posterParams: PosterParams, genParams: GenerationParams) => {
    clearError();
    // Adapter les noms de paramètres pour l'API (workflow affiche.json)
    await startGeneration('affiche.json', {
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
    });
  };

  const handleSelectFromGallery = (image: GeneratedImage) => {
    setCurrentImage(image);
  };

  const handleCopyParameters = (image: GeneratedImage) => {
    console.log('Paramètres copiés:', image.params);
    navigator.clipboard.writeText(JSON.stringify(image.params, null, 2));
  };

  return (
    <>
      <Header />
      
      <ProgressOverlay 
        isVisible={isGenerating}
        progress={progress}
        label="Génération en cours…"
      />

      {error && (
        <div className="fixed top-20 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-40 flex items-center gap-3">
          <span>{error}</span>
          <button 
            onClick={clearError}
            className="hover:bg-red-700 px-2 py-1 rounded"
          >
            ✕
          </button>
        </div>
      )}
      
      <div className="flex h-[calc(100vh-64px)]">
        {/* Left Panel */}
        <div className="w-[480px] bg-gray-800 border-r border-gray-700 overflow-y-auto">
          <WorkflowSelector 
            currentWorkflow={workflow}
            onWorkflowChange={setWorkflow}
          />

          {/* Debug Info */}
          <div className="px-4 pb-4">
            <WorkflowDebug />
          </div>

          {workflow === 'parameters' ? (
            <GenerationParameters 
              onGenerate={handleGenerateFromParameters}
              isGenerating={isGenerating}
            />
          ) : (
            <PosterGenerator 
              onGenerate={handleGenerateFromPoster}
              isGenerating={isGenerating}
              onPromptGenerated={setGeneratedPrompt}
              generatedPrompt={generatedPrompt}
            />
          )}
        </div>

        {/* Right Panel - Preview */}
        <div className="flex-1 overflow-y-auto">
          <PreviewPanel 
            currentImage={currentImage}
            gallery={imageGallery}
            isGenerating={isGenerating}
            onSelectImage={handleSelectFromGallery}
            onCopyParameters={handleCopyParameters}
            generatedPrompt={generatedPrompt}
          />
        </div>
      </div>
    </>
  );
}
