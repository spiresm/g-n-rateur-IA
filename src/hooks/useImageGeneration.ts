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
      // 1. Préparation des données
      const formData = new FormData();
      formData.append('workflow_name', workflowName);
      // On utilise params.prompt (généré par PosterGenerator)
      formData.append('user_menu_prompt', params.prompt || '');
      formData.append('width', (params.width || 1024).toString());
      formData.append('height', (params.height || 1024).toString());

      // 2. Appel API
      const result = await api.generateImage(formData);

      // 3. Connexion WebSocket via client_id (DÉBLOQUE LA BARRE)
      if (result && result.client_id) {
        const wsUrl = `wss://g-n-rateur-backend-1.onrender.com/ws/progress/${result.client_id}`;
        const socket = new WebSocket(wsUrl);

        socket.onopen = () => console.log("✅ WebSocket connecté");

        socket.onmessage = (event) => {
          const data = JSON.parse(event.data);
          
          // Avancement de la barre
          if (data.type === 'progress') {
            setProgress(Math.round(data.value * 100));
          }
          
          // Réception de l'image
          if (data.type === 'executed' && data.output?.images) {
            setGeneratedImage(data.output.images[0].filename);
            setIsGenerating(false);
            socket.close();
          }
        };

        socket.onerror = (err) => {
          console.error("WS Error:", err);
          setError("Erreur de suivi de progression");
          setIsGenerating(false);
        };
      } else {
        throw new Error(result.error || "Session de génération non initialisée");
      }
    } catch (err: any) {
      setError(err.message || "Erreur lors de la génération");
      setIsGenerating(false);
    }
  }, []);

  return { 
    isGenerating, 
    progress, 
    error, 
    generatedImage, 
    startGeneration, 
    clearError: () => setError(null) 
  };
}
