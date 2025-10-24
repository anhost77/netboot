// User Types
export interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: 'user' | 'admin' | 'moderator';
  emailVerifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// Auth Types
export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

// Bet Types
export type BetStatus = 'pending' | 'won' | 'lost' | 'refunded';

export type HorseBetType =
  | 'gagnant'
  | 'place'
  | 'gagnant_place'
  | 'couple'
  | 'couple_ordre'
  | 'trio'
  | 'trio_ordre'
  | 'quarte'
  | 'quarte_ordre'
  | 'quinte'
  | 'quinte_ordre'
  | 'multi'
  | 'pick5'
  | 'autre';

export interface Bet {
  id: string;
  userId: string;
  date: string;
  time?: string | null;
  platform?: string | null;
  hippodrome?: string | null;
  raceNumber?: string | null;
  betType?: HorseBetType | null;
  horsesSelected?: string | null;
  winningHorse?: string | null;
  stake: number;
  odds?: number | null;
  status: BetStatus;
  payout?: number | null;
  profit?: number | null;
  notes?: string | null;
  tags?: string[] | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBetData {
  date: string;
  time?: string;
  platform?: string;
  hippodrome?: string;
  raceNumber?: string;
  betType?: HorseBetType;
  horsesSelected?: string;
  winningHorse?: string;
  stake: number;
  odds?: number;
  status?: BetStatus;
  payout?: number;
  profit?: number;
  notes?: string;
  tags?: string[];
}

// Statistics Types
export interface Statistics {
  totalBets: number;
  totalStake: number;
  totalWinnings: number;
  totalProfit: number;
  winRate: number;
  averageOdds: number;
  roi: number;
}

// Budget Types
export interface BudgetSettings {
  initialBankroll?: number | null;
  currentBankroll?: number | null;
  dailyLimit?: number | null;
  weeklyLimit?: number | null;
  monthlyLimit?: number | null;
  alertThreshold?: number | null;
}

export interface BudgetConsumption {
  period: 'daily' | 'weekly' | 'monthly';
  startDate: string;
  endDate: string;
  totalStake: number;
  totalProfit: number;
  limit: number | null;
  consumed: number;
  remaining: number | null;
  percentage: number | null;
  betsCount: number;
}

export interface BudgetOverview {
  settings: BudgetSettings;
  daily: BudgetConsumption;
  weekly: BudgetConsumption;
  monthly: BudgetConsumption;
  bankroll: {
    initial: number;
    current: number;
    change: number;
    changePercent: number;
  };
  alerts: string[];
  hasAlerts: boolean;
}

// Notification Types
export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string | null;
  readAt: string | null;
  createdAt: string;
}

// Support Types
export type TicketStatus = 'new' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'normal' | 'high' | 'urgent';
export type TicketCategory = 'technical' | 'billing' | 'feature_request' | 'other';

export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
}

export interface SupportMessage {
  id: string;
  ticketId: string;
  userId: string | null;
  message: string;
  attachments?: string[] | null;
  isInternalNote: boolean;
  createdAt: string;
}

// Subscription Types
export type SubscriptionStatus = 'trial' | 'active' | 'cancelled' | 'expired' | 'past_due';
export type BillingCycle = 'monthly' | 'yearly';

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  priceMonthly: number;
  priceYearly: number;
  maxBetsPerMonth: number | null;
  maxStorageMb: number | null;
  features: any;
  active: boolean;
}

// Pagination
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
