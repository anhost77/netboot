'use client';

import { useEffect, useState } from 'react';
import { Wallet, Target, DollarSign, BarChart3 } from 'lucide-react';
import { statisticsAPI, DashboardStats, TimeSeriesData } from '@/lib/api/statistics';
import { betsAPI } from '@/lib/api/bets';
import { platformsAPI, GlobalBankroll } from '@/lib/api/platforms';
import { budgetAPI } from '@/lib/api/budget';
import { Bet, BudgetOverview } from '@/lib/types';
import StatsCard from '@/components/dashboard/stats-card';
import RecentBetsCard from '@/components/dashboard/recent-bets-card';
import BudgetAlertCard from '@/components/dashboard/budget-alert-card';
import ProfitChartCard from '@/components/dashboard/profit-chart-card';
import BankrollChart from '@/components/charts/bankroll-chart';
import BudgetAlertModal from '@/components/budget/budget-alert-modal';
import { DetailedMetrics } from '@/components/dashboard/detailed-metrics';

export default function DashboardPage() {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [recentBets, setRecentBets] = useState<Bet[]>([]);
  const [globalBankroll, setGlobalBankroll] = useState<GlobalBankroll | null>(null);
  const [budgetOverview, setBudgetOverview] = useState<BudgetOverview | null>(null);
  const [profitTimeSeries, setProfitTimeSeries] = useState<TimeSeriesData[]>([]);
  const [bankrollEvolution, setBankrollEvolution] = useState<any[]>([]);
  const [detailedStats, setDetailedStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showBudgetModal, setShowBudgetModal] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch all data in parallel
        const [stats, bets, bankroll, budget, timeSeries, evolution, detailed] = await Promise.all([
          statisticsAPI.getDashboard().catch(() => null),
          betsAPI.list({ limit: 5, sortBy: 'date', sortOrder: 'desc' }).catch(() => ({ data: [], meta: { total: 0, page: 1, limit: 5, totalPages: 0 } })),
          platformsAPI.getGlobalBankroll().catch(() => null),
          budgetAPI.getOverview().catch(() => null),
          statisticsAPI.getTimeSeries('daily', undefined, undefined).catch(() => []),
          platformsAPI.getGlobalBankrollEvolution('day').catch(() => []),
          betsAPI.getStats().catch(() => null),
        ]);

        setDashboardStats(stats);
        setRecentBets(bets.data);
        setGlobalBankroll(bankroll);
        setBudgetOverview(budget);
        setProfitTimeSeries(timeSeries);
        setBankrollEvolution(evolution);
        setDetailedStats(detailed);
        
        // Check if budget is exceeded and show modal
        if (budget && budget.hasAlerts) {
          const maxPercentage = Math.max(
            budget.daily.percentage || 0,
            budget.weekly.percentage || 0,
            budget.monthly.percentage || 0
          );
          // Show modal if any budget is exceeded by more than 100%
          if (maxPercentage > 100) {
            // Check if modal was already shown in this session
            const shownInSession = sessionStorage.getItem('budget_modal_shown');
            if (!shownInSession) {
              setShowBudgetModal(true);
              sessionStorage.setItem('budget_modal_shown', 'true');
            }
          }
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Calculate comparison with last month
  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const getTrend = (change: number): 'up' | 'down' | undefined => {
    if (change > 0) return 'up';
    if (change < 0) return 'down';
    return undefined;
  };

  return (
    <>
      {/* Budget Alert Modal */}
      <BudgetAlertModal
        isOpen={showBudgetModal}
        onClose={() => setShowBudgetModal(false)}
        daily={budgetOverview?.daily}
        weekly={budgetOverview?.weekly}
        monthly={budgetOverview?.monthly}
      />
      
      <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Bienvenue sur votre tableau de bord BetTracker Pro</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          // Loading skeletons
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))
        ) : dashboardStats ? (
          <>
            <StatsCard
              title="Bankroll Actuelle"
              value={globalBankroll?.totalCurrentBankroll || 0}
              change={globalBankroll?.totalProfit}
              trend={globalBankroll ? getTrend(globalBankroll.totalProfit) : undefined}
              icon={Wallet}
              color="bg-blue-500"
              isCurrency
              changeLabel="depuis le début"
            />
            <StatsCard
              title="Paris ce mois"
              value={dashboardStats.currentMonth.totalBets}
              change={dashboardStats.currentMonth.totalBets - dashboardStats.lastMonth.totalBets}
              trend={getTrend(dashboardStats.currentMonth.totalBets - dashboardStats.lastMonth.totalBets)}
              icon={Target}
              color="bg-green-500"
            />
            <StatsCard
              title="Profit du mois"
              value={dashboardStats.currentMonth.totalProfit}
              change={calculateChange(dashboardStats.currentMonth.totalProfit, dashboardStats.lastMonth.totalProfit)}
              trend={getTrend(dashboardStats.currentMonth.totalProfit - dashboardStats.lastMonth.totalProfit)}
              icon={DollarSign}
              color="bg-purple-500"
              isCurrency
            />
            <StatsCard
              title="Taux de réussite"
              value={dashboardStats.currentMonth.winRate}
              change={dashboardStats.currentMonth.winRate - dashboardStats.lastMonth.winRate}
              trend={getTrend(dashboardStats.currentMonth.winRate - dashboardStats.lastMonth.winRate)}
              icon={BarChart3}
              color="bg-orange-500"
              isPercentage
            />
          </>
        ) : (
          <div className="col-span-4 text-center py-12 text-gray-500">
            <p>Impossible de charger les statistiques</p>
          </div>
        )}
      </div>

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

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profit Chart */}
        {profitTimeSeries.length > 0 && (
          <ProfitChartCard data={profitTimeSeries} title="Évolution du Profit (30 derniers jours)" />
        )}
        
        {/* Bankroll Evolution */}
        {bankrollEvolution.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <BankrollChart data={bankrollEvolution} title="Évolution de la Bankroll" height={250} />
          </div>
        )}
      </div>

      {/* Recent Bets Section */}
      <RecentBetsCard bets={recentBets} isLoading={isLoading} />

      {/* Budget Alert */}
      <BudgetAlertCard budgetOverview={budgetOverview} isLoading={isLoading} />
      </div>
    </>
  );
}
