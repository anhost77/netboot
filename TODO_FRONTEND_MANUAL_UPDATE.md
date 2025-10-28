# 📋 TODO - Interface de Mise à Jour Manuelle des Paris

## 🎯 Objectif

Créer l'interface frontend permettant aux utilisateurs de mettre à jour manuellement les résultats de leurs paris sur plateformes non-PMU (Betclic, Unibet, etc.).

---

## ✅ Déjà Fait

- ✅ Backend endpoint : `PATCH /bets/:id/result`
- ✅ Backend service : `betsService.updateBetResult()`
- ✅ Notifications email + push
- ✅ Badges "Auto" / "Manuel" sur les plateformes

---

## 📝 À Implémenter

### 1. Créer le Composant Modal de Mise à Jour

**Fichier :** `/frontend/components/bets/update-bet-result-modal.tsx`

```tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface UpdateBetResultModalProps {
  bet: {
    id: string;
    hippodrome?: string;
    raceNumber?: string;
    horsesSelected?: string;
    stake: number;
    odds?: number;
    platform?: string;
  };
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  status: 'won' | 'lost' | 'refunded';
  finalOdds?: number;
  payout?: number;
}

export default function UpdateBetResultModal({ bet, onClose, onSuccess }: UpdateBetResultModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      status: 'won',
      finalOdds: bet.odds || undefined,
    },
  });

  const status = watch('status');
  const finalOdds = watch('finalOdds');
  const stake = bet.stake;

  // Calculer le payout estimé
  const estimatedPayout = status === 'won' && finalOdds ? stake * finalOdds : 0;

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bets/${bet.id}/result`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          status: data.status,
          finalOdds: data.finalOdds ? Number(data.finalOdds) : undefined,
          payout: data.payout ? Number(data.payout) : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour');
      }

      toast.success('Pari mis à jour avec succès !');
      onSuccess();
    } catch (error) {
      console.error('Failed to update bet:', error);
      toast.error('Erreur lors de la mise à jour du pari');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Mettre à jour le résultat
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Bet Info */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Plateforme:</span>
              <span className="font-medium">{bet.platform || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Hippodrome:</span>
              <span className="font-medium">{bet.hippodrome || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Course:</span>
              <span className="font-medium">{bet.raceNumber || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Chevaux:</span>
              <span className="font-medium">{bet.horsesSelected || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Mise:</span>
              <span className="font-medium">{bet.stake}€</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Cote saisie:</span>
              <span className="font-medium">{bet.odds || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Résultat */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Résultat du pari *
            </label>
            <div className="grid grid-cols-3 gap-2">
              <label className={`
                flex items-center justify-center px-4 py-3 border-2 rounded-lg cursor-pointer transition-all
                ${status === 'won' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-300 hover:border-gray-400'}
              `}>
                <input
                  type="radio"
                  value="won"
                  {...register('status')}
                  className="sr-only"
                />
                <span className="font-medium">✅ Gagné</span>
              </label>
              
              <label className={`
                flex items-center justify-center px-4 py-3 border-2 rounded-lg cursor-pointer transition-all
                ${status === 'lost' ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-300 hover:border-gray-400'}
              `}>
                <input
                  type="radio"
                  value="lost"
                  {...register('status')}
                  className="sr-only"
                />
                <span className="font-medium">❌ Perdu</span>
              </label>
              
              <label className={`
                flex items-center justify-center px-4 py-3 border-2 rounded-lg cursor-pointer transition-all
                ${status === 'refunded' ? 'border-gray-500 bg-gray-50 text-gray-700' : 'border-gray-300 hover:border-gray-400'}
              `}>
                <input
                  type="radio"
                  value="refunded"
                  {...register('status')}
                  className="sr-only"
                />
                <span className="font-medium">⚪ Remboursé</span>
              </label>
            </div>
          </div>

          {/* Cote finale (si gagné) */}
          {status === 'won' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cote finale réelle
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register('finalOdds', {
                    min: { value: 1, message: 'La cote doit être >= 1' },
                  })}
                  placeholder="Ex: 3.50"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                {errors.finalOdds && (
                  <p className="mt-1 text-sm text-red-600">{errors.finalOdds.message}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Cote affichée par {bet.platform} au moment du résultat
                </p>
              </div>

              {/* Payout estimé */}
              {finalOdds && (
                <div className="bg-green-50 border border-green-200 rounded-md p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-green-700">Gain estimé:</span>
                    <span className="text-lg font-bold text-green-700">
                      {estimatedPayout.toFixed(2)}€
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-green-600">Profit:</span>
                    <span className="text-sm font-medium text-green-600">
                      +{(estimatedPayout - stake).toFixed(2)}€
                    </span>
                  </div>
                </div>
              )}

              {/* Payout manuel (optionnel) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ou saisir le gain exact (optionnel)
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register('payout', {
                    min: { value: 0, message: 'Le gain doit être >= 0' },
                  })}
                  placeholder="Ex: 35.00"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                {errors.payout && (
                  <p className="mt-1 text-sm text-red-600">{errors.payout.message}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Si différent du calcul automatique (mise × cote)
                </p>
              </div>
            </>
          )}

          {/* Résumé perdu */}
          {status === 'lost' && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-red-700">Perte:</span>
                <span className="text-lg font-bold text-red-700">
                  -{stake.toFixed(2)}€
                </span>
              </div>
            </div>
          )}

          {/* Résumé remboursé */}
          {status === 'refunded' && (
            <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Remboursement:</span>
                <span className="text-lg font-bold text-gray-700">
                  {stake.toFixed(2)}€
                </span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Enregistrement...' : 'Valider le résultat'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

---

### 2. Ajouter un Badge sur la Page des Paris

**Fichier :** `/frontend/app/dashboard/bets/page.tsx`

Ajouter un badge "⏰ À mettre à jour" pour les paris avec `requiresManualUpdate = true` :

```tsx
{bet.requiresManualUpdate && (
  <span className="inline-flex items-center px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded-full font-medium">
    <Clock className="h-3 w-3 mr-1" />
    À mettre à jour
  </span>
)}
```

Ajouter un bouton "Mettre à jour" :

```tsx
{bet.status === 'pending' && bet.requiresManualUpdate && (
  <button
    onClick={() => handleUpdateBetResult(bet)}
    className="text-orange-600 hover:text-orange-700 font-medium text-sm"
  >
    Mettre à jour le résultat
  </button>
)}
```

---

### 3. Ajouter une Section "Paris à Mettre à Jour"

**Option A : Sur le Dashboard**

Ajouter une carte sur `/dashboard` :

```tsx
<div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
  <div className="flex items-center justify-between mb-3">
    <h3 className="font-semibold text-orange-900">
      Paris à mettre à jour
    </h3>
    <span className="bg-orange-200 text-orange-900 px-2 py-1 rounded-full text-sm font-bold">
      {pendingManualBets.length}
    </span>
  </div>
  
  {pendingManualBets.length > 0 ? (
    <div className="space-y-2">
      {pendingManualBets.map(bet => (
        <div key={bet.id} className="flex items-center justify-between bg-white p-3 rounded">
          <div>
            <p className="font-medium">{bet.platform} - {bet.hippodrome}</p>
            <p className="text-sm text-gray-600">Mise: {bet.stake}€</p>
          </div>
          <button
            onClick={() => handleUpdateBetResult(bet)}
            className="px-3 py-1 bg-orange-600 text-white rounded hover:bg-orange-700"
          >
            Mettre à jour
          </button>
        </div>
      ))}
    </div>
  ) : (
    <p className="text-sm text-gray-600">Aucun pari en attente</p>
  )}
</div>
```

**Option B : Page dédiée**

Créer `/dashboard/bets/pending` pour lister tous les paris en attente de mise à jour.

---

### 4. Notifications

**Badge sur l'icône de notification :**

```tsx
<button className="relative">
  <Bell className="h-6 w-6" />
  {pendingManualBetsCount > 0 && (
    <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
      {pendingManualBetsCount}
    </span>
  )}
</button>
```

---

## 🎯 Priorités

1. **Haute** : Modal de mise à jour (`update-bet-result-modal.tsx`)
2. **Haute** : Bouton "Mettre à jour" sur la liste des paris
3. **Moyenne** : Badge "À mettre à jour" sur les paris
4. **Moyenne** : Section "Paris à mettre à jour" sur le dashboard
5. **Basse** : Badge notification avec compteur

---

## 🧪 Tests à Faire

1. Créer bankroll Betclic (type OTHER)
2. Créer pari en attente sur Betclic
3. Vérifier que `requiresManualUpdate = true`
4. Attendre 1h (ou modifier en DB pour tester)
5. Vérifier réception email + notification
6. Cliquer "Mettre à jour"
7. Remplir formulaire : Gagné + Cote 3.5
8. Vérifier mise à jour du pari
9. Vérifier mise à jour de la bankroll
10. Vérifier notification de succès

---

## 📝 Notes

- Le backend est **100% prêt**
- L'endpoint fonctionne et est testé
- Il ne reste que l'interface utilisateur à créer
- Estimation : **2-3 heures de développement**

---

**Prêt à implémenter ! 🚀**
