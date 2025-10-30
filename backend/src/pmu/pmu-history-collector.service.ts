import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { PmuService } from './pmu.service';
import { PmuDataService } from './pmu-data.service';

@Injectable()
export class PmuHistoryCollectorService {
  private readonly logger = new Logger(PmuHistoryCollectorService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly pmuService: PmuService,
    private readonly pmuDataService: PmuDataService,
  ) {}

  /**
   * Collect historical data for a date range
   */
  async collectHistoricalData(startDate: Date, endDate: Date): Promise<void> {
    this.logger.log(`Starting historical data collection from ${startDate.toISOString()} to ${endDate.toISOString()}`);
    
    let currentDate = new Date(startDate);
    let totalRaces = 0;
    let successfulRaces = 0;
    let failedRaces = 0;

    while (currentDate <= endDate) {
      try {
        this.logger.log(`Processing date: ${currentDate.toISOString().split('T')[0]}`);
        
        // Get program for this date
        const program = await this.pmuService.getProgramByDate(currentDate);
        
        if (!program?.meetings || program.meetings.length === 0) {
          this.logger.warn(`No meetings found for ${currentDate.toISOString().split('T')[0]}`);
          currentDate.setDate(currentDate.getDate() + 1);
          continue;
        }

        // ÉTAPE 1: Enrichir avec les données complètes (âge, sexe, entraîneur)
        this.logger.log(`🔄 Enrichissement des données pour ${currentDate.toISOString().split('T')[0]}...`);
        
        try {
          // Pour chaque course, enregistrer les participants avec toutes les données
          for (const meeting of program.meetings) {
            for (const race of meeting.races) {
              await this.pmuDataService.savePmuData({
                date: currentDate.toISOString().split('T')[0],
                reunionNumber: meeting.number,
                raceNumber: race.number,
                hippodromeCode: meeting.hippodrome.code,
                hippodromeName: meeting.hippodrome.name,
                hippodromeFullName: meeting.hippodrome.fullName,
              });
            }
          }
          this.logger.log(`✅ Données enrichies pour ${currentDate.toISOString().split('T')[0]}`);
        } catch (error) {
          this.logger.warn(`⚠️ Impossible d'enrichir ${currentDate.toISOString().split('T')[0]}: ${error.message}`);
        }

        // ÉTAPE 2: Collecter les performances historiques
        for (const meeting of program.meetings) {
          for (const race of meeting.races) {
            totalRaces++;
            
            try {
              await this.collectRacePerformances(
                currentDate,
                meeting.number,
                race.number,
                meeting.hippodrome.code,
                meeting.hippodrome.name,
                meeting.hippodrome.fullName,
              );
              successfulRaces++;
              
              // Small delay to avoid overwhelming the API
              await this.delay(500);
            } catch (error) {
              failedRaces++;
              this.logger.error(`Failed to collect R${meeting.number}C${race.number}: ${error.message}`);
            }
          }
        }
      } catch (error) {
        this.logger.error(`Error processing date ${currentDate.toISOString()}: ${error.message}`);
      }

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    this.logger.log(`Collection completed: ${successfulRaces}/${totalRaces} races collected successfully, ${failedRaces} failed`);
  }

  /**
   * Collect performances for a specific race
   */
  async collectRacePerformances(
    date: Date,
    reunionNumber: number,
    raceNumber: number,
    hippodromeCode: string,
    hippodromeName: string,
    hippodromeFullName: string,
  ): Promise<void> {
    try {
      // Get detailed performances
      const performances = await this.pmuService.getRacePerformances(date, reunionNumber, raceNumber);
      
      if (!performances?.participants) {
        this.logger.warn(`No performance data for R${reunionNumber}C${raceNumber}`);
        return;
      }

      // Get race details
      const raceDetails = await this.pmuService.getRaceDetails(date, reunionNumber, raceNumber);
      
      // Ensure hippodrome exists
      await this.prisma.pmuHippodrome.upsert({
        where: { code: hippodromeCode },
        create: {
          code: hippodromeCode,
          name: hippodromeName,
          fullName: hippodromeFullName,
        },
        update: {
          name: hippodromeName,
          fullName: hippodromeFullName,
        },
      });

      // Create or update race
      const race = await this.prisma.pmuRace.upsert({
        where: {
          hippodromeCode_date_reunionNumber_raceNumber: {
            hippodromeCode,
            date,
            reunionNumber,
            raceNumber,
          },
        },
        create: {
          hippodromeCode,
          date,
          reunionNumber,
          raceNumber,
          name: raceDetails?.libelle || null,
          startTime: raceDetails?.heureDepart ? BigInt(raceDetails.heureDepart) : null,
          discipline: raceDetails?.discipline || null,
          distance: raceDetails?.distance || null,
          prize: raceDetails?.montantPrix || null,
        },
        update: {
          name: raceDetails?.libelle || null,
          startTime: raceDetails?.heureDepart ? BigInt(raceDetails.heureDepart) : null,
          discipline: raceDetails?.discipline || null,
          distance: raceDetails?.distance || null,
          prize: raceDetails?.montantPrix || null,
        },
      });

      // Process each participant and their historical performances
      for (const participant of performances.participants) {
        if (!participant.numPmu || !participant.nomCheval) continue;

        // Create or update horse
        const horse = await this.prisma.pmuHorse.upsert({
          where: {
            raceId_number: {
              raceId: race.id,
              number: participant.numPmu,
            },
          },
          create: {
            raceId: race.id,
            number: participant.numPmu,
            name: participant.nomCheval,
            arrivalOrder: null, // Will be updated when results are available
            recentForm: participant.musique || null,
            blinkers: participant.oeilleres || false,
            unshod: participant.deferre || null,
            firstTime: participant.inedit || false,
            odds: participant.rapport ? parseFloat(participant.rapport) : null,
            // Informations du cheval
            jockey: participant.driver || participant.jockey || null,
            trainer: participant.entraineur || null,
            age: participant.age || null,
            sex: participant.sexe || null,
            weight: participant.handicapPoids || null,
            rope: participant.corde || null,
            totalEarnings: participant.gainsCarriere || null,
            careerStarts: participant.nombreCourses || null,
            careerWins: participant.nombreVictoires || null,
            careerPlaces: participant.nombrePlaces || null,
          },
          update: {
            name: participant.nomCheval,
            recentForm: participant.musique || null,
            jockey: participant.driver || participant.jockey || null,
            trainer: participant.entraineur || null,
            age: participant.age || null,
            sex: participant.sexe || null,
            weight: participant.handicapPoids || null,
            totalEarnings: participant.gainsCarriere || null,
            careerStarts: participant.nombreCourses || null,
            careerWins: participant.nombreVictoires || null,
            careerPlaces: participant.nombrePlaces || null,
          },
        });

        // Store historical performances
        if (participant.coursesCourues && participant.coursesCourues.length > 0) {
          await this.storeHistoricalPerformances(horse.id, participant.coursesCourues);
        }
      }

      this.logger.debug(`Successfully collected performances for R${reunionNumber}C${raceNumber} on ${date.toISOString().split('T')[0]}`);
    } catch (error) {
      this.logger.error(`Error collecting race performances: ${error.message}`);
      throw error;
    }
  }

  /**
   * Store historical performances for a horse
   */
  private async storeHistoricalPerformances(horseId: string, performances: any[]): Promise<void> {
    for (const perf of performances) {
      try {
        const perfDate = new Date(perf.date);
        
        // Find the participant data for this horse (marked with itsHim: true)
        const horsePerf = perf.participants?.find((p: any) => p.itsHim === true);
        
        if (!horsePerf) continue;

        // Store the performance with complete raw data
        await this.prisma.pmuHorsePerformance.upsert({
          where: {
            horseId_date_hippodrome: {
              horseId,
              date: perfDate,
              hippodrome: perf.hippodrome,
            },
          },
          create: {
            horseId,
            date: perfDate,
            hippodrome: perf.hippodrome,
            raceName: perf.nomPrix,
            discipline: perf.discipline,
            distance: perf.distance,
            prize: perf.allocation,
            nbParticipants: perf.nbParticipants,
            arrivalPosition: horsePerf.place?.place || null,
            status: horsePerf.place?.statusArrivee || null,
            jockey: horsePerf.nomJockey || null,
            trainer: null, // L'API PMU ne fournit pas l'entraîneur dans l'historique
            reductionKilometrique: horsePerf.reductionKilometrique || null,
            distanceParcourue: horsePerf.distanceParcourue || null,
            winnerTime: perf.tempsDuPremier || null,
            rawData: perf, // Store complete raw JSON data
          },
          update: {
            raceName: perf.nomPrix,
            discipline: perf.discipline,
            distance: perf.distance,
            prize: perf.allocation,
            nbParticipants: perf.nbParticipants,
            arrivalPosition: horsePerf.place?.place || null,
            status: horsePerf.place?.statusArrivee || null,
            jockey: horsePerf.nomJockey || null,
            trainer: null, // L'API PMU ne fournit pas l'entraîneur dans l'historique
            reductionKilometrique: horsePerf.reductionKilometrique || null,
            distanceParcourue: horsePerf.distanceParcourue || null,
            winnerTime: perf.tempsDuPremier || null,
            rawData: perf, // Update with complete raw JSON data
          },
        });
      } catch (error) {
        this.logger.warn(`Failed to store performance: ${error.message}`);
      }
    }
  }

  /**
   * Helper to add delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
