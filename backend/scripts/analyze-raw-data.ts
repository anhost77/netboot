import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function analyzeRawData() {
  console.log('🔍 Analyse des données RAW stockées...\n');

  const perfs = await prisma.pmuHorsePerformance.findMany({
    take: 5,
    orderBy: { date: 'desc' },
  });

  if (perfs.length === 0) {
    console.log('❌ Aucune performance avec rawData trouvée');
    return;
  }

  console.log(`📊 ${perfs.length} performances avec rawData trouvées\n`);

  perfs.forEach((perf, index) => {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`Performance #${index + 1} - ${perf.hippodrome} - ${perf.date.toISOString().split('T')[0]}`);
    console.log('='.repeat(80));
    
    const rawData = perf.rawData as any;
    
    console.log('\n📋 STRUCTURE COMPLÈTE DU rawData:');
    console.log(JSON.stringify(rawData, null, 2));
    
    console.log('\n\n🔑 CHAMPS DISPONIBLES:');
    if (rawData && typeof rawData === 'object') {
      Object.keys(rawData).forEach(key => {
        const value = rawData[key];
        const type = Array.isArray(value) ? `array[${value.length}]` : typeof value;
        const preview = JSON.stringify(value).substring(0, 100);
        console.log(`  - ${key}: ${type} = ${preview}${preview.length >= 100 ? '...' : ''}`);
      });
      
      // Analyser les participants pour voir les données disponibles
      if (rawData.participants && Array.isArray(rawData.participants)) {
        console.log('\n\n👥 DONNÉES DES PARTICIPANTS:');
        const participant = rawData.participants.find((p: any) => p.itsHim === true);
        if (participant) {
          console.log('\nParticipant du cheval (itsHim=true):');
          Object.keys(participant).forEach(key => {
            console.log(`  - ${key}: ${JSON.stringify(participant[key])}`);
          });
        }
      }
    }
  });

  await prisma.$disconnect();
}

analyzeRawData();
