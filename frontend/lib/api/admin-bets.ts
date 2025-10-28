import { apiClient } from './client';

export interface AdminBet {
  id: string;
  userId: string;
  date: string;
  time: string | null;
  platform: string | null;
  hippodrome: string | null;
  raceNumber: number | null;
  betType: string | null;
  horsesSelected: string | null;
  stake: number;
  odds: number | null;
  status: string;
  payout: number | null;
  profit: number | null;
  jockey: string | null;
  trainer: string | null;
  notes: string | null;
  tags: string | null;
  tipsterId: string | null;
  createdAt: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  tipster: {
    id: string;
    name: string;
  } | null;
}

export interface AdminBetsResponse {
  data: AdminBet[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface BetsStats {
  totalBets: number;
  totalStake: number;
  totalProfit: number;
  winRate: number;
  recentBets24h: number;
  statusDistribution: {
    status: string;
    count: number;
  }[];
  betTypeDistribution: {
    betType: string;
    count: number;
  }[];
  topUsers: {
    userId: string;
    email: string;
    name: string;
    betsCount: number;
    totalStake: number;
    totalProfit: number;
  }[];
  topTipsters: {
    tipsterId: string | null;
    name: string;
    betsCount: number;
    totalStake: number;
    totalProfit: number;
  }[];
}

export interface BetsTimeline {
  date: string;
  count: number;
  stake: number;
  profit: number;
}

export const adminBetsAPI = {
  getAllBets: (params: {
    page?: number;
    limit?: number;
    userId?: string;
    tipsterId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.userId) queryParams.append('userId', params.userId);
    if (params.tipsterId) queryParams.append('tipsterId', params.tipsterId);
    if (params.status) queryParams.append('status', params.status);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);

    return apiClient.get<AdminBetsResponse>(`/admin/bets?${queryParams.toString()}`);
  },

  getStats: (startDate?: string, endDate?: string) => {
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);

    return apiClient.get<BetsStats>(`/admin/bets/stats?${queryParams.toString()}`);
  },

  getTimeline: (days?: number) => {
    const queryParams = new URLSearchParams();
    if (days) queryParams.append('days', days.toString());

    return apiClient.get<BetsTimeline[]>(`/admin/bets/timeline?${queryParams.toString()}`);
  },
};
