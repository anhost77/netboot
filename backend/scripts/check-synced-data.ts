import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkSyncedData() {
  console.log('🔍 Vérification des données synchronisées...\n');

  // Récupérer les chevaux les plus récents
  const recentHorses = await prisma.pmuHorse.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: {
      race: {
        include: {
          hippodrome: true,
        },
      },
    },
  });

  console.log(`📊 ${recentHorses.length} chevaux récents trouvés\n`);

  recentHorses.forEach((horse, index) => {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`Cheval #${index + 1}: ${horse.name}`);
    console.log('='.repeat(80));
    console.log(`  Course: ${horse.race.hippodrome.name} - R${horse.race.reunionNumber}C${horse.race.raceNumber}`);
    console.log(`  Date: ${horse.race.date.toISOString().split('T')[0]}`);
    console.log(`  Numéro: ${horse.number}`);
    console.log(`\n  📋 DONNÉES ENREGISTRÉES:`);
    console.log(`    Âge: ${horse.age || 'NULL ❌'}`);
    console.log(`    Sexe: ${horse.sex || 'NULL ❌'}`);
    console.log(`    Jockey: ${horse.jockey || 'NULL ❌'}`);
    console.log(`    Entraîneur: ${horse.trainer || 'NULL ❌'}`);
    console.log(`    Poids: ${horse.weight || 'NULL ❌'}`);
    console.log(`    Gains carrière: ${horse.totalEarnings || 'NULL ❌'}`);
    console.log(`    Nb courses: ${horse.careerStarts || 'NULL ❌'}`);
    console.log(`    Nb victoires: ${horse.careerWins || 'NULL ❌'}`);
    console.log(`    Musique: ${horse.recentForm || 'NULL ❌'}`);
  });

  // Stats globales
  const total = await prisma.pmuHorse.count();
  const withAge = await prisma.pmuHorse.count({ where: { age: { not: null } } });
  const withSex = await prisma.pmuHorse.count({ where: { sex: { not: null } } });
  const withJockey = await prisma.pmuHorse.count({ where: { jockey: { not: null } } });
  const withTrainer = await prisma.pmuHorse.count({ where: { trainer: { not: null } } });

  console.log('\n\n' + '='.repeat(80));
  console.log('📈 STATISTIQUES GLOBALES');
  console.log('='.repeat(80));
  console.log(`Total chevaux: ${total}`);
  console.log(`Avec âge: ${withAge} (${Math.round(withAge/total*100)}%)`);
  console.log(`Avec sexe: ${withSex} (${Math.round(withSex/total*100)}%)`);
  console.log(`Avec jockey: ${withJockey} (${Math.round(withJockey/total*100)}%)`);
  console.log(`Avec entraîneur: ${withTrainer} (${Math.round(withTrainer/total*100)}%)`);

  await prisma.$disconnect();
}

checkSyncedData();
