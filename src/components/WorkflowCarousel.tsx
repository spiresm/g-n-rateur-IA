import { ChevronLeft, ChevronRight, ChevronsDown, Image as ImageIcon, Camera, Layout, Settings2 } from 'lucide-react';
import { memo, useRef, useMemo } from 'react';

export type WorkflowType = 'poster' | 'cameraAngles' | 'parameters' | 'future2' | string;

interface WorkflowOption {
  id: WorkflowType;
  name: string;
  imageUrl: string;
  comingSoon?: boolean;
}

const mainWorkflows: WorkflowOption[] = [
  { id: 'poster',       name: 'Affiches',          imageUrl: '/vignettes/vignette_affiche.png' },
  { id: 'cameraAngles', name: 'Angles de Caméra',  imageUrl: '/vignettes/vignette_camera.png' },
  { id: 'parameters',   name: 'Image',             imageUrl: '/vignettes/vignette_image.png' },
  { id: 'future2',      name: 'Batch',             imageUrl: '/vignettes/vignette_batch.png', comingSoon: true },
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
  onSelectWorkflow,
}: {
  selectedWorkflow: WorkflowType;
  onSelectWorkflow: (w: WorkflowType) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isInternalScroll = useRef(false);

  const workflowDetails: Record<string, { title: string; desc: string; icon: any; note?: string }> = {
    poster: {
      title: 'MODE AFFICHE',
      desc: "Conception graphique avancée. Ce workflow permet d'intégrer un titre, un sous-titre et une baseline directement dans votre image.",
      icon: Layout,
      note: "L'orthographe générée par l'IA peut présenter des anomalies.",
    },
    cameraAngles: {
      title: 'ANGLE DE VUE',
      desc: "Importez votre image source et l'IA se charge de réaliser l'angle de vue que vous désirez parmi les choix disponibles.",
      icon: Camera,
    },
    parameters: {
      title: 'CRÉATION LIBRE',
      desc: "Génération d'image basée sur un prompt positif et négatif avec ajustements précis des paramètres.",
      icon: Settings2,
    },
  };

  const currentDetail = workflowDetails[selectedWorkflow];

  const selectedIndex = useMemo(
    () => allWorkflows.findIndex(w => w.id === selectedWorkflow),
    [selectedWorkflow]
  );

  const handleScroll = () => {
    if (!scrollRef.current || isInternalScroll.current) return;
    const container = scrollRef.current;
    const cardWidth = 280 + 24;
    const index = Math.round(container.scrollLeft / cardWidth);
    const target = allWorkflows[index];
    if (target && target.id !== selectedWorkflow) {
      onSelectWorkflow(target.id);
    }
  };

  const scrollToIndex = (index: number) => {
    if (!scrollRef.current) return;
    const cardWidth = 280 + 24;
    isInternalScroll.current = true;
    scrollRef.current.scrollTo({ left: index * cardWidth, behavior: 'smooth' });
    setTimeout(() => { isInternalScroll.current = false; }, 500);
  };

  const navigate = (direction: 'next' | 'prev') => {
    const current = allWorkflows.findIndex(w => w.id === selectedWorkflow);
    let next = direction === 'next' ? current + 1 : current - 1;
    next = Math.max(0, Math.min(next, allWorkflows.length - 1));
    onSelectWorkflow(allWorkflows[next].id);
    scrollToIndex(next);
  };

  return (
    <div style={{
      background: '#0b0b0b',
      borderBottom: '1px solid #2a2a2a',
      position: 'relative',
      zIndex: 20,
      overflow: 'hidden',
      color: '#f2f2f2',
    }}>
      <div style={{ maxWidth: '100%', margin: '0 auto', paddingTop: 40, paddingBottom: 96, position: 'relative' }}>

        {/* HEADER STUDIO */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40, padding: '0 32px', position: 'relative', zIndex: 50 }}>
          <h2 style={{ margin: 0, fontSize: 36, fontWeight: 900, fontStyle: 'italic', letterSpacing: '-0.04em', color: '#f2f2f2', textTransform: 'uppercase' }}>
            STUDIO
          </h2>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => navigate('prev')}
              style={{ padding: 14, background: 'rgba(34,34,34,0.9)', backdropFilter: 'blur(8px)', border: '1px solid #2a2a2a', borderRadius: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', color: '#aaa' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#333')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(34,34,34,0.9)')}
            >
              <ChevronLeft size={22} />
            </button>
            <button
              onClick={() => navigate('next')}
              style={{ padding: 14, background: 'rgba(34,34,34,0.9)', backdropFilter: 'blur(8px)', border: '1px solid #2a2a2a', borderRadius: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', color: '#aaa' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#333')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(34,34,34,0.9)')}
            >
              <ChevronRight size={22} />
            </button>
          </div>
        </div>

        {/* PANNEAU INFO (desktop) */}
        {currentDetail && (
          <div style={{
            position: 'absolute', left: 32, top: 130, zIndex: 60, width: 288,
            display: 'none',
            pointerEvents: 'none',
          }}
            className="lg-info-panel"
          >
            <div style={{
              background: 'rgba(10,10,10,0.5)', backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.05)', padding: 24, borderRadius: 32,
              boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#d4af37' }} />
                <span style={{ color: '#d4af37', fontWeight: 900, fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                  {currentDetail.title}
                </span>
              </div>
              <p style={{ fontSize: 12, color: '#ccc', lineHeight: 1.6, fontWeight: 500, margin: 0, textTransform: 'none' }}>
                {currentDetail.desc}
              </p>
              {currentDetail.note && (
                <p style={{ fontSize: 10, color: '#888', marginTop: 10, margin: 0, textTransform: 'none' }}>{currentDetail.note}</p>
              )}
            </div>
          </div>
        )}

        {/* CAROUSEL */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          style={{
            display: 'flex',
            gap: 24,
            overflowX: 'auto',
            scrollBehavior: 'smooth',
            padding: '80px calc(50vw - 140px)',
            margin: '-80px 0',
            scrollSnapType: 'x mandatory',
            position: 'relative',
            zIndex: 10,
            alignItems: 'center',
            scrollbarWidth: 'none',
          }}
        >
          {allWorkflows.map((workflow, index) => {
            const isSelected = selectedWorkflow === workflow.id;
            const distance = Math.abs(index - selectedIndex);

            let opacity = 1;
            let blur = 0;
            let scale = 1;
            let translateY = 0;
            let zIndex = 10;
            let grayscale = 0;

            if (!isSelected) {
              if (distance === 1) {
                opacity = 0.6;
                blur = 1;
                scale = 0.95;
                grayscale = 50;
              } else {
                opacity = 0.3;
                blur = 3;
                scale = 0.85;
                grayscale = 80;
              }
            } else {
              translateY = -32;
              scale = 1.1;
              zIndex = 30;
            }

            return (
              <div
                key={workflow.id}
                style={{ position: 'relative', flexShrink: 0, width: 280, scrollSnapAlign: 'center', display: 'flex', justifyContent: 'center' }}
              >
                <button
                  onClick={() => {
                    onSelectWorkflow(workflow.id);
                    scrollToIndex(index);
                  }}
                  style={{
                    position: 'relative', width: '100%', borderRadius: 32, border: `2px solid ${isSelected ? '#d4af37' : '#2a2a2a'}`,
                    transition: 'all 0.7s cubic-bezier(0.4,0,0.2,1)',
                    overflow: 'visible',
                    transform: `scale(${scale}) translateY(${translateY}px)`,
                    opacity,
                    filter: `blur(${blur}px) grayscale(${grayscale}%)`,
                    zIndex,
                    background: isSelected ? '#222' : 'rgba(20,20,20,0.4)',
                    boxShadow: isSelected ? '0 40px 80px rgba(0,0,0,0.8)' : 'none',
                    cursor: 'pointer',
                  }}
                >
                  {/* Image */}
                  <div style={{ position: 'relative', height: 224, width: '100%', background: '#1a1a1a', borderRadius: '30px 30px 0 0', overflow: 'hidden' }}>
                    {workflow.imageUrl ? (
                      <img
                        src={workflow.imageUrl}
                        alt={workflow.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', display: 'block' }}
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#181818' }}>
                        <ImageIcon size={48} color="rgba(255,255,255,0.05)" />
                        <span style={{ position: 'absolute', bottom: 16, fontSize: 8, letterSpacing: 4, color: '#555', textTransform: 'uppercase' }}>Coming Soon</span>
                      </div>
                    )}
                  </div>

                  {/* Label */}
                  <div style={{ height: 112, padding: 24, background: '#222', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: '0 0 30px 30px', position: 'relative' }}>
                    <h3 style={{
                      margin: 0, color: '#f2f2f2', fontWeight: 900, textAlign: 'center',
                      textTransform: 'uppercase', letterSpacing: '-0.02em', width: '100%',
                      fontSize: isSelected ? 22 : 16,
                      fontStyle: isSelected ? 'italic' : 'normal',
                      transition: 'all 0.5s',
                    }}>
                      {workflow.name}
                    </h3>

                    {/* Bounce arrow */}
                    {isSelected && !workflow.comingSoon && (
                      <div style={{
                        position: 'absolute', bottom: -56, left: 0, right: 0,
                        display: 'flex', justifyContent: 'center', pointerEvents: 'none',
                        animation: 'bounce 1s infinite',
                      }}>
                        <ChevronsDown size={40} color="#d4af37" style={{ filter: 'drop-shadow(0 0 10px rgba(212,175,55,0.5))' }} />
                      </div>
                    )}
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Info panel visible on large screens via CSS */}
      <style>{`
        @media (min-width: 1024px) {
          .lg-info-panel { display: block !important; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(8px); }
        }
        ::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
});
