const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  // Find a performance with rawData
  const perf = await prisma.pmuHorsePerformance.findFirst({
    where: { rawData: { not: null } },
    include: { horse: true },
  });

  if (perf) {
    console.log('✅ Cheval:', perf.horse.name);
    console.log('📍 Hippodrome:', perf.hippodrome);
    console.log('📅 Date:', new Date(perf.date).toLocaleDateString('fr-FR'));
    
    const rawData = perf.rawData;
    if (rawData && typeof rawData === 'object' && 'participants' in rawData) {
      console.log('👥 Competitors:', rawData.participants.length);
      console.log('\nPremiers concurrents:');
      rawData.participants.slice(0, 5).forEach((c, i) => {
        console.log(`  ${i + 1}. ${c.place?.place || '?'}. ${c.nomCheval} (${c.nomJockey})`);
      });
    } else {
      console.log('❌ Pas de participants dans rawData');
    }
  } else {
    console.log('❌ Aucune performance avec rawData trouvée');
  }

  await prisma.$disconnect();
}

test();
