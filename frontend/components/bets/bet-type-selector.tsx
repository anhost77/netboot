'use client';

import { useState } from 'react';
import { Check, Info } from 'lucide-react';
import { PMU_BET_TYPES, getBetTypesByCategory, type PMUBetType } from '@/lib/pmu-bet-types';

interface BetTypeSelectorProps {
  selectedType: string | null;
  onSelect: (betType: PMUBetType) => void;
}

export default function BetTypeSelector({ selectedType, onSelect }: BetTypeSelectorProps) {
  const [activeCategory, setActiveCategory] = useState<PMUBetType['category']>('simple');

  const categories = [
    { value: 'simple' as const, label: 'Paris Simples', icon: '🎯' },
    { value: 'couple' as const, label: 'Couplés', icon: '👥' },
    { value: 'trio' as const, label: 'Trios', icon: '🎲' },
    { value: 'multi' as const, label: 'Tiercé/Quarté/Quinté', icon: '🏆' },
    { value: 'special' as const, label: 'Paris Spéciaux', icon: '⭐' },
  ];

  const betTypes = getBetTypesByCategory(activeCategory);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Type de pari</h3>
        
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          {categories.map((cat) => (
            <button
              type="button"
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeCategory === cat.value
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="mr-2">{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Bet Types Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {betTypes.map((betType) => {
            const isSelected = selectedType === betType.code;
            return (
              <button
                type="button"
                key={betType.code}
                onClick={() => onSelect(betType)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  isSelected
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-200 hover:border-primary-300 bg-white'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
                      <span>{betType.name}</span>
                      {betType.hasOrder && (
                        <span className="text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded">
                          Ordre
                        </span>
                      )}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">{betType.description}</p>
                  </div>
                  {isSelected && (
                    <div className="ml-2">
                      <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-4 text-xs text-gray-500 mt-2">
                  <span>
                    {betType.minSelections === betType.maxSelections
                      ? `${betType.minSelections} chevaux`
                      : betType.maxSelections
                      ? `${betType.minSelections}-${betType.maxSelections} chevaux`
                      : `Min. ${betType.minSelections} chevaux`}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Info Box */}
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">À savoir :</p>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Ordre</strong> : L'ordre d'arrivée doit être exact</li>
                <li><strong>Désordre</strong> : L'ordre n'a pas d'importance</li>
                <li><strong>Placé</strong> : Le cheval doit finir dans les 3 premiers</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
