'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, TrendingUp, TrendingDown, Activity, DollarSign, Download } from 'lucide-react';
import { tipstersAPI, Tipster, TipsterStatistics } from '@/lib/api/tipsters';
import { toast } from 'react-hot-toast';
import { TipsterFormModal } from '@/components/tipsters/tipster-form-modal';
import { TipsterStatsModal } from '@/components/tipsters/tipster-stats-modal';

export default function TipstersPage() {
  const [tipsters, setTipsters] = useState<Tipster[]>([]);
  const [statistics, setStatistics] = useState<TipsterStatistics[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [selectedTipster, setSelectedTipster] = useState<Tipster | null>(null);
  const [selectedStats, setSelectedStats] = useState<TipsterStatistics | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [tipstersData, statsData] = await Promise.all([
        tipstersAPI.getAll(),
        tipstersAPI.getAllStatistics(),
      ]);
      setTipsters(tipstersData);
      setStatistics(statsData);
    } catch (error) {
      console.error('Error loading tipsters:', error);
      toast.error('Erreur lors du chargement des tipsters');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedTipster(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (tipster: Tipster) => {
    setSelectedTipster(tipster);
    setIsFormModalOpen(true);
  };

  const handleDelete = async (tipster: Tipster) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le tipster "${tipster.name}" ?`)) {
      return;
    }

    try {
      await tipstersAPI.delete(tipster.id);
      toast.success('Tipster supprimé avec succès');
      loadData();
    } catch (error) {
      console.error('Error deleting tipster:', error);
      toast.error('Erreur lors de la suppression du tipster');
    }
  };

  const handleViewStats = (tipster: Tipster) => {
    const stats = statistics.find(s => s.id === tipster.id);
    if (stats) {
      setSelectedStats(stats);
      setIsStatsModalOpen(true);
    }
  };

  const handleFormSuccess = () => {
    setIsFormModalOpen(false);
    loadData();
  };

  const handleExport = async (format: 'csv' | 'excel') => {
    try {
      await tipstersAPI.exportAll(format);
      toast.success(`Export ${format.toUpperCase()} réussi`);
    } catch (error) {
      console.error('Error exporting tipsters:', error);
      toast.error('Erreur lors de l\'export');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Tipsters</h1>
          <p className="text-gray-600 mt-2">Gérez vos sources de pronostics et analysez leurs performances</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleExport('csv')}
            className="flex items-center space-x-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="h-5 w-5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          <button
            onClick={() => handleExport('excel')}
            className="flex items-center space-x-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="h-5 w-5" />
            <span className="hidden sm:inline">Export Excel</span>
          </button>
          <a
            href="/dashboard/tipsters/statistics"
            className="flex items-center space-x-2 bg-white border-2 border-primary-600 text-primary-600 px-4 py-2 rounded-lg hover:bg-primary-50 transition-colors"
          >
            <Activity className="h-5 w-5" />
            <span className="hidden sm:inline">Statistiques</span>
          </a>
          <button
            onClick={handleCreate}
            className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Nouveau Tipster</span>
          </button>
        </div>
      </div>

      {tipsters.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Activity className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Aucun tipster</h3>
          <p className="text-gray-500 mb-6">Commencez par créer votre premier tipster pour suivre vos pronostics</p>
          <button
            onClick={handleCreate}
            className="inline-flex items-center space-x-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Créer un tipster</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tipsters.map((tipster) => {
            const stats = statistics.find(s => s.id === tipster.id);
            const hasStats = stats && stats.totalBets > 0;

            return (
              <div
                key={tipster.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
                style={{ borderLeft: `4px solid ${tipster.color || '#3B82F6'}` }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900">{tipster.name}</h3>
                    {tipster.description && (
                      <p className="text-sm text-gray-600 mt-1">{tipster.description}</p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(tipster)}
                      className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(tipster)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {hasStats ? (
                  <>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-xs text-gray-500 mb-1">Paris</div>
                        <div className="text-2xl font-bold text-gray-900">{stats.totalBets}</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-xs text-gray-500 mb-1">Taux de réussite</div>
                        <div className={`text-2xl font-bold ${stats.winRate >= 50 ? 'text-green-600' : 'text-gray-900'}`}>
                          {stats.winRate.toFixed(1)}%
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500">ROI</div>
                        <div className={`flex items-center space-x-1 text-sm font-bold ${
                          stats.roi >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {stats.roi >= 0 ? (
                            <TrendingUp className="h-4 w-4" />
                          ) : (
                            <TrendingDown className="h-4 w-4" />
                          )}
                          <span>{stats.roi.toFixed(2)}%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="text-xs text-gray-500">Profit</div>
                        <div className={`flex items-center space-x-1 text-sm font-bold ${
                          stats.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          <DollarSign className="h-4 w-4" />
                          <span>{stats.totalProfit.toFixed(2)}€</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleViewStats(tipster)}
                      className="w-full bg-primary-50 text-primary-700 py-2 rounded-lg hover:bg-primary-100 transition-colors font-medium"
                    >
                      Voir les statistiques détaillées
                    </button>
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    Aucun pari enregistré pour ce tipster
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {isFormModalOpen && (
        <TipsterFormModal
          tipster={selectedTipster}
          onClose={() => setIsFormModalOpen(false)}
          onSuccess={handleFormSuccess}
        />
      )}

      {isStatsModalOpen && selectedStats && (
        <TipsterStatsModal
          statistics={selectedStats}
          onClose={() => setIsStatsModalOpen(false)}
        />
      )}
    </div>
  );
}
