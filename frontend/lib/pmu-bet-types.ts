/**
 * PMU Bet Types and Nomenclature
 * Format: R{reunion}C{course} {BetType} {Selections}
 * Example: R1C3 2-4-7 (Tiercé)
 */

export interface PMUBetType {
  code: string;
  name: string;
  description: string;
  minSelections: number;
  maxSelections?: number;
  hasOrder: boolean; // Si l'ordre compte (Ordre vs Désordre)
  category: 'simple' | 'couple' | 'trio' | 'multi' | 'special';
}

export const PMU_BET_TYPES: PMUBetType[] = [
  // PARIS SIMPLES
  {
    code: 'SIMPLE_GAGNANT',
    name: 'Simple Gagnant',
    description: 'Trouver le cheval gagnant',
    minSelections: 1,
    maxSelections: 1,
    hasOrder: false,
    category: 'simple',
  },
  {
    code: 'SIMPLE_PLACE',
    name: 'Simple Placé',
    description: 'Trouver un cheval dans les 3 premiers',
    minSelections: 1,
    maxSelections: 1,
    hasOrder: false,
    category: 'simple',
  },
  {
    code: 'SIMPLE_GAGNANT_PLACE',
    name: 'Simple Gagnant et Placé',
    description: 'Combinaison Gagnant + Placé',
    minSelections: 1,
    maxSelections: 1,
    hasOrder: false,
    category: 'simple',
  },

  // COUPLES
  {
    code: 'COUPLE_ORDRE',
    name: 'Couplé Ordre',
    description: 'Trouver les 2 premiers dans l\'ordre',
    minSelections: 2,
    maxSelections: 2,
    hasOrder: true,
    category: 'couple',
  },
  {
    code: 'COUPLE_GAGNANT',
    name: 'Couplé Gagnant',
    description: 'Trouver les 2 premiers sans ordre',
    minSelections: 2,
    maxSelections: 2,
    hasOrder: false,
    category: 'couple',
  },
  {
    code: 'COUPLE_PLACE',
    name: 'Couplé Placé',
    description: 'Trouver 2 chevaux dans les 3 premiers',
    minSelections: 2,
    maxSelections: 2,
    hasOrder: false,
    category: 'couple',
  },

  // TRIOS
  {
    code: 'TRIO_ORDRE',
    name: 'Trio Ordre',
    description: 'Trouver les 3 premiers dans l\'ordre',
    minSelections: 3,
    maxSelections: 3,
    hasOrder: true,
    category: 'trio',
  },
  {
    code: 'TRIO',
    name: 'Trio',
    description: 'Trouver les 3 premiers sans ordre',
    minSelections: 3,
    maxSelections: 3,
    hasOrder: false,
    category: 'trio',
  },

  // PARIS MULTIPLES (TIERCÉ, QUARTÉ, QUINTÉ)
  {
    code: 'TIERCE_ORDRE',
    name: 'Tiercé Ordre',
    description: 'Trouver les 3 premiers dans l\'ordre exact',
    minSelections: 3,
    maxSelections: 3,
    hasOrder: true,
    category: 'multi',
  },
  {
    code: 'TIERCE_DESORDRE',
    name: 'Tiercé Désordre',
    description: 'Trouver les 3 premiers dans le désordre',
    minSelections: 3,
    maxSelections: 3,
    hasOrder: false,
    category: 'multi',
  },
  {
    code: 'QUARTE_ORDRE',
    name: 'Quarté+ Ordre',
    description: 'Trouver les 4 premiers dans l\'ordre exact',
    minSelections: 4,
    maxSelections: 4,
    hasOrder: true,
    category: 'multi',
  },
  {
    code: 'QUARTE_DESORDRE',
    name: 'Quarté+ Désordre',
    description: 'Trouver les 4 premiers dans le désordre',
    minSelections: 4,
    maxSelections: 4,
    hasOrder: false,
    category: 'multi',
  },
  {
    code: 'QUINTE_ORDRE',
    name: 'Quinté+ Ordre',
    description: 'Trouver les 5 premiers dans l\'ordre exact',
    minSelections: 5,
    maxSelections: 5,
    hasOrder: true,
    category: 'multi',
  },
  {
    code: 'QUINTE_DESORDRE',
    name: 'Quinté+ Désordre',
    description: 'Trouver les 5 premiers dans le désordre',
    minSelections: 5,
    maxSelections: 5,
    hasOrder: false,
    category: 'multi',
  },
  {
    code: 'QUINTE_BONUS',
    name: 'Quinté+ Bonus',
    description: 'Trouver 4 des 5 premiers',
    minSelections: 5,
    maxSelections: 5,
    hasOrder: false,
    category: 'multi',
  },

  // PARIS SPÉCIAUX
  {
    code: '2SUR4',
    name: '2sur4',
    description: 'Trouver 2 chevaux parmi les 4 premiers',
    minSelections: 2,
    maxSelections: 2,
    hasOrder: false,
    category: 'special',
  },
  {
    code: 'MULTI',
    name: 'Multi',
    description: 'Trouver 4 chevaux dans les 4 premiers (désordre)',
    minSelections: 4,
    maxSelections: 7,
    hasOrder: false,
    category: 'special',
  },
  {
    code: 'MINI_MULTI',
    name: 'Mini Multi',
    description: 'Version simplifiée du Multi (4 à 6 chevaux)',
    minSelections: 4,
    maxSelections: 6,
    hasOrder: false,
    category: 'special',
  },
  {
    code: 'PICK5',
    name: 'Pick 5',
    description: 'Trouver le gagnant de 5 courses consécutives',
    minSelections: 5,
    maxSelections: 5,
    hasOrder: false,
    category: 'special',
  },
];

