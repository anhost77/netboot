'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MapPin, Calendar, Trophy, TrendingUp, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Link from 'next/link';
import MarketingHeader from '@/components/marketing/MarketingHeader';
import MarketingFooter from '@/components/marketing/MarketingFooter';
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
  date: string;
}

interface HippodromeContent {
  title: string;
  description: string;
  content: string;
  stats?: {
    totalRaces?: number;
    avgPrize?: number;
    disciplines?: string[];
  };
}

export default function HippodromePage() {
  const params = useParams();
  const router = useRouter();
  const { openRegisterModal } = useAuthModal();
  const hippodrome = decodeURIComponent(params.hippodrome as string);
  
  const [upcomingRaces, setUpcomingRaces] = useState<Race[]>([]);
  const [content, setContent] = useState<HippodromeContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  useEffect(() => {
    loadHippodromeData();
  }, [hippodrome, selectedDate]);

  const loadHippodromeData = async () => {
    setLoading(true);
    try {
      // Charger le contenu CMS de l'hippodrome
      try {
        const cmsResponse = await fetch(`${API_URL}/cms/pages/slug/hippodrome-${hippodrome.toLowerCase()}`);
        if (cmsResponse.ok) {
          const cmsData = await cmsResponse.json();
          setContent({
            title: cmsData.title,
            description: cmsData.excerpt || '',
            content: cmsData.content || ''
          });
        }
      } catch (error) {
        console.log('No CMS content for this hippodrome');
      }

      // Charger les courses pour la date sélectionnée
      const racesResponse = await fetch(`${API_URL}/pmu-test/public/races?date=${selectedDate}`);
      if (racesResponse.ok) {
        const races = await racesResponse.json();
        const hippodromeRaces = races.filter((r: any) => r.hippodrome === hippodrome);
        
        // Dédupliquer les courses (même réunion + même numéro = même course)
        const uniqueRaces = hippodromeRaces.reduce((acc: any[], race: any) => {
          const key = `${race.reunionNumber}-${race.raceNumber}`;
          if (!acc.find((r: any) => `${r.reunionNumber}-${r.raceNumber}` === key)) {
            acc.push(race);
          }
          return acc;
        }, []);
        
        setUpcomingRaces(uniqueRaces.map((r: any) => ({ ...r, date: selectedDate })));
      }

      // Si pas de contenu CMS, créer un contenu par défaut
      if (!content) {
        setContent({
          title: `Hippodrome de ${hippodrome}`,
          description: `Découvrez toutes les courses et informations sur l'hippodrome de ${hippodrome}`,
          content: `L'hippodrome de ${hippodrome} est l'un des sites majeurs des courses hippiques en France. Retrouvez ici toutes les courses, les résultats et les statistiques.`
        });
      }
    } catch (error) {
      console.error('Error loading hippodrome data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MarketingHeader />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement...</p>
          </div>
        </div>
        <MarketingFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MarketingHeader />

      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="w-12 h-12" />
              <h1 className="text-5xl font-bold">{content?.title || `Hippodrome de ${hippodrome}`}</h1>
            </div>
            <p className="text-xl text-blue-100">
              {content?.description || `Toutes les courses et informations sur ${hippodrome}`}
            </p>
          </div>
        </div>
      </div>

      {/* Barre de recherche par date */}
      <div className="bg-white border-b border-gray-200 py-6">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <label className="flex items-center gap-3 flex-1">
                <Calendar className="w-6 h-6 text-blue-600" />
                <span className="font-semibold text-gray-700">Rechercher des courses :</span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </label>
              <Link
                href="/calendrier-courses"
                className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-2 whitespace-nowrap"
              >
                Voir tout le calendrier
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Courses */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {upcomingRaces.length > 0 ? (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {upcomingRaces.length} course{upcomingRaces.length > 1 ? 's' : ''} le {format(new Date(selectedDate), 'd MMMM yyyy', { locale: fr })}
              </h2>

              <div className="grid gap-4">
                {upcomingRaces.map((race) => (
                  <Link
                    key={race.id}
                    href={`/hippodrome/${encodeURIComponent(hippodrome)}/course/${race.date}/${race.reunionNumber}/${race.raceNumber}`}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                          C{race.raceNumber}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{race.name}</h3>
                          <div className="flex gap-4 text-sm text-gray-600 mt-1">
                            <span>{race.startTime}</span>
                            <span>{race.discipline}</span>
                            <span>{race.distance}m</span>
                            <span className="text-green-600 font-semibold">{race.prize.toLocaleString()}€</span>
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-6 h-6 text-gray-400" />
                    </div>
                  </Link>
                ))}
              </div>
            </>
          ) : (
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-8 text-center">
              <Calendar className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Aucune course ce jour
              </h3>
              <p className="text-gray-700 mb-6">
                Il n'y a pas de courses programmées à {hippodrome} le {format(new Date(selectedDate), 'd MMMM yyyy', { locale: fr })}.
              </p>
              <p className="text-sm text-gray-600">
                Utilisez le sélecteur de date ci-dessus pour consulter les courses passées ou à venir.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Contenu CMS */}
      {content?.content && (
        <div className="bg-white py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto prose prose-lg">
              <div dangerouslySetInnerHTML={{ __html: content.content }} />
            </div>
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Suivez vos paris sur {hippodrome}
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Enregistrez vos paris, analysez vos performances et optimisez votre stratégie
          </p>
          <button
            onClick={openRegisterModal}
            className="inline-flex items-center gap-2 bg-yellow-400 text-primary-900 px-8 py-4 rounded-lg font-bold text-lg hover:bg-yellow-300 transition-all"
          >
            Commencer Gratuitement
          </button>
        </div>
      </div>

      <MarketingFooter />
    </div>
  );
}
