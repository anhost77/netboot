'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Target } from 'lucide-react';

export default function MarketingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Accueil', href: '/' },
    { label: 'Fonctionnalités', href: '/#fonctionnalites' },
    { label: 'Tarifs', href: '/#tarifs' },
    { label: 'Calendrier', href: '/calendrier-courses' },
    { label: 'Pronostics', href: '/pronostics' },
    { label: 'Blog', href: '/blog' },
    { label: 'Hippodromes', href: '/hippodromes' },
  ];

  return (
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
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
            >
              Connexion
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors shadow-sm"
            >
              Commencer gratuitement
            </Link>
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
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2 text-sm font-medium text-center text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Connexion
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2 text-sm font-bold text-center text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
              >
                Commencer gratuitement
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
