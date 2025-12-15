import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppContent } from './components/AppContent';
import { ErrorBoundary } from './components/ErrorBoundary';

export interface GenerationParams {
  prompt: string;
  negativePrompt: string;
  steps: number;
  cfg: number;
  seed: number;
  sampler: string;
  scheduler: string;
  denoise: number;
  width: number;
  height: number;
}

export interface PosterParams {
  title: string;
  subtitle: string;
  tagline: string;
  occasion: string;
  ambiance: string;
  mainCharacter: string;
  characterDescription: string;
  environment: string;
  environmentDescription: string;
  characterAction: string;
  actionDescription: string;
  additionalDetails: string;
  colorPalette: string;
  titleStyle: string;
}

export interface GeneratedImage {
  id: string;
  imageUrl: string;
  params: GenerationParams;
  posterParams?: PosterParams;
  timestamp: Date;
  generationTime?: number;
}

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-900 text-white">
        <ProtectedRoute>
          <ErrorBoundary>
            <AppContent />
          </ErrorBoundary>
        </ProtectedRoute>
      </div>
    </AuthProvider>
  );
}
