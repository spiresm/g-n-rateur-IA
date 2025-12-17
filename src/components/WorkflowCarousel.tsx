import { ChevronLeft, ChevronRight, Check, Image as ImageIcon } from 'lucide-react';
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

  const handleScroll = () => {
    if (!scrollRef.current || isInternalScroll.current) return;
    const container = scrollRef.current;
    const cardWidth = 280 + 24; 
    const index = Math.round(container.scrollLeft / cardWidth);
    
    const targetWorkflow = allWorkflows[index];
    if (targetWorkflow && targetWorkflow.id !== selectedWorkflow && !targetWorkflow.comingSoon) {
      onSelectWorkflow(targetWorkflow.id);
    }
  };

  const navigate = (direction: 'next' | 'prev') => {
    const currentIndex = allWorkflows.findIndex(w => w.id === selectedWorkflow);
    let nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    nextIndex = Math.max(0, Math.min(nextIndex, allWorkflows.length - 1));
    
    const nextWorkflow = allWorkflows[nextIndex];
    if (!nextWorkflow.comingSoon) {
      onSelectWorkflow(nextWorkflow.id);
      scrollToIndex(nextIndex);
    }
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
      <div className="max-w-full mx-auto pt-8 pb-10">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8 px-8">
          <div className="flex flex-col">
            <h2 className="text-white text-2xl font-black tracking-tighter uppercase italic">Workflows</h2>
            <p className="text-gray-500 text-sm font-medium">Sélectionnez votre moteur de création</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate('prev')} className="p-3 bg-gray-800 hover:bg-gray-700 rounded-xl border border-gray-700 transition-all active:scale-95">
              <ChevronLeft className="w-6 h-6 text-gray-400" />
            </button>
            <button onClick={() => navigate('next')} className="p-3 bg-gray-800 hover:bg-gray-700 rounded-xl border border-gray-700 transition-all active:scale-95">
              <ChevronRight className="w-6 h-6 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Carousel */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth py-12 -my-12 px-[calc(50vw-140px)] snap-x snap-mandatory"
        >
          {allWorkflows.map((workflow) => {
            const isSelected = selectedWorkflow === workflow.id;
            return (
              <button
                key={workflow.id}
                onClick={() => {
                  if (!workflow.comingSoon) {
                    onSelectWorkflow(workflow.id);
                    scrollToIndex(allWorkflows.indexOf(workflow));
                  }
                }}
                className={`
                  group relative flex-shrink-0 w-[280px] rounded-3xl border-2 transition-all duration-700 snap-center overflow-hidden
                  ${isSelected && !workflow.comingSoon
                    ? 'bg-gray-800 border-purple-500 shadow-[0_30px_60px_rgba(0,0,0,0.8)] -translate-y-6 scale-110 z-50 blur-none' 
                    : 'bg-gray-900/40 border-gray-800 opacity-60 z-10 blur-[2px] scale-95'
                  }
                `}
              >
                {/* Image Justifiée Haut */}
                <div className="relative h-56 w-full bg-gray-850">
                  {workflow.imageUrl ? (
                    <img 
                      src={workflow.imageUrl} 
                      alt={workflow.name} 
                      className={`
                        w-full h-full object-cover object-top transition-all duration-1000
                        ${isSelected ? 'scale-110' : 'grayscale opacity-50'}
                      `}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-900/50">
                      <ImageIcon className="w-10 h-10 text-gray-800" />
                    </div>
                  )}
                  
                  {isSelected && !workflow.comingSoon && (
                    <div className="absolute top-4 right-4 bg-purple-600 text-white px-3 py-1 rounded-full text-[10px] font-black shadow-2xl animate-in fade-in zoom-in duration-500">
                      HD ACTIVE
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-800 via-transparent to-transparent opacity-80" />
                </div>

                {/* Titre large sans icône */}
                <div className="p-6 bg-gray-800 flex justify-center">
                  <h3 className={`
                    text-white font-black tracking-tight text-center leading-tight transition-all duration-500
                    ${isSelected ? 'text-xl uppercase italic' : 'text-lg opacity-50'}
                  `}>
                    {workflow.name}
                    {workflow.comingSoon && <span className="block text-[10px] text-yellow-500/50 mt-1 italic font-normal">Coming Soon</span>}
                  </h3>
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
