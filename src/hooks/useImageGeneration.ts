import { useState, useCallback, useRef } from 'react';
import { api } from '../services/api';

// Constantes conformes à la Bible du projet
const POLLING_INTERVAL_MS = 900;
const MAX_POLLING_FAILURES = 5;
const MAX_FETCH_ATTEMPTS = 10;
const RETRY_DELAY_MS = 2000;

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
  [key: string]: any; // ✅ Permet des paramètres supplémentaires
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
  
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollingFailureCountRef = useRef(0);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  const pollProgress = useCallback(async (id: string) => {
    let fakeProgress = 0;
    pollingFailureCountRef.current = 0;
    
    stopPolling();

    pollingIntervalRef.current = setInterval(async () => {
      fakeProgress = Math.min(fakeProgress + 7, 92);
      setProgress(fakeProgress);

      try {
        console.log(`[POLLING] Vérification du statut pour prompt_id: ${id}`);
        const data = await api.getProgress(id);
        pollingFailureCountRef.current = 0;

        if (data.status && data.status.completed) {
          console.log('[POLLING] ✅ Génération terminée !');
          stopPolling();
          setProgress(92);
          
          await fetchResultWithRetry(id);
          return;
        }
      } catch (e: any) {
        pollingFailureCountRef.current++;
        console.error(`[POLL ERROR] Tentative ${pollingFailureCountRef.current}/${MAX_POLLING_FAILURES}:`, e.message);

        if (pollingFailureCountRef.current >= MAX_POLLING_FAILURES) {
          stopPolling();
          setIsGenerating(false);
          setError(`La tâche ${id} a été perdue par le serveur (${MAX_POLLING_FAILURES} échecs de polling).`);
        }
      }
    }, POLLING_INTERVAL_MS);
  }, [stopPolling]);

  const fetchResultWithRetry = async (id: string) => {
    for (let attempt = 1; attempt <= MAX_FETCH_ATTEMPTS; attempt++) {
      console.log(`[FETCH RESULT] Tentative ${attempt}/${MAX_FETCH_ATTEMPTS} pour récupérer l'image`);

      try {
        const data = await api.getResult(id);
        
        console.log('[FETCH RESULT] ✅ Image récupérée avec succès !');
        setProgress(100);
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

  const startGeneration = useCallback(async (workflowName: string, params: GenerationParams) => {
    console.log(`[GENERATE] 🚀 Démarrage de la génération avec workflow: ${workflowName}`);
    console.log('[GENERATE] Paramètres:', params);

    setIsGenerating(true);
    setProgress(0);
    setError(null);
    setGeneratedImage(null);
    setPromptId(null);

    try {
      console.log('[GENERATE] Envoi de la requête /generate...');
      const response = await api.generate(workflowName, params);
      
      if (response.prompt_id) {
        const id = response.prompt_id;
        console.log(`[GENERATE] ✅ Tâche créée avec prompt_id: ${id}`);
        setPromptId(id);
        
        await pollProgress(id);
      } else {
        throw new Error('Aucun prompt_id retourné par le serveur');
      }

    } catch (err: any) {
      console.error('[GENERATE] ❌ Erreur lors de la génération:', err);
      
      if (err.message.includes('401') || err.message.includes('non authentifié')) {
        setError('Session expirée. Veuillez vous reconnecter.');
      } else if (err.message.includes('500')) {
        setError('Erreur serveur. Le backend ou ComfyUI est peut-être indisponible.');
      } else if (err.message.includes('404')) {
        setError('Workflow introuvable sur le serveur.');
      } else {
        setError(err.message || 'Erreur lors de la génération');
      }
      
      setIsGenerating(false);
    }
  }, [pollProgress]);

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
