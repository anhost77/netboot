'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trophy, User, Award, TrendingUp, DollarSign, Sparkles, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { useAuthModal } from '@/contexts/AuthModalContext';

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
}

interface OddsData {
  betType: string;
  label: string;
  combinations: Array<{
    horses: string;
    odds: number;
  }>;
}

interface CoursePageClientProps {
  race: any;
  horses: Horse[];
  oddsData: OddsData[];
  aiPronostic: string | null;
  aiReport: string | null;
  raceDate: Date;
}

export default function CoursePageClient({
  race,
  horses: initialHorses,
  oddsData: initialOddsData,
  aiPronostic,
  aiReport,
  raceDate,
}: CoursePageClientProps) {
  const router = useRouter();
  const { openRegisterModal } = useAuthModal();
  const [activeTab, setActiveTab] = useState<'details' | 'odds'>('details');
  const [horses] = useState<Horse[]>(initialHorses);
  const [oddsData] = useState<OddsData[]>(initialOddsData);

  const hippodrome = race.hippodrome;
  const reunion = race.reunionNumber;
  const course = race.raceNumber;

  return (
    <>
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
            <span className="text-gray-900 font-semibold">R{reunion}C{course}</span>
          </div>
        </div>
      </div>

      {/* Navigation sticky */}
      <div className="bg-white border-b-2 border-gray-200 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

      {/* Section Pronostic IA */}
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
              {aiPronostic ? (
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

            {/* Contenu des onglets - À CONTINUER... */}
            <div className="p-6">
              <p className="text-gray-600">Contenu à implémenter (podium, chevaux, cotes)...</p>
            </div>
          </div>
        </div>
      </div>

      {/* Section Compte-rendu IA */}
      {horses.some(h => h.arrivalOrder) && aiReport && (
        <div className="pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div id="compte-rendu-ia" className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-8 h-8 text-green-600" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Compte-rendu IA</h2>
                  <p className="text-sm text-gray-600">Analyse post-course générée par intelligence artificielle</p>
                </div>
              </div>
              <div className="bg-white rounded-lg p-6 border border-green-100">
                <div className="prose prose-sm max-w-none text-gray-700">
                  <ReactMarkdown>{aiReport}</ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
    </>
  );
}
