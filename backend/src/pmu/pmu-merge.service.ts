import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PmuMergeService {
  private readonly logger = new Logger(PmuMergeService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Cron job qui s'exécute tous les dimanches à 4h du matin
   * Fusionne les chevaux en doublons dans UniqueHorse
   */
  @Cron('0 4 * * 0', {
    name: 'weekly-horses-merge',
    timeZone: 'Europe/Paris',
  })
  async mergeHorsesWeekly() {
    this.logger.log('🔄 Starting weekly horses merge...');
    
    try {
      await this.mergeHorses();
      this.logger.log('✅ Weekly horses merge completed');
    } catch (error) {
      this.logger.error(`Error in weekly horses merge: ${error.message}`);
    }
  }

  /**
   * Fusionner tous les chevaux en doublons
   */
  async mergeHorses(): Promise<void> {
    this.logger.log('🐴 Début de la fusion des chevaux...');

    // Récupérer tous les chevaux de PmuHorse
    const allHorses = await this.prisma.pmuHorse.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        race: true,
      },
    });

    this.logger.log(`📊 ${allHorses.length} enregistrements PmuHorse trouvés`);

    // Grouper par nom de cheval
    const horsesByName = new Map<string, typeof allHorses>();
    allHorses.forEach(horse => {
      if (!horsesByName.has(horse.name)) {
        horsesByName.set(horse.name, []);
      }
      horsesByName.get(horse.name)!.push(horse);
    });

    this.logger.log(`🦄 ${horsesByName.size} chevaux uniques identifiés`);

    let created = 0;
    let updated = 0;

    // Pour chaque cheval unique
    for (const [name, horses] of horsesByName.entries()) {
      // Trier par date de création (plus récent en premier) pour avoir les données les plus à jour
      horses.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      const mostRecent = horses[0];

      // Calculer les stats de carrière depuis les performances
      const performances = await this.prisma.pmuHorsePerformance.findMany({
        where: { horseId: { in: horses.map(h => h.id) } },
        orderBy: { date: 'desc' },
      });

      const careerStarts = performances.length;
      const careerWins = performances.filter(p => p.arrivalPosition === 1).length;
      const careerPlaces = performances.filter(
        p => p.arrivalPosition && p.arrivalPosition >= 2 && p.arrivalPosition <= 3
      ).length;

      // Récupérer jockey et trainer depuis la performance la plus récente
      const latestPerf = performances[0];
      const currentJockey = latestPerf?.jockey || mostRecent.jockey || null;
      const currentTrainer = latestPerf?.trainer || mostRecent.trainer || null;

      // Calculer gains totaux
      const totalEarnings = horses.reduce((sum, h) => sum + (h.totalEarnings || 0), 0);

      // Trouver la date de dernière course
      const lastRaceDate = latestPerf?.date || mostRecent.race?.date || null;

      // Créer ou mettre à jour le cheval unique
      const uniqueHorse = await this.prisma.uniqueHorse.upsert({
        where: { name },
        create: {
          name,
          age: mostRecent.age,
          sex: mostRecent.sex,
          currentTrainer,
          currentJockey,
          totalEarnings,
          careerStarts,
          careerWins,
          careerPlaces,
          recentForm: mostRecent.recentForm,
          lastRaceDate,
        },
        update: {
          age: mostRecent.age,
          sex: mostRecent.sex,
          currentTrainer,
          currentJockey,
          totalEarnings,
          careerStarts,
          careerWins,
          careerPlaces,
          recentForm: mostRecent.recentForm,
          lastRaceDate,
        },
      });

      if (uniqueHorse.createdAt === uniqueHorse.updatedAt) {
        created++;
      } else {
        updated++;
      }

      if ((created + updated) % 100 === 0) {
        this.logger.log(`✅ Progression: ${created + updated}/${horsesByName.size}`);
      }
    }

    this.logger.log(`\n✨ Fusion terminée!`);
    this.logger.log(`   - ${created} chevaux créés`);
    this.logger.log(`   - ${updated} chevaux mis à jour`);
    this.logger.log(`   - Total: ${created + updated} chevaux uniques`);
  }
}