/**
 * Format a PMU bet code
 * @param reunion Reunion number (1-9)
 * @param course Course number (1-20)
 * @param selections Array of horse numbers
 * @param betType Type of bet
 * @returns Formatted PMU code (e.g., "R1C3 2-4-7")
 */
export function formatPMUBetCode(
  reunion: number,
  course: number,
  selections: number[],
  betType?: string
): string {
  const raceCode = `R${reunion}C${course}`;
  const selectionsCode = selections.join('-');
  
  if (betType) {
    return `${raceCode} ${betType} ${selectionsCode}`;
  }
  
  return `${raceCode} ${selectionsCode}`;
}

/**
 * Parse a PMU bet code
 * @param code PMU code (e.g., "R1C3 2-4-7" or "R1C3 TIERCE 2-4-7")
 * @returns Parsed components
 */
export function parsePMUBetCode(code: string): {
  reunion: number;
  course: number;
  betType?: string;
  selections: number[];
} | null {
  // Match pattern: R{reunion}C{course} [BetType] {selections}
  const pattern = /R(\d+)C(\d+)\s+(?:([A-Z_]+)\s+)?([0-9-]+)/;
  const match = code.match(pattern);
  
  if (!match) return null;
  
  const [, reunion, course, betType, selectionsStr] = match;
  const selections = selectionsStr.split('-').map(Number);
  
  return {
    reunion: parseInt(reunion),
    course: parseInt(course),
    betType: betType || undefined,
    selections,
  };
}

/**
 * Get bet type by code
 */
export function getBetTypeByCode(code: string): PMUBetType | undefined {
  return PMU_BET_TYPES.find(bt => bt.code === code);
}

/**
 * Get bet types by category
 */
export function getBetTypesByCategory(category: PMUBetType['category']): PMUBetType[] {
  return PMU_BET_TYPES.filter(bt => bt.category === category);
}

/**
 * Validate selections for a bet type
 */
export function validateSelections(betTypeCode: string, selections: number[]): {
  valid: boolean;
  error?: string;
} {
  const betType = getBetTypeByCode(betTypeCode);
  
  if (!betType) {
    return { valid: false, error: 'Type de pari invalide' };
  }
  
  if (selections.length < betType.minSelections) {
    return {
      valid: false,
      error: `Minimum ${betType.minSelections} sélection(s) requise(s)`,
    };
  }
  
  if (betType.maxSelections && selections.length > betType.maxSelections) {
    return {
      valid: false,
      error: `Maximum ${betType.maxSelections} sélection(s) autorisée(s)`,
    };
  }
  
  // Check for duplicates
  const uniqueSelections = new Set(selections);
  if (uniqueSelections.size !== selections.length) {
    return { valid: false, error: 'Sélections en double détectées' };
  }
  
  return { valid: true };
}

/**
 * Calculate number of combinations
 */
export function calculateCombinations(betTypeCode: string, selections: number[]): number {
  const betType = getBetTypeByCode(betTypeCode);
  if (!betType) return 0;
  
  const n = selections.length;
  const k = betType.minSelections;
  
  if (n < k) return 0;
  
  // For ordered bets: P(n,k) = n!/(n-k)!
  if (betType.hasOrder) {
    let result = 1;
    for (let i = 0; i < k; i++) {
      result *= (n - i);
    }
    return result;
  }
  
  // For unordered bets: C(n,k) = n!/(k!(n-k)!)
  let result = 1;
  for (let i = 0; i < k; i++) {
    result *= (n - i);
    result /= (i + 1);
  }
  return result;
}

/**
 * Format selections display
 */
export function formatSelectionsDisplay(selections: number[], hasOrder: boolean): string {
  if (hasOrder) {
    return selections.join(' → '); // Arrow for ordered
  }
  return selections.join(' - '); // Dash for unordered
}
