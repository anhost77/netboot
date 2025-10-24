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
  date: string;
  totalBets: number;
  wonBets: number;
  lostBets: number;
  totalStake: number;
  totalProfit: number;
  cumulativeProfit: number;
}

// Performance Metrics
export interface PerformanceMetrics {
  currentStreak: {
    type: 'win' | 'loss';
    count: number;
  };
  longestWinStreak: number;
  longestLossStreak: number;
  volatility: number;
  sharpeRatio: number;
  consistencyScore: number;
  bestBets: BetSummary[];
  worstBets: BetSummary[];
}

export interface BetSummary {
  id: string;
  date: string;
  platform?: string;
  hippodrome?: string;
  stake: number;
  odds?: number;
  profit: number;
  roi: number;
}

// Breakdowns
export interface Breakdowns {
  byType: BreakdownItem[];
  byStatus: BreakdownItem[];
  byStakeRange: BreakdownItem[];
  byOddsRange: BreakdownItem[];
}

export interface BreakdownItem {
  category: string;
  totalBets: number;
  wonBets: number;
  lostBets: number;
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

export const statisticsAPI = {
  /**
   * Get comprehensive dashboard statistics
   */
  async getDashboard(): Promise<DashboardStats> {
    return apiClient.get<DashboardStats>('/statistics/dashboard');
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
