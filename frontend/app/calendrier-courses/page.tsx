'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, Clock, MapPin, Trophy, ChevronRight, Search, Filter } from 'lucide-react';
import { format, addDays, startOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';

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

export default function CalendrierCourses() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [races, setRaces] = useState<Race[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHippodrome, setSelectedHippodrome] = useState('all');

  useEffect(() => {
    // Fetch races from API
    fetchRaces(selectedDate);
  }, [selectedDate]);

  const fetchRaces = async (date: Date) => {
    setLoading(true);
    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pmu/races?date=${dateStr}`);
      if (response.ok) {
        const data = await response.json();
        setRaces(data);
      }
    } catch (error) {
      console.error('Error fetching races:', error);
      // Mock data for demonstration
      setRaces(generateMockRaces(date));
    } finally {
      setLoading(false);
    }
  };

  const generateMockRaces = (date: Date): Race[] => {
    const hippodromes = ['VINCENNES', 'LONGCHAMP', 'CHANTILLY', 'DEAUVILLE', 'COMPIEGNE', 'ENGHIEN', 'CAGNES SUR MER'];
    const disciplines = ['Trot', 'Plat', 'Obstacle'];
    const mockRaces: Race[] = [];

    hippodromes.forEach((hippodrome, hippoIndex) => {
      const racesCount = Math.floor(Math.random() * 8) + 3;
      for (let i = 1; i <= racesCount; i++) {
        mockRaces.push({
          id: `${hippodrome}-R${hippoIndex + 1}-C${i}`,
          hippodrome,
          reunionNumber: hippoIndex + 1,
          raceNumber: i,
          name: `Prix de ${hippodrome}`,
          startTime: `${13 + Math.floor(Math.random() * 6)}:${['00', '15', '30', '45'][Math.floor(Math.random() * 4)]}`,
          discipline: disciplines[Math.floor(Math.random() * disciplines.length)],
          distance: 1000 + Math.floor(Math.random() * 3000),
          prize: 10000 + Math.floor(Math.random() * 90000),
          betTypes: ['Simple Gagnant', 'Simple Placé', 'Couplé', 'Trio', 'Quinté+']
        });
      }
    });

    return mockRaces.sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  const hippodromes = ['all', ...Array.from(new Set(races.map(r => r.hippodrome)))];

  const filteredRaces = races.filter(race => {
    const matchesSearch = race.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      race.hippodrome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesHippodrome = selectedHippodrome === 'all' || race.hippodrome === selectedHippodrome;
    return matchesSearch && matchesHippodrome;
  });

  const groupedRaces = filteredRaces.reduce((acc, race) => {
    if (!acc[race.hippodrome]) {
      acc[race.hippodrome] = [];
    }
    acc[race.hippodrome].push(race);
    return acc;
  }, {} as Record<string, Race[]>);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Calendar className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Calendrier des Courses Hippiques
            </h1>
            <p className="text-xl text-primary-100 mb-6">
              Retrouvez toutes les courses PMU du jour et de la semaine. Programme complet avec horaires et détails.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-yellow-400 text-primary-900 px-6 py-3 rounded-lg font-bold hover:bg-yellow-300 transition-all"
            >
              Suivre mes paris avec BetTracker Pro
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation par date */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap gap-2 justify-center">
            {[...Array(7)].map((_, i) => {
              const date = addDays(startOfDay(new Date()), i);
              const isSelected = format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
              return (
                <button
                  key={i}
                  onClick={() => setSelectedDate(date)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    isSelected
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <div className="text-sm">{format(date, 'EEE', { locale: fr })}</div>
                  <div className="text-lg">{format(date, 'd MMM', { locale: fr })}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Recherche */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher une course ou un hippodrome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Filtre hippodrome */}
            <div className="md:w-64">
              <select
                value={selectedHippodrome}
                onChange={(e) => setSelectedHippodrome(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">Tous les hippodromes</option>
                {hippodromes.slice(1).map(h => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Résumé */}
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-primary-900">
              <Trophy className="w-5 h-5" />
              <span className="font-semibold">
                {filteredRaces.length} course{filteredRaces.length > 1 ? 's' : ''} programmée{filteredRaces.length > 1 ? 's' : ''}
                le {format(selectedDate, 'd MMMM yyyy', { locale: fr })}
              </span>
            </div>
          </div>

          {/* Liste des courses */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Chargement des courses...</p>
            </div>
          ) : Object.keys(groupedRaces).length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune course trouvée</h3>
              <p className="text-gray-600">Essayez de sélectionner une autre date ou modifiez vos filtres.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedRaces).map(([hippodrome, hippodromeRaces]) => (
                <div key={hippodrome} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  {/* En-tête hippodrome */}
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-6 h-6" />
                      <div>
                        <h2 className="text-2xl font-bold">{hippodrome}</h2>
                        <p className="text-primary-100">{hippodromeRaces.length} course{hippodromeRaces.length > 1 ? 's' : ''}</p>
                      </div>
                    </div>
                  </div>

                  {/* Courses */}
                  <div className="divide-y divide-gray-200">
                    {hippodromeRaces.map((race, index) => (
                      <div
                        key={race.id}
                        className="p-6 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="inline-flex items-center justify-center w-10 h-10 bg-primary-100 text-primary-700 rounded-full font-bold">
                                C{race.raceNumber}
                              </span>
                              <div>
                                <h3 className="text-lg font-bold text-gray-900">{race.name}</h3>
                                <div className="flex flex-wrap gap-3 text-sm text-gray-600 mt-1">
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {race.startTime}
                                  </span>
                                  <span className="px-2 py-0.5 bg-gray-100 rounded">
                                    {race.discipline}
                                  </span>
                                  <span>{race.distance}m</span>
                                  <span className="text-green-600 font-semibold">
                                    {race.prize.toLocaleString()}€
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Types de paris disponibles */}
                            <div className="flex flex-wrap gap-2 mt-3">
                              {race.betTypes.map(type => (
                                <span
                                  key={type}
                                  className="text-xs px-2 py-1 bg-primary-50 text-primary-700 rounded-full font-medium"
                                >
                                  {type}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Link
                              href={`/pronostics/${race.id}`}
                              className="px-4 py-2 bg-yellow-400 text-primary-900 rounded-lg font-semibold hover:bg-yellow-300 transition-colors text-sm"
                            >
                              Pronostic
                            </Link>
                            <Link
                              href="/register"
                              className="px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors text-sm"
                            >
                              Parier
                            </Link>
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
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16 mt-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Suivez vos paris sur ces courses
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Avec BetTracker Pro, enregistrez vos paris, analysez vos performances et optimisez votre stratégie
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-yellow-400 text-primary-900 px-8 py-4 rounded-lg font-bold text-lg hover:bg-yellow-300 transition-all"
          >
            Commencer Gratuitement
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* SEO Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto prose prose-lg">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Calendrier des Courses Hippiques PMU
          </h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            Consultez le programme complet des courses hippiques PMU sur tous les hippodromes français.
            Notre calendrier est mis à jour quotidiennement avec les horaires précis, les disciplines
            (trot, plat, obstacle), les distances et les allocations de chaque course.
          </p>

          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Tous les hippodromes français
          </h3>
          <p className="text-gray-700 leading-relaxed mb-6">
            Retrouvez les courses de Vincennes, Longchamp, Chantilly, Deauville, Cagnes-sur-Mer,
            Compiègne, Enghien et tous les autres hippodromes. Programme détaillé avec les informations
            essentielles pour préparer vos paris.
          </p>

          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Quinté+ et courses principales
          </h3>
          <p className="text-gray-700 leading-relaxed">
            Identifiez rapidement les courses Quinté+ et les réunions principales. Accédez aux pronostics
            gratuits et suivez vos paris avec BetTracker Pro pour améliorer vos performances sur le long terme.
          </p>
        </div>
      </div>
    </div>
  );
}
