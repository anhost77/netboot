'use client';

import { useState, useEffect } from 'react';
import { adminAuditLogsAPI, type AuditLog, type AuditLogStats, type ActivityTimeline } from '@/lib/api/admin-audit-logs';
import {
  Activity,
  Calendar,
  Filter,
  Download,
  User,
  Shield,
  TrendingUp,
  Clock,
  BarChart3,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<AuditLogStats | null>(null);
  const [timeline, setTimeline] = useState<ActivityTimeline[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    action: '',
    entityType: '',
    adminId: '',
    startDate: '',
    endDate: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [timeRange, setTimeRange] = useState(7); // days

  useEffect(() => {
    loadData();
  }, [page, filters, timeRange]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [logsData, statsData, timelineData] = await Promise.all([
        adminAuditLogsAPI.getAuditLogs({
          page,
          limit: 20,
          ...filters,
        }),
        adminAuditLogsAPI.getStats(filters.startDate, filters.endDate),
        adminAuditLogsAPI.getTimeline(timeRange),
      ]);

      setLogs(logsData.data);
      setTotalPages(logsData.meta.totalPages);
      setStats(statsData);
      setTimeline(timelineData);
    } catch (error) {
      console.error('Failed to load audit logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      'REGISTER': '📝 Inscription',
      'LOGIN': '🔐 Connexion',
      'LOGOUT': '🚪 Déconnexion',
      'BET_CREATE': '🎰 Création pari',
      'BET_UPDATE': '✏️ Modification pari',
      'BET_STATUS_UPDATE': '🔄 Statut pari',
      'BET_DELETE': '🗑️ Suppression pari',
      'UPDATE_USER_ROLE': '👤 Changement rôle',
      'DELETE_USER': '❌ Suppression utilisateur',
      'UPDATE_USER': '✏️ Modification profil',
      'SUSPEND_USER': '🚫 Suspension',
      'RESET_USER_PASSWORD': '🔑 Reset mot de passe',
      'DISABLE_USER_2FA': '🔓 Désactivation 2FA',
      'GDPR_DELETE_USER': '🗑️ Suppression GDPR',
      'RESPOND_TICKET': '💬 Réponse ticket',
      'UPDATE_TICKET_STATUS': '🎫 Statut ticket',
    };
    return labels[action] || action;
  };

  const getActionColor = (action: string) => {
    if (action.includes('DELETE') || action.includes('SUSPEND')) return 'bg-red-100 text-red-800 border-red-200';
    if (action.includes('CREATE') || action.includes('REGISTER')) return 'bg-green-100 text-green-800 border-green-200';
    if (action.includes('UPDATE') || action.includes('MODIFY')) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (action.includes('LOGIN')) return 'bg-blue-100 text-blue-800 border-blue-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'moderator': return 'bg-purple-100 text-purple-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Utilisateur', 'Action', 'Type', 'IP', 'User Agent'];
    const rows = logs.map(log => [
      new Date(log.createdAt).toLocaleString(),
      `${log.admin.firstName} ${log.admin.lastName} (${log.admin.email})`,
      log.action,
      log.entityType,
      log.ipAddress || 'N/A',
      log.userAgent || 'N/A',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString()}.csv`;
    a.click();
  };

  if (isLoading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Journal d'Audit</h1>
        <p className="text-gray-600">Visualisez toutes les actions effectuées sur la plateforme</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Actions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalLogs.toLocaleString()}</p>
              </div>
              <Activity className="h-10 w-10 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Dernières 24h</p>
                <p className="text-2xl font-bold text-green-600">{stats.recentActivity24h}</p>
              </div>
              <Clock className="h-10 w-10 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Utilisateurs Actifs</p>
                <p className="text-2xl font-bold text-purple-600">{stats.topUsers.length}</p>
              </div>
              <User className="h-10 w-10 text-purple-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Types d'Actions</p>
                <p className="text-2xl font-bold text-orange-600">{stats.actionDistribution.length}</p>
              </div>
              <BarChart3 className="h-10 w-10 text-orange-600" />
            </div>
          </div>
        </div>
      )}

      {/* Charts Section */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Activity Timeline */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Activité sur {timeRange} jours</h3>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(parseInt(e.target.value))}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value={7}>7 jours</option>
                <option value={14}>14 jours</option>
                <option value={30}>30 jours</option>
              </select>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={timeline}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Activity by Hour */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Activité par Heure (24h)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats.activityByHour}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Actions Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribution des Actions</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={stats.actionDistribution}
                  dataKey="count"
                  nameKey="action"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {stats.actionDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Top Users */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Utilisateurs les Plus Actifs</h3>
            <div className="space-y-3">
              {stats.topUsers.slice(0, 5).map((user, index) => (
                <div key={user.userId} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-primary-100 text-primary-600 rounded-full font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                      {user.role}
                    </span>
                    <span className="text-sm font-bold text-gray-900">{user.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filters and Actions */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Filtres</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="h-4 w-4" />
              <span>{showFilters ? 'Masquer' : 'Afficher'} Filtres</span>
            </button>
            <button
              onClick={exportToCSV}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Exporter CSV</span>
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
              <select
                value={filters.action}
                onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Toutes les actions</option>
                <option value="LOGIN">Connexion</option>
                <option value="LOGOUT">Déconnexion</option>
                <option value="BET_CREATE">Création pari</option>
                <option value="BET_UPDATE">Modification pari</option>
                <option value="BET_DELETE">Suppression pari</option>
                <option value="UPDATE_USER">Modification utilisateur</option>
                <option value="DELETE_USER">Suppression utilisateur</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type d'Entité</label>
              <select
                value={filters.entityType}
                onChange={(e) => setFilters({ ...filters, entityType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Tous les types</option>
                <option value="User">Utilisateur</option>
                <option value="Bet">Pari</option>
                <option value="SupportTicket">Ticket Support</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date de Début</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date de Fin</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="md:col-span-2 flex items-end space-x-2">
              <button
                onClick={() => {
                  setFilters({ action: '', entityType: '', adminId: '', startDate: '', endDate: '' });
                  setPage(1);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Réinitialiser
              </button>
              <button
                onClick={() => {
                  setPage(1);
                  loadData();
                }}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
              >
                Appliquer
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Logs List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Historique des Actions</h3>
        </div>

        <div className="divide-y">
          {logs.map((log) => (
            <div key={log.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getActionColor(log.action)}`}>
                      {getActionLabel(log.action)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {log.entityType} {log.entityId && `#${log.entityId.substring(0, 8)}`}
                    </span>
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span className="font-medium">{log.admin.firstName} {log.admin.lastName}</span>
                      <span className="text-gray-400">({log.admin.email})</span>
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getRoleBadgeColor(log.admin.role)}`}>
                        {log.admin.role}
                      </span>
                    </div>
                  </div>

                  {log.changes && Object.keys(log.changes).length > 0 && (
                    <div className="mt-2 p-3 bg-gray-50 rounded text-xs">
                      <p className="font-semibold text-gray-700 mb-1">Détails :</p>
                      <pre className="text-gray-600 whitespace-pre-wrap overflow-x-auto">
                        {JSON.stringify(log.changes, null, 2)}
                      </pre>
                    </div>
                  )}

                  <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(log.createdAt)}
                    </span>
                    {log.ipAddress && (
                      <span className="flex items-center font-mono bg-gray-100 px-2 py-1 rounded">
                        🌐 {log.ipAddress}
                      </span>
                    )}
                    {log.userAgent && (
                      <span className="flex items-center text-gray-400 truncate max-w-md" title={log.userAgent}>
                        💻 {log.userAgent.substring(0, 50)}...
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-6 border-t flex items-center justify-between">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Précédent
            </button>
            <span className="text-sm text-gray-700">
              Page {page} sur {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Suivant
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
