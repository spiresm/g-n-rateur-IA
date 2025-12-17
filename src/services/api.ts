const BACKEND_URL = 'https://g-n-rateur-backend-1.onrender.com';
const SUPABASE_FUNCTION_URL = 'https://brwljqgvagddaydlctrz.supabase.co/functions/v1/make-server-52811d4b';

export const api = {
  // Répare l'erreur 404/length en s'assurant de renvoyer un tableau vide si erreur
  async getWorkflows() {
    try {
      const response = await fetch(`${BACKEND_URL}/workflows`);
      if (!response.ok) return []; 
      return await response.json();
    } catch (e) {
      return [];
    }
  },

  // Répare l'erreur 401 en ajoutant l'Authorization Header
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

  // Répare "di.generate is not a function" en nommant correctement la méthode
  async generateImage(formData: FormData) {
    const response = await fetch(`${BACKEND_URL}/generate`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) throw new Error('Erreur génération');
    return response.json();
  }
};
