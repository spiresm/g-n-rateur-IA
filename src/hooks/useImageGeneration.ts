import { useState, useCallback } from 'react';
import { api } from '../services/api'; // Vérifiez bien ce chemin

export function useImageGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const startGeneration = useCallback(async (workflowName: string, params: any) => {
    setIsGenerating(true);
    setProgress(0);
    setError(null);
    setGeneratedImage(null);

    try {
      console.log(`[GENERATE] 🚀 Démarrage: ${workflowName}`, params);

      // Préparation des données pour le backend Render
      const formData = new FormData();
      formData.append('workflow_name', workflowName);
      formData.append('user_menu_prompt', params.user_menu_prompt || params.prompt || '');
      
      // Ajout des autres paramètres si nécessaire
      if (params.width) formData.append('width', params.width.toString());
      if (params.height) formData.append('height', params.height.toString());

      // ✅ CORRECTION ICI : On utilise api.generateImage (et non api.generate)
      const result = await api.generateImage(formData);

      if (result.status === 'started' && result.prompt_id) {
        console.log('[GENERATE] ✅ ID de session:', result.prompt_id);
        
        // Connexion WebSocket pour la progression
        const wsUrl = `wss://g-n-rateur-backend-1.onrender.com/ws/progress/${result.prompt_id}`;
        const socket = new WebSocket(wsUrl);

        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'progress') {
              setProgress(Math.round(data.value * 100));
            }
            if (data.type === 'executed' && data.output?.images) {
              // Une fois l'image reçue de ComfyUI via le proxy
              const imageUrl = data.output.images[0]; 
              setGeneratedImage(imageUrl);
              setIsGenerating(false);
              socket.close();
            }
          } catch (e) {
            // Message non JSON ou format différent
          }
        };

        socket.onerror = () => {
          setError("Erreur de connexion au suivi en temps réel.");
          setIsGenerating(false);
        };
      } else {
        throw new Error(result.error || "Le serveur n'a pas pu démarrer la génération.");
      }

    } catch (err: any) {
      console.error('[GENERATE] ❌ Erreur:', err);
      setError(err.message || "Une erreur est survenue lors de la génération.");
      setIsGenerating(false);
    }
  }, [clearError]);

  return {
    isGenerating,
    progress,
    error,
    generatedImage,
    startGeneration,
    clearError
  };
}
