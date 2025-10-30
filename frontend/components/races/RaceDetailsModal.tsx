'use client';

import { useState, useEffect } from 'react';
import { X, Clock, Trophy, User, Award, TrendingUp, Info, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { API_URL } from '@/lib/config';

interface Horse {
  number: number;
  name: string;
  jockey?: string;
  trainer?: string;
  weight?: number;
  odds?: number;
  age?: number;
  sex?: string;
  rope?: string;
  arrivalOrder?: number;
}

interface Race {
  id: string;
  hippodrome: string;
  reunionNumber: number;
  raceNumber: number;
  name: string;
  startTime: string;
  discipline: string;
  distance: number;
  prize: number;
  betTypes: string[];
  horses?: Horse[];
  date?: Date;
  reports?: Report[];
}

interface Report {
  id: string;
  betType: string;
  rapportDirect: Array<{
    numPmu: string;
    rapport: number;
  }>;
}

interface OddsData {
  betType: string;
  label: string;
  combinations?: Array<{
    horses: string;
    odds: number;
  }>;
}

interface RaceDetailsModalProps {
  race: Race;
  onClose: () => void;
  onBet?: () => void;
}

export default function RaceDetailsModal({ race, onClose, onBet }: RaceDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'odds'>('details');
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [loadingOdds, setLoadingOdds] = useState(false);
  const [horses, setHorses] = useState<Horse[]>(race.horses || []);
  const [oddsData, setOddsData] = useState<OddsData[]>([]);

  useEffect(() => {
    loadFullRaceData();
  }, [race.id]);

  const loadFullRaceData = async () => {
    setLoadingDetails(true);
    setLoadingOdds(true);
    
    try {
      // D'abord, trouver le raceId depuis la BDD
      const dateStr = race.date ? format(race.date, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');
      const racesResponse = await fetch(`${API_URL}/pmu/public/races?date=${dateStr}`);
      
      if (!racesResponse.ok) {
        throw new Error('Failed to load races');
      }
      
      const races = await racesResponse.json();
      const foundRace = races.find((r: any) => 
        r.reunionNumber === race.reunionNumber && 
        r.raceNumber === race.raceNumber
      );
      
      if (!foundRace) {
        console.log('Race not found in DB, loading from API...');
        setLoadingDetails(false);
        setLoadingOdds(false);
        return;
      }
      
      // Charger les détails complets avec auto-sync
      const raceResponse = await fetch(`${API_URL}/pmu/public/race/${foundRace.id}`);
      
      if (raceResponse.ok) {
        const fullRaceData = await raceResponse.json();
        console.log('Full race data:', fullRaceData);
        
        // Mapper les chevaux
        if (fullRaceData.horses && fullRaceData.horses.length > 0) {
          setHorses(fullRaceData.horses.map((h: any) => ({
            number: h.number,
            name: h.name,
            jockey: h.jockey,
            trainer: h.trainer,
            weight: h.weight,
            odds: h.odds,
            age: h.age,
            sex: h.sex,
            rope: h.rope,
            arrivalOrder: h.arrivalOrder
          })));
        }
        
        // Mapper les rapports si disponibles en BDD
        if (fullRaceData.reports && fullRaceData.reports.length > 0) {
          const mappedOdds = fullRaceData.reports.map((report: any) => ({
            betType: report.betType,
            label: getBetTypeLabel(report.betType),
            combinations: report.rapportDirect?.map((r: any) => ({
              horses: r.numPmu,
              odds: r.rapport
            })) || []
          }));
          setOddsData(mappedOdds);
        } else {
          // Si pas de rapports en BDD, vérifier si la course est terminée
          const isRaceFinished = isRaceOver(fullRaceData);
          
          if (isRaceFinished) {
            console.log('Course terminée, tentative de récupération des rapports depuis API PMU...');
            try {
              // Essayer de récupérer les rapports depuis l'API PMU
              const reportsResponse = await fetch(
                `${API_URL}/pmu/race/all-odds?date=${dateStr}&reunion=${race.reunionNumber}&course=${race.raceNumber}`
              );
              
              if (reportsResponse.ok) {
                const reportsData = await reportsResponse.json();
                if (reportsData.odds && reportsData.odds.length > 0) {
                  setOddsData(reportsData.odds);
                  
                  // Déclencher la synchronisation en BDD en arrière-plan
                  fetch(
                    `${API_URL}/pmu/race/sync-reports?date=${dateStr}&reunion=${race.reunionNumber}&course=${race.raceNumber}`
                  ).catch(err => console.error('Erreur sync rapports en BDD:', err));
                }
              }
            } catch (err) {
              console.error('Erreur récupération rapports PMU:', err);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error loading race data:', error);
    } finally {
      setLoadingDetails(false);
      setLoadingOdds(false);
    }
  };

  // Vérifier si la course est terminée (date + heure + 30 min de marge)
  const isRaceOver = (raceData: any): boolean => {
    if (!raceData.date || !raceData.startTime) return false;
    
    try {
      const raceDate = new Date(raceData.date);
      const [hours, minutes] = raceData.startTime.split(':').map(Number);
      raceDate.setHours(hours, minutes, 0, 0);
      
      // Ajouter 30 minutes de marge pour la fin de la course
      const raceEndTime = new Date(raceDate.getTime() + 30 * 60 * 1000);
      const now = new Date();
      
      return now > raceEndTime;
    } catch (err) {
      return false;
    }
  };

  const getBetTypeLabel = (betType: string): string => {
    const labels: Record<string, string> = {
      'SIMPLE_GAGNANT': 'Simple Gagnant',
      'SIMPLE_PLACE': 'Simple Placé',
      'COUPLE_GAGNANT': 'Couplé Gagnant',
      'COUPLE_PLACE': 'Couplé Placé',
      'COUPLE_ORDRE': 'Couplé Ordre',
      'TRIO': 'Trio',
      'TRIO_ORDRE': 'Trio Ordre',
      'SUPER4': 'Super 4',
      'QUARTE_PLUS': 'Quarté+',
      'QUINTE_PLUS': 'Quinté+',
      'MULTI': 'Multi',
      'DEUX_SUR_QUATRE': '2 sur 4',
      'MINI_MULTI': 'Mini Multi',
      'PICK5': 'Pick 5'
    };
    return labels[betType] || betType;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex justify-between items-center z-10">
          <div>
            <h2 className="text-2xl font-bold">{race.name}</h2>
            <p className="text-blue-100 mt-1">
              {race.hippodrome} - R{race.reunionNumber}C{race.raceNumber}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-blue-800 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Onglets */}
        <div className="border-b border-gray-200 bg-white sticky top-[88px] z-10">
          <div className="flex">
            <button
              onClick={() => setActiveTab('details')}
              className={`flex-1 px-6 py-3 font-semibold transition-colors ${
                activeTab === 'details'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Info className="w-5 h-5" />
                Détails de la course
              </div>
            </button>
            <button
              onClick={() => setActiveTab('odds')}
              className={`flex-1 px-6 py-3 font-semibold transition-colors ${
                activeTab === 'odds'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <DollarSign className="w-5 h-5" />
                Cotes PMU
              </div>
            </button>
          </div>
        </div>

        {/* Contenu */}
        <div className="p-6">
          {activeTab === 'details' ? (
            <>
              {/* Infos course */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Heure de départ</p>
                    <p className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      {race.startTime}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Discipline</p>
                    <p className="text-lg font-bold text-gray-900">{race.discipline}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Distance</p>
                    <p className="text-lg font-bold text-gray-900">{race.distance}m</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Allocation</p>
                    <p className="text-lg font-bold text-green-600">{race.prize.toLocaleString()}€</p>
                  </div>
                </div>

                {/* Types de paris */}
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">Paris disponibles</p>
                  <div className="flex flex-wrap gap-2">
                    {race.betTypes.map(type => (
                      <span
                        key={type}
                        className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full font-medium text-sm"
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Podium - Top 3 */}
              {horses.some(h => h.arrivalOrder) && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    <span>Podium</span>
                  </h3>
                  <div className="flex items-end justify-center space-x-4">
                    {/* 2nd Place */}
                    {horses.find(h => h.arrivalOrder === 2) && (() => {
                      const horse = horses.find(h => h.arrivalOrder === 2)!;
                      return (
                        <div className="flex flex-col items-center">
                          <div className="w-24 h-32 bg-gradient-to-br from-gray-300 to-gray-400 rounded-t-lg flex flex-col items-center justify-center shadow-lg">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-2 shadow">
                              <span className="text-2xl font-bold text-gray-700">{horse.number}</span>
                            </div>
                            <div className="text-white text-4xl font-bold">2</div>
                          </div>
                          <div className="bg-gray-200 w-24 p-2 text-center rounded-b-lg">
                            <p className="font-semibold text-sm text-gray-900 truncate">{horse.name}</p>
                            {horse.odds && (
                              <p className="text-xs font-bold text-green-600 mt-1">{Number(horse.odds).toFixed(2)}€</p>
                            )}
                          </div>
                        </div>
                      );
                    })()}

                    {/* 1st Place */}
                    {horses.find(h => h.arrivalOrder === 1) && (() => {
                      const horse = horses.find(h => h.arrivalOrder === 1)!;
                      return (
                        <div className="flex flex-col items-center">
                          <div className="w-28 h-40 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-t-lg flex flex-col items-center justify-center shadow-xl relative">
                            <div className="absolute -top-3">
                              <Trophy className="h-8 w-8 text-yellow-300" />
                            </div>
                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-2 shadow-lg">
                              <span className="text-3xl font-bold text-yellow-600">{horse.number}</span>
                            </div>
                            <div className="text-white text-5xl font-bold">1</div>
                          </div>
                          <div className="bg-yellow-200 w-28 p-2 text-center rounded-b-lg">
                            <p className="font-bold text-sm text-yellow-900 truncate">{horse.name}</p>
                            {horse.odds && (
                              <p className="text-xs font-bold text-green-700 mt-1">{Number(horse.odds).toFixed(2)}€</p>
                            )}
                          </div>
                        </div>
                      );
                    })()}

                    {/* 3rd Place */}
                    {horses.find(h => h.arrivalOrder === 3) && (() => {
                      const horse = horses.find(h => h.arrivalOrder === 3)!;
                      return (
                        <div className="flex flex-col items-center">
                          <div className="w-24 h-28 bg-gradient-to-br from-orange-400 to-orange-600 rounded-t-lg flex flex-col items-center justify-center shadow-lg">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-2 shadow">
                              <span className="text-2xl font-bold text-orange-700">{horse.number}</span>
                            </div>
                            <div className="text-white text-4xl font-bold">3</div>
                          </div>
                          <div className="bg-orange-200 w-24 p-2 text-center rounded-b-lg">
                            <p className="font-semibold text-sm text-orange-900 truncate">{horse.name}</p>
                            {horse.odds && (
                              <p className="text-xs font-bold text-green-600 mt-1">{Number(horse.odds).toFixed(2)}€</p>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* Liste des partants */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-yellow-500" />
                  Partants ({horses.length || 'Chargement...'})
                </h3>

                {loadingDetails ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Chargement des détails...</p>
                  </div>
                ) : horses.length > 0 ? (
                  <div className="space-y-3">
                    {horses.map((horse) => (
                      <div
                        key={horse.number}
                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                            {horse.number}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-lg font-bold text-gray-900">{horse.name}</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2 text-sm">
                              {horse.jockey && (
                                <div className="flex items-center gap-2 text-gray-600">
                                  <User className="w-4 h-4" />
                                  <span>Jockey: {horse.jockey}</span>
                                </div>
                              )}
                              {horse.trainer && (
                                <div className="flex items-center gap-2 text-gray-600">
                                  <Award className="w-4 h-4" />
                                  <span>Entraîneur: {horse.trainer}</span>
                                </div>
                              )}
                              {horse.weight && (
                                <div className="text-gray-600">
                                  <span>Poids: {horse.weight}kg</span>
                                </div>
                              )}
                              {horse.odds && (
                                <div className="flex items-center gap-2 text-green-600 font-semibold">
                                  <TrendingUp className="w-4 h-4" />
                                  <span>Cote: {horse.odds}</span>
                                </div>
                              )}
                            </div>
                            {(horse.age || horse.sex || horse.rope) && (
                              <div className="flex gap-3 mt-2 text-xs text-gray-500">
                                {horse.age && <span>{horse.age} ans</span>}
                                {horse.sex && <span>{horse.sex}</span>}
                                {horse.rope && <span>Corde: {horse.rope}</span>}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">Informations sur les partants non disponibles.</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Les données PMU ne sont pas encore synchronisées pour cette course.
                    </p>
                    <button
                      onClick={() => window.location.reload()}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      Réessayer
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Onglet Cotes */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <DollarSign className="w-6 h-6 text-green-500" />
                  Rapports PMU officiels
                </h3>

                {loadingOdds ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Chargement des cotes...</p>
                  </div>
                ) : oddsData.length > 0 ? (
                  <div className="space-y-6">
                    {oddsData.map((betTypeData, idx) => (
                      <div key={idx} className="bg-white border border-gray-200 rounded-lg p-4">
                        <h4 className="font-bold text-lg text-gray-900 mb-3">{betTypeData.label}</h4>
                        {betTypeData.combinations && betTypeData.combinations.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {betTypeData.combinations.map((combo, comboIdx) => (
                              <div
                                key={comboIdx}
                                className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                              >
                                <span className="font-semibold text-gray-900">{combo.horses}</span>
                                <span className="text-green-600 font-bold">{combo.odds.toFixed(2)}€</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-sm">Aucune cote disponible</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">Les rapports PMU ne sont pas encore disponibles.</p>
                    <p className="text-sm text-gray-500 mt-2">Les cotes seront publiées après la course.</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-end gap-3 sticky bottom-0">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Fermer
          </button>
          {onBet && (
            <button
              onClick={onBet}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              Parier sur cette course
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
