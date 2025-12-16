import { ReactNode } from 'react';
import { useAuth } from '../src/contexts/AuthContext';
import { LoginPage } from './LoginPage';
import { useRenderMonitor } from '../utils/renderMonitor';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  useRenderMonitor('ProtectedRoute');
  
  const { isAuthenticated, isLoading } = useAuth();
  
  console.log('[PROTECTED] isLoading:', isLoading, 'isAuthenticated:', isAuthenticated);

  if (isLoading) {
    console.log('[PROTECTED] Affichage du spinner de chargement');
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('[PROTECTED] Affichage de la page de login');
    return <LoginPage />;
  }

  console.log('[PROTECTED] Utilisateur authentifié, affichage du contenu');
  return <>{children}</>;
}
