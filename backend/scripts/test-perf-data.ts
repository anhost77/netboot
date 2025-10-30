import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testPerfData() {
  const perfs = await prisma.pmuHorsePerformance.findMany({
    take: 10,
    orderBy: { date: 'desc' },
  });

  console.log('📊 Échantillon PmuHorsePerformance:\n');
  
  perfs.forEach(p => {
    console.log(`Performance:`);
    console.log(`  Jockey: ${p.jockey || 'NULL'}`);
    console.log(`  Entraîneur: ${p.trainer || 'NULL'}`);
    console.log(`  Date: ${p.date.toISOString().split('T')[0]}`);
    console.log('');
  });

  const withJockey = await prisma.pmuHorsePerformance.count({ where: { jockey: { not: null } } });
  const withTrainer = await prisma.pmuHorsePerformance.count({ where: { trainer: { not: null } } });
  const total = await prisma.pmuHorsePerformance.count();

  console.log(`\n📈 Stats:`);
  console.log(`Total performances: ${total}`);
  console.log(`Avec jockey: ${withJockey} (${Math.round(withJockey/total*100)}%)`);
  console.log(`Avec entraîneur: ${withTrainer} (${Math.round(withTrainer/total*100)}%)`);
}

testPerfData()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
