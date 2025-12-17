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
      console.log(`[GENERATE] 🚀 Envoi du workflow: ${workflowName}`, params);

      const formData = new FormData();
      formData.append('workflow_name', workflowName);
      formData.append('user_menu_prompt', params.user_menu_prompt || params.prompt || '');
      
      if (params.width) formData.append('width', params.width.toString());
      if (params.height) formData.append('height', params.height.toString());

      const result = await api.generateImage(formData);

      // Vérification de la réponse du serveur Render
      if (result && result.status === 'started' && result.prompt_id) {
        console.log('[GENERATE] ✅ ID de session:', result.prompt_id);
        
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
              setGeneratedImage(imageUrl);
              setIsGenerating(false);
              socket.close();
            }
          } catch (e) {
            // Message non JSON
          }
        };

        socket.onerror = () => {
          setError("La connexion avec le serveur a été interrompue.");
          setIsGenerating(false);
        };
      } else {
        // ✅ GESTION DE L'ERREUR DE VALIDATION (L'erreur que tu as reçue)
        const rawError = result?.error || result?.detail || result;
        
        let message = "Le serveur n'a pas pu valider la demande.";
        
        if (typeof rawError === 'object') {
          if (rawError.type === 'prompt_outputs_failed_validation') {
            message = "Erreur ComfyUI : Les IDs des nœuds (44 ou 45) ne correspondent pas dans affiche.json";
          } else {
            message = JSON.stringify(rawError);
          }
        } else if (typeof rawError === 'string') {
          message = rawError;
        }

        throw new Error(message);
      }

    } catch (err: any) {
      console.error('[GENERATE] ❌ Erreur attrapée:', err);
      setError(err.message || "Une erreur critique est survenue.");
      setIsGenerating(false);
    }
  }, []);

  return {
    isGenerating,
    progress,
    error,
    generatedImage,
    startGeneration,
    clearError
  };
}
