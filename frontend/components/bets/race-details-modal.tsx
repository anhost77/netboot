'use client';

import { useEffect, useState } from 'react';
import { X, Trophy, MapPin, Calendar, Award, Star, Maximize2, Minimize2 } from 'lucide-react';
import { pmuStatsAPI, type PmuRace, type PmuHorse } from '@/lib/api/pmu-stats';
import { formatCurrency } from '@/lib/utils';

interface RaceDetailsModalProps {
  raceId: string;
  onClose: () => void;
  selectedHorses?: string; // "2 - CHEVAL_A, 4 - CHEVAL_B"
  refreshKey?: number; // Pour forcer le rechargement
}

export function RaceDetailsModal({ raceId, onClose, selectedHorses, refreshKey }: RaceDetailsModalProps) {
  const [race, setRace] = useState<(PmuRace & { horses: PmuHorse[] }) | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState<'results' | 'reports'>('results');

  useEffect(() => {
    loadRaceDetails();
  }, [raceId, refreshKey]); // Recharger quand refreshKey change

  const loadRaceDetails = async () => {
    try {
      setIsLoading(true);
      const data = await pmuStatsAPI.getRaceById(raceId);
      setRace(data);
    } catch (error) {
      console.error('Failed to load race details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Extract selected horse numbers from string like "2 - CHEVAL_A, 4 - CHEVAL_B"
  const getSelectedHorseNumbers = (): number[] => {
    if (!selectedHorses) return [];
    return selectedHorses.split(',').map(h => {
      const match = h.trim().match(/^(\d+)/);
      return match ? parseInt(match[1]) : 0;
    }).filter(n => n > 0);
  };

  const selectedNumbers = getSelectedHorseNumbers();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-lg shadow-xl ${isFullscreen ? 'w-full h-full max-w-none max-h-none' : 'max-w-6xl w-full max-h-[90vh]'} overflow-hidden flex flex-col transition-all duration-300`}>
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-primary-600 to-blue-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 text-white">
              <Trophy className="h-6 w-6" />
              <div>
                <h2 className="text-xl font-bold">
                  {isLoading ? 'Chargement...' : `R${race?.reunionNumber}C${race?.raceNumber} - ${race?.hippodrome.name}`}
                </h2>
                {race?.name && (
                  <p className="text-sm text-blue-100">{race.name}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="text-white hover:text-gray-200 transition-colors p-2"
                title={isFullscreen ? 'Réduire' : 'Plein écran'}
              >
                {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
              </button>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors p-2"
                title="Fermer"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="flex space-x-1 px-6">
            <button
              onClick={() => setActiveTab('results')}
              className={`px-6 py-3 font-medium text-sm transition-colors ${
                activeTab === 'results'
                  ? 'border-b-2 border-primary-600 text-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🏆 Résultats
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`px-6 py-3 font-medium text-sm transition-colors ${
                activeTab === 'reports'
                  ? 'border-b-2 border-primary-600 text-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              💰 Rapports détaillés
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
            </div>
          ) : race ? (
            <>
              {/* Tab: Results */}
              {activeTab === 'results' && (
                <div className="space-y-6">
                  {/* Podium - Top 3 */}
              {race.horses && race.horses.some(h => h.arrivalOrder) && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    <span>Podium</span>
                  </h3>
                  <div className="flex items-end justify-center space-x-4">
                    {/* 2nd Place */}
                    {race.horses.find(h => h.arrivalOrder === 2) && (() => {
                      const horse = race.horses.find(h => h.arrivalOrder === 2);
                      return (
                        <div className="flex flex-col items-center">
                          <div className="w-24 h-32 bg-gradient-to-br from-gray-300 to-gray-400 rounded-t-lg flex flex-col items-center justify-center shadow-lg">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-2 shadow">
                              <span className="text-2xl font-bold text-gray-700">
                                {horse?.number}
                              </span>
                            </div>
                            <div className="text-white text-4xl font-bold">2</div>
                          </div>
                          <div className="bg-gray-200 w-24 p-2 text-center rounded-b-lg">
                            <p className="font-semibold text-sm text-gray-900 truncate">
                              {horse?.name}
                            </p>
                            {horse?.odds && (
                              <p className="text-xs font-bold text-green-600 mt-1">
                                {Number(horse.odds).toFixed(2)}€
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })()}

                    {/* 1st Place */}
                    {race.horses.find(h => h.arrivalOrder === 1) && (() => {
                      const horse = race.horses.find(h => h.arrivalOrder === 1);
                      return (
                        <div className="flex flex-col items-center">
                          <div className="w-28 h-40 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-t-lg flex flex-col items-center justify-center shadow-xl relative">
                            <div className="absolute -top-3">
                              <Trophy className="h-8 w-8 text-yellow-300" />
                            </div>
                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-2 shadow-lg">
                              <span className="text-3xl font-bold text-yellow-600">
                                {horse?.number}
                              </span>
                            </div>
                            <div className="text-white text-5xl font-bold">1</div>
                          </div>
                          <div className="bg-yellow-200 w-28 p-2 text-center rounded-b-lg">
                            <p className="font-bold text-sm text-yellow-900 truncate">
                              {horse?.name}
                            </p>
                            {horse?.odds && (
                              <p className="text-xs font-bold text-green-700 mt-1">
                                {Number(horse.odds).toFixed(2)}€
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })()}

                    {/* 3rd Place */}
                    {race.horses.find(h => h.arrivalOrder === 3) && (() => {
                      const horse = race.horses.find(h => h.arrivalOrder === 3);
                      return (
                        <div className="flex flex-col items-center">
                          <div className="w-24 h-28 bg-gradient-to-br from-orange-400 to-orange-600 rounded-t-lg flex flex-col items-center justify-center shadow-lg">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-2 shadow">
                              <span className="text-2xl font-bold text-orange-700">
                                {horse?.number}
                              </span>
                            </div>
                            <div className="text-white text-4xl font-bold">3</div>
                          </div>
                          <div className="bg-orange-200 w-24 p-2 text-center rounded-b-lg">
                            <p className="font-semibold text-sm text-orange-900 truncate">
                              {horse?.name}
                            </p>
                            {horse?.odds && (
                              <p className="text-xs font-bold text-green-600 mt-1">
                                {Number(horse.odds).toFixed(2)}€
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* Full Ranking */}
              {race.horses && race.horses.some(h => h.arrivalOrder) && (
                <div className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                    <Award className="h-4 w-4 text-blue-600" />
                    <span>Classement complet</span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {race.horses
                      .filter(h => h.arrivalOrder)
                      .sort((a, b) => (a.arrivalOrder || 999) - (b.arrivalOrder || 999))
                      .map((horse, index) => {
                        const isSelected = selectedNumbers.includes(horse.number);
                        return (
                          <div
                            key={horse.id}
                            className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                              index < 3
                                ? index === 0
                                  ? 'bg-yellow-100 border-2 border-yellow-400'
                                  : index === 1
                                  ? 'bg-gray-100 border-2 border-gray-400'
                                  : 'bg-orange-100 border-2 border-orange-400'
                                : isSelected
                                ? 'bg-primary-100 border-2 border-primary-400'
                                : 'bg-white border border-gray-300'
                            }`}
                          >
                            <span className={`font-bold text-sm ${
                              index < 3 ? 'text-lg' : ''
                            }`}>
                              {horse.arrivalOrder}°
                            </span>
                            <span className="text-xs text-gray-500">→</span>
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              isSelected
                                ? 'bg-primary-600 text-white'
                                : 'bg-gray-200 text-gray-700'
                            }`}>
                              {horse.number}
                            </span>
                            <span className="text-sm font-medium text-gray-900">
                              {horse.name}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Race Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Date</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(race.date).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                {race.discipline && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Discipline</p>
                    <p className="font-semibold text-gray-900">{race.discipline}</p>
                  </div>
                )}
                {race.distance && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Distance</p>
                    <p className="font-semibold text-gray-900">{race.distance}m</p>
                  </div>
                )}
                {race.prize && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Dotation</p>
                    <p className="font-semibold text-gray-900">{formatCurrency(race.prize)}</p>
                  </div>
                )}
              </div>

              {/* Horses List */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Award className="h-5 w-5 text-primary-600" />
                  <span>Partants ({race.horses?.length || 0})</span>
                </h3>
                
                <div className="space-y-2">
                  {race.horses && race.horses.length > 0 ? (
                    race.horses.map((horse) => {
                      const isSelected = selectedNumbers.includes(horse.number);
                      const isWinner = horse.arrivalOrder === 1;
                      const isPlaced = horse.arrivalOrder && horse.arrivalOrder <= 3;
                      
                      return (
                        <div
                          key={horse.id}
                          className={`border-2 rounded-lg p-4 transition-all ${
                            isSelected 
                              ? 'border-primary-600 bg-primary-50' 
                              : isWinner
                              ? 'border-yellow-400 bg-yellow-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3 flex-1">
                              {/* Horse Number */}
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                                isSelected 
                                  ? 'bg-primary-600 text-white' 
                                  : isWinner
                                  ? 'bg-yellow-400 text-yellow-900'
                                  : 'bg-gray-200 text-gray-700'
                              }`}>
                                {horse.number}
                              </div>

                              {/* Horse Info */}
                              <div className="flex-1">
                                <div className="flex flex-col space-y-2 mb-2">
                                  <div className="flex items-center space-x-2">
                                    <h4 className="font-semibold text-gray-900">{horse.name}</h4>
                                    {isSelected && (
                                      <span className="px-2 py-1 bg-primary-600 text-white text-xs rounded-full">
                                        Votre choix
                                      </span>
                                    )}
                                  </div>
                                  {horse.odds && (
                                    <div className="inline-flex items-center space-x-1 px-3 py-1.5 bg-green-500 text-white text-sm font-bold rounded-md w-fit">
                                      <span>💰</span>
                                      <span>Cote: {Number(horse.odds).toFixed(2)}€</span>
                                    </div>
                                  )}
                                </div>

                                {/* Indicators */}
                                <div className="flex items-center space-x-2 mb-2">
                                  {horse.blinkers && (
                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                      Œillères
                                    </span>
                                  )}
                                  {horse.unshod && (
                                    <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                                      Déferré
                                    </span>
                                  )}
                                  {horse.firstTime && (
                                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                                      Inédit
                                    </span>
                                  )}
                                </div>

                                {/* Recent Form */}
                                {horse.recentForm && (
                                  <div className="mt-2">
                                    <p className="text-xs text-gray-500 mb-1">Musique (forme récente)</p>
                                    <p className="text-xs font-mono text-gray-700 bg-gray-50 p-2 rounded">
                                      {horse.recentForm}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Arrival Position */}
                            {horse.arrivalOrder && (
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                                horse.arrivalOrder === 1 ? 'bg-yellow-400 text-yellow-900' :
                                horse.arrivalOrder === 2 ? 'bg-gray-300 text-gray-900' :
                                horse.arrivalOrder === 3 ? 'bg-orange-400 text-orange-900' :
                                'bg-gray-100 text-gray-600'
                              }`}>
                                {horse.arrivalOrder}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-center text-gray-500 py-8">Aucun partant enregistré</p>
                  )}
                </div>
              </div>
                </div>
              )}

              {/* Tab: Reports */}
              {activeTab === 'reports' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <Award className="h-5 w-5 text-green-600" />
                    <span>💰 Rapports PMU détaillés</span>
                  </h3>

                  {race.reports && race.reports.length > 0 ? (
                    <div className="space-y-4">
                      {race.reports.map((report: any) => (
                        <div key={report.id} className="border border-gray-200 rounded-lg overflow-hidden">
                          {/* Report Header */}
                          <div className="bg-gradient-to-r from-green-50 to-blue-50 px-4 py-3 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-bold text-gray-900">
                                  {report.betFamily} - {report.betType.replace(/_/g, ' ')}
                                </h4>
                                <p className="text-xs text-gray-600 mt-1">
                                  Mise de base: {(report.baseStake / 100).toFixed(2)}€
                                  {report.refunded && (
                                    <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs">
                                      Remboursé
                                    </span>
                                  )}
                                </p>
                              </div>
                              <Trophy className="h-6 w-6 text-green-600" />
                            </div>
                          </div>

                          {/* Report Details */}
                          <div className="p-4">
                            <div className="space-y-3">
                              {report.reports.map((detail: any, idx: number) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-3">
                                      <span className="px-3 py-1 bg-primary-600 text-white font-bold rounded-md">
                                        {detail.combinaison}
                                      </span>
                                      <span className="text-sm text-gray-600">{detail.libelle}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                      {detail.nombreGagnants ? detail.nombreGagnants.toFixed(2) : '0'} gagnants
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-lg font-bold text-green-600">
                                      {(detail.dividendePourUnEuro / 100).toFixed(2)}€
                                    </div>
                                    <p className="text-xs text-gray-500">pour 1€</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                      <p className="text-yellow-800 font-medium">
                        ⚠️ Aucun rapport disponible pour cette course
                      </p>
                      <p className="text-sm text-yellow-600 mt-2">
                        Les rapports seront disponibles après la mise à jour des cotes
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <p className="text-center text-gray-500 py-12">Course introuvable</p>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
