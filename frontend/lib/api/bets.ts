import { apiClient } from './client';
import type { Bet, CreateBetData, PaginatedResponse } from '../types';

export interface BetsFilters {
  page?: number;
  limit?: number;
  status?: string;
  platform?: string;
  hippodrome?: string;
  betType?: string;
  tags?: string;
  minStake?: number;
  maxStake?: number;
  minOdds?: number;
  maxOdds?: number;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const betsAPI = {
  async list(filters?: BetsFilters): Promise<PaginatedResponse<Bet>> {
    return apiClient.get<PaginatedResponse<Bet>>('/bets', { params: filters });
  },

  async getById(id: string): Promise<Bet> {
    return apiClient.get<Bet>(`/bets/${id}`);
  },

  async create(data: CreateBetData): Promise<Bet> {
    return apiClient.post<Bet>('/bets', data);
  },

  async update(id: string, data: Partial<CreateBetData>): Promise<Bet> {
    return apiClient.patch<Bet>(`/bets/${id}`, data);
  },

  async updateStatus(id: string, status: 'won' | 'lost' | 'pending'): Promise<Bet> {
    return apiClient.patch<Bet>(`/bets/${id}/status`, { status });
  },

  async delete(id: string): Promise<{ message: string }> {
    return apiClient.delete(`/bets/${id}`);
  },

  async export(format: 'csv' | 'excel', filters?: BetsFilters): Promise<Blob> {
    const response = await apiClient.get(`/bets/export/${format}`, {
      params: filters,
      responseType: 'blob',
    });
    return response as any;
  },
};
