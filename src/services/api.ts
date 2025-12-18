const BACKEND_URL = 'https://g-n-rateur-backend-1.onrender.com';
const SUPABASE_FUNCTION_URL = 'https://brwljqgvagddaydlctrz.supabase.co/functions/v1/make-server-52811d4b';

export const api = {
  // Récupération des workflows (évite l'erreur not a function)
  async getWorkflows() {
    try {
      const response = await fetch(`${BACKEND_URL}/workflows`);
      if (!response.ok) return [];
      return await response.json();
    } catch (e) {
      console.error("Erreur workflows:", e);
      return [];
    }
  },

  // Récupération du quota
  async getUserQuota(email: string, token: string) {
    const response = await fetch(`${SUPABASE_FUNCTION_URL}/quota/${encodeURIComponent(email)}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) throw new Error('Erreur quota: ' + response.status);
    return response.json();
  },

  // Génération d'image (Gestion de l'erreur 500)
  async generateImage(formData: FormData, token?: string) {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${BACKEND_URL}/generate`, {
      method: 'POST',
      headers: headers,
      body: formData,
    });

    // On récupère le corps de la réponse même en cas d'erreur
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      // Si le backend renvoie "ComfyUI error", on l'affiche proprement
      throw new Error(data.error || `Erreur serveur (${response.status}) : Vérifiez que votre GPU est allumé.`);
    }
    return data;
  }
};
