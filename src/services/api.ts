const BACKEND_URL = 'https://g-n-rateur-backend-1.onrender.com';
const SUPABASE_FUNCTION_URL = 'https://brwljqgvagddaydlctrz.supabase.co/functions/v1/make-server-52811d4b';

export const api = {
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

  async generateImage(formData: FormData, token?: string) {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${BACKEND_URL}/generate`, {
      method: 'POST',
      headers: headers,
      body: formData,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      // ✅ Capture l'erreur spécifique de ComfyUI renvoyée par ton backend
      throw new Error(data.error || `Erreur serveur : ${response.status}`);
    }
    return data;
  }
};
