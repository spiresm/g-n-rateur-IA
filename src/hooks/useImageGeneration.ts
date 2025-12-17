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
      // 1. Préparation des données pour le Backend
      const formData = new FormData();
      formData.append('workflow_name', workflowName);
      // On s'assure d'envoyer le prompt construit par les menus
      formData.append('user_menu_prompt', params.prompt || params.user_menu_prompt || '');
      formData.append('width', (params.width || 1024).toString());
      formData.append('height', (params.height || 1024).toString());

      // 2. Appel au Backend (Route /generate)
      const result = await api.generateImage(formData);

      // 3. Gestion du WebSocket pour la progression
      // On utilise result.client_id envoyé par le nouveau main.py
      if (result && result.client_id) {
        const wsUrl = `wss://g-n-rateur-backend-1.onrender.com/ws/progress/${result.client_id}`;
        const socket = new WebSocket(wsUrl);

        socket.onopen = () => {
          console.log("✅ Connecté au tunnel de progression");
        };

        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            // Mise à jour de la barre de progression (0 à 100%)
            if (data.type === 'progress') {
              const currentProgress = Math.round(data.value * 100);
              setProgress(currentProgress);
            }
            
            // Détection de la fin de génération
            if (data.type === 'executed' && data.output?.images) {
              const imageInfo = data.output.images[0];
              // On enregistre le nom de l'image (le front s'occupe de l'URL d'affichage)
              setGeneratedImage(imageInfo.filename);
              setIsGenerating(false);
              socket.close();
            }
          } catch (e) {
            console.error("Erreur lecture message WebSocket:", e);
          }
        };

        socket.onerror = (err) => {
          console.error("Erreur WebSocket:", err);
          setError("Perte de connexion avec le serveur de suivi.");
          setIsGenerating(false);
        };

        socket.onclose = () => {
          console.log("🔌 Tunnel de progression fermé");
        };

      } else {
        // Gestion d'erreur si le backend ne renvoie pas de client_id
        const errorMsg = result.error || "Le serveur n'a pas renvoyé d'identifiant de session.";
        throw new Error(errorMsg);
      }
    } catch (err: any) {
      console.error("Erreur génération:", err);
      setError(err.message || "Une erreur est survenue lors de la génération.");
      setIsGenerating(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
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
