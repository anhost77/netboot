'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Target, Home, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { AuthModal } from '@/components/modals/AuthModal';
import { NotificationsDropdown } from '@/components/layout/notifications-dropdown';
import { authAPI } from '@/lib/api/auth';
import { notificationService } from '@/lib/notification-service';
import { useRouter } from 'next/navigation';

export default function MarketingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const { isAuthenticated, user, logout: authLogout } = useAuth();
  const router = useRouter();

  const navLinks = [
    { label: 'Accueil', href: '/' },
    { label: 'Fonctionnalités', href: '/fonctionnalites' },
    { label: 'Tarifs', href: '/#tarifs' },
    { label: 'Calendrier', href: '/calendrier-courses' },
    { label: 'Pronostics', href: '/pronostics' },
    { label: 'Blog', href: '/blog' },
    { label: 'Hippodromes', href: '/hippodromes' },
  ];

  const handleOpenModal = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      authLogout();
      setShowUserMenu(false);
      notificationService.success('Déconnexion réussie', 'À bientôt !');
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      notificationService.error('Erreur', 'Échec de la déconnexion');
    }
  };

  return (
    <>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <div className="p-2 bg-primary-600 rounded-lg">
                <Target className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">BetTracker Pro</span>
            </Link>

            {/* Navigation Desktop */}
            <nav className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Boutons CTA Desktop */}
            <div className="hidden md:flex items-center space-x-3">
              {isAuthenticated ? (
                <>
                  {/* Notifications */}
                  <NotificationsDropdown />

                  {/* User Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="h-8 w-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {user?.firstName?.[0] || user?.email?.[0] || 'U'}
                      </div>
                    </button>

                    {showUserMenu && (
                      <>
                        {/* Overlay pour fermer le menu */}
                        <div
                          className="fixed inset-0 z-30"
                          onClick={() => setShowUserMenu(false)}
                        ></div>

                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                          <Link
                            href="/dashboard"
                            className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <Home className="h-4 w-4" />
                            <span>Dashboard</span>
                          </Link>
                          <Link
                            href="/dashboard/settings"
                            className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <Settings className="h-4 w-4" />
                            <span>Paramètres</span>
                          </Link>
                          <hr className="my-2" />
                          <button
                            onClick={handleLogout}
                            className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                          >
                            <LogOut className="h-4 w-4" />
                            <span>Déconnexion</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <button
                    onClick={() => handleOpenModal('login')}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
                  >
                    Connexion
                  </button>
                  <button
                    onClick={() => handleOpenModal('register')}
                    className="px-4 py-2 text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors shadow-sm"
                  >
                    Commencer gratuitement
                  </button>
                </>
              )}
            </div>

            {/* Bouton Menu Mobile */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="Menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Menu Mobile */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200 animate-slide-down">
              <nav className="flex flex-col space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
              <div className="flex flex-col space-y-2 mt-4 pt-4 border-t border-gray-200">
                {isAuthenticated ? (
                  <>
                    <Link
                      href="/dashboard/notifications"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-4 py-2 text-sm font-medium text-center text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      Notifications
                    </Link>
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-4 py-2 text-sm font-bold text-center text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/dashboard/settings"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-4 py-2 text-sm font-medium text-center text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      Paramètres
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="px-4 py-2 text-sm font-medium text-center text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      Déconnexion
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        handleOpenModal('login');
                        setMobileMenuOpen(false);
                      }}
                      className="px-4 py-2 text-sm font-medium text-center text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      Connexion
                    </button>
                    <button
                      onClick={() => {
                        handleOpenModal('register');
                        setMobileMenuOpen(false);
                      }}
                      className="px-4 py-2 text-sm font-bold text-center text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
                    >
                      Commencer gratuitement
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
        onSwitchMode={setAuthMode}
      />
    </>
  );
}
