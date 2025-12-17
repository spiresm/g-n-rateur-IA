import React, { useState } from 'react';
import { useAuth } from './contexts/AuthContext';

// Utilisation de "export default" pour corriger l'erreur Netlify
export default function App() {
  const { user, signOut } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [format, setFormat] = useState('1024x1024');
  const [isGenerating, setIsGenerating] = useState(false);

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
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header avec Logout */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-yellow-500">RUBENS AI</h1>
          <button onClick={signOut} className="text-sm text-gray-400 hover:text-white">Déconnexion</button>
        </div>

        {/* Zone de saisie du Prompt */}
        <div className="space-y-4">
          <label className="text-lg font-medium">Votre idée</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Décrivez l'image que vous voulez créer..."
            className="w-full h-32 bg-gray-800 border border-gray-700 rounded-xl p-4 text-white focus:ring-2 focus:ring-yellow-500 outline-none"
          />
        </div>

        {/* Sélection des 3 Formats (Restaurée) */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { id: '1024x1024', label: 'Carré (1:1)', icon: '⬜' },
            { id: '832x1216', label: 'Portrait (2:3)', icon: '📱' },
            { id: '1216x832', label: 'Paysage (3:2)', icon: '🖼️' }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFormat(f.id)}
              className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${
                format === f.id 
                ? 'bg-yellow-500/20 border-yellow-500 text-yellow-500' 
                : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500'
              }`}
            >
              <span className="text-2xl">{f.icon}</span>
              <span className="text-xs font-bold">{f.label}</span>
            </button>
          ))}
        </div>

        {/* Bouton Jaune Générer (Restauré) */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full py-5 bg-yellow-500 hover:bg-yellow-400 disabled:bg-gray-700 text-black font-black text-xl rounded-2xl transition-all active:scale-95 shadow-xl shadow-yellow-500/10 uppercase tracking-widest flex items-center justify-center gap-3"
        >
          {isGenerating ? (
            <>
              <div className="w-6 h-6 border-4 border-black border-t-transparent rounded-full animate-spin" />
              <span>Génération...</span>
            </>
          ) : (
            <>🚀 Générer l'image</>
          )}
        </button>
      </div>
    </div>
  );
}
