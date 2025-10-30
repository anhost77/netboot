import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { LeTrotService } from '../src/pmu/letrot.service';

async function testLeTrotApi() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const leTrotService = app.get(LeTrotService);

  console.log('🐴 Test de l\'API Le Trot...\n');

  // Tester avec quelques noms de chevaux connus
  const testHorses = ['BOLD EAGLE', 'FACE TIME BOURBON', 'DAVIDSON DU PONT'];

  for (const horseName of testHorses) {
    console.log(`\n📊 Recherche: ${horseName}`);
    console.log('='.repeat(50));
    
    const enrichedData = await leTrotService.enrichHorseData(horseName);
    
    if (enrichedData) {
      console.log('✅ Données trouvées:');
      console.log(JSON.stringify(enrichedData, null, 2));
    } else {
      console.log('❌ Aucune donnée trouvée');
    }
    
    // Petit délai pour ne pas surcharger l'API
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  await app.close();
}

testLeTrotApi();
