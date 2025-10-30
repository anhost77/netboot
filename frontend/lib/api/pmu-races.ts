import { apiClient } from './client';

export interface PmuRace {
  id: string;
  hippodromeCode: string;
  hippodrome: {
    code: string;
    name: string;
    fullName: string;
  };
  reunionNumber: number;
  raceNumber: number;
  date: string;
  name: string | null;
  startTime: string | null;
  discipline: string | null;
  distance: number | null;
  prize: number | null;
  availableBetTypes: string[];
  horses: any[];
}

export const pmuRacesAPI = {
  /**
   * Récupérer toutes les courses disponibles
   */
  async getAll(params?: { limit?: number; date?: string }): Promise<PmuRace[]> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.date) queryParams.append('date', params.date);
    
    const response = await apiClient.get<PmuRace[]>(`/pmu/data/races?${queryParams.toString()}`);
    return response;
  },

  /**
   * Récupérer une course par ID
   */
  async getById(id: string): Promise<PmuRace> {
    return apiClient.get<PmuRace>(`/pmu/data/races/${id}`);
  },

  /**
   * Récupérer les courses du jour
   */
  async getToday(): Promise<PmuRace[]> {
    const today = new Date().toISOString().split('T')[0];
    return this.getAll({ date: today, limit: 100 });
  },

  /**
   * Récupérer les courses par hippodrome
   */
  async getByHippodrome(hippodromeCode: string, date?: string): Promise<PmuRace[]> {
    const races = await this.getAll({ date, limit: 100 });
    return races.filter(race => race.hippodromeCode === hippodromeCode);
  },
};
