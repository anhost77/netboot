'use client';

import { useEffect, useState } from 'react';
import { notificationsAPI, type Notification, type NotificationFilters } from '@/lib/api/notifications';
import { useMode } from '@/contexts/ModeContext';
import { formatDate } from '@/lib/utils';
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  Info,
  XCircle,
  Trash2,
  Check,
  CheckCheck,
  Filter,
  X,
  Download,
  Play,
  Zap,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function NotificationsPage() {
  const { mode, isSimulation } = useMode();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<NotificationFilters>({
    page: 1,
    limit: 20,
  });
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadNotifications();
    loadUnreadCount();
  }, [mode, filters]); // Recharger quand le mode change

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      const data = await notificationsAPI.getAll(filters);
      setNotifications(data.data);
      setTotalPages(data.meta.totalPages);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const data = await notificationsAPI.getUnreadCount();
      setUnreadCount(data.count);
    } catch (error) {
      console.error('Failed to load unread count:', error);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationsAPI.markAsRead(id);
      loadNotifications();
      loadUnreadCount();
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      loadNotifications();
      loadUnreadCount();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette notification ?')) {
      return;
    }
    try {
      await notificationsAPI.delete(id);
      loadNotifications();
      loadUnreadCount();
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const handleClearRead = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer toutes les notifications lues ?')) {
      return;
    }
    try {
      await notificationsAPI.clearRead();
      loadNotifications();
      loadUnreadCount();
    } catch (error) {
      console.error('Failed to clear read notifications:', error);
    }
  };

  const handleClearAll = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer toutes les notifications ?')) {
      return;
    }
    try {
      await notificationsAPI.clearAll();
      loadNotifications();
      loadUnreadCount();
    } catch (error) {
      console.error('Failed to clear all notifications:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-6 w-6 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-6 w-6 text-red-500" />;
      default:
        return <Info className="h-6 w-6 text-blue-500" />;
    }
  };

  const getNotificationBgColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const exportToCSV = () => {
    if (!notifications.length) {
      toast.error('Aucune notification à exporter');
      return;
    }
    const csv = [
      'Date,Type,Titre,Message,Statut',
      ...notifications.map(n => `${formatDate(n.createdAt)},${n.type},${n.title},"${n.message}",${n.readAt ? 'Lu' : 'Non lu'}`)
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'notifications.csv';
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Export CSV réussi');
  };

  const exportToExcel = () => {
    if (!notifications.length) {
      toast.error('Aucune notification à exporter');
      return;
    }
    const tsv = [
      'Date\tType\tTitre\tMessage\tStatut',
      ...notifications.map(n => `${formatDate(n.createdAt)}\t${n.type}\t${n.title}\t${n.message}\t${n.readAt ? 'Lu' : 'Non lu'}`)
    ].join('\n');
    const blob = new Blob([tsv], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'notifications.xls';
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Export Excel réussi');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
                <Bell className="h-6 w-6 sm:h-8 sm:w-8 mr-2 sm:mr-3 text-primary-600" />
                Notifications
                {unreadCount > 0 && (
                  <span className="ml-2 sm:ml-3 px-2 sm:px-3 py-1 bg-red-500 text-white text-xs sm:text-sm font-semibold rounded-full">
                    {unreadCount}
                  </span>
                )}
              </h1>
              {/* Indicateur de mode */}
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold ${
                isSimulation 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {isSimulation ? (
                  <>
                    <Play className="h-3 w-3" />
                    <span>Simulation</span>
                  </>
                ) : (
                  <>
                    <Zap className="h-3 w-3" />
                    <span>Réel</span>
                  </>
                )}
              </div>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-gray-600">
              Restez informé de l'activité de votre compte {isSimulation ? '(mode simulation)' : '(mode réel)'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {notifications.length > 0 && (
            <>
              <button
                onClick={exportToCSV}
                className="flex items-center space-x-1 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                title="Export CSV"
              >
                <Download className="h-4 w-4" />
                <span>CSV</span>
              </button>
              <button
                onClick={exportToExcel}
                className="flex items-center space-x-1 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                title="Export Excel"
              >
                <Download className="h-4 w-4" />
                <span>Excel</span>
              </button>
            </>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            <Filter className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Filtres</span>
          </button>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <CheckCheck className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Tout marquer comme lu</span>
              <span className="sm:hidden">Tout lire</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                value={filters.type || ''}
                onChange={(e) => setFilters({ ...filters, type: e.target.value as any || undefined, page: 1 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Tous les types</option>
                <option value="info">Info</option>
                <option value="success">Succès</option>
                <option value="warning">Avertissement</option>
                <option value="error">Erreur</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Statut
              </label>
              <select
                value={filters.read === undefined ? '' : filters.read ? 'read' : 'unread'}
                onChange={(e) => {
                  const value = e.target.value;
                  setFilters({
                    ...filters,
                    read: value === '' ? undefined : value === 'read',
                    page: 1
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Toutes</option>
                <option value="unread">Non lues</option>
                <option value="read">Lues</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => setFilters({ page: 1, limit: 20 })}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Réinitialiser
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      {notifications.length > 0 && (
        <div className="flex justify-end space-x-2">
          <button
            onClick={handleClearRead}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            Supprimer les lues
          </button>
          <button
            onClick={handleClearAll}
            className="px-4 py-2 text-sm text-red-600 hover:text-red-900 transition-colors"
          >
            Tout supprimer
          </button>
        </div>
      )}

      {/* Notifications List */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Aucune notification
          </h3>
          <p className="text-gray-600">
            Vous n'avez aucune notification pour le moment
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white rounded-lg shadow-sm border transition-all ${
                notification.readAt
                  ? 'border-gray-200 opacity-75'
                  : `border-2 ${getNotificationBgColor(notification.type)}`
              }`}
            >
              <div className="p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-base font-semibold text-gray-900">
                          {notification.title}
                          {!notification.readAt && (
                            <span className="ml-2 inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                          )}
                        </h3>
                        <p className="mt-1 text-sm text-gray-600">
                          {notification.message}
                        </p>
                        {notification.link && (
                          <a
                            href={notification.link}
                            className="mt-2 inline-block text-sm text-primary-600 hover:text-primary-700 font-medium"
                          >
                            Voir plus →
                          </a>
                        )}
                        <p className="mt-2 text-xs text-gray-500">
                          {formatDate(notification.createdAt)}
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 ml-4">
                        {!notification.readAt && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="flex items-center justify-center gap-1 px-3 py-2 text-xs sm:text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors whitespace-nowrap"
                            title="Marquer comme lu"
                          >
                            <Check className="h-4 w-4" />
                            <span className="sm:hidden">Lu</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(notification.id)}
                          className="flex items-center justify-center gap-1 px-3 py-2 text-xs sm:text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors whitespace-nowrap"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sm:hidden">Suppr</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <button
            onClick={() => setFilters({ ...filters, page: (filters.page || 1) - 1 })}
            disabled={filters.page === 1}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Précédent
          </button>
          <span className="text-sm text-gray-600">
            Page {filters.page} sur {totalPages}
          </span>
          <button
            onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}
            disabled={filters.page === totalPages}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Suivant
          </button>
        </div>
      )}
    </div>
  );
}
