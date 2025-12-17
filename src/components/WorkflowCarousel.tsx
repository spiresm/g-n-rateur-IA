import { ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
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
  { id: 'parameters', name: 'Image', imageUrl: '/vignettes/vignette_parametres.png' },
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

  // Détection de la carte au centre pour la sélection
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
    <div className="bg-gray-900 border-b border-gray-800 relative z-20 overflow-hidden">
      <div className="max-w-full mx-auto pt-12 pb-14">
        
        {/* Navigation Header */}
        <div className="flex items-center justify-between mb-10 px-8">
          <div className="flex flex-col">
            <h2 className="text-white text-3xl font-black tracking-tighter uppercase italic leading-none">Moteurs IA</h2>
            <p className="text-gray-500 text-sm mt-2 font-medium">Faites défiler pour choisir votre workflow</p>
          </div>
          <div className="flex gap-4">
            <button onClick={() => navigate('prev')} className="p-4 bg-gray-800 hover:bg-gray-700 rounded-2xl border border-gray-700 transition-all active:scale-90">
              <ChevronLeft className="w-6 h-6 text-gray-400" />
            </button>
            <button onClick={() => navigate('next')} className="p-4 bg-gray-800 hover:bg-gray-700 rounded-2xl border border-gray-700 transition-all active:scale-90">
              <ChevronRight className="w-6 h-6 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Carousel Container */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth py-16 -my-16 px-[calc(50vw-140px)] snap-x snap-mandatory"
        >
          {allWorkflows.map((workflow) => {
            const isSelected = selectedWorkflow === workflow.id;
            
            return (
              <button
                key={workflow.id}
                onClick={() => {
                  onSelectWorkflow(workflow.id);
                  scrollToIndex(allWorkflows.indexOf(workflow));
                }}
                className={`
                  group relative flex-shrink-0 w-[280px] rounded-[32px] border-2 transition-all duration-700 snap-center overflow-hidden
                  ${isSelected 
                    ? 'bg-gray-800 border-purple-500 shadow-[0_40px_80px_rgba(0,0,0,0.9)] -translate-y-8 scale-110 z-50 blur-none opacity-100' 
                    : 'bg-gray-900/60 border-gray-800 opacity-40 z-10 blur-[4px] scale-90 grayscale'
                  }
                `}
              >
                {/* Image Area - Justifiée en haut */}
                <div className="relative h-64 w-full bg-gray-850">
                  {workflow.imageUrl ? (
                    <img 
                      src={workflow.imageUrl} 
                      alt={workflow.name} 
                      className={`
                        w-full h-full object-cover object-top transition-all duration-1000
                        ${isSelected ? 'scale-110' : 'scale-100'}
                      `}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-900/50">
                      <ImageIcon className="w-12 h-12 text-gray-800 opacity-20" />
                    </div>
                  )}
                  
                  {/* Badge HD minimaliste */}
                  {isSelected && !workflow.comingSoon && (
                    <div className="absolute top-5 right-5 bg-white/10 backdrop-blur-md text-white border border-white/20 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase">
                      HD active
                    </div>
                  )}
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-800 via-transparent to-transparent opacity-90" />
                </div>

                {/* Text Area Area - Titre Large */}
                <div className="p-8 bg-gray-800 flex flex-col items-center justify-center min-h-[100px]">
                  <h3 className={`
                    text-white font-black tracking-tight text-center leading-tight transition-all duration-500
                    ${isSelected ? 'text-2xl uppercase italic' : 'text-lg'}
                  `}>
                    {workflow.name}
                  </h3>
                  {workflow.comingSoon && (
                    <span className="text-[10px] text-yellow-500/60 mt-2 uppercase tracking-[0.2em] font-bold">
                      Coming Soon
                    </span>
                  )}
                </div>
              </button>
            );
          })}
          
          <div className="flex-shrink-0 w-1" aria-hidden="true"></div>
        </div>
      </div>
    </div>
  );
});
