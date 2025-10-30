'use client';

import { useState, useEffect } from 'react';
import MarketingHeader from '@/components/marketing/MarketingHeader';
import MarketingFooter from '@/components/marketing/MarketingFooter';
import Link from 'next/link';
import { Search, TrendingUp, Trophy, Target, User } from 'lucide-react';
import { API_URL } from '@/lib/config';

interface Jockey {
  name: string;
  totalRaces: number;
  wins: number;
  podiums: number;
  winRate: number;
  podiumRate: number;
}

export default function JockeysPage() {
  const [jockeys, setJockeys] = useState<Jockey[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadJockeys();
  }, [page, search]);

  const loadJockeys = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
        ...(search && { search }),
      });
      
      const response = await fetch(`${API_URL}/pmu-test/public/jockeys?${params}`);
      if (response.ok) {
        const data = await response.json();
        setJockeys(data.jockeys);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error loading jockeys:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadJockeys();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MarketingHeader />

      {/* Hero */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <User className="w-12 h-12" />
              <h1 className="text-4xl md:text-5xl font-bold">Base de données des Jockeys</h1>
            </div>
            <p className="text-xl text-primary-100">
              Statistiques complètes et historique de performance de tous les jockeys
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="container mx-auto px-4 -mt-8">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSearch} className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher un jockey..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
              >
                Rechercher
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Liste des jockeys */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              <p className="mt-4 text-gray-600">Chargement...</p>
            </div>
          ) : jockeys.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-lg">
              <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-xl text-gray-600">Aucun jockey trouvé</p>
            </div>
          ) : (
            <>
              <div className="grid gap-4">
                {jockeys.map((jockey) => (
                  <Link
                    key={jockey.name}
                    href={`/jockey/${encodeURIComponent(jockey.name)}`}
                    className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors mb-2">
                          {jockey.name}
                        </h3>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <TrendingUp className="w-4 h-4" />
                            <span>{jockey.totalRaces} courses</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Trophy className="w-4 h-4 text-yellow-500" />
                            <span>{jockey.wins} victoires</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Target className="w-4 h-4 text-blue-500" />
                            <span>{jockey.podiums} podiums</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-primary-600">
                          {jockey.winRate}%
                        </div>
                        <div className="text-sm text-gray-500">Taux de victoire</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Précédent
                  </button>
                  <span className="px-4 py-2 bg-white border border-gray-300 rounded-lg">
                    Page {page} sur {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Suivant
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <MarketingFooter />
    </div>
  );
}
