'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down';
  icon: React.ElementType;
  color: string;
  isCurrency?: boolean;
  isPercentage?: boolean;
  changeLabel?: string;
}

export default function StatsCard({
  title,
  value,
  change,
  trend,
  icon: Icon,
  color,
  isCurrency = false,
  isPercentage = false,
  changeLabel = 'vs mois dernier',
}: StatsCardProps) {
  const formatValue = () => {
    if (typeof value === 'number') {
      if (isCurrency) return formatCurrency(value);
      if (isPercentage) return `${value.toFixed(1)}%`;
      return value.toLocaleString('fr-FR');
    }
    return value;
  };

  const formatChange = () => {
    if (change === undefined) return null;
    const sign = change >= 0 ? '+' : '';
    if (isPercentage) return `${sign}${change.toFixed(1)}%`;
    if (isCurrency) return `${sign}${formatCurrency(Math.abs(change))}`;
    return `${sign}${change}`;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{formatValue()}</p>
          {change !== undefined && (
            <div className="mt-2 flex items-center space-x-1">
              {trend === 'up' ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : trend === 'down' ? (
                <TrendingDown className="h-4 w-4 text-red-500" />
              ) : null}
              <span
                className={`text-sm font-medium ${
                  trend === 'up'
                    ? 'text-green-600'
                    : trend === 'down'
                    ? 'text-red-600'
                    : 'text-gray-600'
                }`}
              >
                {formatChange()}
              </span>
              <span className="text-sm text-gray-500">{changeLabel}</span>
            </div>
          )}
        </div>
        <div className={`${color} rounded-lg p-3`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );
}
