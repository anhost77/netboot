'use client';

import { X, TrendingUp, TrendingDown, DollarSign, Target, Award, Download } from 'lucide-react';
import { TipsterStatistics, tipstersAPI } from '@/lib/api/tipsters';
import { toast } from 'react-hot-toast';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface TipsterStatsModalProps {
  statistics: TipsterStatistics;
  onClose: () => void;
}

export function TipsterStatsModal({ statistics, onClose }: TipsterStatsModalProps) {
  const handleExport = async (format: 'csv' | 'excel') => {
    try {
      if (!statistics.id) {
        toast.error('ID du tipster manquant');
        return;
      }
      await tipstersAPI.exportOne(statistics.id, format);
      toast.success(`Export ${format.toUpperCase()} réussi`);
    } catch (error) {
      console.error('Error exporting tipster stats:', error);
      toast.error('Erreur lors de l\'export');
    }
  };

  const chartData = {
    labels: statistics.monthlyStats.map(s => {
      const [year, month] = s.month.split('-');
      return `${month}/${year.slice(2)}`;
    }),
    datasets: [
      {
        label: 'ROI (%)',
        data: statistics.monthlyStats.map(s => s.roi),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Évolution du ROI mensuel',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: any) => `${value}%`,
        },
      },
    },
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Statistiques - {statistics.name}
            </h2>
            <p className="text-sm text-gray-600 mt-1">Analyse détaillée des performances</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Vue d'ensemble détaillée */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-blue-600 mb-2">
                <Target className="h-5 w-5" />
                <span className="text-sm font-medium">Paris totaux</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{statistics.totalBets}</div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-green-600 mb-2">
                <Award className="h-5 w-5" />
                <span className="text-sm font-medium">Paris gagnés</span>
              </div>
              <div className="text-2xl font-bold text-green-600">{statistics.wonBets}</div>
            </div>

            <div className="bg-red-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-red-600 mb-2">
                <TrendingDown className="h-5 w-5" />
                <span className="text-sm font-medium">Paris perdus</span>
              </div>
              <div className="text-2xl font-bold text-red-600">{statistics.lostBets}</div>
            </div>

            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-orange-600 mb-2">
                <Target className="h-5 w-5" />
                <span className="text-sm font-medium">En cours</span>
              </div>
              <div className="text-2xl font-bold text-orange-600">{statistics.pendingBets}</div>
            </div>
          </div>

          {/* Statistiques de performance */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Taux de réussite</div>
              <div className={`text-2xl font-bold ${statistics.winRate >= 50 ? 'text-green-600' : 'text-gray-900'}`}>
                {statistics.winRate.toFixed(1)}%
              </div>
            </div>

            <div className={`rounded-lg p-4 ${statistics.roi >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className={`flex items-center space-x-2 mb-1 ${statistics.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {statistics.roi >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                <span className="text-sm font-medium">ROI</span>
              </div>
              <div className={`text-2xl font-bold ${statistics.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {statistics.roi >= 0 ? '+' : ''}{statistics.roi.toFixed(2)}%
              </div>
            </div>

            <div className={`rounded-lg p-4 ${statistics.totalProfit >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className={`flex items-center space-x-2 mb-1 ${statistics.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                <DollarSign className="h-5 w-5" />
                <span className="text-sm font-medium">Profit total</span>
              </div>
              <div className={`text-2xl font-bold ${statistics.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {statistics.totalProfit >= 0 ? '+' : ''}{statistics.totalProfit.toFixed(2)}€
              </div>
            </div>
          </div>

          {/* Tableau récapitulatif détaillé */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900">Récapitulatif détaillé</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Métrique</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Valeur</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-700">Paris totaux</td>
                    <td className="px-4 py-3 text-sm font-semibold text-right text-gray-900">{statistics.totalBets}</td>
                  </tr>
                  <tr className="bg-green-50">
                    <td className="px-4 py-3 text-sm text-gray-700">Paris gagnés</td>
                    <td className="px-4 py-3 text-sm font-semibold text-right text-green-600">{statistics.wonBets}</td>
                  </tr>
                  <tr className="bg-red-50">
                    <td className="px-4 py-3 text-sm text-gray-700">Paris perdus</td>
                    <td className="px-4 py-3 text-sm font-semibold text-right text-red-600">{statistics.lostBets}</td>
                  </tr>
                  <tr className="bg-orange-50">
                    <td className="px-4 py-3 text-sm text-gray-700">Paris en cours</td>
                    <td className="px-4 py-3 text-sm font-semibold text-right text-orange-600">{statistics.pendingBets}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-700">Mise totale</td>
                    <td className="px-4 py-3 text-sm font-semibold text-right text-gray-900">{statistics.totalStake.toFixed(2)}€</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-700">Mise en cours</td>
                    <td className="px-4 py-3 text-sm font-semibold text-right text-blue-600">
                      {(statistics.totalStake * (statistics.pendingBets / statistics.totalBets)).toFixed(2)}€
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-700">Gains totaux</td>
                    <td className="px-4 py-3 text-sm font-semibold text-right text-gray-900">{statistics.totalPayout.toFixed(2)}€</td>
                  </tr>
                  <tr className={statistics.totalProfit >= 0 ? 'bg-green-50' : 'bg-red-50'}>
                    <td className="px-4 py-3 text-sm font-bold text-gray-900">Bénéfices/Pertes</td>
                    <td className={`px-4 py-3 text-sm font-bold text-right ${statistics.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {statistics.totalProfit >= 0 ? '+' : ''}{statistics.totalProfit.toFixed(2)}€
                    </td>
                  </tr>
                  <tr className={statistics.roi >= 0 ? 'bg-green-50' : 'bg-red-50'}>
                    <td className="px-4 py-3 text-sm font-bold text-gray-900">ROI</td>
                    <td className={`px-4 py-3 text-sm font-bold text-right ${statistics.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {statistics.roi >= 0 ? '+' : ''}{statistics.roi.toFixed(2)}%
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-bold text-gray-900">Taux de réussite</td>
                    <td className={`px-4 py-3 text-sm font-bold text-right ${statistics.winRate >= 50 ? 'text-green-600' : 'text-gray-900'}`}>
                      {statistics.winRate.toFixed(1)}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Graphique d'évolution */}
          {statistics.monthlyStats.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <Line data={chartData} options={chartOptions} />
            </div>
          )}

          {/* Statistiques par type de pari */}
          {Object.keys(statistics.betTypeStats).length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiques par type de pari</h3>
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Paris</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Gagnés</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Taux</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">ROI</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Profit</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Object.entries(statistics.betTypeStats).map(([type, stats]) => (
                      <tr key={type} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{type}</td>
                        <td className="px-4 py-3 text-sm text-center text-gray-900">{stats.total}</td>
                        <td className="px-4 py-3 text-sm text-center text-green-600 font-medium">{stats.won}</td>
                        <td className="px-4 py-3 text-sm text-center">
                          <span className={`font-medium ${stats.winRate >= 50 ? 'text-green-600' : 'text-gray-900'}`}>
                            {stats.winRate.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-center">
                          <span className={`font-medium ${stats.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {stats.roi.toFixed(2)}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-right">
                          <span className={`font-medium ${stats.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {stats.profit.toFixed(2)}€
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Résumé financier */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Mise totale</div>
              <div className="text-xl font-bold text-gray-900">{statistics.totalStake.toFixed(2)}€</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Gains totaux</div>
              <div className="text-xl font-bold text-gray-900">{statistics.totalPayout.toFixed(2)}€</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Résultat</div>
              <div className={`text-xl font-bold ${statistics.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {statistics.totalProfit >= 0 ? '+' : ''}{statistics.totalProfit.toFixed(2)}€
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t bg-gray-50">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => handleExport('csv')}
              className="flex items-center justify-center space-x-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => handleExport('excel')}
              className="flex items-center justify-center space-x-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Export Excel</span>
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
