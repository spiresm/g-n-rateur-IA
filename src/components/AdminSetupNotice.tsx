import { useState } from 'react';
import { X, Database, ExternalLink } from 'lucide-react';

interface AdminSetupNoticeProps {
  onDismiss: () => void;
}

export function AdminSetupNotice({ onDismiss }: AdminSetupNoticeProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <div className="bg-yellow-900/90 backdrop-blur-sm border border-yellow-600 rounded-lg shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <Database className="h-6 w-6 text-yellow-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-100">
                Configuration requise
              </h3>
              <p className="text-sm text-yellow-200/80 mt-1">
                Le système de quota n'est pas configuré
              </p>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="flex-shrink-0 text-yellow-400 hover:text-yellow-300 transition-colors"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-4 pb-4">
          <div className="text-sm text-yellow-100/90">
            <p className="mb-3">
              Les tables Supabase pour gérer les quotas d'utilisateurs et les paiements PayPal ne sont pas encore créées.
            </p>
            
            {isExpanded && (
              <div className="space-y-3 mt-4 p-3 bg-yellow-950/50 rounded border border-yellow-700/30">
                <p className="font-medium text-yellow-100">
                  Pour activer le système de quota :
                </p>
                <ol className="list-decimal list-inside space-y-2 text-yellow-200/80">
                  <li>Ouvrez votre tableau de bord Supabase</li>
                  <li>Allez dans <code className="px-1.5 py-0.5 bg-yellow-950 rounded text-xs">SQL Editor</code></li>
                  <li>Exécutez le SQL dans <code className="px-1.5 py-0.5 bg-yellow-950 rounded text-xs">SUPABASE_TABLES_SETUP.md</code></li>
                </ol>
                
                <div className="pt-2 mt-3 border-t border-yellow-700/30">
                  <p className="text-xs text-yellow-300/70">
                    <strong>Mode actuel :</strong> Générations illimitées sans suivi des quotas
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-3 text-yellow-400 hover:text-yellow-300 text-sm font-medium flex items-center gap-1 transition-colors"
            >
              {isExpanded ? 'Masquer les détails' : 'Voir les instructions'}
              <ExternalLink className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-yellow-950/40 rounded-b-lg border-t border-yellow-700/30">
          <p className="text-xs text-yellow-300/60">
            Cette notification disparaîtra une fois les tables créées
          </p>
        </div>
      </div>
    </div>
  );
}
