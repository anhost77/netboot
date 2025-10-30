'use client';

import { Metadata } from 'next';
import Link from 'next/link';
import { useState } from 'react';
import {
  TrendingUp, Target, BarChart3, Wallet, Bell, Shield,
  Zap, Users, Clock, Trophy, ChevronRight, Star,
  Calendar, Newspaper, LineChart, Map, BookOpen,
  CheckCircle2, Lock, History, RefreshCw, Database,
  Eye, TrendingDown, DollarSign, Filter, BarChart,
  PieChart, Activity, Award, Settings, Smartphone,
  PlayCircle, CheckCheck, ArrowRight, Sparkles
} from 'lucide-react';
import MarketingHeader from '@/components/marketing/MarketingHeader';
import MarketingFooter from '@/components/marketing/MarketingFooter';

const categories = [
  {
    id: 'debutant',
    label: 'Pour Débuter',
    icon: PlayCircle,
    color: 'green',
    description: 'Tout ce dont vous avez besoin pour commencer à parier intelligemment',
    features: [
      {
        icon: Eye,
        title: 'Mode Simulation',
        subtitle: 'Apprenez sans risque',
        description: 'Commencez par le mode simulation pour vous entraîner avec de l\'argent virtuel. Testez vos stratégies, comprenez les différents types de paris et gagnez en confiance avant de parier en réel.',
        benefit: 'Parfait pour apprendre les bases sans risquer votre argent'
      },
      {
        icon: BookOpen,
        title: 'Interface Simple et Guidée',
        subtitle: 'Facile à utiliser',
        description: 'Suivez un workflow étape par étape : choisissez votre plateforme (PMU, Betclic...), l\'hippodrome, la course, le type de pari et vos chevaux. Tout est expliqué clairement.',
        benefit: 'Pas besoin d\'être expert, on vous guide à chaque étape'
      },
      {
        icon: Target,
        title: '20+ Types de Paris Expliqués',
        subtitle: 'Quinté+, Tiercé, Quarté...',
        description: 'Découvrez tous les types de paris PMU avec des explications claires : Super 4, Trio Bonus, Quarté+ Bonus, Multi, 2sur4... Comprenez les règles et les gains potentiels de chacun.',
        benefit: 'Apprenez progressivement chaque type de pari'
      },
      {
        icon: Calendar,
        title: 'Calendrier des Courses',
        subtitle: 'Programme quotidien',
        description: 'Consultez le programme des courses du jour sur tous les hippodromes français. Trouvez facilement les courses qui vous intéressent avec toutes les informations essentielles.',
        benefit: 'Ne manquez plus jamais une course importante'
      }
    ]
  },
  {
    id: 'gestion',
    label: 'Gestion de Paris',
    icon: Target,
    color: 'primary',
    description: 'Gérez tous vos paris hippiques au même endroit',
    features: [
      {
        icon: Database,
        title: 'Tous vos Paris Centralisés',
        subtitle: 'Un seul endroit pour tout',
        description: 'Enregistrez tous vos paris, qu\'ils soient sur PMU.fr, Betclic, Unibet ou autres plateformes. Suivez l\'ensemble de votre activité de pari en un seul endroit.',
        benefit: 'Plus besoin de jongler entre plusieurs sites'
      },
      {
        icon: Map,
        title: 'Tous les Hippodromes',
        subtitle: 'Vincennes, Longchamp, Deauville...',
        description: 'Pariez sur tous les hippodromes de France : Vincennes, Longchamp, Chantilly, Deauville, Enghien, Auteuil, Cagnes-sur-Mer... Accédez aux courses de plat, trot et obstacles.',
        benefit: 'Suivez vos paris sur tous les hippodromes'
      },
      {
        icon: CheckCircle2,
        title: 'Validation Automatique des Gains',
        subtitle: 'Calcul instantané',
        description: 'Entrez vos sélections et le système calcule automatiquement vos gains selon le type de pari et l\'ordre d\'arrivée. Gestion intelligente des paris ordre et désordre.',
        benefit: 'Sachez immédiatement combien vous avez gagné'
      },
      {
        icon: History,
        title: 'Historique Complet',
        subtitle: 'Tous vos paris archivés',
        description: 'Retrouvez tous vos paris passés avec détails complets : date, hippodrome, course, type de pari, mise, résultat et gain. Filtrez par période, hippodrome ou résultat.',
        benefit: 'Apprenez de votre historique pour vous améliorer'
      },
      {
        icon: Filter,
        title: 'Filtres Avancés',
        subtitle: 'Trouvez ce que vous cherchez',
        description: 'Filtrez vos paris par date, hippodrome, type de pari, résultat (gagné/perdu), mode (réel/simulation)... Analysez rapidement ce qui fonctionne pour vous.',
        benefit: 'Identifiez vos points forts et faibles'
      },
      {
        icon: Star,
        title: 'Notes et Favoris',
        subtitle: 'Gardez une trace',
        description: 'Ajoutez des notes à vos paris pour vous rappeler de votre raisonnement. Marquez vos meilleurs coups en favoris pour les retrouver facilement.',
        benefit: 'Construisez votre propre base de connaissances'
      }
    ]
  },
  {
    id: 'statistiques',
    label: 'Statistiques',
    icon: BarChart3,
    color: 'blue',
    description: 'Analysez vos performances et optimisez votre stratégie',
    features: [
      {
        icon: TrendingUp,
        title: 'ROI en Temps Réel',
        subtitle: 'Retour sur investissement',
        description: 'Suivez votre retour sur investissement en temps réel. Visualisez l\'évolution de votre ROI avec des graphiques clairs. Comprenez si votre stratégie est rentable.',
        benefit: 'Mesurez objectivement votre rentabilité'
      },
      {
        icon: PieChart,
        title: 'Performance par Type de Pari',
        subtitle: 'Où êtes-vous le meilleur ?',
        description: 'Découvrez sur quels types de paris vous performez le mieux : Quinté+, Tiercé, Quarté, Multi... Identifiez vos forces et concentrez-vous dessus.',
        benefit: 'Jouez sur vos points forts'
      },
      {
        icon: Map,
        title: 'Statistiques par Hippodrome',
        subtitle: 'Vos hippodromes gagnants',
        description: 'Analysez vos résultats par hippodrome. Peut-être êtes-vous meilleur à Vincennes qu\'à Longchamp ? Découvrez où vous devriez concentrer vos paris.',
        benefit: 'Pariez là où vous gagnez le plus'
      },
      {
        icon: Activity,
        title: 'Graphiques d\'Évolution',
        subtitle: 'Visualisez votre progression',
        description: 'Des graphiques interactifs vous montrent l\'évolution de votre bankroll, votre taux de réussite et vos gains au fil du temps. Suivez votre progression.',
        benefit: 'Voyez votre amélioration au fil du temps'
      },
      {
        icon: BarChart,
        title: 'Rapports Détaillés',
        subtitle: 'Tous vos KPIs',
        description: 'Accédez à des rapports complets avec tous les indicateurs : nombre de paris, mise totale, gains, pertes, taux de réussite, meilleur gain, pire perte...',
        benefit: 'Comprenez précisément vos performances'
      },
      {
        icon: Award,
        title: 'Statistiques Publiques',
        subtitle: 'Partagez vos succès',
        description: 'Si vous partagez vos pronostics, suivez vos performances publiques en tant que tipster. Construisez votre réputation avec des stats vérifiées.',
        benefit: 'Devenez un tipster reconnu'
      }
    ]
  },
  {
    id: 'finance',
    label: 'Gestion Financière',
    icon: Wallet,
    color: 'yellow',
    description: 'Gérez votre capital et évitez les pertes',
    features: [
      {
        icon: DollarSign,
        title: 'Suivi de Bankroll',
        subtitle: 'Gérez votre capital',
        description: 'Définissez votre bankroll de départ et suivez son évolution en temps réel. Visualisez combien vous avez gagné ou perdu depuis le début.',
        benefit: 'Gardez le contrôle de votre budget'
      },
      {
        icon: TrendingDown,
        title: 'Alertes de Sécurité',
        subtitle: 'Protégez votre capital',
        description: 'Recevez des alertes quand votre bankroll descend sous certains seuils. Le système vous prévient pour éviter de tout perdre.',
        benefit: 'Évitez la ruine grâce aux alertes'
      },
      {
        icon: PieChart,
        title: 'Répartition des Mises',
        subtitle: 'Où va votre argent ?',
        description: 'Analysez comment vous répartissez vos mises : par type de pari, par hippodrome, par montant. Identifiez si vous misez trop sur certains paris.',
        benefit: 'Optimisez la répartition de vos mises'
      },
      {
        icon: Trophy,
        title: 'Objectifs de Gains',
        subtitle: 'Fixez vos cibles',
        description: 'Définissez des objectifs de gains mensuels ou annuels. Suivez votre progression vers ces objectifs avec des indicateurs visuels.',
        benefit: 'Restez motivé avec des objectifs clairs'
      },
      {
        icon: Shield,
        title: 'Gestion du Risque',
        subtitle: 'Pariez intelligemment',
        description: 'Le système vous aide à ne pas miser plus que recommandé par rapport à votre bankroll. Suggestions de mises adaptées à votre capital.',
        benefit: 'Pariez de manière responsable'
      },
      {
        icon: LineChart,
        title: 'Projections',
        subtitle: 'Anticipez l\'avenir',
        description: 'Sur la base de vos performances passées, visualisez des projections de gains futurs. Comprenez où vous pourriez être dans 3, 6 ou 12 mois.',
        benefit: 'Planifiez votre stratégie à long terme'
      }
    ]
  },
  {
    id: 'avance',
    label: 'Fonctionnalités Avancées',
    icon: Zap,
    color: 'purple',
    description: 'Pour aller plus loin dans l\'analyse',
    features: [
      {
        icon: RefreshCw,
        title: 'Modes Réel et Simulation Séparés',
        subtitle: 'Deux univers distincts',
        description: 'Basculez entre mode réel (argent réel) et simulation (argent virtuel). Toutes vos statistiques sont calculées séparément pour ne pas mélanger les deux.',
        benefit: 'Testez sans impacter vos vraies stats'
      },
      {
        icon: Zap,
        title: 'Intégration PMU Temps Réel',
        subtitle: 'Données officielles',
        description: 'Récupération automatique des cotes et résultats depuis les rapports PMU officiels. Validation automatique de vos gains avec les vraies cotes.',
        benefit: 'Données fiables et à jour'
      },
      {
        icon: Bell,
        title: 'Notifications Intelligentes',
        subtitle: 'Restez informé',
        description: 'Recevez des notifications pour les résultats de vos paris, les courses importantes, vos objectifs atteints... Personnalisez complètement vos préférences.',
        benefit: 'Ne manquez aucune information importante'
      },
      {
        icon: Users,
        title: 'Suivi Multi-Tipsters',
        subtitle: 'Suivez les experts',
        description: 'Suivez les pronostics d\'autres tipsters et comparez vos performances. Apprenez des meilleurs et améliorez votre stratégie.',
        benefit: 'Apprenez des meilleurs parieurs'
      },
      {
        icon: Lock,
        title: 'Sécurité Maximum',
        subtitle: 'Vos données protégées',
        description: 'Toutes vos données sont cryptées et sécurisées. Conformité RGPD complète. Vos paris et statistiques restent privés sauf si vous choisissez de les partager.',
        benefit: 'Pariez en toute confidentialité'
      },
      {
        icon: Smartphone,
        title: 'Application Mobile',
        subtitle: 'Pariez partout',
        description: 'Interface responsive parfaitement adaptée aux smartphones et tablettes. Enregistrez vos paris directement depuis l\'hippodrome.',
        benefit: 'Gérez vos paris où que vous soyez'
      }
    ]
  }
];

