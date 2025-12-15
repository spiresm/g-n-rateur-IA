import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('❌ ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    // Nettoyer le localStorage et recharger
    localStorage.clear();
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-gray-800 rounded-lg p-8 border border-red-500">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">⚠️</div>
              <h1 className="text-2xl text-white mb-2">Oups ! Une erreur s'est produite</h1>
              <p className="text-gray-400 text-sm">
                L'application a rencontré un problème inattendu.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-gray-900 rounded p-4 mb-6">
                <p className="text-red-400 text-xs font-mono break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={this.handleReset}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg transition-colors"
              >
                🔄 Réinitialiser l'application
              </button>

              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded-lg transition-colors"
              >
                Réessayer
              </button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-gray-500 text-xs">
                Si le problème persiste, ouvrez la console (F12) pour plus d'informations.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
