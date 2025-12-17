import { useState, useEffect, useRef, useCallback } from 'react';
// 🔥 CORRECTION : Ajout des accolades car c'est un export nommé
import { useImageGeneration } from '../hooks/useImageGeneration'; 
import { useAuth } from '../contexts/AuthContext';
import { useQuotaSystemStatus } from '../hooks/useQuotaSystemStatus';
import { api } from '../services/api';
import type { GenerationParams, PosterParams, CameraAnglesParams, GeneratedImage, WorkflowType } from '../App';
import { Header } from './Header';
import { WorkflowCarousel } from './WorkflowCarousel';
import { GenerationParameters } from './GenerationParameters';
// Attention : vérifie si PosterGenerator est bien exporté de useImageGeneration ou si c'est un autre fichier
import PosterGenerator from './PosterGenerator';
import { CameraAnglesGenerator } from './CameraAnglesGenerator';
import { PreviewPanel } from './PreviewPanel';
import { ProgressOverlay } from './ProgressOverlay';

export function AppContent() {
  const { user } = useAuth();
  
  // Cette ligne va maintenant fonctionner car l'import possède les { }
  const { isGenerating, progress, startGeneration, clearError, generatedImage } = useImageGeneration();
  
  const [workflow, setWorkflow] = useState<WorkflowType>('poster');
  const [currentImage, setCurrentImage] = useState<GeneratedImage | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [imageDimensions, setImageDimensions] = useState({ width: 1080, height: 1920 });

  const [posterGenerateFn, setPosterGenerateFn] = useState<(() => void) | null>(null);
  const [parametersGenerateFn, setParametersGenerateFn] = useState<(() => void) | null>(null);

  const handleMainGenerate = () => {
    console.log("🟡 Bouton Jaune - Workflow actuel:", workflow);
    if (workflow === 'poster' && posterGenerateFn) {
      posterGenerateFn();
    } else if (workflow === 'parameters' && parametersGenerateFn) {
      parametersGenerateFn();
    }
  };

  const handleGenerateFromPoster = useCallback(async (p: PosterParams, g: GenerationParams) => {
    if (clearError) clearError();
    console.log("🚀 Envoi vers ComfyUI via Render...");
    
    // On utilise startGeneration du hook useImageGeneration
    await startGeneration('affiche.json', { 
      ...g, 
      user_menu_prompt: g.prompt // Alignement avec ton FastAPI (main.py)
    });
  }, [startGeneration, clearError]);

  return (
    <div className="bg-[#0f1117] min-h-screen text-white">
      <ProgressOverlay isVisible={isGenerating} progress={progress} />
      <Header />
      
      <main className="pt-24">
        <WorkflowCarousel selectedWorkflow={workflow} onSelectWorkflow={(w) => setWorkflow(w as WorkflowType)} />
        
        <div className="flex flex-col lg:flex-row border-t border-gray-800">
          <div className="w-full lg:w-1/2 border-r border-gray-800">
            {workflow === 'poster' ? (
              /* NOTE : Si PosterGenerator est le même fichier que useImageGeneration, 
                 assure-toi que tu n'as pas de conflit de nom. 
              */
              <PosterGenerator 
                onGenerate={handleGenerateFromPoster}
                isGenerating={isGenerating}
                onPromptGenerated={setGeneratedPrompt}
                generatedPrompt={generatedPrompt}
                imageDimensions={imageDimensions}
                onGetGenerateFunction={(fn) => setPosterGenerateFn(() => fn)}
              />
            ) : (
              <GenerationParameters 
                onGenerate={(g) => startGeneration('workflow.json', g)}
                isGenerating={isGenerating}
                onGetGenerateFunction={(fn) => setParametersGenerateFn(() => fn)}
              />
            )}
          </div>

          <div className="w-full lg:w-1/2 bg-[#0a0c10] p-8">
            <div className="max-w-md mx-auto space-y-8">
              <button 
                onClick={handleMainGenerate}
                disabled={isGenerating}
                className="w-full bg-gradient-to-b from-[#FFEA00] to-[#FFB200] text-black font-black py-6 rounded-2xl text-2xl uppercase shadow-2xl active:scale-95 transition-all disabled:opacity-30 disabled:grayscale"
              >
                {isGenerating ? 'Génération...' : 'Lancer la création'}
              </button>

              <PreviewPanel 
                currentImage={currentImage || generatedImage} 
                savedGallery={[]}
                isGenerating={isGenerating}
                onSelectImage={setCurrentImage}
                onCopyParameters={() => {}}
                onSaveToGallery={() => {}}
                generatedPrompt={generatedPrompt}
                onFormatChange={(w, h) => setImageDimensions({ width: w, height: h })}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
