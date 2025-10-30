'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import MarketingHeader from '@/components/marketing/MarketingHeader';
import MarketingFooter from '@/components/marketing/MarketingFooter';
import Link from 'next/link';
import { Trophy, TrendingUp, Target, Calendar, MapPin, User } from 'lucide-react';
import { API_URL } from '@/lib/config';

interface HorseStats {
  totalRaces: number;
  wins: number;
  podiums: number;
  winRate: number;
  podiumRate: number;
  avgPosition: number | null;
}

interface Performance {
  date: Date;
  hippodrome: string;
  raceName: string;
  discipline: string;
  distance: number;
  position: number;
  nbParticipants: number;
  jockey: string;
  prize: number;
}

interface HorseData {
  id: string;
  name: string;
  stats: HorseStats;
  recentPerformances: Performance[];
}

export default function ChevalDetailPage() {
  const params = useParams();
  const name = decodeURIComponent(params.name as string);
  
  const [horse, setHorse] = useState<HorseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadHorse();
  }, [name]);

  const loadHorse = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/pmu/public/horse/${encodeURIComponent(name)}`);
      if (response.ok) {
        const data = await response.json();
        setHorse(data);
      } else {
        setError('Cheval non trouvé');
      }
    } catch (error) {
      console.error('Error loading horse:', error);
      setError('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MarketingHeader />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
        <MarketingFooter />
      </div>
    );
  }

  if (error || !horse) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MarketingHeader />
        <div className="container mx-auto px-4 py-20 text-center">
          <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{error}</h1>
          <Link href="/chevaux" className="text-primary-600 hover:underline">
            Retour à la liste des chevaux
          </Link>
        </div>
        <MarketingFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MarketingHeader />

      {/* Hero */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Link href="/chevaux" className="text-primary-100 hover:text-white mb-4 inline-block">
              ← Retour aux chevaux
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{horse.name}</h1>
            <p className="text-xl text-primary-100">
              Statistiques et historique de performance
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="container mx-auto px-4 -mt-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <TrendingUp className="w-8 h-8 text-primary-600 mx-auto mb-2" />
              <div className="text-3xl font-bold text-gray-900">{horse.stats.totalRaces}</div>
              <div className="text-sm text-gray-600">Courses</div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <div className="text-3xl font-bold text-gray-900">{horse.stats.wins}</div>
              <div className="text-sm text-gray-600">Victoires</div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <Target className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <div className="text-3xl font-bold text-gray-900">{horse.stats.podiums}</div>
              <div className="text-sm text-gray-600">Podiums</div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <div className="text-3xl font-bold text-gray-900">{horse.stats.winRate}%</div>
              <div className="text-sm text-gray-600">Taux victoire</div>
            </div>
          </div>
        </div>
      </div>

      {/* Performances récentes */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Performances récentes</h2>
          
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hippodrome
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Course
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Jockey
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Position
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {horse.recentPerformances.map((perf, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {new Date(perf.date).toLocaleDateString('fr-FR')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          {perf.hippodrome}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div>{perf.raceName || 'N/A'}</div>
                        <div className="text-xs text-gray-500">
                          {perf.discipline} - {perf.distance}m
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          {perf.jockey || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                          perf.position === 1 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : perf.position <= 3 
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {perf.position}e / {perf.nbParticipants}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <MarketingFooter />
    </div>
  );
}
