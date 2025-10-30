'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { authAPI } from '@/lib/api/auth';
import { notificationService } from '@/lib/notification-service';

interface LoginForm {
  email: string;
  password: string;
  twoFactorCode?: string;
}

interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  firstName?: string;
  lastName?: string;
}

interface ForgotPasswordForm {
  email: string;
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'login' | 'register';
  onSwitchMode: (mode: 'login' | 'register') => void;
}

export function AuthModal({ isOpen, onClose, mode, onSwitchMode }: AuthModalProps) {
  const { login, register: registerUser } = useAuth();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const {
    register: registerLogin,
    handleSubmit: handleSubmitLogin,
    formState: { errors: errorsLogin },
    reset: resetLogin,
  } = useForm<LoginForm>();

  const {
    register: registerReg,
    handleSubmit: handleSubmitReg,
    watch,
    formState: { errors: errorsReg },
    reset: resetReg,
  } = useForm<RegisterForm>();

  const {
    register: registerForgot,
    handleSubmit: handleSubmitForgot,
    formState: { errors: errorsForgot },
    reset: resetForgot,
  } = useForm<ForgotPasswordForm>();

  const password = watch('password');

  // Reset forms when modal closes or mode changes
  useEffect(() => {
    if (!isOpen) {
      resetLogin();
      resetReg();
      resetForgot();
      setError('');
      setSuccess('');
      setRequiresTwoFactor(false);
      setCredentials({ email: '', password: '' });
      setShowForgotPassword(false);
    }
  }, [isOpen, resetLogin, resetReg, resetForgot]);

  useEffect(() => {
    setError('');
    setSuccess('');
    setRequiresTwoFactor(false);
    setShowForgotPassword(false);
  }, [mode]);

  const onSubmitLogin = async (data: LoginForm) => {
    setIsLoading(true);
    setError('');

    try {
      if (!requiresTwoFactor) {
        setCredentials({ email: data.email, password: data.password });
      }

      const result = await login(
        credentials.email || data.email,
        credentials.password || data.password,
        data.twoFactorCode
      );

      if (result.requiresTwoFactor) {
        setRequiresTwoFactor(true);
        setError('');
        resetLogin({ twoFactorCode: '' });
        notificationService.info(
          'Authentification à deux facteurs',
          'Veuillez entrer votre code 2FA pour continuer'
        );
      } else {
        notificationService.success(
          'Connexion réussie !',
          'Bienvenue sur BetTracker Pro'
        );
        onClose();
      }
    } catch (err: any) {
      console.error('Login error:', err);
      let errorMessage = 'Échec de la connexion.';

      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message === 'Network Error' || !err.response) {
        errorMessage = 'Impossible de se connecter au serveur.';
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

  const onSubmitRegister = async (data: RegisterForm) => {
    setIsLoading(true);
    setError('');

    try {
      await registerUser(data.email, data.password, data.firstName, data.lastName);
      notificationService.success(
        'Inscription réussie !',
        'Bienvenue sur BetTracker Pro'
      );
      onClose();
    } catch (err: any) {
      console.error('Registration error:', err);
      let errorMessage = 'Échec de l\'inscription. Veuillez réessayer.';

      if (err.response?.data?.message) {
        if (Array.isArray(err.response.data.message)) {
          errorMessage = err.response.data.message.join(', ');
        } else {
          errorMessage = err.response.data.message;
        }
      } else if (err.message === 'Network Error' || !err.response) {
        errorMessage = 'Impossible de se connecter au serveur.';
      } else if (err.response?.status === 409) {
        errorMessage = 'Cet email est déjà utilisé.';
      } else if (err.response?.status >= 500) {
        errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitForgotPassword = async (data: ForgotPasswordForm) => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      await authAPI.requestPasswordReset(data.email);
      setSuccess('Un email de réinitialisation a été envoyé à votre adresse. Veuillez vérifier votre boîte de réception.');
      notificationService.success(
        'Email envoyé',
        'Consultez votre boîte de réception pour réinitialiser votre mot de passe'
      );
    } catch (err: any) {
      console.error('Forgot password error:', err);
      let errorMessage = 'Échec de l\'envoi de l\'email.';

      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message === 'Network Error' || !err.response) {
        errorMessage = 'Impossible de se connecter au serveur.';
      } else if (err.response?.status >= 500) {
        errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md p-8 transform transition-all">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">🏇 BetTracker Pro</h1>
            <p className="text-gray-600">
              {showForgotPassword
                ? 'Réinitialiser votre mot de passe'
                : mode === 'login'
                  ? (requiresTwoFactor ? 'Authentification à deux facteurs' : 'Connectez-vous à votre compte')
                  : 'Créez votre compte gratuitement'
              }
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm">
              {success}
            </div>
          )}

          {/* Login Form */}
          {mode === 'login' && !showForgotPassword && (
            <form onSubmit={handleSubmitLogin(onSubmitLogin)} className="space-y-4">
              {!requiresTwoFactor ? (
                <>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      {...registerLogin('email', {
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
                    {errorsLogin.email && (
                      <p className="mt-1 text-sm text-red-600">{errorsLogin.email.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      Mot de passe
                    </label>
                    <input
                      {...registerLogin('password', {
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
                    {errorsLogin.password && (
                      <p className="mt-1 text-sm text-red-600">{errorsLogin.password.message}</p>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-sm text-primary-600 hover:text-primary-700"
                    >
                      Mot de passe oublié ?
                    </button>
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
                      {...registerLogin('twoFactorCode', {
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
                    {errorsLogin.twoFactorCode && (
                      <p className="mt-1 text-sm text-red-600">{errorsLogin.twoFactorCode.message}</p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setRequiresTwoFactor(false);
                      setCredentials({ email: '', password: '' });
                      resetLogin();
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
          )}

          {/* Register Form */}
          {mode === 'register' && (
            <form onSubmit={handleSubmitReg(onSubmitRegister)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                    Prénom (optionnel)
                  </label>
                  <input
                    {...registerReg('firstName')}
                    type="text"
                    id="firstName"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Jean"
                  />
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                    Nom (optionnel)
                  </label>
                  <input
                    {...registerReg('lastName')}
                    type="text"
                    id="lastName"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Dupont"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="reg-email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  {...registerReg('email', {
                    required: 'Email requis',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Email invalide',
                    },
                  })}
                  type="email"
                  id="reg-email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="votre@email.com"
                />
                {errorsReg.email && (
                  <p className="mt-1 text-sm text-red-600">{errorsReg.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="reg-password" className="block text-sm font-medium text-gray-700 mb-1">
                  Mot de passe
                </label>
                <input
                  {...registerReg('password', {
                    required: 'Mot de passe requis',
                    minLength: {
                      value: 6,
                      message: 'Minimum 6 caractères',
                    },
                  })}
                  type="password"
                  id="reg-password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="••••••••"
                />
                {errorsReg.password && (
                  <p className="mt-1 text-sm text-red-600">{errorsReg.password.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmer le mot de passe
                </label>
                <input
                  {...registerReg('confirmPassword', {
                    required: 'Confirmation requise',
                    validate: value => value === password || 'Les mots de passe ne correspondent pas',
                  })}
                  type="password"
                  id="confirmPassword"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="••••••••"
                />
                {errorsReg.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errorsReg.confirmPassword.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Création du compte...' : 'Créer mon compte'}
              </button>
            </form>
          )}

          {/* Forgot Password Form */}
          {showForgotPassword && mode === 'login' && (
            <form onSubmit={handleSubmitForgot(onSubmitForgotPassword)} className="space-y-4">
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-md text-sm">
                Entrez votre adresse email pour recevoir un lien de réinitialisation.
              </div>

              <div>
                <label htmlFor="forgot-email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  {...registerForgot('email', {
                    required: 'Email requis',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Email invalide',
                    },
                  })}
                  type="email"
                  id="forgot-email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="votre@email.com"
                />
                {errorsForgot.email && (
                  <p className="mt-1 text-sm text-red-600">{errorsForgot.email.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Envoi en cours...' : 'Envoyer le lien'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowForgotPassword(false);
                  setError('');
                  setSuccess('');
                  resetForgot();
                }}
                className="w-full text-sm text-primary-600 hover:text-primary-700"
              >
                ← Retour à la connexion
              </button>
            </form>
          )}

          {/* Switch mode */}
          {!showForgotPassword && (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {mode === 'login' ? (
                  <>
                    Pas encore de compte ?{' '}
                    <button
                      onClick={() => onSwitchMode('register')}
                      className="text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Créer un compte
                    </button>
                  </>
                ) : (
                  <>
                    Vous avez déjà un compte ?{' '}
                    <button
                      onClick={() => onSwitchMode('login')}
                      className="text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Se connecter
                    </button>
                  </>
                )}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
