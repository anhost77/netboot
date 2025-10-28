const { PrismaClient } = require('@prisma/client');
const axios = require('axios');

const prisma = new PrismaClient();

async function checkCurrentRaceData() {
  try {
    // Get a recent race from the database
    const race = await prisma.pmuRace.findFirst({
      orderBy: { date: 'desc' },
      include: {
        hippodrome: true,
      },
    });

    if (!race) {
      console.log('❌ No race found in database');
      return;
    }

    console.log('✅ Found race:');
    console.log('Date:', race.date.toISOString().split('T')[0]);
    console.log('Hippodrome:', race.hippodromeCode);
    console.log('Reunion:', race.reunionNumber);
    console.log('Course:', race.raceNumber);

    // Format date for API
    const dateStr = race.date.toISOString().split('T')[0];
    const url = `https://online.turfinfo.api.pmu.fr/rest/client/61/programme/${dateStr}/R${race.reunionNumber}/C${race.raceNumber}/participants`;

    console.log('\n📡 Fetching from PMU API:', url);

    const response = await axios.get(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (response.data && response.data.participants && response.data.participants.length > 0) {
      const participant = response.data.participants[0];
      
      console.log('\n👤 First participant keys:', Object.keys(participant));
      console.log('\n🔍 Checking for trainer fields:');
      console.log('- entraineur:', participant.entraineur);
      console.log('- nomEntraineur:', participant.nomEntraineur);
      console.log('- trainer:', participant.trainer);
      console.log('- driver:', participant.driver);
      console.log('- jockey:', participant.jockey);
      
      console.log('\n📋 Full participant data:');
      console.log(JSON.stringify(participant, null, 2));
    } else {
      console.log('❌ No participants found');
    }
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  } finally {
    await prisma.$disconnect();
  }
}

checkCurrentRaceData();
