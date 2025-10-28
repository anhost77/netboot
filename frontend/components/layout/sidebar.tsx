'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useSettings } from '@/contexts/SettingsContext';
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
        "flex h-full w-64 flex-col bg-gray-900 text-white z-50",
        // Sur desktop (lg+) : toujours visible, position relative
        "lg:relative lg:translate-x-0",
        // Sur mobile : position fixe, slide depuis la gauche
        "fixed inset-y-0 left-0 transition-transform duration-300 ease-in-out lg:transition-none",
        // Animation sur mobile uniquement
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
      <div className="flex h-16 items-center px-6 border-b border-gray-800">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <span className="text-2xl">🏇</span>
          <span className="text-xl font-bold">{settings?.siteName || 'BetTracker'}</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

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
