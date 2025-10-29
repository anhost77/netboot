'use client';

import { useAuth } from '@/lib/auth-context';
import { useMode } from '@/contexts/ModeContext';
import { LogOut, User, Menu, Play, Zap } from 'lucide-react';
import { NotificationsDropdown } from './notifications-dropdown';

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const { mode, isSimulation } = useMode();

  return (
    <header className="h-16 border-b border-gray-200 bg-white px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        {/* Bouton menu hamburger pour mobile */}
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
          >
            <Menu className="h-6 w-6" />
          </button>
        )}
        
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
          <span className="hidden sm:inline">Bienvenue, {user?.firstName || user?.email?.split('@')[0] || 'Utilisateur'} !</span>
          <span className="sm:hidden">🏇 BetTracker</span>
        </h2>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* Indicateur de mode */}
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold ${
          isSimulation 
            ? 'bg-blue-100 text-blue-800' 
            : 'bg-green-100 text-green-800'
        }`}>
          {isSimulation ? (
            <>
              <Play className="h-3 w-3" />
              <span className="hidden sm:inline">Simulation</span>
            </>
          ) : (
            <>
              <Zap className="h-3 w-3" />
              <span className="hidden sm:inline">Réel</span>
            </>
          )}
        </div>

        {/* Notifications */}
        <NotificationsDropdown />
        
        <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
          <User className="h-4 w-4" />
          <span className="hidden lg:inline">{user?.email}</span>
          {user?.role === 'admin' && (
            <span className="ml-2 px-2 py-0.5 bg-primary-100 text-primary-700 text-xs font-medium rounded">
              Admin
            </span>
          )}
        </div>

        <button
          onClick={() => logout()}
          className="flex items-center space-x-2 px-3 sm:px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Déconnexion</span>
        </button>
      </div>
    </header>
  );
}
