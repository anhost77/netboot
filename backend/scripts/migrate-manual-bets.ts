import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateManualBets() {
  console.log('🔄 Starting migration of manual bets...\n');

  try {
    // 1. Trouver tous les paris en attente avec une plateforme
    const pendingBets = await prisma.bet.findMany({
      where: {
        status: 'pending',
        platformId: { not: null },
      },
      include: {
        bettingPlatform: true,
      },
    });

    console.log(`📊 Found ${pendingBets.length} pending bets with platform\n`);

    let updated = 0;
    let skipped = 0;

    for (const bet of pendingBets) {
      if (!bet.bettingPlatform) {
        console.log(`⚠️  Bet ${bet.id} has platformId but no platform found`);
        skipped++;
        continue;
      }

      // Si la plateforme n'est pas PMU, marquer pour mise à jour manuelle
      if (bet.bettingPlatform.platformType !== 'PMU') {
        await prisma.bet.update({
          where: { id: bet.id },
          data: { requiresManualUpdate: true },
        });

        console.log(`✅ Updated bet ${bet.id} (${bet.bettingPlatform.name}) - requiresManualUpdate = true`);
        updated++;
      } else {
        console.log(`ℹ️  Skipped bet ${bet.id} (${bet.bettingPlatform.name}) - PMU platform`);
        skipped++;
      }
    }

    console.log('\n📈 Migration Summary:');
    console.log(`   Total bets processed: ${pendingBets.length}`);
    console.log(`   Updated (manual): ${updated}`);
    console.log(`   Skipped (PMU): ${skipped}`);

    // 2. Afficher les statistiques
    console.log('\n📊 Current Statistics:');
    
    const stats = await prisma.bet.groupBy({
      by: ['status'],
      where: {
        requiresManualUpdate: true,
      },
      _count: true,
    });

    console.log('   Bets requiring manual update:');
    stats.forEach(stat => {
      console.log(`     - ${stat.status}: ${stat._count}`);
    });

  } catch (error) {
    console.error('❌ Error during migration:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter la migration
migrateManualBets()
  .then(() => {
    console.log('\n✅ Migration completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  });
