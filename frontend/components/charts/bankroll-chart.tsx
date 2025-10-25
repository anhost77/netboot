'use client';

import { BankrollEvolutionData } from '@/lib/api/platforms';
import { formatCurrency } from '@/lib/utils';
import { useState } from 'react';

interface BankrollChartProps {
  data: BankrollEvolutionData[];
  title?: string;
  height?: number;
}

export default function BankrollChart({ data, title, height = 250 }: BankrollChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>Aucune donnée disponible pour cette période</p>
      </div>
    );
  }

  const maxBalance = Math.max(...data.map((d) => d.balance));
  const minBalance = Math.min(...data.map((d) => d.balance), 0);
  const range = maxBalance - minBalance;

  // Add padding to the range for better visualization
  const yPadding = range * 0.1;
  const yMax = maxBalance + yPadding;
  const yMin = Math.max(0, minBalance - yPadding);
  const yRange = yMax - yMin;

  // Chart dimensions
  const chartWidth = 100; // percentage
  const chartHeight = height;
  const padding = { top: 10, right: 10, bottom: 40, left: 60 };

  // Calculate Y-axis labels (5 steps)
  const ySteps = 5;
  const yLabels = Array.from({ length: ySteps + 1 }, (_, i) => {
    return yMin + (yRange * i) / ySteps;
  }).reverse();

  // Generate SVG path for the line
  const points = data.map((item, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = ((yMax - item.balance) / yRange) * 100;
    return { x, y, value: item.balance, date: item.date };
  });

  const linePath = points
    .map((point, index) => {
      const command = index === 0 ? 'M' : 'L';
      return `${command} ${point.x} ${point.y}`;
    })
    .join(' ');

  // Create area path (filled region under the line)
  const areaPath = `${linePath} L 100 100 L 0 100 Z`;

  // Determine color based on trend
  const initialBalance = data[0]?.balance || 0;
  const finalBalance = data[data.length - 1]?.balance || 0;
  const isPositiveTrend = finalBalance >= initialBalance;
  const lineColor = isPositiveTrend ? '#10b981' : '#ef4444'; // green-500 : red-500
  const areaColor = isPositiveTrend ? '#10b98120' : '#ef444420'; // with opacity

  return (
    <div className="space-y-4">
      {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}

      <div className="relative" style={{ height: chartHeight + padding.top + padding.bottom }}>
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-10 flex flex-col justify-between text-xs text-gray-500 w-14 pr-2">
          {yLabels.map((value, index) => (
            <div key={index} className="text-right">
              {formatCurrency(value)}
            </div>
          ))}
        </div>

        {/* Chart area */}
        <div className="absolute left-14 right-0 top-0" style={{ height: chartHeight }}>
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="overflow-visible"
          >
            {/* Grid lines */}
            {yLabels.map((_, index) => {
              const y = (index / ySteps) * 100;
              return (
                <line
                  key={index}
                  x1="0"
                  y1={y}
                  x2="100"
                  y2={y}
                  stroke="#e5e7eb"
                  strokeWidth="0.5"
                  vectorEffect="non-scaling-stroke"
                />
              );
            })}

            {/* Area under the line */}
            <path
              d={areaPath}
              fill={areaColor}
            />

            {/* Line */}
            <path
              d={linePath}
              fill="none"
              stroke={lineColor}
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {/* Data points */}
            {points.map((point, index) => (
              <g key={index}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={hoveredIndex === index ? '2.5' : '1.5'}
                  fill={lineColor}
                  vectorEffect="non-scaling-stroke"
                  className="transition-all cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
                {/* Larger invisible circle for easier hovering */}
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="5"
                  fill="transparent"
                  vectorEffect="non-scaling-stroke"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              </g>
            ))}
          </svg>

          {/* Tooltip */}
          {hoveredIndex !== null && (
            <div
              className="absolute bg-gray-900 text-white text-xs rounded py-2 px-3 whitespace-nowrap z-10 pointer-events-none shadow-lg"
              style={{
                left: `${points[hoveredIndex].x}%`,
                top: `${points[hoveredIndex].y}%`,
                transform: 'translate(-50%, -120%)',
              }}
            >
              <div className="font-semibold">{formatCurrency(points[hoveredIndex].value)}</div>
              <div className="text-gray-400 text-[10px]">
                {new Date(points[hoveredIndex].date).toLocaleDateString('fr-FR', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </div>
            </div>
          )}
        </div>

        {/* X-axis labels */}
        <div className="absolute left-14 right-0 bottom-0 h-10">
          <div className="relative h-full">
            {data.map((item, index) => {
              // Show labels for first, last, and every nth item
              const showLabel = index === 0 ||
                               index === data.length - 1 ||
                               index % Math.ceil(data.length / 5) === 0;

              if (!showLabel) return null;

              return (
                <div
                  key={index}
                  className="absolute text-xs text-gray-500 text-center"
                  style={{
                    left: `${(index / (data.length - 1)) * 100}%`,
                    transform: 'translateX(-50%)',
                    top: '8px',
                  }}
                >
                  {new Date(item.date).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: 'short',
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t text-sm">
        <div>
          <div className="text-gray-500">Départ</div>
          <div className="font-semibold">{formatCurrency(initialBalance)}</div>
        </div>
        <div>
          <div className="text-gray-500">Actuel</div>
          <div className={`font-semibold ${isPositiveTrend ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(finalBalance)}
          </div>
        </div>
        <div>
          <div className="text-gray-500">Évolution</div>
          <div className={`font-semibold ${isPositiveTrend ? 'text-green-600' : 'text-red-600'}`}>
            {finalBalance >= initialBalance ? '+' : ''}
            {formatCurrency(finalBalance - initialBalance)}
          </div>
        </div>
      </div>
    </div>
  );
}
