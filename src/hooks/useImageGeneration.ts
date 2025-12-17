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
      // Correction ici: on envoie params.prompt qui contient le texte de PosterGenerator
      formData.append('user_menu_prompt', params.prompt || '');
      formData.append('width', (params.width || 1024).toString());
      formData.append('height', (params.height || 1024).toString());

      const result = await api.generateImage(formData);

      // On utilise le client_id renvoyé par le backend pour le WebSocket
      if (result && result.client_id) {
        const wsUrl = `wss://g-n-rateur-backend-1.onrender.com/ws/progress/${result.client_id}`;
        const socket = new WebSocket(wsUrl);

        socket.onmessage = (event) => {
          const data = JSON.parse(event.data);
          
          // Mise à jour de la barre de progression
          if (data.type === 'progress') {
            setProgress(Math.round(data.value * 100));
          }
          
          // Récupération de l'image finale
          if (data.type === 'executed' && data.output?.images) {
            // L'image est souvent renvoyée sous forme de nom de fichier, 
            // assurez-vous que votre front sait comment construire l'URL finale
            setGeneratedImage(data.output.images[0].filename); 
            setIsGenerating(false);
            socket.close();
          }
        };

        socket.onerror = () => {
          setError("Erreur de connexion WebSocket");
          setIsGenerating(false);
        };
      } else {
        throw new Error("Impossible d'initialiser le tunnel de génération");
      }
    } catch (err: any) {
      setError(err.message || "Erreur de génération");
      setIsGenerating(false);
    }
  }, []);

  return { isGenerating, progress, error, generatedImage, startGeneration, clearError: () => setError(null) };
}
