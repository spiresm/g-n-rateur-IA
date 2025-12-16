/**
 * Composant de test minimal pour diagnostiquer les problèmes de chargement
 */

export function TestMinimal() {
  console.log('[TEST_MINIMAL] Composant rendu !');
  
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-lg border border-gray-700">
        <h1 className="text-white text-2xl mb-4">✅ Application Chargée !</h1>
        <p className="text-gray-400 mb-4">
          Si vous voyez ce message, l'application fonctionne.
        </p>
        <div className="bg-green-600 text-white px-4 py-2 rounded">
          Le problème vient d'un composant spécifique
        </div>
      </div>
    </div>
  );
}
