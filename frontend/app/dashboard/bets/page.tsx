'use client';

import { useEffect, useState } from 'react';
import { betsAPI, type BetsFilters } from '@/lib/api/bets';
import { subscriptionsAPI, type Subscription } from '@/lib/api/subscriptions';
import { budgetAPI } from '@/lib/api/budget';
import { notificationService } from '@/lib/notification-service';
import { pmuStatsAPI } from '@/lib/api/pmu-stats';
import { platformsAPI, type Platform } from '@/lib/api/platforms';
import { tipstersAPI, type Tipster } from '@/lib/api/tipsters';
import type { Bet, PaginatedResponse, CreateBetData, BudgetOverview } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { formatLocalDate } from '@/lib/date-utils';
import { BetForm } from '@/components/bets/bet-form';
import { BetDetails } from '@/components/bets/bet-details';
import { RaceDetailsModal } from '@/components/bets/race-details-modal';
import {
  Plus,
  Filter,
  Download,
  Search,
  Edit,
  Trash2,
  Eye,
  TrendingUp,
  TrendingDown,
  Wallet,
  Target,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  BarChart3,
  Crown,
  Trophy,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

// Helper function to get bet type label in French
const getBetTypeLabel = (betType: string | null | undefined) => {
  if (!betType) return '-';
  const labels: Record<string, string> = {
    gagnant: 'Gagnant',
    place: 'Placé',
    gagnant_place: 'G-P',
    couple: 'Couplé',
    couple_ordre: 'C. Ordre',
    trio: 'Trio',
    trio_ordre: 'T. Ordre',
    tierce: 'Tiercé',
    tierce_ordre: 'Tiercé O.',
    quarte: 'Quarté',
    quarte_ordre: 'Q. Ordre',
    quinte: 'Quinté',
    quinte_ordre: 'Q+Ordre',
    multi: 'Multi',
    pick5: 'Pick 5',
    autre: 'Autre',
  };
  return labels[betType] || betType;
};

export default function BetsPage() {
  const [bets, setBets] = useState<PaginatedResponse<Bet> | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [currentMonthBetsCount, setCurrentMonthBetsCount] = useState<number>(0);
  const [budgetOverview, setBudgetOverview] = useState<BudgetOverview | null>(null);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [tipsters, setTipsters] = useState<Tipster[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<BetsFilters>({
    page: 1,
    limit: 10,
    sortBy: 'date',
    sortOrder: 'desc',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedBet, setSelectedBet] = useState<Bet | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLimitWarning, setShowLimitWarning] = useState(false);
  const [showBudgetExceededModal, setShowBudgetExceededModal] = useState(false);
  const [budgetExceededMessage, setBudgetExceededMessage] = useState<string>('');
  const [showWinModal, setShowWinModal] = useState(false);
  const [betToUpdate, setBetToUpdate] = useState<Bet | null>(null);
  const [finalOdds, setFinalOdds] = useState<string>('');
  const [showRaceDetailsModal, setShowRaceDetailsModal] = useState(false);
  const [loadingOdds, setLoadingOdds] = useState(false);
  const [selectedRaceId, setSelectedRaceId] = useState<string | null>(null);
  const [selectedBetHorses, setSelectedBetHorses] = useState<string>('');

  // Load bets, subscription, budget, platforms and tipsters
  useEffect(() => {
    loadBets();
    loadSubscription();
    loadCurrentMonthBetsCount();
    loadBudgetOverview();
    loadPlatforms();
    loadTipsters();
  }, [filters]);

  const loadPlatforms = async () => {
    try {
      const data = await platformsAPI.getAll();
      setPlatforms(data);
    } catch (error) {
      console.error('Failed to load platforms:', error);
    }
  };

  const loadTipsters = async () => {
    try {
      const data = await tipstersAPI.getAll();
      setTipsters(data);
    } catch (error) {
      console.error('Failed to load tipsters:', error);
    }
  };

  // Helper function to get platform name by ID
  const getPlatformName = (platformId: string | null | undefined): string => {
    if (!platformId) return '-';
    const platform = platforms.find(p => p.id === platformId);
    return platform?.name || platformId;
  };

  const loadSubscription = async () => {
    try {
      const data = await subscriptionsAPI.getCurrentSubscription();
      setSubscription(data);
    } catch (error) {
      console.error('Failed to load subscription:', error);
    }
  };

  const loadBudgetOverview = async () => {
    try {
      const data = await budgetAPI.getOverview();
      setBudgetOverview(data);
    } catch (error) {
      console.error('Failed to load budget overview:', error);
    }
  };

  const loadCurrentMonthBetsCount = async () => {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      // Format dates as YYYY-MM-DD using local time
      const startDate = formatLocalDate(startOfMonth);
      const endDate = formatLocalDate(endOfMonth);
      
      // Get all bets for current month (without pagination)
      const data = await betsAPI.list({
        startDate,
        endDate,
        limit: 1000, // Large number to get all bets
      });
      
      setCurrentMonthBetsCount(data.meta.total);
    } catch (error) {
      console.error('Failed to load current month bets count:', error);
    }
  };

  const loadBets = async () => {
    try {
      setIsLoading(true);
      const data = await betsAPI.list(filters);
      setBets(data);
    } catch (error) {
      console.error('Failed to load bets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user can add more bets
  const canAddBet = () => {
    if (!subscription || !subscription.plan.maxBetsPerMonth) {
      return true; // Unlimited
    }
    
    return currentMonthBetsCount < subscription.plan.maxBetsPerMonth;
  };

  // Check if bet would exceed budget limits
  const checkBudgetLimits = (stakeAmount: number): { exceeded: boolean; message: string } => {
    if (!budgetOverview) {
      return { exceeded: false, message: '' };
    }

    const { daily, weekly, monthly } = budgetOverview;

    // Check daily limit
    if (daily.limit && daily.remaining !== null && stakeAmount > daily.remaining) {
      return {
        exceeded: true,
        message: `Cette mise de ${formatCurrency(stakeAmount)} dépasserait votre limite journalière. Reste disponible aujourd'hui : ${formatCurrency(daily.remaining)}`
      };
    }

    // Check weekly limit
    if (weekly.limit && weekly.remaining !== null && stakeAmount > weekly.remaining) {
      return {
        exceeded: true,
        message: `Cette mise de ${formatCurrency(stakeAmount)} dépasserait votre limite hebdomadaire. Reste disponible cette semaine : ${formatCurrency(weekly.remaining)}`
      };
    }

    // Check monthly limit
    if (monthly.limit && monthly.remaining !== null && stakeAmount > monthly.remaining) {
      return {
        exceeded: true,
        message: `Cette mise de ${formatCurrency(stakeAmount)} dépasserait votre limite mensuelle. Reste disponible ce mois : ${formatCurrency(monthly.remaining)}`
      };
    }

    return { exceeded: false, message: '' };
  };

  const handleNewBetClick = () => {
    if (!canAddBet()) {
      setShowLimitWarning(true);
      return;
    }
    setShowAddModal(true);
  };

  const handleSubmit = async (data: CreateBetData) => {
    try {
      setIsSubmitting(true);

      // Check budget limits only for new bets (not updates)
      if (!selectedBet) {
        const budgetCheck = checkBudgetLimits(data.stake);
        if (budgetCheck.exceeded) {
          setBudgetExceededMessage(budgetCheck.message);
          setShowBudgetExceededModal(true);
          setIsSubmitting(false);
          notificationService.warning(
            'Limite de budget atteinte ⚠️',
            budgetCheck.message
          );
          return;
        }
      }

      if (selectedBet) {
        await betsAPI.update(selectedBet.id, data);
        notificationService.success(
          'Pari modifié !',
          'Votre pari a été mis à jour avec succès'
        );
      } else {
        await betsAPI.create(data);
        notificationService.success(
          'Pari créé !',
          `Pari de ${formatCurrency(data.stake)} enregistré avec succès`
        );
      }
      setShowAddModal(false);
      setSelectedBet(null);
      loadBets();
      loadCurrentMonthBetsCount(); // Reload count after adding/updating
      loadBudgetOverview(); // Reload budget after adding/updating
    } catch (error: any) {
      console.error('Failed to save bet:', error);

      // Extract detailed error message
      let errorMessage = 'Erreur lors de la sauvegarde du pari';

      if (error.response?.data?.message) {
        if (Array.isArray(error.response.data.message)) {
          errorMessage = error.response.data.message.join('\n');
        } else {
          errorMessage = error.response.data.message;
        }
      }

      notificationService.error(
        'Erreur',
        errorMessage
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce pari ?')) return;

    try {
      await betsAPI.delete(id);
      loadBets();
      loadCurrentMonthBetsCount(); // Reload count after deleting
      loadBudgetOverview();
      notificationService.success(
        'Pari supprimé',
        'Le pari a été supprimé avec succès'
      );
    } catch (error) {
      console.error('Failed to delete bet:', error);
      notificationService.error(
        'Erreur',
        'Erreur lors de la suppression du pari'
      );
    }
  };

  const loadPmuOdds = async (bet?: Bet) => {
    const targetBet = bet || betToUpdate;
    if (!targetBet || !targetBet.pmuRaceId) {
      return;
    }

    try {
      setLoadingOdds(true);
      
      const data = await pmuStatsAPI.getOddsForBet(
        targetBet.pmuRaceId,
        targetBet.betType || 'gagnant',
        targetBet.horsesSelected || ''
      );
      
      if (data.odds) {
        setFinalOdds(String(data.odds));
        if (!bet) { // Ne montrer la notification que si c'est un chargement manuel
          notificationService.success(
            'Cote chargée !',
            `Cote PMU récupérée : ${data.odds.toFixed(2)}€`
          );
        }
      } else {
        if (!bet) {
          notificationService.warning(
            'Cote non disponible',
            'Les rapports PMU ne sont pas encore disponibles pour cette course'
          );
        }
      }
    } catch (error: any) {
      console.error('Error loading PMU odds:', error);
      // Ne pas afficher d'erreur si c'est un chargement automatique
      if (!bet) {
        notificationService.error(
          'Erreur',
          error.message || 'Impossible de charger les cotes PMU'
        );
      }
    } finally {
      setLoadingOdds(false);
    }
  };

  const handleQuickStatus = async (id: string, status: 'won' | 'lost') => {
    const bet = bets?.data.find(b => b.id === id);
    if (!bet) {
      notificationService.error('Erreur', 'Pari non trouvé');
      return;
    }

    if (status === 'won') {
      // Ouvrir la modal pour confirmer les cotes
      setBetToUpdate(bet);
      setFinalOdds(bet.odds ? String(bet.odds) : '');
      setShowWinModal(true);
      
      // Charger automatiquement les cotes PMU si disponible
      if (bet.pmuRaceId) {
        setTimeout(() => {
          loadPmuOdds(bet);
        }, 100);
      }
    } else {
      // Pour un pari perdu, pas besoin de modal
      try {
        await betsAPI.update(id, { 
          status: 'lost',
          payout: 0 
        });
        loadBets();
        loadCurrentMonthBetsCount();
        loadBudgetOverview();
        notificationService.error(
          'Pari perdu 😔',
          `Votre pari de ${formatCurrency(bet.stake)} a été marqué comme perdu`
        );
      } catch (error) {
        console.error('Failed to update status:', error);
        notificationService.error(
          'Erreur',
          'Erreur lors de la mise à jour du statut'
        );
      }
    }
  };

  const handleConfirmWin = async () => {
    if (!betToUpdate) return;

    const odds = parseFloat(finalOdds);
    if (isNaN(odds) || odds <= 0) {
      notificationService.warning('Cote invalide', 'Veuillez entrer une cote valide');
      return;
    }

    try {
      setIsSubmitting(true);
      const stake = Number(betToUpdate.stake);
      const payout = stake * odds;
      const profit = payout - stake;

      await betsAPI.update(betToUpdate.id, {
        status: 'won',
        odds: odds,
        payout: payout,
      });

      setShowWinModal(false);
      setBetToUpdate(null);
      setFinalOdds('');
      loadBets();
      loadCurrentMonthBetsCount();
      loadBudgetOverview();
      
      notificationService.success(
        'Pari gagné ! 🎉',
        `Félicitations ! Vous avez gagné ${formatCurrency(profit)} (cote ${odds.toFixed(2)})`
      );
    } catch (error) {
      console.error('Failed to update bet:', error);
      notificationService.error(
        'Erreur',
        'Erreur lors de la mise à jour du pari'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExport = async (format: 'csv' | 'excel') => {
    try {
      const blob = await betsAPI.export(format, filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bets-export.${format === 'csv' ? 'csv' : 'xlsx'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to export:', error);
      alert("Erreur lors de l'export");
    }
  };

  const handleEnrichPmuData = async () => {
    if (!confirm('Voulez-vous enrichir tous vos paris avec les données PMU (jockey, entraîneur) ? Cela peut prendre quelques secondes.')) {
      return;
    }

    try {
      const result = await betsAPI.enrichPmuData();
      alert(`Enrichissement terminé !\n\n${result.enrichedCount} paris enrichis sur ${result.totalBets} paris avec données PMU.\n${result.errorCount} erreurs.`);
      loadBets();
    } catch (error) {
      console.error('Failed to enrich PMU data:', error);
      alert("Erreur lors de l'enrichissement des données PMU");
    }
  };

  // Calculate summary statistics
  const stats = {
    total: bets?.meta.total || 0,
    pending: bets?.data.filter((b) => b.status === 'pending').length || 0,
    won: bets?.data.filter((b) => b.status === 'won').length || 0,
    lost: bets?.data.filter((b) => b.status === 'lost').length || 0,
    totalStake: bets?.data.reduce((sum, b) => sum + Number(b.stake), 0) || 0,
    totalProfit: bets?.data.reduce((sum, b) => sum + Number(b.profit || 0), 0) || 0,
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      won: 'bg-green-100 text-green-800',
      lost: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800',
    };
    const labels = {
      pending: 'En cours',
      won: 'Gagné',
      lost: 'Perdu',
      refunded: 'Remboursé',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Paris</h1>
          <p className="mt-2 text-gray-600">Gérez tous vos paris hippiques</p>
        </div>
        <div className="flex space-x-3">
          <a
            href="/dashboard/bets/statistics"
            className="flex items-center space-x-2 bg-white border-2 border-primary-600 text-primary-600 px-4 py-2 rounded-md hover:bg-primary-50 transition-colors"
          >
            <BarChart3 className="h-5 w-5" />
            <span>Statistiques</span>
          </a>
          <button
            onClick={handleNewBetClick}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Nouveau pari</span>
          </button>
        </div>
      </div>

      {/* Subscription Limit Warning Banner */}
      {subscription && subscription.plan.maxBetsPerMonth && (
        <div className={`rounded-lg p-4 ${
          canAddBet() 
            ? 'bg-blue-50 border border-blue-200' 
            : 'bg-orange-50 border border-orange-200'
        }`}>
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {canAddBet() ? (
                <Crown className="h-5 w-5 text-blue-400" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-orange-400" />
              )}
            </div>
            <div className="ml-3 flex-1">
              <h3 className={`text-sm font-medium ${
                canAddBet() ? 'text-blue-800' : 'text-orange-800'
              }`}>
                Plan {subscription.plan.name}
              </h3>
              <div className={`mt-2 text-sm ${
                canAddBet() ? 'text-blue-700' : 'text-orange-700'
              }`}>
                <p>
                  Vous avez utilisé{' '}
                  <strong>{currentMonthBetsCount}</strong>{' '}
                  sur <strong>{subscription.plan.maxBetsPerMonth}</strong> paris ce mois.
                  {!canAddBet() && (
                    <span className="block mt-1">
                      Passez à un plan supérieur pour ajouter plus de paris.
                    </span>
                  )}
                </p>
              </div>
              {!canAddBet() && (
                <div className="mt-3">
                  <a
                    href="/dashboard/subscription"
                    className="text-sm font-medium text-orange-800 hover:text-orange-900 underline"
                  >
                    Voir les plans →
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Paris</p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">{stats.total}</p>
            </div>
            <div className="bg-blue-500 rounded-lg p-3">
              <Target className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Mise totale</p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">{formatCurrency(stats.totalStake)}</p>
            </div>
            <div className="bg-purple-500 rounded-lg p-3">
              <Wallet className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Profit total</p>
              <p className={`mt-2 text-3xl font-semibold ${stats.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(stats.totalProfit)}
              </p>
            </div>
            <div className={`${stats.totalProfit >= 0 ? 'bg-green-500' : 'bg-red-500'} rounded-lg p-3`}>
              {stats.totalProfit >= 0 ? (
                <TrendingUp className="h-6 w-6 text-white" />
              ) : (
                <TrendingDown className="h-6 w-6 text-white" />
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Taux de réussite</p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">
                {stats.total > 0 ? Math.round((stats.won / stats.total) * 100) : 0}%
              </p>
              <p className="mt-1 text-xs text-gray-500">
                {stats.won} gagnés / {stats.total} paris
              </p>
            </div>
            <div className="bg-orange-500 rounded-lg p-3">
              <Target className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-lg shadow p-4">
        {/* Bouton filtres et actions */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center justify-between mb-3 sm:mb-0">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center justify-center space-x-2 px-4 py-2 border rounded-md transition-colors ${
              showFilters ? 'bg-primary-50 border-primary-600 text-primary-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="h-4 w-4" />
            <span>Filtres avancés</span>
          </button>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleEnrichPmuData}
              className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
              title="Enrichir les paris avec les données PMU (jockey, entraîneur)"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="hidden sm:inline">Enrichir PMU</span>
            </button>
            <button
              onClick={() => handleExport('csv')}
              className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">CSV</span>
            </button>
            <button
              onClick={() => handleExport('excel')}
              className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Excel</span>
            </button>
          </div>
        </div>

        {/* Filtres rapides - Scroll horizontal sur mobile */}
        <div className="mt-3 relative flex items-center gap-2">
          {/* Bouton scroll gauche */}
          <button
            onClick={() => {
              const container = document.getElementById('filters-scroll-container');
              if (container) container.scrollBy({ left: -200, behavior: 'smooth' });
            }}
            className="sm:hidden flex-shrink-0 p-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          
          <div id="filters-scroll-container" className="flex-1 overflow-x-auto scrollbar-hide">
            <div className="flex gap-2 min-w-max sm:min-w-0">
            {/* Status filter */}
            <select
              value={filters.status || ''}
              onChange={(e) => setFilters({ ...filters, status: e.target.value || undefined, page: 1 })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            >
              <option value="">Statut</option>
              <option value="pending">En cours</option>
              <option value="won">Gagné</option>
              <option value="lost">Perdu</option>
              <option value="refunded">Remboursé</option>
            </select>

            {/* Platform filter */}
            <select
              value={filters.platform || ''}
              onChange={(e) => setFilters({ ...filters, platform: e.target.value || undefined, page: 1 })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            >
              <option value="">Plateforme</option>
              {platforms.map((platform) => (
                <option key={platform.id} value={platform.id}>
                  {platform.name}
                </option>
              ))}
            </select>

            {/* Bet Type filter */}
            <select
              value={filters.betType || ''}
              onChange={(e) => setFilters({ ...filters, betType: e.target.value || undefined, page: 1 })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            >
              <option value="">Type</option>
              <option value="gagnant">Gagnant</option>
              <option value="place">Placé</option>
              <option value="couple">Couplé</option>
              <option value="trio">Trio</option>
              <option value="quarte">Quarté</option>
              <option value="quinte">Quinté</option>
              <option value="multi">Multi</option>
              <option value="2sur4">2sur4</option>
              <option value="pick5">Pick 5</option>
            </select>

            {/* Tipster filter */}
            <select
              value={(filters as any).tipsterId || ''}
              onChange={(e) => setFilters({ ...filters, tipsterId: e.target.value || undefined, page: 1 } as any)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            >
              <option value="">Tipster</option>
              {tipsters.map((tipster) => (
                <option key={tipster.id} value={tipster.id}>
                  {tipster.name}
                </option>
              ))}
            </select>
            </div>
          </div>

          {/* Bouton scroll droite */}
          <button
            onClick={() => {
              const container = document.getElementById('filters-scroll-container');
              if (container) container.scrollBy({ left: 200, behavior: 'smooth' });
            }}
            className="sm:hidden flex-shrink-0 p-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Extended Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hippodrome</label>
                <input
                  type="text"
                  placeholder="Ex: Vincennes, Longchamp..."
                  value={filters.hippodrome || ''}
                  onChange={(e) => setFilters({ ...filters, hippodrome: e.target.value || undefined, page: 1 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date début</label>
                <input
                  type="date"
                  value={filters.startDate || ''}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value || undefined, page: 1 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date fin</label>
                <input
                  type="date"
                  value={filters.endDate || ''}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value || undefined, page: 1 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mise min (€)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={filters.minStake || ''}
                  onChange={(e) => setFilters({ ...filters, minStake: e.target.value ? parseFloat(e.target.value) : undefined, page: 1 })}
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
                  value={filters.maxStake || ''}
                  onChange={(e) => setFilters({ ...filters, maxStake: e.target.value ? parseFloat(e.target.value) : undefined, page: 1 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cote min</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="1.0"
                  value={filters.minOdds || ''}
                  onChange={(e) => setFilters({ ...filters, minOdds: e.target.value ? parseFloat(e.target.value) : undefined, page: 1 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cote max</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="100.0"
                  value={filters.maxOdds || ''}
                  onChange={(e) => setFilters({ ...filters, maxOdds: e.target.value ? parseFloat(e.target.value) : undefined, page: 1 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => setFilters({ page: 1 })}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bets Table - Desktop */}
      <div className="hidden lg:block bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Heure</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bookmaker</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hippodrome</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chevaux</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jockey</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipster</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mise</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cote</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gain</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={15} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex justify-center">
                      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
                    </div>
                    <p className="mt-2">Chargement...</p>
                  </td>
                </tr>
              ) : !bets || bets.data.length === 0 ? (
                <tr>
                  <td colSpan={15} className="px-6 py-12 text-center text-gray-500">
                    <div className="text-6xl mb-4">🏇</div>
                    <p>Aucun pari trouvé</p>
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                    >
                      Ajouter votre premier pari
                    </button>
                  </td>
                </tr>
              ) : (
                bets.data.map((bet) => (
                  <tr key={bet.id} className="hover:bg-gray-50">
                    {/* Date */}
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(bet.date)}
                    </td>
                    {/* Heure de la course */}
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {bet.time || '-'}
                    </td>
                    {/* Bookmaker (nom de la plateforme) */}
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      {bet.platform ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {getPlatformName(bet.platform)}
                        </span>
                      ) : '-'}
                    </td>
                    {/* Hippodrome */}
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {bet.hippodrome || '-'}
                    </td>
                    {/* Course */}
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {bet.notes && bet.notes.includes('Code PMU:') ? (
                        <div className="flex items-center space-x-1">
                          <span className="font-semibold text-primary-600">
                            {bet.notes.match(/R\d+/)?.[0]}
                          </span>
                          <span className="font-semibold text-primary-600">
                            {bet.notes.match(/C\d+/)?.[0]}
                          </span>
                        </div>
                      ) : (
                        <span>{bet.raceNumber || '-'}</span>
                      )}
                    </td>
                    {/* Type */}
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {bet.betType ? getBetTypeLabel(bet.betType) : '-'}
                    </td>
                    {/* Chevaux */}
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {bet.horsesSelected || '-'}
                    </td>
                    {/* Jockey */}
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {(bet as any).jockey || '-'}
                    </td>
                    {/* Tipster */}
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      {(bet as any).tipster?.name ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {(bet as any).tipster.name}
                        </span>
                      ) : '-'}
                    </td>
                    {/* Mise */}
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(bet.stake)}
                    </td>
                    {/* Cote */}
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {bet.odds ? Number(bet.odds).toFixed(2) : '-'}
                    </td>
                    {/* Statut */}
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      {getStatusBadge(bet.status)}
                    </td>
                    {/* Gain */}
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {bet.payout ? formatCurrency(bet.payout) : '-'}
                    </td>
                    {/* Profit */}
                    <td className={`px-4 py-3 whitespace-nowrap text-sm font-medium ${
                      (bet.profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {bet.profit ? formatCurrency(bet.profit) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {bet.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleQuickStatus(bet.id, 'won')}
                              className="text-green-600 hover:text-green-900"
                              title="Marquer comme gagné"
                            >
                              <CheckCircle className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleQuickStatus(bet.id, 'lost')}
                              className="text-red-600 hover:text-red-900"
                              title="Marquer comme perdu"
                            >
                              <XCircle className="h-5 w-5" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => {
                            setSelectedBet(bet);
                            setShowDetailsModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="Voir détails"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {/* PMU Race Details Button */}
                        {bet.pmuRaceId && (
                          <button
                            onClick={() => {
                              setSelectedRaceId(bet.pmuRaceId || null);
                              setSelectedBetHorses(bet.horsesSelected || '');
                              setShowRaceDetailsModal(true);
                            }}
                            className="text-purple-600 hover:text-purple-900"
                            title="Détails de la course PMU"
                          >
                            <Trophy className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedBet(bet);
                            setShowAddModal(true);
                          }}
                          disabled={bet.status === 'won' || bet.status === 'lost'}
                          className={`${
                            bet.status === 'won' || bet.status === 'lost'
                              ? 'text-gray-300 cursor-not-allowed'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                          title={
                            bet.status === 'won' || bet.status === 'lost'
                              ? 'Modification impossible (pari terminé)'
                              : 'Modifier'
                          }
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(bet.id)}
                          disabled={bet.status === 'won' || bet.status === 'lost'}
                          className={`${
                            bet.status === 'won' || bet.status === 'lost'
                              ? 'text-gray-300 cursor-not-allowed'
                              : 'text-red-600 hover:text-red-900'
                          }`}
                          title={
                            bet.status === 'won' || bet.status === 'lost'
                              ? 'Suppression impossible (pari terminé)'
                              : 'Supprimer'
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {bets && bets.meta.total > 0 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setFilters({ ...filters, page: (filters.page || 1) - 1 })}
                disabled={bets.meta.page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Précédent
              </button>
              <button
                onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}
                disabled={bets.meta.page === bets.meta.totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Suivant
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div className="flex items-center space-x-4">
                <p className="text-sm text-gray-700">
                  Affichage de <span className="font-medium">{(bets.meta.page - 1) * bets.meta.limit + 1}</span> à{' '}
                  <span className="font-medium">
                    {Math.min(bets.meta.page * bets.meta.limit, bets.meta.total)}
                  </span>{' '}
                  sur <span className="font-medium">{bets.meta.total}</span> résultats
                </p>
                <div className="flex items-center space-x-2">
                  <label htmlFor="limit" className="text-sm text-gray-700">
                    Par page:
                  </label>
                  <select
                    id="limit"
                    value={filters.limit || 20}
                    onChange={(e) => setFilters({ ...filters, limit: parseInt(e.target.value), page: 1 })}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                    <option value="200">200</option>
                  </select>
                </div>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setFilters({ ...filters, page: (filters.page || 1) - 1 })}
                    disabled={bets.meta.page === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Précédent
                  </button>
                  <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                    Page {bets.meta.page} sur {bets.meta.totalPages}
                  </span>
                  <button
                    onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}
                    disabled={bets.meta.page === bets.meta.totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Suivant
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bets Cards - Mobile */}
      <div className="lg:hidden space-y-4">
        {isLoading ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="flex justify-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
            </div>
            <p className="mt-2 text-gray-500">Chargement...</p>
          </div>
        ) : !bets || bets.data.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-6xl mb-4">🏇</div>
            <p className="text-gray-500">Aucun pari trouvé</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
            >
              Ajouter votre premier pari
            </button>
          </div>
        ) : (
          bets.data.map((bet) => (
            <div key={bet.id} className="bg-white rounded-lg shadow p-4">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-sm font-semibold text-gray-900">{formatDate(bet.date)}</div>
                  <div className="text-xs text-gray-500">{bet.time || '-'}</div>
                </div>
                <div>{getStatusBadge(bet.status)}</div>
              </div>

              {/* Course Info */}
              <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                <div>
                  <span className="text-gray-500">Plateforme:</span>
                  <div className="font-medium">{getPlatformName(bet.platform)}</div>
                </div>
                <div>
                  <span className="text-gray-500">Hippodrome:</span>
                  <div className="font-medium">{bet.hippodrome || '-'}</div>
                </div>
                <div>
                  <span className="text-gray-500">Course:</span>
                  <div className="font-medium">
                    {bet.notes && bet.notes.includes('Code PMU:') ? (
                      <span>{bet.notes.match(/R\d+/)?.[0]} {bet.notes.match(/C\d+/)?.[0]}</span>
                    ) : (
                      bet.raceNumber || '-'
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Type:</span>
                  <div className="font-medium">{bet.betType ? getBetTypeLabel(bet.betType) : '-'}</div>
                </div>
              </div>

              {/* Bet Details */}
              <div className="border-t border-gray-200 pt-3 mb-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Chevaux:</span>
                    <div className="font-medium">{bet.horsesSelected || '-'}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Jockey:</span>
                    <div className="font-medium text-xs">{(bet as any).jockey || '-'}</div>
                  </div>
                  {(bet as any).tipster?.name && (
                    <div className="col-span-2">
                      <span className="text-gray-500">Tipster:</span>
                      <div>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {(bet as any).tipster.name}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Financial Info */}
              <div className="border-t border-gray-200 pt-3 mb-3">
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500 text-xs">Mise</span>
                    <div className="font-semibold">{formatCurrency(bet.stake)}</div>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">Cote</span>
                    <div className="font-semibold">{bet.odds ? Number(bet.odds).toFixed(2) : '-'}</div>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">Gain</span>
                    <div className="font-semibold">{bet.payout ? formatCurrency(bet.payout) : '-'}</div>
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-gray-500 text-xs">Profit/Perte</span>
                  <div className={`text-lg font-bold ${(bet.profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {bet.profit ? formatCurrency(bet.profit) : '-'}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-gray-200">
                {bet.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleQuickStatus(bet.id, 'won')}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                      title="Marquer comme gagné"
                    >
                      <CheckCircle className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleQuickStatus(bet.id, 'lost')}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                      title="Marquer comme perdu"
                    >
                      <XCircle className="h-5 w-5" />
                    </button>
                  </>
                )}
                <button
                  onClick={() => {
                    setSelectedBet(bet);
                    setShowDetailsModal(true);
                  }}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                  title="Voir détails"
                >
                  <Eye className="h-4 w-4" />
                </button>
                {bet.pmuRaceId && (
                  <button
                    onClick={() => {
                      setSelectedRaceId(bet.pmuRaceId || null);
                      setSelectedBetHorses(bet.horsesSelected || '');
                      setShowRaceDetailsModal(true);
                    }}
                    className="p-2 text-purple-600 hover:bg-purple-50 rounded-full transition-colors"
                    title="Détails de la course PMU"
                  >
                    <Trophy className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={() => {
                    setSelectedBet(bet);
                    setShowAddModal(true);
                  }}
                  disabled={bet.status === 'won' || bet.status === 'lost'}
                  className={`p-2 rounded-full transition-colors ${
                    bet.status === 'won' || bet.status === 'lost'
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  title="Modifier"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(bet.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                  title="Supprimer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <BetForm
          bet={selectedBet}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowAddModal(false);
            setSelectedBet(null);
          }}
          isLoading={isSubmitting}
        />
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedBet && (
        <BetDetails
          bet={selectedBet}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedBet(null);
          }}
          onEdit={() => {
            setShowDetailsModal(false);
            setShowAddModal(true);
          }}
        />
      )}

      {/* Limit Warning Modal */}
      {showLimitWarning && subscription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-orange-100 rounded-full mb-4">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
                Limite atteinte
              </h2>
              <p className="text-gray-600 text-center mb-4">
                Vous avez atteint la limite de <strong>{subscription.plan.maxBetsPerMonth} paris par mois</strong> de votre plan <strong>{subscription.plan.name}</strong>.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <Crown className="h-5 w-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-blue-800 font-medium">Passez à un plan supérieur</p>
                    <p className="text-sm text-blue-700 mt-1">
                      Débloquez plus de paris et profitez de fonctionnalités avancées.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 rounded-b-lg">
              <button
                onClick={() => setShowLimitWarning(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Fermer
              </button>
              <a
                href="/dashboard/subscription"
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors inline-flex items-center"
              >
                <Crown className="h-4 w-4 mr-2" />
                Voir les plans
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Win Confirmation Modal */}
      {showWinModal && betToUpdate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-green-100 rounded-full mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
                Pari Gagné ! 🎉
              </h2>
              <p className="text-gray-600 text-center mb-6">
                Confirmez la cote finale pour calculer vos gains
              </p>

              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Mise</p>
                    <p className="font-semibold text-gray-900">{formatCurrency(betToUpdate.stake)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Cote enregistrée</p>
                    <p className="font-semibold text-gray-900">
                      {betToUpdate.odds ? Number(betToUpdate.odds).toFixed(2) : 'Non renseignée'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                {loadingOdds ? (
                  <div className="flex items-center justify-center py-8">
                    <svg className="animate-spin h-8 w-8 text-primary-600 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-gray-600">Chargement des cotes PMU...</span>
                  </div>
                ) : finalOdds ? (
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-lg p-6">
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-600 mb-2">Cote PMU officielle</p>
                      <p className="text-5xl font-bold text-green-600 mb-2">{parseFloat(finalOdds).toFixed(2)}€</p>
                      <p className="text-xs text-gray-500">
                        {betToUpdate.pmuRaceId 
                          ? '✓ Récupérée automatiquement depuis les rapports PMU'
                          : 'Cote enregistrée'
                        }
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                    <p className="text-yellow-800 text-sm">
                      ⚠️ Cote non disponible. Les rapports PMU ne sont pas encore publiés.
                    </p>
                  </div>
                )}
              </div>

              {finalOdds && parseFloat(finalOdds) > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-green-800">Gain estimé :</span>
                    <span className="text-xl font-bold text-green-600">
                      {formatCurrency(Number(betToUpdate.stake) * parseFloat(finalOdds))}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-green-700">Profit net :</span>
                    <span className="text-sm font-semibold text-green-700">
                      {formatCurrency((Number(betToUpdate.stake) * parseFloat(finalOdds)) - Number(betToUpdate.stake))}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 rounded-b-lg">
              <button
                onClick={() => {
                  setShowWinModal(false);
                  setBetToUpdate(null);
                  setFinalOdds('');
                }}
                disabled={isSubmitting}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmWin}
                disabled={isSubmitting || !finalOdds || parseFloat(finalOdds) <= 0}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Validation...' : 'Valider le gain'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Budget Exceeded Modal */}
      {showBudgetExceededModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
                Limite de budget dépassée
              </h2>
              <p className="text-gray-600 text-center mb-6">
                {budgetExceededMessage}
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800">
                  💡 <strong>Conseil :</strong> Vous pouvez ajuster vos limites de budget dans la page{' '}
                  <a href="/dashboard/budget" className="underline font-semibold hover:text-blue-900">
                    Gestion du Budget
                  </a>
                </p>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 rounded-b-lg">
              <button
                onClick={() => setShowBudgetExceededModal(false)}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
              >
                Compris
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Race Details Modal */}
      {showRaceDetailsModal && selectedRaceId && (
        <RaceDetailsModal
          raceId={selectedRaceId}
          selectedHorses={selectedBetHorses}
          onClose={() => {
            setShowRaceDetailsModal(false);
            setSelectedRaceId(null);
            setSelectedBetHorses('');
          }}
        />
      )}
    </div>
  );
}
