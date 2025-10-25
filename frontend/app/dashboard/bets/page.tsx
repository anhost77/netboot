'use client';

import { useEffect, useState } from 'react';
import { betsAPI, type BetsFilters } from '@/lib/api/bets';
import type { Bet, PaginatedResponse, CreateBetData } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { BetForm } from '@/components/bets/bet-form';
import { BetDetails } from '@/components/bets/bet-details';
import {
  Plus,
  Filter,
  Download,
  Search,
  Edit,
  Trash2,
  Eye,
  TrendingUp,
  TrendingDown,
  Wallet,
  Target,
  CheckCircle,
  XCircle,
} from 'lucide-react';

// Helper function to get bet type label in French
const getBetTypeLabel = (betType: string | null | undefined) => {
  if (!betType) return '-';
  const labels: Record<string, string> = {
    gagnant: 'Gagnant',
    place: 'Placé',
    gagnant_place: 'G-P',
    couple: 'Couplé',
    couple_ordre: 'C. Ordre',
    trio: 'Trio',
    trio_ordre: 'T. Ordre',
    quarte: 'Quarté',
    quarte_ordre: 'Q. Ordre',
    quinte: 'Quinté',
    quinte_ordre: 'Q+Ordre',
    multi: 'Multi',
    pick5: 'Pick 5',
    autre: 'Autre',
  };
  return labels[betType] || betType;
};

