'use client';

import { Bet } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';
import Link from 'next/link';

interface RecentBetsCardProps {
  bets: Bet[];
  isLoading?: boolean;
}

export default function RecentBetsCard({ bets, isLoading }: RecentBetsCardProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Paris Récents</h2>
        </div>
        <div className="p-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Chargement...</p>
          </div>
        </div>
      </div>
    );
  }

  if (bets.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Paris Récents</h2>
        </div>
        <div className="p-6">
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🏇</div>
            <p className="text-gray-500 mb-4">Aucun pari récent</p>
            <Link
              href="/dashboard/bets"
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
            >
              Ajouter un pari
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      won: 'bg-green-100 text-green-800',
      lost: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800',
      refunded: 'bg-gray-100 text-gray-800',
    };
    const labels = {
      won: 'Gagné',
      lost: 'Perdu',
      pending: 'En cours',
      refunded: 'Remboursé',
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Paris Récents</h2>
        <Link
          href="/dashboard/bets"
          className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center space-x-1"
        >
          <span>Voir tout</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="divide-y divide-gray-200">
        {bets.map((bet) => (
          <div key={bet.id} className="p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <p className="font-medium text-gray-900">
                        {bet.hippodrome || 'Hippodrome non spécifié'}
                      </p>
                      {bet.raceNumber && (
                        <span className="text-sm text-gray-500">Course {bet.raceNumber}</span>
                      )}
                    </div>
                    <div className="mt-1 flex items-center space-x-3 text-sm text-gray-500">
                      <span>{new Date(bet.date).toLocaleDateString('fr-FR')}</span>
                      {bet.betType && <span className="capitalize">{bet.betType.replace('_', ' ')}</span>}
                      {bet.platform && <span>• {bet.platform}</span>}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm text-gray-500">Mise</p>
                  <p className="font-medium text-gray-900">{formatCurrency(bet.stake)}</p>
                </div>
                {bet.profit !== null && bet.profit !== undefined && (
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Profit</p>
                    <div className="flex items-center space-x-1">
                      {bet.profit > 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : bet.profit < 0 ? (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      ) : null}
                      <p
                        className={`font-medium ${
                          bet.profit > 0
                            ? 'text-green-600'
                            : bet.profit < 0
                            ? 'text-red-600'
                            : 'text-gray-900'
                        }`}
                      >
                        {bet.profit >= 0 ? '+' : ''}
                        {formatCurrency(bet.profit)}
                      </p>
                    </div>
                  </div>
                )}
                <div>{getStatusBadge(bet.status)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <Link
          href="/dashboard/bets"
          className="block text-center text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          Voir tous les paris →
        </Link>
      </div>
    </div>
  );
}
