const BACKEND_URL = 'https://g-n-rateur-backend-1.onrender.com';

export const api = {
  // ... getWorkflows ...

  async generateImage(formData: FormData, token?: string) {
    const headers: Record<string, string> = {};
    
    // ✅ On ajoute le token si disponible pour éviter la 500/401 côté serveur
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${BACKEND_URL}/generate`, {
      method: 'POST',
      headers: headers, // Ne pas mettre Content-Type pour FormData
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Détails erreur serveur:", errorText);
      throw new Error(`Erreur serveur : ${response.status}`);
    }
    return response.json();
  }
};
