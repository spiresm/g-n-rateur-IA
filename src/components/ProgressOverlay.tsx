
import { memo } from 'react';

interface ProgressOverlayProps {
  isVisible: boolean;
  progress: number;
  label?: string;
}

export const ProgressOverlay = memo(function ProgressOverlay({ 
  isVisible, 
  progress, 
  label = "Génération en cours…" 
}: ProgressOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full mx-4 border border-gray-700">
        <div className="text-center mb-6">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h3 className="text-white text-lg mb-2">{label}</h3>
          <p className="text-gray-400 text-sm">Veuillez patienter...</p>
        </div>

        {/* Progress Bar */}
        <div className="relative w-full h-3 bg-gray-700 rounded-full overflow-hidden mb-3">
          <div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Progress Percentage */}
        <div className="text-center">
          <span className="text-white text-2xl font-mono">{progress}%</span>
        </div>
      </div>
    </div>
  );
});

