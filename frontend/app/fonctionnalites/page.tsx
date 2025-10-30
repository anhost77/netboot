import { Metadata } from 'next';
import Link from 'next/link';
import {
  TrendingUp, Target, BarChart3, Wallet, Bell, Shield,
  Zap, Users, Clock, Trophy, ChevronRight, Star,
  Calendar, Newspaper, LineChart, Map, BookOpen,
  CheckCircle2, Lock, History, RefreshCw, Database,
  Eye, TrendingDown, DollarSign, Filter, BarChart,
  PieChart, Activity, Award, Settings, Smartphone
} from 'lucide-react';
import MarketingHeader from '@/components/marketing/MarketingHeader';
import MarketingFooter from '@/components/marketing/MarketingFooter';

export const metadata: Metadata = {
  title: 'Fonctionnalités - Toutes les outils pour gagner aux paris hippiques PMU',
  description: 'Découvrez toutes les fonctionnalités de BetTracker Pro : gestion de paris, 20+ types de paris PMU, mode simulation, statistiques avancées, intégration temps réel et bien plus.',
  keywords: ['fonctionnalités bettracker', 'outils paris hippiques', 'gestion paris pmu', 'statistiques turf', 'mode simulation', 'analyse paris', 'roi pmu', 'bankroll management'],
  openGraph: {
    title: 'Fonctionnalités BetTracker Pro - Outils Complets Paris Hippiques',
    description: 'Gestion de paris, statistiques avancées, mode simulation et intégration PMU temps réel',
    type: 'website',
    url: 'https://bettracker.io/fonctionnalites',
  }
};

