import { useState, useCallback, useRef } from "react";
import { api } from "../services/api";

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export function useImageGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const fakeTimerRef = useRef<number | null>(null);
  const aliveRef = useRef(true);

  const clearTimersAndWs = () => {
    if (fakeTimerRef.current) {
      clearInterval(fakeTimerRef.current);
      fakeTimerRef.current = null;
    }
    if (wsRef.current) {
      try { wsRef.current.close(); } catch {}
      wsRef.current = null;
    }
  };

  const pollResultUntilReady = async (promptId: string, timeoutMs = 120_000) => {
    const started = Date.now();
    let attempt = 0;

    while (Date.now() - started < timeoutMs) {
      try {
        const res = await api.getResult(promptId);
        if (res?.image_base64) return res.image_base64;
      } catch {
        // Image pas prête (404/500), on continue à poll
      }

      attempt += 1;
      // backoff doux: 600ms → 1200ms → 1800ms → 2400ms (cap)
      const delay = Math.min(600 + attempt * 600, 2400);
      await sleep(delay);
    }

    throw new Error("Image non prête après le délai imparti");
  };

  const startGeneration = useCallback(
    async (workflow: string, params: any) => {
      if (isGenerating) return;

      aliveRef.current = true;
      setIsGenerating(true);
      setError(null);
      setGeneratedImage(null);
      setProgress(3);

      clearTimersAndWs();

      try {
        // 1) Submit
        const { prompt_id, client_id } = await api.generateImage(workflow, params);
        if (!prompt_id || !client_id) throw new Error("Échec de soumission ComfyUI");

        // 2) Progression fake LENTE (ne dépasse jamais 88%)
        fakeTimerRef.current = window.setInterval(() => {
          setProgress((p) => {
            // avance doucement tant qu'on n'a pas de vrai progress
            if (p < 70) return p + 1;
            if (p < 88) return p + 0; // plateau (on attend le vrai signal)
            return p;
          });
        }, 1200);

        // 3) WebSocket (si ComfyUI envoie progress, on l'utilise)
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

          // ✅ Progress réel (souvent: {type:"progress", data:{value:0.44, max:...}} ou {value:0.44})
          if (data.type === "progress") {
            const v =
              typeof data.value === "number"
                ? data.value
                : typeof data?.data?.value === "number"
                ? data.data.value
                : null;

            if (v !== null) {
              // map 0..1 → 5..90
              const pct = Math.max(5, Math.min(90, Math.round(v * 90)));
              setProgress((p) => (pct > p ? pct : p));
            }
            return;
          }

          // ✅ Fin logique d’exécution (mais image pas forcément prête instantanément)
          if (data.type === "executed") {
            // stop fake + ws
            clearTimersAndWs();

            // on se met à 92%, puis on poll jusqu’à obtenir l’image
            setProgress((p) => (p < 92 ? 92 : p));

            const b64 = await pollResultUntilReady(prompt_id, 120_000);

            if (!aliveRef.current) return;

            setGeneratedImage(`data:image/png;base64,${b64}`);
            setProgress(100);
            setIsGenerating(false);
            return;
          }
        };

        ws.onerror = async () => {
          // si WS foire, on ne bloque pas: on poll le résultat
          try {
            clearTimersAndWs();
            setProgress((p) => (p < 92 ? 92 : p));

            const b64 = await pollResultUntilReady(prompt_id, 120_000);

            if (!aliveRef.current) return;

            setGeneratedImage(`data:image/png;base64,${b64}`);
            setProgress(100);
            setIsGenerating(false);
          } catch (e: any) {
            if (!aliveRef.current) return;
            setError(e?.message || "Erreur WebSocket / récupération image");
            setIsGenerating(false);
          }
        };

        // ✅ Fallback ultime (même si WS n’envoie jamais executed)
        // Au bout de 15s, on commence à poll en parallèle si on n'a pas déjà avancé.
        setTimeout(async () => {
          if (!aliveRef.current) return;
          setProgress((p) => (p < 30 ? 30 : p));

          try {
            const b64 = await pollResultUntilReady(prompt_id, 120_000);
            if (!aliveRef.current) return;

            clearTimersAndWs();
            setGeneratedImage(`data:image/png;base64,${b64}`);
            setProgress(100);
            setIsGenerating(false);
          } catch {
            // on laisse le WS continuer si lui marche
          }
        }, 15000);

      } catch (err: any) {
        clearTimersAndWs();
        setError(err?.message || "Erreur lors de la génération");
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
