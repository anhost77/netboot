// Manual type declarations for Prisma enums when client generation is not possible
// These mirror the enums defined in prisma/schema.prisma

declare module '@prisma/client' {
  export enum UserRole {
    user = 'user',
    admin = 'admin',
    moderator = 'moderator',
  }

  export enum BetStatus {
    pending = 'pending',
    won = 'won',
    lost = 'lost',
    refunded = 'refunded',
  }

  export enum SubscriptionStatus {
    trial = 'trial',
    active = 'active',
    cancelled = 'cancelled',
    expired = 'expired',
    past_due = 'past_due',
  }

  export enum BillingCycle {
    monthly = 'monthly',
    yearly = 'yearly',
  }

  export enum TicketStatus {
    new = 'new',
    in_progress = 'in_progress',
    waiting_customer = 'waiting_customer',
    resolved = 'resolved',
    closed = 'closed',
  }

  export enum TicketPriority {
    low = 'low',
    normal = 'normal',
    high = 'high',
    urgent = 'urgent',
  }

  export enum TicketCategory {
    technical = 'technical',
    billing = 'billing',
    feature_request = 'feature_request',
    other = 'other',
  }

  export enum NotificationType {
    info = 'info',
    success = 'success',
    warning = 'warning',
    error = 'error',
  }
}

export {};
