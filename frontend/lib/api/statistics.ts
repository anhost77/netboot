import { apiClient } from './client';

// Dashboard Statistics
export interface DashboardStats {
  currentMonth: PeriodStats;
  lastMonth: PeriodStats;
  yearToDate: PeriodStats;
  allTime: PeriodStats;
  trends: {
    totalBets: number;
    totalStake: number;
    totalProfit: number;
    winRate: number;
  };
}

export interface PeriodStats {
  totalBets: number;
  wonBets: number;
  lostBets: number;
  pendingBets: number;
  totalStake: number;
  totalWinnings: number;
  totalProfit: number;
  winRate: number;
  averageOdds: number;
  roi: number;
}

// Time Series Data
export interface TimeSeriesData {
  period: string;
  totalBets: number;
  wonBets: number;
  lostBets: number;
  totalStake: number;
  totalPayout: number;
  totalProfit: number;
  winRate: number;
  avgOdds: number;
  roi: number;
}

// Performance Metrics
export interface PerformanceMetrics {
  streaks: {
    currentWinStreak: number;
    currentLoseStreak: number;
    maxWinStreak: number;
    maxLoseStreak: number;
  };
  volatility: number;
  sharpeRatio: number;
  avgProfit: number;
  bestBet: BetSummary | null;
  worstBet: BetSummary | null;
  consistencyScore: number;
}

export interface BetSummary {
  id: string;
  date: string;
  stake: number;
  odds: number;
  profit: number;
}

// Breakdowns
export interface Breakdowns {
  byBetType: BreakdownItem[];
  byStatus: BreakdownItem[];
  byStakeRange: BreakdownItem[];
  byOddsRange: BreakdownItem[];
  byHippodrome: BreakdownItem[];
  byPlatform: BreakdownItem[];
}

export interface BreakdownItem {
  category?: string;
  range?: string;
  totalBets: number;
  wonBets: number;
  totalStake: number;
  totalProfit: number;
  winRate: number;
  roi: number;
}

// Comparative Analysis
export interface ComparativeAnalysis {
  current: PeriodStats;
  previous: PeriodStats;
  comparison: {
    totalBetsChange: number;
    totalStakeChange: number;
    totalProfitChange: number;
    winRateChange: number;
    roiChange: number;
  };
}

// Predefined Periods
export interface PredefinedPeriods {
  today: PeriodStats;
  yesterday: PeriodStats;
  thisWeek: PeriodStats;
  lastWeek: PeriodStats;
  thisMonth: PeriodStats;
  lastMonth: PeriodStats;
}

export const statisticsAPI = {
  /**
   * Get comprehensive dashboard statistics
   */
  async getDashboard(): Promise<DashboardStats> {
    return apiClient.get<DashboardStats>('/statistics/dashboard');
  },

  /**
   * Get statistics for predefined periods (today, yesterday, week, month)
   */
  async getPeriods(): Promise<PredefinedPeriods> {
    return apiClient.get<PredefinedPeriods>('/statistics/periods');
  },

  /**
   * Get time series data for charts
   * @param period - 'daily', 'weekly', or 'monthly'
   * @param startDate - Start date (optional)
   * @param endDate - End date (optional)
   */
  async getTimeSeries(
    period: 'daily' | 'weekly' | 'monthly',
    startDate?: string,
    endDate?: string
  ): Promise<TimeSeriesData[]> {
    const params: any = { period };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    return apiClient.get<TimeSeriesData[]>('/statistics/time-series', { params });
  },

  /**
   * Get advanced performance metrics
   */
  async getPerformance(startDate?: string, endDate?: string): Promise<PerformanceMetrics> {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    return apiClient.get<PerformanceMetrics>('/statistics/performance', { params });
  },

  /**
   * Get statistical breakdowns
   */
  async getBreakdowns(startDate?: string, endDate?: string): Promise<Breakdowns> {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    return apiClient.get<Breakdowns>('/statistics/breakdowns', { params });
  },

  /**
   * Get comparative analysis between two periods
   */
  async getComparative(currentStart: string, currentEnd: string): Promise<ComparativeAnalysis> {
    const params = { currentStart, currentEnd };
    return apiClient.get<ComparativeAnalysis>('/statistics/comparative', { params });
  },
};
