'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Calendar, ArrowLeft, MapPin, Trophy, User, Award, TrendingUp, DollarSign, Clock, Sparkles } from 'lucide-react';
import { format, parse } from 'date-fns';
import { fr } from 'date-fns/locale';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import MarketingHeader from '@/components/marketing/MarketingHeader';
import MarketingFooter from '@/components/marketing/MarketingFooter';
import { useAuthModal } from '@/contexts/AuthModalContext';
import { API_URL } from '@/lib/config';

// Force dynamic rendering pour que Next.js pré-rende le contenu IA
// Note: avec 'use client', on ne peut pas utiliser revalidate
// Le contenu sera chargé dynamiquement mais Google crawlera le JS

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
  recentForm?: string;
  blinkers?: boolean;
  unshod?: boolean;
  firstTime?: boolean;
}

interface OddsData {
  betType: string;
  label: string;
  combinations: Array<{
    horses: string;
    odds: number;
  }>;
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
  date?: Date;
  horses?: Horse[];
  reports?: any[];
}

export default function CoursePage() {
  const params = useParams();
  const router = useRouter();
  const { openRegisterModal } = useAuthModal();
  const [race, setRace] = useState<Race | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'details' | 'odds'>('details');
  const [horses, setHorses] = useState<Horse[]>([]);
  const [oddsData, setOddsData] = useState<OddsData[]>([]);
  const [loadingOdds, setLoadingOdds] = useState(false);
  const [aiPronostic, setAiPronostic] = useState<string | null>(null);
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const hippodrome = decodeURIComponent(params.hippodrome as string);
  const dateStr = params.date as string;
  const reunion = parseInt(params.reunion as string);
  const course = parseInt(params.course as string);
  const raceDate = parse(dateStr, 'yyyy-MM-dd', new Date());

  useEffect(() => {
    loadRaceData();
  }, [dateStr, hippodrome, reunion, course]);

  const loadRaceData = async () => {
    setLoading(true);
    try {
      // Charger depuis l'API publique qui inclut chevaux et rapports
      const response = await fetch(`${API_URL}/pmu-test/public/races?date=${dateStr}`);
      
      if (response.ok) {
        const races = await response.json();
        const foundRace = races.find((r: any) => 
          r.hippodrome === hippodrome && 
          r.reunionNumber === reunion && 
          r.raceNumber === course
        );
        
        if (foundRace) {
          setRace({
            ...foundRace,
            date: raceDate
          });
          
          // Charger les détails complets avec chevaux
          loadFullRaceDetails(foundRace.id);
          
          // Charger les textes IA
          loadAiContent(foundRace.id);
          return;
        }
      }

      setRace(null);
    } catch (error) {
      console.error('Error loading race:', error);
      setRace(null);
    } finally {
      setLoading(false);
    }
  };

  const loadFullRaceDetails = async (raceId: string) => {
    try {
      const response = await fetch(`${API_URL}/pmu/public/race/${raceId}`);
      if (response.ok) {
        const fullRaceData = await response.json();
        
        // Charger les chevaux
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
            arrivalOrder: h.arrivalOrder,
            recentForm: h.recentForm,
            blinkers: h.blinkers,
            unshod: h.unshod,
            firstTime: h.firstTime
          })));
        }
        
        // Charger les rapports si disponibles
        if (fullRaceData.reports && fullRaceData.reports.length > 0) {
          const mappedOdds = fullRaceData.reports.map((report: any) => ({
            betType: report.betType,
            label: getBetTypeLabel(report.betType),
            combinations: Array.isArray(report.reports) ? report.reports.map((r: any) => ({
              horses: r.combinaison || r.numPmu,
              odds: r.dividende || r.dividendePourUnEuro || r.rapport
            })) : []
          }));
          setOddsData(mappedOdds);
        } else {
          // Si pas de rapports, vérifier si course terminée et charger depuis API PMU
          const isFinished = isRaceOver(fullRaceData);
          if (isFinished) {
            loadOddsFromPMU();
          }
        }
      }
    } catch (error) {
      console.error('Error loading full race details:', error);
    }
  };

  const loadOddsFromPMU = async () => {
    setLoadingOdds(true);
    try {
      const response = await fetch(
        `${API_URL}/pmu/race/all-odds?date=${dateStr}&reunion=${reunion}&course=${course}`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.odds && data.odds.length > 0) {
          setOddsData(data.odds);
          
          // Sauvegarder en BDD en arrière-plan
          fetch(
            `${API_URL}/pmu/race/sync-reports?date=${dateStr}&reunion=${reunion}&course=${course}`
          ).catch(err => console.error('Erreur sync rapports:', err));
        }
      }
    } catch (error) {
      console.error('Error loading odds:', error);
    } finally {
      setLoadingOdds(false);
    }
  };

  const isRaceOver = (raceData: any): boolean => {
    if (!raceData.date) return false;
    
    try {
      let raceDateTime: Date;
      
      if (raceData.startTime && !raceData.startTime.includes(':')) {
        raceDateTime = new Date(Number(raceData.startTime));
      } else if (raceData.startTime && raceData.startTime.includes(':')) {
        const raceDateObj = new Date(raceData.date);
        const [hours, minutes] = raceData.startTime.split(':').map(Number);
        raceDateObj.setHours(hours, minutes, 0, 0);
        raceDateTime = raceDateObj;
      } else {
        raceDateTime = new Date(raceData.date);
      }
      
      const raceEndTime = new Date(raceDateTime.getTime() + 30 * 60 * 1000);
      return new Date() > raceEndTime;
    } catch (err) {
      return false;
    }
  };

  const loadAiContent = async (raceId: string) => {
    setLoadingAi(true);
    try {
      // Charger le pronostic
      const pronosticResponse = await fetch(`${API_URL}/pmu/race/${raceId}/ai-pronostic`);
      if (pronosticResponse.ok) {
        const pronosticData = await pronosticResponse.json();
        if (pronosticData.success && pronosticData.pronostic) {
          setAiPronostic(pronosticData.pronostic);
        }
      }

      // Charger le compte-rendu (si course terminée)
      const reportResponse = await fetch(`${API_URL}/pmu/race/${raceId}/ai-report`);
      if (reportResponse.ok) {
        const reportData = await reportResponse.json();
        if (reportData.success && reportData.report) {
          setAiReport(reportData.report);
        }
      }
    } catch (error) {
      console.error('Error loading AI content:', error);
    } finally {
      setLoadingAi(false);
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
      'DEUX_SUR_QUATRE': '2 sur 4',
      'MULTI': 'Multi',
      'MINI_MULTI': 'Mini Multi',
      'PICK5': 'Pick 5',
      'QUARTE_PLUS': 'Quarté+',
      'QUINTE_PLUS': 'Quinté+',
    };
    return labels[betType] || betType.replace(/_/g, ' ');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MarketingHeader />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement de la course...</p>
          </div>
        </div>
        <MarketingFooter />
      </div>
    );
  }

  if (!race) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MarketingHeader />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Course non trouvée</h1>
            <p className="text-gray-600 mb-6">Cette course n'existe pas ou n'est plus disponible.</p>
            <button
              onClick={() => router.push('/calendrier-courses')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Retour au calendrier
            </button>
          </div>
        </div>
        <MarketingFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MarketingHeader />

      {/* Breadcrumb (non-sticky) */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-xs text-gray-500 py-2">
            <Link
              href="/calendrier-courses"
              className="hover:text-primary-600 transition-colors"
            >
              Calendrier
            </Link>
            <span className="text-gray-400">›</span>
            <Link
              href={`/hippodrome/${encodeURIComponent(hippodrome)}`}
              className="hover:text-primary-600 transition-colors flex items-center gap-1"
            >
              <MapPin className="w-3 h-3" />
              {hippodrome}
            </Link>
            <span className="text-gray-400">›</span>
            <span className="text-gray-700">{format(raceDate, 'd MMM yyyy', { locale: fr })}</span>
            <span className="text-gray-400">›</span>
            <span className="text-gray-900 font-semibold">R{race.reunionNumber}C{race.raceNumber}</span>
          </div>
        </div>
      </div>

      {/* Navigation sticky */}
      <div className="bg-white border-b-2 border-gray-200 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Navigation rapide */}
          <div className="flex items-center gap-4 py-3 overflow-x-auto">
            <button
              onClick={() => {
                const element = document.getElementById('pronostic-ia');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4" />
              Pronostic IA
            </button>
            <button
              onClick={() => setActiveTab('details')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'details' 
                  ? 'bg-primary-600 text-white' 
                  : 'text-gray-700 hover:text-primary-600 hover:bg-primary-50'
              }`}
            >
              <Trophy className="w-4 h-4" />
              Partants
            </button>
            <button
              onClick={() => setActiveTab('odds')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'odds' 
                  ? 'bg-primary-600 text-white' 
                  : 'text-gray-700 hover:text-primary-600 hover:bg-primary-50'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              Cotes PMU
            </button>
            {horses.some(h => h.arrivalOrder) && (
              <button
                onClick={() => {
                  const element = document.getElementById('compte-rendu-ia');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors whitespace-nowrap"
              >
                <Sparkles className="w-4 h-4" />
                Compte-rendu
              </button>
            )}
            <div className="ml-auto">
              <button
                onClick={openRegisterModal}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-400 text-yellow-900 rounded-lg font-semibold hover:bg-yellow-300 transition-colors whitespace-nowrap"
              >
                <Trophy className="w-4 h-4" />
                Parier
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Header de la course */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-sm text-blue-200 mb-2">
              {format(raceDate, 'EEEE d MMMM yyyy', { locale: fr })}
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-16 h-16 bg-white text-blue-600 rounded-full flex items-center justify-center font-bold text-2xl">
                C{race.raceNumber}
              </div>
              <div>
                <h1 className="text-4xl font-bold">{race.name}</h1>
                <p className="text-xl text-blue-100 mt-1">
                  {race.hippodrome} - Réunion {race.reunionNumber}
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-6 text-blue-100">
              <div>
                <span className="text-sm">Départ</span>
                <p className="text-xl font-bold text-white">{race.startTime}</p>
              </div>
              <div>
                <span className="text-sm">Discipline</span>
                <p className="text-xl font-bold text-white">{race.discipline}</p>
              </div>
              <div>
                <span className="text-sm">Distance</span>
                <p className="text-xl font-bold text-white">{race.distance}m</p>
              </div>
              <div>
                <span className="text-sm">Allocation</span>
                <p className="text-xl font-bold text-yellow-300">{race.prize.toLocaleString()}€</p>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={openRegisterModal}
                className="px-6 py-3 bg-yellow-400 text-blue-900 rounded-lg font-semibold hover:bg-yellow-300 transition-colors inline-flex items-center gap-2"
              >
                <Trophy className="w-5 h-5" />
                Parier sur cette course
              </button>
            </div>
        </div>
      </div>

      {/* Section Pronostic IA (placeholder) */}
      <div id="pronostic-ia" className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-8 h-8 text-purple-600" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Pronostic IA</h2>
                <p className="text-sm text-gray-600">Analyse générée par intelligence artificielle</p>
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 border border-purple-100">
              {loadingAi ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-600">Génération du pronostic IA...</p>
                </div>
              ) : aiPronostic ? (
                <div className="prose prose-sm max-w-none text-gray-700">
                  <ReactMarkdown>{aiPronostic}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-gray-600 italic">
                  Le pronostic IA n'est pas encore disponible pour cette course.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Onglets Détails / Cotes */}
      <div className="pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Tabs */}
            <div className="border-b border-gray-200 bg-gray-50">
              <div className="flex">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                    activeTab === 'details'
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Trophy className="w-5 h-5" />
                    Détails & Partants
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('odds')}
                  className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                    activeTab === 'odds'
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Cotes PMU
                  </div>
                </button>
              </div>
            </div>

            {/* Contenu des onglets */}
            <div className="p-6">
              {activeTab === 'details' && (
                <div className="space-y-6">
                  {/* Podium si résultats disponibles */}
                  {horses.some(h => h.arrivalOrder) && (
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border-2 border-yellow-200 mb-6">
                      <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Trophy className="w-7 h-7 text-yellow-500" />
                        Podium
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1, 2, 3].map(position => {
                          const horse = horses.find(h => h.arrivalOrder === position);
                          if (!horse) return null;
                          
                          const colors = {
                            1: { bg: 'from-yellow-400 to-yellow-500', border: 'border-yellow-600', text: 'text-yellow-900' },
                            2: { bg: 'from-gray-300 to-gray-400', border: 'border-gray-600', text: 'text-gray-900' },
                            3: { bg: 'from-orange-400 to-orange-500', border: 'border-orange-600', text: 'text-orange-900' }
                          };
                          
                          const color = colors[position as 1|2|3];
                          
                          return (
                            <div key={position} className={`bg-gradient-to-br ${color.bg} border-4 ${color.border} rounded-2xl p-6 shadow-2xl transform hover:scale-105 transition-all`}>
                              <div className="text-7xl font-black text-white mb-3 drop-shadow-lg">{position}°</div>
                              <div className="bg-white rounded-xl p-5 space-y-3">
                                <div className="flex items-center justify-center gap-3">
                                  <div className="w-14 h-14 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-xl shadow-lg">
                                    {horse.number}
                                  </div>
                                  <div className="flex-1 text-left">
                                    <p className={`font-bold text-base ${color.text}`}>
                                      {horse.name}
                                    </p>
                                    {horse.odds && (
                                      <p className="text-sm font-bold text-green-600">
                                        💰 {Number(horse.odds).toFixed(2)}€
                                      </p>
                                    )}
                                  </div>
                                </div>
                                
                                {/* Jockey et Entraîneur */}
                                <div className="space-y-2 pt-2 border-t border-gray-200">
                                  {horse.jockey && (
                                    <div className="flex items-center gap-2 text-xs">
                                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                        <User className="w-3 h-3 text-blue-600" />
                                      </div>
                                      <span className="text-gray-700 font-medium">🏇 {horse.jockey}</span>
                                    </div>
                                  )}
                                  {horse.trainer && (
                                    <div className="flex items-center gap-2 text-xs">
                                      <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                                        <Award className="w-3 h-3 text-purple-600" />
                                      </div>
                                      <span className="text-gray-700 font-medium">👔 {horse.trainer}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Liste des partants */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Trophy className="w-6 h-6 text-yellow-500" />
                      Partants ({horses.length})
                    </h3>

                    {horses.length > 0 ? (
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
                                
                                {/* Jockey et Entraîneur en évidence */}
                                <div className="flex flex-wrap gap-3 mt-2">
                                  {horse.jockey && (
                                    <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                                      <User className="w-4 h-4" />
                                      <span>🏇 {horse.jockey}</span>
                                    </div>
                                  )}
                                  {horse.trainer && (
                                    <div className="flex items-center gap-2 px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm font-medium">
                                      <Award className="w-4 h-4" />
                                      <span>👔 {horse.trainer}</span>
                                    </div>
                                  )}
                                </div>
                                
                                {/* Autres infos */}
                                <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-600">
                                  {horse.weight && (
                                    <span>⚖️ {horse.weight}kg</span>
                                  )}
                                  {horse.odds && (
                                    <span className="text-green-600 font-semibold">
                                      💰 {horse.odds}
                                    </span>
                                  )}
                                </div>
                                {(horse.age || horse.sex || horse.rope) && (
                                  <div className="flex gap-3 mt-2 text-xs text-gray-500">
                                    {horse.age && <span>{horse.age} ans</span>}
                                    {horse.sex && <span>{horse.sex}</span>}
                                    {horse.rope && <span>Corde: {horse.rope}</span>}
                                  </div>
                                )}
                                
                                {/* Performances récentes */}
                                {horse.recentForm && (
                                  <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <p className="text-xs font-semibold text-gray-700 mb-1">📊 Musique (performances récentes)</p>
                                    <p className="text-sm font-mono text-gray-900 tracking-wide">
                                      {horse.recentForm}
                                    </p>
                                  </div>
                                )}
                              </div>

                              {/* Position d'arrivée */}
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
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-gray-500 py-8">Aucun partant enregistré</p>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'odds' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <DollarSign className="w-6 h-6 text-green-600" />
                    💰 Rapports PMU
                  </h3>

                  {loadingOdds ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="mt-4 text-gray-600">Chargement des cotes...</p>
                    </div>
                  ) : oddsData.length > 0 ? (
                    <div className="space-y-6">
                      {oddsData.map((betTypeData, idx) => (
                        <div key={idx} className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-xl p-6 shadow-sm">
                          {/* En-tête du type de pari */}
                          <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-gray-200">
                            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                              <DollarSign className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h4 className="font-bold text-xl text-gray-900">{betTypeData.label}</h4>
                              <p className="text-sm text-gray-500">{betTypeData.combinations?.length || 0} combinaison(s)</p>
                            </div>
                          </div>
                          
                          {betTypeData.combinations && betTypeData.combinations.length > 0 ? (
                            <div className="space-y-2">
                              {betTypeData.combinations.map((combo, comboIdx) => (
                                <div
                                  key={comboIdx}
                                  className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-400 hover:shadow-md transition-all"
                                >
                                  <div className="flex items-center gap-3 flex-1">
                                    <div className={`${combo.horses.toString().length > 2 ? 'min-w-[60px] px-3' : 'w-12'} h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0`}>
                                      <span className="font-bold text-primary-700 text-lg">{combo.horses}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs text-gray-500 uppercase tracking-wide">Cheval</p>
                                      <p className="font-semibold text-gray-900 truncate">
                                        {(() => {
                                          const horseNumbers = combo.horses.toString().split('-').map(n => parseInt(n.trim()));
                                          const horseNames = horseNumbers.map(num => {
                                            const horse = horses.find(h => h.number === num);
                                            return horse ? horse.name : `N°${num}`;
                                          });
                                          return horseNames.join(' - ');
                                        })()}
                                      </p>
                                      {/* Afficher jockey et entraîneur pour les paris simples */}
                                      {(() => {
                                        const horseNumbers = combo.horses.toString().split('-').map(n => parseInt(n.trim()));
                                        if (horseNumbers.length === 1) {
                                          const horse = horses.find(h => h.number === horseNumbers[0]);
                                          if (horse) {
                                            return (
                                              <div className="flex gap-3 mt-1 text-xs text-gray-500">
                                                {horse.jockey && <span>🏇 {horse.jockey}</span>}
                                                {horse.trainer && <span>👔 {horse.trainer}</span>}
                                              </div>
                                            );
                                          }
                                        }
                                        return null;
                                      })()}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Rapport</p>
                                    <p className="text-2xl font-bold text-green-600">{(combo.odds / 100).toFixed(2)}€</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-6 bg-gray-100 rounded-lg">
                              <p className="text-gray-500 text-sm">Aucune cote disponible pour ce type de pari</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      {(() => {
                        // Détecter si c'est un hippodrome étranger (non français)
                        const frenchHippodromes = ['VINCENNES', 'LONGCHAMP', 'CHANTILLY', 'DEAUVILLE', 'AUTEUIL', 'SAINT-CLOUD', 'MAISONS-LAFFITTE', 'COMPIEGNE', 'ENGHIEN', 'CAGNES', 'LYON', 'MARSEILLE', 'TOULOUSE', 'BORDEAUX'];
                        const isForeign = !frenchHippodromes.some(h => race.hippodrome.toUpperCase().includes(h));
                        
                        if (isForeign) {
                          return (
                            <>
                              <p className="text-gray-600 font-semibold">Rapports non disponibles</p>
                              <p className="text-sm text-gray-500 mt-2">
                                Les cotes PMU ne sont pas disponibles pour les hippodromes étrangers.
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                Hippodrome : {race.hippodrome}
                              </p>
                            </>
                          );
                        }
                        
                        return (
                          <>
                            <p className="text-gray-600">Les rapports PMU ne sont pas encore disponibles.</p>
                            <p className="text-sm text-gray-500 mt-2">Les cotes seront publiées après la course.</p>
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Section Compte-rendu IA (placeholder) */}
          {horses.some(h => h.arrivalOrder) && (
            <div id="compte-rendu-ia" className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-xl p-6 mt-8">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-8 h-8 text-green-600" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Compte-rendu IA</h2>
                  <p className="text-sm text-gray-600">Analyse post-course générée par intelligence artificielle</p>
                </div>
              </div>
              <div className="bg-white rounded-lg p-6 border border-green-100">
                {loadingAi ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-600">Génération du compte-rendu IA...</p>
                  </div>
                ) : aiReport ? (
                  <div className="prose prose-sm max-w-none text-gray-700">
                    <ReactMarkdown>{aiReport}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-gray-600 italic">
                    Le compte-rendu IA sera disponible après la publication des résultats.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white rounded-xl p-8 text-center mt-8">
            <h2 className="text-3xl font-bold mb-4">
              Suivez vos paris sur cette course
            </h2>
            <p className="text-xl text-primary-100 mb-6">
              Enregistrez vos paris, analysez vos résultats et améliorez vos performances
            </p>
            <button
              onClick={openRegisterModal}
              className="inline-flex items-center gap-2 bg-yellow-400 text-primary-900 px-8 py-4 rounded-lg font-bold text-lg hover:bg-yellow-300 transition-all"
            >
              Commencer Gratuitement
            </button>
          </div>
        </div>
      </div>

      <MarketingFooter />
    </div>
  );
}
