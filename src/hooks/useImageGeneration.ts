import { useState } from 'react';
import { api } from '../services/api';

export interface ImageGenerationResult {
  imageUrl?: string;
  [key: string]: any;
}

export function useImageGeneration() {
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] =
    useState<ImageGenerationResult | null>(null);

  /**
   * Nettoyage d'erreur
   */
  const clearError = () => {
    setError(null);
  };

  /**
   * Fonction centrale de génération
   * appelée depuis AppContent
   */
  const startGeneration = async (
    workflow: string,
    params: Record<string, any>,
    userEmail?: string
  ): Promise<void> => {
    if (!workflow) {
      console.error('[useImageGeneration] ❌ workflow manquant');
      return;
    }

    if (!params) {
      console.error('[useImageGeneration] ❌ params manquants');
      return;
    }

    try {
      setIsGenerating(true);
      setProgress(0);
      setError(null);

      console.log('[useImageGeneration] 🚀 startGeneration', {
        workflow,
        params,
        userEmail,
      });

      // Appel API backend
      const response = await api.generateImage(
        workflow,
        params,
        userEmail
      );

      setGeneratedImage(response ?? null);
      setProgress(100);
    } catch (err: any) {
      console.error('[useImageGeneration] ❌ erreur génération', err);
      setError(
        err?.message ||
          'Une erreur est survenue lors de la génération'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    startGeneration,
    clearError,
    isGenerating,
    progress,
    error,
    generatedImage,
  };
}
