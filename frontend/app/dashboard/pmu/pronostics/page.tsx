'use client';

import { useState, useEffect, useRef } from 'react';
import { pmuAPI, PMUProgram, PMUMeeting, PMURace } from '@/lib/api/pmu';
import { pmuStatsAPI } from '@/lib/api/pmu-stats';
import { apiClient } from '@/lib/api/client';
import { Trophy, Calendar, MapPin, Clock, TrendingUp, Star, Award, Target, Sparkles, CheckCircle, Info, AlertTriangle, Users, X } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { RaceDetailsModal } from '@/components/bets/race-details-modal';

export default function PmuPronosticsPage() {
  const [program, setProgram] = useState<PMUProgram | null>(null);
  const [selectedMeeting, setSelectedMeeting] = useState<PMUMeeting | null>(null);
  const [selectedRace, setSelectedRace] = useState<PMURace | null>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [horseStats, setHorseStats] = useState<any[]>([]);
  const [jockeyStats, setJockeyStats] = useState<any>(null);
  const [combinations, setCombinations] = useState<any[]>([]);
  const [crossStats, setCrossStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingParticipants, setIsLoadingParticipants] = useState(false);
  const [showRaceModal, setShowRaceModal] = useState(false);
  const [raceDetails, setRaceDetails] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  
  // Onglet actif sur mobile (liste ou détails)
  const [mobileView, setMobileView] = useState<'list' | 'details'>('list');

  // Fonction pour formater le timestamp en heure
  const formatRaceTime = (timestamp: number | string) => {
    if (!timestamp) return '';
    const date = new Date(typeof timestamp === 'string' ? parseInt(timestamp) : timestamp);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  useEffect(() => {
    loadProgram();
  }, [selectedDate]);

  const loadProgram = async () => {
    // Reset IMMÉDIATEMENT les sélections quand on change de date
    setSelectedMeeting(null);
    setSelectedRace(null);
    setParticipants([]);
    setRaceDetails(null);
    setHorseStats([]);
    setJockeyStats(null);
    setCombinations([]);
    setCrossStats(null);
    setMobileView('list');
    
    try {
      setIsLoading(true);
      
      const data = await pmuAPI.getProgramByDate(selectedDate);
      setProgram(data);
      
      // Ne pas sélectionner automatiquement de réunion
      // L'utilisateur doit choisir manuellement
    } catch (error) {
      console.error('Error loading program:', error);
      toast.error('Erreur lors du chargement du programme');
    } finally {
      setIsLoading(false);
    }
  };

  const loadRaceDetails = async (meeting: PMUMeeting, race: PMURace) => {
    try {
      setIsLoadingParticipants(true);
      setSelectedRace(race);
      
      console.log('Loading race details with date:', selectedDate, 'Meeting:', meeting.number, 'Race:', race.number);
      
      const [participantsData, raceDetailsData, horsePerf, jockeyPerf, combosData, crossData] = await Promise.all([
        pmuAPI.getRaceParticipants(selectedDate, meeting.number, race.number).catch(err => {
          console.error('Error fetching participants:', err);
          return { participants: [] };
        }),
        pmuAPI.getRaceDetails(selectedDate, meeting.number, race.number).catch(() => null),
        pmuStatsAPI.getHorsePerformance().catch(() => []),
        pmuStatsAPI.getJockeyStats().catch(() => ({ topJockeys: [] })),
        pmuStatsAPI.getHorseJockeyCombinations().catch(() => ({ topCombinations: [] })),
        pmuStatsAPI.getCrossStats().catch(() => null),
      ]);
      
      console.log('Raw participantsData:', participantsData);
      
      // Le backend peut retourner soit un tableau directement, soit un objet { participants: [] }
      let enrichedParticipants = Array.isArray(participantsData) 
        ? participantsData 
        : (participantsData.participants || []);
      
      // Si raceDetails contient des participants avec plus d'infos, les fusionner
      if (raceDetailsData?.participants && raceDetailsData.participants.length > 0) {
        enrichedParticipants = enrichedParticipants.map((p: any) => {
          const detailParticipant = raceDetailsData.participants.find(
            (dp: any) => dp.number === p.number || dp.name === p.name
          );
          return detailParticipant ? { ...p, ...detailParticipant } : p;
        });
      }
      
      console.log('Participants loaded:', enrichedParticipants.length);
      
      setParticipants(enrichedParticipants);
      setRaceDetails(raceDetailsData);
      setHorseStats(horsePerf);
      setJockeyStats(jockeyPerf);
      setCombinations(combosData.topCombinations || []);
      setCrossStats(crossData);
      
      // Basculer vers la vue détails sur mobile
      if (window.innerWidth < 1024) {
        setMobileView('details');
      }
      
      // Debug logs removed to prevent performance issues
    } catch (error) {
      console.error('Error loading race details:', error);
      toast.error('Erreur lors du chargement des détails de la course');
    } finally {
      setIsLoadingParticipants(false);
    }
  };

  const resetRaceSelection = () => {
    setSelectedMeeting(null);
    setSelectedRace(null);
    setParticipants([]);
    setRaceDetails(null);
    setHorseStats([]);
    setJockeyStats(null);
    setMobileView('list');
    setCombinations([]);
    setCrossStats(null);
    setIsLoadingParticipants(false);
  };

  const handleViewRaceDetails = async () => {
    if (!selectedMeeting || !selectedRace) return;
    
    try {
      toast.loading('Chargement des détails...', { id: 'sync-race' });
      
      // Synchroniser la course pour obtenir un ID
      const syncedRace = await apiClient.post(
        `/pmu/data/races/${selectedDate}/${selectedMeeting.number}/${selectedRace.number}/sync`
      );
      
      console.log('Synced race:', syncedRace);
      setRaceDetails({ ...raceDetails, id: syncedRace.id });
      toast.success('Détails chargés !', { id: 'sync-race' });
      setShowRaceModal(true);
    } catch (error: any) {
      console.error('Error syncing race:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Erreur inconnue';
      toast.error(`Erreur: ${errorMessage}`, { id: 'sync-race' });
    }
  };

  // Vérifier les résultats - utiliser arriveeDefinitive ou la présence d'arrivalOrder
  const hasResults = raceDetails?.arriveeDefinitive || 
                     raceDetails?.participants?.some((p: any) => p.arrivalOrder || p.ordreArrivee) || 
                     participants?.some((p: any) => p.arrivalOrder || p.ordreArrivee);

  const generatePronostic = (participant: any) => {
    // Logique de génération de pronostic basée sur les statistiques
    let score = 0;
    let reasons = [];

    // Chercher les stats du cheval
    const horsePerf = horseStats.find(h => 
      h.horseName?.toLowerCase() === participant.name?.toLowerCase()
    );

    if (horsePerf) {
      // Bonus pour taux de victoire élevé
      if (horsePerf.winRate > 20) {
        score += 3;
        reasons.push(`Excellent taux de victoire (${horsePerf.winRate.toFixed(1)}%)`);
      } else if (horsePerf.winRate > 10) {
        score += 2;
        reasons.push(`Bon taux de victoire (${horsePerf.winRate.toFixed(1)}%)`);
      }

      // Bonus pour taux de placement élevé
      if (horsePerf.placeRate > 40) {
        score += 2;
        reasons.push(`Très bon taux de placement (${horsePerf.placeRate.toFixed(1)}%)`);
      }

      // Bonus pour nombre de courses
      if (horsePerf.totalRaces > 20) {
        score += 1;
        reasons.push('Cheval expérimenté');
      }
    }

    // Bonus pour forme récente
    if (participant.recentForm) {
      const recentWins = (participant.recentForm.match(/1/g) || []).length;
      if (recentWins >= 2) {
        score += 2;
        reasons.push('Bonne forme récente');
      }
    }

    // Bonus pour équipement
    if (participant.firstTime) {
      score += 1;
      reasons.push('Première fois');
    }

    return {
      score,
      confidence: score >= 5 ? 'high' : score >= 3 ? 'medium' : 'low',
      reasons,
    };
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getConfidenceIcon = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return <Star className="h-5 w-5 text-green-600 fill-green-600" />;
      case 'medium':
        return <Star className="h-5 w-5 text-yellow-600" />;
      default:
        return <Star className="h-5 w-5 text-gray-400" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Générer les pronostics pour tous les participants
  const participantsWithPronostics = participants.map(p => ({
    ...p,
    pronostic: generatePronostic(p),
  })).sort((a, b) => b.pronostic.score - a.pronostic.score);

  // Afficher TOUS les participants, pas seulement le top 5
  const topPronostics = participantsWithPronostics;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <Trophy className="h-6 sm:h-8 w-6 sm:w-8 text-primary-600" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Pronostics PMU</h1>
          </div>
          <p className="text-sm sm:text-base text-gray-600">Générez des pronostics basés sur les statistiques</p>
        </div>
        <Link
          href="/dashboard/pmu"
          className="text-primary-600 hover:text-primary-700 font-medium text-sm sm:text-base self-start sm:self-auto"
        >
          ← Retour
        </Link>
      </div>

      {/* Navigation mobile par onglets */}
      {selectedRace && (
        <div className="lg:hidden bg-white rounded-lg shadow">
          <div className="flex border-b">
            <button
              onClick={() => setMobileView('list')}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                mobileView === 'list'
                  ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📋 Liste des courses
            </button>
            <button
              onClick={() => setMobileView('details')}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                mobileView === 'details'
                  ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🎯 Pronostics
            </button>
          </div>
        </div>
      )}

      {/* Avertissement Important */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 rounded-lg p-4 shadow">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-red-900 mb-1">⚠️ Avertissement - Analyses statistiques uniquement</h3>
            <p className="text-xs text-red-800">
              Ces pronostics sont générés par IA basés sur des statistiques historiques. <strong>Ils ne constituent pas des conseils en paris</strong> et ne prennent pas en compte la forme actuelle, la météo, l'état de la piste, etc. 
              <strong className="text-red-900"> Les paris comportent des risques financiers.</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Date Selector */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <Calendar className="h-5 w-5 text-gray-600 flex-shrink-0" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            />
            <span className="text-xs sm:text-sm text-gray-600 hidden sm:inline">
              {program?.meetings?.length || 0} réunion(s) disponible(s)
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                setSelectedDate(yesterday.toISOString().split('T')[0]);
              }}
              className={`flex-1 sm:flex-none px-3 py-1.5 text-xs sm:text-sm rounded-lg transition-colors ${
                selectedDate === new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0]
                  ? 'bg-primary-100 text-primary-700 font-medium'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Hier
            </button>
            <button
              onClick={() => {
                const today = new Date();
                setSelectedDate(today.toISOString().split('T')[0]);
              }}
              className={`flex-1 sm:flex-none px-3 py-1.5 text-xs sm:text-sm rounded-lg transition-colors ${
                selectedDate === new Date().toISOString().split('T')[0]
                  ? 'bg-primary-100 text-primary-700 font-medium'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Aujourd'hui
            </button>
            <button
              onClick={() => {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                setSelectedDate(tomorrow.toISOString().split('T')[0]);
              }}
              className={`flex-1 sm:flex-none px-3 py-1.5 text-xs sm:text-sm rounded-lg transition-colors ${
                selectedDate === new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0]
                  ? 'bg-primary-100 text-primary-700 font-medium'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Demain
            </button>
          </div>
        </div>
        {/* Compteur de réunions visible uniquement sur mobile */}
        <div className="sm:hidden mt-3 text-xs text-gray-600 text-center">
          {program?.meetings?.length || 0} réunion(s) disponible(s)
        </div>
      </div>

      {/* Grid desktop + mobile avec affichage conditionnel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Meetings List - Caché sur mobile si une réunion est sélectionnée OU si on est en vue details */}
        <div className={`bg-white rounded-lg shadow ${(selectedMeeting || mobileView === 'details') ? 'hidden lg:block' : ''}`}>
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Réunions</h2>
          </div>
          <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
            {program?.meetings?.map((meeting) => (
              <button
                key={meeting.number}
                onClick={() => {
                  setSelectedMeeting(meeting);
                  setSelectedRace(null);
                  setParticipants([]);
                  // Ne pas changer la vue sur mobile, rester sur la liste
                }}
                className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                  selectedMeeting?.number === meeting.number ? 'bg-primary-50 border-l-4 border-primary-600' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-primary-600" />
                  <div>
                    <div className="font-semibold text-gray-900">R{meeting.number}</div>
                    <div className="text-sm text-gray-600">{meeting.hippodrome.name}</div>
                    <div className="text-xs text-gray-500">{meeting.races.length} courses</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Races List */}
        <div className={`bg-white rounded-lg shadow ${mobileView === 'details' ? 'hidden lg:block' : ''}`}>
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {/* Bouton retour aux réunions sur mobile */}
                {selectedMeeting && (
                  <button
                    onClick={() => {
                      setSelectedMeeting(null);
                      setSelectedRace(null);
                      setParticipants([]);
                    }}
                    className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Retour aux réunions"
                  >
                    <X className="h-5 w-5 text-gray-600" />
                  </button>
                )}
                <h2 className="font-semibold text-gray-900">
                  {selectedMeeting ? `Courses - ${selectedMeeting.hippodrome.name}` : 'Courses'}
                </h2>
              </div>
            </div>
          </div>
          <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
            {selectedMeeting?.races?.map((race) => (
              <button
                key={race.number}
                onClick={() => loadRaceDetails(selectedMeeting, race)}
                className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                  selectedRace?.number === race.number ? 'bg-primary-50 border-l-4 border-primary-600' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">C{race.number} - {race.name}</div>
                    <div className="flex items-center space-x-2 mt-1">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{formatRaceTime(race.startTime)}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {race.discipline} • {race.distance}{race.distanceUnit || 'm'} • {race.prize?.toLocaleString()}€
                    </div>
                  </div>
                  <TrendingUp className="h-5 w-5 text-primary-600" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Pronostics - Affiché uniquement si une course est sélectionnée */}
        {selectedRace && (
        <div className={`bg-white rounded-lg shadow ${mobileView === 'list' ? 'hidden lg:block' : ''}`}>
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {/* Bouton retour sur mobile */}
                <button
                  onClick={() => setMobileView('list')}
                  className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Retour à la liste"
                >
                  <X className="h-5 w-5 text-gray-600" />
                </button>
                <Sparkles className="h-5 w-5 text-primary-600" />
                <div>
                  <h2 className="font-semibold text-gray-900">Analyse Statistique IA</h2>
                  {selectedRace && selectedMeeting && (
                    <p className="text-xs text-gray-600 mt-0.5 lg:hidden">
                      C{selectedRace.number} - {selectedMeeting.hippodrome.name}
                    </p>
                  )}
                </div>
              </div>
              {selectedRace && (
                hasResults ? (
                  <button
                    onClick={handleViewRaceDetails}
                    className="flex items-center space-x-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>Résultats disponibles</span>
                  </button>
                ) : (
                  <div className="flex items-center space-x-2 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg text-sm font-medium">
                    <Clock className="h-4 w-4" />
                    <span>Course à venir</span>
                  </div>
                )
              )}
            </div>
          </div>
          <div className="p-4">
            {isLoadingParticipants ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : !selectedRace ? (
              <div className="text-center py-12 text-gray-500">
                <Target className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>Sélectionnez une course pour voir les pronostics</p>
              </div>
            ) : topPronostics.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <AlertTriangle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="font-medium">Aucun participant disponible</p>
                <p className="text-xs mt-2">Les données de cette course ne sont peut-être pas encore disponibles.</p>
                {selectedRace && selectedMeeting && (
                  <p className="text-xs mt-1">
                    Course: R{selectedMeeting.number}C{selectedRace.number} - {selectedRace.name}
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Comparaison Podiums si résultats disponibles */}
                {hasResults && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Podium Réel */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border-2 border-green-500">
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span>✅ Podium Réel - Résultats de la course</span>
                      </h3>
                      <div className="grid grid-cols-3 gap-2">
                        {[1, 2, 3].map((position) => {
                          const winner = participants.find(p => p.arrivalOrder === position);
                          if (!winner) return null;
                          const colors = {
                            1: 'bg-yellow-400 border-yellow-500',
                            2: 'bg-gray-300 border-gray-400',
                            3: 'bg-orange-400 border-orange-500',
                          };
                          return (
                            <div key={position} className={`${colors[position as keyof typeof colors]} border-2 rounded-lg p-2 text-center`}>
                              <div className="text-xl font-bold mb-1">{position}</div>
                              <div className="font-bold text-sm">{winner.number}</div>
                              <div className="text-xs mt-1 font-semibold line-clamp-2">{winner.name}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Podium IA */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border-2 border-blue-400">
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                        <Sparkles className="h-5 w-5 text-blue-600" />
                        <span>🤖 Podium IA - Prédiction Statistique</span>
                      </h3>
                      <div className="grid grid-cols-3 gap-2">
                        {topPronostics.slice(0, 3).map((participant, index) => {
                          const wasCorrect = participant.arrivalOrder === 1;
                          const wasPlaced = participant.arrivalOrder && participant.arrivalOrder <= 3;
                          const colors = {
                            0: 'bg-yellow-400 border-yellow-500',
                            1: 'bg-gray-300 border-gray-400',
                            2: 'bg-orange-400 border-orange-500',
                          };
                          return (
                            <div key={participant.number} className={`${colors[index as keyof typeof colors]} border-2 rounded-lg p-2 text-center`}>
                              <div className="text-xl font-bold mb-1">{index + 1}</div>
                              <div className="font-bold text-sm">{participant.number}</div>
                              <div className="text-xs mt-1 font-semibold line-clamp-2">{participant.name}</div>
                              <div className={`text-xs font-bold mt-1 ${wasCorrect ? 'text-green-700' : wasPlaced ? 'text-blue-700' : 'text-red-700'}`}>
                                {wasCorrect ? '✓ Gagné!' : participant.arrivalOrder ? `${participant.arrivalOrder}ème` : ''}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Podium IA seul si pas de résultats */}
                {!hasResults && (
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border-2 border-yellow-400">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                      <Trophy className="h-5 w-5 text-yellow-600" />
                      <span>🏆 Podium IA - Top 3 Statistique</span>
                    </h3>
                    <div className="grid grid-cols-3 gap-3 mb-3">
                    {topPronostics.slice(0, 3).map((participant, index) => {
                      const wasCorrect = participant.arrivalOrder === 1;
                      const wasPlaced = participant.arrivalOrder && participant.arrivalOrder <= 3;
                      const colors = {
                        0: 'bg-yellow-400 border-yellow-500',
                        1: 'bg-gray-300 border-gray-400',
                        2: 'bg-orange-400 border-orange-500',
                      };
                      return (
                        <div key={participant.number} className={`${colors[index as keyof typeof colors]} border-2 rounded-lg p-3 text-center`}>
                          <div className="text-2xl font-bold mb-1">{index + 1}</div>
                          <div className="font-bold text-sm">{participant.number}</div>
                          <div className="text-xs mt-1 font-semibold">{participant.name}</div>
                          <div className="text-xs mt-1">{participant.pronostic.score} pts</div>
                          {participant.arrivalOrder && (
                            <div className={`text-xs font-bold mt-1 ${wasCorrect ? 'text-green-700' : wasPlaced ? 'text-blue-700' : 'text-red-700'}`}>
                              {wasCorrect ? '✓ Gagné!' : `${participant.arrivalOrder}ème`}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs text-gray-700 bg-yellow-100 rounded p-2">
                    <strong>ℹ️ Information :</strong> Ce podium est basé uniquement sur les statistiques historiques. Il ne garantit pas le résultat de la course.
                  </p>
                  </div>
                )}

                {/* Tableaux de combinaisons - Juste après les podiums */}
                {selectedMeeting && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                      <Award className="h-5 w-5 text-purple-600" />
                      <span>📊 Statistiques des Combinaisons</span>
                    </h3>

                    {/* Combinaison Cheval + Jockey */}
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                      <div className="bg-purple-50 px-4 py-3 border-b border-purple-200">
                        <h4 className="font-semibold text-gray-900 text-sm">🤝 Taux de réussite Cheval + Jockey</h4>
                        <p className="text-xs text-gray-600 mt-1">Performances historiques de ces duos ensemble</p>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-xs">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 py-2 text-left font-semibold text-gray-700">Cheval</th>
                              <th className="px-3 py-2 text-left font-semibold text-gray-700">Jockey</th>
                              <th className="px-3 py-2 text-center font-semibold text-gray-700">Courses</th>
                              <th className="px-3 py-2 text-center font-semibold text-gray-700">Victoires</th>
                              <th className="px-3 py-2 text-center font-semibold text-gray-700">Taux</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {topPronostics.slice(0, 5).map((participant) => {
                              const jockeyName = participant.jockey || participant.driver || participant.jockeyName;
                              const combo = combinations.find((c: any) => 
                                c.horseName?.toLowerCase() === participant.name?.toLowerCase() &&
                                c.jockey?.toLowerCase() === jockeyName?.toLowerCase()
                              );
                              return (
                                <tr key={participant.number} className="hover:bg-gray-50">
                                  <td className="px-3 py-2 font-medium text-gray-900">{participant.name}</td>
                                  <td className="px-3 py-2 text-gray-700">{jockeyName || '-'}</td>
                                  <td className="px-3 py-2 text-center text-gray-600">{combo?.totalRaces || 0}</td>
                                  <td className="px-3 py-2 text-center text-green-600 font-semibold">{combo?.wins || 0}</td>
                                  <td className="px-3 py-2 text-center">
                                    {combo ? (
                                      <span className={`px-2 py-1 rounded-full font-semibold ${
                                        combo.winRate > 20 ? 'bg-green-100 text-green-700' :
                                        combo.winRate > 10 ? 'bg-blue-100 text-blue-700' :
                                        'bg-gray-100 text-gray-700'
                                      }`}>
                                        {combo.winRate.toFixed(1)}%
                                      </span>
                                    ) : (
                                      <span className="text-gray-400">N/A</span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Combinaison Cheval + Jockey + Hippodrome */}
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                      <div className="bg-indigo-50 px-4 py-3 border-b border-indigo-200">
                        <h4 className="font-semibold text-gray-900 text-sm">🎯 Taux de réussite Cheval + Jockey + Hippodrome</h4>
                        <p className="text-xs text-gray-600 mt-1">Performances sur cet hippodrome spécifique ({selectedMeeting.hippodrome.name})</p>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-xs">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 py-2 text-left font-semibold text-gray-700">Cheval</th>
                              <th className="px-3 py-2 text-left font-semibold text-gray-700">Jockey</th>
                              <th className="px-3 py-2 text-center font-semibold text-gray-700">Courses</th>
                              <th className="px-3 py-2 text-center font-semibold text-gray-700">Victoires</th>
                              <th className="px-3 py-2 text-center font-semibold text-gray-700">Podiums</th>
                              <th className="px-3 py-2 text-center font-semibold text-gray-700">Taux</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {topPronostics.slice(0, 5).map((participant) => {
                              const jockeyName = participant.jockey || participant.driver || participant.jockeyName;
                              const crossCombo = crossStats?.tripleCombinations?.top?.find((c: any) => 
                                c.horseName?.toLowerCase() === participant.name?.toLowerCase() &&
                                c.jockey?.toLowerCase() === jockeyName?.toLowerCase() &&
                                c.hippodrome?.toLowerCase() === selectedMeeting.hippodrome.name?.toLowerCase()
                              );
                              return (
                                <tr key={participant.number} className="hover:bg-gray-50">
                                  <td className="px-3 py-2 font-medium text-gray-900">{participant.name}</td>
                                  <td className="px-3 py-2 text-gray-700">{jockeyName || '-'}</td>
                                  <td className="px-3 py-2 text-center text-gray-600">{crossCombo?.totalRaces || 0}</td>
                                  <td className="px-3 py-2 text-center text-green-600 font-semibold">{crossCombo?.wins || 0}</td>
                                  <td className="px-3 py-2 text-center text-blue-600 font-semibold">{crossCombo?.podiums || 0}</td>
                                  <td className="px-3 py-2 text-center">
                                    {crossCombo ? (
                                      <span className={`px-2 py-1 rounded-full font-semibold ${
                                        crossCombo.winRate > 25 ? 'bg-green-100 text-green-700' :
                                        crossCombo.winRate > 15 ? 'bg-blue-100 text-blue-700' :
                                        'bg-gray-100 text-gray-700'
                                      }`}>
                                        {crossCombo.winRate.toFixed(1)}%
                                      </span>
                                    ) : (
                                      <span className="text-gray-400">N/A</span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                      <div className="bg-indigo-50 px-4 py-2 text-xs text-indigo-800">
                        <strong>💡 Astuce :</strong> Un taux élevé ici indique que ce trio (cheval + jockey + hippodrome) a historiquement bien performé ensemble sur cette piste !
                      </div>
                    </div>
                  </div>
                )}

                {/* Tous les participants */}
                <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg p-4 border border-primary-200">
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                    <Award className="h-5 w-5 text-primary-600" />
                    <span>Tous les Participants - Classement Statistique</span>
                  </h3>
                  <p className="text-xs text-gray-600 mb-2">
                    Basé sur les performances historiques et la forme récente
                  </p>
                  {hasResults && (
                    <div className="mt-3 pt-3 border-t border-primary-200">
                      <p className="text-xs font-semibold text-gray-700 mb-1">Légende des résultats :</p>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="flex items-center space-x-1">
                          <div className="w-3 h-3 bg-green-600 rounded"></div>
                          <span>Gagnant (1er)</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className="w-3 h-3 bg-blue-600 rounded"></div>
                          <span>Placé (2-3ème)</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className="w-3 h-3 bg-red-600 rounded"></div>
                          <span>Perdant (4ème+)</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {topPronostics.map((participant, index) => {
                  // Vérifier si le pronostic était correct
                  const wasCorrect = participant.arrivalOrder === 1;
                  const wasPlaced = participant.arrivalOrder && participant.arrivalOrder <= 3;
                  
                  return (
                  <div
                    key={participant.number}
                    className={`border-2 rounded-lg p-4 ${
                      wasCorrect ? 'border-green-400 bg-green-50' :
                      wasPlaced ? 'border-blue-400 bg-blue-50' :
                      participant.arrivalOrder ? 'border-red-400 bg-red-50' :
                      index === 0 ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-3 flex-1">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                          index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-600' : 'bg-gray-300'
                        }`}>
                          {participant.number}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 mb-1">{participant.name}</div>
                          {/* Infos Jockey et Hippodrome */}
                          <div className="space-y-1 mb-2">
                            {(() => {
                              const jockeyName = participant.jockey || participant.driver || participant.jockeyName;
                              const jockeyData = jockeyStats?.topJockeys?.find((j: any) => 
                                j.jockey?.toLowerCase() === jockeyName?.toLowerCase()
                              );
                              return (
                                <div className="flex items-center space-x-2 text-xs">
                                  <Users className="h-3 w-3 text-gray-500" />
                                  <span className="font-medium text-gray-700">{jockeyName || 'Jockey inconnu'}</span>
                                  {jockeyData && (
                                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
                                      {jockeyData.winRate.toFixed(1)}% victoires
                                    </span>
                                  )}
                                </div>
                              );
                            })()}
                            {selectedMeeting && (
                              <div className="flex items-center space-x-2 text-xs text-gray-600">
                                <MapPin className="h-3 w-3" />
                                <span>{selectedMeeting.hippodrome.name}</span>
                              </div>
                            )}
                          </div>
                          {participant.arrivalOrder && (
                            <div className={`inline-flex items-center space-x-1 text-xs font-bold px-3 py-1.5 rounded-lg ${
                              wasCorrect ? 'bg-green-600 text-white' :
                              wasPlaced ? 'bg-blue-600 text-white' :
                              'bg-red-600 text-white'
                            }`}>
                              {wasCorrect ? (
                                <>
                                  <CheckCircle className="h-4 w-4" />
                                  <span>PRONOSTIC GAGNANT - 1er</span>
                                </>
                              ) : wasPlaced ? (
                                <>
                                  <Star className="h-4 w-4" />
                                  <span>PLACÉ - {participant.arrivalOrder}ème</span>
                                </>
                              ) : (
                                <>
                                  <span>PERDANT - {participant.arrivalOrder}ème</span>
                                </>
                              )}
                            </div>
                          )}
                          <div className="flex items-center space-x-2 mt-1">
                            {getConfidenceIcon(participant.pronostic.confidence)}
                            <span className={`text-xs px-2 py-1 rounded-full border ${getConfidenceColor(participant.pronostic.confidence)}`}>
                              Confiance: {participant.pronostic.confidence === 'high' ? 'Élevée' : participant.pronostic.confidence === 'medium' ? 'Moyenne' : 'Faible'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary-600">
                          {participant.pronostic.score}
                        </div>
                        <div className="text-xs text-gray-500">points</div>
                      </div>
                    </div>

                    {participant.pronostic.reasons.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="text-xs font-semibold text-gray-700 mb-1">Raisons:</div>
                        <ul className="space-y-1">
                          {participant.pronostic.reasons.map((reason: string, idx: number) => (
                            <li key={idx} className="text-xs text-gray-600 flex items-start space-x-1">
                              <span className="text-green-600">✓</span>
                              <span>{reason}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {participant.recentForm && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <div className="text-xs font-semibold text-gray-700 mb-2">Historique des courses (du + récent au + ancien)</div>
                        <div className="overflow-x-auto">
                          <table className="min-w-full text-xs">
                            <thead>
                              <tr className="bg-gray-100">
                                <th className="px-2 py-1 text-left font-semibold">Position</th>
                                <th className="px-2 py-1 text-left font-semibold">Type</th>
                                <th className="px-2 py-1 text-left font-semibold">Partants</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(() => {
                                // Parser la forme récente - Format: 2p1p1p(24)7p etc.
                                const formString = participant.recentForm || '';
                                const races: Array<{position: string, type: string, partants?: string}> = [];
                                
                                // Regex améliorée pour capturer position + type + optionnel(partants)
                                const regex = /(\d+|[A-Za-z])([a-z])(?:\((\d+)\))?/gi;
                                let match;
                                
                                while ((match = regex.exec(formString)) !== null) {
                                  races.push({
                                    position: match[1],
                                    type: match[2],
                                    partants: match[3]
                                  });
                                }
                                
                                const typeMap: any = {
                                  'p': 'Plat',
                                  'm': 'Monté',
                                  'a': 'Attelé',
                                  'h': 'Haies',
                                  's': 'Steeple',
                                  'A': 'Arrêté',
                                  'T': 'Tombé',
                                  'D': 'Distancé',
                                };
                                
                                return races.slice(0, 5).map((race, idx: number) => {
                                  const position = race.position;
                                  const type = race.type;
                                  const partants = race.partants;
                                  
                                  const positionColor = 
                                    position === '1' ? 'text-green-700 font-bold' :
                                    position === '2' || position === '3' ? 'text-blue-700 font-semibold' :
                                    position === '0' || position === 'A' || position === 'T' || position === 'D' ? 'text-red-700' :
                                    'text-gray-700';
                                  
                                  const positionText =
                                    position === '1' ? '🥇 1er' :
                                    position === '2' ? '🥈 2ème' :
                                    position === '3' ? '🥉 3ème' :
                                    position === '0' ? '❌ Non classé' :
                                    position === 'A' ? '🛑 Arrêté' :
                                    position === 'T' ? '⚠️ Tombé' :
                                    position === 'D' ? '📉 Distancé' :
                                    `${position}ème`;
                                  
                                  return (
                                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                      <td className={`px-2 py-1 ${positionColor}`}>{positionText}</td>
                                      <td className="px-2 py-1">{typeMap[type] || type}</td>
                                      <td className="px-2 py-1 text-gray-600">{partants || '-'}</td>
                                    </tr>
                                  );
                                });
                              })()}
                            </tbody>
                          </table>
                        </div>
                        {(() => {
                          const formString = participant.recentForm || '';
                          const regex = /(\d+|[A-Za-z])([a-z])(?:\((\d+)\))?/gi;
                          const totalRaces = (formString.match(regex) || []).length;
                          
                          return totalRaces > 5 && (
                            <div className="text-xs text-gray-500 mt-1 text-center">
                              ... et {totalRaces - 5} autres courses
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                );
                })}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                  <p className="text-xs text-blue-800">
                    <strong>Note:</strong> Ces pronostics sont générés automatiquement en fonction des statistiques historiques. 
                    Ils ne garantissent pas le résultat et doivent être utilisés comme aide à la décision.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
        )}
      </div>

      {/* Results Modal - Full version from bets page */}
      {showRaceModal && raceDetails?.id && (
        <RaceDetailsModal
          raceId={raceDetails.id}
          onClose={() => setShowRaceModal(false)}
        />
      )}
    </div>
  );
}
