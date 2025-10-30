'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { AuthModal } from '@/components/modals/AuthModal';

interface AuthModalContextType {
  openLoginModal: () => void;
  openRegisterModal: () => void;
  closeModal: () => void;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'login' | 'register'>('login');

  const openLoginModal = () => {
    setMode('login');
    setIsOpen(true);
  };

  const openRegisterModal = () => {
    setMode('register');
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  const switchMode = (newMode: 'login' | 'register') => {
    setMode(newMode);
  };

  return (
    <AuthModalContext.Provider value={{ openLoginModal, openRegisterModal, closeModal }}>
      {children}
      <AuthModal
        isOpen={isOpen}
        onClose={closeModal}
        mode={mode}
        onSwitchMode={switchMode}
      />
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const context = useContext(AuthModalContext);
  if (context === undefined) {
    throw new Error('useAuthModal must be used within an AuthModalProvider');
  }
  return context;
}
