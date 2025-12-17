import { ChevronLeft, ChevronRight, ChevronsDown, Image as ImageIcon, AlertCircle } from 'lucide-react';
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
    <div className="bg-gray-900 border-b border-gray-800 relative z-20 overflow-hidden text-white uppercase">
      <div className="max-w-full mx-auto pt-4 sm:pt-12 pb-24">
        
        {/* Header STUDIO (Design inchangé) */}
        <div className="flex items-center justify-between mb-6 sm:mb-10 px-8 relative z-50">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tighter italic leading-none">STUDIO</h2>
          <div className="flex gap-3 sm:gap-4">
            <button onClick={() => navigate('prev')} className="p-3 sm:p-4 bg-gray-800/90 backdrop-blur-md hover:bg-gray-700 rounded-2xl border border-gray-700 transition-all active:scale-90">
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
            </button>
            <button onClick={() => navigate('next')} className="p-3 sm:p-4 bg-gray-800/90 backdrop-blur-md hover:bg-gray-700 rounded-2xl border border-gray-700 transition-all active:scale-90">
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Carousel */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth py-20 -my-20 px-[calc(50vw-140px)] snap-x snap-mandatory relative z-10 items-center"
        >
          {/* BLOC TEXTE ALIGNÉ À GAUCHE DANS LE CARROUSEL */}
          {selectedWorkflow === 'poster' && (
            <div className="relative flex-shrink-0 w-[280px] h-[350px] sm:h-[400px] snap-center flex items-center">
              <div className="bg-white/[0.03] border border-white/10 p-6 rounded-[32px] backdrop-blur-md w-full">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  <h3 className="text-amber-500 font-black text-[10px] tracking-[0.2em]">INFOS WORKFLOW</h3>
                </div>
                <p className="text-xs text-gray-400 normal-case leading-relaxed font-medium">
                  Le mode <span className="text-white">Affiche</span> permet d'ajouter un <span className="text-white">titre</span>, un <span className="text-white">sous-titre</span> et une <span className="text-white font-bold italic underline decoration-amber-500/30">baseline</span>.
                </p>
                <div className="flex gap-2 mt-6 pt-6 border-t border-white/5">
                  <AlertCircle className="w-4 h-4 text-amber-500/50 shrink-0" />
                  <p className="text-[10px] text-gray-500 normal-case italic leading-tight">
                    L'orthographe peut présenter des anomalies dues à l'IA. C'est une limite technique actuelle.
                  </p>
                </div>
              </div>
            </div>
          )}

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
                    group relative w-full rounded-[32px] border-2 transition-all duration-500 overflow-visible transform-gpu will-change-[transform,filter,opacity]
                    ${isSelected 
                      ? 'bg-gray-800 border-purple-500 shadow-[0_40px_80px_rgba(0,0,0,0.9)] -translate-y-8 scale-105 sm:scale-110 z-30 blur-none opacity-100' 
                      : 'bg-gray-900/60 border-gray-800 opacity-40 z-10 blur-[3px] scale-90 grayscale'
                    }
                  `}
                >
                  <div className="relative h-56 sm:h-64 w-full bg-gray-850 rounded-t-[30px] overflow-hidden">
                    {workflow.imageUrl ? (
                      <img 
                        src={workflow.imageUrl} 
                        alt={workflow.name} 
                        className="w-full h-full object-cover object-top transition-all duration-700 transform-gpu"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-900/50">
                        <ImageIcon className="w-12 h-12 text-gray-800 opacity-20" />
                      </div>
                    )}
                    
                    {workflow.id === 'poster' && (
                      <div className="absolute bottom-4 left-4 z-40 transform -rotate-12 transition-transform group-hover:rotate-0 duration-500">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-amber-500 rounded-full flex items-center justify-center p-1 shadow-[0_0_20px_rgba(245,158,11,0.4)] border-4 border-double border-amber-600 ring-2 ring-amber-400">
                          <div className="text-center">
                            <p className="text-[7px] sm:text-[8px] font-black text-amber-950 leading-none">VERSION</p>
                            <p className="text-[10px] sm:text-[12px] font-black text-amber-900 leading-none mt-0.5">BETA</p>
                            <div className="w-6 h-px bg-amber-900/30 mx-auto my-1" />
                            <p className="text-[5px] sm:text-[6px] font-bold text-amber-950/60 leading-none uppercase">Studio</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {isSelected && !workflow.comingSoon && (
                      <div className="absolute top-4 right-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-black tracking-widest shadow-lg z-40">
                        HD ACTIVE
                      </div>
                    )}
                  </div>

                  <div className="h-28 sm:h-32 p-6 bg-gray-800 flex flex-col items-center justify-center rounded-b-[30px] relative">
                    <h3 className={`
                      text-white font-black tracking-tight text-center transition-all duration-500 w-full uppercase
                      ${isSelected ? 'text-xl sm:text-2xl italic leading-tight' : 'text-base sm:text-lg leading-snug'}
                    `}>
                      {workflow.name}
                    </h3>
                    {workflow.comingSoon && (
                      <span className="text-[9px] sm:text-[10px] text-yellow-500/60 mt-1 sm:mt-2 tracking-[0.2em] font-bold">
                        COMING SOON
                      </span>
                    )}

                    {isSelected && !workflow.comingSoon && (
                      <div className="absolute -bottom-10 left-0 right-0 flex justify-center animate-bounce pointer-events-none">
                        <ChevronsDown className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500" />
                      </div>
                    )}
                  </div>
                </button>
              </div>
            );
          })}
          
          <div className="flex-shrink-0 w-1" aria-hidden="true"></div>
        </div>
      </div>
    </div>
  );
});
