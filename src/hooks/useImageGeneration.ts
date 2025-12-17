import { useState, useCallback } from 'react';
import { api } from '../services/api';

export function useImageGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const startGeneration = useCallback(async (workflowName: string, params: any) => {
    setIsGenerating(true);
    setProgress(0);
    setError(null);
    setGeneratedImage(null);

    try {
      const formData = new FormData();
      formData.append('workflow_name', workflowName);
      formData.append('user_menu_prompt', params.prompt || '');
      formData.append('width', (params.width || 1024).toString());
      formData.append('height', (params.height || 1024).toString());

      const result = await api.generateImage(formData);

      if (result && result.client_id) {
        // CONNEXION AU TUNNEL DE PROGRESSION
        const wsUrl = `wss://g-n-rateur-backend-1.onrender.com/ws/progress/${result.client_id}`;
        const socket = new WebSocket(wsUrl);

        socket.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.type === 'progress') {
            setProgress(Math.round(data.value * 100));
          }
          if (data.type === 'executed' && data.output?.images) {
            setGeneratedImage(data.output.images[0].filename);
            setIsGenerating(false);
            socket.close();
          }
        };
        
        socket.onerror = () => {
            setError("Erreur de connexion au suivi de progression.");
            setIsGenerating(false);
        };
      }
    } catch (err: any) {
      setError(err.message || "Erreur lors de la génération.");
      setIsGenerating(false);
    }
  }, []);

  return { isGenerating, progress, error, generatedImage, startGeneration };
}
