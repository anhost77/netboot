const axios = require('axios');

async function checkTodayRaceData() {
  try {
    // Get today's date
    const today = new Date().toISOString().split('T')[0];
    
    console.log('📅 Checking today:', today);
    
    // First, get today's program
    const programUrl = `https://online.turfinfo.api.pmu.fr/rest/client/1/programme/${today}`;
    console.log('📡 Fetching program:', programUrl);
    
    const programResponse = await axios.get(programUrl, {
      headers: { 'Accept': 'application/json' },
    });

    if (!programResponse.data?.programme?.reunions || programResponse.data.programme.reunions.length === 0) {
      console.log('❌ No races today');
      return;
    }

    const reunion = programResponse.data.programme.reunions[0];
    const reunionNumber = reunion.numOfficiel;
    
    if (!reunion.courses || reunion.courses.length === 0) {
      console.log('❌ No courses in first reunion');
      return;
    }

    const course = reunion.courses[0];
    const courseNumber = course.numOrdre;

    console.log(`\n✅ Found race: R${reunionNumber}C${courseNumber} at ${reunion.hippodrome.libelleCourt}`);

    // Get race details which should include participants with trainer info
    const raceUrl = `https://online.turfinfo.api.pmu.fr/rest/client/1/programme/${today}/R${reunionNumber}/C${courseNumber}`;
    console.log('📡 Fetching race details:', raceUrl);

    const raceResponse = await axios.get(raceUrl, {
      headers: { 'Accept': 'application/json' },
    });

    if (raceResponse.data?.participants && raceResponse.data.participants.length > 0) {
      const participant = raceResponse.data.participants[0];
      
      console.log('\n👤 First participant keys:', Object.keys(participant));
      console.log('\n🔍 Checking for trainer fields:');
      console.log('- entraineur:', participant.entraineur);
      console.log('- nomEntraineur:', participant.nomEntraineur);
      console.log('- trainer:', participant.trainer);
      console.log('- driver:', participant.driver);
      console.log('- jockey:', participant.jockey);
      
      console.log('\n📋 Participant structure (first 50 lines):');
      const jsonStr = JSON.stringify(participant, null, 2);
      console.log(jsonStr.split('\n').slice(0, 50).join('\n'));
    } else {
      console.log('❌ No participants found');
    }
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

checkTodayRaceData();
