import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkHorseData() {
  console.log('🔍 Vérification des données des chevaux...\n');

  // Vérifier UniqueHorse
  const uniqueHorses = await prisma.uniqueHorse.findMany({
    take: 10,
  });

  console.log('📊 Échantillon UniqueHorse:');
  uniqueHorses.forEach(h => {
    console.log(`\n${h.name}:`);
    console.log(`  - Âge: ${h.age || 'N/A'}`);
    console.log(`  - Sexe: ${h.sex || 'N/A'}`);
    console.log(`  - Race: ${h.breed || 'N/A'}`);
    console.log(`  - Éleveur: ${h.breeder || 'N/A'}`);
    console.log(`  - Propriétaire: ${h.owner || 'N/A'}`);
    console.log(`  - Entraîneur: ${h.currentTrainer || 'N/A'}`);
    console.log(`  - Jockey: ${h.currentJockey || 'N/A'}`);
  });

  // Vérifier PmuHorse
  console.log('\n\n📊 Échantillon PmuHorse (données brutes):');
  const pmuHorses = await prisma.pmuHorse.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
  });

  pmuHorses.forEach(h => {
    console.log(`\n${h.name}:`);
    console.log(`  - Âge: ${h.age || 'N/A'}`);
    console.log(`  - Sexe: ${h.sex || 'N/A'}`);
    console.log(`  - Poids: ${h.weight || 'N/A'}`);
    console.log(`  - Entraîneur: ${h.trainer || 'N/A'}`);
    console.log(`  - Jockey: ${h.jockey || 'N/A'}`);
    console.log(`  - Gains: ${h.totalEarnings || 'N/A'}`);
  });

  // Compter les chevaux avec des données
  const withAge = await prisma.uniqueHorse.count({ where: { age: { not: null } } });
  const withSex = await prisma.uniqueHorse.count({ where: { sex: { not: null } } });
  const withBreed = await prisma.uniqueHorse.count({ where: { breed: { not: null } } });
  const withBreeder = await prisma.uniqueHorse.count({ where: { breeder: { not: null } } });
  const withOwner = await prisma.uniqueHorse.count({ where: { owner: { not: null } } });
  const total = await prisma.uniqueHorse.count();

  console.log('\n\n📈 Statistiques de complétude:');
  console.log(`Total chevaux: ${total}`);
  console.log(`Avec âge: ${withAge} (${Math.round(withAge/total*100)}%)`);
  console.log(`Avec sexe: ${withSex} (${Math.round(withSex/total*100)}%)`);
  console.log(`Avec race: ${withBreed} (${Math.round(withBreed/total*100)}%)`);
  console.log(`Avec éleveur: ${withBreeder} (${Math.round(withBreeder/total*100)}%)`);
  console.log(`Avec propriétaire: ${withOwner} (${Math.round(withOwner/total*100)}%)`);
}

checkHorseData()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
