'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Calendar, ArrowLeft, MapPin } from 'lucide-react';
import { format, parse } from 'date-fns';
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
  date?: Date;
}

export default function CoursePage() {
  const params = useParams();
  const router = useRouter();
  const { openRegisterModal } = useAuthModal();
  const [race, setRace] = useState<Race | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

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
      const response = await fetch(`${API_URL}/pmu/public/races?date=${dateStr}`);
      
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
        } else {
          // Créer une course mock pour le SEO
          setRace({
            id: `${hippodrome}-R${reunion}-C${course}`,
            hippodrome,
            reunionNumber: reunion,
            raceNumber: course,
            name: `Prix de ${hippodrome}`,
            startTime: '14:30',
            discipline: 'Trot',
            distance: 2100,
            prize: 50000,
            betTypes: ['Simple Gagnant', 'Simple Placé', 'Couplé', 'Trio', 'Quinté+'],
            date: raceDate
          });
        }
      }
    } catch (error) {
      console.error('Error loading race:', error);
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

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link
              href="/calendrier-courses"
              className="hover:text-primary-600 transition-colors"
            >
              Calendrier
            </Link>
            <span>/</span>
            <Link
              href={`/hippodrome/${encodeURIComponent(hippodrome)}`}
              className="hover:text-primary-600 transition-colors flex items-center gap-1"
            >
              <MapPin className="w-4 h-4" />
              {hippodrome}
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">{format(raceDate, 'd MMM yyyy', { locale: fr })}</span>
            <span>/</span>
            <span className="text-gray-900 font-medium">R{race.reunionNumber}C{race.raceNumber}</span>
          </div>
        </div>
      </div>

      {/* Header de la course */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
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

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowModal(true)}
                className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                Voir tous les détails
              </button>
              <button
                onClick={openRegisterModal}
                className="px-6 py-3 bg-yellow-400 text-blue-900 rounded-lg font-semibold hover:bg-yellow-300 transition-colors"
              >
                Parier sur cette course
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu SEO */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              À propos de cette course
            </h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed">
                La course <strong>{race.name}</strong> se déroule le{' '}
                <strong>{format(raceDate, 'd MMMM yyyy', { locale: fr })}</strong> à l'hippodrome de{' '}
                <Link 
                  href={`/hippodrome/${encodeURIComponent(hippodrome)}`}
                  className="text-blue-600 hover:text-blue-700 font-semibold"
                >
                  {race.hippodrome}
                </Link> dans le cadre de la réunion {race.reunionNumber}. 
                Cette épreuve de <strong>{race.discipline}</strong> sur une distance de{' '}
                <strong>{race.distance} mètres</strong> offre une allocation de{' '}
                <strong className="text-green-600">{race.prize.toLocaleString()}€</strong>.
              </p>
              
              <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">
                Paris disponibles
              </h3>
              <p className="text-gray-700">
                Pour cette course, vous pouvez placer les types de paris suivants :
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                {race.betTypes.map(type => (
                  <li key={type}>{type}</li>
                ))}
              </ul>

              <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">
                Comment parier ?
              </h3>
              <p className="text-gray-700">
                Avec BetTracker Pro, suivez vos paris hippiques et analysez vos performances. 
                Consultez les partants, les cotes PMU en temps réel et optimisez votre stratégie 
                de paris sur toutes les courses du PMU.
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white rounded-xl p-8 text-center">
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

      {/* Modal */}
      {showModal && (
        <RaceDetailsModal
          race={race}
          onClose={() => setShowModal(false)}
          onBet={openRegisterModal}
        />
      )}

      <MarketingFooter />
    </div>
  );
}
