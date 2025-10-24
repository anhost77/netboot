'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import type { Bet, CreateBetData } from '@/lib/types';

interface BetFormProps {
  bet?: Bet | null;
  onSubmit: (data: CreateBetData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function BetForm({ bet, onSubmit, onCancel, isLoading = false }: BetFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateBetData>({
    defaultValues: bet
      ? {
          date: bet.date.split('T')[0],
          platform: bet.platform || undefined,
          hippodrome: bet.hippodrome || undefined,
          raceNumber: bet.raceNumber || undefined,
          betType: bet.betType || undefined,
          horsesSelected: bet.horsesSelected || undefined,
          winningHorse: bet.winningHorse || undefined,
          stake: bet.stake,
          odds: bet.odds || undefined,
          status: bet.status,
          payout: bet.payout || undefined,
          notes: bet.notes || undefined,
          tags: bet.tags || undefined,
        }
      : {
          date: new Date().toISOString().split('T')[0],
          status: 'pending',
        },
  });

  const watchStake = watch('stake');
  const watchOdds = watch('odds');
  const watchStatus = watch('status');
  const watchPayout = watch('payout');

  // Auto-calculate payout and profit
  useEffect(() => {
    if (watchStatus === 'won' && watchStake && watchOdds) {
      const calculatedPayout = watchStake * watchOdds;
      const calculatedProfit = calculatedPayout - watchStake;
      setValue('payout', parseFloat(calculatedPayout.toFixed(2)));
      setValue('profit', parseFloat(calculatedProfit.toFixed(2)));
    } else if (watchStatus === 'lost' && watchStake) {
      setValue('payout', 0);
      setValue('profit', -watchStake);
    } else if (watchStatus === 'refunded' && watchStake) {
      setValue('payout', watchStake);
      setValue('profit', 0);
    } else if (watchStatus === 'pending') {
      setValue('payout', undefined);
      setValue('profit', undefined);
    }
  }, [watchStake, watchOdds, watchStatus, setValue]);

  const onFormSubmit = async (data: CreateBetData) => {
    // Convert tags string to array if needed
    if (typeof data.tags === 'string') {
      data.tags = (data.tags as unknown as string)
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);
    }

    // Convert numeric fields
    data.stake = parseFloat(data.stake as any);
    if (data.odds) data.odds = parseFloat(data.odds as any);
    if (data.payout) data.payout = parseFloat(data.payout as any);

    // Remove profit - it's calculated by the backend
    delete (data as any).profit;

    await onSubmit(data);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {bet ? 'Modifier le pari' : 'Nouveau pari'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
            disabled={isLoading}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-6">
          {/* Date and Status Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                {...register('date', { required: 'La date est requise' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {errors.date && (
                <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Statut <span className="text-red-500">*</span>
              </label>
              <select
                {...register('status', { required: 'Le statut est requis' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="pending">En cours</option>
                <option value="won">Gagné</option>
                <option value="lost">Perdu</option>
                <option value="refunded">Remboursé</option>
              </select>
              {errors.status && (
                <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
              )}
            </div>
          </div>

          {/* Platform and Hippodrome Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Plateforme
              </label>
              <input
                type="text"
                placeholder="Ex: PMU, Betclic, Unibet..."
                {...register('platform')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hippodrome
              </label>
              <input
                type="text"
                placeholder="Ex: Vincennes, Longchamp..."
                {...register('hippodrome')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Race Number and Bet Type Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Numéro de course
              </label>
              <input
                type="text"
                placeholder="Ex: 5"
                {...register('raceNumber')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type de pari
              </label>
              <select
                {...register('betType')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Sélectionnez un type</option>
                <option value="gagnant">Simple Gagnant</option>
                <option value="place">Simple Placé</option>
                <option value="gagnant_place">Couplé Gagnant-Placé</option>
                <option value="couple">Couplé</option>
                <option value="couple_ordre">Couplé Ordre</option>
                <option value="trio">Trio</option>
                <option value="trio_ordre">Trio Ordre</option>
                <option value="quarte">Quarté</option>
                <option value="quarte_ordre">Quarté Ordre</option>
                <option value="quinte">Quinté</option>
                <option value="quinte_ordre">Quinté Ordre</option>
                <option value="multi">Multi</option>
                <option value="pick5">Pick 5</option>
                <option value="autre">Autre</option>
              </select>
            </div>
          </div>

          {/* Horses Selected and Winning Horse Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chevaux sélectionnés
              </label>
              <input
                type="text"
                placeholder="Ex: 7, 12, 3"
                {...register('horsesSelected')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Numéros des chevaux, séparés par des virgules
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cheval gagnant
              </label>
              <input
                type="text"
                placeholder="Ex: 7"
                {...register('winningHorse')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Numéro du cheval qui a gagné (si connu)
              </p>
            </div>
          </div>

          {/* Stake and Odds Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mise (€) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                {...register('stake', {
                  required: 'La mise est requise',
                  min: { value: 0.01, message: 'La mise doit être positive' },
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {errors.stake && (
                <p className="mt-1 text-sm text-red-600">{errors.stake.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cote
              </label>
              <input
                type="number"
                step="0.01"
                min="1.01"
                placeholder="Ex: 3.50"
                {...register('odds', {
                  min: { value: 1.01, message: 'La cote doit être ≥ 1.01' },
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {errors.odds && (
                <p className="mt-1 text-sm text-red-600">{errors.odds.message}</p>
              )}
            </div>
          </div>

          {/* Payout and Profit Row (auto-calculated) */}
          {watchStatus !== 'pending' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-md">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gain (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register('payout')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  readOnly
                />
                <p className="mt-1 text-xs text-gray-500">
                  {watchStatus === 'won' && watchStake && watchOdds
                    ? `Auto-calculé: ${watchStake} × ${watchOdds}`
                    : 'Calculé automatiquement'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profit (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register('profit')}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    (watchPayout || 0) - (watchStake || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                  readOnly
                />
                <p className="mt-1 text-xs text-gray-500">
                  {watchStatus === 'won'
                    ? 'Gain - Mise'
                    : watchStatus === 'lost'
                    ? '-Mise'
                    : 'Aucun profit/perte'}
                </p>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              rows={3}
              placeholder="Ajoutez des notes sur ce pari..."
              {...register('notes')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags
            </label>
            <input
              type="text"
              placeholder="Ex: quinté, tiercé, favori (séparés par des virgules)"
              {...register('tags')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Séparez les tags par des virgules
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
                  <span>Enregistrement...</span>
                </>
              ) : (
                <span>{bet ? 'Mettre à jour' : 'Créer le pari'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
