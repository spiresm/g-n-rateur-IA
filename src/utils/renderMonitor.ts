/**
 * Utilitaire pour monitorer les re-renders et détecter les boucles infinies
 */

interface RenderLog {
  component: string;
  timestamp: number;
  count: number;
}

class RenderMonitor {
  private renders: Map<string, RenderLog> = new Map();
  private readonly WARNING_THRESHOLD = 10; // Nombre de renders en 1 seconde avant warning
  private readonly CHECK_INTERVAL = 1000; // 1 seconde

  /**
   * Enregistre un render de composant
   */
  logRender(componentName: string) {
    const now = Date.now();
    const existing = this.renders.get(componentName);

    if (existing && (now - existing.timestamp) < this.CHECK_INTERVAL) {
      // Dans la même seconde, incrémenter le compteur
      existing.count++;

      if (existing.count >= this.WARNING_THRESHOLD) {
        console.warn(
          `🔴 WARNING: ${componentName} s'est re-rendu ${existing.count} fois en 1 seconde !`,
          '\n  → Possible boucle de re-render infinie',
          '\n  → Vérifiez les useEffect et dépendances'
        );
      }
    } else {
      // Nouveau cycle de 1 seconde
      this.renders.set(componentName, {
        component: componentName,
        timestamp: now,
        count: 1,
      });
    }
  }

  /**
   * Affiche les statistiques de rendu
   */
  getStats() {
    const stats: { [key: string]: number } = {};
    this.renders.forEach((log) => {
      stats[log.component] = log.count;
    });
    return stats;
  }

  /**
   * Réinitialise les compteurs
   */
  reset() {
    this.renders.clear();
    console.log('✅ Statistiques de render réinitialisées');
  }

  /**
   * Affiche un rapport de performance
   */
  report() {
    console.group('📊 Rapport de Performance React');
    console.log('Renders par composant (dernière seconde):');
    
    const stats = this.getStats();
    Object.entries(stats)
      .sort(([, a], [, b]) => b - a)
      .forEach(([component, count]) => {
        const icon = count >= this.WARNING_THRESHOLD ? '🔴' : count >= 5 ? '🟡' : '🟢';
        console.log(`  ${icon} ${component}: ${count} renders`);
      });
    
    console.groupEnd();
  }
}

// Instance singleton
export const renderMonitor = new RenderMonitor();

// Hook personnalisé pour monitorer les re-renders
export function useRenderMonitor(componentName: string) {
  if (process.env.NODE_ENV === 'development') {
    renderMonitor.logRender(componentName);
  }
}

// Exposer dans window pour debug
if (typeof window !== 'undefined') {
  (window as any).renderMonitor = {
    report: () => renderMonitor.report(),
    reset: () => renderMonitor.reset(),
    stats: () => renderMonitor.getStats(),
  };

  console.log(
    '%c🔍 Render Monitor Actif',
    'font-size: 12px; color: #10b981; background: #064e3b; padding: 4px 8px; border-radius: 4px;'
  );
  console.log('Commandes disponibles:');
  console.log('  renderMonitor.report() - Afficher le rapport');
  console.log('  renderMonitor.stats()  - Voir les statistiques');
  console.log('  renderMonitor.reset()  - Réinitialiser');
}
