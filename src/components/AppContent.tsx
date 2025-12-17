// ... (tes imports restent identiques)

export function AppContent() {
  // ... (tes états restent identiques)
  
  // Ajout d'une fonction de stockage pour la caméra
  const [cameraGenerateFn, setCameraGenerateFn] = useState<(() => void) | null>(null);

  const handleMainGenerate = () => {
    console.log("🟡 Bouton Jaune - Workflow actuel:", workflow);
    if (workflow === 'poster' && posterGenerateFn) {
      posterGenerateFn();
    } else if (workflow === 'camera' && cameraGenerateFn) {
      cameraGenerateFn();
    } else if (workflow === 'parameters' && parametersGenerateFn) {
      parametersGenerateFn();
    }
  };

  // ... (tes autres fonctions)

  return (
    <div className="bg-[#0f1117] min-h-screen text-white">
      <ProgressOverlay isVisible={isGenerating} progress={progress} />
      <Header />
      
      <main className="pt-24">
        <WorkflowCarousel selectedWorkflow={workflow} onSelectWorkflow={(w) => setWorkflow(w as WorkflowType)} />
        
        <div className="flex flex-col lg:flex-row border-t border-gray-800">
          <div className="w-full lg:w-1/2 border-r border-gray-800">
            {/* --- LOGIQUE DES MENUS DYNAMIQUE --- */}
            
            {workflow === 'poster' && (
              <PosterGenerator 
                onGenerate={handleGenerateFromPoster}
                isGenerating={isGenerating}
                onPromptGenerated={setGeneratedPrompt}
                generatedPrompt={generatedPrompt}
                imageDimensions={imageDimensions}
                onGetGenerateFunction={(fn) => setPosterGenerateFn(() => fn)}
              />
            )}

            {workflow === 'camera' && (
              <CameraAnglesGenerator 
                onGenerate={(params: any) => startGeneration('camera.json', params)}
                isGenerating={isGenerating}
                onGetGenerateFunction={(fn) => setCameraGenerateFn(() => fn)}
              />
            )}

            {workflow === 'parameters' && (
              <GenerationParameters 
                onGenerate={(g) => startGeneration('workflow.json', g)}
                isGenerating={isGenerating}
                onGetGenerateFunction={(fn) => setParametersGenerateFn(() => fn)}
              />
            )}
          </div>

          <div className="w-full lg:w-1/2 bg-[#0a0c10] p-8">
             {/* ... (Reste du PreviewPanel identique) ... */}
          </div>
        </div>
      </main>
    </div>
  );
}
