'use client';

import React, { useEffect, useState } from 'react';
import { pmuStatsAPI, type PmuDataStats, type PmuHippodrome, type PmuRace, type PmuHorse, type HorsePerformanceStats } from '@/lib/api/pmu-stats';
import { MapPin, Trophy, TrendingUp, Calendar, Award, Star, Target, BarChart3, Activity, Info, Download } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { HorsePerformanceCard } from '../bets/horse-performance-card';
import { JockeyStatsSection } from './jockey-stats-section';
import { CrossStatsSection } from './cross-stats-section';
import { toast } from 'react-hot-toast';

interface HippodromeStats {
  name: string;
  code: string;
  totalRaces: number;
  avgWinRate: number;
  avgOdds: number;
  profitability: number;
}

interface DisciplineStats {
  discipline: string;
  totalRaces: number;
  winRate: number;
  avgOdds: number;
  roi: number;
}

interface OddsRangeStats {
  range: string;
  totalBets: number;
  wins: number;
  winRate: number;
  roi: number;
  avgProfit: number;
}

export function PmuStatsSection() {
  const [stats, setStats] = useState<PmuDataStats | null>(null);
  const [hippodromes, setHippodromes] = useState<PmuHippodrome[]>([]);
  const [recentRaces, setRecentRaces] = useState<PmuRace[]>([]);
  const [horsePerformance, setHorsePerformance] = useState<HorsePerformanceStats[]>([]);
  const [myBetHorses, setMyBetHorses] = useState<HorsePerformanceStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedHorse, setSelectedHorse] = useState<string | null>(null);
  const [selectedHippodrome, setSelectedHippodrome] = useState<PmuHippodrome | null>(null);
  const [hippodromeStats, setHippodromeStats] = useState<any>(null);
  const [loadingHippodromeStats, setLoadingHippodromeStats] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState<'hippodromes' | 'horses' | 'races' | 'bets' | null>(null);

  useEffect(() => {
    loadPmuStats();
  }, []);

  const loadPmuStats = async () => {
    try {
      setIsLoading(true);
      console.log('🔍 Loading PMU stats...');
      
      // Charger les stats (maintenant optimisées côté backend)
      const [statsData, hippodromesData, racesData, performanceData, myBetHorsesData] = await Promise.all([
        pmuStatsAPI.getStats(),
        pmuStatsAPI.getMyHippodromes(), // Seulement les hippodromes où l'utilisateur a parié
        pmuStatsAPI.getRaces(10),
        pmuStatsAPI.getHorsePerformance(),
        pmuStatsAPI.getMyBetHorsesPerformance(),
      ]);

      console.log('📊 PMU Stats loaded:', { statsData, hippodromesData, racesData, performanceData, myBetHorsesData });

      setStats(statsData);
      setHippodromes(hippodromesData);
      setRecentRaces(racesData);
      setHorsePerformance(performanceData);
      setMyBetHorses(myBetHorsesData);
    } catch (error) {
      console.error('❌ Failed to load PMU stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadHippodromeStats = async (hippodrome: PmuHippodrome) => {
    try {
      setLoadingHippodromeStats(true);
      const stats = await pmuStatsAPI.getHippodromeStats(hippodrome.code);
      setHippodromeStats(stats);
      setSelectedHippodrome(hippodrome);
    } catch (error) {
      console.error('Failed to load hippodrome stats:', error);
    } finally {
      setLoadingHippodromeStats(false);
    }
  };

  const exportHippodromesToCSV = () => {
    if (!hippodromes.length) {
      toast.error('Aucune donnée à exporter');
      return;
    }
    const csv = [
      'Hippodrome,Code,Courses,Taux Victoire (%),Cote Moyenne,Rentabilité (%)',
      ...hippodromes.map((h: any) => `${h.name},${h.code},${h.totalRaces || 0},${(h.avgWinRate || 0).toFixed(2)},${(h.avgOdds || 0).toFixed(2)},${(h.profitability || 0).toFixed(2)}`)
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'hippodromes.csv';
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Export CSV réussi');
  };

  const exportHippodromesToExcel = () => {
    if (!hippodromes.length) {
      toast.error('Aucune donnée à exporter');
      return;
    }
    const tsv = [
      'Hippodrome\tCode\tCourses\tTaux Victoire (%)\tCote Moyenne\tRentabilité (%)',
      ...hippodromes.map((h: any) => `${h.name}\t${h.code}\t${h.totalRaces || 0}\t${(h.avgWinRate || 0).toFixed(2)}\t${(h.avgOdds || 0).toFixed(2)}\t${(h.profitability || 0).toFixed(2)}`)
    ].join('\n');
    const blob = new Blob([tsv], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'hippodromes.xls';
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Export Excel réussi');
  };

  const exportHorsesToCSV = () => {
    if (!myBetHorses.length) {
      toast.error('Aucune donnée à exporter');
      return;
    }
    const csv = [
      'Cheval,Courses,Victoires,Taux Victoire (%),Position Moyenne,ROI (%)',
      ...myBetHorses.map((h: any) => `${h.horseName},${h.totalRaces || 0},${h.wins || 0},${(h.winRate || 0).toFixed(2)},${(h.avgPosition || 0).toFixed(2)},${(h.roi || 0).toFixed(2)}`)
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'chevaux.csv';
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Export CSV réussi');
  };

  const exportHorsesToExcel = () => {
    if (!myBetHorses.length) {
      toast.error('Aucune donnée à exporter');
      return;
    }
    const tsv = [
      'Cheval\tCourses\tVictoires\tTaux Victoire (%)\tPosition Moyenne\tROI (%)',
      ...myBetHorses.map((h: any) => `${h.horseName}\t${h.totalRaces || 0}\t${h.wins || 0}\t${(h.winRate || 0).toFixed(2)}\t${(h.avgPosition || 0).toFixed(2)}\t${(h.roi || 0).toFixed(2)}`)
    ].join('\n');
    const blob = new Blob([tsv], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'chevaux.xls';
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Export Excel réussi');
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
          <Trophy className="h-6 w-6 text-primary-600" />
          <span>Statistiques PMU</span>
        </h2>
      </div>

      {/* Stats Overview Cards with Mini Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Hippodromes où vous avez parié */}
        <div 
          onClick={() => setShowDetailModal('hippodromes')}
          className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200 hover:shadow-lg transition-shadow cursor-pointer hover:scale-105 transform transition-transform"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-medium text-blue-600">Hippodromes pariés</p>
              <p className="text-3xl font-bold text-blue-900">{hippodromes.length}</p>
              <p className="text-xs text-blue-600 mt-1">Lieux où vous pariez</p>
            </div>
            <MapPin className="h-10 w-10 text-blue-600 opacity-50" />
          </div>
          {/* Mini bar chart */}
          <div className="flex items-end space-x-1 h-12">
            {hippodromes.slice(0, 8).map((h, i) => (
              <div
                key={i}
                className="flex-1 bg-blue-500 rounded-t opacity-70 hover:opacity-100 transition-opacity"
                style={{ height: `${(h._count.races / Math.max(...hippodromes.map(x => x._count.races))) * 100}%` }}
                title={`${h.name}: ${h._count.races} courses`}
              />
            ))}
          </div>
        </div>

        {/* Chevaux pariés */}
        <div 
          onClick={() => setShowDetailModal('horses')}
          className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200 hover:shadow-lg transition-shadow cursor-pointer hover:scale-105 transform transition-transform"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-medium text-green-600">Chevaux pariés</p>
              <p className="text-3xl font-bold text-green-900">{myBetHorses.length}</p>
              <p className="text-xs text-green-600 mt-1">Dans vos paris</p>
            </div>
            <Trophy className="h-10 w-10 text-green-600 opacity-50" />
          </div>
          {/* Mini performance chart */}
          <div className="flex items-end space-x-1 h-12">
            {myBetHorses.slice(0, 8).map((h, i) => (
              <div
                key={i}
                className={`flex-1 rounded-t transition-opacity ${
                  h.winRate > 20 ? 'bg-green-600' : h.winRate > 10 ? 'bg-green-500' : 'bg-green-400'
                } opacity-70 hover:opacity-100`}
                style={{ height: `${Math.min(h.winRate * 3, 100)}%` }}
                title={`${h.horseName}: ${h.winRate.toFixed(1)}% victoires`}
              />
            ))}
          </div>
        </div>

        {/* Courses */}
        <div 
          onClick={() => setShowDetailModal('races')}
          className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200 hover:shadow-lg transition-shadow cursor-pointer hover:scale-105 transform transition-transform"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-medium text-purple-600">Courses pariées</p>
              <p className="text-3xl font-bold text-purple-900">{stats?.races || 0}</p>
              <p className="text-xs text-purple-600 mt-1">Avec vos paris</p>
            </div>
            <Award className="h-10 w-10 text-purple-600 opacity-50" />
          </div>
          {/* Mini timeline */}
          <div className="flex items-center space-x-1 h-12">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="flex-1 bg-purple-500 rounded opacity-60 hover:opacity-100 transition-opacity"
                style={{ height: `${30 + Math.random() * 70}%` }}
              />
            ))}
          </div>
        </div>

        {/* Paris PMU */}
        <div 
          onClick={() => setShowDetailModal('bets')}
          className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6 border border-orange-200 hover:shadow-lg transition-shadow cursor-pointer hover:scale-105 transform transition-transform"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-medium text-orange-600">Total Paris PMU</p>
              <p className="text-3xl font-bold text-orange-900">{stats?.betsLinkedToPmu || 0}</p>
              <p className="text-xs text-orange-600 mt-1">Avec données complètes</p>
            </div>
            <BarChart3 className="h-10 w-10 text-orange-600 opacity-50" />
          </div>
          {/* Mini trend */}
          <div className="flex items-end space-x-1 h-12">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="flex-1 bg-orange-500 rounded-t opacity-70 hover:opacity-100 transition-opacity"
                style={{ height: `${20 + (i * 8)}%` }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Insights Section */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg shadow border-l-4 border-yellow-500 p-6">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <Activity className="h-6 w-6 text-yellow-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">💡 Insights pour vos paris</h3>
            <p className="text-sm text-gray-700 mb-3">
              Utilisez les statistiques ci-dessous pour identifier les tendances et améliorer vos pronostics.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div className="bg-white rounded-lg p-3 border border-yellow-200">
                <p className="font-semibold text-gray-900 mb-1">🏇 Chevaux performants</p>
                <p className="text-xs text-gray-600">Identifiez les chevaux avec les meilleurs taux de victoire et podiums</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-yellow-200">
                <p className="font-semibold text-gray-900 mb-1">📍 Hippodromes favorables</p>
                <p className="text-xs text-gray-600">Certains hippodromes ont des tendances spécifiques à exploiter</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-yellow-200">
                <p className="font-semibold text-gray-900 mb-1">📊 Cotes rentables</p>
                <p className="text-xs text-gray-600">Analysez quelles plages de cotes sont les plus profitables</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hippodromes où vous avez parié - Accordéon */}
      <div className="mt-6">
        <details className="bg-white rounded-lg shadow">
          <summary className="cursor-pointer p-6 font-semibold text-lg hover:bg-gray-50 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-primary-600" />
              <span>🏟️ Hippodromes où vous avez parié ({hippodromes.length})</span>
            </div>
            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={exportHippodromesToCSV}
                className="flex items-center space-x-1 px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                title="Export CSV"
              >
                <Download className="h-3 w-3" />
                <span>CSV</span>
              </button>
              <button
                onClick={exportHippodromesToExcel}
                className="flex items-center space-x-1 px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                title="Export Excel"
              >
                <Download className="h-3 w-3" />
                <span>Excel</span>
              </button>
            </div>
          </summary>
          <div className="p-6 pt-0">
            <p className="text-sm text-gray-600 mb-4">
              Hippodromes sur lesquels vous avez placé des paris
            </p>
            {!hippodromes || hippodromes.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                Aucun hippodrome. Créez votre premier pari PMU !
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {hippodromes.map((hippodrome) => (
                  <div
                    key={hippodrome.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-primary-500 hover:shadow-md transition-all cursor-pointer"
                    onClick={() => loadHippodromeStats(hippodrome)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-bold text-primary-600">{hippodrome.code}</span>
                          <span className="text-sm text-gray-500">•</span>
                          <span className="font-semibold text-gray-900">{hippodrome.name}</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {hippodrome._count.races} course{hippodrome._count.races > 1 ? 's' : ''}
                        </p>
                        <button className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center space-x-1">
                          <BarChart3 className="h-3 w-3" />
                          <span>Voir les statistiques →</span>
                        </button>
                      </div>
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </details>
      </div>



      {/* My Bet Horses Performance Stats - Accordéon */}
      {myBetHorses && myBetHorses.length > 0 && (
        <div className="mt-6">
          <details className="bg-white rounded-lg shadow">
            <summary className="cursor-pointer p-6 font-semibold text-lg hover:bg-gray-50 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-blue-600" />
                <span>🏇 Mes Chevaux Pariés - Historique de Performance ({myBetHorses.length})</span>
              </div>
              <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={exportHorsesToCSV}
                  className="flex items-center space-x-1 px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                  title="Export CSV"
                >
                  <Download className="h-3 w-3" />
                  <span>CSV</span>
                </button>
                <button
                  onClick={exportHorsesToExcel}
                  className="flex items-center space-x-1 px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                  title="Export Excel"
                >
                  <Download className="h-3 w-3" />
                  <span>Excel</span>
                </button>
              </div>
            </summary>
            <div className="p-6 pt-0">
              <p className="text-sm text-gray-700 mb-4 bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
                <strong>📊 Analysez vos choix :</strong> Cette liste affiche uniquement les chevaux sur lesquels vous avez parié. 
                Comparez leurs performances réelles avec vos attentes pour améliorer vos futurs pronostics !
              </p>
            {/* Vue desktop - Tableau */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cheval</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Courses</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Victoires</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Podiums</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Taux victoire</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Taux podium</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Pos. moy.</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dernière course</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {myBetHorses.slice(0, 20).map((horse, idx) => (
                    <React.Fragment key={idx}>
                      <tr className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-gray-900">{horse.horseName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                        {horse.totalRaces}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <span className="text-sm font-semibold text-yellow-600">{horse.wins}</span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <span className="text-sm font-semibold text-blue-600">{horse.podiums}</span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <span className={`text-sm font-bold ${
                          horse.winRate >= 30 ? 'text-green-600' :
                          horse.winRate >= 15 ? 'text-yellow-600' :
                          'text-gray-600'
                        }`}>
                          {horse.winRate.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <span className={`text-sm font-bold ${
                          horse.podiumRate >= 50 ? 'text-green-600' :
                          horse.podiumRate >= 30 ? 'text-yellow-600' :
                          'text-gray-600'
                        }`}>
                          {horse.podiumRate.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                        {horse.avgPosition.toFixed(1)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                        {horse.lastRace && (
                          <div>
                            <div className="font-medium">{horse.lastRace.hippodrome}</div>
                            <div className="text-xs text-gray-500">
                              {new Date(horse.lastRace.date).toLocaleDateString('fr-FR')} - 
                              <span className={`ml-1 font-semibold ${
                                horse.lastRace.position === 1 ? 'text-yellow-600' :
                                horse.lastRace.position <= 3 ? 'text-blue-600' :
                                'text-gray-600'
                              }`}>
                                {horse.lastRace.position}ème
                              </span>
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => setSelectedHorse(selectedHorse === horse.horseName ? null : horse.horseName)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          {selectedHorse === horse.horseName ? 'Masquer' : 'Voir détails'}
                        </button>
                      </td>
                    </tr>
                    {selectedHorse === horse.horseName && (
                      <tr>
                        <td colSpan={9} className="px-4 py-4 bg-gray-50">
                          <HorsePerformanceCard horseId={horse.horseName} horseName={horse.horseName} />
                        </td>
                      </tr>
                    )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Vue mobile - Cartes */}
            <div className="md:hidden space-y-3">
              {myBetHorses.slice(0, 20).map((horse: any, idx) => (
                <div key={idx} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-semibold text-gray-900">{horse.horseName}</div>
                    <button
                      onClick={() => setSelectedHorse(selectedHorse === horse.horseName ? null : horse.horseName)}
                      className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1 rounded-full transition-colors"
                    >
                      {selectedHorse === horse.horseName ? 'Masquer' : 'Détails'}
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                    <div>
                      <span className="text-gray-500">Courses:</span>
                      <div className="font-semibold">{horse.totalRaces}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Victoires:</span>
                      <div className="font-semibold text-yellow-600">{horse.wins}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Podiums:</span>
                      <div className="font-semibold text-blue-600">{horse.podiums}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Pos. moy:</span>
                      <div className="font-semibold">{horse.avgPosition.toFixed(1)}</div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mb-3">
                    <div className="flex-1 bg-green-50 rounded p-2">
                      <div className="text-xs text-gray-500">Taux victoire</div>
                      <div className={`text-sm font-bold ${
                        horse.winRate >= 30 ? 'text-green-600' :
                        horse.winRate >= 15 ? 'text-yellow-600' :
                        'text-gray-600'
                      }`}>
                        {horse.winRate.toFixed(1)}%
                      </div>
                    </div>
                    <div className="flex-1 bg-blue-50 rounded p-2">
                      <div className="text-xs text-gray-500">Taux podium</div>
                      <div className={`text-sm font-bold ${
                        horse.podiumRate >= 50 ? 'text-green-600' :
                        horse.podiumRate >= 30 ? 'text-yellow-600' :
                        'text-gray-600'
                      }`}>
                        {horse.podiumRate.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  
                  {horse.lastRace && (
                    <div className="text-xs text-gray-600 bg-gray-50 rounded p-2">
                      <div className="font-medium">{horse.lastRace.hippodrome}</div>
                      <div>{new Date(horse.lastRace.date).toLocaleDateString('fr-FR')}</div>
                    </div>
                  )}
                  
                  {selectedHorse === horse.horseName && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <HorsePerformanceCard horseId={horse.horseName} horseName={horse.horseName} />
                    </div>
                  )}
                </div>
              ))}
            </div>
            </div>
          </details>
        </div>
      )}

      {/* Jockey Stats Section - Chargement à la demande */}
      <div className="mt-6">
        <details className="bg-white rounded-lg shadow">
          <summary className="cursor-pointer p-6 font-semibold text-lg hover:bg-gray-50">
            🏇 Mes Jockeys & Combinaisons (Cliquez pour charger)
          </summary>
          <div className="p-6 pt-0">
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4 rounded">
              <div className="flex items-start space-x-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-blue-800 mb-2">
                    <strong>📊 Statistiques Jockeys :</strong> Cette section affiche les statistiques des jockeys présents dans les courses où vous avez parié.
                  </p>
                  <p className="text-xs text-blue-700">
                    <strong>🔄 Synchronisation automatique :</strong> Si les données ne sont pas encore disponibles, elles seront récupérées automatiquement depuis l'API PMU lors du premier chargement. Cela peut prendre quelques secondes.
                  </p>
                </div>
              </div>
            </div>
            <JockeyStatsSection userBetsOnly={true} />
          </div>
        </details>
      </div>

      {/* Cross Stats Section - Chargement à la demande */}
      <div className="mt-6">
        <details className="bg-white rounded-lg shadow">
          <summary className="cursor-pointer p-6 font-semibold text-lg hover:bg-gray-50">
            🎯 Mes Statistiques Croisées (Hippodrome + Jockey + Cheval) (Cliquez pour charger)
          </summary>
          <div className="p-6 pt-0">
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4 rounded">
              <div className="flex items-start space-x-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-blue-800 mb-2">
                    <strong>🎯 Statistiques Croisées :</strong> Découvrez les combinaisons gagnantes entre hippodromes, jockeys et chevaux dans vos courses.
                  </p>
                  <p className="text-xs text-blue-700">
                    Ces statistiques vous aident à identifier les synergies : certains jockeys performent mieux sur certains hippodromes, certains chevaux excellent dans des lieux spécifiques.
                  </p>
                </div>
              </div>
            </div>
            <CrossStatsSection userBetsOnly={true} />
          </div>
        </details>
      </div>

      {/* Betting Tips Section - Basé sur VOS chevaux */}
      {myBetHorses && myBetHorses.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow border-l-4 border-blue-500 p-6">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <Star className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">📈 Analyse de vos paris</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                    <Trophy className="h-4 w-4 text-yellow-600" />
                    <span>Vos meilleurs chevaux</span>
                  </h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {myBetHorses.slice(0, 3).map((horse, idx) => (
                      <li key={idx} className="flex items-center space-x-2">
                        <span className="w-5 h-5 bg-yellow-400 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          {idx + 1}
                        </span>
                        <span className="font-medium">{horse.horseName}</span>
                        <span className="text-xs text-gray-500">
                          ({horse.winRate.toFixed(0)}% victoires)
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                    <Target className="h-4 w-4 text-green-600" />
                    <span>Stratégies recommandées</span>
                  </h4>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li className="flex items-start space-x-2">
                      <span className="text-green-600 mt-0.5">✓</span>
                      <span>Privilégiez les chevaux avec taux victoire &gt; 15%</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-green-600 mt-0.5">✓</span>
                      <span>Évitez les chevaux avec position moyenne &gt; 7</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-green-600 mt-0.5">✓</span>
                      <span>Analysez les tendances sur vos hippodromes favoris</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="mt-4 bg-white rounded-lg p-4 border border-blue-200">
                <p className="text-sm text-gray-700">
                  <strong className="text-blue-700">💰 Astuce :</strong> Analysez les performances de vos chevaux pariés 
                  pour identifier vos points forts et améliorer votre stratégie de sélection.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Statistiques Hippodrome */}
      {selectedHippodrome && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedHippodrome(null)}>
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-blue-50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                    <MapPin className="h-6 w-6 text-primary-600" />
                    <span>{selectedHippodrome.code} - {selectedHippodrome.name}</span>
                  </h2>
                  <p className="text-gray-600 mt-1">Statistiques de vos paris sur cet hippodrome</p>
                </div>
                <button
                  onClick={() => setSelectedHippodrome(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {loadingHippodromeStats ? (
                <div className="flex justify-center py-12">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
                </div>
              ) : hippodromeStats ? (
                <div className="space-y-6">
                  {/* Overview Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium text-blue-600 uppercase">Total Paris</p>
                          <p className="text-2xl font-bold text-blue-900">{hippodromeStats.totalBets}</p>
                        </div>
                        <Target className="h-8 w-8 text-blue-600 opacity-50" />
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium text-green-600 uppercase">Taux Réussite</p>
                          <p className="text-2xl font-bold text-green-900">{hippodromeStats.winRate.toFixed(1)}%</p>
                          <p className="text-xs text-green-600">{hippodromeStats.wonBets} gagnés</p>
                        </div>
                        <Trophy className="h-8 w-8 text-green-600 opacity-50" />
                      </div>
                    </div>

                    <div className={`bg-gradient-to-br rounded-lg p-4 border ${
                      hippodromeStats.profit >= 0 
                        ? 'from-emerald-50 to-emerald-100 border-emerald-200' 
                        : 'from-red-50 to-red-100 border-red-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`text-xs font-medium uppercase ${
                            hippodromeStats.profit >= 0 ? 'text-emerald-600' : 'text-red-600'
                          }`}>Profit/Perte</p>
                          <p className={`text-2xl font-bold ${
                            hippodromeStats.profit >= 0 ? 'text-emerald-900' : 'text-red-900'
                          }`}>
                            {formatCurrency(hippodromeStats.profit)}
                          </p>
                        </div>
                        <TrendingUp className={`h-8 w-8 opacity-50 ${
                          hippodromeStats.profit >= 0 ? 'text-emerald-600' : 'text-red-600'
                        }`} />
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium text-purple-600 uppercase">ROI</p>
                          <p className={`text-2xl font-bold ${
                            hippodromeStats.roi >= 0 ? 'text-purple-900' : 'text-red-900'
                          }`}>
                            {hippodromeStats.roi.toFixed(1)}%
                          </p>
                        </div>
                        <BarChart3 className="h-8 w-8 text-purple-600 opacity-50" />
                      </div>
                    </div>
                  </div>

                  {/* Stats par type de pari */}
                  {Object.keys(hippodromeStats.betsByType).length > 0 && (
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                        <BarChart3 className="h-5 w-5 text-primary-600" />
                        <span>Statistiques par type de pari</span>
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(hippodromeStats.betsByType).map(([type, data]: [string, any]) => (
                          <div key={type} className="border border-gray-200 rounded-lg p-4">
                            <h4 className="font-semibold text-gray-900 mb-2">{type}</h4>
                            <div className="space-y-1 text-sm">
                              <p className="text-gray-600">Paris: <span className="font-medium text-gray-900">{data.count}</span></p>
                              <p className="text-gray-600">Gagnés: <span className="font-medium text-green-600">{data.won}</span></p>
                              <p className="text-gray-600">Taux: <span className="font-medium text-blue-600">{((data.won / data.count) * 100).toFixed(1)}%</span></p>
                              <p className="text-gray-600">Mise: <span className="font-medium">{formatCurrency(data.stake)}</span></p>
                              <p className="text-gray-600">Gains: <span className="font-medium text-green-600">{formatCurrency(data.payout)}</span></p>
                              <p className={`font-semibold ${data.payout - data.stake >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatCurrency(data.payout - data.stake)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Stats par mois avec graphique */}
                  {Object.keys(hippodromeStats.betsByMonth).length > 0 && (
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                        <Calendar className="h-5 w-5 text-primary-600" />
                        <span>Évolution mensuelle</span>
                      </h3>
                      
                      {/* Graphique en barres */}
                      <div className="mb-6 bg-gray-50 rounded-lg p-4">
                        <div className="flex items-end justify-between space-x-2 h-64">
                          {Object.entries(hippodromeStats.betsByMonth).map(([month, data]: [string, any]) => {
                            const maxAbsProfit = Math.max(
                              ...Object.values(hippodromeStats.betsByMonth).map((d: any) => Math.abs(d.profit))
                            );
                            const heightPercent = maxAbsProfit > 0 ? (Math.abs(data.profit) / maxAbsProfit) * 100 : 0;
                            const isPositive = data.profit >= 0;
                            
                            return (
                              <div key={month} className="flex-1 flex flex-col items-center">
                                <div className="w-full flex flex-col items-center justify-end h-full">
                                  {/* Valeur au-dessus de la barre */}
                                  <div className={`text-xs font-semibold mb-1 ${
                                    isPositive ? 'text-green-600' : 'text-red-600'
                                  }`}>
                                    {formatCurrency(data.profit)}
                                  </div>
                                  {/* Barre */}
                                  <div
                                    className={`w-full rounded-t transition-all hover:opacity-80 ${
                                      isPositive 
                                        ? 'bg-gradient-to-t from-green-500 to-green-400' 
                                        : 'bg-gradient-to-t from-red-500 to-red-400'
                                    }`}
                                    style={{ 
                                      height: `${Math.max(heightPercent, 5)}%`,
                                      minHeight: '20px'
                                    }}
                                    title={`${month}: ${formatCurrency(data.profit)}`}
                                  />
                                </div>
                                {/* Label mois */}
                                <div className="text-xs text-gray-600 mt-2 text-center transform -rotate-45 origin-top-left w-16">
                                  {month}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        {/* Ligne zéro */}
                        <div className="border-t-2 border-gray-300 mt-2"></div>
                      </div>

                      {/* Tableau détaillé */}
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mois</th>
                              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Paris</th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Mise</th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Gains</th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Profit</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {Object.entries(hippodromeStats.betsByMonth).map(([month, data]: [string, any]) => (
                              <tr key={month} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm font-medium text-gray-900">{month}</td>
                                <td className="px-4 py-3 text-sm text-center text-gray-600">{data.count}</td>
                                <td className="px-4 py-3 text-sm text-right text-gray-900">{formatCurrency(data.stake)}</td>
                                <td className="px-4 py-3 text-sm text-right text-green-600">{formatCurrency(data.payout)}</td>
                                <td className={`px-4 py-3 text-sm text-right font-semibold ${
                                  data.profit >= 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {formatCurrency(data.profit)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Résumé */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-l-4 border-blue-500 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">📊 Résumé</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 mb-1">Mise totale</p>
                        <p className="text-xl font-bold text-gray-900">{formatCurrency(hippodromeStats.totalStake)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 mb-1">Gains totaux</p>
                        <p className="text-xl font-bold text-green-600">{formatCurrency(hippodromeStats.totalPayout)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 mb-1">Bilan</p>
                        <p className={`text-xl font-bold ${hippodromeStats.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(hippodromeStats.profit)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">Aucune donnée disponible</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modals de détails */}
      {showDetailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowDetailModal(null)}>
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="text-2xl font-bold text-gray-900">
                {showDetailModal === 'hippodromes' && '🏟️ Détails Hippodromes'}
                {showDetailModal === 'horses' && '🐴 Détails Chevaux'}
                {showDetailModal === 'races' && '🏁 Détails Courses'}
                {showDetailModal === 'bets' && '💰 Détails Paris'}
              </h3>
              <button
                onClick={() => setShowDetailModal(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Hippodromes */}
              {showDetailModal === 'hippodromes' && (
                <div className="space-y-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>📊 Analyse :</strong> Vous avez parié sur {hippodromes.length} hippodromes différents. 
                      Voici la répartition de vos paris par lieu.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {hippodromes.map((h, i) => (
                      <div key={i} className="border border-blue-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-bold text-gray-900">{h.code}</p>
                            <p className="text-sm text-gray-600">{h.name}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-blue-600">{h._count.races}</p>
                            <p className="text-xs text-gray-500">courses</p>
                          </div>
                        </div>
                        {/* Barre de progression */}
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all"
                            style={{ width: `${(h._count.races / Math.max(...hippodromes.map(x => x._count.races))) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Chevaux */}
              {showDetailModal === 'horses' && (
                <div className="space-y-6">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>📊 Analyse :</strong> Vous avez parié sur {myBetHorses.length} chevaux différents. 
                      Voici leurs performances détaillées.
                    </p>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cheval</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Courses</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Victoires</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Podiums</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Taux Victoire</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Performance</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {myBetHorses.slice(0, 20).map((horse, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm">{idx + 1}</td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{horse.horseName}</td>
                            <td className="px-4 py-3 text-sm text-center">{horse.totalRaces}</td>
                            <td className="px-4 py-3 text-sm text-center text-green-600 font-semibold">{horse.wins}</td>
                            <td className="px-4 py-3 text-sm text-center text-blue-600">{horse.podiums}</td>
                            <td className="px-4 py-3 text-sm text-center">
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                horse.winRate > 20 ? 'bg-green-100 text-green-800' :
                                horse.winRate > 10 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {horse.winRate.toFixed(1)}%
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    horse.winRate > 20 ? 'bg-green-600' :
                                    horse.winRate > 10 ? 'bg-yellow-500' :
                                    'bg-gray-400'
                                  }`}
                                  style={{ width: `${Math.min(horse.winRate * 3, 100)}%` }}
                                />
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Courses */}
              {showDetailModal === 'races' && (
                <div className="space-y-6">
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-sm text-purple-800">
                      <strong>📊 Analyse :</strong> Vous avez parié sur {stats?.races || 0} courses. 
                      Voici la répartition par hippodrome.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {hippodromes.slice(0, 9).map((h, i) => (
                      <div key={i} className="bg-white border border-purple-200 rounded-lg p-4 text-center">
                        <p className="text-sm font-medium text-gray-600">{h.code}</p>
                        <p className="text-3xl font-bold text-purple-600 my-2">{h._count.races}</p>
                        <p className="text-xs text-gray-500">courses</p>
                        <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                          <div 
                            className="bg-purple-500 h-1.5 rounded-full"
                            style={{ width: `${(h._count.races / Math.max(...hippodromes.map(x => x._count.races))) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Paris */}
              {showDetailModal === 'bets' && (
                <div className="space-y-6">
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <p className="text-sm text-orange-800">
                      <strong>📊 Analyse :</strong> Vous avez {stats?.betsLinkedToPmu || 0} paris avec données PMU complètes.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white border border-orange-200 rounded-lg p-6">
                      <h4 className="font-semibold text-gray-900 mb-4">📈 Répartition</h4>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Paris avec données PMU</span>
                            <span className="font-semibold">{stats?.betsLinkedToPmu || 0}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-orange-500 h-2 rounded-full" style={{ width: '100%' }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Hippodromes couverts</span>
                            <span className="font-semibold">{hippodromes.length}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(hippodromes.length / 20) * 100}%` }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Chevaux différents</span>
                            <span className="font-semibold">{myBetHorses.length}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(myBetHorses.length / 50) * 100}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border border-orange-200 rounded-lg p-6">
                      <h4 className="font-semibold text-gray-900 mb-4">💡 Insights</h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-start space-x-2">
                          <span className="text-orange-500">•</span>
                          <p className="text-gray-700">
                            Vous pariez sur <strong>{hippodromes.length} hippodromes</strong> différents
                          </p>
                        </div>
                        <div className="flex items-start space-x-2">
                          <span className="text-orange-500">•</span>
                          <p className="text-gray-700">
                            Vous suivez <strong>{myBetHorses.length} chevaux</strong> dans vos paris
                          </p>
                        </div>
                        <div className="flex items-start space-x-2">
                          <span className="text-orange-500">•</span>
                          <p className="text-gray-700">
                            Moyenne de <strong>{((stats?.races || 0) / hippodromes.length).toFixed(1)} courses</strong> par hippodrome
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
