export type WorkflowType = 'poster' | 'parameters' | 'cameraAngles';

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
  title?: string;
}

export interface CameraAnglesParams {
  selectedAngle: string;
  promptNode: string;
  seed: number;
  steps: number;
  cfg: number;
  imageFile?: File;
}

export interface GeneratedImage {
  id: string;
  imageUrl: string;
  params: GenerationParams;
  timestamp: Date;
}
