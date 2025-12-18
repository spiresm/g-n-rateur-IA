// src/services/api.ts

export const api = {
  // ... autres méthodes ...

  async generateImage(formData: FormData, token?: string) {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${BACKEND_URL}/generate`, {
      method: 'POST',
      headers: headers,
      body: formData,
    });

    if (!response.ok) {
      // ✅ On récupère le JSON d'erreur pour voir ce qui ne va pas avec ComfyUI
      const errorData = await response.json().catch(() => ({}));
      const message = errorData.error || `Erreur serveur : ${response.status}`;
      throw new Error(message);
    }
    
    return response.json();
  }
};
