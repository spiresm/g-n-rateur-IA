import React, { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { LoginPage } from './components/LoginPage'; // Vérifie bien le chemin de ton fichier LoginPage

export default function App() {
  const { isAuthenticated, isLoading, user, signOut } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [format, setFormat] = useState('1024x1024');
  const [isGenerating, setIsGenerating] = useState(false);

  // 1. Gestion du chargement initial
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // 2. Si l'utilisateur n'est pas connecté, on affiche la page de Login
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // 3. Si l'utilisateur est connecté, on affiche l'interface de génération
  const handleGenerate = async () => {
    if (!prompt) return alert("Saisissez un prompt !");
    setIsGenerating(true);
    const [width, height] = format.split('x');
    
    const formData = new FormData();
    formData.append('user_menu_prompt', prompt);
    formData.append('width', width);
    formData.append('height', height);
    formData.append('workflow_name', 'affiche.json');

    try {
      const response = await fetch('https://g-n-rateur-backend-1.onrender.com/generate', {
        method: 'POST',
        body: formData,
        credentials: 'include' 
      });
      const data = await response.json();
      console.log("Génération lancée:", data);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 text-white">
      {/* Header / Navbar */}
      <nav className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center font-bold text-black">R</div>
            <span className="font-bold text-xl tracking-tighter">RUBENS<span className="text-yellow-500">AI</span></span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400 hidden sm:block">{user?.email}</span>
            <button 
              onClick={signOut}
              className="px-4 py-2 text-sm bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto p-6 pt-12 space-y-10">
        {/* Section Prompt */}
        <div className="space-y-4">
          <label className="text-xl font-semibold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            1. Décrivez votre image
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Un astronaute montant un cheval sur Mars, style cinématographique..."
            className="w-full h-40 bg-gray-800/50 border border-gray-700 rounded-2xl p-5 text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all placeholder:text-gray-600 shadow-inner"
          />
        </div>

        {/* Section Formats */}
        <div className="space-y-4">
          <label className="text-xl font-semibold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            2. Choisissez le format
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { id: '1024x1024', label: 'Carré (1:1)', icon: '⬜' },
              { id: '832x1216', label: 'Portrait (2:3)', icon: '📱' },
              { id: '1216x832', label: 'Paysage (3:2)', icon: '🖼️' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFormat(f.id)}
                className={`p-5 rounded-2xl border-2 transition-all flex items-center justify-between sm:flex-col sm:justify-center gap-3 ${
                  format === f.id 
                  ? 'bg-yellow-500/10 border-yellow-500 text-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.1)]' 
                  : 'bg-gray-800/30 border-gray-800 text-gray-500 hover:border-gray-700'
                }`}
              >
                <span className="text-3xl">{f.icon}</span>
                <span className="font-bold text-sm uppercase tracking-wider">{f.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Bouton de Génération */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full py-6 bg-yellow-500 hover:bg-yellow-400 disabled:bg-gray-800 disabled:text-gray-600 text-black font-black text-2xl rounded-2xl transition-all active:scale-[0.98] shadow-2xl shadow-yellow-500/20 uppercase tracking-[0.2em] flex items-center justify-center gap-4 group"
        >
          {isGenerating ? (
            <>
              <div className="w-7 h-7 border-4 border-black border-t-transparent rounded-full animate-spin" />
              <span>Création en cours...</span>
            </>
          ) : (
            <>
              <span className="group-hover:scale-125 transition-transform">🚀</span>
              Générer l'image
            </>
          )}
        </button>
      </main>
    </div>
  );
}