export default function FonctionnalitesPage() {
  const [activeTab, setActiveTab] = useState('debutant');
  const activeCategory = categories.find(cat => cat.id === activeTab) || categories[0];
  const CategoryIcon = activeCategory.icon;

  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white py-16">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-white/20">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span className="text-sm font-medium">Plateforme Complète et Facile à Utiliser</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Tout pour Réussir vos <span className="text-yellow-300">Paris Hippiques</span>
            </h1>

            <p className="text-lg md:text-xl mb-8 text-primary-100 max-w-3xl mx-auto">
              Des outils simples et puissants pour suivre, analyser et améliorer vos performances. Que vous soyez débutant ou expert.
            </p>

            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 bg-yellow-400 text-primary-900 px-8 py-4 rounded-lg font-bold text-lg hover:bg-yellow-300 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
            >
              Commencer Gratuitement
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Vague décorative */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Tabs Navigation */}
      <section className="sticky top-16 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto scrollbar-hide">
            {categories.map((category) => {
              const Icon = category.icon;
              const isActive = activeTab === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveTab(category.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-semibold text-sm whitespace-nowrap transition-all border-b-2 ${
                    isActive
                      ? 'border-primary-600 text-primary-600 bg-primary-50'
                      : 'border-transparent text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {category.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tab Content */}
      <section className="py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          {/* Category Header */}
          <div className="max-w-3xl mx-auto text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-2xl mb-4">
              <CategoryIcon className="w-8 h-8 text-primary-600" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {activeCategory.label}
            </h2>
            <p className="text-xl text-gray-600">
              {activeCategory.description}
            </p>
          </div>

          {/* Features Grid */}
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
            {activeCategory.features.map((feature, idx) => {
              const FeatureIcon = feature.icon;
              return (
                <div
                  key={idx}
                  className="group bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-primary-200"
                >
                  {/* Icon & Title */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="flex-shrink-0">
                      <div className="w-14 h-14 bg-primary-50 rounded-xl flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                        <FeatureIcon className="w-7 h-7 text-primary-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-sm font-medium text-primary-600">
                        {feature.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 leading-relaxed mb-4">
                    {feature.description}
                  </p>

                  {/* Benefit Badge */}
                  <div className="flex items-start gap-2 bg-green-50 border border-green-200 rounded-lg p-3">
                    <CheckCheck className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-green-800 font-medium">
                      {feature.benefit}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Quick Access Section */}
      <section className="py-16 bg-white border-y border-gray-200">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              Accès Rapide
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Link
                href="/calendrier-courses"
                className="group bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 hover:shadow-lg transition-all border border-blue-200"
              >
                <Calendar className="w-10 h-10 text-blue-600 mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">Calendrier des Courses</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Programme quotidien de toutes les courses PMU
                </p>
                <div className="flex items-center text-blue-600 font-semibold text-sm group-hover:gap-2 transition-all">
                  Voir le programme
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              <Link
                href="/pronostics"
                className="group bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 hover:shadow-lg transition-all border border-green-200"
              >
                <Target className="w-10 h-10 text-green-600 mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">Pronostics Gratuits</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Nos sélections quotidiennes pour le Quinté+
                </p>
                <div className="flex items-center text-green-600 font-semibold text-sm group-hover:gap-2 transition-all">
                  Voir les pronostics
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              <Link
                href="/blog"
                className="group bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 hover:shadow-lg transition-all border border-purple-200"
              >
                <BookOpen className="w-10 h-10 text-purple-600 mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">Blog & Guides</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Conseils, stratégies et guides pour progresser
                </p>
                <div className="flex items-center text-purple-600 font-semibold text-sm group-hover:gap-2 transition-all">
                  Lire le blog
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary-600 to-primary-900 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Prêt à Améliorer vos Performances ?
            </h2>
            <p className="text-xl mb-8 text-primary-100">
              Rejoignez BetTracker Pro gratuitement et commencez à optimiser vos paris hippiques dès aujourd'hui.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 bg-yellow-400 text-primary-900 px-8 py-4 rounded-lg font-bold text-lg hover:bg-yellow-300 transition-all shadow-xl"
              >
                Créer un Compte Gratuit
                <ChevronRight className="w-5 h-5" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white/20 transition-all border-2 border-white/30"
              >
                J'ai déjà un compte
              </Link>
            </div>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
