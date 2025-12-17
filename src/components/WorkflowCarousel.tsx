import { Sparkles, Sliders, Image as ImageIcon, Camera, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { useState, memo, useRef, useEffect } from 'react';

export type WorkflowType = 'poster' | 'parameters' | 'cameraAngles' | 'future2' | string;

interface WorkflowOption {
  id: WorkflowType;
  name: string;
  icon: React.ReactNode;
  imageUrl: string; 
  comingSoon?: boolean;
}

const mainWorkflows: WorkflowOption[] = [
  { id: 'poster', name: "Générateur d'Affiches", icon: <Sparkles className="w-5 h-5" />, imageUrl: '/vignettes/vignette_affiche.png' },
  { id: 'cameraAngles', name: 'Angles de Caméra', icon: <Camera className="w-5 h-5" />, imageUrl: '/vignettes/vignette_camera.png' },
  { id: 'parameters', name: 'Image', icon: <Sliders className="w-5 h-5" />, imageUrl: '/vignettes/vignette_parametres.png' }, // Renommé
  { id: 'future2', name: 'Batch', icon: <ImageIcon className="w-5 h-5" />, imageUrl: '/vignettes/vignette_batch.png', comingSoon: true },
];

const emptyWorkflows: WorkflowOption[] = Array.from({ length: 10 }, (_, i) => ({
  id: `empty-${i + 1}`,
  name: `Prochainement ${i + 5}`,
  icon: <ImageIcon className="w-5 h-5" />,
  imageUrl: '',
  comingSoon: true,
}));

const allWorkflows = [...mainWorkflows, ...emptyWorkflows];

export const WorkflowCarousel = memo(function WorkflowCarousel({ selectedWorkflow, onSelectWorkflow }: { selectedWorkflow: WorkflowType; onSelectWorkflow: (w: WorkflowType) => void }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isInternalScroll = useRef(false);

  // 1. Détection automatique de la carte au centre lors du scroll
  const handleScroll = () => {
    if (!scrollRef.current || isInternalScroll.current) return;

    const container = scrollRef.current;
    const cardWidth = 280 + 24; // Largeur carte + gap
    const centerPoint = container.scrollLeft + container.offsetWidth / 2;
    const index = Math.round((container.scrollLeft) / cardWidth);
    
    const targetWorkflow = allWorkflows[index];
    if (targetWorkflow && targetWorkflow.id !== selectedWorkflow && !targetWorkflow.comingSoon) {
      onSelectWorkflow(targetWorkflow.id);
    }
  };

  // 2. Navigation avec les flèches (Sélectionne et centre)
  const navigate = (direction: 'next' | 'prev') => {
    const currentIndex = allWorkflows.findIndex(w => w.id === selectedWorkflow);
    let nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;

    // On évite les cartes "Coming Soon" pour la sélection auto si possible, 
    // ou on limite simplement au tableau
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
    scrollRef.current.scrollTo({
      left: index * cardWidth,
      behavior: 'smooth'
    });
    setTimeout(() => { isInternalScroll.current = false; }, 500);
  };

  return (
    <div className="bg-gray-900 border-b border-gray-800 relative z-20 overflow-hidden">
      <div className="max-w-full mx-auto pt-8 pb-10">
        
        {/* En-tête avec boutons de navigation */}
        <div className="flex items-center justify-between mb-6 px-8">
          <div className="flex flex-col">
            <h2 className="text-white text-xl font-bold tracking-tight">Sélectionnez un Workflow</h2>
            <p className="text-gray-500 text-sm">Moteur de création IA</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate('prev')} className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 transition-colors">
              <ChevronLeft className="w-5 h-5 text-gray-400" />
            </button>
            <button onClick={() => navigate('next')} className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 transition-colors">
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Carrousel avec Snap Center */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth py-10 -my-10 px-[calc(50vw-140px)] snap-x snap-mandatory"
        >
          {allWorkflows.map((workflow) => (
            <button
              key={workflow.id}
              onClick={() => {
                if (!workflow.comingSoon) {
                  onSelectWorkflow(workflow.id);
                  scrollToIndex(allWorkflows.indexOf(workflow));
                }
              }}
              className={`
                group relative flex-shrink-0 w-[280px] rounded-2xl border-2 transition-all duration-500 snap-center
                ${selectedWorkflow === workflow.id && !workflow.comingSoon
                  ? 'bg-gray-800 border-purple-500 shadow-[0_20px_50px_rgba(0,0,0,0.6)] -translate-y-4 scale-105 z-50' 
                  : workflow.comingSoon
                  ? 'bg-gray-800/50 border-gray-700 opacity-40 cursor-not-allowed z-10'
                  : 'bg-gray-800 border-gray-700 hover:border-gray-500 cursor-pointer z-20'
                }
              `}
            >
              {/* Image Justifiée en Haut */}
              <div className="relative h-48 w-full rounded-t-[14px] overflow-hidden bg-gray-850">
                {workflow.imageUrl ? (
                  <img 
                    src={workflow.imageUrl} 
                    alt={workflow.name} 
                    className={`
                      w-full h-full object-cover object-top transition-transform duration-700
                      ${selectedWorkflow === workflow.id ? 'scale-110' : 'group-hover:scale-105'}
                      ${workflow.comingSoon ? 'grayscale' : 'grayscale-0'}
                    `}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-gray-800" />
                  </div>
                )}
                
                {/* Badge HD */}
                {!workflow.comingSoon && (
                  <div className="absolute top-3 right-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-2.5 py-1 rounded-full text-[9px] font-black shadow-xl z-30 border border-white/10">
                    HD
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-800 via-transparent to-transparent opacity-60" />
              </div>

              {/* Titre & Icone (Sans ligne violette) */}
              <div className="p-4 flex items-center gap-3 bg-gray-800 rounded-b-[14px]">
                <div className={`p-2 rounded-lg transition-colors ${selectedWorkflow === workflow.id ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-700 text-gray-400'}`}>
                  {workflow.icon}
                </div>
                <h3 className="text-white text-sm font-bold truncate">
                  {workflow.name}
                  {workflow.comingSoon && <span className="ml-2 text-[8px] text-yellow-600 uppercase">Soon</span>}
                </h3>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
});
