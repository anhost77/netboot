'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Edit3, Sparkles, Users } from 'lucide-react';
import type { Bet, CreateBetData } from '@/lib/types';
import { platformsAPI, type Platform } from '@/lib/api/platforms';
import { tipstersAPI, type Tipster } from '@/lib/api/tipsters';
import { getLocalDateString } from '@/lib/date-utils';
import PMUSelector from './pmu-selector-v2';

interface BetFormProps {
  bet?: Bet | null;
  onSubmit: (data: CreateBetData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function BetForm({ bet, onSubmit, onCancel, isLoading = false }: BetFormProps) {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [tipsters, setTipsters] = useState<Tipster[]>([]);
  const [loadingPlatforms, setLoadingPlatforms] = useState(true);
  const [formMode, setFormMode] = useState<'simple' | 'complete'>('simple');
  const [inputMode, setInputMode] = useState<'manual' | 'pmu'>('pmu');

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
          date: getLocalDateString(),
          status: 'pending',
        },
  });

  const watchStake = watch('stake');
  const watchOdds = watch('odds');
  const watchStatus = watch('status');
  const watchPayout = watch('payout');

  // Load platforms and tipsters
  useEffect(() => {
    const loadData = async () => {
      try {
        const [platformsData, tipstersData] = await Promise.all([
          platformsAPI.getAll(),
          tipstersAPI.getAll(),
        ]);
        setPlatforms(platformsData.filter(p => p.isActive));
        setTipsters(tipstersData.filter(t => t.isActive));
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoadingPlatforms(false);
      }
    };
    loadData();
  }, []);

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

  const handlePMUSelection = (data: {
    hippodrome: string;
    hippodromeCode: string;
    raceNumber: string;
    horsesSelected: string;
    betType: string;
    date: string;
    pmuCode: string;
    platformId: string;
  }) => {
    // Map PMU bet type to backend bet type
    const betTypeMapping: Record<string, string> = {
      'Simple Gagnant': 'gagnant',
      'Simple Placé': 'place',
      'Simple Gagnant et Placé': 'gagnant_place',
      'Couplé Ordre': 'couple_ordre',
      'Couplé Gagnant': 'couple',
      'Couplé Placé': 'couple',
      'Trio Ordre': 'trio_ordre',
      'Trio': 'trio',
      'Tiercé Ordre': 'tierce_ordre',
      'Tiercé Désordre': 'tierce',
      'Quarté+ Ordre': 'quarte_ordre',
      'Quarté+ Désordre': 'quarte',
      'Quinté+ Ordre': 'quinte_ordre',
      'Quinté+ Désordre': 'quinte',
      'Quinté+ Bonus': 'quinte',
      '2sur4': 'multi',
      'Multi': 'multi',
      'Mini Multi': 'multi',
      'Pick 5': 'pick5',
    };

    setValue('hippodrome', data.hippodrome);
    setValue('raceNumber', data.raceNumber);
    setValue('horsesSelected', data.horsesSelected);
    setValue('betType', (betTypeMapping[data.betType] || 'gagnant') as any);
    setValue('date', data.date);
    setValue('platform', data.platformId);
    // Store PMU code in notes for reference with full bet type name
    const currentNotes = watch('notes') || '';
    setValue('notes', currentNotes ? `${currentNotes}\n${data.betType} - Code PMU: ${data.pmuCode}` : `${data.betType} - Code PMU: ${data.pmuCode}`);
    // Stay in PMU mode to show recap
  };

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
    
    // Only include odds if it has a value
    if (data.odds && !isNaN(parseFloat(data.odds as any))) {
      data.odds = parseFloat(data.odds as any);
    } else {
      delete (data as any).odds;
    }
    
    // Only include payout if it has a value
    if (data.payout && !isNaN(parseFloat(data.payout as any))) {
      data.payout = parseFloat(data.payout as any);
    } else {
      delete (data as any).payout;
    }

    // Remove profit - it's calculated by the backend
    delete (data as any).profit;

    await onSubmit(data);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between mb-4">
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

          {/* Input Mode Tabs - Only show when creating new bet */}
          {!bet && (
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setInputMode('pmu')}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center justify-center space-x-2 ${
                  inputMode === 'pmu'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Sparkles className="h-4 w-4" />
                <span>Sélection PMU</span>
              </button>
              <button
                type="button"
                onClick={() => setInputMode('manual')}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center justify-center space-x-2 ${
                  inputMode === 'manual'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Edit3 className="h-4 w-4" />
                <span>Saisie manuelle</span>
              </button>
            </div>
          )}

          {/* Form Mode Tabs - Only show in manual mode or when editing */}
          {(bet || inputMode === 'manual') && (
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mt-3">
              <button
                type="button"
                onClick={() => setFormMode('simple')}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  formMode === 'simple'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                ⚡ Saisie rapide
              </button>
              <button
                type="button"
                onClick={() => setFormMode('complete')}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  formMode === 'complete'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                📋 Formulaire complet
              </button>
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-6">
          {/* PMU Selector */}
          {!bet && inputMode === 'pmu' && !watch('platform') && (
            <div className="mb-6">
              <PMUSelector platforms={platforms} onSelect={handlePMUSelection} />
            </div>
          )}

          {/* PMU Recap - Show after PMU selection */}
          {!bet && inputMode === 'pmu' && watch('platform') && (
            <div className="mb-6 bg-gradient-to-br from-primary-50 to-blue-50 rounded-lg p-6 border-2 border-primary-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-primary-600" />
                <span>Récapitulatif de votre pari</span>
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Type de pari</p>
                  <p className="font-semibold text-gray-900">{watch('notes')?.split(' - Code PMU:')[0]}</p>
                </div>
                <div>
                  <p className="text-gray-600">Portefeuille</p>
                  <p className="font-semibold text-gray-900">
                    {platforms.find(p => p.id === watch('platform'))?.name}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Hippodrome (Réunion)</p>
                  <p className="font-semibold text-gray-900">
                    {watch('hippodrome')} 
                    {watch('notes') && (
                      <span className="ml-2 text-primary-600">
                        {watch('notes').match(/R\d+/)?.[0]}
                      </span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Course</p>
                  <p className="font-semibold text-gray-900">
                    {watch('notes') && (
                      <span className="text-primary-600">
                        {watch('notes').match(/C\d+/)?.[0]}
                      </span>
                    )}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-600 mb-2">Chevaux sélectionnés</p>
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <ul className="space-y-1">
                      {watch('horsesSelected')?.split(', ').map((horse, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <span className="w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </span>
                          <span className="font-semibold text-gray-900">{horse}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-600">Date</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(watch('date')).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              {/* Tipster Selector */}
              {tipsters.length > 0 && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>Tipster (optionnel)</span>
                  </label>
                  <select
                    {...register('tipsterId')}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Aucun tipster</option>
                    {tipsters.map((tipster) => (
                      <option key={tipster.id} value={tipster.id}>
                        {tipster.name}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    Associez ce pari à un tipster pour suivre ses performances
                  </p>
                </div>
              )}
              
              {/* Stake input for PMU mode */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mise (€) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="Montant de votre mise"
                  {...register('stake', {
                    required: 'La mise est requise',
                    min: { value: 0.01, message: 'La mise doit être positive' },
                  })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-lg"
                />
                {errors.stake && (
                  <p className="mt-1 text-sm text-red-600">{errors.stake.message}</p>
                )}
              </div>

              {/* Submit Button for PMU mode */}
              <div className="flex space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={isLoading}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
                      <span>Enregistrement...</span>
                    </>
                  ) : (
                    <span>Créer le pari</span>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Manual Form Fields - Show only in manual mode or when editing */}
          {(bet || inputMode === 'manual') && (
            <>
          {/* Date and Status Row (only in complete mode) */}
          {formMode === 'complete' && (
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
          )}

          {/* Hippodrome (Required in simple mode) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hippodrome <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Ex: Vincennes, Longchamp..."
              {...register('hippodrome', { required: 'L\'hippodrome est requis' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {errors.hippodrome && (
              <p className="mt-1 text-sm text-red-600">{errors.hippodrome.message}</p>
            )}
          </div>

          {/* Race Number and Bet Type Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Numéro de course <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Ex: 5"
                {...register('raceNumber', { required: 'Le numéro de course est requis' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {errors.raceNumber && (
                <p className="mt-1 text-sm text-red-600">{errors.raceNumber.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type de pari <span className="text-red-500">*</span>
              </label>
              <select
                {...register('betType', { required: 'Le type de pari est requis' })}
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
              {errors.betType && (
                <p className="mt-1 text-sm text-red-600">{errors.betType.message}</p>
              )}
            </div>
          </div>

          {/* Horses Selected (Required in simple mode) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chevaux sélectionnés <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Ex: 7, 12, 3"
              {...register('horsesSelected', { required: 'Les chevaux sélectionnés sont requis' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Numéros des chevaux, séparés par des virgules
            </p>
            {errors.horsesSelected && (
              <p className="mt-1 text-sm text-red-600">{errors.horsesSelected.message}</p>
            )}
          </div>

          {/* Tipster Selector (Manual Mode) */}
          {tipsters.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Tipster (optionnel)</span>
              </label>
              <select
                {...register('tipsterId')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Aucun tipster</option>
                {tipsters.map((tipster) => (
                  <option key={tipster.id} value={tipster.id}>
                    {tipster.name}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Associez ce pari à un tipster pour suivre ses performances
              </p>
            </div>
          )}

          {/* Platform and Stake Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Plateforme <span className="text-red-500">*</span>
              </label>
              {loadingPlatforms ? (
                <select
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                >
                  <option>Chargement...</option>
                </select>
              ) : platforms.length === 0 ? (
                <div className="relative">
                  <select
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                  >
                    <option>Aucune plateforme disponible</option>
                  </select>
                  <p className="mt-1 text-xs text-red-500">
                    Vous devez créer une plateforme dans{' '}
                    <a href="/dashboard/settings" className="text-primary-600 hover:text-primary-700 underline">
                      Paramètres
                    </a>
                  </p>
                </div>
              ) : (
                <select
                  {...register('platform', { required: 'La plateforme est requise' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Sélectionnez une plateforme</option>
                  {platforms.map((platform) => (
                    <option key={platform.id} value={platform.name}>
                      {platform.name}
                    </option>
                  ))}
                </select>
              )}
              {errors.platform && (
                <p className="mt-1 text-sm text-red-600">{errors.platform.message}</p>
              )}
            </div>
          </div>

          {/* Winning Horse (only in complete mode) */}
          {formMode === 'complete' && (
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
          )}

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

            {formMode === 'complete' && (
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
            )}
          </div>

          {/* Payout and Profit Row (auto-calculated) */}
          {formMode === 'complete' && watchStatus !== 'pending' && (
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
          {formMode === 'complete' && (
            <>
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
            </>
          )}

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
            </>
          )}
        </form>
      </div>
    </div>
  );
}
