const BACKEND_URL = 'https://g-n-rateur-backend-1.onrender.com';
const SUPABASE_FUNCTION_URL = 'https://brwljqgvagddaydlctrz.supabase.co/functions/v1/make-server-52811d4b';

export const api = {
  // ✅ Répare l'erreur 404 en pointant vers le backend Render
  async getWorkflows() {
    const response = await fetch(`${BACKEND_URL}/workflows`);
    if (!response.ok) throw new Error('HTTP ' + response.status);
    return response.json();
  },

  // ✅ Répare l'erreur 401 en ajoutant le Token (Bearer)
  async getUserQuota(email: string, token: string) {
    const response = await fetch(`${SUPABASE_FUNCTION_URL}/quota/${encodeURIComponent(email)}`, {
      headers: {
        'Authorization': `Bearer ${token}`, // Indispensable pour l'auth Supabase
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) throw new Error('Erreur quota: ' + response.status);
    return response.json();
  },

  async generateImage(formData: FormData) {
    const response = await fetch(`${BACKEND_URL}/generate`, {
      method: 'POST',
      body: formData,
    });
    return response.json();
  }
};
