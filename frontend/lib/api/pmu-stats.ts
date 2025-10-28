import { apiClient } from './client';

export interface PmuDataStats {
  hippodromes: number;
  races: number;
  horses: number;
  betsLinkedToPmu: number;
}

export interface PmuHippodrome {
  id: string;
  code: string;
  name: string;
  fullName: string;
  _count: {
    races: number;
  };
}

export interface PmuHorse {
  id: string;
  number: number;
  name: string;
  arrivalOrder: number | null;
  recentForm: string | null;
  blinkers: boolean;
  unshod: boolean;
  firstTime: boolean;
  odds: number | null;
  race: {
    id: string;
    reunionNumber: number;
    raceNumber: number;
    date: string;
    hippodrome: {
      code: string;
      name: string;
    };
  };
}

export interface PmuRace {
  id: string;
  hippodromeCode: string;
  reunionNumber: number;
  raceNumber: number;
  date: string;
  name: string | null;
  startTime: string | null;
  discipline: string | null;
  distance: number | null;
  prize: number | null;
  hippodrome: {
    code: string;
    name: string;
  };
  _count: {
    horses: number;
    bets: number;
  };
}

export interface PmuReportDetail {
  libelle: string;
  dividende: number;
  dividendePourUnEuro: number;
  combinaison: string;
  nombreGagnants: number;
  dividendePourUneMiseDeBase: number;
  dividendeUnite: string;
}

export interface PmuReport {
  id: string;
  betType: string;
  betFamily: string;
  baseStake: number;
  refunded: boolean;
  reports: PmuReportDetail[];
}

export const pmuStatsAPI = {
  async getStats(): Promise<PmuDataStats> {
    return await apiClient.get<PmuDataStats>('/pmu/data/stats');
  },

  async getHippodromes(): Promise<PmuHippodrome[]> {
    return await apiClient.get<PmuHippodrome[]>('/pmu/data/hippodromes');
  },

  async getMyHippodromes(): Promise<PmuHippodrome[]> {
    return await apiClient.get<PmuHippodrome[]>('/pmu/data/my-hippodromes');
  },

  async getHippodromeStats(code: string): Promise<any> {
    return await apiClient.get<any>(`/pmu/data/hippodrome-stats/${code}`);
  },

  async getRaces(limit: number = 50): Promise<PmuRace[]> {
    return await apiClient.get<PmuRace[]>(`/pmu/data/races?limit=${limit}`);
  },

  async getHorses(limit: number = 100): Promise<PmuHorse[]> {
    return await apiClient.get<PmuHorse[]>(`/pmu/data/horses?limit=${limit}`);
  },

  async getRaceById(id: string): Promise<PmuRace & { horses: PmuHorse[]; reports?: PmuReport[] }> {
    return await apiClient.get<PmuRace & { horses: PmuHorse[]; reports?: PmuReport[] }>(`/pmu/data/races/${id}`);
  },

  async getOddsForBet(raceId: string, betType: string, horses: string): Promise<{ odds: number | null }> {
    return await apiClient.get<{ odds: number | null }>(`/pmu/data/races/${raceId}/odds`, {
      params: { betType, horses },
    });
  },

  async getHorsePerformance(): Promise<HorsePerformanceStats[]> {
    return await apiClient.get<HorsePerformanceStats[]>('/pmu/data/horse-performance');
  },

  async getMyBetHorsesPerformance(): Promise<HorsePerformanceStats[]> {
    return await apiClient.get<HorsePerformanceStats[]>('/pmu/data/my-bet-horses-performance');
  },

  async getJockeyStats(): Promise<JockeyStatsResponse> {
    return await apiClient.get<JockeyStatsResponse>('/pmu-test/jockey-stats');
  },

  async getMyJockeyStats(): Promise<JockeyStatsResponse> {
    return await apiClient.get<JockeyStatsResponse>('/pmu-test/my-jockey-stats');
  },

  async getHorseJockeyCombinations(): Promise<HorseJockeyCombinationsResponse> {
    return await apiClient.get<HorseJockeyCombinationsResponse>('/pmu-test/horse-jockey-combinations');
  },

  async getMyHorseJockeyCombinations(): Promise<HorseJockeyCombinationsResponse> {
    return await apiClient.get<HorseJockeyCombinationsResponse>('/pmu-test/my-horse-jockey-combinations');
  },

  async getCrossStats(): Promise<CrossStatsResponse> {
    return await apiClient.get<CrossStatsResponse>('/pmu-test/cross-stats');
  },

  async getMyCrossStats(): Promise<CrossStatsResponse> {
    return await apiClient.get<CrossStatsResponse>('/pmu-test/my-cross-stats');
  },
};

export interface HorsePerformanceStats {
  horseId: string;
  horseName: string;
  totalRaces: number;
  wins: number;
  podiums: number;
  avgPosition: number;
  avgOdds: number;
  winRate: number;
  podiumRate: number;
  lastRace: {
    date: string;
    hippodrome: string;
    position: number;
    odds: number | null;
  } | null;
}

export interface JockeyStat {
  jockey: string;
  totalRaces: number;
  wins: number;
  podiums: number;
  top5: number;
  winRate: number;
  podiumRate: number;
  avgPosition: number;
  uniqueHorses: number;
}

export interface JockeyStatsResponse {
  total: number;
  topJockeys: JockeyStat[];
}

export interface HorseJockeyCombination {
  horseName: string;
  jockey: string;
  totalRaces: number;
  wins: number;
  podiums: number;
  winRate: number;
  podiumRate: number;
  avgPosition: number;
}

export interface HorseJockeyCombinationsResponse {
  total: number;
  topCombinations: HorseJockeyCombination[];
}

export interface HippodromeJockeyStat {
  hippodrome: string;
  jockey: string;
  totalRaces: number;
  wins: number;
  podiums: number;
  winRate: number;
  podiumRate: number;
  avgPosition: number;
}

export interface HippodromeHorseStat {
  hippodrome: string;
  horseName: string;
  totalRaces: number;
  wins: number;
  podiums: number;
  winRate: number;
  podiumRate: number;
  avgPosition: number;
}

export interface TripleCombinationStat {
  hippodrome: string;
  jockey: string;
  horseName: string;
  totalRaces: number;
  wins: number;
  podiums: number;
  winRate: number;
  podiumRate: number;
  avgPosition: number;
}

export interface CrossStatsResponse {
  hippodromeJockey: {
    total: number;
    top: HippodromeJockeyStat[];
  };
  hippodromeHorse: {
    total: number;
    top: HippodromeHorseStat[];
  };
  tripleCombinations: {
    total: number;
    top: TripleCombinationStat[];
  };
}
