import { useState, useCallback } from 'react';
import { api } from '../services/api';

export function useImageGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const startGeneration = useCallback(async (workflow: string, params: any, userEmail?: string) => {
    if (isGenerating) return;

    setIsGenerating(true);
    setError(null);
    setProgress(10);
    
    try {
      const response = await api.generateImage(workflow, params, userEmail);
      
      if (response && response.imageUrl) {
        setGeneratedImage(response.imageUrl);
        setProgress(100);
        // Rafraîchir le quota après succès si la fonction est exposée
        if (typeof window !== 'undefined' && (window as any).refreshQuota) {
          (window as any).refreshQuota();
        }
      } else {
        throw new Error("Le serveur n'a renvoyé aucune image.");
      }
    } catch (err: any) {
      // Gestion spécifique de l'erreur 500 Render
      const errorMessage = err.message?.includes('500') 
        ? "Erreur Serveur (500) : Le générateur est peut-être saturé ou en cours de redémarrage."
        : (err.message || "Une erreur est survenue lors de la génération.");
      
      setError(errorMessage);
      console.error("[HOOK] Erreur détaillée:", err);
    } finally {
      setIsGenerating(false);
    }
  }, [isGenerating]);

  return { startGeneration, isGenerating, progress, error, generatedImage, clearError: () => setError(null) };
}
