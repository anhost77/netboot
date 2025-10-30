'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Github, Twitter, Mail, Target } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface MenuItem {
  id: string;
  label: string;
  url: string;
  children?: MenuItem[];
}

export default function MarketingFooter() {
  const [footerMenus, setFooterMenus] = useState<MenuItem[]>([]);

  useEffect(() => {
    // Charger les menus du footer depuis l'API
    fetch(`${API_URL}/api/cms/menu-items/public/footer`)
      .then(res => res.ok ? res.json() : [])
      .then(data => setFooterMenus(data))
      .catch(err => console.error('Error loading footer menus:', err));
  }, []);

  const currentYear = new Date().getFullYear();

  // Menus par défaut si l'API ne retourne rien
  const defaultMenus = [
    {
      title: 'Produit',
      links: [
        { label: 'Fonctionnalités', href: '/fonctionnalites' },
        { label: 'Tarifs', href: '/#tarifs' },
        { label: 'Calendrier des courses', href: '/calendrier-courses' },
        { label: 'Pronostics gratuits', href: '/pronostics' },
      ]
    },
    {
      title: 'Ressources',
      links: [
        { label: 'Blog PMU', href: '/blog' },
        { label: 'Guide Hippodromes', href: '/hippodromes' },
        { label: 'API & MCP', href: '/docs/api' },
        { label: 'Exemples de code', href: '/docs/examples' },
      ]
    },
    {
      title: 'Support',
      links: [
        { label: 'Centre d\'aide', href: '/dashboard/support' },
        { label: 'Documentation technique', href: '/docs/mcp-server' },
        { label: 'Intégration ChatGPT', href: '/docs/chatgpt' },
        { label: 'Contactez-nous', href: '/contact' },
      ]
    }
  ];

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Colonne 1 - À propos */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="p-2 bg-primary-600 rounded-lg">
                <Target className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">BetTracker Pro</span>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              La plateforme complète pour gérer et optimiser vos paris hippiques PMU.
              Statistiques avancées, mode simulation et intégration temps réel.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="mailto:contact@bettracker.io"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Colonnes dynamiques ou par défaut */}
          {footerMenus.length > 0 ? (
            footerMenus.slice(0, 3).map((menu) => (
              <div key={menu.id}>
                <h4 className="font-semibold text-white mb-4">{menu.label}</h4>
                <ul className="space-y-2">
                  {menu.children?.map((child) => (
                    <li key={child.id}>
                      <Link
                        href={child.url}
                        className="text-sm text-gray-400 hover:text-white transition-colors"
                      >
                        {child.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          ) : (
            defaultMenus.map((section, idx) => (
              <div key={idx}>
                <h4 className="font-semibold text-white mb-4">{section.title}</h4>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-gray-400 hover:text-white transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>

        {/* Disclaimer Légal */}
        <div className="border-t border-gray-800 pt-8 pb-6">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-6">
            <p className="text-xs text-gray-400 leading-relaxed">
              <strong className="text-gray-300">Important :</strong> BetTracker Pro est une plateforme de <strong>suivi et d'analyse de paris hippiques</strong>.
              Nous n'encaissons pas de paris et ne sommes pas un opérateur de jeux d'argent.
              Vous pariez sur les plateformes agréées (PMU, Betclic, Unibet, etc.) et utilisez BetTracker pour enregistrer et analyser vos performances.
              <span className="block mt-2">
                <strong className="text-gray-300">Jeu responsable :</strong> Les jeux d'argent comportent des risques : endettement, isolement, dépendance.
                Pour être aidé, appelez le <a href="tel:09-74-75-13-13" className="text-primary-400 hover:text-primary-300 underline">09 74 75 13 13</a> (appel non surtaxé).
                Jouer comporte des risques. Jouez avec modération. Interdit aux mineurs (-18 ans).
              </span>
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between text-sm">
            <p className="text-gray-400">
              © {currentYear} BetTracker Pro. Tous droits réservés.
            </p>
            <p className="text-gray-500 mt-2 md:mt-0">
              Fait avec ❤️ pour les passionnés de turf
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
