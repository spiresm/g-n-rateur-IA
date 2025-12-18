import { useState, useCallback } from "react";
import { api } from "../services/api";

export function useImageGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const startGeneration = useCallback(async (workflow: string, params: any) => {
    if (isGenerating) return;

    setIsGenerating(true);
    setError(null);
    setProgress(0);

    try {
      // 1️⃣ Submit
      const { prompt_id, client_id } = await api.generateImage(workflow, params);
      if (!prompt_id || !client_id) throw new Error("Submit failed");

      // 2️⃣ WebSocket progress réel
      const ws = new WebSocket(
        `${api.wsBaseUrl}/ws/progress/${client_id}`
      );

      ws.onmessage = async (event) => {
        const data = JSON.parse(event.data);

        if (data.type === "progress") {
          setProgress(Math.round(data.value * 100));
        }

        if (data.type === "executed") {
          ws.close();

          // 3️⃣ Image finale
          const res = await api.getResult(prompt_id);
          if (!res?.image_base64) {
            throw new Error("Image absente");
          }

          setGeneratedImage(`data:image/png;base64,${res.image_base64}`);
          setProgress(100);
          setIsGenerating(false);
        }
      };

      ws.onerror = () => {
        throw new Error("WebSocket error");
      };

    } catch (err: any) {
      setError(err.message || "Erreur génération");
      setIsGenerating(false);
    }
  }, [isGenerating]);

  return {
    startGeneration,
    isGenerating,
    progress,
    error,
    generatedImage,
    clearError: () => setError(null),
  };
}
