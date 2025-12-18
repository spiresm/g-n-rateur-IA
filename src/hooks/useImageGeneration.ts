import { useState, useCallback } from 'react';
import { api } from '../services/api';

export function useImageGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const startGeneration = useCallback(
    async (workflow: string, params: any, userEmail?: string) => {
      if (isGenerating) return;

      setIsGenerating(true);
      setError(null);
      setProgress(10);

      try {
        // 1️⃣ Submit ComfyUI job
        const response = await api.generateImage(workflow, params, userEmail);

        if (!response?.prompt_id) {
          throw new Error("Aucun prompt_id reçu du serveur.");
        }

        const promptId = response.prompt_id;
        setProgress(30);

        // 2️⃣ Attente du résultat (polling simple)
        let imageBase64: string | null = null;

        for (let i = 0; i < 60; i++) { // ~90s max
          await new Promise(res => setTimeout(res, 1500));

          try {
            const result = await api.getResult(promptId);
            if (result?.image_base64) {
              imageBase64 = result.image_base64;
              break;
            }
          } catch {
            // image pas encore prête → on continue
          }

          setProgress(30 + Math.min(i * 1.2, 60));
        }

        if (!imageBase64) {
          throw new Error("L'image n'est pas prête après le délai imparti.");
        }

        setGeneratedImage(`data:image/png;base64,${imageBase64}`);
        setProgress(100);

        // Rafraîchir le quota après succès
        if (typeof window !== 'undefined' && (window as any).refreshQuota) {
          (window as any).refreshQuota();
        }

      } catch (err: any) {
        const errorMessage = err.message?.includes('500')
          ? "Erreur Serveur (500) : le générateur est peut-être saturé."
          : (err.message || "Une erreur est survenue lors de la génération.");

        setError(errorMessage);
        console.error("[HOOK] Erreur détaillée:", err);
      } finally {
        setIsGenerating(false);
      }
    },
    [isGenerating]
  );

  return {
    startGeneration,
    isGenerating,
    progress,
    error,
    generatedImage,
    clearError: () => setError(null),
  };
}
