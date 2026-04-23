import { memo } from 'react';

export type WorkflowType = 'poster' | 'cameraAngles' | 'parameters' | 'future2' | string;

interface WorkflowCard {
  id: WorkflowType;
  name: string;
  imageUrl: string;
  comingSoon?: boolean;
}

const workflows: WorkflowCard[] = [
  { id: 'poster',        name: 'Affiches',          imageUrl: '/vignettes/vignette_affiche.png' },
  { id: 'cameraAngles',  name: 'Angles de Caméra',  imageUrl: '/vignettes/vignette_camera.png' },
  { id: 'parameters',    name: 'Création Libre',     imageUrl: '/vignettes/vignette_image.png' },
  { id: 'future2',       name: 'Batch',              imageUrl: '/vignettes/vignette_batch.png', comingSoon: true },
];

export const WorkflowCarousel = memo(function WorkflowCarousel({
  selectedWorkflow,
  onSelectWorkflow,
}: {
  selectedWorkflow: WorkflowType;
  onSelectWorkflow: (w: WorkflowType) => void;
}) {
  return (
    <div style={{
      background: '#0b0b0b',
      borderBottom: '1px solid #2a2a2a',
      padding: '20px 30px',
    }}>
      <div style={{ display: 'flex', gap: 16 }}>
        {workflows.map((wf) => {
          const isActive = selectedWorkflow === wf.id;
          return (
            <div
              key={wf.id}
              onClick={() => !wf.comingSoon && onSelectWorkflow(wf.id)}
              style={{
                flex: 1,
                height: 160,
                borderRadius: 16,
                border: `2px solid ${isActive ? '#d4af37' : '#2a2a2a'}`,
                background: '#181818',
                cursor: wf.comingSoon ? 'not-allowed' : 'pointer',
                overflow: 'hidden',
                transform: isActive ? 'translateY(-4px)' : 'none',
                boxShadow: isActive ? '0 0 20px rgba(212,175,55,0.25)' : 'none',
                transition: 'all 0.2s',
                position: 'relative',
                opacity: wf.comingSoon ? 0.45 : 1,
              }}
            >
              {/* Vignette image */}
              {wf.imageUrl ? (
                <img
                  src={wf.imageUrl}
                  alt={wf.name}
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              ) : (
                <div style={{ width: '100%', height: '100%', background: '#131313', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 10, color: '#555', letterSpacing: 2, textTransform: 'uppercase' }}>Coming soon</span>
                </div>
              )}

              {/* Label overlay */}
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                background: 'linear-gradient(transparent, rgba(0,0,0,0.75))',
                padding: '20px 12px 10px',
                display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
              }}>
                <span style={{
                  fontSize: 12, fontWeight: 700, color: isActive ? '#f4d47c' : '#f2f2f2',
                  textTransform: 'uppercase', letterSpacing: 1,
                }}>
                  {wf.name}
                </span>
                {wf.comingSoon && (
                  <span style={{ fontSize: 9, fontWeight: 600, color: '#666', textTransform: 'uppercase', letterSpacing: 1 }}>
                    Bientôt
                  </span>
                )}
              </div>

              {/* Active indicator */}
              {isActive && (
                <div style={{
                  position: 'absolute', top: 8, right: 8,
                  width: 8, height: 8, borderRadius: '50%', background: '#d4af37',
                  boxShadow: '0 0 6px rgba(212,175,55,0.6)',
                }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});
