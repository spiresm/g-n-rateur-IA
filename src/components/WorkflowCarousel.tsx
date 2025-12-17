import { ChevronLeft, ChevronRight, ChevronsDown, Image as ImageIcon, AlertCircle, Camera, Layout, Settings2 } from 'lucide-react';
import { useState, memo, useRef } from 'react';

export type WorkflowType = 'poster' | 'parameters' | 'cameraAngles' | 'future2' | string;

interface WorkflowOption {
  id: WorkflowType;
  name: string;
  imageUrl: string; 
  comingSoon?: boolean;
}

const mainWorkflows: WorkflowOption[] = [
  { id: 'poster', name: "Générateur d'Affiches", imageUrl: '/vignettes/vignette_affiche.png' },
  { id: 'cameraAngles', name: 'Angles de Caméra', imageUrl: '/vignettes/vignette_camera.png' },
  { id: 'parameters', name: 'Image', imageUrl: '/vignettes/vignette_image.png' },
  { id: 'future2', name: 'Batch', imageUrl: '/vignettes/vignette_batch.png', comingSoon: true },
];

const emptyWorkflows: WorkflowOption[] = Array.from({ length: 10 }, (_, i) => ({
  id: `empty-${i + 1}`,
  name: `Workflow ${i + 5}`,
  imageUrl: '',
  comingSoon: true,
}));

const allWorkflows = [...mainWorkflows, ...emptyWorkflows];

