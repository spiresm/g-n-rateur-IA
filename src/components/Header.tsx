import { memo, useState } from 'react';
import { LogOut, Sparkles, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { QuotaDisplay } from './QuotaDisplay';
import { PaymentModal } from './PaymentModal';

export const Header = memo(function Header() {
  const { user, logout, isAuthenticated } = useAuth();
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // ✅ Correction Photo Google : Supabase utilise user_metadata
  const avatarUrl = user?.user_metadata?.avatar_url || user?.photoURL;
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Artiste';

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-24 sm:h-32 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4 sm:px-8 z-50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-600 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white text-2xl sm:text-3xl font-bold">R</span>
          </div>
          <div className="hidden xs:flex flex-col">
            <h1 className="text-xl sm:text-3xl font-black text-white tracking-tighter uppercase">
              Rubens <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">AI</span>
            </h1>
            <p className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">Générateur de Contenu</p>
          </div>
        </div>

        {isAuthenticated && user && (
          <div className="flex items-center gap-3 sm:gap-6 ml-auto">
            <QuotaDisplay onUpgradeClick={() => setShowPaymentModal(true)} />

            {/* Profil et Photo Google */}
            <div className="flex items-center gap-3 pl-4 border-l border-gray-800">
              <div className="hidden lg:flex flex-col items-end">
                <span className="text-[9px] text-gray-500 uppercase font-black">Compte</span>
                <span className="text-xs text-gray-200 font-medium truncate max-w-[150px]">{userName}</span>
              </div>
              
              <div className="relative">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-800 border-2 border-purple-500/30 flex items-center justify-center overflow-hidden">
                  {avatarUrl ? (
                    <img 
                      src={avatarUrl} 
                      alt="Profil" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer" // ⚠️ INDISPENSABLE POUR GOOGLE
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-purple-900/20">
                       <User className="w-5 h-5 text-purple-400" />
                    </div>
                  )}
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-gray-900 rounded-full"></div>
              </div>
            </div>

            <button onClick={logout} className="p-2 text-gray-500 hover:text-red-400 transition-colors">
              <LogOut className="w-5 h-5 sm:w-6" />
            </button>
          </div>
        )}
      </header>
      <PaymentModal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)} />
    </>
  );
});
