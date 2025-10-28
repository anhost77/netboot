import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma.service';
import { PmuService } from './pmu.service';
import { PmuDataService } from './pmu-data.service';

@Injectable()
export class PmuDailySyncService {
  private readonly logger = new Logger(PmuDailySyncService.name);

  constructor(
    private prisma: PrismaService,
    private pmuService: PmuService,
    private pmuDataService: PmuDataService,
  ) {
    this.logger.log('✅ PmuDailySyncService initialized');
  }

  /**
   * Cron job qui s'exécute tous les jours à 8h du matin
   * Récupère le programme du jour et stocke toutes les courses
   */
  @Cron('0 8 * * *', {
    name: 'daily-program-sync',
    timeZone: 'Europe/Paris',
  })
  async syncDailyProgram() {
    this.logger.log('🔄 Starting daily program synchronization...');

    try {
      const today = new Date();
      const program = await this.pmuService.getProgramByDate(today);

      if (!program || !program.programme || !program.programme.reunions) {
        this.logger.warn('No program available for today');
        return;
      }

      let totalRacesSaved = 0;
      let totalHorsesSaved = 0;

      // Pour chaque réunion
      for (const reunion of program.programme.reunions) {
        const reunionNumber = reunion.numOfficiel;

        // Pour chaque course de la réunion
        for (const course of reunion.courses) {
          const raceNumber = course.numOrdre;

          try {
            // Récupérer les détails de la course (participants)
            const raceDetails = await this.pmuService.getRaceParticipants(
              today,
              reunionNumber,
              raceNumber,
            );

            if (raceDetails && raceDetails.participants) {
              // Sauvegarder la course et ses participants
              const raceId = await this.pmuDataService.savePmuData(
                raceDetails,
              );

              if (raceId) {
                totalRacesSaved++;
                totalHorsesSaved += raceDetails.participants.length;
                this.logger.log(
                  `✅ Saved race R${reunionNumber}C${raceNumber} with ${raceDetails.participants.length} horses`,
                );
              }
            }

            // Attendre un peu entre chaque requête pour ne pas surcharger l'API
            await this.sleep(1000);
          } catch (error) {
            this.logger.error(
              `Error saving race R${reunionNumber}C${raceNumber}: ${error.message}`,
            );
          }
        }
      }

      this.logger.log(
        `✅ Daily program sync completed: ${totalRacesSaved} races, ${totalHorsesSaved} horses saved`,
      );
    } catch (error) {
      this.logger.error(`Error in daily program sync: ${error.message}`);
    }
  }

  /**
   * Cron job qui s'exécute tous les jours à 23h
   * Récupère les résultats des courses de la veille et met à jour les positions
   */
  @Cron('0 23 * * *', {
    name: 'daily-results-sync',
    timeZone: 'Europe/Paris',
  })
  async syncDailyResults() {
    this.logger.log('🔄 Starting daily results synchronization...');

    try {
      // Récupérer toutes les courses d'hier sans résultats
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const racesWithoutResults = await this.prisma.pmuRace.findMany({
        where: {
          date: {
            gte: new Date(yesterday.setHours(0, 0, 0, 0)),
            lt: new Date(yesterday.setHours(23, 59, 59, 999)),
          },
          horses: {
            some: {
              arrivalOrder: null,
            },
          },
        },
        include: {
          horses: true,
        },
      });

      this.logger.log(
        `Found ${racesWithoutResults.length} races without results from yesterday`,
      );

      let updatedRaces = 0;

      for (const race of racesWithoutResults) {
        try {
          // Récupérer les résultats de la course
          const raceDetails = await this.pmuService.getRaceParticipants(
            new Date(race.date),
            race.reunionNumber,
            race.raceNumber,
          );

          if (raceDetails && raceDetails.participants) {
            // Mettre à jour les positions d'arrivée
            for (const participant of raceDetails.participants) {
              if (participant.ordreArrivee) {
                const horse = race.horses.find(
                  (h: any) => h.number === participant.numPmu,
                );

                if (horse) {
                  await this.prisma.pmuHorse.update({
                    where: { id: horse.id },
                    data: {
                      arrivalOrder: participant.ordreArrivee,
                    },
                  });
                }
              }
            }

            // Récupérer les rapports PMU
            try {
              const reports = await this.pmuService.getRaceReports(
                new Date(race.date),
                race.reunionNumber,
                race.raceNumber,
              );

              if (reports && reports.length > 0) {
                // Les rapports sont déjà sauvegardés via savePmuData, on skip
                this.logger.log(
                  `✅ Updated race R${race.reunionNumber}C${race.raceNumber} with results and reports`,
                );
              }
            } catch (error) {
              this.logger.warn(
                `Reports not available yet for R${race.reunionNumber}C${race.raceNumber}`,
              );
            }

            updatedRaces++;
          }

          // Attendre entre chaque requête
          await this.sleep(1000);
        } catch (error) {
          this.logger.error(
            `Error updating race R${race.reunionNumber}C${race.raceNumber}: ${error.message}`,
          );
        }
      }

      this.logger.log(
        `✅ Daily results sync completed: ${updatedRaces} races updated`,
      );
    } catch (error) {
      this.logger.error(`Error in daily results sync: ${error.message}`);
    }
  }

  /**
   * Helper pour attendre
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