export default function BetsPage() {
  const [bets, setBets] = useState<PaginatedResponse<Bet> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<BetsFilters>({
    page: 1,
    limit: 10,
    sortBy: 'date',
    sortOrder: 'desc',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedBet, setSelectedBet] = useState<Bet | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load bets
  useEffect(() => {
    loadBets();
  }, [filters]);

  const loadBets = async () => {
    try {
      setIsLoading(true);
      const data = await betsAPI.list(filters);
      setBets(data);
    } catch (error) {
      console.error('Failed to load bets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: CreateBetData) => {
    try {
      setIsSubmitting(true);
      if (selectedBet) {
        await betsAPI.update(selectedBet.id, data);
      } else {
        await betsAPI.create(data);
      }
      setShowAddModal(false);
      setSelectedBet(null);
      loadBets();
    } catch (error: any) {
      console.error('Failed to save bet:', error);

      // Extract detailed error message
      let errorMessage = 'Erreur lors de la sauvegarde du pari';

      if (error.response?.data?.message) {
        if (Array.isArray(error.response.data.message)) {
          errorMessage = error.response.data.message.join('\n');
        } else {
          errorMessage = error.response.data.message;
        }
      }

      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce pari ?')) return;

    try {
      await betsAPI.delete(id);
      loadBets();
    } catch (error) {
      console.error('Failed to delete bet:', error);
      alert('Erreur lors de la suppression du pari');
    }
  };

  const handleQuickStatus = async (id: string, status: 'won' | 'lost') => {
    try {
      // Trouver le pari pour accéder à stake et odds
      const bet = bets?.data.find(b => b.id === id);
      if (!bet) {
        alert('Pari non trouvé');
        return;
      }

      let updateData: any = { status };

      // Pour un pari gagné, calculer le payout depuis les odds
      if (status === 'won') {
        const stake = Number(bet.stake);
        const odds = Number(bet.odds);

        if (!odds || odds <= 1) {
          // Si pas de cote, demander le payout manuellement
          const payoutStr = prompt('Les cotes ne sont pas renseignées.\nMontant du gain total (payout en €) :');
          if (!payoutStr) return; // Annulé

          const payout = parseFloat(payoutStr);
          if (isNaN(payout) || payout <= 0) {
            alert('Montant invalide');
            return;
          }
          updateData.payout = payout;
        } else {
          // Calculer le payout automatiquement : stake × odds
          updateData.payout = stake * odds;
        }
      } else if (status === 'lost') {
        // Pour un pari perdu : payout = 0
        updateData.payout = 0;
      }

      await betsAPI.update(id, updateData);
      loadBets();
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Erreur lors de la mise à jour du statut');
    }
  };

  const handleExport = async (format: 'csv' | 'excel') => {
    try {
      const blob = await betsAPI.export(format, filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bets-export.${format === 'csv' ? 'csv' : 'xlsx'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to export:', error);
      alert("Erreur lors de l'export");
    }
  };

  // Calculate summary statistics
  const stats = {
    total: bets?.meta.total || 0,
    pending: bets?.data.filter((b) => b.status === 'pending').length || 0,
    won: bets?.data.filter((b) => b.status === 'won').length || 0,
    lost: bets?.data.filter((b) => b.status === 'lost').length || 0,
    totalStake: bets?.data.reduce((sum, b) => sum + Number(b.stake), 0) || 0,
    totalProfit: bets?.data.reduce((sum, b) => sum + Number(b.profit || 0), 0) || 0,
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      won: 'bg-green-100 text-green-800',
      lost: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800',
    };
    const labels = {
      pending: 'En cours',
      won: 'Gagné',
      lost: 'Perdu',
      refunded: 'Remboursé',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Paris</h1>
          <p className="mt-2 text-gray-600">Gérez tous vos paris hippiques</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Nouveau pari</span>
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Paris</p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">{stats.total}</p>
            </div>
            <div className="bg-blue-500 rounded-lg p-3">
              <Target className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Mise totale</p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">{formatCurrency(stats.totalStake)}</p>
            </div>
            <div className="bg-purple-500 rounded-lg p-3">
              <Wallet className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Profit total</p>
              <p className={`mt-2 text-3xl font-semibold ${stats.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(stats.totalProfit)}
              </p>
            </div>
            <div className={`${stats.totalProfit >= 0 ? 'bg-green-500' : 'bg-red-500'} rounded-lg p-3`}>
              {stats.totalProfit >= 0 ? (
                <TrendingUp className="h-6 w-6 text-white" />
              ) : (
                <TrendingDown className="h-6 w-6 text-white" />
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Taux de réussite</p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">
                {stats.total > 0 ? Math.round((stats.won / stats.total) * 100) : 0}%
              </p>
              <p className="mt-1 text-xs text-gray-500">
                {stats.won} gagnés / {stats.total} paris
              </p>
            </div>
            <div className="bg-orange-500 rounded-lg p-3">
              <Target className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-4 py-2 border rounded-md transition-colors ${
                showFilters ? 'bg-primary-50 border-primary-600 text-primary-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Filter className="h-4 w-4" />
              <span>Filtres</span>
            </button>

            {/* Status filter */}
            <select
              value={filters.status || ''}
              onChange={(e) => setFilters({ ...filters, status: e.target.value || undefined, page: 1 })}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Tous les statuts</option>
              <option value="pending">En cours</option>
              <option value="won">Gagné</option>
              <option value="lost">Perdu</option>
              <option value="refunded">Remboursé</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleExport('csv')}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => handleExport('excel')}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Export Excel</span>
            </button>
          </div>
        </div>

        {/* Extended Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plateforme</label>
              <input
                type="text"
                placeholder="Ex: PMU, Betclic..."
                value={filters.platform || ''}
                onChange={(e) => setFilters({ ...filters, platform: e.target.value || undefined, page: 1 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date début</label>
              <input
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value || undefined, page: 1 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date fin</label>
              <input
                type="date"
                value={filters.endDate || ''}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value || undefined, page: 1 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Bets Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hippodrome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mise</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cote</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex justify-center">
                      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
                    </div>
                    <p className="mt-2">Chargement...</p>
                  </td>
                </tr>
              ) : !bets || bets.data.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-gray-500">
                    <div className="text-6xl mb-4">🏇</div>
                    <p>Aucun pari trouvé</p>
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                    >
                      Ajouter votre premier pari
                    </button>
                  </td>
                </tr>
              ) : (
                bets.data.map((bet) => (
                  <tr key={bet.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(bet.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {bet.raceNumber ? `R${bet.raceNumber}` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {bet.betType ? getBetTypeLabel(bet.betType) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {bet.hippodrome || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(bet.stake)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {bet.odds ? Number(bet.odds).toFixed(2) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {getStatusBadge(bet.status)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                      (bet.profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {bet.profit ? formatCurrency(bet.profit) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {bet.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleQuickStatus(bet.id, 'won')}
                              className="text-green-600 hover:text-green-900"
                              title="Marquer comme gagné"
                            >
                              <CheckCircle className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleQuickStatus(bet.id, 'lost')}
                              className="text-red-600 hover:text-red-900"
                              title="Marquer comme perdu"
                            >
                              <XCircle className="h-5 w-5" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => {
                            setSelectedBet(bet);
                            setShowDetailsModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="Voir détails"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedBet(bet);
                            setShowAddModal(true);
                          }}
                          className="text-gray-600 hover:text-gray-900"
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(bet.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {bets && bets.meta.total > 0 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setFilters({ ...filters, page: (filters.page || 1) - 1 })}
                disabled={bets.meta.page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Précédent
              </button>
              <button
                onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}
                disabled={bets.meta.page === bets.meta.totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Suivant
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Affichage de <span className="font-medium">{(bets.meta.page - 1) * bets.meta.limit + 1}</span> à{' '}
                  <span className="font-medium">
                    {Math.min(bets.meta.page * bets.meta.limit, bets.meta.total)}
                  </span>{' '}
                  sur <span className="font-medium">{bets.meta.total}</span> résultats
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setFilters({ ...filters, page: (filters.page || 1) - 1 })}
                    disabled={bets.meta.page === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Précédent
                  </button>
                  <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                    Page {bets.meta.page} sur {bets.meta.totalPages}
                  </span>
                  <button
                    onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}
                    disabled={bets.meta.page === bets.meta.totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Suivant
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <BetForm
          bet={selectedBet}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowAddModal(false);
            setSelectedBet(null);
          }}
          isLoading={isSubmitting}
        />
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedBet && (
        <BetDetails
          bet={selectedBet}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedBet(null);
          }}
          onEdit={() => {
            setShowDetailsModal(false);
            setShowAddModal(true);
          }}
        />
      )}
    </div>
  );
}