const features = [
  {
    category: 'Gestion de Paris',
    icon: Target,
    color: 'primary',
    items: [
      {
        icon: CheckCircle2,
        title: '20+ Types de Paris PMU',
        description: 'Super 4, Trio Bonus, Quarté+ Bonus, Quinté+, Tiercé, 2sur4, Multi, Pick 5, et bien plus. Support complet de tous les types de paris PMU.'
      },
      {
        icon: Map,
        title: 'Tous les Hippodromes Français',
        description: 'Vincennes, Longchamp, Chantilly, Deauville, Enghien, Auteuil... Suivez vos paris sur tous les hippodromes de France.'
      },
      {
        icon: Database,
        title: 'Workflow Complet',
        description: 'Sélectionnez la plateforme (PMU, Betclic, Unibet...), l\'hippodrome, la course, le type de pari et vos chevaux en quelques clics.'
      },
      {
        icon: DollarSign,
        title: 'Calcul Automatique des Gains',
        description: 'Validation automatique des gains selon le type de pari (ordre exact pour Super 4, ordre ou désordre pour Tiercé, etc.).'
      }
    ]
  },
  {
    category: 'Modes de Fonctionnement',
    icon: RefreshCw,
    color: 'green',
    items: [
      {
        icon: Eye,
        title: 'Mode Simulation',
        description: 'Testez vos stratégies sans risque ! Pariez avec de l\'argent virtuel pour apprendre et affiner votre approche.'
      },
      {
        icon: Zap,
        title: 'Mode Réel',
        description: 'Suivez vos vrais paris avec de l\'argent réel. Toutes vos statistiques et performances sont calculées séparément.'
      },
      {
        icon: Filter,
        title: 'Filtrage par Mode',
        description: 'Visualisez vos statistiques, historique et performances en filtrant par mode simulation ou réel. Deux univers parfaitement séparés.'
      },
      {
        icon: Bell,
        title: 'Notifications par Mode',
        description: 'Recevez des notifications contextuelles selon le mode actif. Alertes adaptées à votre pratique.'
      }
    ]
  },
  {
    category: 'Statistiques & Analyses',
    icon: BarChart3,
    color: 'blue',
    items: [
      {
        icon: TrendingUp,
        title: 'ROI en Temps Réel',
        description: 'Suivez votre retour sur investissement en temps réel avec graphiques d\'évolution et tendances.'
      },
      {
        icon: PieChart,
        title: 'Statistiques par Type de Pari',
        description: 'Analysez vos performances par type de pari : Quinté+, Tiercé, Quarté, Multi... Identifiez vos points forts.'
      },
      {
        icon: BarChart,
        title: 'Analyse par Hippodrome',
        description: 'Découvrez sur quels hippodromes vous performez le mieux. Statistiques détaillées par piste.'
      },
      {
        icon: Activity,
        title: 'Évolution des Performances',
        description: 'Graphiques interactifs montrant l\'évolution de votre bankroll, taux de réussite et gains sur le temps.'
      },
      {
        icon: Award,
        title: 'Statistiques Tipsters',
        description: 'Si vous partagez vos pronostics, suivez vos performances en tant que tipster avec stats publiques.'
      },
      {
        icon: LineChart,
        title: 'Rapports Détaillés',
        description: 'Rapports complets avec tous les KPIs : nombre de paris, mise totale, gains, pertes, taux de réussite...'
      }
    ]
  },
  {
    category: 'Intégration PMU',
    icon: Zap,
    color: 'yellow',
    items: [
      {
        icon: Calendar,
        title: 'Détection Automatique des Types',
        description: 'Détection automatique des types de paris disponibles depuis les rapports PMU officiels.'
      },
      {
        icon: TrendingUp,
        title: 'Cotes en Temps Réel',
        description: 'Récupération et calcul automatique des cotes depuis les rapports PMU pour chaque type de pari.'
      },
      {
        icon: CheckCircle2,
        title: 'Validation des Gains',
        description: 'Système intelligent de validation prenant en compte les règles spécifiques à chaque type de pari.'
      },
      {
        icon: Database,
        title: 'Ordre d\'Arrivée',
        description: 'Gestion automatique de l\'ordre d\'arrivée pour les paris ORDRE vs DÉSORDRE (Tiercé ordre, Super 4...).'
      }
    ]
  },
  {
    category: 'Gestion Financière',
    icon: Wallet,
    color: 'green',
    items: [
      {
        icon: DollarSign,
        title: 'Suivi de Bankroll',
        description: 'Gérez votre capital de paris avec précision. Visualisez votre bankroll actuelle, évolution et projections.'
      },
      {
        icon: TrendingDown,
        title: 'Alertes de Perte',
        description: 'Recevez des alertes quand votre bankroll descend sous certains seuils pour éviter la ruine.'
      },
      {
        icon: PieChart,
        title: 'Répartition des Mises',
        description: 'Analysez comment vous répartissez vos mises : par type de pari, par hippodrome, par montant.'
      },
      {
        icon: Trophy,
        title: 'Objectifs de Gains',
        description: 'Définissez et suivez vos objectifs de gains mensuels avec indicateurs de progression.'
      }
    ]
  },
  {
    category: 'Historique & Suivi',
    icon: History,
    color: 'purple',
    items: [
      {
        icon: History,
        title: 'Historique Complet',
        description: 'Accédez à l\'historique complet de tous vos paris avec détails : date, course, mise, résultat, gain.'
      },
      {
        icon: Filter,
        title: 'Filtres Avancés',
        description: 'Filtrez votre historique par date, hippodrome, type de pari, résultat (gagné/perdu), mode...'
      },
      {
        icon: BookOpen,
        title: 'Journal de Paris',
        description: 'Ajoutez des notes à vos paris pour garder une trace de votre raisonnement et apprendre de vos erreurs.'
      },
      {
        icon: Star,
        title: 'Paris Favoris',
        description: 'Marquez vos meilleurs paris en favoris pour y revenir et analyser ce qui a fonctionné.'
      }
    ]
  },
  {
    category: 'Notifications & Alertes',
    icon: Bell,
    color: 'red',
    items: [
      {
        icon: Bell,
        title: 'Notifications Intelligentes',
        description: 'Recevez des notifications pour les résultats de vos paris, gains importants, et alertes personnalisées.'
      },
      {
        icon: Clock,
        title: 'Rappels de Courses',
        description: 'Soyez alerté avant les courses importantes (Quinté+ du jour, vos hippodromes favoris...).'
      },
      {
        icon: TrendingUp,
        title: 'Alertes de Performance',
        description: 'Notifications quand vous atteignez des jalons : ROI positif, 10 paris gagnants, objectif atteint...'
      },
      {
        icon: Settings,
        title: 'Personnalisation Complète',
        description: 'Choisissez exactement quelles notifications vous souhaitez recevoir et à quelle fréquence.'
      }
    ]
  },
  {
    category: 'Sécurité & Confidentialité',
    icon: Shield,
    color: 'green',
    items: [
      {
        icon: Shield,
        title: 'Données Sécurisées',
        description: 'Toutes vos données sont cryptées et stockées de manière sécurisée. Conformité RGPD.'
      },
      {
        icon: Lock,
        title: 'Authentification Sécurisée',
        description: 'Système d\'authentification robuste avec protection contre les accès non autorisés.'
      },
      {
        icon: Eye,
        title: 'Confidentialité Totale',
        description: 'Vos paris et statistiques restent privés. Vous choisissez ce que vous partagez.'
      },
      {
        icon: Database,
        title: 'Sauvegarde Automatique',
        description: 'Vos données sont sauvegardées automatiquement. Aucun risque de perte.'
      }
    ]
  },
  {
    category: 'Interface & Expérience',
    icon: Smartphone,
    color: 'blue',
    items: [
      {
        icon: Smartphone,
        title: 'Responsive Design',
        description: 'Interface adaptée à tous les écrans : smartphone, tablette, ordinateur. Pariez de n\'importe où.'
      },
      {
        icon: Zap,
        title: 'Performance Optimale',
        description: 'Application rapide et fluide. Chargement instantané, pas de latence.'
      },
      {
        icon: Target,
        title: 'Interface Intuitive',
        description: 'Design épuré et ergonomique. Trouvez ce que vous cherchez en quelques clics.'
      },
      {
        icon: BookOpen,
        title: 'Documentation Complète',
        description: 'Guides, tutoriels et FAQ pour vous aider à maîtriser toutes les fonctionnalités.'
      }
    ]
  }
];

