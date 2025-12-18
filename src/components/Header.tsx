import { memo, useState } from 'react';
import { LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { QuotaDisplay } from './QuotaDisplay';
import { PaymentModal } from './PaymentModal';

export const Header = memo(function Header() {
  const { user, logout, isAuthenticated } = useAuth();
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-24 sm:h-32 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-3 sm:px-6 z-40">
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-600 to-pink-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white text-xl sm:text-3xl font-bold">R</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-baseline gap-2">
                <span className="text-lg sm:text-3xl text-white font-bold tracking-tight">RUBENS</span>
                <span className="text-md sm:text-2xl bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-semibold">
                  AI
                </span>
              </div>
              <p className="hidden sm:block text-[10px] text-gray-400">Générateur de contenu IA</p>
            </div>
          </div>
        </div>

        {isAuthenticated && user && (
          <div className="flex items-center gap-2 sm:gap-4 ml-auto">
            <QuotaDisplay onUpgradeClick={() => setShowPaymentModal(true)} />

            <button
              onClick={() => setShowPaymentModal(true)}
              className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg shadow"
            >
              <Sparkles className="w-5 h-5" />
              <span className="hidden md:inline">Premium</span>
            </button>

            <button
              onClick={logout}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg"
              title="Se déconnecter"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        )}
      </header>

      <PaymentModal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)} />
    </>
  );
});
