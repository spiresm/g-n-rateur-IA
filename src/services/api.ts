// src/services/api.ts
export const api = {
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
      // ✅ Affiche l'erreur exacte dans ta console pour le debug
      console.error("Réponse d'erreur du serveur:", data);
      throw new Error(data.error || `Erreur GPU : ${response.status}`);
    }
    return data;
  }
};
