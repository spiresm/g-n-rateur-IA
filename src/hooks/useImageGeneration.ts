import { useState, useCallback, useRef } from "react";
import { api } from "../services/api";

/* ======================================================
   Utils
====================================================== */
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/* ======================================================
   Hook
====================================================== */
export function useImageGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const fakeTimerRef = useRef<number | null>(null);
  const aliveRef = useRef(true);

  /* -------------------------------------------------- */
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

  /* -------------------------------------------------- */
  const pollResultUntilReady = async (
    promptId: string,
    timeoutMs = 120_000
  ): Promise<string> => {
    const started = Date.now();
    let attempt = 0;

    while (Date.now() - started < timeoutMs) {
      try {
        const res = await api.getResult(promptId);
        if (res?.image_base64) {
          return res.image_base64;
        }
      } catch {
        // image pas encore prête
      }

      attempt++;
      const delay = Math.min(800 + attempt * 500, 2500);
      await sleep(delay);
    }

    throw new Error("Image non prête après le délai imparti");
  };

  /* ======================================================
     START GENERATION
  ====================================================== */
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
        /* 1️⃣ Submit */
        const { prompt_id, client_id } = await api.generateImage(
          workflow,
          params
        );

        if (!prompt_id || !client_id) {
          throw new Error("Échec de soumission ComfyUI");
        }

        /* 2️⃣ Progression FAKE lente et crédible (max 80%) */
        fakeTimerRef.current = window.setInterval(() => {
          setProgress((p) => {
            if (p < 40) return p + 1;      // début visible
            if (p < 65) return p + 0.5;    // milieu lent
            if (p < 80) return p + 0.2;    // approche finale
            return p;
          });
        }, 900);

        /* 3️⃣ WebSocket ComfyUI (signal, jamais autoritaire) */
        const ws = new WebSocket(`${api.wsBaseUrl}/ws/progress/${client_id}`);
        wsRef.current = ws;

        ws.onmessage = async (event) => {
          if (!aliveRef.current) return;

          let data: any;
          try {
            data = JSON.parse(event.data);
          } catch {
            return;
          }

          if (!data?.type) return;
          if (data.type === "keepalive") return;

          /* 🔹 Progress backend → ne fait JAMAIS sauter */
          if (data.type === "progress") {
            const v =
              typeof data.value === "number"
                ? data.value
                : typeof data?.data?.value === "number"
                ? data.data.value
                : null;

            if (v === null) return;

            setProgress((p) => {
              // On ignore tant que l'UX n'est pas lancée
              if (p < 25) return p;

              const backendPct = Math.round(v * 100);
              const capped = Math.min(backendPct, 85);

              // avance max +2%
              return Math.min(p + 2, capped);
            });

            return;
          }

          /* 🔹 Fin logique (image PAS forcément prête) */
          if (data.type === "executed") {
            clearAll();
            setProgress((p) => (p < 88 ? 88 : p));

            const b64 = await pollResultUntilReady(prompt_id);

            if (!aliveRef.current) return;

            setGeneratedImage(`data:image/png;base64,${b64}`);
            setProgress(100);
            setIsGenerating(false);
          }
        };

        /* 4️⃣ Fallback absolu si WS muet */
        setTimeout(async () => {
          if (!aliveRef.current) return;
          if (progress >= 80) return; // WS a déjà parlé

          try {
            clearAll();
            setProgress(88);

            const b64 = await pollResultUntilReady(prompt_id);
            if (!aliveRef.current) return;

            setGeneratedImage(`data:image/png;base64,${b64}`);
            setProgress(100);
            setIsGenerating(false);
          } catch {
            // laisse le WS continuer s'il vit
          }
        }, 15_000);

      } catch (err: any) {
        clearAll();
        setError(err?.message || "Erreur lors de la génération");
        setIsGenerating(false);
      }
    },
    [isGenerating]
  );

  /* ======================================================
     API
  ====================================================== */
  return {
    startGeneration,
    isGenerating,
    progress,
    error,
    generatedImage,
    clearError: () => setError(null),
  };
}
