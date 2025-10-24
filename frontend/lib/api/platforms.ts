import { apiClient } from './client';

export enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
}

export interface Platform {
  id: string;
  userId: string;
  name: string;
  initialBankroll: number;
  currentBankroll: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    transactions: number;
  };
}

export interface BankrollTransaction {
  id: string;
  userId: string;
  platformId: string;
  type: TransactionType;
  amount: number;
  balanceAfter: number;
  description?: string;
  date: string;
  createdAt: string;
}

export interface CreatePlatformDto {
  name: string;
  initialBankroll: number;
}

export interface UpdatePlatformDto {
  name?: string;
  isActive?: boolean;
}

export interface CreateTransactionDto {
  type: TransactionType;
  amount: number;
  description?: string;
  date?: string;
}

export interface GlobalBankroll {
  platforms: Array<{
    id: string;
    name: string;
    initialBankroll: number;
    currentBankroll: number;
  }>;
  totalInitialBankroll: number;
  totalCurrentBankroll: number;
  totalProfit: number;
  roi: number;
}

export const platformsAPI = {
  // Créer une plateforme
  create: async (data: CreatePlatformDto): Promise<Platform> => {
    return await apiClient.post<Platform>('/platforms', data);
  },

  // Récupérer toutes les plateformes
  getAll: async (): Promise<Platform[]> => {
    return await apiClient.get<Platform[]>('/platforms');
  },

  // Récupérer une plateforme par ID
  getOne: async (id: string): Promise<Platform> => {
    return await apiClient.get<Platform>(`/platforms/${id}`);
  },

  // Mettre à jour une plateforme
  update: async (id: string, data: UpdatePlatformDto): Promise<Platform> => {
    return await apiClient.patch<Platform>(`/platforms/${id}`, data);
  },

  // Supprimer une plateforme
  delete: async (id: string): Promise<void> => {
    await apiClient.delete<void>(`/platforms/${id}`);
  },

  // Créer une transaction (dépôt ou retrait)
  createTransaction: async (
    platformId: string,
    data: CreateTransactionDto,
  ): Promise<BankrollTransaction> => {
    return await apiClient.post<BankrollTransaction>(
      `/platforms/${platformId}/transactions`,
      data,
    );
  },

  // Récupérer toutes les transactions d'une plateforme
  getTransactions: async (platformId: string): Promise<BankrollTransaction[]> => {
    return await apiClient.get<BankrollTransaction[]>(`/platforms/${platformId}/transactions`);
  },

  // Récupérer la bankroll globale
  getGlobalBankroll: async (): Promise<GlobalBankroll> => {
    return await apiClient.get<GlobalBankroll>('/platforms/global-bankroll');
  },
};
