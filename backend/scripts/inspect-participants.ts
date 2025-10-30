import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { PmuService } from '../src/pmu/pmu.service';

async function inspectParticipants() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const pmuService = app.get(PmuService);

  console.log('🔍 Inspection des PARTICIPANTS d\'une course à venir...\n');

  try {
    // Récupérer le programme d'aujourd'hui
    const today = new Date();
    const program = await pmuService.getProgramByDate(today);
    
    if (!program?.meetings?.[0]?.races?.[0]) {
      console.log('❌ Aucune course trouvée pour aujourd\'hui');
      await app.close();
      return;
    }

    const meeting = program.meetings[0];
    const race = meeting.races[0];
    
    console.log(`📊 Course: ${meeting.hippodrome.name} - R${meeting.number}C${race.number}\n`);
    
    // Récupérer les PARTICIPANTS (pas l'historique)
    const participants = await pmuService.getRaceParticipants(
      today,
      meeting.number,
      race.number
    );
    
    if (participants?.participants?.[0]) {
      const participant = participants.participants[0];
      
      console.log('🐴 STRUCTURE COMPLÈTE D\'UN PARTICIPANT (course à venir):\n');
      console.log(JSON.stringify(participant, null, 2));
      
      console.log('\n\n📋 CHAMPS DISPONIBLES:');
      Object.keys(participant).forEach(key => {
        const value = participant[key];
        const type = Array.isArray(value) ? 'array' : typeof value;
        console.log(`  - ${key}: ${type} = ${JSON.stringify(value).substring(0, 100)}`);
      });

      // Vérifier si on a l'entraîneur
      console.log('\n\n🔍 RECHERCHE DES DONNÉES MANQUANTES:');
      console.log(`  Entraîneur: ${participant.entraineur || participant.trainer || participant.nomEntraineur || 'NON TROUVÉ ❌'}`);
      console.log(`  Éleveur: ${participant.eleveur || participant.breeder || 'NON TROUVÉ ❌'}`);
      console.log(`  Propriétaire: ${participant.proprietaire || participant.owner || 'NON TROUVÉ ❌'}`);
      console.log(`  Âge: ${participant.age || 'NON TROUVÉ ❌'}`);
      console.log(`  Sexe: ${participant.sexe || participant.sex || 'NON TROUVÉ ❌'}`);
    }

    // Récupérer aussi les détails de la course
    console.log('\n\n' + '='.repeat(80));
    console.log('📊 DÉTAILS DE LA COURSE:');
    console.log('='.repeat(80));
    
    const raceDetails = await pmuService.getRaceDetails(
      today,
      meeting.number,
      race.number
    );
    
    console.log('\nChamps disponibles dans raceDetails:');
    if (raceDetails) {
      Object.keys(raceDetails).forEach(key => {
        const value = raceDetails[key];
        const type = Array.isArray(value) ? `array[${value.length}]` : typeof value;
        const preview = JSON.stringify(value).substring(0, 100);
        console.log(`  - ${key}: ${type} = ${preview}${preview.length >= 100 ? '...' : ''}`);
      });
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }

  await app.close();
}

inspectParticipants();
