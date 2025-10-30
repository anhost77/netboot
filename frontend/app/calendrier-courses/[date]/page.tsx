'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Calendar, MapPin, Clock, Trophy, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, parse, addDays, subDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import Link from 'next/link';
import MarketingHeader from '@/components/marketing/MarketingHeader';
import MarketingFooter from '@/components/marketing/MarketingFooter';
import RaceDetailsModal from '@/components/races/RaceDetailsModal';
import { useAuthModal } from '@/contexts/AuthModalContext';
import { API_URL } from '@/lib/config';

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
}

export default function CalendrierDatePage() {
  const params = useParams();
  const router = useRouter();
  const { openRegisterModal } = useAuthModal();
  const [races, setRaces] = useState<Race[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [selectedRace, setSelectedRace] = useState<Race | null>(null);

  const dateStr = params.date as string;
  const selectedDate = parse(dateStr, 'yyyy-MM-dd', new Date());
  const previousDate = subDays(selectedDate, 1);
  const nextDate = addDays(selectedDate, 1);

  useEffect(() => {
    loadRaces();
  }, [dateStr]);

  const loadRaces = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/pmu/public/races?date=${dateStr}`);
      
      if (response.ok) {
        const data = await response.json();
        setRaces(data);
      } else {
        setRaces([]);
      }
    } catch (error) {
      console.error('Error loading races:', error);
      setRaces([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await fetch(`${API_URL}/pmu/sync-date?date=${dateStr}`);
      setTimeout(() => {
        loadRaces();
        setSyncing(false);
      }, 2000);
    } catch (error) {
      console.error('Error syncing:', error);
      setSyncing(false);
    }
  };

  const groupedRaces = races.reduce((acc, race) => {
    if (!acc[race.hippodrome]) {
      acc[race.hippodrome] = [];
    }
    acc[race.hippodrome].push(race);
    return acc;
  }, {} as Record<string, Race[]>);

  return (
    <div className="min-h-screen bg-gray-50">
      <MarketingHeader />

      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/calendrier-courses"
            className="inline-flex items-center gap-2 text-primary-100 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour au calendrier
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                Courses du {format(selectedDate, 'd MMMM yyyy', { locale: fr })}
              </h1>
              <p className="text-xl text-primary-100">
                {races.length} course{races.length > 1 ? 's' : ''} · {Object.keys(groupedRaces).length} hippodrome{Object.keys(groupedRaces).length > 1 ? 's' : ''}
              </p>
            </div>
            <Calendar className="w-16 h-16 text-primary-200" />
          </div>
        </div>
      </div>

      {/* Navigation par date */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              href={`/calendrier-courses/${format(previousDate, 'yyyy-MM-dd')}`}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              {format(previousDate, 'd MMM', { locale: fr })}
            </Link>
            
            <div className="text-center">
              <p className="text-sm text-gray-500">Aujourd'hui</p>
              <p className="font-bold text-gray-900">{format(selectedDate, 'EEEE d MMMM', { locale: fr })}</p>
            </div>

            <Link
              href={`/calendrier-courses/${format(nextDate, 'yyyy-MM-dd')}`}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {format(nextDate, 'd MMM', { locale: fr })}
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement des courses...</p>
          </div>
        ) : races.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Aucune course disponible</h2>
            <p className="text-gray-600 mb-6">
              Les courses pour cette date ne sont pas encore synchronisées.
            </p>
            <button
              onClick={handleSync}
              disabled={syncing}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              {syncing ? 'Synchronisation...' : 'Synchroniser les courses'}
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedRaces).map(([hippodrome, hippodromeRaces]) => (
              <div key={hippodrome} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-primary-50 to-blue-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-6 h-6 text-primary-600" />
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{hippodrome}</h2>
                      <p className="text-sm text-gray-600">{hippodromeRaces.length} course{hippodromeRaces.length > 1 ? 's' : ''}</p>
                    </div>
                  </div>
                </div>

                <div className="divide-y divide-gray-200">
                  {hippodromeRaces
                    .sort((a, b) => {
                      if (a.reunionNumber !== b.reunionNumber) {
                        return a.reunionNumber - b.reunionNumber;
                      }
                      return a.raceNumber - b.raceNumber;
                    })
                    .map((race) => (
                      <div
                        key={race.id}
                        className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => router.push(`/hippodrome/${encodeURIComponent(race.hippodrome)}/course/${dateStr}/${race.reunionNumber}/${race.raceNumber}`)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="flex items-center gap-2">
                                <span className="px-3 py-1 bg-primary-600 text-white font-bold rounded-lg text-sm">
                                  R{race.reunionNumber}C{race.raceNumber}
                                </span>
                                <Clock className="w-4 h-4 text-gray-400" />
                                <span className="text-sm font-semibold text-gray-900">{race.startTime}</span>
                              </div>
                            </div>
                            
                            <h3 className="text-lg font-bold text-gray-900 mb-2">{race.name}</h3>
                            
                            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                              <span>{race.discipline}</span>
                              <span>·</span>
                              <span>{race.distance}m</span>
                              <span>·</span>
                              <span className="font-semibold text-green-600">{race.prize.toLocaleString()}€</span>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/hippodrome/${encodeURIComponent(race.hippodrome)}/course/${dateStr}/${race.reunionNumber}/${race.raceNumber}`);
                              }}
                              className="px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center gap-2"
                            >
                              <Trophy className="w-4 h-4" />
                              Voir détails
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedRace && (
        <RaceDetailsModal
          race={selectedRace}
          onClose={() => setSelectedRace(null)}
          onBet={openRegisterModal}
        />
      )}

      <MarketingFooter />
    </div>
  );
}
