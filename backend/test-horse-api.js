const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testHorseAPI() {
  try {
    // Get a horse with performances
    const horseWithPerf = await prisma.pmuHorse.findFirst({
      where: {
        performances: {
          some: {},
        },
      },
      include: {
        _count: {
          select: {
            performances: true,
          },
        },
      },
    });

    if (horseWithPerf) {
      console.log(`\n🐴 Cheval trouvé: ${horseWithPerf.name}`);
      console.log(`   ID: ${horseWithPerf.id}`);
      console.log(`   Performances: ${horseWithPerf._count.performances}`);
      console.log(`\n📍 Testez l'API avec:`);
      console.log(`   curl http://localhost:3001/pmu/horse/${horseWithPerf.id}/performances`);
    } else {
      console.log('❌ Aucun cheval avec performances trouvé');
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testHorseAPI();
