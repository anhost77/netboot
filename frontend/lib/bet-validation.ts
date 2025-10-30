/**
 * Validation et vérification des paris hippiques
 */

export interface BetValidationResult {
  isWon: boolean;
  message: string;
  winningHorses?: number[];
  selectedHorses?: number[];
}

/**
 * Vérifie si un pari est gagné selon le type de pari et les résultats de la course
 */
export function checkBetWin(
  betType: string,
  selectedHorses: string, // Ex: "7,5,12"
  raceResults: any // Objet race avec horses et leurs arrivalOrder
): BetValidationResult {
  if (!raceResults || !raceResults.horses) {
    return {
      isWon: false,
      message: 'Résultats de la course non disponibles',
    };
  }

  // Parser les chevaux sélectionnés
  const selected = selectedHorses
    .split(',')
    .map(h => parseInt(h.trim()))
    .filter(n => !isNaN(n));

  // Récupérer les chevaux arrivés dans l'ordre
  const arrivedHorses = raceResults.horses
    .filter((h: any) => h.arrivalOrder && h.arrivalOrder > 0)
    .sort((a: any, b: any) => a.arrivalOrder - b.arrivalOrder)
    .map((h: any) => h.number);

  if (arrivedHorses.length === 0) {
    return {
      isWon: false,
      message: 'Résultats de la course non disponibles',
    };
  }

  const result: BetValidationResult = {
    isWon: false,
    message: '',
    winningHorses: arrivedHorses.slice(0, 5),
    selectedHorses: selected,
  };

  switch (betType.toLowerCase()) {
    // SIMPLE GAGNANT
    case 'gagnant':
    case 'simple_gagnant':
      result.isWon = selected.length === 1 && selected[0] === arrivedHorses[0];
      result.message = result.isWon
        ? `✅ Votre cheval ${selected[0]} a gagné !`
        : `❌ Votre cheval ${selected[0]} n'a pas gagné. Gagnant : ${arrivedHorses[0]}`;
      break;

    // SIMPLE PLACÉ
    case 'place':
    case 'simple_place':
      const top3 = arrivedHorses.slice(0, 3);
      result.isWon = selected.length === 1 && top3.includes(selected[0]);
      result.message = result.isWon
        ? `✅ Votre cheval ${selected[0]} est dans les 3 premiers !`
        : `❌ Votre cheval ${selected[0]} n'est pas dans les 3 premiers. Podium : ${top3.join(', ')}`;
      break;

    // GAGNANT-PLACÉ (combinaison gagnant + placé)
    case 'gagnant_place':
      const isWinner = selected.length === 1 && selected[0] === arrivedHorses[0];
      const top3GP = arrivedHorses.slice(0, 3);
      const isPlaced = selected.length === 1 && top3GP.includes(selected[0]);
      result.isWon = isWinner || isPlaced;
      result.message = isWinner
        ? `✅ Votre cheval ${selected[0]} a gagné ! (Gagnant + Placé)`
        : isPlaced
        ? `✅ Votre cheval ${selected[0]} est placé (dans les 3 premiers)`
        : `❌ Votre cheval ${selected[0]} n'est ni gagnant ni placé. Podium : ${top3GP.join(', ')}`;
      break;

    // COUPLÉ GAGNANT
    case 'couple_gagnant':
      const top2 = arrivedHorses.slice(0, 2);
      const hasAll2 = selected.every(h => top2.includes(h));
      result.isWon = selected.length === 2 && hasAll2;
      result.message = result.isWon
        ? `✅ Vos chevaux ${selected.join('-')} sont les 2 premiers !`
        : `❌ Vos chevaux ${selected.join('-')} ne sont pas les 2 premiers. Arrivée : ${top2.join('-')}`;
      break;

    // COUPLÉ PLACÉ
    case 'couple_place':
      const top3ForCouple = arrivedHorses.slice(0, 3);
      const hasAll2InTop3 = selected.every(h => top3ForCouple.includes(h));
      result.isWon = selected.length === 2 && hasAll2InTop3;
      result.message = result.isWon
        ? `✅ Vos chevaux ${selected.join('-')} sont dans les 3 premiers !`
        : `❌ Vos chevaux ${selected.join('-')} ne sont pas tous dans les 3 premiers. Podium : ${top3ForCouple.join(', ')}`;
      break;

    // COUPLÉ ORDRE
    case 'couple_ordre':
      result.isWon = selected.length === 2 && selected[0] === arrivedHorses[0] && selected[1] === arrivedHorses[1];
      result.message = result.isWon
        ? `✅ Vos chevaux ${selected.join('-')} sont arrivés dans l'ordre !`
        : `❌ Vos chevaux ${selected.join('-')} ne sont pas arrivés dans l'ordre. Arrivée : ${arrivedHorses[0]}-${arrivedHorses[1]}`;
      break;

    // TRIO
    case 'trio':
      const top3Trio = arrivedHorses.slice(0, 3);
      const hasAll3 = selected.every(h => top3Trio.includes(h));
      result.isWon = selected.length === 3 && hasAll3;
      result.message = result.isWon
        ? `✅ Vos chevaux ${selected.join('-')} sont les 3 premiers !`
        : `❌ Vos chevaux ${selected.join('-')} ne sont pas tous dans les 3 premiers. Arrivée : ${top3Trio.join('-')}`;
      break;

    // TRIO ORDRE
    case 'trio_ordre':
      result.isWon = selected.length === 3 && 
                     selected[0] === arrivedHorses[0] && 
                     selected[1] === arrivedHorses[1] && 
                     selected[2] === arrivedHorses[2];
      result.message = result.isWon
        ? `✅ Vos chevaux ${selected.join('-')} sont arrivés dans l'ordre !`
        : `❌ Vos chevaux ${selected.join('-')} ne sont pas arrivés dans l'ordre. Arrivée : ${arrivedHorses.slice(0, 3).join('-')}`;
      break;

    // TIERCÉ
    case 'tierce':
    case 'tiercé':
      const top3Tierce = arrivedHorses.slice(0, 3);
      const hasAll3Tierce = selected.every(h => top3Tierce.includes(h));
      result.isWon = selected.length === 3 && hasAll3Tierce;
      result.message = result.isWon
        ? `✅ Vos chevaux ${selected.join('-')} sont les 3 premiers !`
        : `❌ Vos chevaux ${selected.join('-')} ne sont pas tous dans les 3 premiers. Arrivée : ${top3Tierce.join('-')}`;
      break;

    // QUARTÉ+
    case 'quarte':
    case 'quarte_plus':
      const top4 = arrivedHorses.slice(0, 4);
      const hasAll4 = selected.every(h => top4.includes(h));
      result.isWon = selected.length === 4 && hasAll4;
      result.message = result.isWon
        ? `✅ Vos chevaux ${selected.join('-')} sont les 4 premiers !`
        : `❌ Vos chevaux ${selected.join('-')} ne sont pas tous dans les 4 premiers. Arrivée : ${top4.join('-')}`;
      break;

    // QUINTÉ+
    case 'quinte':
    case 'quinte_plus':
      const top5 = arrivedHorses.slice(0, 5);
      const hasAll5 = selected.every(h => top5.includes(h));
      result.isWon = selected.length === 5 && hasAll5;
      result.message = result.isWon
        ? `✅ Vos chevaux ${selected.join('-')} sont les 5 premiers !`
        : `❌ Vos chevaux ${selected.join('-')} ne sont pas tous dans les 5 premiers. Arrivée : ${top5.join('-')}`;
      break;

    // 2SUR4
    case 'deux_sur_quatre':
    case '2sur4':
      const top4For2sur4 = arrivedHorses.slice(0, 4);
      const hasAll2InTop4 = selected.every(h => top4For2sur4.includes(h));
      result.isWon = selected.length === 2 && hasAll2InTop4;
      result.message = result.isWon
        ? `✅ Vos chevaux ${selected.join('-')} sont dans les 4 premiers !`
        : `❌ Vos chevaux ${selected.join('-')} ne sont pas tous dans les 4 premiers. Arrivée : ${top4For2sur4.join('-')}`;
      break;

    // MULTI
    case 'multi':
    case 'mini_multi':
      const top4Multi = arrivedHorses.slice(0, 4);
      const allInTop4 = selected.every(h => top4Multi.includes(h));
      result.isWon = selected.length >= 4 && selected.length <= 7 && allInTop4;
      result.message = result.isWon
        ? `✅ Tous vos chevaux (${selected.join('-')}) sont dans les 4 premiers !`
        : `❌ Tous vos chevaux ne sont pas dans les 4 premiers. Arrivée : ${top4Multi.join('-')}`;
      break;

    // PICK 5
    case 'pick5':
      const top5Pick = arrivedHorses.slice(0, 5);
      const hasAll5Pick = selected.every(h => top5Pick.includes(h));
      result.isWon = selected.length === 5 && hasAll5Pick;
      result.message = result.isWon
        ? `✅ Vos chevaux ${selected.join('-')} sont les 5 premiers !`
        : `❌ Vos chevaux ${selected.join('-')} ne sont pas tous dans les 5 premiers. Arrivée : ${top5Pick.join('-')}`;
      break;

    // SUPER 4 (ordre exact requis)
    case 'super4':
      result.isWon = selected.length === 4 && 
                     selected[0] === arrivedHorses[0] && 
                     selected[1] === arrivedHorses[1] && 
                     selected[2] === arrivedHorses[2] && 
                     selected[3] === arrivedHorses[3];
      result.message = result.isWon
        ? `✅ Vos chevaux ${selected.join('-')} sont arrivés dans l'ordre exact !`
        : `❌ Vos chevaux ${selected.join('-')} ne sont pas arrivés dans l'ordre exact. Arrivée : ${arrivedHorses.slice(0, 4).join('-')}`;
      break;

    // TRIO BONUS
    case 'trio_bonus':
      const top3Bonus = arrivedHorses.slice(0, 3);
      const has2Of3 = selected.filter(h => top3Bonus.includes(h)).length >= 2;
      result.isWon = selected.length === 3 && has2Of3;
      result.message = result.isWon
        ? `✅ Au moins 2 de vos chevaux sont dans les 3 premiers !`
        : `❌ Moins de 2 de vos chevaux sont dans les 3 premiers. Arrivée : ${top3Bonus.join('-')}`;
      break;

    // QUARTÉ+ BONUS
    case 'quarte_bonus':
      const top4Bonus = arrivedHorses.slice(0, 4);
      const has3Of4 = selected.filter(h => top4Bonus.includes(h)).length >= 3;
      result.isWon = selected.length === 4 && has3Of4;
      result.message = result.isWon
        ? `✅ Au moins 3 de vos chevaux sont dans les 4 premiers !`
        : `❌ Moins de 3 de vos chevaux sont dans les 4 premiers. Arrivée : ${top4Bonus.join('-')}`;
      break;

    // TIERCÉ ORDRE
    case 'tierce_ordre':
      result.isWon = selected.length === 3 && 
                     selected[0] === arrivedHorses[0] && 
                     selected[1] === arrivedHorses[1] && 
                     selected[2] === arrivedHorses[2];
      result.message = result.isWon
        ? `✅ Vos chevaux ${selected.join('-')} sont arrivés dans l'ordre !`
        : `❌ Vos chevaux ${selected.join('-')} ne sont pas arrivés dans l'ordre. Arrivée : ${arrivedHorses.slice(0, 3).join('-')}`;
      break;

    // QUARTÉ+ ORDRE
    case 'quarte_ordre':
      result.isWon = selected.length === 4 && 
                     selected[0] === arrivedHorses[0] && 
                     selected[1] === arrivedHorses[1] && 
                     selected[2] === arrivedHorses[2] && 
                     selected[3] === arrivedHorses[3];
      result.message = result.isWon
        ? `✅ Vos chevaux ${selected.join('-')} sont arrivés dans l'ordre !`
        : `❌ Vos chevaux ${selected.join('-')} ne sont pas arrivés dans l'ordre. Arrivée : ${arrivedHorses.slice(0, 4).join('-')}`;
      break;

    // QUINTÉ+ ORDRE
    case 'quinte_ordre':
      result.isWon = selected.length === 5 && 
                     selected[0] === arrivedHorses[0] && 
                     selected[1] === arrivedHorses[1] && 
                     selected[2] === arrivedHorses[2] && 
                     selected[3] === arrivedHorses[3] && 
                     selected[4] === arrivedHorses[4];
      result.message = result.isWon
        ? `✅ Vos chevaux ${selected.join('-')} sont arrivés dans l'ordre !`
        : `❌ Vos chevaux ${selected.join('-')} ne sont pas arrivés dans l'ordre. Arrivée : ${arrivedHorses.slice(0, 5).join('-')}`;
      break;

    default:
      result.message = `Type de pari "${betType}" non reconnu`;
  }

  return result;
}

/**
 * Obtient le nombre de chevaux requis pour un type de pari
 */
export function getRequiredHorsesCount(betType: string): { min: number; max: number } {
  switch (betType.toLowerCase()) {
    case 'gagnant':
    case 'place':
    case 'simple_gagnant':
    case 'simple_place':
    case 'gagnant_place':
      return { min: 1, max: 1 };
    
    case 'couple_gagnant':
    case 'couple_place':
    case 'couple_ordre':
    case 'deux_sur_quatre':
    case '2sur4':
      return { min: 2, max: 2 };
    
    case 'trio':
    case 'trio_ordre':
    case 'trio_bonus':
    case 'tierce':
    case 'tiercé':
    case 'tierce_ordre':
      return { min: 3, max: 3 };
    
    case 'quarte':
    case 'quarte_plus':
    case 'quarte_ordre':
    case 'quarte_bonus':
    case 'super4':
      return { min: 4, max: 4 };
    
    case 'quinte':
    case 'quinte_plus':
    case 'quinte_ordre':
    case 'pick5':
      return { min: 5, max: 5 };
    
    case 'multi':
    case 'mini_multi':
      return { min: 4, max: 7 };
    
    default:
      return { min: 1, max: 20 };
  }
}
