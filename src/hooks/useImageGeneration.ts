import { useState, useCallback, useRef } from 'react';
import { api } from '../services/api';

// Constantes conformes à la Bible du projet
const MAX_FETCH_ATTEMPTS = 10;
const RETRY_DELAY_MS = 2000;

// Configuration de l'URL du Backend (IMPORTANT : à adapter)
// Utilisez votre variable d'environnement ou l'URL de Render en dur pour ce test.
// NOTE : 'REACT_APP_API_URL' doit pointer vers https://g-n-rateur-backend-1.onrender.com
const API_BASE_URL = process.env.REACT_APP_API_URL || "https://g-n-rateur-backend-1.onrender.com";


export interface GenerationParams {
  prompt: string;
  negative_prompt: string;
  steps: number;
  cfg_scale: number;
  seed: number;
  sampler_name: string;
  scheduler: string;
  denoise: number;
  width: number;
  height: number;
  [key: string]: any; // Permet des paramètres supplémentaires
}

interface UseImageGenerationResult {
  isGenerating: boolean;
  progress: number;
  error: string | null;
  generatedImage: string | null;
  promptId: string | null;
  startGeneration: (workflowName: string, params: any) => Promise<void>;
  clearError: () => void;
}

export function useImageGeneration(): UseImageGenerationResult {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [promptId, setPromptId] = useState<string | null>(null);
  
  // Nouvelle référence pour l'instance WebSocket
  const wsRef = useRef<WebSocket | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Nouvelle fonction pour fermer la connexion WS (Remplace stopPolling)
  const closeWebSocket = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
      console.log("[WS] 🛑 WebSocket fermée.");
    }
  }, []);


  const fetchResultWithRetry = async (id: string) => {
    for (let attempt = 1; attempt <= MAX_FETCH_ATTEMPTS; attempt++) {
      console.log(`[FETCH RESULT] Tentative ${attempt}/${MAX_FETCH_ATTEMPTS} pour récupérer l'image`);

      try {
        // Récupération via l'API (qui appelle /get_output/{id})
        const data = await api.getResult(id); 
        
        console.log('[FETCH RESULT] ✅ Image récupérée avec succès !');
        setProgress(100);
        // Assurez-vous que le backend renvoie bien un objet contenant image_base64
        setGeneratedImage(`data:image/png;base64,${data.image_base64}`); 
        setIsGenerating(false);
        setError(null);
        return;
        
      } catch (e: any) {
        console.error(`[FETCH RESULT] ❌ Tentative ${attempt} échouée:`, e.message);
        
        if (attempt === MAX_FETCH_ATTEMPTS) {
          setError(`Échec de la récupération du résultat après ${MAX_FETCH_ATTEMPTS} tentatives.`);
          setIsGenerating(false);
          return;
        }
        
        await new Promise(r => setTimeout(r, RETRY_DELAY_MS));
      }
    }
  };


  // 🔥 NOUVELLE LOGIQUE DE SUIVI PAR WEBSOCKET
  const startWebSocketTracking = useCallback((id: string) => {
    closeWebSocket(); // Ferme toute connexion précédente
    
    // Convertir l'URL HTTP de base en URL WebSocket sécurisée (WSS)
    const wsBaseUrl = API_BASE_URL.replace(/^http(s?):\/\//, 'ws$1://');
    const wsUrl = `${wsBaseUrl}/ws/progress/${id}`;

    console.log(`[WS] 🚀 Connexion à la WebSocket : ${wsUrl}`);
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws; // Stocker la référence

    ws.onopen = () => {
      console.log(`[WS] ✅ Connecté au prompt ${id}`);
    };

    ws.onmessage = async (event) => {
      try {
        const message = JSON.parse(event.data);
        // console.log("[WS] 📩 Message reçu:", message.type); // Décommentez pour un débogage intense

        // 1. Gérer la progression
        if (message.type === 'progress' && message.data?.value && message.data?.max) {
          const currentProgress = Math.floor((message.data.value / message.data.max) * 92);
          setProgress(currentProgress);
        }
        
        // 2. Gérer la fin de la génération
        if (message.type === 'finished') {
          console.log('[WS] ✅ Génération terminée ! Déclenchement de la récupération du résultat.');
          closeWebSocket();
          setProgress(92); // Marquer comme presque terminé
          
          await fetchResultWithRetry(id); 
        }
        
        // 3. Gérer les erreurs (si le backend/ComfyUI les renvoie)
        if (message.type === 'error' || message.type === 'exception') {
            const detail = message.data?.message || JSON.stringify(message.data) || 'Génération échouée.';
            console.error("[WS ERROR] Erreur ComfyUI:", detail);
            setError(`Erreur ComfyUI: ${detail}`);
            closeWebSocket();
            setIsGenerating(false);
        }

      } catch (e) {
        console.error('[WS ERROR] Erreur de parsing du message WebSocket:', e);
        setError('Erreur de communication avec le serveur de génération.');
        closeWebSocket();
        setIsGenerating(false);
      }
    };

    ws.onerror = (error) => {
      console.error("[WS] ❌ Erreur WebSocket:", error);
      setError('Erreur de connexion WebSocket. La progression n\'a pas pu être suivie.');
      closeWebSocket();
      setIsGenerating(false);
    };

    ws.onclose = (event) => {
      console.log("[WS] 🛑 Connexion fermée:", event.code, event.reason);
    };
  }, [closeWebSocket, fetchResultWithRetry]); // Dépend de fetchResultWithRetry


  // La fonction startGeneration appelle maintenant la WebSocket à la place du polling
  const startGeneration = useCallback(async (workflowName: string, params: GenerationParams) => {
    console.log(`[GENERATE] 🚀 Démarrage de la génération avec workflow: ${workflowName}`);
    console.log('[GENERATE] Paramètres:', params);

    closeWebSocket(); // S'assurer que les connexions précédentes sont fermées
    setIsGenerating(true);
    setProgress(0);
    setError(null);
    setGeneratedImage(null);
    setPromptId(null);

    try {
      console.log('[GENERATE] Envoi de la requête /generate...');
      // L'API gère l'envoi des données du formulaire, qui devraient être corrigées
      const response = await api.generate(workflowName, params);
      
      if (response.prompt_id) {
        const id = response.prompt_id;
        console.log(`[GENERATE] ✅ Tâche créée avec prompt_id: ${id}`);
        setPromptId(id);
        
        // 💥 APPEL DE LA WEBSOCKET À LA PLACE DE pollProgress
        startWebSocketTracking(id); 
      } else {
        throw new Error('Aucun prompt_id retourné par le serveur');
      }

    } catch (err: any) {
      console.error('[GENERATE] ❌ Erreur lors de la génération:', err);
      
      if (err.message.includes('401') || err.message.includes('non authentifié')) {
        setError('Session expirée. Veuillez vous reconnecter.');
      } else if (err.message.includes('500') || err.message.includes('502')) {
        setError('Erreur serveur. Le backend ou ComfyUI est peut-être indisponible.');
      } else if (err.message.includes('404')) {
        setError('Workflow introuvable sur le serveur.');
      } else {
        setError(err.message || 'Erreur lors de la génération');
      }
      
      setIsGenerating(false);
    }
  }, [closeWebSocket, startWebSocketTracking]);

  return {
    isGenerating,
    progress,
    error,
    generatedImage,
    promptId,
    startGeneration,
    clearError,
  };
}
