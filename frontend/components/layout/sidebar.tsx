'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useSettings } from '@/contexts/SettingsContext';
import { apiClient } from '@/lib/api/client';
import {
  LayoutDashboard,
  Ticket,
  BarChart3,
  Wallet,
  Bell,
  HelpCircle,
  Settings,
  CreditCard,
  Users,
  Trophy,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Paris', href: '/dashboard/bets', icon: Ticket },
  { name: 'Tipsters', href: '/dashboard/tipsters', icon: Users },
  { name: 'PMU', href: '/dashboard/pmu', icon: Trophy },
  { name: 'Statistiques', href: '/dashboard/statistics', icon: BarChart3 },
  { name: 'Bankroll', href: '/dashboard/bankroll', icon: Wallet },
  { name: 'Budget', href: '/dashboard/budget', icon: CreditCard },
  { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
  { name: 'Abonnement', href: '/dashboard/subscription', icon: CreditCard },
  { name: 'Support', href: '/dashboard/support', icon: HelpCircle },
  { name: 'Paramètres', href: '/dashboard/settings', icon: Settings },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { settings } = useSettings();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);

  // Charger l'abonnement de l'utilisateur
  useEffect(() => {
    const loadSubscription = async () => {
      try {
        const user = apiClient.getUser();
        if (user) {
          // Récupérer l'abonnement actif
          const response = await fetch('/api/subscriptions/active');
          if (response.ok) {
            const data = await response.json();
            setSubscription(data);
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement de l\'abonnement:', error);
      }
    };
    loadSubscription();
  }, []);

  // Sauvegarder l'état de la sidebar dans localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved !== null) {
      setIsCollapsed(saved === 'true');
    }
  }, []);

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebar-collapsed', String(newState));
  };

  // Couleur du badge selon le plan
  const getPlanBadgeColor = (planName?: string) => {
    if (!planName) return 'bg-gray-500';
    const name = planName.toLowerCase();
    if (name.includes('premium') || name.includes('pro')) return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
    if (name.includes('starter') || name.includes('basic')) return 'bg-gradient-to-r from-blue-400 to-blue-600';
    if (name.includes('free') || name.includes('gratuit')) return 'bg-gradient-to-r from-gray-400 to-gray-600';
    return 'bg-gradient-to-r from-primary-400 to-primary-600';
  };

  return (
    <>
      {/* Overlay pour mobile */}
      {isOpen && onClose && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "flex h-full flex-col bg-gray-900 text-white z-50 transition-all duration-300",
        isCollapsed ? "w-20" : "w-64",
        // Sur desktop (lg+) : toujours visible, position relative
        "lg:relative lg:translate-x-0",
        // Sur mobile : position fixe, slide depuis la gauche
        "fixed inset-y-0 left-0 transition-transform duration-300 ease-in-out lg:transition-none",
        // Animation sur mobile uniquement
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
      <div className="flex h-16 items-center justify-between px-4 border-b border-gray-800">
        <Link href="/dashboard" className="flex items-center space-x-2 relative group">
          <div className="relative">
            <span className="text-2xl">🏇</span>
            {subscription && (
              <span 
                className={cn(
                  "absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-900",
                  getPlanBadgeColor(subscription.plan?.name)
                )}
                title={subscription.plan?.name || 'Abonnement'}
              />
            )}
          </div>
          {!isCollapsed && (
            <span className="text-xl font-bold">{settings?.siteName || 'BetTracker'}</span>
          )}
        </Link>
        
        {/* Bouton toggle collapse - Desktop uniquement */}
        <button
          onClick={toggleCollapse}
          className="hidden lg:flex p-1.5 rounded-lg hover:bg-gray-800 transition-colors"
          title={isCollapsed ? 'Agrandir la sidebar' : 'Réduire la sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors group relative',
                isCollapsed ? 'justify-center' : 'space-x-3',
                isActive
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              )}
              title={isCollapsed ? item.name : undefined}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span>{item.name}</span>}
              
              {/* Tooltip pour mode réduit */}
              {isCollapsed && (
                <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                  {item.name}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {!isCollapsed && (
        <div className="border-t border-gray-800 p-4">
          <div className="text-xs text-gray-400">
            <p className="font-medium">Version 1.0.0</p>
            <p className="mt-1">© 2025 {settings?.siteName || 'BetTracker'}</p>
            {settings?.supportEmail && (
              <p className="mt-2 text-gray-500">
                Support: <a href={`mailto:${settings.supportEmail}`} className="text-primary-400 hover:text-primary-300">{settings.supportEmail}</a>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Bouton fermer pour mobile */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white lg:hidden"
        >
          <X className="h-6 w-6" />
        </button>
      )}
    </div>
    </>
  );
}
