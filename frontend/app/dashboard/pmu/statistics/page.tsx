'use client';

import { PmuStatsSection } from '@/components/statistics/pmu-stats-section';
import Link from 'next/link';
import { ArrowLeft, Trophy } from 'lucide-react';

export default function PmuStatisticsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <Trophy className="h-8 w-8 text-primary-600" />
            <h1 className="text-3xl font-bold text-gray-900">Statistiques PMU</h1>
          </div>
          <p className="text-gray-600">Analyse détaillée de vos pronostics et performances PMU</p>
        </div>
        <Link
          href="/dashboard/statistics"
          className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Retour aux statistiques</span>
        </Link>
      </div>

      {/* PMU Stats Section */}
      <PmuStatsSection />
    </div>
  );
}
