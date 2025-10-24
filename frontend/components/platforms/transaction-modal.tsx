'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { platformsAPI, TransactionType, type Platform } from '@/lib/api/platforms';
import { formatCurrency } from '@/lib/utils';
import { X, Plus, Minus } from 'lucide-react';

interface TransactionModalProps {
  platform: Platform;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  type: TransactionType;
  amount: number;
  description: string;
}

export default function TransactionModal({ platform, onClose, onSuccess }: TransactionModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transactionType, setTransactionType] = useState<TransactionType>(TransactionType.DEPOSIT);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormData>({
    defaultValues: {
      type: TransactionType.DEPOSIT,
      amount: 0,
      description: '',
    },
  });

  const amount = watch('amount');
  const newBalance = transactionType === TransactionType.DEPOSIT
    ? platform.currentBankroll + (amount || 0)
    : platform.currentBankroll - (amount || 0);

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      await platformsAPI.createTransaction(platform.id, {
        type: transactionType,
        amount: data.amount,
        description: data.description || undefined,
      });

      onSuccess();
    } catch (err: any) {
      console.error('Failed to create transaction:', err);
      setError(err.response?.data?.message || 'Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Gérer les fonds</h2>
            <p className="text-sm text-gray-600 mt-1">{platform.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Current Balance */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="text-sm text-gray-600">Bankroll actuelle</div>
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(platform.currentBankroll)}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Type de transaction */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type de transaction *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTransactionType(TransactionType.DEPOSIT)}
                className={`flex items-center justify-center space-x-2 px-4 py-3 border-2 rounded-lg transition-colors ${
                  transactionType === TransactionType.DEPOSIT
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Plus className="h-5 w-5" />
                <span className="font-medium">Dépôt</span>
              </button>
              <button
                type="button"
                onClick={() => setTransactionType(TransactionType.WITHDRAWAL)}
                className={`flex items-center justify-center space-x-2 px-4 py-3 border-2 rounded-lg transition-colors ${
                  transactionType === TransactionType.WITHDRAWAL
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Minus className="h-5 w-5" />
                <span className="font-medium">Retrait</span>
              </button>
            </div>
          </div>

          {/* Montant */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Montant (€) *
            </label>
            <input
              type="number"
              step="0.01"
              {...register('amount', {
                required: 'Le montant est requis',
                min: { value: 0.01, message: 'Le montant doit être supérieur à 0' },
                max:
                  transactionType === TransactionType.WITHDRAWAL
                    ? {
                        value: platform.currentBankroll,
                        message: 'Fonds insuffisants',
                      }
                    : undefined,
              })}
              placeholder="50.00"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            {errors.amount && (
              <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (optionnel)
            </label>
            <input
              type="text"
              {...register('description')}
              placeholder="Ex: Dépôt mensuel, Retrait de gains..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Nouveau solde prévisionnel */}
          {amount > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Nouveau solde :</span>
                <span
                  className={`text-lg font-bold ${
                    newBalance < 0 ? 'text-red-600' : 'text-gray-900'
                  }`}
                >
                  {formatCurrency(newBalance)}
                </span>
              </div>
              {newBalance < 0 && (
                <p className="text-xs text-red-600 mt-2">
                  Le solde ne peut pas être négatif
                </p>
              )}
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
              disabled={isSubmitting || newBalance < 0}
              className={`px-4 py-2 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                transactionType === TransactionType.DEPOSIT
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {isSubmitting
                ? 'En cours...'
                : transactionType === TransactionType.DEPOSIT
                  ? 'Ajouter les fonds'
                  : 'Retirer les fonds'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
