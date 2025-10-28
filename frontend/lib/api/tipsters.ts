import { apiClient } from './client';

export interface Tipster {
  id: string;
  name: string;
  description?: string;
  website?: string;
  socialMedia?: Record<string, string>;
  color?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    bets: number;
  };
}

export interface CreateTipsterDto {
  name: string;
  description?: string;
  website?: string;
  socialMedia?: Record<string, string>;
  color?: string;
  isActive?: boolean;
}

export interface UpdateTipsterDto extends Partial<CreateTipsterDto> {}

export interface TipsterStatistics {
  id?: string;
  name?: string;
  color?: string;
  isActive?: boolean;
  totalBets: number;
  wonBets: number;
  lostBets: number;
  pendingBets: number;
  totalStake: number;
  totalPayout: number;
  totalProfit: number;
  winRate: number;
  roi: number;
  betTypeStats: Record<string, {
    total: number;
    won: number;
    lost: number;
    stake: number;
    profit: number;
    winRate: number;
    roi: number;
  }>;
  monthlyStats: Array<{
    month: string;
    total: number;
    won: number;
    lost: number;
    stake: number;
    profit: number;
    winRate: number;
    roi: number;
  }>;
}

export const tipstersAPI = {
  async getAll(): Promise<Tipster[]> {
    return await apiClient.get<Tipster[]>('/tipsters');
  },

  async getOne(id: string): Promise<Tipster> {
    return await apiClient.get<Tipster>(`/tipsters/${id}`);
  },

  async create(data: CreateTipsterDto): Promise<Tipster> {
    return await apiClient.post<Tipster>('/tipsters', data);
  },

  async update(id: string, data: UpdateTipsterDto): Promise<Tipster> {
    return await apiClient.patch<Tipster>(`/tipsters/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    return await apiClient.delete(`/tipsters/${id}`);
  },

  async getStatistics(id: string): Promise<TipsterStatistics> {
    return await apiClient.get<TipsterStatistics>(`/tipsters/${id}/statistics`);
  },

  async getAllStatistics(): Promise<TipsterStatistics[]> {
    return await apiClient.get<TipsterStatistics[]>('/tipsters/statistics');
  },

  async exportAll(format: 'csv' | 'excel'): Promise<void> {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tipsters/export/all?format=${format}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) throw new Error('Export failed');
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tipsters_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xls' : 'csv'}`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  async exportOne(id: string, format: 'csv' | 'excel'): Promise<void> {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tipsters/${id}/export?format=${format}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) throw new Error('Export failed');
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tipster_${id}_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xls' : 'csv'}`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },
};
