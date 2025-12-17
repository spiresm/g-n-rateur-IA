import { Sparkles, Sliders, Image as ImageIcon, Camera, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { useState, memo } from 'react';

export type WorkflowType = 'poster' | 'parameters' | 'cameraAngles' | 'future2';

interface WorkflowOption {
  id: WorkflowType;
  name: string;
  icon: React.ReactNode;
  imageUrl: string; 
  comingSoon?: boolean;
}

const workflows: WorkflowOption[] = [
  {
    id: 'poster',
    name: 'Générateur d\'Affiches',
    icon: <Sparkles className="w-5 h-5" />,
    imageUrl: '/vignettes/vignette_affiche.png', 
  },
  {
    id: 'cameraAngles',
    name: 'Angles de Caméra',
    icon: <Camera className="w-5 h-5" />,
    imageUrl: '/vignettes/vignette_camera.png',
  },
  {
    id: 'parameters',
    name: 'Paramètres',
    icon: <Sliders className="w-5 h-5" />,
    imageUrl: '/vignettes/vignette_parametres.png',
  },
  {
    id: 'future2',
    name: 'Batch',
    icon: <ImageIcon className="w-5 h-5" />,
    imageUrl: '/vignettes/vignette_batch.png',
    comingSoon: true,
  },
];

export const WorkflowCarousel = memo(function WorkflowCarousel({ selectedWorkflow, onSelectWorkflow }: { selectedWorkflow: WorkflowType; onSelectWorkflow: (w: WorkflowType) => void }) {
  const [scrollPosition, setScrollPosition] = useState(0);

  const scroll = (direction: 'left' | 'right') => {
    const container = document.getElementById('workflow-carousel');
    if (!container) return;
    const scrollAmount = 300; 
    const newPosition = direction === 'left' 
      ? Math.max(0, scrollPosition - scrollAmount)
      : Math.min(container.scrollWidth - container.clientWidth, scrollPosition + scrollAmount);
    container.scrollTo({ left: newPosition, behavior: 'smooth' });
    setScrollPosition(newPosition);
  };

  return (
    <div className="bg-gray-900 border-b border-gray-800 relative z-20 overflow-hidden">
      <div className="max-w-full mx-auto pt-8 pb-10">
        {/* En-tête avec titre et boutons */}
        <div className="flex items-center justify-between mb-6 px-8">
          <div className="flex flex-col">
            <h2 className="text-white text-xl font-bold tracking-tight">Sélectionnez un Workflow</h2>
            <p className="text-gray-500 text-sm">Moteur de création IA</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => scroll('left')} className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 transition-colors">
              <ChevronLeft className="w-5 h-5 text-gray-400" />
            </button>
            <button onClick={() => scroll('right')} className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 transition-colors">
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Conteneur de défilement */}
        <div
          id="workflow-carousel"
          // px-8 assure que la première et dernière carte ne touchent pas le bord
          // py-6 -my-6 permet au scale-105 de ne pas être coupé en hauteur
          className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth py-6 -my-6 px-8"
        >
          {workflows.map((workflow) => (
            <button
              key={workflow.id}
              onClick={() => !workflow.comingSoon && onSelectWorkflow(workflow.id)}
              disabled={workflow.comingSoon}
              className={`
                group relative flex-shrink-0 w-[280px] rounded-2xl border-2 transition-all duration-300
                ${selectedWorkflow === workflow.id && !workflow.comingSoon
                  ? 'bg-gray-800 border-purple-500 shadow-[0_20px_50px_rgba(0,0,0,0.6)] -translate-y-4 scale-105 z-50' 
                  : workflow.comingSoon
                  ? 'bg-gray-800/50 border-gray-700 opacity-60 cursor-not-allowed z-10'
                  : 'bg-gray-800 border-gray-700 hover:border-gray-500 cursor-pointer hover:-translate-y-2 z-20'
                }
              `}
            >
              {/* Image d'illustration */}
              <div className="relative h-48 w-full rounded-t-[14px] overflow-hidden bg-gray-700">
                <img 
                  src={workflow.imageUrl} 
                  alt={workflow.name} 
                  className={`
                    w-full h-full object-cover transition-transform duration-500
                    ${selectedWorkflow === workflow.id ? 'scale-110' : 'group-hover:scale-110'}
                    ${workflow.comingSoon ? 'grayscale' : 'grayscale-0'}
                  `}
                  onError={(e) => { e.currentTarget.src = "https://placehold.co/600x400/1f2937/4b5563?text=Vignette"; }}
                />
                
                {!workflow.comingSoon && (
                  <div className="absolute top-3 right-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-2.5 py-1 rounded-full text-[9px] font-black shadow-xl z-30 border border-white/10">
                    HD
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-800 via-transparent to-transparent" />
              </div>

              {/* Zone Grise Réduite (Titre uniquement) */}
              <div className="p-4 flex items-center gap-3 bg-gray-800 rounded-b-[14px]">
                <div className={`p-2 rounded-lg ${selectedWorkflow === workflow.id ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-700 text-gray-400'}`}>
                  {workflow.icon}
                </div>
                <h3 className="text-white text-sm font-bold truncate">
                  {workflow.name}
                  {workflow.comingSoon && <span className="ml-2 text-[8px] text-yellow-500 uppercase font-black">Soon</span>}
                </h3>
              </div>

              {/* Barre active */}
              {selectedWorkflow === workflow.id && !workflow.comingSoon && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-b-full" />
              )}
            </button>
          ))}
          
          {/* Spacer invisible à la fin pour garantir le padding à droite sur certains navigateurs */}
          <div className="flex-shrink-0 w-4" aria-hidden="true"></div>
        </div>
      </div>
    </div>
  );
});
