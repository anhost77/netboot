import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixBetProfits() {
  console.log('🔍 Diagnostic des profits des paris...\n');

  // 1. Compter les paris avec/sans profit
  const allBets = await prisma.bet.findMany({
    where: {
      status: { in: ['won', 'lost'] },
    },
    select: {
      id: true,
      date: true,
      platform: true,
      stake: true,
      payout: true,
      profit: true,
      status: true,
    },
  });

  let betsWithoutProfit = 0;
  let betsWithIncorrectProfit = 0;
  const betsToFix: any[] = [];

  for (const bet of allBets) {
    const stake = Number(bet.stake);
    const payout = bet.payout ? Number(bet.payout) : 0;
    const currentProfit = bet.profit ? Number(bet.profit) : null;

    let expectedProfit: number;
    if (bet.status === 'won' && bet.payout) {
      expectedProfit = payout - stake;
    } else if (bet.status === 'lost') {
      expectedProfit = -stake;
    } else {
      continue;
    }

    if (currentProfit === null) {
      betsWithoutProfit++;
      betsToFix.push({ ...bet, expectedProfit });
    } else if (Math.abs(currentProfit - expectedProfit) > 0.01) {
      betsWithIncorrectProfit++;
      betsToFix.push({ ...bet, expectedProfit, currentProfit });
    }
  }

  console.log(`📊 Résultats du diagnostic:`);
  console.log(`   Total de paris gagnés/perdus: ${allBets.length}`);
  console.log(`   Paris sans profit: ${betsWithoutProfit}`);
  console.log(`   Paris avec profit incorrect: ${betsWithIncorrectProfit}`);
  console.log(`   Paris à corriger: ${betsToFix.length}\n`);

  if (betsToFix.length === 0) {
    console.log('✅ Tous les profits sont corrects !');
    return;
  }

  // Afficher quelques exemples
  console.log('📋 Exemples de paris à corriger:');
  betsToFix.slice(0, 5).forEach((bet) => {
    console.log(`   - ${bet.date.toISOString().split('T')[0]} | ${bet.platform || 'N/A'} | Mise: ${bet.stake}€ | Status: ${bet.status}`);
    console.log(`     Profit actuel: ${bet.currentProfit !== undefined ? bet.currentProfit + '€' : 'NULL'} → Attendu: ${bet.expectedProfit}€`);
  });

  // Demander confirmation
  console.log(`\n⚠️  Voulez-vous corriger ces ${betsToFix.length} paris ? (y/n)`);
  
  // Pour l'exécution automatique, décommenter la ligne suivante:
  // const shouldFix = true;
  
  // Pour l'instant, on affiche juste le diagnostic
  console.log('\n💡 Pour corriger automatiquement, exécutez:');
  console.log('   npx ts-node src/bets/fix-profits.script.ts --fix\n');

  // Si l'argument --fix est passé, on corrige
  if (process.argv.includes('--fix')) {
    console.log('🔧 Correction en cours...\n');
    
    let fixed = 0;
    for (const bet of betsToFix) {
      try {
        await prisma.bet.update({
          where: { id: bet.id },
          data: { profit: bet.expectedProfit },
        });
        fixed++;
        if (fixed % 10 === 0) {
          console.log(`   Corrigé ${fixed}/${betsToFix.length}...`);
        }
      } catch (error) {
        console.error(`   ❌ Erreur pour le pari ${bet.id}:`, error.message);
      }
    }

    console.log(`\n✅ ${fixed} paris corrigés avec succès !`);

    // Vérification finale
    const verification = await prisma.bet.aggregate({
      where: {
        status: { in: ['won', 'lost'] },
      },
      _sum: {
        profit: true,
        stake: true,
      },
    });

    console.log(`\n📈 Statistiques après correction:`);
    console.log(`   Profit total: ${verification._sum.profit?.toFixed(2) || 0}€`);
    console.log(`   Mise totale: ${verification._sum.stake?.toFixed(2) || 0}€`);
  }
}

fixBetProfits()
  .catch((error) => {
    console.error('❌ Erreur:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
