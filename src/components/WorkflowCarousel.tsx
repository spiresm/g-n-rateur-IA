import { Sparkles, Sliders, Image as ImageIcon, Camera, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { useState, memo } from 'react';

export type WorkflowType = 'poster' | 'parameters' | 'cameraAngles' | 'future2';

interface WorkflowOption {
  id: WorkflowType;
  name: string;
  description: string;
  icon: React.ReactNode;
  imageUrl: string; 
  comingSoon?: boolean;
}

const workflows: WorkflowOption[] = [
  {
    id: 'poster',
    name: 'Générateur d\'Affiches',
    description: 'Créez des affiches professionnelles avec des champs spécialisés',
    icon: <Sparkles className="w-6 h-6" />,
    imageUrl: '/vignettes/vignette_affiche.png', 
  },
  {
    id: 'cameraAngles',
    name: 'Angles de Caméra',
    description: 'Générez 8 vues différentes d\'une même image',
    icon: <Camera className="w-6 h-6" />,
    imageUrl: '/vignettes/vignette_camera.png',
  },
  {
    id: 'parameters',
    name: 'Paramètres de Génération',
    description: 'Contrôle avancé avec tous les paramètres ComfyUI',
    icon: <Sliders className="w-6 h-6" />,
    imageUrl: '/vignettes/vignette_parametres.png',
  },
  {
    id: 'future2',
    name: 'Génération Batch',
    description: 'Générez plusieurs images en série',
    icon: <ImageIcon className="w-6 h-6" />,
    imageUrl: '/vignettes/vignette_batch.png',
    comingSoon: true,
  },
];

export const WorkflowCarousel = memo(function WorkflowCarousel({ selectedWorkflow, onSelectWorkflow }: { selectedWorkflow: WorkflowType; onSelectWorkflow: (w: WorkflowType) => void }) {
  const [scrollPosition, setScrollPosition] = useState(0);

  const scroll = (direction: 'left' | 'right') => {
    const container = document.getElementById('workflow-carousel');
    if (!container) return;
    const scrollAmount = 320; 
    const newPosition = direction === 'left' 
      ? Math.max(0, scrollPosition - scrollAmount)
      : Math.min(container.scrollWidth - container.clientWidth, scrollPosition + scrollAmount);
    container.scrollTo({ left: newPosition, behavior: 'smooth' });
    setScrollPosition(newPosition);
  };

  return (
    <div className="bg-gray-900 border-b border-gray-800 relative z-20"> {/* Z-index élevé pour passer par dessus le contenu suivant */}
      <div className="max-w-full mx-auto px-6 py-10"> {/* Padding augmenté pour laisser de la place au zoom */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex flex-col">
            <h2 className="text-white text-xl font-bold tracking-tight">Sélectionnez un Workflow</h2>
            <p className="text-gray-500 text-sm">Choisissez votre moteur de création IA</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => scroll('left')} className="p-2.5 bg-gray-800 hover:bg-gray-700 rounded-xl border border-gray-700">
              <ChevronLeft className="w-5 h-5 text-gray-300" />
            </button>
            <button onClick={() => scroll('right')} className="p-2.5 bg-gray-800 hover:bg-gray-700 rounded-xl border border-gray-700">
              <ChevronRight className="w-5 h-5 text-gray-300" />
            </button>
          </div>
        </div>

        <div
          id="workflow-carousel"
          className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth py-4 -my-4" 
        >
          {workflows.map((workflow) => (
            <button
              key={workflow.id}
              onClick={() => !workflow.comingSoon && onSelectWorkflow(workflow.id)}
              disabled={workflow.comingSoon}
              className={`
                group relative flex-shrink-0 w-[300px] rounded-2xl border-2 transition-all duration-300
                ${selectedWorkflow === workflow.id && !workflow.comingSoon
                  ? 'bg-gray-800 border-purple-500 shadow-[0_20px_40px_rgba(0,0,0,0.4)] -translate-y-2 scale-105 z-30'
                  : workflow.comingSoon
                  ? 'bg-gray-800/50 border-gray-700 opacity-60 cursor-not-allowed z-10'
                  : 'bg-gray-800 border-gray-700 hover:border-gray-500 cursor-pointer hover:-translate-y-1 z-10'
                }
              `}
            >
              {/* Conteneur de l'image avec arrondi forcé */}
              <div className="relative h-44 w-full rounded-t-[14px] overflow-hidden">
                <img 
                  src={workflow.imageUrl} 
                  alt={workflow.name} 
                  className={`
                    w-full h-full object-cover transition-transform duration-500
                    ${selectedWorkflow === workflow.id ? 'scale-110' : 'group-hover:scale-105'}
                    ${workflow.comingSoon ? 'grayscale' : 'grayscale-0'}
                  `}
                  onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/300x160?text=Image+Non+Trouvée"; }}
                />
                
                {/* Macaron HD */}
                {!workflow.comingSoon && (
                  <div className="absolute top-3 right-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1.5 rounded-full text-[10px] font-black shadow-xl flex items-center gap-1.5 z-40 border border-white/10">
                    <Check className="w-3.5 h-3.5" strokeWidth={4} />
                    HD
                  </div>
                )}

                {/* Overlay pour la lisibilité */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-800 via-gray-800/20 to-transparent" />
              </div>

              {/* Texte */}
              <div className="p-5 flex flex-col items-start text-left bg-gray-800 rounded-b-[14px]">
                <div className={`mb-3 p-2.5 rounded-xl ${selectedWorkflow === workflow.id ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-700 text-gray-400'}`}>
                  {workflow.icon}
                </div>
                <h3 className="text-white font-bold mb-1 flex items-center gap-2">
                  {workflow.name}
                  {workflow.comingSoon && (
                    <span className="text-[9px] uppercase tracking-widest bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-2 py-0.5 rounded">Bientôt</span>
                  )}
                </h3>
                <p className="text-gray-400 text-xs leading-relaxed">
                  {workflow.description}
                </p>
                {selectedWorkflow === workflow.id && !workflow.comingSoon && (
                  <div className="mt-4 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
});
