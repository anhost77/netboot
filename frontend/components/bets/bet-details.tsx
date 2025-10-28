'use client';

import { X, Calendar, DollarSign, TrendingUp, MapPin, Building2, Tag, FileText, Hash, Trophy, Ticket } from 'lucide-react';
import type { Bet } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';

interface BetDetailsProps {
  bet: Bet;
  onClose: () => void;
  onEdit?: () => void;
}

export function BetDetails({ bet, onClose, onEdit }: BetDetailsProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'won':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'lost':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'refunded':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      pending: 'En cours',
      won: 'Gagné',
      lost: 'Perdu',
      refunded: 'Remboursé',
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getBetTypeLabel = (betType: string | null | undefined) => {
    if (!betType) return null;
    const labels: Record<string, string> = {
      gagnant: 'Simple Gagnant',
      place: 'Simple Placé',
      gagnant_place: 'Couplé Gagnant-Placé',
      couple: 'Couplé',
      couple_ordre: 'Couplé Ordre',
      trio: 'Trio',
      trio_ordre: 'Trio Ordre',
      quarte: 'Quarté',
      quarte_ordre: 'Quarté Ordre',
      quinte: 'Quinté',
      quinte_ordre: 'Quinté Ordre',
      multi: 'Multi',
      pick5: 'Pick 5',
      autre: 'Autre',
    };
    return labels[betType] || betType;
  };

  const isProfitable = (bet.profit || 0) > 0;
  const hasProfit = bet.profit !== null && bet.profit !== undefined;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold text-gray-900">Détails du pari</h2>
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(bet.status)}`}>
              {getStatusLabel(bet.status)}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-blue-700 mb-2">
                <DollarSign className="h-5 w-5" />
                <span className="text-sm font-medium">Mise</span>
              </div>
              <p className="text-2xl font-bold text-blue-900">{formatCurrency(Number(bet.stake))}</p>
              {bet.odds && (
                <p className="text-sm text-blue-600 mt-1">Cote: {Number(bet.odds).toFixed(2)}</p>
              )}
            </div>

            {bet.payout !== null && bet.payout !== undefined && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 text-purple-700 mb-2">
                  <TrendingUp className="h-5 w-5" />
                  <span className="text-sm font-medium">Gain</span>
                </div>
                <p className="text-2xl font-bold text-purple-900">{formatCurrency(Number(bet.payout))}</p>
                <p className="text-sm text-purple-600 mt-1">
                  Retour: {Number(bet.payout) > 0 ? ((Number(bet.payout) / Number(bet.stake)) * 100).toFixed(0) : 0}%
                </p>
              </div>
            )}

            {hasProfit && (
              <div className={`${isProfitable ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border rounded-lg p-4`}>
                <div className={`flex items-center space-x-2 mb-2 ${isProfitable ? 'text-green-700' : 'text-red-700'}`}>
                  <TrendingUp className="h-5 w-5" />
                  <span className="text-sm font-medium">Profit</span>
                </div>
                <p className={`text-2xl font-bold ${isProfitable ? 'text-green-900' : 'text-red-900'}`}>
                  {formatCurrency(Number(bet.profit || 0))}
                </p>
                <p className={`text-sm mt-1 ${isProfitable ? 'text-green-600' : 'text-red-600'}`}>
                  ROI: {Number(bet.stake) > 0 ? (((Number(bet.profit || 0)) / Number(bet.stake)) * 100).toFixed(1) : 0}%
                </p>
              </div>
            )}
          </div>

          {/* Information Details */}
          <div className="bg-gray-50 rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3">
                <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Date</p>
                  <p className="text-base text-gray-900">{formatDate(bet.date)}</p>
                </div>
              </div>

              {bet.platform && (
                <div className="flex items-start space-x-3">
                  <Building2 className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Plateforme</p>
                    <p className="text-base text-gray-900">{bet.platform}</p>
                  </div>
                </div>
              )}

              {bet.hippodrome && (
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Hippodrome</p>
                    <p className="text-base text-gray-900">{bet.hippodrome}</p>
                  </div>
                </div>
              )}

              {bet.raceNumber && (
                <div className="flex items-start space-x-3">
                  <Hash className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Numéro de course</p>
                    <p className="text-base text-gray-900">{bet.raceNumber}</p>
                  </div>
                </div>
              )}

              {bet.betType && (
                <div className="flex items-start space-x-3">
                  <Ticket className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Type de pari</p>
                    <p className="text-base text-gray-900">{getBetTypeLabel(bet.betType)}</p>
                  </div>
                </div>
              )}

              {bet.horsesSelected && (
                <div className="flex items-start space-x-3">
                  <Trophy className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Chevaux sélectionnés</p>
                    <p className="text-base text-gray-900">{bet.horsesSelected}</p>
                  </div>
                </div>
              )}

              {bet.winningHorse && (
                <div className="flex items-start space-x-3">
                  <Trophy className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Cheval gagnant</p>
                    <p className="text-base font-semibold text-yellow-600">{bet.winningHorse}</p>
                  </div>
                </div>
              )}
            </div>

            {bet.tags && bet.tags.length > 0 && (
              <div className="flex items-start space-x-3 pt-4 border-t border-gray-200">
                <Tag className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {bet.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {bet.notes && (
              <div className="flex items-start space-x-3 pt-4 border-t border-gray-200">
                <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Notes</p>
                  <p className="text-base text-gray-900 whitespace-pre-wrap">{bet.notes}</p>
                </div>
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="text-xs text-gray-500 space-y-1 pt-4 border-t border-gray-200">
            <p>Créé le: {new Date(bet.createdAt).toLocaleString('fr-FR')}</p>
            {bet.updatedAt !== bet.createdAt && (
              <p>Modifié le: {new Date(bet.updatedAt).toLocaleString('fr-FR')}</p>
            )}
            <p className="text-gray-400">ID: {bet.id}</p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
          >
            Fermer
          </button>
          {onEdit && bet.status === 'pending' && (
            <button
              onClick={onEdit}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
            >
              Modifier
            </button>
          )}
          {onEdit && (bet.status === 'won' || bet.status === 'lost') && (
            <div className="px-4 py-2 text-sm text-gray-500 italic flex items-center">
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Modification impossible (pari terminé)
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
