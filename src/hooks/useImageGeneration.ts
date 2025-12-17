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
      // On utilise 'params.prompt' qui vient de PosterGenerator.tsx
      formData.append('user_menu_prompt', params.prompt || '');
      formData.append('width', (params.width || 1024).toString());
      formData.append('height', (params.height || 1024).toString());

      const result = await api.generateImage(formData);

      // On utilise le client_id synchronisé renvoyé par le backend
      if (result && result.client_id) {
        const wsUrl = `wss://g-n-rateur-backend-1.onrender.com/ws/progress/${result.client_id}`;
        const socket = new WebSocket(wsUrl);

        socket.onmessage = (event) => {
          const data = JSON.parse(event.data);
          
          // DÉBLOQUE LA BARRE DE PROGRESSION
          if (data.type === 'progress') {
            setProgress(Math.round(data.value * 100));
          }
          
          // RÉCUPÉRATION DE L'IMAGE FINALE
          if (data.type === 'executed' && data.output?.images) {
            const imageInfo = data.output.images[0];
            // On stocke le nom du fichier pour l'affichage
            setGeneratedImage(imageInfo.filename);
            setIsGenerating(false);
            socket.close();
          }
        };

        socket.onerror = () => {
          setError("Erreur de connexion au flux de progression");
          setIsGenerating(false);
        };
      } else {
        throw new Error("Le serveur n'a pas pu initier la session de génération.");
      }
    } catch (err: any) {
      setError(err.message || "Erreur de génération");
      setIsGenerating(false);
    }
  }, []);

  return { isGenerating, progress, error, generatedImage, startGeneration, clearError: () => setError(null) };
}
