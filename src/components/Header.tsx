import { memo, useState } from 'react';
import { LogOut, CreditCard, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { QuotaDisplay } from './QuotaDisplay';
import { PaymentModal } from './PaymentModal';

export const Header = memo(function Header() {
  const { user, logout, isAuthenticated } = useAuth();
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // ✅ Supabase stocke souvent l'image dans photoURL ou user_metadata
  const avatarUrl = user?.photoURL || user?.user_metadata?.avatar_url || user?.picture;
  const userName = user?.user_metadata?.full_name || user?.given_name || user?.name || 'Utilisateur';

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-24 sm:h-32 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-3 sm:px-6 z-50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
              <span className="text-white text-2xl sm:text-3xl font-bold">R</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-baseline gap-2">
                <span className="text-xl sm:text-3xl text-white tracking-tight font-bold">RUBENS</span>
                <span className="text-lg sm:text-2xl bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-semibold">AI</span>
              </div>
              <p className="hidden sm:block text-[10px] text-gray-400 uppercase font-bold tracking-widest">Générateur de contenu IA</p>
            </div>
          </div>
        </div>

        {isAuthenticated && user && (
          <div className="flex items-center gap-2 sm:gap-6 ml-auto">
            {/* Affichage du Quota (10/10) */}
            <QuotaDisplay onUpgradeClick={() => setShowPaymentModal(true)} />
            
            {/* Bouton Premium */}
            <button
              onClick={() => setShowPaymentModal(true)}
              className="hidden xs:flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-all shadow-lg shadow-purple-500/30"
              title="Voir les plans premium"
            >
              <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden md:inline font-bold text-xs uppercase">Premium</span>
            </button>
            
            {/* Bloc Profil avec Photo Google corrigé */}
            <div className="flex items-center gap-3 pl-3 border-l border-gray-700">
              <div className="hidden lg:flex flex-col items-end">
                <span className="text-[9px] text-gray-500 uppercase font-black tracking-tighter">Connecté en tant que</span>
                <span className="text-xs text-gray-300 font-medium max-w-[150px] truncate">{userName}</span>
              </div>

              <div className="relative group">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-700 border-2 border-purple-500/40 flex items-center justify-center overflow-hidden shadow-lg transition-transform group-hover:scale-105">
                  {avatarUrl ? (
                    <img 
                      src={avatarUrl} 
                      alt="Profil"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer" // ⚠️ CRUCIAL : Autorise l'image Google
                      onError={(e) => {
                        // Si l'image bug, on affiche l'initiale
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <User className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
                  )}
                </div>
                {/* Indicateur Statut En Ligne */}
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-gray-800 rounded-full"></span>
              </div>
            </div>
            
            <button
              onClick={logout}
              className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
              title="Se déconnecter"
            >
              <LogOut className="w-5 h-5 sm:w-6" />
            </button>
          </div>
        )}
      </header>

      <PaymentModal 
        isOpen={showPaymentModal} 
        onClose={() => setShowPaymentModal(false)} 
      />
    </>
  );
});
