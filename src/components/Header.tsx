import { memo } from "react";
import { LogOut, User } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { QuotaDisplay } from "./QuotaDisplay";

export const Header = memo(function Header() {
  const { user, logout, isAuthenticated } = useAuth();

  // Avatar Google / Supabase
  const avatarUrl =
    user?.user_metadata?.avatar_url ||
    user?.photoURL ||
    null;

  const userName =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Artiste";

  // ✅ Callback PREMIUM (réelle, pas vide)
  const handleUpgradeClick = () => {
    // Event global simple (tu peux brancher une modale Stripe dessus)
    window.dispatchEvent(new Event("open-upgrade-modal"));
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-32 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6 z-50">
      {/* LOGO */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
          <span className="text-white text-3xl font-bold">R</span>
        </div>
        <div className="flex flex-col">
          <h1 className="text-3xl text-white font-bold tracking-tight">
            RUBENS <span className="text-purple-500">AI</span>
          </h1>
          <p className="text-xs text-gray-400">Générateur de contenu</p>
        </div>
      </div>

      {/* USER / QUOTA */}
      {isAuthenticated && user && (
        <div className="flex items-center gap-6">
          {/* ✅ QUOTA + PREMIUM */}
          <QuotaDisplay onUpgradeClick={handleUpgradeClick} />

          {/* USER INFO */}
          <div className="flex items-center gap-4 pl-6 border-l border-gray-700">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-gray-500 uppercase font-bold">
                Connecté
              </p>
              <p className="text-sm text-white font-medium">
                {userName}
              </p>
            </div>

            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-purple-500/30">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profil"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                  <User className="text-gray-400" />
                </div>
              )}
            </div>

            <button
              onClick={logout}
              className="p-2 text-gray-500 hover:text-red-500 transition-colors"
              title="Se déconnecter"
            >
              <LogOut className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
});
