const BACKEND_URL = 'https://g-n-rateur-backend-1.onrender.com';

export const api = {
  async getWorkflows() {
    try {
      const response = await fetch(`${BACKEND_URL}/workflows`);
      return response.ok ? await response.json() : [];
    } catch (e) {
      return [];
    }
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
      // ✅ Log pour voir si le serveur envoie un détail technique
      console.error("DEBUG SERVER ERROR:", data);
      throw new Error(data.error || `Erreur GPU : ${response.status}`);
    }
    return data;
  }
};
