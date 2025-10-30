import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { PmuService } from '../src/pmu/pmu.service';

async function inspectPmuData() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const pmuService = app.get(PmuService);

  // Prendre une course récente (aujourd'hui ou hier)
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  try {
    console.log('🔍 Inspection des données PMU...\n');
    
    // Récupérer le programme d'hier
    const program = await pmuService.getProgramByDate(yesterday);
    
    if (program?.meetings?.[0]?.races?.[0]) {
      const meeting = program.meetings[0];
      const race = meeting.races[0];
      
      console.log(`📊 Course: ${meeting.hippodrome.name} - R${meeting.number}C${race.number}\n`);
      
      // Récupérer les performances détaillées
      const performances = await pmuService.getRacePerformances(
        yesterday,
        meeting.number,
        race.number
      );
      
      if (performances?.participants?.[0]) {
        const participant = performances.participants[0];
        
        console.log('🐴 STRUCTURE COMPLÈTE D\'UN PARTICIPANT:\n');
        console.log(JSON.stringify(participant, null, 2));
        
        console.log('\n\n📋 CHAMPS DISPONIBLES:');
        Object.keys(participant).forEach(key => {
          const value = participant[key];
          const type = Array.isArray(value) ? 'array' : typeof value;
          console.log(`  - ${key}: ${type} = ${JSON.stringify(value).substring(0, 100)}`);
        });
      }
    }
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }

  await app.close();
}

inspectPmuData();
