'use client';

import { useAuth } from '@/lib/auth-context';
import { LogOut, User } from 'lucide-react';

export function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 border-b border-gray-200 bg-white px-6 flex items-center justify-between">
      <div>
        <h2 className="text-xl font-semibold text-gray-800">
          Bienvenue, {user?.firstName || user?.email?.split('@')[0] || 'Utilisateur'} !
        </h2>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <User className="h-4 w-4" />
          <span>{user?.email}</span>
          {user?.role === 'admin' && (
            <span className="ml-2 px-2 py-0.5 bg-primary-100 text-primary-700 text-xs font-medium rounded">
              Admin
            </span>
          )}
        </div>

        <button
          onClick={() => logout()}
          className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Déconnexion</span>
        </button>
      </div>
    </header>
  );
}