export const WorkflowCarousel = memo(function WorkflowCarousel({ selectedWorkflow, onSelectWorkflow }: { selectedWorkflow: WorkflowType; onSelectWorkflow: (w: WorkflowType) => void }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isInternalScroll = useRef(false);

  // Configuration des textes (Ton plus pro et design aligné)
  const workflowDetails: Record<string, { title: string, desc: string, icon: any, note?: string }> = {
    poster: {
      title: "ARCHITECTURE AFFICHE",
      desc: "Conception graphique optimisée. Intégration native d'un titre, d'un sous-titre et d'une baseline pour un rendu publicitaire complet.",
      icon: Layout,
      note: "L'orthographe générée par l'IA peut présenter des anomalies inhérentes à cette technologie."
    },
    cameraAngles: {
      title: "CONTRÔLE D'ANGLE",
      desc: "Ré-imagination spatiale. Importez votre image et redéfinissez l'angle de vue parmis une sélection de mouvements de caméra cinématographiques.",
      icon: Camera,
    },
    parameters: {
      title: "MOTEUR CRÉATIF",
      desc: "Génération par prompt haute fidélité. Ajustez les paramètres de rendu et utilisez les prompts négatifs pour une précision absolue.",
      icon: Settings2,
    }
  };

  const currentDetail = workflowDetails[selectedWorkflow];

  const handleScroll = () => {
    if (!scrollRef.current || isInternalScroll.current) return;
    const container = scrollRef.current;
    const cardWidth = 280 + 24; 
    const index = Math.round(container.scrollLeft / cardWidth);
    const targetWorkflow = allWorkflows[index];
    if (targetWorkflow && targetWorkflow.id !== selectedWorkflow) {
      onSelectWorkflow(targetWorkflow.id);
    }
  };

  const navigate = (direction: 'next' | 'prev') => {
    const currentIndex = allWorkflows.findIndex(w => w.id === selectedWorkflow);
    let nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    nextIndex = Math.max(0, Math.min(nextIndex, allWorkflows.length - 1));
    onSelectWorkflow(allWorkflows[nextIndex].id);
    scrollToIndex(nextIndex);
  };

  const scrollToIndex = (index: number) => {
    if (!scrollRef.current) return;
    const cardWidth = 280 + 24;
    isInternalScroll.current = true;
    scrollRef.current.scrollTo({ left: index * cardWidth, behavior: 'smooth' });
    setTimeout(() => { isInternalScroll.current = false; }, 500);
  };

  return (
    <div className="bg-[#0f0f13] border-b border-white/5 relative z-20 overflow-hidden text-white uppercase font-sans">
      <div className="max-w-full mx-auto pt-4 sm:pt-12 pb-24 relative">
        
        {/* Header STUDIO - Design FIGMA */}
        <div className="flex items-center justify-between mb-6 sm:mb-10 px-8 relative z-50">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tighter italic leading-none flex items-center gap-4">
            STUDIO
            {currentDetail && (
              <span className="h-px w-12 bg-white/10 hidden sm:block"></span>
            )}
          </h2>
          <div className="flex gap-3 sm:gap-4">
            <button onClick={() => navigate('prev')} className="p-3 sm:p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all active:scale-90">
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
            </button>
            <button onClick={() => navigate('next')} className="p-3 sm:p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all active:scale-90">
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
            </button>
          </div>
        </div>

        {/* BLOC DESCRIPTION DYNAMIQUE (Aligné sur le design Global) */}
        {currentDetail && (
          <div className="absolute left-8 top-32 z-[60] w-72 hidden lg:block animate-in fade-in slide-in-from-left-4 duration-700 pointer-events-none">
            <div className="bg-[#0f0f13]/60 backdrop-blur-3xl border border-white/10 p-6 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                  <currentDetail.icon className="w-4 h-4 text-black" />
                </div>
                <h3 className="text-yellow-500 font-black text-[10px] tracking-[0.2em]">{currentDetail.title}</h3>
              </div>
              
              <p className="text-[12px] text-gray-400 normal-case leading-relaxed font-medium mb-4">
                {currentDetail.desc}
              </p>
              
              {currentDetail.note && (
                <div className="pt-4 border-t border-white/5 flex gap-3">
                  <AlertCircle className="w-4 h-4 text-white/20 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-gray-500 normal-case italic leading-tight">
                    {currentDetail.note}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Carousel (Centrage maintenu) */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth py-20 -my-20 px-[calc(50vw-140px)] snap-x snap-mandatory relative z-10"
        >
          {allWorkflows.map((workflow) => {
            const isSelected = selectedWorkflow === workflow.id;
            return (
              <div key={workflow.id} className="relative flex-shrink-0 w-[280px] snap-center flex justify-center">
                <button
                  onClick={() => {
                    onSelectWorkflow(workflow.id);
                    scrollToIndex(allWorkflows.indexOf(workflow));
                  }}
                  className={`
                    group relative w-full rounded-[32px] border-2 transition-all duration-500 overflow-visible transform-gpu
                    ${isSelected 
                      ? 'bg-[#1a1a1e] border-yellow-500 shadow-[0_40px_80px_rgba(0,0,0,0.9)] -translate-y-8 scale-110 z-30 opacity-100' 
                      : 'bg-[#0f0f13]/60 border-white/5 opacity-40 z-10 blur-[2px] scale-90 grayscale'
                    }
                  `}
                >
                  <div className="relative h-56 sm:h-64 w-full bg-[#0f0f13] rounded-t-[30px] overflow-hidden">
                    {workflow.imageUrl ? (
                      <img src={workflow.imageUrl} alt={workflow.name} className="w-full h-full object-cover object-top" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-12 h-12 text-white/5" />
                      </div>
                    )}
                    
                    {workflow.id === 'poster' && (
                      <div className="absolute bottom-4 left-4 z-40 transform -rotate-12">
                        <div className="w-20 h-20 bg-yellow-500 rounded-full flex items-center justify-center p-1 shadow-2xl border-4 border-double border-yellow-600 ring-2 ring-yellow-400">
                          <div className="text-center">
                            <p className="text-[8px] font-black text-black leading-none">VERSION</p>
                            <p className="text-[12px] font-black text-black leading-none mt-0.5">BETA</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="h-28 sm:h-32 p-6 bg-[#1a1a1e] flex flex-col items-center justify-center rounded-b-[30px]">
                    <h3 className={`text-white font-black tracking-tight text-center transition-all duration-500 w-full uppercase ${isSelected ? 'text-2xl italic text-yellow-500' : 'text-lg text-white/60'}`}>
                      {workflow.name}
                    </h3>
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});
