import { memo, useState } from 'react';
import { LogOut, Sparkles, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { QuotaDisplay } from './QuotaDisplay';
import { PaymentModal } from './PaymentModal';

export const Header = memo(function Header() {
  const { user, logout, isAuthenticated } = useAuth();
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-24 sm:h-32 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-3 sm:px-6 z-40 shadow-2xl">
        {/* Section Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-600 to-pink-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white text-xl sm:text-3xl font-bold">R</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1 sm:gap-2">
              <span className="text-lg sm:text-3xl text-white font-bold tracking-tight">RUBENS</span>
              <span className="text-md sm:text-2xl bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-semibold">AI</span>
            </div>
            <p className="hidden sm:block text-[10px] text-gray-400 uppercase font-bold tracking-widest">Générateur de contenu IA</p>
          </div>
        </div>

        {isAuthenticated && user && (
          <div className="flex items-center gap-3 sm:gap-6 ml-auto">
            {/* Affichage Quota 10/10 */}
            <QuotaDisplay onUpgradeClick={() => setShowPaymentModal(true)} />

            {/* Bouton Premium */}
            <button
              onClick={() => setShowPaymentModal(true)}
              className="hidden xs:flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg shadow-lg hover:scale-105 transition-transform"
            >
              <Sparkles className="w-4 h-4" />
              <span className="hidden md:inline font-bold text-xs uppercase">Premium</span>
            </button>

            {/* Bloc Utilisateur & Avatar */}
            <div className="flex items-center gap-3 pl-3 border-l border-gray-700">
              <div className="hidden lg:flex flex-col items-end">
                <span className="text-[9px] text-gray-500 uppercase font-black">Utilisateur</span>
                <span className="text-xs text-gray-300 font-medium max-w-[150px] truncate">{user.email}</span>
              </div>
              
              <div className="relative">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-700 border-2 border-purple-500/30 flex items-center justify-center overflow-hidden">
                  {user.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt="Profil" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      onError={(e) => { (e.target as HTMLImageElement).src = ""; }} 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-purple-900/20 text-purple-400 font-bold text-lg">
                      {user.email?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-gray-800 rounded-full"></span>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={logout}
              className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
              title="Déconnexion"
            >
              <LogOut className="w-5 h-5 sm:w-6" />
            </button>
          </div>
        )}
      </header>

      <PaymentModal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)} />
    </>
  );
});
