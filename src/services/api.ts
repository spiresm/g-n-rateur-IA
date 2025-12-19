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
   * - image (obligatoire pour multiple-angles.json)
   * - width / height / seed
   */
  async generateImage(workflow: string, params: any, token?: string) {
    // ✅ Vérification du prompt
    if (!params || (!params.final_prompt && !params.prompt)) {
      throw new Error(
        "final_prompt manquant (générateur d’affiches ludiques)"
      );
    }

    const formData = new FormData();
    
    // ✅ Injection du prompt (on accepte prompt ou final_prompt pour la flexibilité)
    formData.append("final_prompt", params.final_prompt || params.prompt);

    // ✅ AJOUT DE L'IMAGE (Crucial pour l'erreur 500/400 sur LoadImage)
    // On vérifie si une image est présente dans les params (File ou Blob)
    if (params.image) {
      formData.append("image", params.image);
    }

    // ✅ Autres paramètres
    if (params.width) formData.append("width", String(params.width));
    if (params.height) formData.append("height", String(params.height));
    if (params.seed) formData.append("seed", String(params.seed));

    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    // Note : On ne définit pas "Content-Type" manuellement, le navigateur le fait
    // automatiquement pour le FormData avec le "boundary" correct.
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
