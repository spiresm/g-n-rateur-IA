const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || "https://g-n-rateur-backend-1.onrender.com").replace(/\/$/, "");

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
   */
  async generateImage(workflow: string, params: any, token?: string) {
    if (!params || (!params.final_prompt && !params.prompt)) {
      throw new Error("Le prompt est manquant pour la génération.");
    }

    const formData = new FormData();
    
    // Injection du prompt
    formData.append("final_prompt", params.final_prompt || params.prompt);

    // Gestion de l'image (pour les angles ou l'affiche avec perso)
    if (params.image) {
      formData.append("image", params.image);
    }

    // Paramètres optionnels
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
      // Échec de lecture du JSON
    }

    if (!response.ok) {
      console.error("DEBUG SERVER ERROR:", data);
      throw new Error(data.error || `Erreur serveur (${response.status})`);
    }

    return data; // Retourne le prompt_id
  },

  /**
   * 🖼️ Récupération image finale avec BOUCLE D'ATTENTE (Polling)
   * Cette fonction réessaie jusqu'à ce que ComfyUI ait fini de générer.
   */
  async getResult(promptId: string, maxAttempts = 60): Promise<{ image_base64: string }> {
    console.log(`Démarrage de l'attente pour l'image : ${promptId}`);
    
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const response = await fetch(`${BACKEND_URL}/result/${promptId}`, {
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          if (data.image_base64) {
            console.log("Image reçue avec succès !");
            return data;
          }
        }
        
        // Si le serveur répond 404, l'image n'est pas encore prête
        if (response.status === 404) {
            console.log(`Tentative ${i + 1}/${maxAttempts} : L'image n'est pas encore prête...`);
        } else if (response.status !== 200) {
            console.warn("Réponse inattendue du serveur:", response.status);
        }

      } catch (err) {
        console.error("Erreur lors de la récupération du résultat:", err);
      }

      // Attendre 2 secondes avant la prochaine tentative (Polling)
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    throw new Error("Temps d'attente dépassé. ComfyUI est trop lent ou a crashé.");
  },
};
