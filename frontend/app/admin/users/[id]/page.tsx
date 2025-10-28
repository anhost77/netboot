'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api/client';
import { formatCurrency, formatDate } from '@/lib/utils';
import { RaceDetailsModal } from '@/components/bets/race-details-modal';
import { DetailedMetrics } from '@/components/dashboard/detailed-metrics';
import {
  ArrowLeft,
  User,
  Users,
  Mail,
  Calendar,
  Shield,
  CreditCard,
  DollarSign,
  LifeBuoy,
  MapPin,
  Phone,
  Activity,
  TrendingUp,
  Download,
  Edit,
  Ban,
  CheckCircle,
  AlertTriangle,
  Trash2,
  X,
  Filter,
  Bell,
  XCircle,
} from 'lucide-react';

interface UserDetail {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  createdAt: string;
  emailVerifiedAt: string | null;
  deletedAt: string | null;
  twoFactorEnabled: boolean;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
}

interface UserStats {
  totalBets: number;
  wonBets: number;
  lostBets: number;
  totalStake: number;
  totalProfit: number;
  winRate: number;
  roi: number;
}

interface Subscription {
  id: string;
  planId: string;
  status: string;
  billingCycle: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  plan: {
    name: string;
    priceMonthly: number;
    priceYearly: number;
  };
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  tax: number;
  total: number;
  status: string;
  createdAt: string;
  paidAt: string | null;
}

