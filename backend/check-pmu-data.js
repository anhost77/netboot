const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkPmuData() {
  try {
    // Get one performance with raw data
    const performance = await prisma.pmuHorsePerformance.findFirst({
      where: {
        jockey: { not: null },
        rawData: { not: null },
      },
    });

    if (!performance) {
      console.log('❌ No performance data found');
      return;
    }

    console.log('✅ Performance found:');
    console.log('ID:', performance.id);
    console.log('Date:', performance.date);
    console.log('Jockey:', performance.jockey);
    console.log('Trainer:', performance.trainer);
    console.log('\n📊 Raw Data Structure:');
    
    const rawData = performance.rawData;
    console.log('Keys in rawData:', Object.keys(rawData));
    
    if (rawData.participants && rawData.participants.length > 0) {
      console.log('\n👤 First participant keys:', Object.keys(rawData.participants[0]));
      console.log('\n🔍 Checking for trainer fields:');
      const participant = rawData.participants[0];
      console.log('- nomEntraineur:', participant.nomEntraineur);
      console.log('- entraineur:', participant.entraineur);
      console.log('- trainer:', participant.trainer);
      console.log('- nomJockey:', participant.nomJockey);
      
      console.log('\n📋 All participant data:');
      console.log(JSON.stringify(participant, null, 2));
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkPmuData();
