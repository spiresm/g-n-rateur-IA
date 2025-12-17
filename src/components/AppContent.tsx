import { useState, useEffect, useCallback } from 'react';
import { useImageGeneration } from '../hooks/useImageGeneration'; 
import { useAuth } from '../contexts/AuthContext';

// Composants
import { Header } from './Header';
import { WorkflowCarousel } from './WorkflowCarousel';
import { GenerationParameters } from './GenerationParameters';
import PosterGenerator from './PosterGenerator'; 
import { CameraAnglesGenerator } from './CameraAnglesGenerator';
import { PreviewPanel } from './PreviewPanel';
import { ProgressOverlay } from './ProgressOverlay';

import type { GenerationParams, PosterParams, GeneratedImage, WorkflowType } from '../App';

export function AppContent() {
  const { isGenerating, progress, startGeneration, clearError, generatedImage } = useImageGeneration();
  
  const [workflow, setWorkflow] = useState<WorkflowType>('poster');
  const [currentImage, setCurrentImage] = useState<GeneratedImage | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [imageDimensions, setImageDimensions] = useState({ width: 1080, height: 1920 });

  // Stockage des fonctions de déclenchement
  const [posterGenFn, setPosterGenFn] = useState<(() => void) | null>(null);
  const [cameraGenFn, setCameraGenFn] = useState<(() => void) | null>(null);
  const [paramGenFn, setParamGenFn] = useState<(() => void) | null>(null);

  const handleMainGenerate = () => {
    console.log("🟡 Clic Bouton Jaune - Workflow:", workflow);
    if (workflow === 'poster' && posterGenFn) posterGenFn();
    if (workflow === 'camera' && cameraGenFn) cameraGenFn();
    if (workflow === 'parameters' && paramGenFn) paramGenFn();
  };

  // Wrapper sécurisé pour startGeneration (évite l'erreur "f is not a function")
  const safeStart = async (file: string, params: any) => {
    try {
      if (typeof clearError === 'function') clearError(); 
      await startGeneration(file, params);
    } catch (e) {
      console.error("Erreur génération:", e);
    }
  };

  return (
    <div className="bg-[#0f1117] min-h-screen text-white">
      <ProgressOverlay isVisible={isGenerating} progress={progress} />
      <Header />
      
      <main className="pt-24">
        <WorkflowCarousel selectedWorkflow={workflow} onSelectWorkflow={(w) => setWorkflow(w as WorkflowType)} />
        
        <div className="flex flex-col lg:flex-row border-t border-gray-800">
          {/* ZONE DES MENUS (PANNEAU GAUCHE) */}
          <div className="w-full lg:w-1/2 border-r border-gray-800 min-h-[500px]">
            
            {/* WORKFLOW 1 : AFFICHE */}
            {workflow === 'poster' && (
              <PosterGenerator 
                onGenerate={(p, g) => safeStart('affiche.json', { ...g, user_menu_prompt: g.prompt })}
                isGenerating={isGenerating}
                onPromptGenerated={setGeneratedPrompt}
                generatedPrompt={generatedPrompt}
                imageDimensions={imageDimensions}
                onGetGenerateFunction={(fn) => setPosterGenFn(() => fn)}
              />
            )}

            {/* WORKFLOW 2 : CAMERA (Auparavant masqué ou buggé) */}
            {workflow === 'camera' && (
              <CameraAnglesGenerator 
                onGenerate={(p) => safeStart('camera-angles.json', p)}
                isGenerating={isGenerating}
                onGetGenerateFunction={(fn) => setCameraGenFn(() => fn)}
              />
            )}

            {/* WORKFLOW 3 : PARAMETRES */}
            {workflow === 'parameters' && (
              <GenerationParameters 
                onGenerate={(g) => safeStart('workflow.json', g)}
                isGenerating={isGenerating}
                onGetGenerateFunction={(fn) => setParamGenFn(() => fn)}
              />
            )}
          </div>

          {/* PANNEAU DROIT (BOUTON & PREVIEW) */}
          <div className="w-full lg:w-1/2 bg-[#0a0c10] p-8">
            <div className="max-w-md mx-auto space-y-8">
              <button 
                onClick={handleMainGenerate}
                disabled={isGenerating}
                className="w-full bg-gradient-to-b from-[#FFEA00] to-[#FFB200] text-black font-black py-6 rounded-2xl text-2xl uppercase shadow-2xl active:scale-95 transition-all"
              >
                {isGenerating ? 'Génération...' : 'Lancer la création'}
              </button>

              <PreviewPanel 
                currentImage={currentImage || generatedImage} 
                isGenerating={isGenerating}
                onSelectImage={setCurrentImage}
                generatedPrompt={generatedPrompt}
                onFormatChange={(w, h) => setImageDimensions({ width: w, height: h })}
                savedGallery={[]} onCopyParameters={() => {}} onSaveToGallery={() => {}}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
