import { useState, useEffect } from 'react';
import { api } from '../services/api';

/**
 * Composant de debug pour tester les workflows et voir leurs placeholders
 * Affiche la liste des workflows disponibles
 */
export function WorkflowDebug() {
  const [workflows, setWorkflows] = useState<string[]>([]);
  const [checkpoints, setCheckpoints] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [workflowsData, checkpointsData] = await Promise.all([
        api.getWorkflows(),
        api.getCheckpoints(),
      ]);
      
      setWorkflows(workflowsData.workflows);
      setCheckpoints(checkpointsData.checkpoints);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800 p-4 rounded-lg">
        <p className="text-gray-400">Chargement des workflows...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500 p-4 rounded-lg">
        <p className="text-red-400">❌ Erreur: {error}</p>
        <button 
          onClick={loadData}
          className="mt-2 text-sm text-blue-400 hover:underline"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 p-4 rounded-lg space-y-4">
      <div>
        <h3 className="text-sm text-purple-400 mb-2">📄 Workflows Disponibles</h3>
        <div className="space-y-1">
          {workflows.length === 0 ? (
            <p className="text-gray-500 text-xs">Aucun workflow trouvé</p>
          ) : (
            workflows.map(wf => (
              <div key={wf} className="bg-gray-700 px-3 py-1 rounded text-xs text-gray-300">
                {wf}
              </div>
            ))
          )}
        </div>
      </div>

      <div>
        <h3 className="text-sm text-purple-400 mb-2">🎨 Checkpoints Disponibles</h3>
        <div className="space-y-1">
          {checkpoints.length === 0 ? (
            <p className="text-gray-500 text-xs">Aucun checkpoint trouvé</p>
          ) : (
            checkpoints.map(ckpt => (
              <div key={ckpt} className="bg-gray-700 px-3 py-1 rounded text-xs text-gray-300">
                {ckpt}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="pt-2 border-t border-gray-700">
        <h3 className="text-xs text-gray-500 mb-1">ℹ️ Placeholders attendus dans les workflows JSON:</h3>
        <div className="bg-gray-900 p-2 rounded text-xs text-gray-400 font-mono">
          {'{'}{'{'} prompt {'}'}{'}'}, {'{'}{'{'} negative_prompt {'}'}{'}'}, {'{'}{'{'} steps {'}'}{'}'}, {'{'}{'{'} cfg_scale {'}'}{'}'}, 
          {'{'}{'{'} seed {'}'}{'}'}, {'{'}{'{'} sampler_name {'}'}{'}'}, {'{'}{'{'} scheduler {'}'}{'}'}, 
          {'{'}{'{'} denoise {'}'}{'}'}, {'{'}{'{'} width {'}'}{'}'}, {'{'}{'{'} height {'}'}{'}'}
        </div>
      </div>
    </div>
  );
}
