const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkData() {
  try {
    console.log('🔍 Vérification des données collectées...\n');

    // Count performances
    const performancesCount = await prisma.pmuHorsePerformance.count();
    console.log(`📊 Performances historiques : ${performancesCount} enregistrements`);

    // Count horses with performances
    const horsesWithPerformances = await prisma.pmuHorse.count({
      where: {
        performances: {
          some: {},
        },
      },
    });
    console.log(`🐴 Chevaux avec performances : ${horsesWithPerformances} chevaux`);

    // Count total horses
    const totalHorses = await prisma.pmuHorse.count();
    console.log(`🐴 Total chevaux en base : ${totalHorses} chevaux`);

    // Count races
    const racesCount = await prisma.pmuRace.count();
    console.log(`🏁 Courses en base : ${racesCount} courses`);

    // Sample of recent performances
    const recentPerformances = await prisma.pmuHorsePerformance.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        horse: true,
      },
    });

    console.log('\n📋 Dernières performances collectées :');
    recentPerformances.forEach((perf, idx) => {
      console.log(`  ${idx + 1}. ${perf.horse.name} - ${perf.hippodrome} - ${new Date(perf.date).toLocaleDateString('fr-FR')} - Position: ${perf.arrivalPosition || 'N/A'}`);
    });

    // Top horses by number of performances
    const horsesWithMostPerformances = await prisma.pmuHorse.findMany({
      include: {
        _count: {
          select: {
            performances: true,
          },
        },
      },
      orderBy: {
        performances: {
          _count: 'desc',
        },
      },
      take: 5,
    });

    console.log('\n🏆 Top 5 chevaux avec le plus de performances :');
    horsesWithMostPerformances.forEach((horse, idx) => {
      console.log(`  ${idx + 1}. ${horse.name} - ${horse._count.performances} performances`);
    });

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
