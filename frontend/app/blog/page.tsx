'use client';

import Link from 'next/link';
import { Newspaper, Clock, User, TrendingUp, ChevronRight, Search } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useState } from 'react';
import MarketingHeader from '@/components/marketing/MarketingHeader';
import MarketingFooter from '@/components/marketing/MarketingFooter';

interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  date: Date;
  readTime: number;
  image: string;
  featured: boolean;
}

const articles: Article[] = [
  {
    id: '1',
    slug: 'strategie-quinte-plus-2024',
    title: 'Les Meilleures Stratégies pour Gagner au Quinté+ en 2024',
    excerpt: 'Découvrez les stratégies éprouvées des professionnels pour maximiser vos gains au Quinté+. Analyses statistiques et conseils pratiques.',
    category: 'Stratégies',
    author: 'Expert Turf',
    date: new Date('2024-01-15'),
    readTime: 8,
    image: '/blog/quinte-strategy.jpg',
    featured: true
  },
  {
    id: '2',
    slug: 'comprendre-cotes-pmu',
    title: 'Comment Comprendre et Utiliser les Cotes PMU',
    excerpt: 'Guide complet pour décrypter les cotes PMU et identifier les meilleures opportunités de paris hippiques.',
    category: 'Guides',
    author: 'Marie Dupont',
    date: new Date('2024-01-12'),
    readTime: 6,
    image: '/blog/cotes-pmu.jpg',
    featured: true
  },
  {
    id: '3',
    slug: 'hippodromes-francais-guide',
    title: 'Guide des Hippodromes Français : Caractéristiques et Particularités',
    excerpt: 'Découvrez les spécificités de chaque hippodrome français et comment adapter votre stratégie en fonction du terrain.',
    category: 'Guides',
    author: 'Pierre Martin',
    date: new Date('2024-01-10'),
    readTime: 10,
    image: '/blog/hippodromes.jpg',
    featured: false
  },
  {
    id: '4',
    slug: 'gestion-bankroll-paris-hippiques',
    title: 'Gestion de Bankroll : La Clé du Succès sur le Long Terme',
    excerpt: 'Apprenez à gérer votre budget de paris comme un professionnel. Techniques de money management et conseils pour préserver votre capital.',
    category: 'Stratégies',
    author: 'Expert Turf',
    date: new Date('2024-01-08'),
    readTime: 7,
    image: '/blog/bankroll.jpg',
    featured: false
  },
  {
    id: '5',
    slug: 'analyse-jockeys-top-10-2024',
    title: 'Top 10 des Jockeys à Suivre en 2024',
    excerpt: 'Analyse des meilleurs jockeys français et de leurs statistiques. Qui sont les valeurs sûres pour vos paris ?',
    category: 'Analyses',
    author: 'Marie Dupont',
    date: new Date('2024-01-05'),
    readTime: 9,
    image: '/blog/jockeys-2024.jpg',
    featured: false
  },
  {
    id: '6',
    slug: 'tierce-quarte-quinte-differences',
    title: 'Tiercé, Quarté+, Quinté+ : Quelle Formule Choisir ?',
    excerpt: 'Comparatif complet des différents types de paris PMU. Avantages, inconvénients et stratégies pour chaque formule.',
    category: 'Guides',
    author: 'Pierre Martin',
    date: new Date('2024-01-03'),
    readTime: 5,
    image: '/blog/paris-types.jpg',
    featured: false
  },
  {
    id: '7',
    slug: 'statistiques-pmu-ameliorer-pronostics',
    title: 'Utiliser les Statistiques pour Améliorer vos Pronostics',
    excerpt: 'Comment exploiter les données historiques et statistiques pour faire des pronostics plus précis et rentables.',
    category: 'Analyses',
    author: 'Expert Turf',
    date: new Date('2024-01-01'),
    readTime: 11,
    image: '/blog/statistiques.jpg',
    featured: false
  },
  {
    id: '8',
    slug: 'erreurs-courantes-paris-hippiques',
    title: '10 Erreurs à Éviter dans les Paris Hippiques',
    excerpt: 'Découvrez les pièges les plus courants que font les parieurs débutants et comment les éviter pour préserver votre bankroll.',
    category: 'Conseils',
    author: 'Marie Dupont',
    date: new Date('2023-12-28'),
    readTime: 6,
    image: '/blog/erreurs.jpg',
    featured: false
  }
];

export default function BlogPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['all', ...Array.from(new Set(articles.map(a => a.category)))];

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredArticles = filteredArticles.filter(a => a.featured);
  const regularArticles = filteredArticles.filter(a => !a.featured);

  return (
    <div className="min-h-screen bg-gray-50">
      <MarketingHeader />

      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Newspaper className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Blog PMU & Paris Hippiques
            </h1>
            <p className="text-xl text-primary-100 mb-6">
              Guides, stratégies, analyses et actualités du monde des courses hippiques.
              Tous les conseils pour devenir un parieur gagnant.
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
                placeholder="Rechercher un article..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Catégories */}
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    selectedCategory === cat
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {cat === 'all' ? 'Tous' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Featured Articles */}
          {featuredArticles.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-primary-600" />
                Articles à la une
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {featuredArticles.map(article => (
                  <Link
                    key={article.id}
                    href={`/blog/${article.slug}`}
                    className="group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all border-2 border-green-200"
                  >
                    <div className="h-48 bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white">
                      <Newspaper className="w-20 h-20 opacity-50" />
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold">
                          {article.category}
                        </span>
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-bold">
                          À LA UNE
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {article.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {article.author}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {article.readTime} min
                          </span>
                        </div>
                        <span>{format(article.date, 'd MMM yyyy', { locale: fr })}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Regular Articles */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Tous les articles</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {regularArticles.map(article => (
                <Link
                  key={article.id}
                  href={`/blog/${article.slug}`}
                  className="group bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all border border-gray-200"
                >
                  <div className="h-40 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-400">
                    <Newspaper className="w-16 h-16 opacity-50" />
                  </div>
                  <div className="p-5">
                    <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold mb-3">
                      {article.category}
                    </span>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {article.readTime} min
                      </span>
                      <span>{format(article.date, 'd MMM', { locale: fr })}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16 mt-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Mettez en pratique avec BetTracker Pro
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Appliquez les stratégies de notre blog et suivez vos résultats avec notre plateforme
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
            Blog Paris Hippiques : Conseils, Stratégies et Actualités PMU
          </h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            Bienvenue sur le blog BetTracker Pro, votre source d'informations pour tout savoir sur les paris
            hippiques PMU. Que vous soyez débutant ou parieur expérimenté, retrouvez des guides pratiques,
            des analyses approfondies et des stratégies gagnantes.
          </p>

          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Guides et tutoriels pour débutants
          </h3>
          <p className="text-gray-700 leading-relaxed mb-6">
            Apprenez les bases des paris hippiques : comprendre les cotes PMU, choisir entre Tiercé, Quarté+
            et Quinté+, analyser les performances des chevaux et jockeys. Nos guides vous accompagnent pas à pas.
          </p>

          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Stratégies avancées et analyses
          </h3>
          <p className="text-gray-700 leading-relaxed">
            Découvrez les stratégies utilisées par les professionnels du turf. Gestion de bankroll, analyse
            statistique, identification des valeurs, et bien plus. Améliorez votre ROI grâce à nos conseils d'experts.
          </p>
        </div>
      </div>

      <MarketingFooter />
    </div>
  );
}
