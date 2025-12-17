import { ChevronLeft, ChevronRight, ChevronsDown, Image as ImageIcon, AlertCircle, Camera, Layout, Settings2 } from 'lucide-react';
import { useState, memo, useRef, useMemo } from 'react';

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

export const WorkflowCarousel = memo(function WorkflowCarousel({ 
  selectedWorkflow, 
  onSelectWorkflow 
}: { 
  selectedWorkflow: WorkflowType; 
  onSelectWorkflow: (w: WorkflowType) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isInternalScroll = useRef(false);

  // Textes explicatifs optimisés
  const workflowDetails: Record<string, { title: string, desc: string, icon: any, note?: string }> = {
    poster: {
      title: "MODE AFFICHE",
      desc: "Conception graphique avancée. Ce workflow permet d'intégrer un titre, un sous-titre et une baseline directement dans votre image.",
      icon: Layout,
      note: "L'orthographe générée par l'IA peut présenter des anomalies."
    },
    cameraAngles: {
      title: "ANGLE DE VUE",
      desc: "Importez votre image source et l'IA se charge de réaliser l'angle de vue que vous désirez parmi les choix disponibles.",
      icon: Camera,
    },
    parameters: {
      title: "CRÉATION LIBRE",
      desc: "Génération d'image basée sur un prompt positif et négatif avec ajustements précis des paramètres.",
      icon: Settings2,
    }
  };

  const currentDetail = workflowDetails[selectedWorkflow];

  const selectedIndex = useMemo(() => 
    allWorkflows.findIndex(w => w.id === selectedWorkflow), 
    [selectedWorkflow]
  );

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
      <div className="max-w-full mx-auto pt-4 sm:pt-12 pb-24 relative">
        
        {/* HEADER : STUDIO + QUOTA 10/10 */}
        <div className="flex items-center justify-between mb-6 sm:mb-10 px-8 relative z-50">
          <div className="flex items-center gap-6">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tighter italic leading-none">STUDIO</h2>
            
            {/* Nouveau Quota stylisé */}
            <div className="flex items-center gap-3 px-4 py-2 bg-black/40 border border-white/10 rounded-2xl backdrop-blur-md">
              <div className="flex flex-col">
                <span className="text-[8px] text-gray-500 font-bold tracking-[0.2em] leading-none mb-1">QUOTA</span>
                <span className="text-xs font-black tracking-widest text-purple-400 leading-none">10/10</span>
              </div>
              <div className="w-[1px] h-6 bg-white/10 mx-1" />
              <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)] animate-pulse" />
            </div>
          </div>

          <div className="flex gap-3 sm:gap-4">
            <button onClick={() => navigate('prev')} className="p-3 sm:p-4 bg-gray-800/90 backdrop-blur-md hover:bg-gray-700 rounded-2xl border border-gray-700 transition-all active:scale-90">
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
            </button>
            <button onClick={() => navigate('next')} className="p-3 sm:p-4 bg-gray-800/90 backdrop-blur-md hover:bg-gray-700 rounded-2xl border border-gray-700 transition-all active:scale-90">
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
            </button>
          </div>
        </div>

        {/* PANNEAU EXPLICATIF */}
        {currentDetail && (
          <div className="absolute left-8 top-32 z-[60] w-72 hidden lg:block animate-in fade-in slide-in-from-left-4 duration-700 pointer-events-none">
            <div className="bg-gray-950/40 backdrop-blur-xl border border-white/5 p-6 rounded-[32px] shadow-2xl">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                <h3 className="text-yellow-500 font-black text-[10px] tracking-[0.2em]">{currentDetail.title}</h3>
              </div>
              <p className="text-[12px] text-gray-300 normal-case leading-relaxed font-medium">
                {currentDetail.desc}
              </p>
              {currentDetail.note && (
                <div className="mt-4 pt-4 border-t border-white/5 flex gap-2">
                  <AlertCircle className="w-3.5 h-3.5 text-gray-600 shrink-0 mt-0.5" />
                  <p className="text-[9px] text-gray-600 normal-case italic leading-tight">
                    {currentDetail.note}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* CAROUSEL AVEC PROFONDEUR DE CHAMP */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth py-20 -my-20 px-[calc(50vw-140px)] snap-x snap-mandatory relative z-10 items-center"
        >
          {allWorkflows.map((workflow, index) => {
            const isSelected = selectedWorkflow === workflow.id;
            const distance = Math.abs(index - selectedIndex);

            let opacity = "opacity-100";
            let blur = "blur-none";
            let scale = "scale-100";

            if (!isSelected) {
              if (distance === 1) {
                opacity = "opacity-40";
                blur = "blur-[2px]";
                scale = "scale-95";
              } else {
                opacity = "opacity-5"; // Encore plus transparent pour les lointaines
                blur = "blur-[8px]";
                scale = "scale-75";
              }
            }

            return (
              <div key={workflow.id} className="relative flex-shrink-0 w-[280px] snap-center flex justify-center">
                <button
                  onClick={() => {
                    onSelectWorkflow(workflow.id);
                    scrollToIndex(index);
                  }}
                  className={`
                    group relative w-full rounded-[32px] border-2 transition-all duration-700 overflow-visible transform-gpu
                    ${opacity} ${blur} ${scale}
                    ${isSelected 
                      ? 'bg-gray-800 border-purple-500 shadow-[0_40px_80px_rgba(0,0,0,0.9)] -translate-y-8 scale-110 z-30' 
                      : 'bg-gray-900/60 border-gray-800 z-10 grayscale'
                    }
                  `}
                >
                  <div className="relative h-56 sm:h-64 w-full bg-gray-850 rounded-t-[30px] overflow-hidden">
                    {workflow.imageUrl ? (
                      <img src={workflow.imageUrl} alt={workflow.name} className="w-full h-full object-cover object-top" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-12 h-12 text-white/5" />
                      </div>
                    )}
                  </div>

                  <div className="h-28 sm:h-32 p-6 bg-gray-800 flex flex-col items-center justify-center rounded-b-[30px] relative">
                    <h3 className={`text-white font-black tracking-tight text-center transition-all duration-500 w-full uppercase ${isSelected ? 'text-2xl italic' : 'text-lg'}`}>
                      {workflow.name}
                    </h3>

                    {/* GRANDE FLÈCHE DE FOCUS */}
                    {isSelected && !workflow.comingSoon && (
                      <div className="absolute -bottom-14 left-0 right-0 flex justify-center animate-bounce pointer-events-none">
                        <ChevronsDown className="w-12 h-12 text-purple-500 drop-shadow-[0_0_15px_rgba(168,85,247,0.6)]" />
                      </div>
                    )}
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
