'use client';

import Link from 'next/link';
import { Map, MapPin, TrendingUp, Trophy, Info, ChevronRight, Search } from 'lucide-react';
import { useState } from 'react';

interface Hippodrome {
  id: string;
  code: string;
  name: string;
  fullName: string;
  region: string;
  disciplines: string[];
  description: string;
  characteristics: string[];
  popularRaces: string[];
}

const hippodromes: Hippodrome[] = [
  {
    id: '1',
    code: 'VIN',
    name: 'VINCENNES',
    fullName: 'Hippodrome de Vincennes',
    region: 'Île-de-France',
    disciplines: ['Trot'],
    description: 'Le temple du trot français, situé dans le bois de Vincennes à Paris. Accueille les plus grandes courses de trot attelé et monté.',
    characteristics: [
      'Piste: 1 882 mètres (corde à droite)',
      'Surface: Cendrée',
      'Configuration: Ovale avec deux lignes droites',
      'Particularité: Virage relevé unique en France'
    ],
    popularRaces: ['Prix d\'Amérique', 'Prix de France', 'Prix de Paris']
  },
  {
    id: '2',
    code: 'LON',
    name: 'LONGCHAMP',
    fullName: 'Hippodrome ParisLongchamp',
    region: 'Île-de-France',
    disciplines: ['Plat'],
    description: 'Le plus prestigieux hippodrome de plat en France, entièrement rénové en 2018. Accueille les plus grands champions du galop mondial.',
    characteristics: [
      'Grande piste: 2 750 mètres (corde à droite)',
      'Petite piste: 2 100 mètres',
      'Surface: Gazon',
      'Particularité: Ligne droite de 1000m, fausse ligne droite'
    ],
    popularRaces: ['Prix de l\'Arc de Triomphe', 'Prix du Jockey Club', 'Grand Prix de Paris']
  },
  {
    id: '3',
    code: 'CHA',
    name: 'CHANTILLY',
    fullName: 'Hippodrome de Chantilly',
    region: 'Hauts-de-France',
    disciplines: ['Plat', 'Obstacle'],
    description: 'Surnommé le "plus bel hippodrome de France", situé au cœur de la forêt de Chantilly. Lieu de formation de nombreux champions.',
    characteristics: [
      'Piste: 2 300 mètres (corde à droite)',
      'Surface: Gazon',
      'Configuration: Ovale régulier',
      'Particularité: Cadre exceptionnel, piste souple'
    ],
    popularRaces: ['Prix du Jockey Club', 'Prix de Diane', 'Prix Jean-Luc Lagardère']
  },
  {
    id: '4',
    code: 'DEA',
    name: 'DEAUVILLE',
    fullName: 'Hippodrome de Deauville - La Touques',
    region: 'Normandie',
    disciplines: ['Plat', 'Obstacle'],
    description: 'L\'hippodrome chic de la côte normande, accueillant le fameux meeting d\'août. Réputé pour son ambiance élégante et festive.',
    characteristics: [
      'Piste: 1 800 mètres (corde à droite)',
      'Surface: Gazon',
      'Configuration: Piste tournante serrée',
      'Particularité: Ligne droite courte, favorise les chevaux agiles'
    ],
    popularRaces: ['Prix Jacques le Marois', 'Prix Morny', 'Prix Guillaume d\'Ornano']
  },
  {
    id: '5',
    code: 'ENG',
    name: 'ENGHIEN',
    fullName: 'Hippodrome d\'Enghien-Soisy',
    region: 'Île-de-France',
    disciplines: ['Trot'],
    description: 'Hippodrome de trot proche de Paris, réputé pour ses courses nocturnes et son ambiance conviviale. Le 2ème hippodrome de trot français.',
    characteristics: [
      'Piste: 1 309 mètres (corde à gauche)',
      'Surface: Cendrée',
      'Configuration: Ovale court',
      'Particularité: Courses nocturnes, piste rapide'
    ],
    popularRaces: ['Prix de Sélection', 'Prix René Ballière', 'Prix Jules Thibault']
  },
  {
    id: '6',
    code: 'COM',
    name: 'COMPIEGNE',
    fullName: 'Hippodrome de Compiègne',
    region: 'Hauts-de-France',
    disciplines: ['Plat', 'Obstacle'],
    description: 'Hippodrome situé en forêt de Compiègne, connu pour ses pistes souples et ses courses d\'obstacles de qualité.',
    characteristics: [
      'Piste plat: 1 900 mètres (corde à droite)',
      'Piste obstacle: 2 400 mètres',
      'Surface: Gazon',
      'Particularité: Terrain souvent souple, favorise les stayers'
    ],
    popularRaces: ['Grand Steeple-Chase de Compiègne', 'Prix Gontaut-Biron']
  },
  {
    id: '7',
    code: 'CAG',
    name: 'CAGNES SUR MER',
    fullName: 'Hippodrome de la Côte d\'Azur',
    region: 'Provence-Alpes-Côte d\'Azur',
    disciplines: ['Plat', 'Trot', 'Obstacle'],
    description: 'L\'hippodrome azuréen accueillant le fameux meeting d\'hiver. Seul hippodrome omnisports de haut niveau en France.',
    characteristics: [
      'Piste plat: 1 500 mètres (corde à gauche)',
      'Piste trot: 1 100 mètres',
      'Surface: Gazon/Sable fibré (trot)',
      'Particularité: Climat clément, meeting d\'hiver prestigieux'
    ],
    popularRaces: ['Prix de la Côte d\'Azur', 'Prix de Marseille', 'Prix Cor de Chasse']
  },
  {
    id: '8',
    code: 'AUT',
    name: 'AUTEUIL',
    fullName: 'Hippodrome d\'Auteuil',
    region: 'Île-de-France',
    disciplines: ['Obstacle'],
    description: 'Le temple de l\'obstacle en France, situé dans le bois de Boulogne. Accueille les plus grandes courses de steeple-chase et haies.',
    characteristics: [
      'Piste: 2 700 mètres (corde à droite)',
      'Surface: Gazon',
      'Configuration: Relief vallonné, nombreux obstacles',
      'Particularité: 23 obstacles permanents dont la célèbre Rivière des Tribunes'
    ],
    popularRaces: ['Grand Steeple-Chase de Paris', 'Prix La Haye Jousselin', 'Grande Course de Haies d\'Auteuil']
  }
];

