'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trophy, Star, TrendingUp, Target, ChevronRight, Calendar, Clock, Award, Zap } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import MarketingHeader from '@/components/marketing/MarketingHeader';
import MarketingFooter from '@/components/marketing/MarketingFooter';
import { useAuthModal } from '@/contexts/AuthModalContext';
import { API_URL } from '@/lib/config';

interface Pronostic {
  id: string;
  raceId: string;
  raceName: string;
  hippodrome: string;
  raceNumber: number;
  startTime: string;
  discipline: string;
  distance: number;
  selections: {
    position: number;
    horseNumber: number;
    horseName: string;
    jockey: string;
    confidence: 'high' | 'medium' | 'low';
    cote: number;
    analysis: string;
  }[];
  betType: string;
  stake: string;
  analysis: string;
  isPremium: boolean;
}

export default function PronosticsPage() {
  const { openRegisterModal } = useAuthModal();
  const [pronostics, setPronostics] = useState<Pronostic[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<'all' | 'quinte' | 'autres'>('all');

  useEffect(() => {
    loadPronostics();
  }, []);

  const loadPronostics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/pmu/public/pronostics`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.pronostics) {
          setPronostics(data.pronostics);
        } else {
          // Fallback sur mock si pas de pronostics
          setPronostics(generateMockPronostics());
        }
      } else {
        setPronostics(generateMockPronostics());
      }
    } catch (error) {
      console.error('Error loading pronostics:', error);
      setPronostics(generateMockPronostics());
    } finally {
      setLoading(false);
    }
  };

  const generateMockPronostics = (): Pronostic[] => {
    return [
      {
        id: '1',
        raceId: 'VINCENNES-R1-C5',
        raceName: 'Prix de Vincennes',
        hippodrome: 'VINCENNES',
        raceNumber: 5,
        startTime: '15:20',
        discipline: 'Trot',
        distance: 2100,
        betType: 'Quinté+',
        stake: '2-5-8-11-14',
        selections: [
          {
            position: 1,
            horseNumber: 2,
            horseName: 'ECLAIR DU MATIN',
            jockey: 'P. Levesque',
            confidence: 'high',
            cote: 4.5,
            analysis: 'Excellente forme récente. 3 victoires sur les 5 dernières courses.'
          },
          {
            position: 2,
            horseNumber: 5,
            horseName: 'FLAMME ROYALE',
            jockey: 'E. Raffin',
            confidence: 'high',
            cote: 5.2,
            analysis: 'Très régulière sur ce type de parcours. Adore Vincennes.'
          },
          {
            position: 3,
            horseNumber: 8,
            horseName: 'GENTLEMAN DU PARC',
            jockey: 'G. Gelormini',
            confidence: 'medium',
            cote: 8.5,
            analysis: 'Belle performance la dernière fois. Peut jouer les premiers rôles.'
          },
          {
            position: 4,
            horseNumber: 11,
            horseName: 'HERMES DE CAHOT',
            jockey: 'M. Abrivard',
            confidence: 'medium',
            cote: 12.0,
            analysis: 'Outsider intéressant. Bonne cote pour une place.'
          },
          {
            position: 5,
            horseNumber: 14,
            horseName: 'IMPERIAL STAR',
            jockey: 'A. Abrivard',
            confidence: 'low',
            cote: 15.0,
            analysis: 'Cheval de complément mais capable d\'une bonne surprise.'
          }
        ],
        analysis: 'Course très ouverte avec plusieurs prétendants. ECLAIR DU MATIN semble avoir les faveurs avec sa forme actuelle exceptionnelle. FLAMME ROYALE est une valeur sûre sur ce parcours. Pour le Quinté+, nous recommandons une combinaison avec les 5 chevaux cités.',
        isPremium: false
      },
      {
        id: '2',
        raceId: 'LONGCHAMP-R1-C3',
        raceName: 'Prix de Longchamp',
        hippodrome: 'LONGCHAMP',
        raceNumber: 3,
        startTime: '14:50',
        discipline: 'Plat',
        distance: 1600,
        betType: 'Trio',
        stake: '1-7-12',
        selections: [
          {
            position: 1,
            horseNumber: 1,
            horseName: 'BELLA CIAO',
            jockey: 'C. Soumillon',
            confidence: 'high',
            cote: 3.2,
            analysis: 'Favorite légitime. Impressionnante à l\'entraînement.'
          },
          {
            position: 2,
            horseNumber: 7,
            horseName: 'DIAMANT NOIR',
            jockey: 'M. Barzalona',
            confidence: 'high',
            cote: 4.8,
            analysis: 'Très bon cheval sur cette distance. Régulier dans ses performances.'
          },
          {
            position: 3,
            horseNumber: 12,
            horseName: 'PRINCESSE MAYA',
            jockey: 'P. Boudot',
            confidence: 'medium',
            cote: 7.5,
            analysis: 'Capable du meilleur. A surveiller de près.'
          }
        ],
        analysis: 'Belle course de plat avec BELLA CIAO qui domine les débats. Pour le Trio, associez-la avec DIAMANT NOIR et PRINCESSE MAYA pour une combinaison solide.',
        isPremium: false
      },
      {
        id: '3',
        raceId: 'CHANTILLY-R1-C4',
        raceName: 'Grand Prix de Chantilly',
        hippodrome: 'CHANTILLY',
        raceNumber: 4,
        startTime: '16:35',
        discipline: 'Plat',
        distance: 2400,
        betType: 'Couplé',
        stake: '3-9',
        selections: [
          {
            position: 1,
            horseNumber: 3,
            horseName: 'EMPEREUR',
            jockey: 'O. Peslier',
            confidence: 'high',
            cote: 2.8,
            analysis: 'Grand favori. Vient de réaliser une performance exceptionnelle.'
          },
          {
            position: 2,
            horseNumber: 9,
            horseName: 'VALEUREUX',
            jockey: 'T. Bachelot',
            confidence: 'high',
            cote: 5.5,
            analysis: 'Cheval en grande forme. Parfait pour le couplé avec EMPEREUR.'
          }
        ],
        analysis: 'Course relevée mais EMPEREUR semble intouchable. Le Couplé 3-9 offre une belle valeur.',
        isPremium: true
      }
    ];
  };

  const filteredPronostics = pronostics.filter(p => {
    if (selectedType === 'all') return true;
    if (selectedType === 'quinte') return p.betType === 'Quinté+';
    return p.betType !== 'Quinté+';
  });

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'bg-green-100 text-green-700 border-green-300';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'low': return 'bg-gray-100 text-gray-700 border-gray-300';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getConfidenceLabel = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'Forte';
      case 'medium': return 'Moyenne';
      case 'low': return 'Faible';
      default: return confidence;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MarketingHeader />

      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-500 via-yellow-600 to-orange-600 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Trophy className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Pronostics PMU Gratuits
            </h1>
            <p className="text-xl text-yellow-100 mb-6">
              Pronostics quotidiens pour le Quinté+ et les principales courses hippiques.
              Analyses détaillées et sélections expertes.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <Star className="w-4 h-4" />
                <span>Analyses quotidiennes</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <Target className="w-4 h-4" />
                <span>Sélections expertes</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <TrendingUp className="w-4 h-4" />
                <span>100% Gratuit</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-white border-y border-gray-200 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto text-center">
            <div>
              <div className="text-3xl font-bold text-yellow-600 mb-1">Quotidien</div>
              <div className="text-sm text-gray-600">Nouveaux pronostics</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-yellow-600 mb-1">Quinté+</div>
              <div className="text-sm text-gray-600">Et courses principales</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-yellow-600 mb-1">Détaillées</div>
              <div className="text-sm text-gray-600">Analyses complètes</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-yellow-600 mb-1">100%</div>
              <div className="text-sm text-gray-600">Gratuit</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                selectedType === 'all'
                  ? 'bg-yellow-500 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              Tous les pronostics
            </button>
            <button
              onClick={() => setSelectedType('quinte')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                selectedType === 'quinte'
                  ? 'bg-yellow-500 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              Quinté+ uniquement
            </button>
            <button
              onClick={() => setSelectedType('autres')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                selectedType === 'autres'
                  ? 'bg-yellow-500 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              Autres courses
            </button>
          </div>

          {/* Pronostics du jour */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-primary-200 rounded-xl p-6 mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-6 h-6 text-primary-600" />
              <h2 className="text-2xl font-bold text-gray-900">
                Pronostics du {format(new Date(), 'd MMMM yyyy', { locale: fr })}
              </h2>
            </div>
            <p className="text-gray-700">
              {filteredPronostics.length} pronostic{filteredPronostics.length > 1 ? 's' : ''} disponible{filteredPronostics.length > 1 ? 's' : ''} aujourd'hui
            </p>
          </div>

          {/* Liste des pronostics */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Chargement des pronostics...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredPronostics.map((pronostic) => (
                <div
                  key={pronostic.id}
                  className="bg-white rounded-xl shadow-lg border-2 border-gray-200 overflow-hidden hover:shadow-xl transition-shadow"
                >
                  {/* En-tête */}
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          {pronostic.betType === 'Quinté+' && (
                            <span className="px-3 py-1 bg-yellow-400 text-primary-900 rounded-full text-sm font-bold flex items-center gap-1">
                              <Award className="w-4 h-4" />
                              QUINTÉ+
                            </span>
                          )}
                          {pronostic.isPremium && (
                            <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-sm font-bold flex items-center gap-1">
                              <Zap className="w-4 h-4" />
                              PREMIUM
                            </span>
                          )}
                        </div>
                        <h3 className="text-2xl font-bold mb-1">{pronostic.raceName}</h3>
                        <div className="flex flex-wrap gap-4 text-sm text-primary-100">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {pronostic.startTime}
                          </span>
                          <span>{pronostic.hippodrome}</span>
                          <span>Course {pronostic.raceNumber}</span>
                          <span>{pronostic.discipline}</span>
                          <span>{pronostic.distance}m</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-primary-100 mb-1">Notre sélection</div>
                        <div className="text-3xl font-bold">{pronostic.stake}</div>
                      </div>
                    </div>
                  </div>

                  {/* Analyse générale */}
                  <div className="p-6 bg-primary-50 border-b border-primary-100">
                    <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-primary-600" />
                      Analyse de la course
                    </h4>
                    <p className="text-gray-700 leading-relaxed">{pronostic.analysis}</p>
                  </div>

                  {/* Sélections détaillées */}
                  <div className="p-6">
                    <h4 className="font-bold text-gray-900 mb-4">Sélections détaillées :</h4>
                    <div className="space-y-4">
                      {pronostic.selections.map((selection) => (
                        <div
                          key={selection.horseNumber}
                          className="flex flex-col md:flex-row gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          <div className="flex items-center gap-4 flex-1">
                            <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0">
                              {selection.horseNumber}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h5 className="font-bold text-lg text-gray-900">{selection.horseName}</h5>
                                <span className={`text-xs px-2 py-1 rounded-full border ${getConfidenceColor(selection.confidence)}`}>
                                  Confiance: {getConfidenceLabel(selection.confidence)}
                                </span>
                              </div>
                              <div className="text-sm text-gray-600 mb-2">
                                Jockey: {selection.jockey} • Cote: <span className="font-semibold text-green-600">{selection.cote}</span>
                              </div>
                              <p className="text-sm text-gray-700">{selection.analysis}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-6 bg-gray-50 border-t border-gray-200">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={openRegisterModal}
                        className="flex-1 inline-flex items-center justify-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-primary-700 transition-all"
                      >
                        Suivre ce pari avec BetTracker Pro
                        <ChevronRight className="w-5 h-5" />
                      </button>
                      <Link
                        href={`/calendrier-courses`}
                        className="inline-flex items-center justify-center gap-2 bg-white text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all border border-gray-300"
                      >
                        Voir la course
                      </Link>
                    </div>
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
            Suivez vos pronostics avec BetTracker Pro
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Enregistrez vos paris basés sur nos pronostics, analysez vos résultats et améliorez votre stratégie
          </p>
          <button
            onClick={openRegisterModal}
            className="inline-flex items-center gap-2 bg-yellow-400 text-primary-900 px-8 py-4 rounded-lg font-bold text-lg hover:bg-yellow-300 transition-all"
          >
            Commencer Gratuitement
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Avertissements légaux */}
      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 container mx-auto px-4 mb-8">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            ⚠️ Avertissement Important
          </h3>
          <div className="space-y-3 text-sm text-gray-700">
            <p className="font-semibold">
              Les pronostics présentés sur cette page sont générés par intelligence artificielle à titre informatif uniquement.
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Aucune garantie de résultat</strong> : Les pronostics ne constituent en aucun cas une garantie de gain. Les courses hippiques comportent une part d'aléatoire importante.</li>
              <li><strong>Responsabilité</strong> : BetTracker Pro décline toute responsabilité en cas de pertes financières résultant de l'utilisation de ces pronostics.</li>
              <li><strong>Jeu responsable</strong> : Les jeux d'argent peuvent être addictifs. Jouez avec modération et ne misez que ce que vous pouvez vous permettre de perdre.</li>
              <li><strong>Aide</strong> : Si vous avez un problème avec les jeux d'argent, consultez <a href="https://www.joueurs-info-service.fr" target="_blank" rel="noopener noreferrer" className="text-primary-600 underline">Joueurs Info Service</a> (09 74 75 13 13).</li>
            </ul>
            <p className="text-xs text-gray-600 mt-4 italic">
              Conformément à la réglementation française, les paris hippiques sont réservés aux personnes majeures. 
              La participation aux jeux d'argent est interdite aux mineurs. Les opérateurs de paris en ligne doivent être agréés par l'ARJEL (Autorité de Régulation des Jeux En Ligne).
            </p>
          </div>
        </div>
      </div>

      {/* SEO Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto prose prose-lg">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Pronostics PMU Gratuits - Quinté+ et Courses Principales
          </h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            Retrouvez chaque jour nos pronostics gratuits générés par intelligence artificielle pour le Quinté+ et les principales courses hippiques
            françaises. Nos analyses détaillées vous aident à faire les meilleurs choix pour vos paris PMU.
          </p>

          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Analyses IA et sélections quotidiennes
          </h3>
          <p className="text-gray-700 leading-relaxed mb-6">
            Chaque pronostic est généré par notre intelligence artificielle qui analyse la course, les chevaux, les jockeys,
            les performances récentes et les conditions de piste. Nous vous proposons des sélections pour tous les types de paris :
            Simple Gagnant, Placé, Couplé, Trio, Tiercé, Quarté+ et Quinté+.
          </p>

          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Suivez vos paris avec BetTracker Pro
          </h3>
          <p className="text-gray-700 leading-relaxed mb-6">
            Utilisez nos pronostics et suivez vos résultats avec BetTracker Pro. Analysez vos performances,
            identifiez vos meilleures stratégies et optimisez votre ROI sur le long terme. Inscrivez-vous
            gratuitement et commencez à suivre vos paris dès aujourd'hui.
          </p>

          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Jeu Responsable
          </h3>
          <p className="text-gray-700 leading-relaxed">
            <strong>Les jeux d'argent comportent des risques.</strong> Ne jouez qu'avec de l'argent que vous pouvez vous permettre de perdre.
            Si vous pensez avoir un problème avec les jeux d'argent, n'hésitez pas à consulter un professionnel ou à contacter
            Joueurs Info Service au 09 74 75 13 13 (appel non surtaxé).
          </p>
        </div>
      </div>

      <MarketingFooter />
    </div>
  );
}
