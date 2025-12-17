import { useState, useRef } from "react";

interface GeneratePayload {
  workflowName: string;
  prompt: string;
  width: number;
  height: number;
}

export function useImageGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const startGeneration = async (payload: GeneratePayload) => {
    setIsGenerating(true);
    setProgress(0);

    console.log("🚀 Envoi de la requête de génération...", payload);

    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/generate`,
      {
        method: "POST",
        credentials: "include",
        body: new URLSearchParams({
          workflow_name: payload.workflowName,
          user_menu_prompt: payload.prompt,
          width: String(payload.width),
          height: String(payload.height)
        })
      }
    );

    const data = await res.json();
    const clientId = data.client_id;

    if (!clientId) {
      throw new Error("client_id manquant");
    }

    // --- WEBSOCKET COMFYUI ---
    const ws = new WebSocket(
      `${import.meta.env.VITE_BACKEND_URL.replace(
        "https",
        "wss"
      )}/ws/progress/${clientId}`
    );

    wsRef.current = ws;

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      if (msg.type === "progress" && typeof msg.value === "number") {
        setProgress(Math.round(msg.value * 100));
      }

      if (msg.type === "executing") {
        setIsGenerating(true);
      }

      if (msg.type === "completed") {
        setProgress(100);
        setIsGenerating(false);
        ws.close();
      }
    };

    ws.onerror = () => {
      console.error("❌ WebSocket error");
      setIsGenerating(false);
    };
  };

  const cancelGeneration = () => {
    wsRef.current?.close();
    setIsGenerating(false);
    setProgress(null);
  };

  return {
    startGeneration,
    cancelGeneration,
    isGenerating,
    progress
  };
}
