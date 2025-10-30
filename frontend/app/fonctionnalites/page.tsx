'use client';

import { Metadata } from 'next';
import Link from 'next/link';
import { useState, useRef } from 'react';
import {
  TrendingUp, Target, BarChart3, Wallet, Bell, Shield,
  Zap, Users, Clock, Trophy, ChevronRight, Star,
  Calendar, Newspaper, LineChart, Map, BookOpen,
  CheckCircle2, Lock, History, RefreshCw, Database,
  Eye, TrendingDown, DollarSign, Filter, BarChart,
  PieChart, Activity, Award, Settings, Smartphone,
  PlayCircle, CheckCheck, ArrowRight, Sparkles, Code,
  MessageSquare, Server, Puzzle, Webhook, Key, ChevronLeft
} from 'lucide-react';
import MarketingHeader from '@/components/marketing/MarketingHeader';
import MarketingFooter from '@/components/marketing/MarketingFooter';

const categories = [
  {
    id: 'debutant',
    label: 'Pour Débuter',
    icon: PlayCircle,
    color: 'green',
    gradient: 'from-green-500 to-emerald-600',
    bgLight: 'bg-green-50',
    textColor: 'text-green-600',
    borderColor: 'border-green-200',
    description: 'Tout ce dont vous avez besoin pour commencer à suivre vos paris intelligemment',
    features: [
      {
        icon: Eye,
        title: 'Mode Simulation',
        subtitle: 'Testez vos stratégies sans risque',
        description: 'Le mode simulation vous permet de tester des stratégies de paris en local, sans engager d\'argent réel. Parfait pour évaluer un tipster, tester une méthode ou vous entraîner avant de parier réellement sur les plateformes PMU.',
        benefit: 'Expérimentez et apprenez sans risquer votre capital'
      },
      {
        icon: BookOpen,
        title: 'Interface Simple et Guidée',
        subtitle: 'Facile à utiliser',
        description: 'Suivez un workflow étape par étape pour enregistrer vos paris : choisissez la plateforme (PMU, Betclic...), l\'hippodrome, la course, le type de pari et vos chevaux. Tout est expliqué clairement.',
        benefit: 'Pas besoin d\'être expert, on vous guide à chaque étape'
      },
      {
        icon: Target,
        title: '20+ Types de Paris Expliqués',
        subtitle: 'Quinté+, Tiercé, Quarté...',
        description: 'Découvrez tous les types de paris PMU avec des explications claires : Super 4, Trio Bonus, Quarté+ Bonus, Multi, 2sur4... Comprenez les règles et suivez vos performances sur chaque type.',
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
    label: 'Suivi de Paris',
    icon: Target,
    color: 'primary',
    gradient: 'from-primary-500 to-purple-600',
    bgLight: 'bg-primary-50',
    textColor: 'text-primary-600',
    borderColor: 'border-primary-200',
    description: 'Suivez tous vos paris hippiques au même endroit',
    features: [
      {
        icon: Database,
        title: 'Tous vos Paris Centralisés',
        subtitle: 'Un seul endroit pour tout suivre',
        description: 'Enregistrez tous vos paris faits sur PMU.fr, Betclic, Unibet ou autres plateformes. BetTracker Pro est un outil de suivi - vous pariez sur les plateformes officielles, puis vous enregistrez vos paris ici pour les analyser.',
        benefit: 'Plus besoin de jongler entre plusieurs sites pour suivre vos performances'
      },
      {
        icon: Map,
        title: 'Tous les Hippodromes',
        subtitle: 'Vincennes, Longchamp, Deauville...',
        description: 'Suivez vos paris sur tous les hippodromes de France : Vincennes, Longchamp, Chantilly, Deauville, Enghien, Auteuil, Cagnes-sur-Mer... Courses de plat, trot et obstacles.',
        benefit: 'Analysez vos performances par hippodrome'
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
        description: 'Retrouvez tous vos paris enregistrés avec détails complets : date, hippodrome, course, type de pari, mise, résultat et gain. Filtrez par période, hippodrome ou résultat.',
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
    gradient: 'from-blue-500 to-cyan-600',
    bgLight: 'bg-blue-50',
    textColor: 'text-blue-600',
    borderColor: 'border-blue-200',
    description: 'Analysez vos performances et optimisez votre stratégie',
    features: [
      {
        icon: TrendingUp,
        title: 'ROI en Temps Réel',
        subtitle: 'Retour sur investissement',
        description: 'Suivez votre retour sur investissement en temps réel sur vos paris enregistrés. Visualisez l\'évolution de votre ROI avec des graphiques clairs. Comprenez si votre stratégie est rentable.',
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
        description: 'Des graphiques interactifs vous montrent l\'évolution de votre bankroll (virtuelle en simulation, réelle en suivi), votre taux de réussite et vos gains au fil du temps.',
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
    gradient: 'from-yellow-500 to-orange-600',
    bgLight: 'bg-yellow-50',
    textColor: 'text-yellow-700',
    borderColor: 'border-yellow-200',
    description: 'Gérez votre capital et évitez les pertes',
    features: [
      {
        icon: DollarSign,
        title: 'Suivi de Bankroll',
        subtitle: 'Gérez votre capital',
        description: 'Définissez votre bankroll de départ et suivez son évolution en temps réel. En mode réel, suivez votre capital réel investi. En mode simulation, testez la gestion de votre bankroll virtuelle.',
        benefit: 'Gardez le contrôle de votre budget'
      },
      {
        icon: TrendingDown,
        title: 'Alertes de Sécurité',
        subtitle: 'Protégez votre capital',
        description: 'Recevez des alertes quand votre bankroll descend sous certains seuils. Le système vous prévient pour éviter de tout perdre. Particulièrement utile pour le suivi de vos paris réels.',
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
    id: 'api',
    label: 'API & Intégrations',
    icon: Code,
    color: 'indigo',
    gradient: 'from-indigo-500 to-violet-600',
    bgLight: 'bg-indigo-50',
    textColor: 'text-indigo-600',
    borderColor: 'border-indigo-200',
    description: 'Intégrez BetTracker Pro dans vos outils et workflows',
    features: [
      {
        icon: MessageSquare,
        title: 'Chatbot IA Intégré',
        subtitle: 'Assistant virtuel intelligent',
        description: 'Posez des questions en langage naturel sur vos statistiques, vos performances ou des conseils de paris. Le chatbot analyse vos données et vous répond instantanément avec des insights personnalisés.',
        benefit: 'Obtenez des réponses instantanées sans chercher dans les menus'
      },
      {
        icon: Server,
        title: 'Serveur MCP',
        subtitle: 'Model Context Protocol',
        description: 'Notre serveur MCP permet à Claude (Anthropic) et d\'autres IA d\'accéder à vos données de paris de manière sécurisée. Analysez vos performances avec l\'aide de l\'IA, générez des rapports personnalisés.',
        benefit: 'Utilisez Claude pour analyser vos paris et stratégies'
      },
      {
        icon: Key,
        title: 'API REST Complète',
        subtitle: 'Accès programmatique',
        description: 'API REST complète avec authentification sécurisée. Créez vos propres outils, automatisez l\'enregistrement de paris, exportez vos données, intégrez avec vos scripts Python/Node.js.',
        benefit: 'Automatisez et personnalisez votre expérience'
      },
      {
        icon: Webhook,
        title: 'Webhooks',
        subtitle: 'Notifications en temps réel',
        description: 'Configurez des webhooks pour recevoir des notifications en temps réel : nouveau pari gagné, objectif atteint, alerte bankroll... Intégrez avec Discord, Slack, Telegram.',
        benefit: 'Soyez notifié instantanément sur vos outils préférés'
      },
      {
        icon: Puzzle,
        title: 'Intégrations Tierces',
        subtitle: 'ChatGPT, Zapier, Make...',
        description: 'Utilisez BetTracker Pro avec ChatGPT via notre plugin, ou connectez-le à Zapier/Make pour créer des automations complexes. Exportez vers Google Sheets, Notion, Airtable...',
        benefit: 'Connectez BetTracker à tout votre écosystème'
      },
      {
        icon: Code,
        title: 'Documentation Développeur',
        subtitle: 'Guides et exemples',
        description: 'Documentation complète avec exemples de code en Python, JavaScript, cURL. SDK officiels, playground API, exemples d\'intégrations. Tout pour démarrer rapidement.',
        benefit: 'Développez facilement vos propres intégrations'
      }
    ]
  },
  {
    id: 'avance',
    label: 'Fonctionnalités Avancées',
    icon: Zap,
    color: 'purple',
    gradient: 'from-purple-500 to-pink-600',
    bgLight: 'bg-purple-50',
    textColor: 'text-purple-600',
    borderColor: 'border-purple-200',
    description: 'Pour aller plus loin dans l\'analyse',
    features: [
      {
        icon: RefreshCw,
        title: 'Modes Réel et Simulation Séparés',
        subtitle: 'Deux univers distincts',
        description: 'Mode RÉEL : suivez les paris que vous faites réellement sur les plateformes (PMU, Betclic...). Mode SIMULATION : testez des stratégies localement sans parier. Les deux modes sont complètement séparés pour ne pas mélanger les statistiques.',
        benefit: 'Testez sans impacter le suivi de vos vrais paris'
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
        description: 'Recevez des notifications pour les résultats de vos paris enregistrés, les courses importantes, vos objectifs atteints... Personnalisez complètement vos préférences.',
        benefit: 'Ne manquez aucune information importante'
      },
      {
        icon: Users,
        title: 'Suivi Multi-Tipsters',
        subtitle: 'Suivez les experts',
        description: 'En mode simulation, testez les pronostics de différents tipsters pour évaluer leur performance avant de suivre leurs conseils en réel. Comparez vos performances avec d\'autres.',
        benefit: 'Évaluez les tipsters avant de suivre leurs conseils'
      },
      {
        icon: Lock,
        title: 'Sécurité Maximum',
        subtitle: 'Vos données protégées',
        description: 'Toutes vos données sont cryptées et sécurisées. Conformité RGPD complète. Vos paris et statistiques restent privés sauf si vous choisissez de les partager.',
        benefit: 'Suivez vos paris en toute confidentialité'
      },
      {
        icon: Smartphone,
        title: 'Application Mobile',
        subtitle: 'Suivez partout',
        description: 'Interface responsive parfaitement adaptée aux smartphones et tablettes. Enregistrez vos paris directement depuis l\'hippodrome juste après avoir parié sur votre plateforme.',
        benefit: 'Enregistrez vos paris où que vous soyez'
      }
    ]
  }
];

export default function FonctionnalitesPage() {
  const [activeTab, setActiveTab] = useState('debutant');
  const activeCategory = categories.find(cat => cat.id === activeTab) || categories[0];
  const CategoryIcon = activeCategory.icon;
  const tabsRef = useRef<HTMLDivElement>(null);

  const scrollTabs = (direction: 'left' | 'right') => {
    if (tabsRef.current) {
      const scrollAmount = 200;
      const newScrollLeft = direction === 'left'
        ? tabsRef.current.scrollLeft - scrollAmount
        : tabsRef.current.scrollLeft + scrollAmount;

      tabsRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />

      {/* Hero Section */}
      <section className={`relative overflow-hidden bg-gradient-to-br ${activeCategory.gradient} text-white py-16 transition-all duration-500`}>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-white/20">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span className="text-sm font-medium">Plateforme de Suivi de Paris Hippiques</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Tout pour Suivre et Analyser vos <span className="text-yellow-300">Paris Hippiques</span>
            </h1>

            <p className="text-lg md:text-xl mb-8 text-white/90 max-w-3xl mx-auto">
              Des outils simples et puissants pour enregistrer, suivre et analyser vos paris faits sur les plateformes PMU. Que vous soyez débutant ou expert.
            </p>

            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 bg-yellow-400 text-gray-900 px-8 py-4 rounded-lg font-bold text-lg hover:bg-yellow-300 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
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
        <div className="container mx-auto px-4 relative">
          {/* Flèche gauche */}
          <button
            onClick={() => scrollTabs('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white p-2 rounded-full shadow-md md:hidden border border-gray-200"
            aria-label="Défiler vers la gauche"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>

          {/* Tabs */}
          <div ref={tabsRef} className="flex overflow-x-auto scrollbar-hide scroll-smooth">
            {categories.map((category) => {
              const Icon = category.icon;
              const isActive = activeTab === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveTab(category.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-semibold text-sm whitespace-nowrap transition-all border-b-2 ${
                    isActive
                      ? `border-${category.color}-600 ${category.textColor} ${category.bgLight}`
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {category.label}
                </button>
              );
            })}
          </div>

          {/* Flèche droite */}
          <button
            onClick={() => scrollTabs('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white p-2 rounded-full shadow-md md:hidden border border-gray-200"
            aria-label="Défiler vers la droite"
          >
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </section>

      {/* Tab Content */}
      <section className="py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          {/* Category Header */}
          <div className="max-w-3xl mx-auto text-center mb-12">
            <div className={`inline-flex items-center justify-center w-16 h-16 ${activeCategory.bgLight} rounded-2xl mb-4`}>
              <CategoryIcon className={`w-8 h-8 ${activeCategory.textColor}`} />
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
                  className={`group bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border ${activeCategory.borderColor} hover:border-opacity-100 border-opacity-50`}
                >
                  {/* Icon & Title */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="flex-shrink-0">
                      <div className={`w-14 h-14 ${activeCategory.bgLight} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <FeatureIcon className={`w-7 h-7 ${activeCategory.textColor}`} />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-xl font-bold text-gray-900 mb-1 group-hover:${activeCategory.textColor} transition-colors`}>
                        {feature.title}
                      </h3>
                      <p className={`text-sm font-medium ${activeCategory.textColor}`}>
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
      <section className={`py-20 bg-gradient-to-br ${activeCategory.gradient} text-white transition-all duration-500`}>
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Prêt à Améliorer vos Performances ?
            </h2>
            <p className="text-xl mb-8 text-white/90">
              Rejoignez BetTracker Pro gratuitement et commencez à suivre et optimiser vos paris hippiques dès aujourd'hui.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 bg-yellow-400 text-gray-900 px-8 py-4 rounded-lg font-bold text-lg hover:bg-yellow-300 transition-all shadow-xl"
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
