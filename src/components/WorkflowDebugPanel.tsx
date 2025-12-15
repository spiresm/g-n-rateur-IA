import { useState, useEffect } from 'react';
import { FileCode, Server, Database, AlertCircle, CheckCircle } from 'lucide-react';
import { api } from '../services/api';

export function WorkflowDebugPanel() {
  const [workflows, setWorkflows] = useState<string[]>([]);
  const [checkpoints, setCheckpoints] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBackendInfo();
  }, []);

  const loadBackendInfo = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [workflowsData, checkpointsData] = await Promise.all([
        api.getWorkflows(),
        api.getCheckpoints(),
      ]);
      
      setWorkflows(workflowsData.workflows);
      setCheckpoints(checkpointsData.checkpoints);
    } catch (err: any) {
      console.error('[WORKFLOW DEBUG] Erreur:', err);
      setError(err.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 border border-gray-700 rounded-lg shadow-xl p-4 max-w-md z-50">
      <div className="flex items-center gap-2 mb-3">
        <Server className="w-5 h-5 text-blue-400" />
        <h3 className="text-white">🔍 Backend Debug</h3>
        <button
          onClick={loadBackendInfo}
          className="ml-auto text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded"
        >
          Actualiser
        </button>
      </div>

      {loading && (
        <div className="text-gray-400 text-sm">Chargement...</div>
      )}

      {error && (
        <div className="bg-red-900/30 border border-red-700 rounded p-2 mb-3">
          <div className="flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Workflows disponibles */}
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-2">
              <FileCode className="w-4 h-4 text-purple-400" />
              <span className="text-gray-300 text-sm">Workflows disponibles:</span>
            </div>
            <div className="bg-gray-900 rounded p-2 max-h-32 overflow-y-auto">
              {workflows.length === 0 ? (
                <div className="text-red-400 text-xs">❌ Aucun workflow trouvé</div>
              ) : (
                workflows.map((w, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-gray-300 py-1">
                    <CheckCircle className="w-3 h-3 text-green-400" />
                    <code className="text-green-400">{w}</code>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Checkpoints disponibles */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Database className="w-4 h-4 text-blue-400" />
              <span className="text-gray-300 text-sm">Checkpoints disponibles:</span>
            </div>
            <div className="bg-gray-900 rounded p-2 max-h-32 overflow-y-auto">
              {checkpoints.length === 0 ? (
                <div className="text-red-400 text-xs">❌ Aucun checkpoint trouvé</div>
              ) : (
                checkpoints.map((c, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-gray-300 py-1">
                    <CheckCircle className="w-3 h-3 text-blue-400" />
                    <code className="text-blue-400">{c}</code>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Workflows utilisés par l'app */}
          <div className="mt-3 pt-3 border-t border-gray-700">
            <div className="text-gray-300 text-sm mb-2">🎯 Workflows requis:</div>
            <div className="space-y-1">
              <WorkflowStatus name="default.json" exists={workflows.includes('default.json')} />
              <WorkflowStatus name="affiche.json" exists={workflows.includes('affiche.json')} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function WorkflowStatus({ name, exists }: { name: string; exists: boolean }) {
  return (
    <div className={`flex items-center gap-2 text-xs p-2 rounded ${
      exists ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
    }`}>
      {exists ? (
        <CheckCircle className="w-3 h-3" />
      ) : (
        <AlertCircle className="w-3 h-3" />
      )}
      <code>{name}</code>
      <span className="ml-auto">{exists ? '✅' : '❌ MANQUANT'}</span>
    </div>
  );
}
