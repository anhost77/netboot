'use client';

import { TimeSeriesData } from '@/lib/api/statistics';
import { formatCurrency } from '@/lib/utils';
import { useState } from 'react';

interface ProfitChartCardProps {
  data: TimeSeriesData[];
  title?: string;
}

export default function ProfitChartCard({ data, title = 'Évolution du Profit' }: ProfitChartCardProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="text-center py-12 text-gray-500">
          <p>Aucune donnée disponible pour cette période</p>
        </div>
      </div>
    );
  }

  const maxProfit = Math.max(...data.map((d) => d.totalProfit));
  const minProfit = Math.min(...data.map((d) => d.totalProfit), 0);
  const range = maxProfit - minProfit;

  // Add padding to the range for better visualization
  const yPadding = range * 0.1 || 10;
  const yMax = maxProfit + yPadding;
  const yMin = minProfit - yPadding;
  const yRange = yMax - yMin;

  // Chart dimensions
  const chartHeight = 250;

  // Calculate Y-axis labels (5 steps)
  const ySteps = 5;
  const yLabels = Array.from({ length: ySteps + 1 }, (_, i) => {
    return yMin + (yRange * i) / ySteps;
  }).reverse();

  // Generate SVG path for the line
  const points = data.map((item, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = ((yMax - item.totalProfit) / yRange) * 100;
    return { x, y, value: item.totalProfit, period: item.period };
  });

  const linePath = points
    .map((point, index) => {
      const command = index === 0 ? 'M' : 'L';
      return `${command} ${point.x} ${point.y}`;
    })
    .join(' ');

  // Create area path (filled region under the line)
  const zeroY = ((yMax - 0) / yRange) * 100;
  const areaPath = `${linePath} L 100 ${zeroY} L 0 ${zeroY} Z`;

  // Determine color based on overall trend
  const totalProfit = data.reduce((sum, d) => sum + d.totalProfit, 0);
  const isPositiveTrend = totalProfit >= 0;
  const lineColor = isPositiveTrend ? '#10b981' : '#ef4444';
  const areaColor = isPositiveTrend ? '#10b98120' : '#ef444420';

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>

      <div className="relative" style={{ height: chartHeight + 50 }}>
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-10 flex flex-col justify-between text-xs text-gray-500 w-16 pr-2">
          {yLabels.map((value, index) => (
            <div key={index} className="text-right">
              {formatCurrency(value)}
            </div>
          ))}
        </div>

        {/* Chart area */}
        <div className="absolute left-16 right-0 top-0" style={{ height: chartHeight }}>
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

            {/* Zero line */}
            <line
              x1="0"
              y1={zeroY}
              x2="100"
              y2={zeroY}
              stroke="#9ca3af"
              strokeWidth="1"
              strokeDasharray="4 4"
              vectorEffect="non-scaling-stroke"
            />

            {/* Area under the line */}
            <path d={areaPath} fill={areaColor} />

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
              <div className="text-gray-400 text-[10px]">{points[hoveredIndex].period}</div>
            </div>
          )}
        </div>

        {/* X-axis labels */}
        <div className="absolute left-16 right-0 bottom-0 h-10">
          <div className="relative h-full">
            {data.map((item, index) => {
              const showLabel =
                index === 0 || index === data.length - 1 || index % Math.ceil(data.length / 5) === 0;

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
                  {item.period}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t text-sm mt-4">
        <div>
          <div className="text-gray-500">Total</div>
          <div className={`font-semibold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {totalProfit >= 0 ? '+' : ''}
            {formatCurrency(totalProfit)}
          </div>
        </div>
        <div>
          <div className="text-gray-500">Meilleur</div>
          <div className="font-semibold text-green-600">+{formatCurrency(maxProfit)}</div>
        </div>
        <div>
          <div className="text-gray-500">Pire</div>
          <div className="font-semibold text-red-600">{formatCurrency(minProfit)}</div>
        </div>
      </div>
    </div>
  );
}
