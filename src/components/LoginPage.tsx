```typescript
// Configuration conforme à la Bible du projet
const BACKEND_URL = "https://g-n-rateur-backend-1.onrender.com";

export function LoginPage() {
  const handleGoogleLogin = () => {
    // Nettoyer tout avant de rediriger
    localStorage.clear();
    
    // Redirection vers le backend pour l'authentification Google
    // Le backend redirigera vers Google OAuth, puis retournera avec ?token=<JWT>
    window.location.href = `${BACKEND_URL}/auth/google`;
  };

  const handleDemoMode = () => {
    // Nettoyer tout avant mode démo
    localStorage.clear();
    
    // Mode démo pour tester l'interface sans backend
    // Crée un token simplifié avec expiration longue
    const demoPayload = {
      name: "Utilisateur Démo",
      given_name: "Démo",
      picture: "https://api.dicebear.com/7.x/avataaars/svg?seed=demo",
      email: "demo@rubens.ai",
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 30) // 30 jours
    };

    // Créer un token JWT simple (format: header.payload.signature)
    const header = btoa(JSON.stringify({ alg: "none", typ: "JWT" }));
    const payload = btoa(JSON.stringify(demoPayload));
    const fakeToken = `${header}.${payload}.demo-signature`;

    console.log('[DEMO] Token créé:', fakeToken);
    localStorage.setItem("google_id_token", fakeToken);
    
    // Recharger la page pour activer le mode démo
    window.location.href = window.location.pathname;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-700">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
              <span className="text-white text-3xl">R</span>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-white text-2xl mb-2">Bienvenue sur Rubens</h1>
            <p className="text-gray-400 text-sm">
              Générateur de contenu IA powered by ComfyUI
            </p>
          </div>

          {/* Google Login Button */}
          <button
            onClick={handleGoogleLogin}
            className="w-full bg-white hover:bg-gray-100 text-gray-900 py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-3 mb-3"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M19.6 10.227c0-.709-.064-1.39-.182-2.045H10v3.868h5.382a4.6 4.6 0 01-1.996 3.018v2.51h3.232c1.891-1.742 2.982-4.305 2.982-7.35z" fill="#4285F4"/>
              <path d="M10 20c2.7 0 4.964-.895 6.618-2.423l-3.232-2.509c-.895.6-2.04.955-3.386.955-2.605 0-4.81-1.76-5.595-4.123H1.064v2.59A9.996 9.996 0 0010 20z" fill="#34A853"/>
              <path d="M4.405 11.9c-.2-.6-.314-1.24-.314-1.9 0-.66.114-1.3.314-1.9V5.51H1.064A9.996 9.996 0 000 10c0 1.614.386 3.14 1.064 4.49l3.34-2.59z" fill="#FBBC05"/>
              <path d="M10 3.977c1.468 0 2.786.505 3.823 1.496l2.868-2.868C14.959.99 12.695 0 10 0 6.09 0 2.71 2.24 1.064 5.51l3.34 2.59C5.19 5.736 7.395 3.977 10 3.977z" fill="#EA4335"/>
            </svg>
            <span>Se connecter avec Google</span>
          </button>

          {/* Demo Mode Button */}
          <button
            onClick={handleDemoMode}
            className="w-full bg-gray-700 hover:bg-gray-600 text-gray-300 py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-3 mb-4"
          >
            <span>🎨 Mode Démo (test interface)</span>
          </button>

          {/* Info */}
          <p className="text-xs text-gray-500 text-center">
            En vous connectant, vous acceptez nos conditions d'utilisation
          </p>
        </div>

        {/* Footer note */}
        <p className="text-center text-gray-600 text-xs mt-6">
          ⚠️ Cette application utilise Google OAuth 2.0 pour l'authentification
        </p>
      </div>
    </div>
  );
}
```

---
