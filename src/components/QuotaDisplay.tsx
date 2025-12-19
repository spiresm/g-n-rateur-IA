import { CreditCard } from "lucide-react";
import { Button } from "./ui/button";

interface QuotaDisplayProps {
  onUpgradeClick: () => void;
}

/**
 * 🚫 QUOTA DÉSACTIVÉ POUR TOUS LES WORKFLOWS
 * - Aucun Supabase
 * - Aucun fetch
 * - Aucun token
 * - Aucun effet de bord
 */
export function QuotaDisplay({ onUpgradeClick }: QuotaDisplayProps) {
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
