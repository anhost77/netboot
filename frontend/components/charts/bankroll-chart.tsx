'use client';

import { BankrollEvolutionData } from '@/lib/api/platforms';
import { formatCurrency } from '@/lib/utils';

interface BankrollChartProps {
  data: BankrollEvolutionData[];
  title?: string;
  height?: number;
}

export default function BankrollChart({ data, title, height = 200 }: BankrollChartProps) {
  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>Aucune donnée disponible pour cette période</p>
      </div>
    );
  }

  const maxBalance = Math.max(...data.map((d) => d.balance));
  const minBalance = Math.min(...data.map((d) => d.balance));
  const range = maxBalance - minBalance;
  const baseHeight = height;

  return (
    <div className="space-y-4">
      {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}

      <div className="flex items-end justify-between space-x-2 h-full">
        {data.map((item, index) => {
          const value = item.balance;
          const heightRatio = range > 0 ? (value - minBalance) / range : 0.5;
          const barHeight = Math.max(heightRatio * baseHeight, 10);
          const isPositive = value >= (data[0]?.balance || 0);

          return (
            <div
              key={index}
              className="flex-1 flex flex-col items-center group relative"
            >
              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10">
                <div>{formatCurrency(value)}</div>
                <div className="text-gray-400">
                  {new Date(item.date).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: 'short',
                  })}
                </div>
              </div>

              {/* Bar */}
              <div
                style={{ height: `${barHeight}px` }}
                className={`w-full rounded-t transition-all duration-200 ${
                  isPositive ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
                }`}
              />

              {/* Date label (show every nth item to avoid crowding) */}
              {(index === 0 || index === data.length - 1 || index % Math.ceil(data.length / 5) === 0) && (
                <div className="text-xs text-gray-500 mt-2 text-center">
                  {new Date(item.date).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: 'short',
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between text-sm text-gray-600 pt-4 border-t">
        <div>
          <span className="font-medium">Min:</span> {formatCurrency(minBalance)}
        </div>
        <div>
          <span className="font-medium">Max:</span> {formatCurrency(maxBalance)}
        </div>
      </div>
    </div>
  );
}