export default function FonctionnalitesPage() {
  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white py-20">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-white/20">
              <Star className="w-4 h-4 text-yellow-300" />
              <span className="text-sm font-medium">Plateforme Complète de Gestion de Paris Hippiques</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Toutes les <span className="text-yellow-300">Fonctionnalités</span><br />
              pour Maîtriser vos Paris PMU
            </h1>

            <p className="text-xl md:text-2xl mb-8 text-primary-100 max-w-3xl mx-auto">
              Plus de 50 fonctionnalités conçues pour vous aider à suivre, analyser et optimiser vos paris hippiques.
            </p>

            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 bg-yellow-400 text-primary-900 px-8 py-4 rounded-lg font-bold text-lg hover:bg-yellow-300 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
            >
              Essayer Gratuitement
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

      {/* Quick Stats */}
      <section className="py-12 bg-gray-50 border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">50+</div>
              <div className="text-gray-600">Fonctionnalités</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">20+</div>
              <div className="text-gray-600">Types de Paris PMU</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">2</div>
              <div className="text-gray-600">Modes (Réel/Simu)</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">100%</div>
              <div className="text-gray-600">Sécurisé & Privé</div>
            </div>
          </div>
        </div>
      </section>

      {/* All Features */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="space-y-24">
            {features.map((category, idx) => {
              const IconComponent = category.icon;
              const colorClasses = {
                primary: 'bg-primary-50 text-primary-600',
                green: 'bg-green-50 text-green-600',
                blue: 'bg-blue-50 text-blue-600',
                yellow: 'bg-yellow-50 text-yellow-600',
                purple: 'bg-purple-50 text-purple-600',
                red: 'bg-red-50 text-red-600'
              };

              return (
                <div key={idx} className="relative">
                  {/* Category Header */}
                  <div className="flex items-center gap-4 mb-12">
                    <div className={`p-4 rounded-2xl ${colorClasses[category.color as keyof typeof colorClasses]}`}>
                      <IconComponent className="w-8 h-8" />
                    </div>
                    <div>
                      <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                        {category.category}
                      </h2>
                      <div className="h-1 w-20 bg-primary-600 rounded-full mt-2"></div>
                    </div>
                  </div>

                  {/* Features Grid */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {category.items.map((item, itemIdx) => {
                      const ItemIcon = item.icon;
                      return (
                        <div
                          key={itemIdx}
                          className="group bg-white border border-gray-200 rounded-xl p-6 hover:border-primary-300 hover:shadow-lg transition-all duration-300"
                        >
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0">
                              <div className="p-3 bg-primary-50 rounded-lg group-hover:bg-primary-100 transition-colors">
                                <ItemIcon className="w-6 h-6 text-primary-600" />
                              </div>
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                                {item.title}
                              </h3>
                              <p className="text-gray-600 text-sm leading-relaxed">
                                {item.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary-600 to-primary-900 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Prêt à Révolutionner vos Paris Hippiques ?
            </h2>
            <p className="text-xl mb-8 text-primary-100">
              Rejoignez BetTracker Pro et accédez à toutes ces fonctionnalités gratuitement.
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
                href="/calendrier-courses"
                className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white/20 transition-all border-2 border-white/30"
              >
                Voir le Calendrier des Courses
              </Link>
            </div>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
