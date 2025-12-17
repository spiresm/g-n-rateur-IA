import { ChevronLeft, ChevronRight, ChevronsDown, Image as ImageIcon, AlertCircle, Camera, Layout, Settings2 } from 'lucide-react';
import { memo, useRef, useMemo, useEffect } from 'react';

export type WorkflowType = 'poster' | 'parameters' | 'cameraAngles' | 'future2' | string;

interface WorkflowOption {
  id: WorkflowType;
  name: string;
  imageUrl: string; 
  comingSoon?: boolean;
}

const mainWorkflows: WorkflowOption[] = [
  { id: 'poster', name: "GÉNÉRATEUR D'AFFICHES", imageUrl: '/vignettes/vignette_affiche.png' },
  { id: 'cameraAngles', name: 'ANGLES DE CAMÉRA', imageUrl: '/vignettes/vignette_camera.png' },
  { id: 'parameters', name: 'CRÉATION LIBRE', imageUrl: '/vignettes/vignette_image.png' },
  { id: 'future2', name: 'BATCH', imageUrl: '/vignettes/vignette_batch.png', comingSoon: true },
];

const emptyWorkflows: WorkflowOption[] = Array.from({ length: 6 }, (_, i) => ({
  id: `empty-${i + 1}`,
  name: `WORKFLOW ${i + 5}`,
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

  // Fonction de centrage parfaite
  const scrollToIndex = (index: number, behavior: ScrollBehavior = 'smooth') => {
    if (!scrollRef.current) return;
    const cardWidth = 280 + 24; // w-72 (280px) + gap-6 (24px)
    isInternalScroll.current = true;
    
    // On scroll pour que l'index soit au début du conteneur
    // Le padding px-[calc(50vw-140px)] fera le reste pour centrer
    scrollRef.current.scrollTo({ 
      left: index * cardWidth, 
      behavior 
    });

    setTimeout(() => { isInternalScroll.current = false; }, 500);
  };

  // Centrage immédiat au chargement
  useEffect(() => {
    const timer = setTimeout(() => scrollToIndex(selectedIndex, 'auto'), 50);
    return () => clearTimeout(timer);
  }, []);

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
    scrollToIndex(nextIndex, 'smooth');
  };

  return (
    <div className="bg-[#0f1117] border-b border-gray-800 relative z-10 overflow-hidden text-white uppercase mt-24 sm:mt-32">
      <div className="max-w-full mx-auto pt-8 pb-32 relative">
        
        {/* Titre Studio & Flèches */}
        <div className="flex items-center justify-between mb-2 px-12 relative z-50">
          <h2 className="text-4xl font-black tracking-tighter italic leading-none">STUDIO</h2>
          <div className="flex gap-4">
            <button onClick={() => navigate('prev')} className="p-3 bg-gray-800/50 hover:bg-gray-700 rounded-xl border border-gray-700 transition-all">
              <ChevronLeft className="w-6 h-6 text-gray-400" />
            </button>
            <button onClick={() => navigate('next')} className="p-3 bg-gray-800/50 hover:bg-gray-700 rounded-xl border border-gray-700 transition-all">
              <ChevronRight className="w-6 h-6 text-gray-400" />
            </button>
          </div>
        </div>

        <div className="relative flex items-center h-[500px]">
          {/* Panneau latéral gauche */}
          {currentDetail && (
            <div className="absolute left-12 top-1/2 -translate-y-1/2 z-[60] w-72 hidden lg:block animate-in fade-in slide-in-from-left-8 duration-1000">
              <div className="bg-gray-900/40 backdrop-blur-xl border border-white/5 p-8 rounded-[40px] shadow-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-2 h-2 rounded-full bg-yellow-500 shadow-[0_0_8px_#eab308]" />
                  <h3 className="text-yellow-500 font-black text-xs tracking-[0.3em]">{currentDetail.title}</h3>
                </div>
                <p className="text-[13px] text-gray-300 normal-case leading-relaxed font-medium mb-4">
                  {currentDetail.desc}
                </p>
                {currentDetail.note && (
                  <div className="flex gap-2 opacity-50 italic">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <p className="text-[10px] normal-case">{currentDetail.note}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Carousel */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth py-24 px-[calc(50vw-140px)] snap-x snap-mandatory relative z-10 items-center w-full"
          >
            {allWorkflows.map((workflow, index) => {
              const isSelected = selectedWorkflow === workflow.id;
              const distance = Math.abs(index - selectedIndex);
              
              const opacity = isSelected ? "opacity-100" : (distance === 1 ? "opacity-30" : "opacity-0");
              const blur = isSelected ? "blur-none" : "blur-md";
              const scale = isSelected ? "scale-110" : "scale-90";

              return (
                <div key={workflow.id} className="relative flex-shrink-0 w-[280px] snap-center flex justify-center py-10">
                  <button
                    onClick={() => {
                      onSelectWorkflow(workflow.id);
                      scrollToIndex(index, 'smooth');
                    }}
                    className={`
                      group relative w-full rounded-[40px] border-2 transition-all duration-700 transform-gpu
                      ${opacity} ${blur} ${scale}
                      ${isSelected 
                        ? 'bg-gray-800 border-purple-500 shadow-[0_0_60px_rgba(168,85,247,0.25)] -translate-y-4 z-30' 
                        : 'bg-gray-900/40 border-gray-800 z-10 grayscale'
                      }
                    `}
                  >
                    <div className="relative h-64 w-full bg-gray-900 rounded-t-[38px] overflow-hidden">
                      {workflow.imageUrl ? (
                        <img src={workflow.imageUrl} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-800/50">
                          <ImageIcon className="w-12 h-12 text-white/5" />
                        </div>
                      )}
                    </div>

                    <div className="h-28 p-6 flex flex-col items-center justify-center rounded-b-[38px] relative">
                      <h3 className={`text-white font-black tracking-tighter text-center transition-all duration-500 ${isSelected ? 'text-2xl italic' : 'text-lg'}`}>
                        {workflow.name}
                      </h3>
                      
                      {isSelected && (
                        <div className="absolute -bottom-16 flex justify-center animate-bounce">
                          <ChevronsDown className="w-10 h-10 text-purple-500 opacity-80" />
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
    </div>
  );
});