interface SupportTicket {
  id: string;
  subject: string;
  status: string;
  priority: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  messages?: {
    id: string;
    message: string;
    userId: string | null;
    createdAt: string;
    user?: {
      firstName: string;
      lastName: string;
    };
  }[];
}

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [user, setUser] = useState<UserDetail | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [tipsters, setTipsters] = useState<any[]>([]);
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [budgetData, setBudgetData] = useState<any>(null);
  const [bets, setBets] = useState<any[]>([]);
  const [detailedStats, setDetailedStats] = useState<any>(null);
  const [filteredBets, setFilteredBets] = useState<any[]>([]);
  const [selectedBet, setSelectedBet] = useState<any>(null);
  const [showBetModal, setShowBetModal] = useState(false);
  const [selectedRaceId, setSelectedRaceId] = useState<string | null>(null);
  const [selectedBetHorses, setSelectedBetHorses] = useState<string>('');
  const [showRaceModal, setShowRaceModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notificationsPage, setNotificationsPage] = useState(1);
  const [notificationsTotalPages, setNotificationsTotalPages] = useState(1);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [auditLogsPage, setAuditLogsPage] = useState(1);
  const [auditLogsTotalPages, setAuditLogsTotalPages] = useState(1);
  const [betFilters, setBetFilters] = useState({
    status: 'all',
    tipster: 'all',
    hippodrome: '',
    startDate: '',
    endDate: '',
    minStake: undefined as number | undefined,
    maxStake: undefined as number | undefined,
    minOdds: undefined as number | undefined,
    maxOdds: undefined as number | undefined,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'bets' | 'bankroll' | 'budget' | 'tipsters' | 'billing' | 'tickets' | 'notifications' | 'activity' | 'security'>('overview');
  const [selectedTipster, setSelectedTipster] = useState<any>(null);
  const [showTipsterModal, setShowTipsterModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
  });

  useEffect(() => {
    loadUserData();
  }, [userId]);

  useEffect(() => {
    if (activeTab === 'notifications') {
      loadNotifications();
    }
    if (activeTab === 'activity') {
      loadAuditLogs();
    }
  }, [activeTab, notificationsPage, auditLogsPage]);

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      const [userData, statsData, subscriptionData, invoicesData, ticketsData, tipstersData, platformsData, budgetDataRes, betsData, detailedStatsData] = await Promise.all([
        apiClient.get<UserDetail>(`/admin/users/${userId}`),
        apiClient.get<UserStats>(`/admin/users/${userId}/stats`).catch(() => null),
        apiClient.get<Subscription>(`/admin/users/${userId}/subscription`).catch(() => null),
        apiClient.get<Invoice[]>(`/admin/users/${userId}/invoices`).catch(() => []),
        apiClient.get<SupportTicket[]>(`/admin/users/${userId}/tickets`).catch(() => []),
        apiClient.get<any[]>(`/admin/users/${userId}/tipsters`).catch(() => []),
        apiClient.get<any[]>(`/admin/users/${userId}/platforms`).catch(() => []),
        apiClient.get<any>(`/admin/users/${userId}/budget`).catch(() => null),
        apiClient.get<any[]>(`/admin/users/${userId}/bets`).catch(() => []),
        apiClient.get<any>(`/admin/users/${userId}/detailed-stats`).catch(() => null),
      ]);

      setUser(userData);
      setStats(statsData);
      setSubscription(subscriptionData);
      setInvoices(invoicesData);
      setTickets(ticketsData);
      setTipsters(tipstersData);
      setPlatforms(platformsData);
      setBudgetData(budgetDataRes);
      setBets(betsData);
      setFilteredBets(betsData);
      setDetailedStats(detailedStatsData);
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadNotifications = async () => {
    try {
      const data = await apiClient.get<any>(`/admin/users/${userId}/notifications?page=${notificationsPage}&limit=20`);
      setNotifications(data.data);
      setNotificationsTotalPages(data.meta.totalPages);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const loadAuditLogs = async () => {
    try {
      const data = await apiClient.get<any>(`/admin/users/${userId}/audit-logs?page=${auditLogsPage}&limit=20`);
      setAuditLogs(data.data);
      setAuditLogsTotalPages(data.meta.totalPages);
    } catch (error) {
      console.error('Failed to load audit logs:', error);
    }
  };

  // Filter bets
  useEffect(() => {
    let filtered = [...bets];

    // Filter by status
    if (betFilters.status !== 'all') {
      filtered = filtered.filter(bet => bet.status === betFilters.status);
    }

    // Filter by tipster
    if (betFilters.tipster !== 'all') {
      filtered = filtered.filter(bet => bet.tipsterId === betFilters.tipster);
    }

    // Filter by hippodrome
    if (betFilters.hippodrome) {
      filtered = filtered.filter(bet => 
        bet.hippodrome?.toLowerCase().includes(betFilters.hippodrome.toLowerCase())
      );
    }

    // Filter by date range
    if (betFilters.startDate) {
      filtered = filtered.filter(bet => new Date(bet.date) >= new Date(betFilters.startDate));
    }
    if (betFilters.endDate) {
      filtered = filtered.filter(bet => new Date(bet.date) <= new Date(betFilters.endDate));
    }

    // Filter by stake range
    if (betFilters.minStake !== undefined) {
      filtered = filtered.filter(bet => Number(bet.stake) >= betFilters.minStake!);
    }
    if (betFilters.maxStake !== undefined) {
      filtered = filtered.filter(bet => Number(bet.stake) <= betFilters.maxStake!);
    }

    // Filter by odds range
    if (betFilters.minOdds !== undefined) {
      filtered = filtered.filter(bet => bet.odds && Number(bet.odds) >= betFilters.minOdds!);
    }
    if (betFilters.maxOdds !== undefined) {
      filtered = filtered.filter(bet => bet.odds && Number(bet.odds) <= betFilters.maxOdds!);
    }

    setFilteredBets(filtered);
  }, [betFilters, bets]);

  const handleViewRaceResults = (bet: any) => {
    if (!bet.pmuRaceId) {
      alert('Aucune course PMU associée à ce pari');
      return;
    }

    setSelectedRaceId(bet.pmuRaceId);
    setSelectedBetHorses(bet.horsesSelected || '');
    setShowRaceModal(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Utilisateur non trouvé</p>
        <Link href="/admin/users" className="text-primary-600 hover:text-primary-700 mt-4 inline-block">
          Retour à la liste
        </Link>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      trial: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-orange-100 text-orange-800',
      expired: 'bg-red-100 text-red-800',
      paid: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
      new: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityBadge = (priority: string) => {
    const styles = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800',
    };
    return styles[priority as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const handleEditUser = () => {
    if (user) {
      setEditForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        postalCode: user.postalCode || '',
        country: user.country || '',
      });
      setShowEditModal(true);
    }
  };

  const handleSaveEdit = async () => {
    try {
      await apiClient.patch(`/admin/users/${userId}`, editForm);
      setShowEditModal(false);
      loadUserData();
      alert('Utilisateur modifié avec succès');
    } catch (error: any) {
      console.error('Failed to update user:', error);
      alert(error.response?.data?.message || 'Erreur lors de la modification');
    }
  };

  const handleSuspendUser = async () => {
    if (!confirm(`Êtes-vous sûr de vouloir suspendre ${user?.firstName} ${user?.lastName} ?`)) {
      return;
    }

    try {
      await apiClient.patch(`/admin/users/${userId}/suspend`);
      loadUserData();
      alert('Utilisateur suspendu avec succès');
    } catch (error: any) {
      console.error('Failed to suspend user:', error);
      alert(error.response?.data?.message || 'Erreur lors de la suspension');
    }
  };

  const handleResetPassword = async () => {
    if (!confirm(`Envoyer un email de réinitialisation de mot de passe à ${user?.email} ?`)) {
      return;
    }

    try {
      await apiClient.post(`/admin/users/${userId}/reset-password`);
      alert('Email de réinitialisation envoyé avec succès');
    } catch (error: any) {
      console.error('Failed to reset password:', error);
      alert(error.response?.data?.message || 'Erreur lors de l\'envoi de l\'email');
    }
  };

  const handleDisable2FA = async () => {
    if (!confirm(`Désactiver l'authentification à deux facteurs pour ${user?.firstName} ${user?.lastName} ?`)) {
      return;
    }

    try {
      await apiClient.post(`/admin/users/${userId}/disable-2fa`);
      loadUserData();
      alert('2FA désactivé avec succès');
    } catch (error: any) {
      console.error('Failed to disable 2FA:', error);
      alert(error.response?.data?.message || 'Erreur lors de la désactivation du 2FA');
    }
  };

  const handleExportUserData = async () => {
    try {
      const response = await apiClient.get(`/admin/users/${userId}/export-data`);
      const dataStr = JSON.stringify(response, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `user-data-${userId}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      alert('Données exportées avec succès (RGPD)');
    } catch (error: any) {
      console.error('Failed to export data:', error);
      alert(error.response?.data?.message || 'Erreur lors de l\'export des données');
    }
  };

  const handleDeleteUserData = async () => {
    if (!confirm(`⚠️ ATTENTION : Supprimer définitivement toutes les données de ${user?.firstName} ${user?.lastName} ?\n\nCette action est IRRÉVERSIBLE et conforme au RGPD (droit à l'oubli).`)) {
      return;
    }

    const confirmText = prompt('Tapez "SUPPRIMER" pour confirmer la suppression définitive :');
    if (confirmText !== 'SUPPRIMER') {
      alert('Suppression annulée');
      return;
    }

    try {
      await apiClient.delete(`/admin/users/${userId}/gdpr-delete`);
      alert('Données supprimées définitivement');
      router.push('/admin/users');
    } catch (error: any) {
      console.error('Failed to delete user data:', error);
      alert(error.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const handleDownloadInvoice = (invoice: Invoice) => {
    // Générer le contenu de la facture
    const content = `
╔════════════════════════════════════════════════════════════╗
║                    FACTURE / INVOICE                       ║
╚════════════════════════════════════════════════════════════╝

Numéro de facture : ${invoice.invoiceNumber}
Date : ${formatDate(invoice.createdAt)}
Statut : ${invoice.status === 'paid' ? 'Payée' : invoice.status === 'pending' ? 'En attente' : invoice.status === 'refunded' ? 'Remboursée' : 'Échouée'}
${invoice.paidAt ? `Date de paiement : ${formatDate(invoice.paidAt)}` : ''}

────────────────────────────────────────────────────────────

CLIENT

${user?.firstName} ${user?.lastName}
${user?.email}
${user?.address ? `${user.address}\n${user.postalCode} ${user.city}\n${user.country}` : ''}

────────────────────────────────────────────────────────────

DÉTAILS DE LA FACTURE

Description : Abonnement BetTracker Pro
${subscription ? `Plan : ${subscription.plan.name}` : ''}
${subscription ? `Cycle : ${subscription.billingCycle === 'monthly' ? 'Mensuel' : 'Annuel'}` : ''}

────────────────────────────────────────────────────────────

MONTANT

Montant HT : ${formatCurrency(invoice.amount)}
TVA (20%) : ${formatCurrency(invoice.tax)}
TOTAL TTC : ${formatCurrency(invoice.total)}

────────────────────────────────────────────────────────────

BetTracker Pro
Application de suivi de paris hippiques
https://bettracker.pro

Merci pour votre confiance !

────────────────────────────────────────────────────────────
`;

    // Créer un blob et télécharger
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `facture-${invoice.invoiceNumber}-${new Date(invoice.createdAt).toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/admin/users"
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-gray-900">
                {user.firstName} {user.lastName}
              </h1>
              {user.deletedAt && (
                <span className="px-3 py-1 bg-red-100 text-red-800 text-sm font-semibold rounded-full">
                  ⚠️ Compte suspendu
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600">{user.email}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={handleEditUser}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Edit className="h-4 w-4 mr-2" />
            Modifier
          </button>
          <button 
            onClick={handleSuspendUser}
            className="flex items-center px-4 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50"
          >
            <Ban className="h-4 w-4 mr-2" />
            Suspendre
          </button>
        </div>
      </div>

      {/* User Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Profile Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
              <User className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Rôle</p>
              <p className="text-lg font-semibold text-gray-900 capitalize">{user.role}</p>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center text-gray-600">
              <Calendar className="h-4 w-4 mr-2" />
              Inscrit le {formatDate(user.createdAt)}
            </div>
            <div className="flex items-center">
              {user.emailVerifiedAt ? (
                <span className="flex items-center text-green-600">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Email vérifié
                </span>
              ) : (
                <span className="flex items-center text-yellow-600">
                  <Mail className="h-4 w-4 mr-2" />
                  Email non vérifié
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center space-x-3 mb-2">
                <Activity className="h-6 w-6 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-500">Paris</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalBets}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                {stats.wonBets} gagnés • {stats.lostBets} perdus
              </p>
              <p className="text-sm font-semibold text-green-600 mt-1">
                {stats.winRate.toFixed(1)}% de réussite
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center space-x-3 mb-2">
                <DollarSign className="h-6 w-6 text-green-600" />
                <div>
                  <p className="text-sm text-gray-500">Mises totales</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(stats.totalStake)}
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Profit: {formatCurrency(stats.totalProfit)}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center space-x-3 mb-2">
                <TrendingUp className="h-6 w-6 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-500">ROI</p>
                  <p className={`text-2xl font-bold ${stats.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stats.roi >= 0 ? '+' : ''}{stats.roi.toFixed(2)}%
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Return on Investment
              </p>
            </div>
          </>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Vue d'ensemble
            </button>
            <button
              onClick={() => setActiveTab('bets')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'bets'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Paris
            </button>
            <button
              onClick={() => setActiveTab('bankroll')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'bankroll'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Bankroll
            </button>
            <button
              onClick={() => setActiveTab('budget')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'budget'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Budget
            </button>
            <button
              onClick={() => setActiveTab('tipsters')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'tipsters'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Tipsters
            </button>
            <button
              onClick={() => setActiveTab('billing')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'billing'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Facturation
            </button>
            <button
              onClick={() => setActiveTab('tickets')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'tickets'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Support ({tickets.length})
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'notifications'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Notifications ({notifications.length})
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'activity'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Activité ({auditLogs.length})
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'security'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Sécurité & RGPD
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Detailed Metrics */}
              {detailedStats && (
                <DetailedMetrics
                  totalBets={detailedStats.totalBets || 0}
                  averageOdds={detailedStats.averageOdds || 0}
                  totalStake={detailedStats.totalStake || 0}
                  pendingStake={detailedStats.pendingStake || 0}
                  averageStake={detailedStats.averageStake || 0}
                  initialBankroll={detailedStats.initialBankroll || 0}
                  bankrollOperations={detailedStats.bankrollOperations || 0}
                  currentBankroll={detailedStats.currentBankroll || 0}
                  roc={detailedStats.roc || 0}
                  roi={detailedStats.roi || 0}
                />
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact Info */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Informations de contact</h3>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <Mail className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="text-sm font-medium text-gray-900">{user.email}</p>
                      </div>
                    </div>
                    {user.phone && (
                      <div className="flex items-start">
                        <Phone className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Téléphone</p>
                          <p className="text-sm font-medium text-gray-900">{user.phone}</p>
                        </div>
                      </div>
                    )}
                    {user.address && (
                      <div className="flex items-start">
                        <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Adresse</p>
                          <p className="text-sm font-medium text-gray-900">
                            {user.address}<br />
                            {user.postalCode} {user.city}<br />
                            {user.country}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Account Info */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Informations du compte</h3>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <Shield className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Rôle</p>
                        <p className="text-sm font-medium text-gray-900 capitalize">{user.role}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Calendar className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Date d'inscription</p>
                        <p className="text-sm font-medium text-gray-900">{formatDate(user.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Email vérifié</p>
                        <p className="text-sm font-medium text-gray-900">
                          {user.emailVerifiedAt ? formatDate(user.emailVerifiedAt) : 'Non vérifié'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bets Tab */}
          {activeTab === 'bets' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  ✅ <strong>RGPD Conforme</strong> - L'admin peut consulter les données pour le support et la gestion du service (Art. 6 - Intérêt légitime)
                </p>
              </div>

              {bets.length > 0 ? (
                <>
                  {/* Filters */}
                  <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => setShowFilters(!showFilters)}
                          className={`flex items-center space-x-2 px-4 py-2 border rounded-md transition-colors ${
                            showFilters ? 'bg-primary-50 border-primary-600 text-primary-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <Filter className="h-4 w-4" />
                          <span>Filtres {showFilters ? '▼' : '▶'}</span>
                        </button>
                        <div className="flex items-center space-x-2">
                          <label className="text-sm font-medium text-gray-700">Statut:</label>
                          <select
                            value={betFilters.status}
                            onChange={(e) => setBetFilters({...betFilters, status: e.target.value})}
                            className="px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                          >
                            <option value="all">Tous</option>
                            <option value="won">Gagnés</option>
                            <option value="lost">Perdus</option>
                            <option value="pending">En cours</option>
                          </select>
                        </div>
                        <div className="flex items-center space-x-2">
                          <label className="text-sm font-medium text-gray-700">Tipster:</label>
                          <select
                            value={betFilters.tipster}
                            onChange={(e) => setBetFilters({...betFilters, tipster: e.target.value})}
                            className="px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                          >
                            <option value="all">Tous</option>
                            {tipsters.map(t => (
                              <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Extended Filters */}
                    {showFilters && (
                      <div className="pt-4 border-t border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Hippodrome</label>
                            <input
                              type="text"
                              placeholder="Ex: Vincennes, Longchamp..."
                              value={betFilters.hippodrome}
                              onChange={(e) => setBetFilters({...betFilters, hippodrome: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date début</label>
                            <input
                              type="date"
                              value={betFilters.startDate}
                              onChange={(e) => setBetFilters({...betFilters, startDate: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date fin</label>
                            <input
                              type="date"
                              value={betFilters.endDate}
                              onChange={(e) => setBetFilters({...betFilters, endDate: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mise min (€)</label>
                            <input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              value={betFilters.minStake || ''}
                              onChange={(e) => setBetFilters({...betFilters, minStake: e.target.value ? parseFloat(e.target.value) : undefined})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mise max (€)</label>
                            <input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              value={betFilters.maxStake || ''}
                              onChange={(e) => setBetFilters({...betFilters, maxStake: e.target.value ? parseFloat(e.target.value) : undefined})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Cote min</label>
                            <input
                              type="number"
                              step="0.1"
                              placeholder="1.0"
                              value={betFilters.minOdds || ''}
                              onChange={(e) => setBetFilters({...betFilters, minOdds: e.target.value ? parseFloat(e.target.value) : undefined})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Cote max</label>
                            <input
                              type="number"
                              step="0.1"
                              placeholder="100.0"
                              value={betFilters.maxOdds || ''}
                              onChange={(e) => setBetFilters({...betFilters, maxOdds: e.target.value ? parseFloat(e.target.value) : undefined})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                          </div>
                          <div className="flex items-end">
                            <button
                              onClick={() => setBetFilters({
                                status: 'all',
                                tipster: 'all',
                                hippodrome: '',
                                startDate: '',
                                endDate: '',
                                minStake: undefined,
                                maxStake: undefined,
                                minOdds: undefined,
                                maxOdds: undefined,
                              })}
                              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                            >
                              Réinitialiser
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Stats Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <div className="text-sm text-gray-600 mb-1">Total Paris</div>
                      <div className="text-2xl font-bold text-gray-900">{filteredBets.length}</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <div className="text-sm text-gray-600 mb-1">Gagnés</div>
                      <div className="text-2xl font-bold text-green-600">
                        {filteredBets.filter(b => b.status === 'won').length}
                      </div>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                      <div className="text-sm text-gray-600 mb-1">Perdus</div>
                      <div className="text-2xl font-bold text-red-600">
                        {filteredBets.filter(b => b.status === 'lost').length}
                      </div>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                      <div className="text-sm text-gray-600 mb-1">En cours</div>
                      <div className="text-2xl font-bold text-yellow-600">
                        {filteredBets.filter(b => b.status === 'pending').length}
                      </div>
                    </div>
                  </div>

                  {/* Bets Table */}
                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Chevaux</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tipster</th>
                            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Cote</th>
                            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Mise</th>
                            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Profit</th>
                            <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">Statut</th>
                            <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredBets.map((bet) => (
                            <tr key={bet.id} className="hover:bg-gray-50">
                              <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                                <div>{new Date(bet.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}</div>
                                {bet.time && <div className="text-xs text-gray-500">{bet.time}</div>}
                              </td>
                              <td className="px-3 py-2 text-xs text-gray-900">
                                <div className="font-medium cursor-pointer text-primary-600 hover:text-primary-800"
                                     onClick={() => handleViewRaceResults(bet)}>
                                  {bet.hippodrome || 'N/A'}
                                </div>
                                <div className="text-xs text-gray-500">R{bet.raceNumber || '?'}</div>
                              </td>
                              <td className="px-3 py-2 text-xs text-gray-900 max-w-[120px]">
                                <div className="font-medium truncate">{bet.horsesSelected || 'N/A'}</div>
                                {bet.winningHorse && (
                                  <div className="text-xs text-green-600 truncate">✓ {bet.winningHorse}</div>
                                )}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-xs">
                                <span className="px-2 py-0.5 bg-gray-100 text-gray-800 rounded text-xs">
                                  {bet.betType || 'N/A'}
                                </span>
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 max-w-[100px] truncate">
                                {bet.tipster?.name || '-'}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-xs text-right font-semibold text-gray-900">
                                {bet.odds ? Number(bet.odds).toFixed(2) : '-'}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-xs text-right text-gray-900">
                                {Number(bet.stake || 0).toFixed(0)}€
                              </td>
                              <td className={`px-3 py-2 whitespace-nowrap text-xs text-right font-bold ${
                                (bet.profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {(bet.profit || 0) >= 0 ? '+' : ''}{Number(bet.profit || 0).toFixed(0)}€
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-center">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                  bet.status === 'won' ? 'bg-green-100 text-green-800' :
                                  bet.status === 'lost' ? 'bg-red-100 text-red-800' :
                                  bet.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {bet.status === 'won' ? 'G' :
                                   bet.status === 'lost' ? 'P' :
                                   bet.status === 'pending' ? 'EC' : '?'}
                                </span>
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-center">
                                <button
                                  onClick={() => {
                                    setSelectedBet(bet);
                                    setShowBetModal(true);
                                  }}
                                  className="text-primary-600 hover:text-primary-900 text-xs font-medium"
                                >
                                  Détails
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <Activity className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun pari</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Cet utilisateur n'a pas encore placé de paris.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Bankroll Tab */}
          {activeTab === 'bankroll' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  ✅ <strong>RGPD Conforme</strong> - Consultation pour support technique et gestion de compte (Art. 6 - Intérêt légitime)
                </p>
              </div>

              {platforms.length > 0 ? (
                <>
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-600">Bankroll Totale</h3>
                        <DollarSign className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="text-3xl font-bold text-gray-900">
                        {formatCurrency(platforms.reduce((sum, p) => sum + Number(p.currentBankroll || 0), 0))}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {platforms.length} plateforme{platforms.length > 1 ? 's' : ''}
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-600">Bankroll Initiale</h3>
                        <TrendingUp className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="text-3xl font-bold text-gray-900">
                        {formatCurrency(platforms.reduce((sum, p) => sum + Number(p.initialBankroll || 0), 0))}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Total de départ</p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-600">Évolution</h3>
                        <Activity className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className={`text-3xl font-bold ${
                        platforms.reduce((sum, p) => sum + (Number(p.currentBankroll || 0) - Number(p.initialBankroll || 0)), 0) >= 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}>
                        {platforms.reduce((sum, p) => sum + (Number(p.currentBankroll || 0) - Number(p.initialBankroll || 0)), 0) >= 0 ? '+' : ''}
                        {formatCurrency(platforms.reduce((sum, p) => sum + (Number(p.currentBankroll || 0) - Number(p.initialBankroll || 0)), 0))}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Profit/Perte total</p>
                    </div>
                  </div>

                  {/* Platforms List */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Plateformes</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {platforms.map((platform) => {
                        const evolution = Number(platform.currentBankroll || 0) - Number(platform.initialBankroll || 0);
                        const evolutionPercent = platform.initialBankroll > 0
                          ? (evolution / Number(platform.initialBankroll)) * 100
                          : 0;
                        const isProfit = evolution >= 0;

                        return (
                          <div
                            key={platform.id}
                            className={`bg-white rounded-lg shadow-md overflow-hidden border-2 ${
                              isProfit ? 'border-green-200' : 'border-red-200'
                            }`}
                          >
                            {/* Header */}
                            <div className={`p-4 ${isProfit ? 'bg-green-50' : 'bg-red-50'}`}>
                              <div className="flex items-center justify-between">
                                <h4 className="text-lg font-bold text-gray-900">{platform.name}</h4>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  platform.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {platform.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                              {platform.url && (
                                <a
                                  href={platform.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-primary-600 hover:underline mt-1 block"
                                >
                                  {platform.url}
                                </a>
                              )}
                            </div>

                            {/* Stats */}
                            <div className="p-4 space-y-4">
                              <div className="grid grid-cols-2 gap-3">
                                <div className="bg-gray-50 rounded p-3">
                                  <div className="text-xs text-gray-500 mb-1">Bankroll Initiale</div>
                                  <div className="text-lg font-bold text-gray-900">
                                    {formatCurrency(platform.initialBankroll || 0)}
                                  </div>
                                </div>
                                <div className="bg-gray-50 rounded p-3">
                                  <div className="text-xs text-gray-500 mb-1">Bankroll Actuelle</div>
                                  <div className="text-lg font-bold text-gray-900">
                                    {formatCurrency(platform.currentBankroll || 0)}
                                  </div>
                                </div>
                              </div>

                              <div className="pt-3 border-t border-gray-200">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-sm text-gray-600">Évolution</span>
                                  <span className={`text-lg font-bold ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                                    {isProfit ? '+' : ''}{formatCurrency(evolution)}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-gray-600">Pourcentage</span>
                                  <span className={`text-lg font-bold ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                                    {isProfit ? '+' : ''}{evolutionPercent.toFixed(2)}%
                                  </span>
                                </div>
                              </div>

                              {platform.description && (
                                <div className="pt-3 border-t border-gray-200">
                                  <p className="text-xs text-gray-600">{platform.description}</p>
                                </div>
                              )}
                            </div>

                            {/* Footer */}
                            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                              <div className="text-xs text-gray-500">
                                Créée le {formatDate(platform.createdAt)}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune plateforme</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Cet utilisateur n'a pas encore configuré de plateforme de paris.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Budget Tab */}
          {activeTab === 'budget' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  ✅ <strong>RGPD Conforme</strong> - Consultation pour support technique et gestion de compte (Art. 6 - Intérêt légitime)
                </p>
              </div>

              {budgetData ? (
                <>
                  {/* Overview Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-600">Bankroll Initiale</h3>
                        <DollarSign className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="text-3xl font-bold text-gray-900">
                        {formatCurrency(budgetData.overview?.initialBankroll || 0)}
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-600">Bankroll Actuelle</h3>
                        <TrendingUp className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="text-3xl font-bold text-gray-900">
                        {formatCurrency(budgetData.overview?.currentBankroll || 0)}
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-600">ROI Calculé</h3>
                        <Activity className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className={`text-3xl font-bold ${
                        (budgetData.overview?.calculatedROI || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {(budgetData.overview?.calculatedROI || 0) >= 0 ? '+' : ''}
                        {(budgetData.overview?.calculatedROI || 0).toFixed(2)}%
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6 border border-orange-200">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-600">Taux de réussite</h3>
                        <CheckCircle className="h-5 w-5 text-orange-600" />
                      </div>
                      <div className="text-3xl font-bold text-gray-900">
                        {(budgetData.overview?.winRate || 0).toFixed(1)}%
                      </div>
                    </div>
                  </div>

                  {/* Monthly History */}
                  {budgetData.monthlyHistory && budgetData.monthlyHistory.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Historique mensuel</h3>
                      <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mois</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Paris</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Gagnés</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Taux</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Mise</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Profit</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">ROI</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {budgetData.monthlyHistory.map((month: any, index: number) => (
                                <tr key={index} className="hover:bg-gray-50">
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {month.month}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                                    {month.betsCount}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600 font-semibold">
                                    {month.wonBets}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold">
                                    {month.winRate || '0.0'}%
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                                    {formatCurrency(month.totalStake)}
                                  </td>
                                  <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-semibold ${
                                    month.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'
                                  }`}>
                                    {month.totalProfit >= 0 ? '+' : ''}{formatCurrency(month.totalProfit)}
                                  </td>
                                  <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-bold ${
                                    (month.roi || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                                  }`}>
                                    {(month.roi || 0) >= 0 ? '+' : ''}{month.roi || '0.0'}%
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune donnée budget</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Les données de budget ne sont pas encore disponibles pour cet utilisateur.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Tipsters Tab */}
          {activeTab === 'tipsters' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  ✅ <strong>RGPD Conforme</strong> - Données nécessaires pour la gestion du service (Art. 6 - Intérêt légitime)
                </p>
              </div>

              {tipsters.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tipsters.map((tipster) => {
                    const winRate = tipster.totalBets > 0 ? (tipster.wonBets / tipster.totalBets) * 100 : 0;
                    const roi = tipster.totalStake > 0 ? (tipster.totalProfit / tipster.totalStake) * 100 : 0;
                    const isProfit = tipster.totalProfit >= 0;

                    return (
                      <div
                        key={tipster.id}
                        className={`bg-white rounded-lg shadow-md overflow-hidden border-2 ${
                          isProfit ? 'border-green-200' : 'border-red-200'
                        }`}
                      >
                        {/* Header */}
                        <div className={`p-4 ${isProfit ? 'bg-green-50' : 'bg-red-50'}`}>
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-bold text-gray-900">{tipster.name}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              tipster.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {tipster.isActive ? 'Actif' : 'Inactif'}
                            </span>
                          </div>
                          {tipster.website && (
                            <a
                              href={tipster.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary-600 hover:underline"
                            >
                              {tipster.website}
                            </a>
                          )}
                        </div>

                        {/* Stats */}
                        <div className="p-4 space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-gray-50 rounded p-2">
                              <div className="text-xs text-gray-500">Paris</div>
                              <div className="text-lg font-bold text-gray-900">{tipster.totalBets || 0}</div>
                            </div>
                            <div className="bg-gray-50 rounded p-2">
                              <div className="text-xs text-gray-500">Gagnés</div>
                              <div className="text-lg font-bold text-green-600">{tipster.wonBets || 0}</div>
                            </div>
                            <div className="bg-gray-50 rounded p-2">
                              <div className="text-xs text-gray-500">Taux réussite</div>
                              <div className="text-lg font-bold text-gray-900">{winRate.toFixed(1)}%</div>
                            </div>
                            <div className="bg-gray-50 rounded p-2">
                              <div className="text-xs text-gray-500">ROI</div>
                              <div className={`text-lg font-bold ${roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {roi >= 0 ? '+' : ''}{roi.toFixed(1)}%
                              </div>
                            </div>
                          </div>

                          <div className="pt-3 border-t border-gray-200">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-600">Mise totale</span>
                              <span className="font-semibold">{formatCurrency(tipster.totalStake || 0)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Profit</span>
                              <span className={`font-bold ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                                {isProfit ? '+' : ''}{formatCurrency(tipster.totalProfit || 0)}
                              </span>
                            </div>
                          </div>

                          {tipster.description && (
                            <div className="pt-3 border-t border-gray-200">
                              <p className="text-xs text-gray-600 line-clamp-2">{tipster.description}</p>
                            </div>
                          )}
                        </div>

                        {/* Footer */}
                        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                            <span>Créé le {formatDate(tipster.createdAt)}</span>
                            {tipster.lastBetDate && (
                              <span>Dernier pari: {formatDate(tipster.lastBetDate)}</span>
                            )}
                          </div>
                          <button
                            onClick={() => {
                              setSelectedTipster(tipster);
                              setShowTipsterModal(true);
                            }}
                            className="w-full px-3 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm font-medium"
                          >
                            Voir détails
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <Users className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun tipster</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Cet utilisateur ne suit aucun tipster pour le moment.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Billing Tab (Subscription + Invoices) */}
          {activeTab === 'billing' && (
            <div>
              {subscription ? (
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-900">{subscription.plan.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(subscription.status)}`}>
                        {subscription.status === 'active' ? 'Actif' :
                         subscription.status === 'trial' ? 'Essai' :
                         subscription.status === 'cancelled' ? 'Annulé' : subscription.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Prix</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {formatCurrency(subscription.billingCycle === 'monthly' ? subscription.plan.priceMonthly : subscription.plan.priceYearly)}
                          <span className="text-sm font-normal text-gray-600">
                            /{subscription.billingCycle === 'monthly' ? 'mois' : 'an'}
                          </span>
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Prochain renouvellement</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {formatDate(subscription.currentPeriodEnd)}
                        </p>
                      </div>
                    </div>
                    {subscription.cancelAtPeriodEnd && (
                      <div className="mt-4 p-3 bg-orange-100 rounded-md">
                        <p className="text-sm text-orange-800">
                          ⚠️ Abonnement annulé - Expire le {formatDate(subscription.currentPeriodEnd)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun abonnement</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Cet utilisateur n'a pas d'abonnement actif.
                  </p>
                </div>
              )}

              {/* Invoices Section */}
              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Historique des factures</h3>
              {invoices.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">N° Facture</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant HT</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">TVA</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total TTC</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {invoices.map((invoice) => (
                        <tr key={invoice.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                            {invoice.invoiceNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(invoice.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(invoice.amount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(invoice.tax)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {formatCurrency(invoice.total)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(invoice.status)}`}>
                              {invoice.status === 'paid' ? 'Payée' :
                               invoice.status === 'pending' ? 'En attente' : 
                               invoice.status === 'refunded' ? 'Remboursée' : 'Échouée'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                            <button 
                              onClick={() => handleDownloadInvoice(invoice)}
                              className="text-primary-600 hover:text-primary-900"
                              title="Télécharger la facture"
                            >
                              <Download className="h-4 w-4 inline" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune facture</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Aucune facture n'a été générée pour cet utilisateur.
                  </p>
                </div>
              )}
              </div>
            </div>
          )}

          {/* Tickets Tab */}
          {activeTab === 'tickets' && (
            <div>
              {tickets.length > 0 ? (
                <div className="space-y-4">
                  {tickets.map((ticket) => (
                    <div key={ticket.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900">{ticket.subject}</h4>
                          <div className="mt-2 flex items-center space-x-4">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(ticket.status)}`}>
                              {ticket.status === 'new' ? 'Nouveau' :
                               ticket.status === 'in_progress' ? 'En cours' :
                               ticket.status === 'resolved' ? 'Résolu' : 'Fermé'}
                            </span>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityBadge(ticket.priority)}`}>
                              {ticket.priority === 'low' ? 'Basse' :
                               ticket.priority === 'medium' ? 'Moyenne' :
                               ticket.priority === 'high' ? 'Haute' : 'Urgente'}
                            </span>
                            <span className="text-xs text-gray-500">
                              Créé le {formatDate(ticket.createdAt)}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedTicket(ticket);
                            setShowTicketModal(true);
                          }}
                          className="ml-4 text-primary-600 hover:text-primary-900 text-sm font-medium"
                        >
                          Voir →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <LifeBuoy className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun ticket</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Cet utilisateur n'a pas de ticket de support.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  ✅ <strong>RGPD Conforme</strong> - Consultation des notifications pour support technique et traçabilité (Art. 6 - Intérêt légitime)
                </p>
              </div>

              {notifications.length > 0 ? (
                <div className="space-y-4">
                  {notifications.map((notification) => {
                    const getTypeIcon = (type: string) => {
                      switch (type) {
                        case 'success':
                          return <CheckCircle className="h-5 w-5 text-green-600" />;
                        case 'error':
                          return <XCircle className="h-5 w-5 text-red-600" />;
                        case 'warning':
                          return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
                        default:
                          return <Bell className="h-5 w-5 text-blue-600" />;
                      }
                    };

                    const getTypeBadge = (type: string) => {
                      switch (type) {
                        case 'success':
                          return 'bg-green-100 text-green-800';
                        case 'error':
                          return 'bg-red-100 text-red-800';
                        case 'warning':
                          return 'bg-yellow-100 text-yellow-800';
                        default:
                          return 'bg-blue-100 text-blue-800';
                      }
                    };

                    return (
                      <div
                        key={notification.id}
                        className={`border rounded-lg p-4 ${
                          notification.readAt ? 'bg-white border-gray-200' : 'bg-blue-50 border-blue-300'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-1">
                            {getTypeIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-sm font-semibold text-gray-900">{notification.title}</h4>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeBadge(notification.type)}`}>
                                {notification.type}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 mb-3">{notification.message}</p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                {formatDate(notification.createdAt)}
                              </span>
                              {notification.readAt && (
                                <span className="flex items-center text-green-600">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Lu le {formatDate(notification.readAt)}
                                </span>
                              )}
                              {!notification.readAt && (
                                <span className="flex items-center text-blue-600 font-medium">
                                  <Bell className="h-3 w-3 mr-1" />
                                  Non lu
                                </span>
                              )}
                            </div>
                            {notification.link && (
                              <div className="mt-2">
                                <span className="text-xs text-gray-500">Lien: {notification.link}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Pagination */}
                  {notificationsTotalPages > 1 && (
                    <div className="flex items-center justify-between border-t pt-4">
                      <button
                        onClick={() => setNotificationsPage(p => Math.max(1, p - 1))}
                        disabled={notificationsPage === 1}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Précédent
                      </button>
                      <span className="text-sm text-gray-700">
                        Page {notificationsPage} sur {notificationsTotalPages}
                      </span>
                      <button
                        onClick={() => setNotificationsPage(p => Math.min(notificationsTotalPages, p + 1))}
                        disabled={notificationsPage === notificationsTotalPages}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Suivant
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Bell className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune notification</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Cet utilisateur n'a pas encore de notifications.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  ✅ <strong>RGPD Conforme</strong> - Traçabilité complète des actions pour sécurité et support (Art. 6 - Intérêt légitime)
                </p>
              </div>

              {auditLogs.length > 0 ? (
                <div className="space-y-3">
                  {auditLogs.map((log) => {
                    const getActionLabel = (action: string) => {
                      const labels: Record<string, string> = {
                        'REGISTER': '📝 Inscription',
                        'LOGIN': '🔐 Connexion',
                        'LOGOUT': '🚪 Déconnexion',
                        'BET_CREATE': '🎰 Création de pari',
                        'BET_UPDATE': '✏️ Modification de pari',
                        'BET_STATUS_UPDATE': '🔄 Changement statut pari',
                        'BET_DELETE': '🗑️ Suppression de pari',
                        'UPDATE_USER_ROLE': '👤 Changement de rôle',
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

                    return (
                      <div
                        key={log.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getActionColor(log.action)}`}>
                                {getActionLabel(log.action)}
                              </span>
                              <span className="text-xs text-gray-500">
                                {log.entityType} #{log.entityId?.substring(0, 8)}
                              </span>
                            </div>
                            
                            {log.changes && Object.keys(log.changes).length > 0 && (
                              <div className="mt-2 p-3 bg-gray-50 rounded text-xs">
                                <p className="font-semibold text-gray-700 mb-1">Détails :</p>
                                <pre className="text-gray-600 whitespace-pre-wrap">
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
                    );
                  })}

                  {/* Pagination */}
                  {auditLogsTotalPages > 1 && (
                    <div className="flex items-center justify-between border-t pt-4">
                      <button
                        onClick={() => setAuditLogsPage(p => Math.max(1, p - 1))}
                        disabled={auditLogsPage === 1}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Précédent
                      </button>
                      <span className="text-sm text-gray-700">
                        Page {auditLogsPage} sur {auditLogsTotalPages}
                      </span>
                      <button
                        onClick={() => setAuditLogsPage(p => Math.min(auditLogsTotalPages, p + 1))}
                        disabled={auditLogsPage === auditLogsTotalPages}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Suivant
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Activity className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune activité</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Aucune action n'a encore été enregistrée pour cet utilisateur.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Security & RGPD Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              {/* Security Settings */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-primary-600" />
                  Paramètres de sécurité
                </h3>
                <div className="space-y-4">
                  {/* Email Verification */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">Email vérifié</p>
                        <p className="text-sm text-gray-500">
                          {user.emailVerifiedAt ? `Vérifié le ${formatDate(user.emailVerifiedAt)}` : 'Email non vérifié'}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      user.emailVerifiedAt ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {user.emailVerifiedAt ? 'Vérifié' : 'Non vérifié'}
                    </span>
                  </div>

                  {/* 2FA Status */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Shield className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">Authentification à deux facteurs (2FA)</p>
                        <p className="text-sm text-gray-500">
                          {user.twoFactorEnabled ? 'Activée' : 'Désactivée'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        user.twoFactorEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.twoFactorEnabled ? 'Activée' : 'Désactivée'}
                      </span>
                      {user.twoFactorEnabled && (
                        <button
                          onClick={handleDisable2FA}
                          className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                        >
                          Désactiver
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Password Reset */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Shield className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">Mot de passe</p>
                        <p className="text-sm text-gray-500">
                          Envoyer un email de réinitialisation
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleResetPassword}
                      className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm"
                    >
                      Réinitialiser
                    </button>
                  </div>
                </div>
              </div>

              {/* RGPD Actions */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
                  Actions RGPD
                </h3>
                <div className="space-y-4">
                  {/* Export Data */}
                  <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Download className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900">Exporter les données</p>
                        <p className="text-sm text-gray-600">
                          Télécharger toutes les données de l'utilisateur (RGPD Art. 20)
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleExportUserData}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                    >
                      Exporter (JSON)
                    </button>
                  </div>

                  {/* Delete Data */}
                  <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Trash2 className="h-5 w-5 text-red-600" />
                      <div>
                        <p className="font-medium text-gray-900">Supprimer définitivement</p>
                        <p className="text-sm text-gray-600">
                          Suppression irréversible de toutes les données (RGPD Art. 17 - Droit à l'oubli)
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleDeleteUserData}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>

              {/* Account Status */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Statut du compte</h3>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Créé le</p>
                      <p className="font-medium text-gray-900">{formatDate(user.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Statut</p>
                      <p className="font-medium text-gray-900">
                        {user.deletedAt ? (
                          <span className="text-red-600">Suspendu</span>
                        ) : (
                          <span className="text-green-600">Actif</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Race Results Modal */}
      {showRaceModal && selectedRaceId && (
        <RaceDetailsModal
          raceId={selectedRaceId}
          selectedHorses={selectedBetHorses}
          onClose={() => {
            setShowRaceModal(false);
            setSelectedRaceId(null);
            setSelectedBetHorses('');
          }}
        />
      )}

      {/* Bet Details Modal */}
      {showBetModal && selectedBet && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-primary-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Détails du pari</h3>
                  <p className="text-sm text-gray-600 mt-1">{formatDate(selectedBet.date)}</p>
                </div>
                <button
                  onClick={() => setShowBetModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Course Info */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Informations de la course</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded p-3">
                    <div className="text-xs text-gray-500 mb-1">Hippodrome</div>
                    <div className="font-medium text-gray-900">{selectedBet.hippodrome || 'N/A'}</div>
                  </div>
                  <div className="bg-gray-50 rounded p-3">
                    <div className="text-xs text-gray-500 mb-1">Numéro de course</div>
                    <div className="font-medium text-gray-900">{selectedBet.raceNumber || 'N/A'}</div>
                  </div>
                  <div className="bg-gray-50 rounded p-3">
                    <div className="text-xs text-gray-500 mb-1">Heure</div>
                    <div className="font-medium text-gray-900">{selectedBet.time || 'N/A'}</div>
                  </div>
                  <div className="bg-gray-50 rounded p-3">
                    <div className="text-xs text-gray-500 mb-1">Plateforme</div>
                    <div className="font-medium text-gray-900">{selectedBet.platform || 'N/A'}</div>
                  </div>
                </div>
              </div>

              {/* Bet Details */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Détails du pari</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded p-3">
                    <div className="text-xs text-gray-500 mb-1">Type de pari</div>
                    <div className="font-medium text-gray-900">{selectedBet.betType || 'N/A'}</div>
                  </div>
                  <div className="bg-gray-50 rounded p-3">
                    <div className="text-xs text-gray-500 mb-1">Chevaux sélectionnés</div>
                    <div className="font-medium text-gray-900">{selectedBet.horsesSelected || 'N/A'}</div>
                  </div>
                  {selectedBet.winningHorse && (
                    <div className="bg-green-50 rounded p-3">
                      <div className="text-xs text-gray-500 mb-1">Cheval gagnant</div>
                      <div className="font-medium text-green-900">{selectedBet.winningHorse}</div>
                    </div>
                  )}
                  {selectedBet.tipster && (
                    <div className="bg-blue-50 rounded p-3">
                      <div className="text-xs text-gray-500 mb-1">Tipster</div>
                      <div className="font-medium text-blue-900">{selectedBet.tipster.name}</div>
                    </div>
                  )}
                  {selectedBet.jockey && (
                    <div className="bg-gray-50 rounded p-3">
                      <div className="text-xs text-gray-500 mb-1">Jockey</div>
                      <div className="font-medium text-gray-900">{selectedBet.jockey}</div>
                    </div>
                  )}
                  {selectedBet.trainer && (
                    <div className="bg-gray-50 rounded p-3">
                      <div className="text-xs text-gray-500 mb-1">Entraîneur</div>
                      <div className="font-medium text-gray-900">{selectedBet.trainer}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Financial Info */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Informations financières</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded p-3">
                    <div className="text-xs text-gray-500 mb-1">Cote</div>
                    <div className="text-xl font-bold text-gray-900">
                      {selectedBet.odds ? Number(selectedBet.odds).toFixed(2) : 'N/A'}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded p-3">
                    <div className="text-xs text-gray-500 mb-1">Mise</div>
                    <div className="text-xl font-bold text-gray-900">
                      {formatCurrency(selectedBet.stake || 0)}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded p-3">
                    <div className="text-xs text-gray-500 mb-1">Gain potentiel / Réel</div>
                    <div className="text-xl font-bold text-gray-900">
                      {selectedBet.payout ? formatCurrency(selectedBet.payout) : 'N/A'}
                    </div>
                  </div>
                  <div className={`rounded p-3 ${
                    (selectedBet.profit || 0) >= 0 ? 'bg-green-50' : 'bg-red-50'
                  }`}>
                    <div className="text-xs text-gray-500 mb-1">Profit/Perte</div>
                    <div className={`text-xl font-bold ${
                      (selectedBet.profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {(selectedBet.profit || 0) >= 0 ? '+' : ''}{formatCurrency(selectedBet.profit || 0)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Statut</h4>
                <div className="flex items-center space-x-4">
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    selectedBet.status === 'won' ? 'bg-green-100 text-green-800' :
                    selectedBet.status === 'lost' ? 'bg-red-100 text-red-800' :
                    selectedBet.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedBet.status === 'won' ? '✓ Gagné' :
                     selectedBet.status === 'lost' ? '✗ Perdu' :
                     selectedBet.status === 'pending' ? '⏳ En cours' : selectedBet.status}
                  </span>
                </div>
              </div>

              {/* Notes */}
              {selectedBet.notes && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Notes</h4>
                  <div className="bg-gray-50 rounded p-4">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedBet.notes}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gray-50 px-6 py-4 flex justify-end rounded-b-lg">
              <button
                onClick={() => setShowBetModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tipster Details Modal */}
      {showTipsterModal && selectedTipster && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-primary-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Statistiques - {selectedTipster.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">Analyse détaillée des performances</p>
                </div>
                <button
                  onClick={() => setShowTipsterModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Paris totaux</div>
                  <div className="text-3xl font-bold text-gray-900">{selectedTipster.totalBets || 0}</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Paris gagnés</div>
                  <div className="text-3xl font-bold text-green-600">{selectedTipster.wonBets || 0}</div>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Paris perdus</div>
                  <div className="text-3xl font-bold text-red-600">
                    {(selectedTipster.totalBets || 0) - (selectedTipster.wonBets || 0)}
                  </div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">En cours</div>
                  <div className="text-3xl font-bold text-yellow-600">0</div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="text-sm text-gray-600 mb-2">Taux de réussite</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {selectedTipster.totalBets > 0 
                      ? ((selectedTipster.wonBets / selectedTipster.totalBets) * 100).toFixed(1)
                      : '0.0'}%
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="text-sm text-gray-600 mb-2">ROI</div>
                  <div className={`text-2xl font-bold ${
                    selectedTipster.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {selectedTipster.totalStake > 0
                      ? `${selectedTipster.totalProfit >= 0 ? '+' : ''}${((selectedTipster.totalProfit / selectedTipster.totalStake) * 100).toFixed(2)}%`
                      : '+0.00%'}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="text-sm text-gray-600 mb-2">Profit total</div>
                  <div className={`text-2xl font-bold ${
                    selectedTipster.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {selectedTipster.totalProfit >= 0 ? '+' : ''}{formatCurrency(selectedTipster.totalProfit || 0)}
                  </div>
                </div>
              </div>

              {/* Detailed Summary Table */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Récapitulatif détaillé</h4>
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Métrique</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Valeur</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 text-sm text-gray-900">Paris totaux</td>
                        <td className="px-6 py-4 text-sm text-right font-semibold">{selectedTipster.totalBets || 0}</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 text-sm text-gray-900">Paris gagnés</td>
                        <td className="px-6 py-4 text-sm text-right font-semibold text-green-600">{selectedTipster.wonBets || 0}</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 text-sm text-gray-900">Paris perdus</td>
                        <td className="px-6 py-4 text-sm text-right font-semibold text-red-600">
                          {(selectedTipster.totalBets || 0) - (selectedTipster.wonBets || 0)}
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 text-sm text-gray-900">Paris en cours</td>
                        <td className="px-6 py-4 text-sm text-right font-semibold">0</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">Mise totale</td>
                        <td className="px-6 py-4 text-sm text-right font-bold">{formatCurrency(selectedTipster.totalStake || 0)}</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 text-sm text-gray-900">Mise en cours</td>
                        <td className="px-6 py-4 text-sm text-right font-semibold">0,00 €</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 text-sm text-gray-900">Gains totaux</td>
                        <td className="px-6 py-4 text-sm text-right font-semibold text-green-600">
                          {formatCurrency((selectedTipster.totalStake || 0) + (selectedTipster.totalProfit || 0))}
                        </td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">Bénéfices/Pertes</td>
                        <td className={`px-6 py-4 text-sm text-right font-bold ${
                          selectedTipster.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {selectedTipster.totalProfit >= 0 ? '+' : ''}{formatCurrency(selectedTipster.totalProfit || 0)}
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 text-sm text-gray-900">ROI</td>
                        <td className={`px-6 py-4 text-sm text-right font-bold ${
                          selectedTipster.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {selectedTipster.totalStake > 0
                            ? `${selectedTipster.totalProfit >= 0 ? '+' : ''}${((selectedTipster.totalProfit / selectedTipster.totalStake) * 100).toFixed(2)}%`
                            : '+0.00%'}
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 text-sm text-gray-900">Taux de réussite</td>
                        <td className="px-6 py-4 text-sm text-right font-bold">
                          {selectedTipster.totalBets > 0 
                            ? ((selectedTipster.wonBets / selectedTipster.totalBets) * 100).toFixed(1)
                            : '0.0'}%
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Summary Footer */}
              <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg p-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Mise totale</div>
                    <div className="text-xl font-bold text-gray-900">{formatCurrency(selectedTipster.totalStake || 0)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Gains totaux</div>
                    <div className="text-xl font-bold text-green-600">
                      {formatCurrency((selectedTipster.totalStake || 0) + (selectedTipster.totalProfit || 0))}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Résultat</div>
                    <div className={`text-xl font-bold ${
                      selectedTipster.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {selectedTipster.totalProfit >= 0 ? '+' : ''}{formatCurrency(selectedTipster.totalProfit || 0)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 flex justify-end rounded-b-lg">
              <button
                onClick={() => setShowTipsterModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Modifier l'utilisateur
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prénom
                  </label>
                  <input
                    type="text"
                    value={editForm.firstName}
                    onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom
                  </label>
                  <input
                    type="text"
                    value={editForm.lastName}
                    onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse
                </label>
                <input
                  type="text"
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Code postal
                  </label>
                  <input
                    type="text"
                    value={editForm.postalCode}
                    onChange={(e) => setEditForm({ ...editForm, postalCode: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ville
                  </label>
                  <input
                    type="text"
                    value={editForm.city}
                    onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pays
                  </label>
                  <input
                    type="text"
                    value={editForm.country}
                    onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-3 flex justify-end space-x-3 rounded-b-lg">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-primary-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-primary-700"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ticket Detail Modal */}
      {showTicketModal && selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedTicket.subject}</h2>
                  <div className="flex items-center space-x-3 mt-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(selectedTicket.status)}`}>
                      {selectedTicket.status === 'new' ? 'Nouveau' :
                       selectedTicket.status === 'in_progress' ? 'En cours' :
                       selectedTicket.status === 'waiting_customer' ? 'En attente client' :
                       selectedTicket.status === 'resolved' ? 'Résolu' : 'Fermé'}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityBadge(selectedTicket.priority)}`}>
                      {selectedTicket.priority === 'low' ? 'Basse' :
                       selectedTicket.priority === 'normal' ? 'Normale' :
                       selectedTicket.priority === 'high' ? 'Haute' : 'Urgente'}
                    </span>
                    <span className="text-xs text-white/80">
                      Catégorie: {selectedTicket.category}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowTicketModal(false)}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                {/* Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Créé le:</span>
                      <span className="ml-2 font-medium">{formatDate(selectedTicket.createdAt)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Mis à jour:</span>
                      <span className="ml-2 font-medium">{formatDate(selectedTicket.updatedAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversation</h3>
                  {selectedTicket.messages && selectedTicket.messages.length > 0 ? (
                    <div className="space-y-4">
                      {selectedTicket.messages.map((msg) => {
                        const isAdminMessage = msg.userId !== userId;
                        return (
                          <div
                            key={msg.id}
                            className={`rounded-lg p-4 ${
                              isAdminMessage ? 'bg-green-50 ml-8' : 'bg-blue-50 mr-8'
                            }`}
                          >
                            <div className="flex items-center mb-2">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold ${
                                isAdminMessage ? 'bg-green-600' : 'bg-blue-600'
                              }`}>
                                {isAdminMessage ? 'A' : 'U'}
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-semibold text-gray-900">
                                  {isAdminMessage
                                    ? `${msg.user?.firstName || 'Admin'} ${msg.user?.lastName || ''} (Admin)`
                                    : `${user?.firstName} ${user?.lastName}`}
                                </p>
                                <p className="text-xs text-gray-500">{formatDate(msg.createdAt)}</p>
                              </div>
                            </div>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{msg.message}</p>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <p className="text-gray-500">Aucun message</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-t">
              <Link
                href="/admin/support"
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                Aller à la page Support →
              </Link>
              <button
                onClick={() => setShowTicketModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
