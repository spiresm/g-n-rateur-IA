import { useState, useCallback } from 'react';
import { api } from '../services/api';

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
      console.log(`[GENERATE] 🚀 Tentative d'envoi: ${workflowName}`, params);

      // Préparation des données pour le backend
      const formData = new FormData();
      formData.append('workflow_name', workflowName);
      
      // On s'assure que user_menu_prompt contient toujours une chaîne
      const promptValue = params.user_menu_prompt || params.prompt || '';
      formData.append('user_menu_prompt', promptValue);
      
      if (params.width) formData.append('width', params.width.toString());
      if (params.height) formData.append('height', params.height.toString());

      const result = await api.generateImage(formData);

      // Vérification de la réponse
      if (result && result.status === 'started' && result.prompt_id) {
        console.log('[GENERATE] ✅ ID de session reçu:', result.prompt_id);
        
        const wsUrl = `wss://g-n-rateur-backend-1.onrender.com/ws/progress/${result.prompt_id}`;
        const socket = new WebSocket(wsUrl);

        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            if (data.type === 'progress') {
              setProgress(Math.round(data.value * 100));
            }
            
            if (data.type === 'executed' && data.output?.images) {
              const imageUrl = data.output.images[0]; 
              console.log('[GENERATE] 🖼️ Image générée avec succès');
              setGeneratedImage(imageUrl);
              setIsGenerating(false);
              socket.close();
            }
          } catch (e) {
            // Message non-JSON ou format inattendu
          }
        };

        socket.onerror = (err) => {
          console.error('[WS] Erreur WebSocket:', err);
          setError("Perte de connexion avec le serveur de suivi.");
          setIsGenerating(false);
          socket.close();
        };

        socket.onclose = () => {
          console.log('[WS] Connexion fermée');
        };

      } else {
        // GESTION DE L'ERREUR SERVEUR (évite le [object Object])
        const rawError = result?.error || result?.detail || "Réponse invalide du serveur";
        const errorMessage = typeof rawError === 'object' ? JSON.stringify(rawError) : rawError;
        throw new Error(errorMessage);
      }

    } catch (err: any) {
      console.error('[GENERATE] ❌ Erreur attrapée:', err);
      
      // Extraction du message d'erreur
      let finalMessage = "Une erreur est survenue lors de la génération.";
      
      if (err instanceof Error) {
        finalMessage = err.message;
      } else if (typeof err === 'string') {
        finalMessage = err;
      }

      setError(finalMessage);
      setIsGenerating(false);
    }
  }, []); // Pas besoin de clearError en dépendance ici si défini dans le même scope

  return {
    isGenerating,
    progress,
    error,
    generatedImage,
    startGeneration,
    clearError
  };
}
