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
      // 1. Préparation des données pour le backend
      const formData = new FormData();
      formData.append('workflow_name', workflowName);
      
      // On s'assure d'envoyer le prompt final construit par PosterGenerator
      const promptToSend = params.prompt || params.user_menu_prompt || '';
      formData.append('user_menu_prompt', promptToSend);
      
      formData.append('width', (params.width || 1024).toString());
      formData.append('height', (params.height || 1024).toString());

      console.log("🚀 Envoi de la requête de génération...", { workflowName, prompt: promptToSend });

      // 2. Appel au Backend
      const result = await api.generateImage(formData);

      // 3. Connexion au WebSocket via le client_id renvoyé par le serveur
      if (result && result.client_id) {
        // IMPORTANT: On utilise l'URL de ton backend Render pour le WebSocket
        const wsUrl = `wss://g-n-rateur-backend-1.onrender.com/ws/progress/${result.client_id}`;
        console.log("🔌 Connexion au WebSocket:", wsUrl);
        
        const socket = new WebSocket(wsUrl);

        socket.onopen = () => {
          console.log("✅ WebSocket connecté avec succès");
        };

        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            // Mise à jour de la barre de progression
            if (data.type === 'progress') {
              const currentProgress = Math.round(data.value * 100);
              console.log(`📊 Progression: ${currentProgress}%`);
              setProgress(currentProgress);
            }
            
            // Réception du résultat final
            if (data.type === 'executed' && data.output?.images) {
              const filename = data.output.images[0].filename;
              console.log("✨ Génération terminée. Image:", filename);
              
              setGeneratedImage(filename);
              setIsGenerating(false);
              setProgress(100);
              socket.close();
            }
          } catch (e) {
            console.error("❌ Erreur lors de la lecture du message WS:", e);
          }
        };

        socket.onerror = (err) => {
          console.error("❌ Erreur WebSocket détectée:", err);
          setError("La connexion au suivi de progression a échoué.");
          setIsGenerating(false);
        };

        socket.onclose = () => {
          console.log("🔌 Tunnel WebSocket fermé");
        };

      } else {
        throw new Error(result.error || "Le serveur n'a pas renvoyé de client_id valide.");
      }
    } catch (err: any) {
      console.error("❌ Erreur startGeneration:", err);
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
