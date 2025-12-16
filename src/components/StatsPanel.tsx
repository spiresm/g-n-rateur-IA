import { BarChart3, ImagePlus, Coins } from 'lucide-react';

interface StatsPanelProps {
  totalImages: number;
  creditsUsed: number;
  creditsRemaining: number;
}

export function StatsPanel({ totalImages, creditsUsed, creditsRemaining }: StatsPanelProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 mt-6">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-purple-600" />
        <h3 className="text-gray-900">Statistiques</h3>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2">
            <ImagePlus className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-gray-700">Images créées</span>
          </div>
          <span className="text-blue-600">{totalImages}</span>
        </div>

        <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-orange-600" />
            <span className="text-sm text-gray-700">Crédits utilisés</span>
          </div>
          <span className="text-orange-600">{creditsUsed}</span>
        </div>

        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-green-600" />
            <span className="text-sm text-gray-700">Crédits restants</span>
          </div>
          <span className="text-green-600">{creditsRemaining}</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2 px-4 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all">
          Acheter des crédits
        </button>
      </div>
    </div>
  );
}
