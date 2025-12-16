// Configuration de l'API Backend (Wrapper API sur Render)
const API_BASE_URL = "https://g-n-rateur-backend-1.onrender.com";

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("google_id_token");
  if (!token) {
    throw new Error("Utilisateur non authentifié");
  }
  return {
    Authorization: `Bearer ${token}`
  };
}

export interface GenerateResponse {
  prompt_id: string;
}

export interface ProgressResponse {
  status: {
    completed: boolean;
  };
}

export interface ResultResponse {
  image_base64: string;
}

export interface GPUStatus {
  name: string;
  load: number;
  memory_used: number;
  memory_total: number;
  temperature: number;
}

export interface WorkflowsResponse {
  workflows: string[];
}

export interface CheckpointsResponse {
  checkpoints: string[];
}

export const api = {
  async generate(workflowName: string, params: Record<string, any>): Promise<GenerateResponse> {
    console.log('[API] 🔍 DÉBUT generate() - workflowName:', workflowName);
    console.log('[API] 🔍 Paramètres reçus:', params);
    console.log('[API] 🚨 CRITICAL - width:', params.width, 'height:', params.height);
    
    // ✅ CORRECTION : Envoyer JSON au lieu de FormData
    const response = await fetch(
      `${API_BASE_URL}/generate?workflow_name=${encodeURIComponent(workflowName)}`,
      {
        method: "POST",
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      }
    );

    console.log('[API] 📡 Réponse HTTP:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[API] ❌ Erreur backend:', errorText);
      
      // Parser les détails de l'erreur FastAPI si disponibles
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.detail) {
          console.error('[API] 💥 Détails:', errorJson.detail);
        }
      } catch (e) {
        // Ignore parsing errors
      }
      
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log('[API] ✅ Réponse JSON du backend:', result);
    return result;
  },

  async getProgress(promptId: string): Promise<ProgressResponse> {
    const response = await fetch(`${API_BASE_URL}/progress/${promptId}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return response.json();
  },

  async getResult(promptId: string): Promise<ResultResponse> {
    const response = await fetch(`${API_BASE_URL}/result/${promptId}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return response.json();
  },

  async getGPUStatus(): Promise<GPUStatus> {
    const response = await fetch(`${API_BASE_URL}/gpu_status`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return response.json();
  },

  async getWorkflows(): Promise<WorkflowsResponse> {
    const response = await fetch(`${API_BASE_URL}/workflows`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return response.json();
  },

  async getCheckpoints(): Promise<CheckpointsResponse> {
    const response = await fetch(`${API_BASE_URL}/checkpoints`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return response.json();
  },
};
