/**
 * Utility functions for bankroll management
 */

export type BankrollMode = 'immediate' | 'on_loss';

/**
 * Get the current bankroll mode preference from API
 * Note: This is an async function now. Use userSettingsAPI.getSettings() directly
 * or maintain the mode in component state after loading.
 * 
 * For backward compatibility, this returns 'immediate' as default.
 * Components should load the actual value from the API on mount.
 */
export function getBankrollModeSync(): BankrollMode {
  // This is now a synchronous fallback only
  // Components should use the API to get the actual value
  return 'immediate';
}

/**
 * Calculate bankroll change based on the selected mode
 * 
 * @param mode - The bankroll mode ('immediate' or 'on_loss')
 * @param action - The action being performed ('create', 'win', 'lose')
 * @param stake - The bet stake amount
 * @param payout - The payout amount (for wins)
 * @returns The amount to add/subtract from bankroll
 */
export function calculateBankrollChange(
  mode: BankrollMode,
  action: 'create' | 'win' | 'lose',
  stake: number,
  payout?: number
): number {
  if (mode === 'immediate') {
    // Immediate deduction mode
    switch (action) {
      case 'create':
        return -stake; // Deduct stake immediately
      case 'win':
        return payout || 0; // Add payout (stake already deducted)
      case 'lose':
        return 0; // Nothing to do (stake already deducted)
      default:
        return 0;
    }
  } else {
    // On loss deduction mode
    switch (action) {
      case 'create':
        return 0; // Don't deduct on creation
      case 'win':
        return (payout || 0) - stake; // Add profit (payout - stake)
      case 'lose':
        return -stake; // Deduct stake on loss
      default:
        return 0;
    }
  }
}

/**
 * Get a description of the bankroll mode
 */
export function getBankrollModeDescription(mode: BankrollMode): string {
  if (mode === 'immediate') {
    return 'Déduction immédiate : La mise est déduite dès la création du pari';
  } else {
    return 'Déduction à la perte : La mise est déduite uniquement si le pari est perdu';
  }
}
