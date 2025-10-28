import { apiClient } from './client';

export interface Competitor {
  numPmu: number | null;
  nomCheval: string;
  nomJockey: string;
  place: {
    place: number;
    statusArrivee: string;
  } | null;
  itsHim: boolean;
  reductionKilometrique: number | null;
}

export interface HorsePerformance {
  date: string;
  hippodrome: string;
  raceName: string | null;
  discipline: string | null;
  distance: number | null;
  prize: number | null;
  nbParticipants: number | null;
  position: number | null;
  status: string | null;
  jockey: string | null;
  competitors: Competitor[];
}

export interface HippodromeStats {
  races: number;
  wins: number;
  podiums: number;
  avgPosition: number | null;
}

export interface HorsePerformanceStats {
  totalRaces: number;
  wins: number;
  podiums: number;
  winRate: number;
  podiumRate: number;
  avgPosition: number;
  hippodromeStats: Record<string, HippodromeStats>;
}

export interface HorsePerformanceResponse {
  horseId: string;
  performances: HorsePerformance[];
  stats: HorsePerformanceStats | null;
}

export const horsePerformancesAPI = {
  async getHorsePerformances(horseId: string): Promise<HorsePerformanceResponse> {
    return await apiClient.get<HorsePerformanceResponse>(`/pmu-test/horse/${horseId}/performances`);
  },
  
  async getHorsePerformancesByName(horseName: string): Promise<HorsePerformanceResponse> {
    return await apiClient.get<HorsePerformanceResponse>(`/pmu-test/horse-by-name/${horseName}/performances`);
  },
};
