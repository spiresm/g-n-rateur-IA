import { AppContent } from './components/AppContent';

// ✅ Types exportés
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
  titleStyle: string;
  elements: string[];
  visualStyle: string;
  colorPalette: string;
  mood: string;
}

export interface CameraAnglesParams {
  imageFile: File | null;
  selectedAngle: string;
  promptNode: string;
  seed: number;
  steps: number;
  cfg: number;
}

export interface GeneratedImage {
  id: string;
  imageUrl: string;
  params: GenerationParams;
  timestamp: Date;
}

export type WorkflowType = 'poster' | 'parameters' | 'cameraAngles';

// ✅ Composant principal
export default function App() {
  return <AppContent />;
}
