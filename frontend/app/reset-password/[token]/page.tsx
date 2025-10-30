'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { authAPI } from '@/lib/api/auth';
import { notificationService } from '@/lib/notification-service';
import { useAuthModal } from '@/contexts/AuthModalContext';

interface ResetPasswordForm {
  newPassword: string;
  confirmPassword: string;
}

export default function ResetPasswordPage() {
  const { openLoginModal } = useAuthModal();
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordForm>();

  const newPassword = watch('newPassword');

  const onSubmit = async (data: ResetPasswordForm) => {
    setIsLoading(true);
    setError('');

    try {
      await authAPI.resetPassword(token, data.newPassword);
      setSuccess(true);
      notificationService.success(
        'Mot de passe réinitialisé !',
        'Vous pouvez maintenant vous connecter avec votre nouveau mot de passe'
      );

      // Rediriger vers la page de connexion après 3 secondes
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: any) {
      console.error('Reset password error:', err);
      let errorMessage = 'Échec de la réinitialisation du mot de passe.';

      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message === 'Network Error' || !err.response) {
        errorMessage = 'Impossible de se connecter au serveur.';
      } else if (err.response?.status === 400) {
        errorMessage = 'Le lien de réinitialisation est invalide ou a expiré.';
      } else if (err.response?.status >= 500) {
        errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">🏇 BetTracker Pro</h1>
            <p className="text-gray-600">Réinitialisez votre mot de passe</p>
          </div>

          {success ? (
            <div className="text-center">
              <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-md">
                <p className="font-semibold mb-2">✅ Mot de passe réinitialisé avec succès !</p>
                <p className="text-sm">Vous allez être redirigé vers la page de connexion...</p>
              </div>
              <button
                onClick={openLoginModal}
                className="inline-block text-primary-600 hover:text-primary-700 font-medium"
              >
                Se connecter maintenant →
              </button>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Nouveau mot de passe
                  </label>
                  <input
                    {...register('newPassword', {
                      required: 'Mot de passe requis',
                      minLength: {
                        value: 6,
                        message: 'Minimum 6 caractères',
                      },
                    })}
                    type="password"
                    id="newPassword"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="••••••••"
                  />
                  {errors.newPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.newPassword.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmer le mot de passe
                  </label>
                  <input
                    {...register('confirmPassword', {
                      required: 'Confirmation requise',
                      validate: value => value === newPassword || 'Les mots de passe ne correspondent pas',
                    })}
                    type="password"
                    id="confirmPassword"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="••••••••"
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  <button onClick={openLoginModal} className="text-primary-600 hover:text-primary-700 font-medium">
                    ← Retour à la connexion
                  </button>
                </p>
              </div>
            </>
          )}
        </div>

        <div className="mt-4 text-center">
          <Link href="/" className="text-sm text-white hover:text-gray-200">
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
