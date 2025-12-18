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
      setGeneratedImage(null);
      setProgress(5);

      try {
        // 1️⃣ Submit
        const { prompt_id, client_id } = await api.generateImage(workflow, params);
        if (!prompt_id || !client_id) {
          throw new Error("Échec de soumission ComfyUI");
        }

        // 2️⃣ Progression simulée (jusqu’à 85%)
        progressTimerRef.current = window.setInterval(() => {
          setProgress((p) => (p < 85 ? p + 2 : p));
        }, 700);

        // 3️⃣ WebSocket ComfyUI
        const ws = new WebSocket(`${api.wsBaseUrl}/ws/progress/${client_id}`);
        wsRef.current = ws;

        ws.onmessage = async (event) => {
          let data: any;
          try {
            data = JSON.parse(event.data);
          } catch {
            return;
          }

          // Ignore messages non pertinents
          if (!data?.type) return;
          if (data.type === "executing") return;
          if (data.type === "keepalive") return;

          // ✅ FIN RÉELLE
          if (data.type === "executed") {
            if (progressTimerRef.current) {
              clearInterval(progressTimerRef.current);
              progressTimerRef.current = null;
            }

            setProgress(95);

            ws.close();
            wsRef.current = null;

            // 4️⃣ Récupération image
            const res = await api.getResult(prompt_id);
            if (!res?.image_base64) {
              throw new Error("Image absente après exécution");
            }

            setGeneratedImage(`data:image/png;base64,${res.image_base64}`);
            setProgress(100);
            setIsGenerating(false);
          }
        };

        ws.onerror = () => {
          throw new Error("Erreur WebSocket ComfyUI");
        };

      } catch (err: any) {
        if (progressTimerRef.current) {
          clearInterval(progressTimerRef.current);
          progressTimerRef.current = null;
        }

        if (wsRef.current) {
          wsRef.current.close();
          wsRef.current = null;
        }

        setError(err.message || "Erreur génération");
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
