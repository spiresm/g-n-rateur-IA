
// Configuration de l'API Backend (Wrapper API sur Render)
const API_BASE_URL = "https://g-n-rateur-backend-1.onrender.com";

/**
 * Récupère les headers d'authentification avec le token Google JWT
 * Conforme à la Bible du projet: Authorization: Bearer <ID_TOKEN_JWT>
 */
function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("google_id_token");
  if (!token) {
    throw new Error("Utilisateur non authentifié");
  }
  return {
    Authorization: `Bearer ${token}`
  };
}

// ============================================================================
// TYPES DE RÉPONSE API (conformes à la Bible)
// ============================================================================

export interface GenerateResponse {
  prompt_id: string; // ID de la tâche retourné par /generate
}

export interface ProgressResponse {
  status: {
    completed: boolean;
  };
}

export interface ResultResponse {
  image_base64: string; // Image en base64 (pas de filename selon le backend)
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

// ============================================================================
// API CLIENT (conformes aux endpoints de la Bible)
// ============================================================================

export const api = {
  /**
   * POST /generate - Démarre une génération d'image
   * Header requis: Authorization: Bearer <JWT>
   * Retourne: { prompt_id: string }
   */
  async generate(workflowName: string, params: {
    prompt: string;
    negative_prompt: string;
    steps: number;
    cfg_scale: number;
    seed: number;
    sampler_name: string;
    scheduler: string;
    denoise: number;
    width: number;
    height: number;
  }): Promise<GenerateResponse> {
    const formData = new FormData();
    
    // Ajouter tous les paramètres au FormData
    formData.append('prompt', params.prompt);
    formData.append('negative_prompt', params.negative_prompt);
    formData.append('steps', params.steps.toString());
    formData.append('cfg_scale', params.cfg_scale.toString());
    formData.append('seed', params.seed.toString());
    formData.append('sampler_name', params.sampler_name);
    formData.append('scheduler', params.scheduler);
    formData.append('denoise', params.denoise.toString());
    formData.append('width', params.width.toString());
    formData.append('height', params.height.toString());

    const response = await fetch(
      `${API_BASE_URL}/generate?workflow_name=${encodeURIComponent(workflowName)}`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: formData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    return response.json();
  },

  /**
   * GET /progress/{prompt_id} - Polling de l'état de génération
   * Header requis: Authorization: Bearer <JWT>
   * Retourne: { status: { completed: boolean } }
   */
  async getProgress(promptId: string): Promise<ProgressResponse> {
    const response = await fetch(`${API_BASE_URL}/progress/${promptId}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return response.json();
  },

  /**
   * GET /result/{prompt_id} - Récupère l'image générée
   * Header requis: Authorization: Bearer <JWT>
   * Retourne: { image_base64: string, filename: string }
   */
  async getResult(promptId: string): Promise<ResultResponse> {
    const response = await fetch(`${API_BASE_URL}/result/${promptId}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return response.json();
  },

  /**
   * GET /gpu_status - Monitoring GPU (public)
   * Retourne: { name, load, memory_used, memory_total, temperature }
   */
  async getGPUStatus(): Promise<GPUStatus> {
    const response = await fetch(`${API_BASE_URL}/gpu_status`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return response.json();
  },

  /**
   * GET /workflows - Liste des workflows disponibles (public)
   * Retourne: { workflows: string[] }
   */
  async getWorkflows(): Promise<WorkflowsResponse> {
    const response = await fetch(`${API_BASE_URL}/workflows`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return response.json();
  },

  /**
   * GET /checkpoints - Liste des checkpoints disponibles (public)
   * Retourne: { checkpoints: string[] }
   */
  async getCheckpoints(): Promise<CheckpointsResponse> {
    const response = await fetch(`${API_BASE_URL}/checkpoints`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return response.json();
  },
};

