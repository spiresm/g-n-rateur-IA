import { useState, useCallback, useRef } from "react";
import { api } from "../services/api";

/* ======================================================
   Utils
====================================================== */
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/* ======================================================
   Hook Harmonisé
====================================================== */
export function useImageGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const fakeTimerRef = useRef<number | null>(null);
  const aliveRef = useRef(true);

  const clearAll = () => {
    if (fakeTimerRef.current) {
      clearInterval(fakeTimerRef.current);
      fakeTimerRef.current = null;
    }
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch {}
      wsRef.current = null;
    }
  };

  const startGeneration = useCallback(
    async (workflow: string, params: any) => {
      if (isGenerating) return;

      aliveRef.current = true;
      clearAll();

      setIsGenerating(true);
      setError(null);
      setGeneratedImage(null);
      setProgress(3);

      try {
        /* 1️⃣ Soumission au Backend */
        const { prompt_id, client_id } = await api.generateImage(
          workflow,
          params
        );

        if (!prompt_id || !client_id) {
          throw new Error("Échec de soumission ComfyUI");
        }

        /* 2️⃣ Progression visuelle lente (UX) */
        fakeTimerRef.current = window.setInterval(() => {
          setProgress((p) => {
            if (p < 40) return p + 1;
            if (p < 65) return p + 0.5;
            if (p < 80) return p + 0.2;
            return p;
          });
        }, 900);

        /* 3️⃣ Gestion de la récupération (Indépendante du WS pour la fiabilité) */
        // On lance la récupération dès que possible. 
        // api.getResult gère maintenant ses propres tentatives.
        const handleFetchResult = async () => {
          try {
            const res = await api.getResult(prompt_id);
            if (!aliveRef.current) return;

            if (res?.image_base64) {
              clearAll();
              setGeneratedImage(`data:image/png;base64,${res.image_base64}`);
              setProgress(100);
              setIsGenerating(false);
            }
          } catch (err: any) {
            if (aliveRef.current) {
              setError(err.message || "Erreur de récupération");
              setIsGenerating(false);
            }
          }
        };

        /* 4️⃣ WebSocket pour le retour visuel uniquement */
        const ws = new WebSocket(`${api.wsBaseUrl}/ws/progress/${client_id}`);
        wsRef.current = ws;

        ws.onmessage = (event) => {
          if (!aliveRef.current) return;
          let data: any;
          try { data = JSON.parse(event.data); } catch { return; }

          // Quand ComfyUI a fini l'exécution technique
          if (data.type === "executed" || data.type === "status") {
             // On s'assure que la récupération est lancée ou terminée
             handleFetchResult();
          }
        };

        // Fallback : Si après 10s rien ne bouge, on force la récupération
        setTimeout(() => {
          if (aliveRef.current && isGenerating && progress < 90) {
            handleFetchResult();
          }
        }, 10000);

      } catch (err: any) {
        clearAll();
        setError(err?.message || "Erreur lors de la génération");
        setIsGenerating(false);
      }
    },
    [isGenerating, progress]
  );

  return {
    startGeneration,
    isGenerating,
    progress,
    error,
    generatedImage,
    clearError: () => setError(null),
  };
}
