import { useState, useCallback, useRef } from "react";
import { api } from "../services/api";

export function useImageGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const progressTimerRef = useRef<number | null>(null);
  const fallbackTimerRef = useRef<number | null>(null);

  const startGeneration = useCallback(
    async (workflow: string, params: any) => {
      if (isGenerating) return;

      setIsGenerating(true);
      setError(null);
      setGeneratedImage(null);
      setProgress(5);

      let promptId: string | null = null;

      try {
        // 1️⃣ Submit
        const { prompt_id, client_id } = await api.generateImage(workflow, params);
        if (!prompt_id || !client_id) {
          throw new Error("Échec de soumission ComfyUI");
        }
        promptId = prompt_id;

        // 2️⃣ Progression fake fluide
        progressTimerRef.current = window.setInterval(() => {
          setProgress((p) => (p < 85 ? p + 2 : p));
        }, 700);

        // 3️⃣ WebSocket (accélérateur, pas vérité)
        const ws = new WebSocket(`${api.wsBaseUrl}/ws/progress/${client_id}`);
        wsRef.current = ws;

        ws.onmessage = async (event) => {
          let data: any;
          try {
            data = JSON.parse(event.data);
          } catch {
            return;
          }

          if (data?.type !== "executed") return;

          await finalize(prompt_id);
        };

        // 4️⃣ Fallback ABSOLU (sécurité)
        fallbackTimerRef.current = window.setTimeout(async () => {
          console.warn("⚠️ Fallback result polling déclenché");
          if (promptId) {
            await finalize(promptId);
          }
        }, 12000); // ⏱️ 12s = large marge

        async function finalize(id: string) {
          if (progressTimerRef.current) {
            clearInterval(progressTimerRef.current);
            progressTimerRef.current = null;
          }
          if (fallbackTimerRef.current) {
            clearTimeout(fallbackTimerRef.current);
            fallbackTimerRef.current = null;
          }
          if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
          }

          setProgress(95);

          const res = await api.getResult(id);
          if (!res?.image_base64) {
            throw new Error("Image absente après génération");
          }

          setGeneratedImage(`data:image/png;base64,${res.image_base64}`);
          setProgress(100);
          setIsGenerating(false);
        }

      } catch (err: any) {
        cleanup();
        setError(err.message || "Erreur génération");
        setIsGenerating(false);
      }

      function cleanup() {
        if (progressTimerRef.current) clearInterval(progressTimerRef.current);
        if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
        if (wsRef.current) wsRef.current.close();

        progressTimerRef.current = null;
        fallbackTimerRef.current = null;
        wsRef.current = null;
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
