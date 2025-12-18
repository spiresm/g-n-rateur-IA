import { useState, useEffect, useCallback } from "react";
import { CreditCard, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useAuth } from "../contexts/AuthContext";
import { projectId } from "../utils/supabase/info";

interface QuotaInfo {
  allowed: boolean;
  remaining: number | "unlimited";
  used: number;
  limit: number;
  is_premium: boolean;
  subscription_type: string;
}

interface QuotaDisplayProps {
  onUpgradeClick: () => void;
}

export function QuotaDisplay({ onUpgradeClick }: QuotaDisplayProps) {
  const { user, token } = useAuth();

  const [quota, setQuota] = useState<QuotaInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [systemEnabled, setSystemEnabled] = useState(true);

  const fetchQuota = useCallback(async () => {
    // ⚠️ L’UI ne dépend JAMAIS du backend quota
    if (!user?.email) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-52811d4b/quota/${encodeURIComponent(
          user.email
        )}`,
        {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      if (!response.ok) {
        console.warn("⚠️ Quota API error:", response.status);
        setSystemEnabled(false);
        return;
      }

      const data = await response.json();
      setQuota(data);
      setSystemEnabled(true);
    } catch (err) {
      console.warn("⚠️ Quota system unreachable");
      setSystemEnabled(false);
    } finally {
      setLoading(false);
    }
  }, [user?.email, token]);

  useEffect(() => {
    fetchQuota();
  }, [fetchQuota]);

  // 🔄 Refresh quota global (après génération)
  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).refreshQuota = fetchQuota;
    }
    return () => {
      if (typeof window !== "undefined") {
        delete (window as any).refreshQuota;
      }
    };
  }, [fetchQuota]);

  /* =====================================================
     🔒 FALLBACK ABSOLU — SYSTEM DOWN
     ===================================================== */
  if (!systemEnabled) {
    return (
      <Button
        onClick={onUpgradeClick}
        size="sm"
        className="bg-purple-600 hover:bg-purple-700 text-white h-7 px-3 text-[10px] font-bold"
      >
        <CreditCard className="w-3 h-3 mr-1" />
        PREMIUM
      </Button>
    );
  }

  /* =====================================================
     ⏳ LOADING
     ===================================================== */
  if (loading || !quota) {
    return (
      <div className="flex flex-col items-end gap-1 px-3 animate-pulse">
        <div className="w-12 h-3 bg-gray-700 rounded"></div>
        <div className="w-20 h-1.5 bg-gray-700 rounded-full"></div>
      </div>
    );
  }

  /* =====================================================
     🌟 PREMIUM
     ===================================================== */
  if (quota.is_premium) {
    return (
      <div className="flex flex-col items-end gap-1 pr-2">
        <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 px-2 py-0.5 text-[10px]">
          <Sparkles className="w-3 h-3 mr-1" />
          {quota.subscription_type?.toUpperCase() || "PREMIUM"}
        </Badge>
        <div className="text-[10px] text-gray-400 font-medium">
          Crédits illimités
        </div>
      </div>
    );
  }

  /* =====================================================
     📊 STANDARD
     ===================================================== */
  const remaining =
    typeof quota.remaining === "number" ? quota.remaining : 0;

  const limit = quota.limit > 0 ? quota.limit : 10;
  const progressPercent =
    limit > 0 ? (remaining / limit) * 100 : 0;

  const isLow = remaining <= 2;
  const isEmpty = remaining === 0;

  return (
    <div className="flex items-center gap-3">
      <div
        onClick={onUpgradeClick}
        className="flex flex-col items-end cursor-pointer group"
      >
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[10px] text-gray-500 uppercase font-bold">
            Crédits
          </span>
          <span
            className={`text-sm font-black ${
              isEmpty
                ? "text-red-500"
                : isLow
                ? "text-yellow-500"
                : "text-white"
            }`}
          >
            {remaining} / {limit}
          </span>
        </div>

        <div className="w-20 sm:w-24 h-1.5 bg-gray-700 rounded-full overflow-hidden border border-gray-600/30">
          <div
            className={`h-full transition-all duration-700 ${
              isEmpty
                ? "bg-red-600"
                : isLow
                ? "bg-yellow-500"
                : "bg-green-500"
            }`}
            style={{ width: `${Math.min(100, progressPercent)}%` }}
          />
        </div>
      </div>

      {(isEmpty || isLow) && (
        <Button
          onClick={onUpgradeClick}
          size="sm"
          className="bg-red-600 hover:bg-red-700 text-white h-7 px-2 text-[10px] font-bold"
        >
          <CreditCard className="w-3 h-3 mr-1" />
          PREMIUM
        </Button>
      )}
    </div>
  );
}
