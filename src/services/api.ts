const BACKEND_URL = 'https://g-n-rateur-backend-1.onrender.com';
const SUPABASE_FUNCTION_URL = 'https://brwljqgvagddaydlctrz.supabase.co/functions/v1/make-server-52811d4b';

export const api = {
  async getWorkflows() {
    try {
      const response = await fetch(`${BACKEND_URL}/workflows`);
      if (!response.ok) return []; 
      return await response.json();
    } catch (e) {
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

  async generateImage(formData: FormData) {
    // Note: Ne pas mettre 'Content-Type' manuel pour un FormData, le navigateur le fait seul
    const response = await fetch(`${BACKEND_URL}/generate`, {
      method: 'POST',
      body: formData,
      // Si votre backend nécessite le token pour valider le quota :
      // headers: { 'Authorization': `Bearer ${token}` } 
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Erreur serveur : ${response.status}`);
    }
    return response.json();
  }
};
