const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL ?? "").replace(/\/$/, "");

export const api = {
  wsBaseUrl: BACKEND_URL.replace("https://", "wss://"),

  async getWorkflows() {
    try {
      const response = await fetch(`${BACKEND_URL}/workflows`);
      return response.ok ? await response.json() : [];
    } catch {
      return [];
    }
  },

  async generateImage(workflow: string, params: any, token?: string) {
    if (!params || (!params.final_prompt && !params.prompt)) {
      throw new Error("Le prompt est manquant pour la génération.");
    }

    const formData = new FormData();
    formData.append("final_prompt", params.final_prompt || params.prompt);
    if (params.image)  formData.append("image",  params.image);
    if (params.width)  formData.append("width",  String(params.width));
    if (params.height) formData.append("height", String(params.height));
    if (params.seed)   formData.append("seed",   String(params.seed));

    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await fetch(
      `${BACKEND_URL}/generate?workflow_name=${encodeURIComponent(workflow)}`,
      { method: "POST", headers, body: formData }
    );

    let data: any = {};
    try { data = await response.json(); } catch {}

    if (!response.ok) {
      console.error("DEBUG SERVER ERROR:", data);
      throw new Error(data.error || `Erreur serveur (${response.status})`);
    }

    return data;
  },

  async getResult(promptId: string, maxAttempts = 60): Promise<{ image_base64: string }> {
    console.log(`Attente image : ${promptId}`);

    for (let i = 0; i < maxAttempts; i++) {
      try {
        const response = await fetch(`${BACKEND_URL}/result/${promptId}`);

        if (response.ok) {
          const data = await response.json();
          if (data.image_base64) {
            console.log("Image reçue !");
            return data;
          }
        }

        if (response.status === 404) {
          console.log(`Tentative ${i + 1}/${maxAttempts} : pas encore prête…`);
        } else if (response.status !== 200) {
          console.warn("Réponse inattendue:", response.status);
        }
      } catch (err) {
        console.error("Erreur polling:", err);
      }

      await new Promise((r) => setTimeout(r, 2000));
    }

    throw new Error("Temps d'attente dépassé. ComfyUI est trop lent ou a crashé.");
  },
};
