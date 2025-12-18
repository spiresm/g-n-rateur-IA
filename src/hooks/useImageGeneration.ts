import { useState, useCallback, useRef } from "react";
import { api } from "../services/api";

export function useImageGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);

  const startGeneration = useCallback(
    async (workflow: string, params: any) => {
      if (isGenerating) return;

      setIsGenerating(true);
      setError(null);
      setProgress(0);
      setGeneratedImage(null);

      try {
        // 1️⃣ Submit → ComfyUI
        const { prompt_id, client_id } = await api.generateImage(workflow, params);

        if (!prompt_id || !client_id) {
          throw new Error("Échec de soumission à ComfyUI (prompt_id manquant)");
        }

        // 2️⃣ WebSocket ComfyUI (progress réel)
        const ws = new WebSocket(
          `${api.wsBaseUrl}/ws/progress/${client_id}`
        );
        wsRef.current = ws;

        ws.onmessage = async (event) => {
          let data: any;
          try {
            data = JSON.parse(event.data);
          } catch {
            return; // message non JSON → ignore
          }

          // ignore keepalive
          if (data.type === "keepalive") return;

          // ComfyUI: node en cours d’exécution
          if (data.type === "executing") {
            setProgress((p) => Math.min(p + 5, 90));
          }

          // ComfyUI: exécution terminée
          if (data.type === "executed") {
            setProgress(100);
            ws.close();
            wsRef.current = null;

            // 3️⃣ Récupération image finale
            const res = await api.getResult(prompt_id);
            if (!res?.image_base64) {
              throw new Error("Image absente après exécution ComfyUI");
            }

            setGeneratedImage(`data:image/png;base64,${res.image_base64}`);
            setIsGenerating(false);
          }
        };

        ws.onerror = () => {
          throw new Error("Erreur WebSocket ComfyUI");
        };

        ws.onclose = () => {
          wsRef.current = null;
        };

      } catch (err: any) {
        console.error("[useImageGeneration]", err);
        setError(err.message || "Erreur lors de la génération");
        setIsGenerating(false);

        if (wsRef.current) {
          wsRef.current.close();
          wsRef.current = null;
        }
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
