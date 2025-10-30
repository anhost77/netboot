import { PrismaClient } from '@prisma/client';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { PmuDailySyncService } from '../src/pmu/pmu-daily-sync.service';

const prisma = new PrismaClient();

async function enrichHistoricalData() {
  console.log('🔄 Enrichissement des données historiques...\n');

  const app = await NestFactory.createApplicationContext(AppModule);
  const syncService = app.get(PmuDailySyncService);

  // Récupérer toutes les dates uniques des performances
  const performances = await prisma.pmuHorsePerformance.findMany({
    select: {
      date: true,
    },
    distinct: ['date'],
    orderBy: {
      date: 'desc',
    },
  });

  const uniqueDates = [...new Set(performances.map(p => p.date.toISOString().split('T')[0]))];
  
  console.log(`📅 ${uniqueDates.length} dates uniques trouvées dans l'historique\n`);
  console.log(`📊 Dates à synchroniser (du plus récent au plus ancien):\n`);
  
  // Limiter aux 30 derniers jours pour commencer
  const datesToSync = uniqueDates.slice(0, 30);
  
  datesToSync.forEach((date, index) => {
    console.log(`  ${index + 1}. ${date}`);
  });

  console.log(`\n⚠️  Pour éviter de surcharger l'API PMU, on va synchroniser ${datesToSync.length} dates`);
  console.log(`⏱️  Temps estimé: ${datesToSync.length * 2} minutes (avec délais)\n`);

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < datesToSync.length; i++) {
    const dateStr = datesToSync[i];
    const date = new Date(dateStr);
    
    console.log(`\n[${ i + 1}/${datesToSync.length}] 🔄 Synchronisation de ${dateStr}...`);
    
    try {
      await syncService.syncProgramForDate(date);
      successCount++;
      console.log(`  ✅ ${dateStr} synchronisé avec succès`);
      
      // Délai de 2 secondes entre chaque date pour ne pas surcharger l'API
      if (i < datesToSync.length - 1) {
        console.log(`  ⏳ Pause de 2 secondes...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      errorCount++;
      console.error(`  ❌ Erreur pour ${dateStr}: ${error.message}`);
    }
  }

  console.log(`\n\n${'='.repeat(80)}`);
  console.log('📊 RÉSUMÉ');
  console.log('='.repeat(80));
  console.log(`✅ Succès: ${successCount}/${datesToSync.length}`);
  console.log(`❌ Erreurs: ${errorCount}/${datesToSync.length}`);
  
  // Vérifier les stats après enrichissement
  const totalHorses = await prisma.pmuHorse.count();
  const withAge = await prisma.pmuHorse.count({ where: { age: { not: null } } });
  const withSex = await prisma.pmuHorse.count({ where: { sex: { not: null } } });
  const withJockey = await prisma.pmuHorse.count({ where: { jockey: { not: null } } });
  const withTrainer = await prisma.pmuHorse.count({ where: { trainer: { not: null } } });

  console.log(`\n📈 STATISTIQUES APRÈS ENRICHISSEMENT:`);
  console.log(`Total chevaux: ${totalHorses}`);
  console.log(`Avec âge: ${withAge} (${Math.round(withAge/totalHorses*100)}%)`);
  console.log(`Avec sexe: ${withSex} (${Math.round(withSex/totalHorses*100)}%)`);
  console.log(`Avec jockey: ${withJockey} (${Math.round(withJockey/totalHorses*100)}%)`);
  console.log(`Avec entraîneur: ${withTrainer} (${Math.round(withTrainer/totalHorses*100)}%)`);

  await app.close();
  await prisma.$disconnect();
}

enrichHistoricalData();
