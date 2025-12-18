import { memo, useState } from 'react';
import { LogOut, Sparkles, User, CreditCard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { QuotaDisplay } from './QuotaDisplay';
import { PaymentModal } from './PaymentModal';

export const Header = memo(function Header() {
  const { user, logout, isAuthenticated } = useAuth();
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Correction Photo Google : on cherche dans les métadonnées Supabase
  const avatarUrl = user?.user_metadata?.avatar_url || user?.photoURL || user?.picture;
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Utilisateur';

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-24 sm:h-32 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4 sm:px-8 z-50 shadow-xl">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-600 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white text-2xl sm:text-3xl font-bold">R</span>
          </div>
          <div className="hidden xs:flex flex-col">
            <h1 className="text-xl sm:text-3xl font-black text-white tracking-tighter">
              RUBENS <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">AI</span>
            </h1>
            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Générateur Pro</p>
          </div>
        </div>

        {isAuthenticated && user && (
          <div className="flex items-center gap-3 sm:gap-6">
            {/* Composant Quota avec Token */}
            <QuotaDisplay onUpgradeClick={() => setShowPaymentModal(true)} />

            {/* Bouton Premium */}
            <button
              onClick={() => setShowPaymentModal(true)}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold text-sm hover:scale-105 transition-transform shadow-lg shadow-purple-500/20"
            >
              <Sparkles className="w-4 h-4" />
              PREMIUM
            </button>

            {/* Profil & Photo */}
            <div className="flex items-center gap-3 pl-4 border-l border-gray-800">
              <div className="hidden lg:flex flex-col items-end">
                <span className="text-[10px] text-gray-500 uppercase font-black tracking-tighter">Compte</span>
                <span className="text-xs text-gray-200 font-medium truncate max-w-[120px]">{userName}</span>
              </div>
              
              <div className="relative">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-800 border-2 border-purple-500/30 flex items-center justify-center overflow-hidden">
                  {avatarUrl ? (
                    <img 
                      src={avatarUrl} 
                      alt="Profil" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer" // ⚠️ CRUCIAL POUR GOOGLE
                      onError={(e) => { (e.currentTarget.src = ""); }}
                    />
                  ) : (
                    <User className="w-5 h-5 text-purple-400" />
                  )}
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-gray-900 rounded-full"></div>
              </div>
            </div>

            <button onClick={logout} className="p-2 text-gray-500 hover:text-red-400 transition-colors">
              <LogOut className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        )}
      </header>

      <PaymentModal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)} />
    </>
  );
});
