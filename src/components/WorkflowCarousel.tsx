import { Sparkles, Sliders, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

export type WorkflowType = 'poster' | 'parameters' | 'future1' | 'future2';

interface WorkflowOption {
  id: WorkflowType;
  name: string;
  description: string;
  icon: React.ReactNode;
  comingSoon?: boolean;
}

interface WorkflowCarouselProps {
  selectedWorkflow: WorkflowType;
  onSelectWorkflow: (workflow: WorkflowType) => void;
}

const workflows: WorkflowOption[] = [
  {
    id: 'poster',
    name: 'Générateur d\'Affiches',
    description: 'Créez des affiches professionnelles avec des champs spécialisés',
    icon: <Sparkles className="w-8 h-8" />,
  },
  {
    id: 'parameters',
    name: 'Paramètres de Génération',
    description: 'Contrôle avancé avec tous les paramètres ComfyUI',
    icon: <Sliders className="w-8 h-8" />,
  },
  {
    id: 'future1',
    name: 'Workflow Personnalisé',
    description: 'Importez vos propres workflows ComfyUI',
    icon: <ImageIcon className="w-8 h-8" />,
    comingSoon: true,
  },
  {
    id: 'future2',
    name: 'Génération Batch',
    description: 'Générez plusieurs images en série',
    icon: <ImageIcon className="w-8 h-8" />,
    comingSoon: true,
  },
];

export function WorkflowCarousel({ selectedWorkflow, onSelectWorkflow }: WorkflowCarouselProps) {
  const [scrollPosition, setScrollPosition] = useState(0);

  const scroll = (direction: 'left' | 'right') => {
    const container = document.getElementById('workflow-carousel');
    if (!container) return;

    const scrollAmount = 320; // Largeur d'une carte + gap
    const newPosition = direction === 'left' 
      ? Math.max(0, scrollPosition - scrollAmount)
      : Math.min(container.scrollWidth - container.clientWidth, scrollPosition + scrollAmount);

    container.scrollTo({ left: newPosition, behavior: 'smooth' });
    setScrollPosition(newPosition);
  };

  return (
    <div className="bg-gray-900 border-b border-gray-800 relative">
      <div className="max-w-full mx-auto px-6 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white text-lg">Sélectionnez un Workflow</h2>
          <div className="flex gap-2">
            <button
              onClick={() => scroll('left')}
              className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5 text-gray-400" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        <div
          id="workflow-carousel"
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {workflows.map((workflow) => (
            <button
              key={workflow.id}
              onClick={() => {
                if (!workflow.comingSoon) {
                  console.log(`[WORKFLOW_CAROUSEL] 🔄 Changement de workflow vers: ${workflow.id}`);
                  onSelectWorkflow(workflow.id);
                }
              }}
              disabled={workflow.comingSoon}
              className={`
                flex-shrink-0 w-[300px] p-6 rounded-lg border-2 transition-all
                ${selectedWorkflow === workflow.id && !workflow.comingSoon
                  ? 'bg-purple-600/20 border-purple-500 shadow-lg shadow-purple-500/20'
                  : workflow.comingSoon
                  ? 'bg-gray-800/50 border-gray-700 opacity-50 cursor-not-allowed'
                  : 'bg-gray-800 border-gray-700 hover:border-purple-500/50 hover:bg-gray-750 cursor-pointer'
                }
              `}
            >
              <div className="flex flex-col items-start text-left">
                <div className={`
                  mb-4 p-3 rounded-lg
                  ${selectedWorkflow === workflow.id && !workflow.comingSoon
                    ? 'bg-purple-500/20 text-purple-400'
                    : 'bg-gray-700 text-gray-400'
                  }
                `}>
                  {workflow.icon}
                </div>
                
                <h3 className="text-white mb-2 flex items-center gap-2">
                  {workflow.name}
                  {workflow.comingSoon && (
                    <span className="text-xs bg-yellow-600/20 text-yellow-400 px-2 py-0.5 rounded-full">
                      Bientôt
                    </span>
                  )}
                </h3>
                
                <p className="text-gray-400 text-sm">
                  {workflow.description}
                </p>

                {selectedWorkflow === workflow.id && !workflow.comingSoon && (
                  <div className="mt-4 w-full">
                    <div className="h-1 bg-purple-500 rounded-full" />
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
