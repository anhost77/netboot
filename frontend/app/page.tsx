'use client';

import Link from 'next/link';
import {
  TrendingUp, Target, BarChart3, Wallet, Bell, Shield,
  Zap, Users, Clock, Trophy, ChevronRight, Star,
  Calendar, Newspaper, LineChart, Map
} from 'lucide-react';
import MarketingHeader from '@/components/marketing/MarketingHeader';
import MarketingFooter from '@/components/marketing/MarketingFooter';
import { useAuthModal } from '@/contexts/AuthModalContext';

export default function Home() {
  const { openLoginModal, openRegisterModal } = useAuthModal();
  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Maîtrisez vos <span className="text-yellow-300">Paris Hippiques</span> comme un Pro
            </h1>

            <p className="text-xl md:text-2xl mb-8 text-primary-100 max-w-3xl mx-auto">
              La plateforme tout-en-un pour suivre, analyser et optimiser vos paris hippiques PMU.
              Statistiques avancées, mode simulation et intégration temps réel.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button
                onClick={openRegisterModal}
                className="inline-flex items-center justify-center gap-2 bg-yellow-400 text-primary-900 px-8 py-4 rounded-lg font-bold text-lg hover:bg-yellow-300 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
              >
                Commencer Gratuitement
                <ChevronRight className="w-5 h-5" />
              </button>
              <button
                onClick={openLoginModal}
                className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white/20 transition-all border-2 border-white/30"
              >
                Se connecter
              </button>
            </div>

            <div className="flex flex-wrap justify-center gap-8 text-sm">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-300" />
                <span>100% Sécurisé</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-300" />
                <span>Données Temps Réel PMU</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary-300" />
                <span>20+ Types de Paris</span>
              </div>
            </div>
          </div>
        </div>

        {/* Vague décorative */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Fonctionnalités Clés */}
      <section className="py-12 bg-gray-50 border-y border-gray-200">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">20+</div>
              <div className="text-gray-600">Types de Paris</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">Tous</div>
              <div className="text-gray-600">Hippodromes Français</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">2</div>
              <div className="text-gray-600">Modes (Réel/Simulation)</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">100%</div>
              <div className="text-gray-600">Gratuit pour commencer</div>
            </div>
          </div>
        </div>
      </section>

      {/* Fonctionnalités Principales */}
      <section id="fonctionnalites" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Tout ce dont vous avez besoin pour <span className="text-primary-600">réussir</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Une suite complète d'outils professionnels pour gérer et optimiser vos paris hippiques
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* Suivi de Paris */}
            <div className="group p-8 bg-white rounded-2xl border-2 border-gray-100 hover:border-blue-500 hover:shadow-xl transition-all">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-500 transition-colors">
                <Target className="w-7 h-7 text-primary-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Suivi de Paris Complet</h3>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Enregistrez et suivez tous vos paris avec 20+ types supportés : Quinté+, Tiercé, Quarté+, Couplé, Trio et plus encore.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-blue-500" />
                  Support de tous les types de paris PMU
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-blue-500" />
                  Mise à jour automatique des résultats
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-blue-500" />
                  Historique illimité
                </li>
              </ul>
            </div>

            {/* Statistiques Avancées */}
            <div className="group p-8 bg-white rounded-2xl border-2 border-gray-100 hover:border-blue-500 hover:shadow-xl transition-all">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-purple-500 transition-colors">
                <BarChart3 className="w-7 h-7 text-purple-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Statistiques Avancées</h3>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Analyses détaillées par hippodrome, jockey, cheval et type de pari. Identifiez vos meilleures stratégies.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-purple-500" />
                  Performance par hippodrome
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-purple-500" />
                  Analyse jockeys et chevaux
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-purple-500" />
                  Graphiques interactifs
                </li>
              </ul>
            </div>

            {/* Gestion Budget */}
            <div className="group p-8 bg-white rounded-2xl border-2 border-gray-100 hover:border-blue-500 hover:shadow-xl transition-all">
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-green-500 transition-colors">
                <Wallet className="w-7 h-7 text-green-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Gestion de Budget</h3>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Fixez des limites journalières, hebdomadaires et mensuelles. Recevez des alertes intelligentes.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-green-500" />
                  Limites personnalisables
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-green-500" />
                  Alertes en temps réel
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-green-500" />
                  Suivi de bankroll multi-plateforme
                </li>
              </ul>
            </div>

            {/* Mode Simulation */}
            <div className="group p-8 bg-white rounded-2xl border-2 border-gray-100 hover:border-blue-500 hover:shadow-xl transition-all">
              <div className="w-14 h-14 bg-yellow-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-yellow-500 transition-colors">
                <Zap className="w-7 h-7 text-yellow-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Mode Simulation</h3>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Testez vos stratégies sans risque financier. Basculez entre mode réel et simulation en un clic.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-yellow-500" />
                  Données complètement isolées
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-yellow-500" />
                  Parfait pour l'apprentissage
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-yellow-500" />
                  Statistiques séparées
                </li>
              </ul>
            </div>

            {/* Intégration PMU */}
            <div className="group p-8 bg-white rounded-2xl border-2 border-gray-100 hover:border-blue-500 hover:shadow-xl transition-all">
              <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-red-500 transition-colors">
                <TrendingUp className="w-7 h-7 text-red-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Intégration PMU Temps Réel</h3>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Données officielles PMU synchronisées automatiquement. Résultats et cotes en temps réel.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-red-500" />
                  Mise à jour auto des résultats
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-red-500" />
                  Historique des performances
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-red-500" />
                  Cotes officielles
                </li>
              </ul>
            </div>

            {/* Notifications */}
            <div className="group p-8 bg-white rounded-2xl border-2 border-gray-100 hover:border-blue-500 hover:shadow-xl transition-all">
              <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-indigo-500 transition-colors">
                <Bell className="w-7 h-7 text-indigo-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Notifications Intelligentes</h3>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Restez informé avec des notifications web, push et email personnalisables.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-indigo-500" />
                  Multi-canal (web, push, email)
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-indigo-500" />
                  Préférences personnalisables
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-indigo-500" />
                  Alertes budget
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Services Gratuits pour Générer du Trafic */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Services <span className="text-primary-600">Gratuits</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Accédez gratuitement à notre calendrier des courses, pronostics et actualités PMU
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            <Link href="/calendrier-courses" className="group p-6 bg-white rounded-xl shadow-sm hover:shadow-xl transition-all border border-gray-100">
              <Calendar className="w-12 h-12 text-primary-600 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold mb-2 text-gray-900">Calendrier des Courses</h3>
              <p className="text-gray-600 text-sm mb-3">
                Retrouvez toutes les courses hippiques du jour et de la semaine
              </p>
              <div className="text-primary-600 font-semibold flex items-center gap-1 text-sm">
                Voir le calendrier <ChevronRight className="w-4 h-4" />
              </div>
            </Link>

            <Link href="/pronostics" className="group p-6 bg-white rounded-xl shadow-sm hover:shadow-xl transition-all border border-gray-100">
              <Trophy className="w-12 h-12 text-yellow-600 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold mb-2 text-gray-900">Pronostics Gratuits</h3>
              <p className="text-gray-600 text-sm mb-3">
                Pronostics quotidiens pour le Quinté+ et les principales courses
              </p>
              <div className="text-yellow-600 font-semibold flex items-center gap-1 text-sm">
                Voir les pronostics <ChevronRight className="w-4 h-4" />
              </div>
            </Link>

            <Link href="/blog" className="group p-6 bg-white rounded-xl shadow-sm hover:shadow-xl transition-all border border-gray-100">
              <Newspaper className="w-12 h-12 text-green-600 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold mb-2 text-gray-900">Blog & Actualités</h3>
              <p className="text-gray-600 text-sm mb-3">
                Conseils, stratégies et actualités du monde hippique
              </p>
              <div className="text-green-600 font-semibold flex items-center gap-1 text-sm">
                Lire le blog <ChevronRight className="w-4 h-4" />
              </div>
            </Link>

            <Link href="/hippodromes" className="group p-6 bg-white rounded-xl shadow-sm hover:shadow-xl transition-all border border-gray-100">
              <Map className="w-12 h-12 text-purple-600 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold mb-2 text-gray-900">Guide des Hippodromes</h3>
              <p className="text-gray-600 text-sm mb-3">
                Découvrez les caractéristiques de chaque hippodrome français
              </p>
              <div className="text-purple-600 font-semibold flex items-center gap-1 text-sm">
                Voir le guide <ChevronRight className="w-4 h-4" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Tarifs */}
      <section id="tarifs" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Des tarifs <span className="text-primary-600">adaptés à tous</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Commencez gratuitement, évoluez quand vous êtes prêt
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {/* Gratuit */}
            <div className="p-8 bg-white rounded-2xl border-2 border-gray-200">
              <h3 className="text-2xl font-bold mb-2">Gratuit</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">0€</span>
                <span className="text-gray-600">/mois</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-gray-600">
                  <ChevronRight className="w-5 h-5 text-green-500" />
                  20 paris/mois
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <ChevronRight className="w-5 h-5 text-green-500" />
                  Statistiques de base
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <ChevronRight className="w-5 h-5 text-green-500" />
                  50 MB stockage
                </li>
              </ul>
              <button
                onClick={openRegisterModal}
                className="block w-full text-center bg-gray-100 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                Commencer
              </button>
            </div>

            {/* Starter */}
            <div className="p-8 bg-white rounded-2xl border-2 border-blue-200">
              <h3 className="text-2xl font-bold mb-2">Starter</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">9.99€</span>
                <span className="text-gray-600">/mois</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-gray-600">
                  <ChevronRight className="w-5 h-5 text-green-500" />
                  100 paris/mois
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <ChevronRight className="w-5 h-5 text-green-500" />
                  Statistiques avancées
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <ChevronRight className="w-5 h-5 text-green-500" />
                  500 MB stockage
                </li>
              </ul>
              <button
                onClick={openRegisterModal}
                className="block w-full text-center bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
              >
                Essayer
              </button>
            </div>

            {/* Pro */}
            <div className="p-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl border-2 border-blue-600 text-white relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-yellow-400 text-primary-900 px-3 py-1 rounded-full text-xs font-bold">
                POPULAIRE
              </div>
              <h3 className="text-2xl font-bold mb-2">Pro</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">19.99€</span>
                <span className="text-primary-100">/mois</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-5 h-5 text-yellow-400" />
                  Paris illimités
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-5 h-5 text-yellow-400" />
                  Analytics complètes
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-5 h-5 text-yellow-400" />
                  2 GB stockage
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-5 h-5 text-yellow-400" />
                  Accès API
                </li>
              </ul>
              <button
                onClick={openRegisterModal}
                className="block w-full text-center bg-yellow-400 text-primary-900 px-6 py-3 rounded-lg font-bold hover:bg-yellow-300 transition-colors"
              >
                Essayer Pro
              </button>
            </div>

            {/* Business */}
            <div className="p-8 bg-white rounded-2xl border-2 border-gray-200">
              <h3 className="text-2xl font-bold mb-2">Business</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">49.99€</span>
                <span className="text-gray-600">/mois</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-gray-600">
                  <ChevronRight className="w-5 h-5 text-green-500" />
                  Tout illimité
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <ChevronRight className="w-5 h-5 text-green-500" />
                  5 utilisateurs
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <ChevronRight className="w-5 h-5 text-green-500" />
                  10 GB stockage
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <ChevronRight className="w-5 h-5 text-green-500" />
                  Support prioritaire
                </li>
              </ul>
              <button
                onClick={openRegisterModal}
                className="block w-full text-center bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
              >
                Contactez-nous
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-gradient-to-br from-primary-600 to-primary-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Prêt à optimiser vos paris hippiques ?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Rejoignez la communauté des parieurs qui optimisent leurs stratégies avec BetTracker Pro
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={openRegisterModal}
              className="inline-flex items-center justify-center gap-2 bg-yellow-400 text-primary-900 px-8 py-4 rounded-lg font-bold text-lg hover:bg-yellow-300 transition-all"
            >
              Commencer Gratuitement
              <ChevronRight className="w-5 h-5" />
            </button>
            <Link
              href="/fonctionnalites"
              className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white/20 transition-all border-2 border-white/30"
            >
              Voir toutes les fonctionnalités
            </Link>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
