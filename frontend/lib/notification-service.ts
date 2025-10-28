/**
 * Service de notifications côté client
 * Affiche des toasts pour les actions utilisateur
 */

export type ToastType = 'info' | 'success' | 'warning' | 'error';

interface ToastOptions {
  type: ToastType;
  title: string;
  message: string;
  duration?: number;
}

class NotificationService {
  private toasts: Map<string, HTMLDivElement> = new Map();
  private container: HTMLDivElement | null = null;

  /**
   * Crée ou récupère le conteneur de toasts
   */
  private getContainer(): HTMLDivElement {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      this.container.className = 'fixed top-4 right-4 z-[9999] space-y-2 pointer-events-none';
      document.body.appendChild(this.container);
    }
    return this.container;
  }

  /**
   * Affiche une notification toast
   */
  show({ type, title, message, duration = 5000 }: ToastOptions) {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const toast = this.createToast(id, type, title, message);
    
    const container = this.getContainer();
    container.appendChild(toast);
    this.toasts.set(id, toast);

    // Animation d'entrée
    setTimeout(() => {
      toast.classList.remove('translate-x-full');
      toast.classList.add('translate-x-0');
    }, 10);

    // Auto-suppression
    if (duration > 0) {
      setTimeout(() => this.remove(id), duration);
    }

    return id;
  }

  /**
   * Supprime une notification
   */
  remove(id: string) {
    const toast = this.toasts.get(id);
    if (toast) {
      toast.classList.remove('translate-x-0');
      toast.classList.add('translate-x-full');
      setTimeout(() => {
        toast.remove();
        this.toasts.delete(id);
      }, 300);
    }
  }

  /**
   * Crée l'élément DOM du toast
   */
  private createToast(id: string, type: ToastType, title: string, message: string): HTMLDivElement {
    const toast = document.createElement('div');
    toast.id = id;
    toast.className = `max-w-md w-full bg-white rounded-lg shadow-lg border-l-4 p-4 transform translate-x-full transition-transform duration-300 pointer-events-auto ${this.getBorderColor(type)}`;

    const icon = this.getIcon(type);
    const iconColor = this.getIconColor(type);

    toast.innerHTML = `
      <div class="flex items-start">
        <div class="flex-shrink-0">
          ${icon}
        </div>
        <div class="ml-3 flex-1">
          <h3 class="text-sm font-semibold text-gray-900">${title}</h3>
          <p class="mt-1 text-sm text-gray-600">${message}</p>
        </div>
        <button 
          onclick="document.getElementById('${id}').remove()"
          class="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    `;

    return toast;
  }

  private getBorderColor(type: ToastType): string {
    switch (type) {
      case 'success': return 'border-green-500';
      case 'warning': return 'border-yellow-500';
      case 'error': return 'border-red-500';
      default: return 'border-blue-500';
    }
  }

  private getIconColor(type: ToastType): string {
    switch (type) {
      case 'success': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'error': return 'text-red-500';
      default: return 'text-blue-500';
    }
  }

  private getIcon(type: ToastType): string {
    const color = this.getIconColor(type);
    switch (type) {
      case 'success':
        return `<svg class="h-6 w-6 ${color}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>`;
      case 'warning':
        return `<svg class="h-6 w-6 ${color}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>`;
      case 'error':
        return `<svg class="h-6 w-6 ${color}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>`;
      default:
        return `<svg class="h-6 w-6 ${color}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>`;
    }
  }

  // Méthodes de raccourci
  success(title: string, message: string) {
    return this.show({ type: 'success', title, message });
  }

  error(title: string, message: string) {
    return this.show({ type: 'error', title, message });
  }

  warning(title: string, message: string) {
    return this.show({ type: 'warning', title, message });
  }

  info(title: string, message: string) {
    return this.show({ type: 'info', title, message });
  }
}

// Instance singleton
export const notificationService = new NotificationService();
