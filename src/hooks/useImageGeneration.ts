import { useState, useCallback, useRef } from "react";
import { api } from "../services/api";

export function useImageGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const progressTimerRef = useRef<number | null>(null);

  const startGeneration = useCallback(
    async (workflow: string, params: any) => {
      if (isGenerating) return;

      setIsGenerating(true);
      setError(null);
      setProgress(5);
      setGeneratedImage(null);

      try {
        // 1️⃣ Submit → backend / ComfyUI
        const { prompt_id, client_id } = await api.generateImage(workflow, params);

        if (!prompt_id || !client_id) {
          throw new Error("Échec de soumission à ComfyUI (prompt_id manquant)");
        }

        // 2️⃣ Progression simulée continue (UX fluide)
        progressTimerRef.current = window.setInterval(() => {
          setProgress((p) => {
            if (p < 85) return p + 3;
            return p;
          });
        }, 600);

        // 3️⃣ WebSocket = signal de fin ComfyUI
        const ws = new WebSocket(
          `${api.wsBaseUrl}/ws/progress/${client_id}`
        );
        wsRef.current = ws;

        ws.onmessage = async () => {
          // ComfyUI a fini (peu importe le type exact de message)
          if (progressTimerRef.current) {
            clearInterval(progressTimerRef.current);
            progressTimerRef.current = null;
          }

          setProgress(95);

          ws.close();
          wsRef.current = null;

          // 4️⃣ Récupération image finale
          const res = await api.getResult(prompt_id);
          if (!res?.image_base64) {
            throw new Error("Image absente après exécution ComfyUI");
          }

          setGeneratedImage(`data:image/png;base64,${res.image_base64}`);
          setProgress(100);
          setIsGenerating(false);
        };

        ws.onerror = () => {
          throw new Error("Erreur WebSocket ComfyUI");
        };

        ws.onclose = () => {
          wsRef.current = null;
        };

      } catch (err: any) {
        console.error("[useImageGeneration]", err);

        if (progressTimerRef.current) {
          clearInterval(progressTimerRef.current);
          progressTimerRef.current = null;
        }

        if (wsRef.current) {
          wsRef.current.close();
          wsRef.current = null;
        }

        setError(err.message || "Erreur lors de la génération");
        setIsGenerating(false);
      }
    },
    [isGenerating]
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
