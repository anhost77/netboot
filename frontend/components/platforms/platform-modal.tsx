'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { platformsAPI, type Platform } from '@/lib/api/platforms';
import { X } from 'lucide-react';

interface PlatformModalProps {
  platform?: Platform | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  name: string;
  initialBankroll: number;
  isActive?: boolean;
}

export default function PlatformModal({ platform, onClose, onSuccess }: PlatformModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      name: platform?.name || '',
      initialBankroll: platform?.initialBankroll || 0,
      isActive: platform?.isActive ?? true,
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      if (platform) {
        // Mise à jour
        await platformsAPI.update(platform.id, {
          name: data.name,
          isActive: data.isActive,
        });
      } else {
        // Création
        await platformsAPI.create({
          name: data.name,
          initialBankroll: Number(data.initialBankroll),
        });
      }

      onSuccess();
    } catch (err: any) {
      console.error('Failed to save platform:', err);
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
          <h2 className="text-xl font-semibold text-gray-900">
            {platform ? 'Modifier la plateforme' : 'Nouvelle plateforme'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Nom de la plateforme */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom de la plateforme *
            </label>
            <input
              type="text"
              {...register('name', { required: 'Le nom est requis' })}
              placeholder="Ex: PMU, Betclic, Zeturf..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* Bankroll initiale (seulement à la création) */}
          {!platform && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bankroll initiale (€) *
              </label>
              <input
                type="number"
                step="0.01"
                {...register('initialBankroll', {
                  required: 'La bankroll initiale est requise',
                  min: { value: 0, message: 'Le montant doit être positif' },
                })}
                placeholder="100"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              {errors.initialBankroll && (
                <p className="mt-1 text-sm text-red-600">{errors.initialBankroll.message}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Montant initial que vous déposez sur cette plateforme
              </p>
            </div>
          )}

          {/* Statut actif (seulement en modification) */}
          {platform && (
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                {...register('isActive')}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                Plateforme active
              </label>
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
              {isSubmitting ? 'Enregistrement...' : platform ? 'Mettre à jour' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
