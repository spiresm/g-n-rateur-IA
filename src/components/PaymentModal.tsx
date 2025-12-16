import { useState } from 'react';
import { X, Check, Sparkles, Zap, Crown } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { useAuth } from '../contexts/AuthContext';
import { projectId } from '../utils/supabase/info';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    price: '9.99',
    currency: '€',
    images: 100,
    period: 'mois',
    icon: Zap,
    color: 'from-blue-500 to-cyan-500',
    features: [
      '100 générations/mois',
      'Tous les workflows',
      'Historique des générations',
      'Support email'
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '29.99',
    currency: '€',
    images: -1,
    period: 'mois',
    icon: Crown,
    color: 'from-purple-500 to-pink-500',
    popular: true,
    features: [
      'Générations illimitées',
      'Tous les workflows',
      'Priorité de génération',
      'Historique illimité',
      'Support prioritaire',
      'Accès anticipé aux nouvelles fonctionnalités'
    ]
  }
];

export function PaymentModal({ isOpen, onClose }: PaymentModalProps) {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleUpgrade = async (planId: string) => {
    if (!user?.email) {
      setError('Vous devez être connecté pour upgrader');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSelectedPlan(planId);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-52811d4b/payment/create`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: user.email,
            plan: planId
          })
        }
      );

      if (!response.ok) {
        throw new Error('Échec de la création du paiement');
      }

      const data = await response.json();
      
      if (data.approval_url) {
        window.location.href = data.approval_url;
      } else {
        alert(`🔧 Intégration PayPal en cours\n\nPlan: ${planId}\nPrix: ${plans.find(p => p.id === planId)?.price}€\n\n${data.note || ''}`);
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
      setSelectedPlan(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <Card className="bg-gray-900 border-gray-800 p-8">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Passez à la vitesse supérieure
              </h2>
              <p className="text-gray-400 mt-2">
                Débloquez tout le potentiel de RUBENS AI
              </p>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400">
              {error}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {plans.map((plan) => {
              const Icon = plan.icon;
              const isSelected = selectedPlan === plan.id;
              
              return (
                <Card
                  key={plan.id}
                  className={`relative p-6 border-2 transition-all ${
                    plan.popular
                      ? 'border-purple-500 bg-gray-800/50'
                      : 'border-gray-700 bg-gray-800/30 hover:border-gray-600'
                  }`}
                >
                  {plan.popular && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Le plus populaire
                    </Badge>
                  )}

                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${plan.color}`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-white">{plan.price}</span>
                        <span className="text-gray-400">{plan.currency}/{plan.period}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6 p-3 rounded-lg bg-gray-700/30">
                    <div className="text-sm text-gray-400">Générations mensuelles</div>
                    <div className="text-2xl font-bold text-white">
                      {plan.images === -1 ? '∞ Illimité' : `${plan.images} images`}
                    </div>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={loading}
                    className={`w-full bg-gradient-to-r ${plan.color} hover:opacity-90 text-white border-0 font-semibold py-6`}
                  >
                    {loading && isSelected ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Traitement...
                      </>
                    ) : (
                      `Choisir ${plan.name}`
                    )}
                  </Button>
                </Card>
              );
            })}
          </div>

          <div className="mt-8 p-4 bg-gray-800/30 rounded-lg border border-gray-700">
            <p className="text-sm text-gray-400 text-center">
              💳 Paiement sécurisé via PayPal • Annulation à tout moment
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
