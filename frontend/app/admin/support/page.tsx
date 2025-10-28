'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api/client';
import { formatDate } from '@/lib/utils';
import {
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Send,
  User,
  Mail,
  Calendar,
  AlertCircle,
} from 'lucide-react';

interface Ticket {
  id: string;
  subject: string;
  status: 'new' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  category: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  messages?: TicketMessage[];
}

interface TicketMessage {
  id: string;
  message: string;
  userId: string | null;
  isInternalNote: boolean;
  createdAt: string;
  user?: {
    firstName: string;
    lastName: string;
  };
}

export default function AdminSupportPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    search: '',
  });

  useEffect(() => {
    loadTickets();
  }, []);

  useEffect(() => {
    filterTickets();
  }, [filters, tickets]);

  const loadTickets = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.get<Ticket[]>('/admin/support/tickets');
      setTickets(data);
    } catch (error) {
      console.error('Failed to load tickets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterTickets = () => {
    let filtered = [...tickets];

    if (filters.status !== 'all') {
      filtered = filtered.filter(t => t.status === filters.status);
    }

    if (filters.priority !== 'all') {
      filtered = filtered.filter(t => t.priority === filters.priority);
    }

    if (filters.search) {
      filtered = filtered.filter(t =>
        t.subject.toLowerCase().includes(filters.search.toLowerCase()) ||
        t.messages?.[0]?.message.toLowerCase().includes(filters.search.toLowerCase()) ||
        t.user.email.toLowerCase().includes(filters.search.toLowerCase()) ||
        `${t.user.firstName} ${t.user.lastName}`.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    setFilteredTickets(filtered);
  };

  const handleSendResponse = async () => {
    if (!selectedTicket || !responseMessage.trim()) return;

    try {
      setIsSending(true);
      await apiClient.post(`/admin/support/tickets/${selectedTicket.id}/respond`, {
        message: responseMessage,
      });

      setResponseMessage('');
      await loadTickets();
      
      // Reload selected ticket
      const updatedTicket = await apiClient.get<Ticket>(`/admin/support/tickets/${selectedTicket.id}`);
      setSelectedTicket(updatedTicket);
    } catch (error) {
      console.error('Failed to send response:', error);
      alert('Erreur lors de l\'envoi de la réponse');
    } finally {
      setIsSending(false);
    }
  };

  const handleUpdateStatus = async (ticketId: string, status: string) => {
    try {
      await apiClient.patch(`/admin/support/tickets/${ticketId}/status`, { status });
      await loadTickets();
      
      if (selectedTicket?.id === ticketId) {
        const updatedTicket = await apiClient.get<Ticket>(`/admin/support/tickets/${ticketId}`);
        setSelectedTicket(updatedTicket);
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Erreur lors de la mise à jour du statut');
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      new: { label: 'Nouveau', class: 'bg-blue-100 text-blue-800' },
      in_progress: { label: 'En cours', class: 'bg-yellow-100 text-yellow-800' },
      waiting_customer: { label: 'En attente client', class: 'bg-orange-100 text-orange-800' },
      resolved: { label: 'Résolu', class: 'bg-green-100 text-green-800' },
      closed: { label: 'Fermé', class: 'bg-gray-100 text-gray-800' },
    };
    const badge = badges[status as keyof typeof badges] || badges.new;
    return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${badge.class}`}>{badge.label}</span>;
  };

  const getPriorityBadge = (priority: string) => {
    const badges = {
      low: { label: 'Basse', class: 'bg-gray-100 text-gray-800' },
      normal: { label: 'Normale', class: 'bg-blue-100 text-blue-800' },
      high: { label: 'Haute', class: 'bg-orange-100 text-orange-800' },
      urgent: { label: 'Urgente', class: 'bg-red-100 text-red-800' },
    };
    const badge = badges[priority as keyof typeof badges] || badges.normal;
    return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${badge.class}`}>{badge.label}</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Support Client</h1>
              <p className="mt-2 text-sm text-gray-600">
                Gérez tous les tickets de support des utilisateurs
              </p>
            </div>
            <div className="flex space-x-2">
              <Link
                href="/docs/support-cheatsheet"
                target="_blank"
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                title="Cheat Sheet - Référence rapide"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Cheat Sheet</span>
              </Link>
              <Link
                href="/docs/support-guide"
                target="_blank"
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                title="Guide Complet CM"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span>Guide Complet</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{tickets.length}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Nouveaux</p>
                <p className="text-2xl font-bold text-blue-600">
                  {tickets.filter(t => t.status === 'new').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">En cours</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {tickets.filter(t => t.status === 'in_progress').length}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Attente client</p>
                <p className="text-2xl font-bold text-orange-600">
                  {tickets.filter(t => t.status === 'waiting_customer').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Résolus</p>
                <p className="text-2xl font-bold text-green-600">
                  {tickets.filter(t => t.status === 'resolved').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tickets List */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div className="flex space-x-2">
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                >
                  <option value="all">Tous statuts</option>
                  <option value="new">Nouveau</option>
                  <option value="in_progress">En cours</option>
                  <option value="waiting_customer">En attente client</option>
                  <option value="resolved">Résolu</option>
                  <option value="closed">Fermé</option>
                </select>

                <select
                  value={filters.priority}
                  onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                >
                  <option value="all">Toutes priorités</option>
                  <option value="low">Basse</option>
                  <option value="normal">Normale</option>
                  <option value="high">Haute</option>
                  <option value="urgent">Urgente</option>
                </select>
              </div>
            </div>

            <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 400px)' }}>
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
                </div>
              ) : filteredTickets.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">Aucun ticket trouvé</p>
                </div>
              ) : (
                filteredTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
                    className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedTicket?.id === ticket.id ? 'bg-primary-50 border-l-4 border-l-primary-600' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">{ticket.subject}</h3>
                      {getPriorityBadge(ticket.priority)}
                    </div>
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">{ticket.messages?.[0]?.message || 'Pas de message'}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <User className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {ticket.user.firstName} {ticket.user.lastName}
                        </span>
                      </div>
                      {getStatusBadge(ticket.status)}
                    </div>
                    <div className="flex items-center mt-2">
                      <Calendar className="h-3 w-3 text-gray-400 mr-1" />
                      <span className="text-xs text-gray-500">{formatDate(ticket.createdAt)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Ticket Detail */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow">
            {selectedTicket ? (
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-gray-900 mb-2">{selectedTicket.subject}</h2>
                      <div className="flex items-center space-x-4">
                        {getStatusBadge(selectedTicket.status)}
                        {getPriorityBadge(selectedTicket.priority)}
                        <span className="text-sm text-gray-500">#{selectedTicket.id.slice(0, 8)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-600">
                        {selectedTicket.user.firstName} {selectedTicket.user.lastName}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-600">{selectedTicket.user.email}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-600">{formatDate(selectedTicket.createdAt)}</span>
                    </div>
                    <div className="flex items-center">
                      <MessageSquare className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-600">{selectedTicket.category}</span>
                    </div>
                  </div>

                  {/* Status Actions */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => handleUpdateStatus(selectedTicket.id, 'in_progress')}
                      disabled={selectedTicket.status === 'in_progress'}
                      className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      En cours
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedTicket.id, 'waiting_customer')}
                      disabled={selectedTicket.status === 'waiting_customer'}
                      className="px-3 py-1 bg-orange-100 text-orange-800 rounded-md hover:bg-orange-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      En attente client
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedTicket.id, 'resolved')}
                      disabled={selectedTicket.status === 'resolved'}
                      className="px-3 py-1 bg-green-100 text-green-800 rounded-md hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      Résolu
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedTicket.id, 'closed')}
                      disabled={selectedTicket.status === 'closed'}
                      className="px-3 py-1 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      Fermer
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4" style={{ maxHeight: 'calc(100vh - 550px)' }}>
                  {/* Original Message */}
                  {selectedTicket.messages && selectedTicket.messages.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                          {selectedTicket.user.firstName[0]}{selectedTicket.user.lastName[0]}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-semibold text-gray-900">
                            {selectedTicket.user.firstName} {selectedTicket.user.lastName}
                          </p>
                          <p className="text-xs text-gray-500">{formatDate(selectedTicket.messages[0].createdAt)}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedTicket.messages[0].message}</p>
                    </div>
                  )}

                  {/* Messages */}
                  {selectedTicket.messages?.map((msg) => {
                    const isAdminMessage = msg.userId !== selectedTicket.userId;
                    return (
                      <div
                        key={msg.id}
                        className={`rounded-lg p-4 ${
                          isAdminMessage ? 'bg-primary-50 ml-8' : 'bg-gray-50 mr-8'
                        }`}
                      >
                        <div className="flex items-center mb-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold ${
                            isAdminMessage ? 'bg-green-600' : 'bg-primary-600'
                          }`}>
                            {isAdminMessage ? 'A' : 'U'}
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-semibold text-gray-900">
                              {isAdminMessage
                                ? `${msg.user?.firstName || 'Admin'} ${msg.user?.lastName || ''} (Admin)`
                                : `${selectedTicket.user.firstName} ${selectedTicket.user.lastName}`}
                            </p>
                            <p className="text-xs text-gray-500">{formatDate(msg.createdAt)}</p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{msg.message}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Response Form */}
                <div className="p-6 border-t border-gray-200">
                  <div className="flex space-x-4">
                    <textarea
                      value={responseMessage}
                      onChange={(e) => setResponseMessage(e.target.value)}
                      placeholder="Écrivez votre réponse... (Un email sera automatiquement envoyé à l'utilisateur)"
                      rows={3}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <button
                      onClick={handleSendResponse}
                      disabled={isSending || !responseMessage.trim()}
                      className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      {isSending ? (
                        <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          <span>Envoyer</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    💡 Un email sera automatiquement envoyé à l'utilisateur avec votre réponse
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <MessageSquare className="mx-auto h-16 w-16 text-gray-400" />
                  <p className="mt-4 text-lg font-medium text-gray-900">Sélectionnez un ticket</p>
                  <p className="mt-2 text-sm text-gray-500">
                    Choisissez un ticket dans la liste pour voir les détails et répondre
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
