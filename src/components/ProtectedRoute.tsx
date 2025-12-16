import { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LoginPage } from './LoginPage';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  console.log('[PROTECTED_ROUTE] 🔐 isLoading:', isLoading, '| isAuthenticated:', isAuthenticated);

  // Afficher un loader pendant la vérification du token
  if (isLoading) {
    console.log('[PROTECTED_ROUTE] ⏳ Affichage du loader...');
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('[PROTECTED_ROUTE] 🚫 Non authentifié - Affichage de LoginPage');
    return <LoginPage />;
  }

  console.log('[PROTECTED_ROUTE] ✅ Authentifié - Affichage de AppContent');
  return <>{children}</>;
}
