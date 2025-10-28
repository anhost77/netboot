import { apiClient } from './client';
import type { SupportTicket, SupportMessage, PaginatedResponse } from '../types';

export interface CreateTicketData {
  subject: string;
  category: 'technical' | 'billing' | 'feature_request' | 'other';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  message: string;
}

export interface AddMessageData {
  message: string;
}

export interface TicketsFilters {
  page?: number;
  limit?: number;
  status?: string;
  priority?: string;
  category?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatRequest {
  message: string;
  conversationHistory?: ChatMessage[];
}

export interface ChatResponse {
  message: string;
  suggestTicket: boolean;
}

export const supportAPI = {
  // Create a new ticket
  createTicket: (data: CreateTicketData) => 
    apiClient.post<SupportTicket>('/support/tickets', data),

  // Get all tickets
  getTickets: (filters?: TicketsFilters) => 
    apiClient.get<PaginatedResponse<SupportTicket>>('/support/tickets', { params: filters }),

  // Get a single ticket
  getTicket: (id: string) => 
    apiClient.get<SupportTicket>(`/support/tickets/${id}`),

  // Get ticket messages
  getMessages: (ticketId: string) => 
    apiClient.get<SupportMessage[]>(`/support/tickets/${ticketId}/messages`),

  // Add a message to a ticket
  addMessage: (ticketId: string, data: AddMessageData) => 
    apiClient.post<SupportMessage>(`/support/tickets/${ticketId}/messages`, data),

  // Close a ticket
  closeTicket: (ticketId: string) => 
    apiClient.patch<SupportTicket>(`/support/tickets/${ticketId}/close`, {}),

  // Chat with AI assistant
  chat: (data: ChatRequest) => 
    apiClient.post<ChatResponse>('/support/chat', data),
};
