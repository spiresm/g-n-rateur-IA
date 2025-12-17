import { useState, useEffect, useCallback } from 'react';
import { CreditCard, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useAuth } from '../contexts/AuthContext';
import { projectId } from '../utils/supabase/info';

interface QuotaInfo {
  allowed: boolean;
  remaining: number | 'unlimited';
  used: number;
  limit: number;
  is_premium: boolean;
  subscription_type: string;
}

interface QuotaDisplayProps {
  onUpgradeClick: () => void;
}

export function QuotaDisplay({ onUpgradeClick }: QuotaDisplayProps) {
  // ✅ Récupération du token depuis le contexte d'auth
  const { user, token } = useAuth();
  const [quota, setQuota] = useState<QuotaInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [systemEnabled, setSystemEnabled] = useState(true);

  const fetchQuota = useCallback(async () => {
    // ✅ On vérifie qu'on a bien l'email ET le token
    if (!user?.email || !token) return;

    try {
      setLoading(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-52811d4b/quota/${encodeURIComponent(user.email)}`,
        {
          headers: {
            'Content-Type': 'application/json',
            // ✅ AJOUT DU TOKEN : C'est ce qui corrige l'erreur 401
            'Authorization': `Bearer ${token}`
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          console.error('❌ Erreur 401 : Jeton d\'authentification invalide ou manquant.');
        }
        setSystemEnabled(false);
        setLoading(false);
        return;
      }

      const data = await response.json();
      setQuota(data);
      setSystemEnabled(true);
    } catch (error) {
      console.warn('⚠️ Erreur réseau ou système de quota non configuré.');
      setSystemEnabled(false);
    } finally {
      setLoading(false);
    }
    // ✅ Ajout de token dans les dépendances du callback
  }, [user?.email, token]);

  useEffect(() => {
    if (user?.email && token) {
      fetchQuota();
    }
  }, [user?.email, token, fetchQuota]);

  // Expose la fonction de rafraîchissement au besoin
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).refreshQuota = fetchQuota;
    }
    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).refreshQuota;
      }
    };
  }, [fetchQuota]);

  if (!systemEnabled) return null;

  if (loading || !quota) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800/50 animate-pulse">
        <div className="w-20 h-4 bg-gray-700 rounded"></div>
      </div>
    );
  }

  // --- RENDU UI (Premium ou Standard) ---
  if (quota.is_premium) {
    return (
      <div className="flex items-center gap-2">
        <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 px-3 py-1.5">
          <Sparkles className="w-3 h-3 mr-1.5" />
          {quota.subscription_type.toUpperCase()}
        </Badge>
        <div className="text-sm text-gray-400">∞ générations</div>
      </div>
    );
  }

  const remaining = quota.remaining as number;
  const percentUsed = (quota.used / quota.limit) * 100;
  const isLow = remaining <= 2;
  const isEmpty = remaining === 0;

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800/50 border border-gray-700 shadow-sm">
        <div className="flex flex-col items-end">
          <div className={`text-sm font-bold ${isEmpty ? 'text-red-400' : isLow ? 'text-yellow-400' : 'text-green-400'}`}>
            {remaining}/{quota.limit}
          </div>
          <div className="text-[10px] uppercase tracking-wider text-gray-500">Crédits</div>
        </div>
        
        <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ${
              isEmpty ? 'bg-red-500' : isLow ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${(remaining / quota.limit) * 100}%` }}
          />
        </div>
      </div>

      {(isEmpty || isLow) && (
        <Button
          onClick={onUpgradeClick}
          size="sm"
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 h-8 gap-1.5"
        >
          <CreditCard className="w-3.5 h-3.5" />
          {isEmpty ? 'Premium' : 'Upgrade'}
        </Button>
      )}
    </div>
  );
}
