import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkPmuHorse() {
  const horses = await prisma.pmuHorse.findMany({
    take: 20,
    orderBy: { createdAt: 'desc' },
  });

  console.log('📊 Échantillon PmuHorse récents:\n');
  
  horses.forEach(h => {
    console.log(`${h.name}:`);
    console.log(`  Âge: ${h.age || 'NULL'}`);
    console.log(`  Sexe: ${h.sex || 'NULL'}`);
    console.log(`  Poids: ${h.weight || 'NULL'}`);
    console.log(`  Jockey: ${h.jockey || 'NULL'}`);
    console.log(`  Entraîneur: ${h.trainer || 'NULL'}`);
    console.log(`  Gains: ${h.totalEarnings || 'NULL'}`);
    console.log('');
  });

  // Stats
  const total = await prisma.pmuHorse.count();
  const withAge = await prisma.pmuHorse.count({ where: { age: { not: null } } });
  const withSex = await prisma.pmuHorse.count({ where: { sex: { not: null } } });
  const withJockey = await prisma.pmuHorse.count({ where: { jockey: { not: null } } });
  const withTrainer = await prisma.pmuHorse.count({ where: { trainer: { not: null } } });

  console.log(`\n📈 Stats PmuHorse:`);
  console.log(`Total: ${total}`);
  console.log(`Avec âge: ${withAge} (${Math.round(withAge/total*100)}%)`);
  console.log(`Avec sexe: ${withSex} (${Math.round(withSex/total*100)}%)`);
  console.log(`Avec jockey: ${withJockey} (${Math.round(withJockey/total*100)}%)`);
  console.log(`Avec entraîneur: ${withTrainer} (${Math.round(withTrainer/total*100)}%)`);
}

checkPmuHorse()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
