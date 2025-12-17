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
      formData.append('user_menu_prompt', params.user_menu_prompt || params.prompt || '');
      formData.append('width', (params.width || 1024).toString());
      formData.append('height', (params.height || 1024).toString());

      const result = await api.generateImage(formData);

      if (result && (result.prompt_id || result.status === 'started')) {
        const pId = result.prompt_id;
        const wsUrl = `wss://g-n-rateur-backend-1.onrender.com/ws/progress/${pId}`;
        const socket = new WebSocket(wsUrl);

        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'progress') setProgress(Math.round(data.value * 100));
            if (data.type === 'executed' && data.output?.images) {
              setGeneratedImage(data.output.images[0]);
              setIsGenerating(false);
              socket.close();
            }
          } catch (e) {}
        };
      } else {
        // Extraction du message d'erreur pour éviter [object Object]
        const errContent = result.error || result.detail || result;
        throw new Error(typeof errContent === 'object' ? JSON.stringify(errContent) : errContent);
      }
    } catch (err: any) {
      console.error('[GENERATE] ❌ Détail:', err);
      setError(err.message || "Erreur lors de la génération");
      setIsGenerating(false);
    }
  }, []);

  return { isGenerating, progress, error, generatedImage, startGeneration, clearError: () => setError(null) };
}
