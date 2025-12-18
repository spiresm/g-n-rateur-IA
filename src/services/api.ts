const BACKEND_URL = "https://g-n-rateur-backend-1.onrender.com";

export const api = {
  // Utilisé par le hook pour le WebSocket
  wsBaseUrl: BACKEND_URL.replace("https://", "wss://"),

  async getWorkflows() {
    try {
      const response = await fetch(`${BACKEND_URL}/workflows`, {
        credentials: "include",
      });
      return response.ok ? await response.json() : [];
    } catch {
      return [];
    }
  },

  /**
   * 🔑 Génération image ComfyUI
   * params DOIT contenir :
   * - final_prompt (obligatoire)
   * - width
   * - height
   */
  async generateImage(workflow: string, params: any, token?: string) {
    // ✅ Construction du FormData ICI (et pas ailleurs)
    if (!params || !params.final_prompt) {
      throw new Error(
        "final_prompt manquant (générateur d’affiches ludiques)"
      );
    }

    const formData = new FormData();
    formData.append("final_prompt", params.final_prompt);

    if (params.width) formData.append("width", String(params.width));
    if (params.height) formData.append("height", String(params.height));
    if (params.seed) formData.append("seed", String(params.seed));

    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await fetch(
      `${BACKEND_URL}/generate?workflow_name=${encodeURIComponent(workflow)}`,
      {
        method: "POST",
        headers,
        body: formData,
        credentials: "include",
      }
    );

    let data: any = {};
    try {
      data = await response.json();
    } catch {
      // réponse vide ou non JSON
    }

    if (!response.ok) {
      console.error("DEBUG SERVER ERROR:", data);
      throw new Error(
        data.error || `Erreur serveur (${response.status})`
      );
    }

    // attendu : { prompt_id, client_id }
    return data;
  },

  /**
   * 🖼️ Récupération image finale
   */
  async getResult(promptId: string) {
    const response = await fetch(
      `${BACKEND_URL}/result/${promptId}`,
      {
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("Image non prête");
    }

    return response.json(); // { image_base64 }
  },
};
