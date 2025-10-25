'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/lib/auth-context';

interface LoginForm {
  email: string;
  password: string;
  twoFactorCode?: string;
}

export default function LoginPage() {
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
  const [credentials, setCredentials] = useState({ email: '', password: '' });

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setError('');

    try {
      // Store credentials for 2FA step
      if (!requiresTwoFactor) {
        setCredentials({ email: data.email, password: data.password });
      }

      // Attempt login
      const result = await login(
        credentials.email || data.email,
        credentials.password || data.password,
        data.twoFactorCode
      );

      // Check if 2FA is required
      if (result.requiresTwoFactor) {
        setRequiresTwoFactor(true);
        setError('');
      }
    } catch (err: any) {
      console.error('Login error:', err);

      // Extract detailed error message
      let errorMessage = 'Échec de la connexion.';

      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message === 'Network Error' || !err.response) {
        errorMessage = 'Impossible de se connecter au serveur. Vérifiez que le backend est lancé sur http://localhost:3001';
      } else if (err.response?.status === 401) {
        errorMessage = requiresTwoFactor ? 'Code 2FA invalide.' : 'Email ou mot de passe incorrect.';
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
            <p className="text-gray-600">
              {requiresTwoFactor ? 'Authentification à deux facteurs' : 'Connectez-vous à votre compte'}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {!requiresTwoFactor ? (
              <>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    {...register('email', {
                      required: 'Email requis',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Email invalide',
                      },
                    })}
                    type="email"
                    id="email"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="votre@email.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Mot de passe
                  </label>
                  <input
                    {...register('password', {
                      required: 'Mot de passe requis',
                      minLength: {
                        value: 6,
                        message: 'Minimum 6 caractères',
                      },
                    })}
                    type="password"
                    id="password"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="••••••••"
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                    <span className="ml-2 text-sm text-gray-600">Se souvenir de moi</span>
                  </label>
                  <Link href="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700">
                    Mot de passe oublié ?
                  </Link>
                </div>
              </>
            ) : (
              <>
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-md text-sm">
                  Entrez le code à 6 chiffres généré par votre application d'authentification.
                </div>

                <div>
                  <label htmlFor="twoFactorCode" className="block text-sm font-medium text-gray-700 mb-1">
                    Code de vérification
                  </label>
                  <input
                    {...register('twoFactorCode', {
                      required: 'Code requis',
                      pattern: {
                        value: /^\d{6}$/,
                        message: 'Le code doit contenir 6 chiffres',
                      },
                    })}
                    type="text"
                    id="twoFactorCode"
                    maxLength={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent text-center text-2xl tracking-widest font-mono"
                    placeholder="000000"
                    autoFocus
                  />
                  {errors.twoFactorCode && (
                    <p className="mt-1 text-sm text-red-600">{errors.twoFactorCode.message}</p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setRequiresTwoFactor(false);
                    setCredentials({ email: '', password: '' });
                  }}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  ← Retour à la connexion
                </button>
              </>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (requiresTwoFactor ? 'Vérification...' : 'Connexion...') : (requiresTwoFactor ? 'Vérifier le code' : 'Se connecter')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Pas encore de compte ?{' '}
              <Link href="/register" className="text-primary-600 hover:text-primary-700 font-medium">
                Créer un compte
              </Link>
            </p>
          </div>
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
