import { useState, useCallback } from 'react';
import { api } from '../services/api';

export function useImageGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const startGeneration = useCallback(async (workflow: string, params: any, userEmail?: string) => {
    setIsGenerating(true);
    setError(null);
    setProgress(10);
    
    try {
      const response = await api.generateImage(workflow, params, userEmail);
      
      if (response && response.imageUrl) {
        setGeneratedImage(response.imageUrl);
        setProgress(100);
      } else {
        throw new Error("Aucune image n'a été générée par le serveur.");
      }
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue lors de la génération.");
      console.error("Erreur hook:", err);
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    startGeneration,
    isGenerating,
    progress,
    error,
    generatedImage,
    clearError
  };
}
