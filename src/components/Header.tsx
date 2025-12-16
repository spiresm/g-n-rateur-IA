import { memo, useState } from 'react';
import { LogOut, CreditCard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { QuotaDisplay } from './QuotaDisplay';
import { PaymentModal } from './PaymentModal';

export const Header = memo(function Header() {
  const { user, logout, isAuthenticated } = useAuth();
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-32 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-6 z-50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
              <span className="text-white text-3xl font-bold">R</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl text-white tracking-tight">RUBENS</span>
                <span className="text-2xl bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-semibold">AI</span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">Générateur de contenu IA</p>
            </div>
          </div>
        </div>

        {isAuthenticated && user && (
          <div className="flex items-center gap-4">
            {/* Quota Display - only shows if quota system is configured */}
            <QuotaDisplay onUpgradeClick={() => setShowPaymentModal(true)} />
            
            {/* PayPal / Upgrade Button - always visible */}
            <button
              onClick={() => setShowPaymentModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-all shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50"
              title="Voir les plans premium"
            >
              <CreditCard className="w-5 h-5" />
              <span className="font-medium">Premium</span>
            </button>
            
            {/* User Info with Connection Status */}
            <div className="flex items-center gap-3 px-4 py-2 bg-gray-700/50 rounded-lg border border-gray-600">
              {user.picture && (
                <img 
                  src={user.picture} 
                  alt={user.name || 'User'}
                  className="w-10 h-10 rounded-full border-2 border-gray-600"
                />
              )}
              <div className="flex flex-col">
                <span className="text-sm text-gray-300">{user.given_name || user.name || 'Utilisateur'}</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-400">Connecté</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-3 text-base text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              title="Se déconnecter"
            >
              <LogOut className="w-5 h-5" />
              <span>Déconnexion</span>
            </button>
          </div>
        )}
      </header>

      {/* Payment Modal */}
      <PaymentModal 
        isOpen={showPaymentModal} 
        onClose={() => setShowPaymentModal(false)} 
      />
    </>
  );
});
