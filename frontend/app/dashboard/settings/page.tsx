'use client';

import { useEffect, useState } from 'react';
import { platformsAPI, type Platform, type GlobalBankroll, type BankrollEvolutionData } from '@/lib/api/platforms';
import { formatCurrency } from '@/lib/utils';
import {
  Wallet,
  Plus,
  Edit2,
  Trash2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Settings as SettingsIcon,
  BarChart3,
} from 'lucide-react';
import PlatformModal from '@/components/platforms/platform-modal';
import TransactionModal from '@/components/platforms/transaction-modal';
import BankrollChart from '@/components/charts/bankroll-chart';

export default function SettingsPage() {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [globalBankroll, setGlobalBankroll] = useState<GlobalBankroll | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPlatformModal, setShowPlatformModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);
  const [editingPlatform, setEditingPlatform] = useState<Platform | null>(null);

  // Bankroll evolution
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('day');
  const [globalEvolution, setGlobalEvolution] = useState<BankrollEvolutionData[]>([]);
  const [platformEvolutions, setPlatformEvolutions] = useState<Record<string, BankrollEvolutionData[]>>({});

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadEvolutionData();
  }, [period, platforms]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [platformsData, bankrollData] = await Promise.all([
        platformsAPI.getAll(),
        platformsAPI.getGlobalBankroll(),
      ]);
      setPlatforms(platformsData);
      setGlobalBankroll(bankrollData);
    } catch (error) {
      console.error('Failed to load platforms:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadEvolutionData = async () => {
    try {
      // Load global evolution
      const globalData = await platformsAPI.getGlobalBankrollEvolution(period);
      setGlobalEvolution(globalData);

      // Load evolution for each platform
      const evolutions: Record<string, BankrollEvolutionData[]> = {};
      await Promise.all(
        platforms.map(async (platform) => {
          const data = await platformsAPI.getBankrollEvolution(platform.id, period);
          evolutions[platform.id] = data;
        })
      );
      setPlatformEvolutions(evolutions);
    } catch (error) {
      console.error('Failed to load evolution data:', error);
    }
  };

  const handleDeletePlatform = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette plateforme ?')) {
      return;
    }

    try {
      await platformsAPI.delete(id);
      await loadData();
    } catch (error) {
      console.error('Failed to delete platform:', error);
      alert('Erreur lors de la suppression de la plateforme');
    }
  };

  const handleAddFunds = (platform: Platform) => {
    setSelectedPlatform(platform);
    setShowTransactionModal(true);
  };

  const handleEditPlatform = (platform: Platform) => {
    setEditingPlatform(platform);
    setShowPlatformModal(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
          <p className="mt-2 text-gray-600">Gérez vos plateformes et votre bankroll</p>
        </div>
      </div>

      {/* Global Bankroll Summary */}
      {globalBankroll && (
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Bankroll Globale</h2>
            <Wallet className="h-8 w-8 opacity-80" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm opacity-80">Investissement initial</p>
              <p className="text-2xl font-bold">{formatCurrency(globalBankroll.totalInitialBankroll)}</p>
            </div>
            <div>
              <p className="text-sm opacity-80">Bankroll actuelle</p>
              <p className="text-2xl font-bold">{formatCurrency(globalBankroll.totalCurrentBankroll)}</p>
            </div>
            <div>
              <p className="text-sm opacity-80">Profit/Perte</p>
              <div className="flex items-center space-x-2">
                <p className={`text-2xl font-bold ${globalBankroll.totalProfit >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                  {formatCurrency(globalBankroll.totalProfit)}
                </p>
                {globalBankroll.totalProfit >= 0 ? (
                  <TrendingUp className="h-5 w-5 text-green-300" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-300" />
                )}
              </div>
            </div>
            <div>
              <p className="text-sm opacity-80">ROI</p>
              <p className={`text-2xl font-bold ${globalBankroll.roi >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                {globalBankroll.roi.toFixed(2)}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Bankroll Evolution Section */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-primary-600" />
              <h2 className="text-lg font-semibold text-gray-900">Évolution des Bankrolls</h2>
            </div>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as 'day' | 'week' | 'month' | 'year')}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="day">Par jour</option>
              <option value="week">Par semaine</option>
              <option value="month">Par mois</option>
              <option value="year">Par année</option>
            </select>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Global Evolution */}
          <div>
            <BankrollChart
              data={globalEvolution}
              title="Évolution Globale"
              height={250}
            />
          </div>

          {/* Platform Evolution */}
          {platforms.length > 0 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 pt-6 border-t">
                Évolution par Plateforme
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {platforms.map((platform) => (
                  <div key={platform.id} className="border border-gray-200 rounded-lg p-4">
                    <BankrollChart
                      data={platformEvolutions[platform.id] || []}
                      title={platform.name}
                      height={200}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Platforms Section */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Mes Plateformes</h2>
            <button
              onClick={() => {
                setEditingPlatform(null);
                setShowPlatformModal(true);
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Ajouter une plateforme</span>
            </button>
          </div>
        </div>

        <div className="p-6">
          {platforms.length === 0 ? (
            <div className="text-center py-12">
              <Wallet className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune plateforme</h3>
              <p className="mt-1 text-sm text-gray-500">
                Commencez par ajouter une plateforme de paris (PMU, Betclic, etc.)
              </p>
              <button
                onClick={() => {
                  setEditingPlatform(null);
                  setShowPlatformModal(true);
                }}
                className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
              >
                Ajouter ma première plateforme
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {platforms.map((platform) => {
                const profit = platform.currentBankroll - platform.initialBankroll;
                const roi = platform.initialBankroll > 0
                  ? (profit / platform.initialBankroll) * 100
                  : 0;

                return (
                  <div
                    key={platform.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{platform.name}</h3>
                        {!platform.isActive && (
                          <span className="inline-block px-2 py-1 text-xs bg-gray-200 text-gray-600 rounded mt-1">
                            Inactif
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleEditPlatform(platform)}
                          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                          title="Modifier"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePlatform(platform.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Initial</span>
                        <span className="font-medium">{formatCurrency(platform.initialBankroll)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Actuel</span>
                        <span className="font-medium">{formatCurrency(platform.currentBankroll)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Profit/Perte</span>
                        <span className={`font-medium ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(profit)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">ROI</span>
                        <span className={`font-medium ${roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {roi.toFixed(2)}%
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleAddFunds(platform)}
                      className="mt-4 w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      <DollarSign className="h-4 w-4" />
                      <span>Gérer les fonds</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showPlatformModal && (
        <PlatformModal
          platform={editingPlatform}
          onClose={() => {
            setShowPlatformModal(false);
            setEditingPlatform(null);
          }}
          onSuccess={() => {
            setShowPlatformModal(false);
            setEditingPlatform(null);
            loadData();
          }}
        />
      )}

      {showTransactionModal && selectedPlatform && (
        <TransactionModal
          platform={selectedPlatform}
          onClose={() => {
            setShowTransactionModal(false);
            setSelectedPlatform(null);
          }}
          onSuccess={() => {
            setShowTransactionModal(false);
            setSelectedPlatform(null);
            loadData();
          }}
        />
      )}
    </div>
  );
}
