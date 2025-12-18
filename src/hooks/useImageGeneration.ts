import { useState, useCallback } from 'react';
import { api } from '../services/api';

export function useImageGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const startGeneration = useCallback(async (workflow: string, params: any, userEmail?: string) => {
    // Sécurité anti-boucle : ne rien faire si déjà en cours
    if (isGenerating) return;

    setIsGenerating(true);
    setError(null);
    setProgress(10);
    
    try {
      const response = await api.generateImage(workflow, params, userEmail);
      
      if (response && response.imageUrl) {
        setGeneratedImage(response.imageUrl);
        setProgress(100);
      } else {
        throw new Error("Le serveur n'a renvoyé aucune image.");
      }
    } catch (err: any) {
      const errorMessage = err.message || "Une erreur est survenue.";
      setError(errorMessage);
      console.error("[HOOK] Erreur:", err);
    } finally {
      setIsGenerating(false);
    }
  }, [isGenerating]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    startGeneration,
    isGenerating,
    progress,
    error,
    generatedImage,
    clearError
  };
}
