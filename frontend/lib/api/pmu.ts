import { apiClient } from './client';

export interface PMUHippodrome {
  code: string;
  name: string;
  fullName: string;
}

export interface PMURace {
  number: number;
  name: string;
  startTime: string;
  discipline: string;
  prize: number;
  distance?: number;
  distanceUnit?: string;
}

export interface PMUMeeting {
  number: number;
  hippodrome: PMUHippodrome;
  races: PMURace[];
}

export interface PMUProgram {
  meetings: PMUMeeting[];
}

export interface PMUParticipant {
  number: number;
  name: string;
  arrivalOrder?: number;
  unshod?: boolean;
  blinkers?: boolean;
  firstTime?: boolean;
  recentForm?: string;
}

export interface PMUParticipants {
  participants: PMUParticipant[];
}

export const pmuAPI = {
  /**
   * Get today's race program
   */
  async getTodayProgram(): Promise<PMUProgram> {
    return apiClient.get<PMUProgram>('/pmu/program/today');
  },

  /**
   * Get program for a specific date
   */
  async getProgramByDate(date: string): Promise<PMUProgram> {
    return apiClient.get<PMUProgram>('/pmu/program', { params: { date } });
  },

  /**
   * Get race participants
   */
  async getRaceParticipants(date: string, reunion: number, course: number): Promise<PMUParticipants> {
    return apiClient.get<PMUParticipants>('/pmu/race/participants', {
      params: { date, reunion, course },
    });
  },

  /**
   * Get race details
   */
  async getRaceDetails(date: string, reunion: number, course: number): Promise<any> {
    return apiClient.get('/pmu/race/details', {
      params: { date, reunion, course },
    });
  },

  /**
   * Get horse performance statistics
   */
  async getHorsePerformance(): Promise<any> {
    return apiClient.get('/pmu/data/horse-performance');
  },

  /**
   * Get jockey statistics
   */
  async getJockeyStats(): Promise<any> {
    return apiClient.get('/pmu/jockey-stats');
  },

  /**
   * Get horse-jockey combinations
   */
  async getHorseJockeyCombinations(): Promise<any> {
    return apiClient.get('/pmu/horse-jockey-combinations');
  },

  /**
   * Get horse performances by name
   */
  async getHorsePerformancesByName(horseName: string): Promise<any> {
    return apiClient.get(`/pmu/horse-by-name/${encodeURIComponent(horseName)}/performances`);
  },
};
