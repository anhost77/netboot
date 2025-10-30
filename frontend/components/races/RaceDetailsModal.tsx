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
    if (!race.horses || race.horses.length === 0) {
      loadRaceDetails();
    }
  }, [race]);

  useEffect(() => {
    if (activeTab === 'odds' && oddsData.length === 0) {
      loadOdds();
    }
  }, [activeTab]);

  const loadRaceDetails = async () => {
    setLoadingDetails(true);
    try {
      const dateStr = race.date ? format(race.date, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');
      const response = await fetch(
        `${API_URL}/pmu/race/participants?date=${dateStr}&reunion=${race.reunionNumber}&course=${race.raceNumber}`
      );

      if (response.ok) {
        const data = await response.json();
        const horsesData = data.participants || data.horses || [];
        setHorses(horsesData.map((p: any) => ({
          number: p.number || p.numeroParticipant,
          name: p.name || p.nom,
          jockey: p.jockey || p.driver,
          trainer: p.trainer || p.entraineur,
          weight: p.weight || p.poids,
          odds: p.odds || p.cote,
          age: p.age,
          sex: p.sex || p.sexe,
          rope: p.rope || p.corde
        })));
      }
    } catch (error) {
      console.error('Error loading race details:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const loadOdds = async () => {
    setLoadingOdds(true);
    try {
      const dateStr = race.date ? format(race.date, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');
      const response = await fetch(
        `${API_URL}/pmu/race/all-odds?date=${dateStr}&reunion=${race.reunionNumber}&course=${race.raceNumber}`
      );

      if (response.ok) {
        const data = await response.json();
        setOddsData(data.odds || []);
      }
    } catch (error) {
      console.error('Error loading odds:', error);
    } finally {
      setLoadingOdds(false);
    }
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
                    <p className="text-gray-600">Informations sur les partants non disponibles pour le moment.</p>
                    <p className="text-sm text-gray-500 mt-2">Les données seront disponibles quelques heures avant la course.</p>
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
