const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debug() {
  console.log('🔍 Debug API - Recherche de IGOR...\n');
  
  // Simulate what the API does
  const allHorsesWithSameName = await prisma.pmuHorse.findMany({
    where: { name: 'IGOR' },
    include: {
      performances: {
        orderBy: { date: 'desc' },
      },
    },
  });

  console.log('Chevaux trouvés:', allHorsesWithSameName.length);
  
  if (allHorsesWithSameName.length > 0) {
    const allPerformances = allHorsesWithSameName.flatMap(h => h.performances);
    console.log('Total performances:', allPerformances.length);
    
    if (allPerformances.length > 0) {
      const firstPerf = allPerformances[0];
      console.log('\n📊 Première performance:');
      console.log('  Date:', new Date(firstPerf.date).toLocaleDateString('fr-FR'));
      console.log('  Hippodrome:', firstPerf.hippodrome);
      console.log('  rawData type:', typeof firstPerf.rawData);
      console.log('  rawData is null?', firstPerf.rawData === null);
      
      if (firstPerf.rawData) {
        console.log('  rawData keys:', Object.keys(firstPerf.rawData));
        
        if (firstPerf.rawData.participants) {
          console.log('  ✅ Participants:', firstPerf.rawData.participants.length);
          console.log('\n  Top 3:');
          firstPerf.rawData.participants.slice(0, 3).forEach((c, i) => {
            console.log(`    ${i + 1}. ${c.place?.place || '?'}. ${c.nomCheval}`);
          });
        } else {
          console.log('  ❌ Pas de participants dans rawData');
        }
      } else {
        console.log('  ❌ rawData est null');
      }
      
      // Test what the API returns
      console.log('\n🔧 Ce que l\'API retournerait:');
      const rawDataObj = firstPerf.rawData;
      const apiResponse = {
        competitors: rawDataObj?.participants || [],
      };
      console.log('  Competitors length:', apiResponse.competitors.length);
    }
  }

  await prisma.$disconnect();
}

debug();
