import { memo } from 'react';
import { LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Header = memo(function Header() {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-6 z-50">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm">R</span>
          </div>
          <span className="text-xl text-white">Rubens</span>
        </div>
        <div className="border-l border-gray-600 pl-3 ml-1">
          <p className="text-xs text-gray-400">Générateur de contenu IA</p>
        </div>
      </div>

      {isAuthenticated && user && (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            {user.picture && (
              <img 
                src={user.picture} 
                alt={user.name || 'User'}
                className="w-8 h-8 rounded-full border-2 border-gray-600"
              />
            )}
            <span className="text-sm text-gray-300">{user.given_name || user.name || 'Utilisateur'}</span>
          </div>
          
          <button
            onClick={logout}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            title="Se déconnecter"
          >
            <LogOut className="w-4 h-4" />
            <span>Déconnexion</span>
          </button>
        </div>
      )}
    </header>
  );
});