export default function HippodromesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDiscipline, setSelectedDiscipline] = useState('all');

  const disciplines = ['all', 'Plat', 'Trot', 'Obstacle'];

  const filteredHippodromes = hippodromes.filter(hippo => {
    const matchesSearch = hippo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hippo.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hippo.region.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDiscipline = selectedDiscipline === 'all' || hippo.disciplines.includes(selectedDiscipline);
    return matchesSearch && matchesDiscipline;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Map className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Guide des Hippodromes Français
            </h1>
            <p className="text-xl text-purple-100 mb-6">
              Découvrez les caractéristiques, particularités et courses phares de chaque hippodrome.
              Adaptez votre stratégie en fonction du terrain.
            </p>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            {/* Recherche */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher un hippodrome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Disciplines */}
            <div className="flex flex-wrap gap-2">
              {disciplines.map(disc => (
                <button
                  key={disc}
                  onClick={() => setSelectedDiscipline(disc)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    selectedDiscipline === disc
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {disc === 'all' ? 'Toutes disciplines' : disc}
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-purple-600 mb-1">{hippodromes.length}</div>
                <div className="text-sm text-gray-600">Hippodromes</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600 mb-1">250+</div>
                <div className="text-sm text-gray-600">Courses/an</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600 mb-1">3</div>
                <div className="text-sm text-gray-600">Disciplines</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600 mb-1">12</div>
                <div className="text-sm text-gray-600">Régions</div>
              </div>
            </div>
          </div>

          {/* Liste des hippodromes */}
          <div className="grid md:grid-cols-2 gap-6">
            {filteredHippodromes.map(hippo => (
              <div
                key={hippo.id}
                className="bg-white rounded-xl shadow-lg border-2 border-gray-200 overflow-hidden hover:shadow-xl hover:border-purple-300 transition-all"
              >
                {/* En-tête */}
                <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-2xl font-bold mb-1">{hippo.name}</h3>
                      <p className="text-purple-100">{hippo.fullName}</p>
                    </div>
                    <MapPin className="w-8 h-8 flex-shrink-0" />
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                      {hippo.region}
                    </span>
                    {hippo.disciplines.map(disc => (
                      <span key={disc} className="px-3 py-1 bg-yellow-400 text-purple-900 rounded-full text-sm font-semibold">
                        {disc}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Contenu */}
                <div className="p-6">
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    {hippo.description}
                  </p>

                  {/* Caractéristiques */}
                  <div className="mb-6">
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Info className="w-5 h-5 text-purple-600" />
                      Caractéristiques
                    </h4>
                    <ul className="space-y-2">
                      {hippo.characteristics.map((char, idx) => (
                        <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                          <ChevronRight className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
                          <span>{char}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Courses populaires */}
                  <div className="mb-6">
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-yellow-500" />
                      Courses principales
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {hippo.popularRaces.map((race, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium border border-purple-200"
                        >
                          {race}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <Link
                      href={`/calendrier-courses?hippodrome=${hippo.code}`}
                      className="flex-1 inline-flex items-center justify-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-all text-sm"
                    >
                      Voir les courses
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                    <Link
                      href={`/pronostics?hippodrome=${hippo.code}`}
                      className="inline-flex items-center justify-center gap-2 bg-yellow-400 text-purple-900 px-4 py-2 rounded-lg font-semibold hover:bg-yellow-300 transition-all text-sm"
                    >
                      Pronostics
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16 mt-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Suivez vos performances par hippodrome
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            BetTracker Pro vous permet d'analyser vos résultats hippodrome par hippodrome pour identifier vos terrains favoris
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-yellow-400 text-blue-900 px-8 py-4 rounded-lg font-bold text-lg hover:bg-yellow-300 transition-all"
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
            Les Hippodromes Français : Guide Complet
          </h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            La France compte plus de 240 hippodromes répartis sur tout le territoire. Chacun possède ses propres
            caractéristiques qui influencent le déroulement des courses et les performances des chevaux.
            Connaître les spécificités de chaque hippodrome est essentiel pour affiner vos pronostics.
          </p>

          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Pourquoi connaître les hippodromes ?
          </h3>
          <p className="text-gray-700 leading-relaxed mb-6">
            Certains chevaux excellent sur des pistes à gauche, d'autres préfèrent les grandes lignes droites.
            Le revêtement (gazon, cendrée, sable fibré), la configuration de la piste, et même le climat local
            jouent un rôle déterminant. Nos fiches détaillées vous donnent toutes les clés pour comprendre
            chaque hippodrome et adapter votre stratégie de paris en conséquence.
          </p>

          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Analysez vos performances avec BetTracker Pro
          </h3>
          <p className="text-gray-700 leading-relaxed">
            Avec BetTracker Pro, découvrez vos statistiques détaillées par hippodrome. Identifiez sur quels
            terrains vous êtes le plus performant et ajustez votre stratégie. Les données sont votre meilleur
            allié pour devenir un parieur gagnant sur le long terme.
          </p>
        </div>
      </div>
    </div>
  );
}
