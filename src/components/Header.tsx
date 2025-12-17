import { memo, useState } from 'react';
import { LogOut, CreditCard, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { QuotaDisplay } from './QuotaDisplay';
import { PaymentModal } from './PaymentModal';

export const Header = memo(function Header() {
  const { user, logout, isAuthenticated } = useAuth();
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-24 sm:h-32 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-3 sm:px-6 z-50">
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Logo réduit sur mobile */}
            <div className="w-10 h-10 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
              <span className="text-white text-xl sm:text-3xl font-bold">R</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-baseline gap-1 sm:gap-2">
                <span className="text-lg sm:text-3xl text-white tracking-tight font-bold">RUBENS</span>
                <span className="text-md sm:text-2xl bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-semibold">AI</span>
              </div>
              <p className="hidden sm:block text-[10px] text-gray-400 mt-0.5">Générateur de contenu IA</p>
            </div>
          </div>
        </div>

        {isAuthenticated && user && (
          <div className="flex items-center gap-2 sm:gap-4 ml-auto overflow-hidden">
            {/* Quota Display - On garde la priorité ici */}
            <div className="shrink-0 scale-90 sm:scale-100">
              <QuotaDisplay onUpgradeClick={() => setShowPaymentModal(true)} />
            </div>
            
            {/* Bouton Premium - Texte masqué sur mobile */}
            <button
              onClick={() => setShowPaymentModal(true)}
              className="flex items-center gap-2 px-2.5 py-2 sm:px-4 sm:py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-all shadow-lg shadow-purple-500/30 shrink-0"
              title="Voir les plans premium"
            >
              <Sparkles className="w-5 h-5" />
              <span className="hidden md:inline font-medium">Premium</span>
            </button>
            
            {/* Bloc Profil - Nom masqué sur mobile (lg:flex) pour éviter le débordement */}
            <div className="flex items-center gap-2 sm:gap-3 px-2 py-1.5 sm:px-4 sm:py-2 bg-gray-700/50 rounded-lg border border-gray-600 shrink-0">
              {user.picture && (
                <div className="relative">
                  <img 
                    src={user.picture} 
                    alt={user.name || 'User'}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-gray-600 object-cover"
                  />
                  {/* Pastille de statut intégrée sur l'image pour gagner de la place */}
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-gray-800 rounded-full animate-pulse"></div>
                </div>
              )}
              {/* Le nom et "Connecté" ne s'affichent que sur les grands écrans (Desktop) */}
              <div className="hidden lg:flex flex-col">
                <span className="text-sm text-gray-300 font-bold truncate max-w-[120px]">
                  {user.given_name || user.name || 'Utilisateur'}
                </span>
                <span className="text-[10px] text-green-400">En ligne</span>
              </div>
            </div>
            
            {/* Déconnexion - Texte masqué sur petit écran (sm) */}
            <button
              onClick={logout}
              className="flex items-center gap-2 p-2 sm:px-4 sm:py-3 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors shrink-0"
              title="Se déconnecter"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline">Déconnexion</span>
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
