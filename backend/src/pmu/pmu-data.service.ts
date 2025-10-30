import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { PmuService } from './pmu.service';

interface SavePmuDataParams {
  date: string; // YYYY-MM-DD
  reunionNumber: number;
  raceNumber: number;
  hippodromeCode: string;
  hippodromeName: string;
  hippodromeFullName: string;
}

@Injectable()
export class PmuDataService {
  private readonly logger = new Logger(PmuDataService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly pmuService: PmuService,
  ) {}

  /**
   * Save or update PMU data (hippodrome, race, horses) and return the race ID
   */
  async savePmuData(params: SavePmuDataParams): Promise<string | null> {
    try {
      const {
        date,
        reunionNumber,
        raceNumber,
        hippodromeCode,
        hippodromeName,
        hippodromeFullName,
      } = params;

      // 1. Upsert hippodrome
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

      // 2. Get race details from PMU API
      const raceDate = new Date(date);
      let raceDetails: any;
      let participants: any;

      try {
        raceDetails = await this.pmuService.getRaceDetails(
          raceDate,
          reunionNumber,
          raceNumber,
        );
        participants = await this.pmuService.getRaceParticipants(
          raceDate,
          reunionNumber,
          raceNumber,
        );
      } catch (error) {
        this.logger.warn(
          `Could not fetch PMU data for R${reunionNumber}C${raceNumber}: ${error.message}`,
        );
        // Continue without detailed data
      }

      // 3. Upsert race
      const race = await this.prisma.pmuRace.upsert({
        where: {
          hippodromeCode_date_reunionNumber_raceNumber: {
            hippodromeCode,
            date: raceDate,
            reunionNumber,
            raceNumber,
          },
        },
        create: {
          hippodromeCode,
          date: raceDate,
          reunionNumber,
          raceNumber,
          name: raceDetails?.libelle || null,
          startTime: raceDetails?.heureDepart
            ? BigInt(raceDetails.heureDepart)
            : null,
          discipline: raceDetails?.discipline || null,
          distance: raceDetails?.distance || null,
          prize: raceDetails?.montantPrix || null,
        },
        update: {
          name: raceDetails?.libelle || null,
          startTime: raceDetails?.heureDepart
            ? BigInt(raceDetails.heureDepart)
            : null,
          discipline: raceDetails?.discipline || null,
          distance: raceDetails?.distance || null,
          prize: raceDetails?.montantPrix || null,
        },
      });

      // 4. Save horses if we have participants data
      this.logger.debug(`Participants data: ${JSON.stringify(participants)}`);
      
      if (participants?.participants) {
        this.logger.log(`Saving ${participants.participants.length} horses for race R${reunionNumber}C${raceNumber}`);
        for (const participant of participants.participants) {
          // Convert API values to boolean
          const hasBlinkers = participant.blinkers && participant.blinkers !== 'SANS_OEILLERES';
          
          await this.prisma.pmuHorse.upsert({
            where: {
              raceId_number: {
                raceId: race.id,
                number: participant.number,
              },
            },
            create: {
              raceId: race.id,
              number: participant.number,
              name: participant.name,
              arrivalOrder: participant.arrivalOrder || null,
              recentForm: participant.recentForm || null,
              blinkers: hasBlinkers,
              unshod: participant.unshod || null,
              firstTime: participant.firstTime || false,
              odds: participant.odds || null,
            },
            update: {
              name: participant.name,
              arrivalOrder: participant.arrivalOrder || null,
              recentForm: participant.recentForm || null,
              blinkers: hasBlinkers,
              unshod: participant.unshod || null,
              firstTime: participant.firstTime || false,
              odds: participant.odds || null,
            },
          });
        }
      }

      return race.id;
    } catch (error) {
      this.logger.error(`Error saving PMU data: ${error.message}`, error.stack);
      return null;
    }
  }

  /**
   * Update horse odds from race reports
   */
  async updateHorseOddsFromReports(raceId: string, date: Date, reunionNumber: number, raceNumber: number): Promise<void> {
    try {
      this.logger.log(`Updating odds for race ${raceId} from reports`);
      
      // Get race reports from PMU API
      const reports = await this.pmuService.getRaceReports(date, reunionNumber, raceNumber);
      
      if (!reports || !Array.isArray(reports)) {
        this.logger.warn(`No reports available for R${reunionNumber}C${raceNumber}`);
        return;
      }

      this.logger.debug(`Found ${reports.length} bet types in reports`);

      // Extract odds from Simple Gagnant (winner odds)
      const simpleGagnant = reports.find(r => r.typePari === 'SIMPLE_GAGNANT');
      if (simpleGagnant && simpleGagnant.rapports) {
        for (const rapport of simpleGagnant.rapports) {
          const horseNumber = parseInt(rapport.combinaison);
          const odds = rapport.dividendePourUnEuro / 100; // Convert cents to euros
          
          if (horseNumber && odds) {
            await this.prisma.pmuHorse.updateMany({
              where: {
                raceId,
                number: horseNumber,
              },
              data: {
                odds: odds,
              },
            });
            this.logger.log(`✅ Updated odds for horse ${horseNumber}: ${odds}€ (Simple Gagnant)`);
          }
        }
      }

      // Extract odds from Simple Placé (place odds) for horses without winner odds
      const simplePlace = reports.find(r => r.typePari === 'SIMPLE_PLACE');
      if (simplePlace && simplePlace.rapports) {
        for (const rapport of simplePlace.rapports) {
          const horseNumber = parseInt(rapport.combinaison);
          const odds = rapport.dividendePourUnEuro / 100; // Convert cents to euros
          
          if (horseNumber && odds) {
            // Only update if no odds set yet (winner horse already has odds)
            const horse = await this.prisma.pmuHorse.findFirst({
              where: {
                raceId,
                number: horseNumber,
              },
            });

            if (horse && !horse.odds) {
              await this.prisma.pmuHorse.updateMany({
                where: {
                  raceId,
                  number: horseNumber,
                },
                data: {
                  odds: odds,
                },
              });
              this.logger.log(`✅ Updated odds for horse ${horseNumber}: ${odds}€ (Simple Placé)`);
            }
          }
        }
      }

      // Save all reports to database
      for (const report of reports) {
        await this.prisma.pmuReport.upsert({
          where: {
            raceId_betType: {
              raceId,
              betType: report.typePari,
            },
          },
          create: {
            raceId,
            betType: report.typePari,
            betFamily: report.famillePari || 'Unknown',
            baseStake: report.miseBase || 0,
            refunded: report.rembourse || false,
            reports: report.rapports || [],
          },
          update: {
            betFamily: report.famillePari || 'Unknown',
            baseStake: report.miseBase || 0,
            refunded: report.rembourse || false,
            reports: report.rapports || [],
          },
        });
      }

      this.logger.log(`Successfully updated odds and saved ${reports.length} reports for race R${reunionNumber}C${raceNumber}`);
    } catch (error) {
      this.logger.error(`Error updating odds from reports: ${error.message}`, error.stack);
    }
  }

  /**
   * Get the appropriate odds for a bet based on bet type and selected horses
   */
  async getOddsForBet(
    raceId: string,
    betType: string,
    horsesSelected: string,
  ): Promise<number | null> {
    try {
      // Get race with reports
      const race = await this.prisma.pmuRace.findUnique({
        where: { id: raceId },
        include: { reports: true },
      });

      if (!race || !race.reports || race.reports.length === 0) {
        this.logger.warn(`No reports available for race ${raceId}`);
        return null;
      }

      // Extract horse numbers from selection
      const selectedNumbers = horsesSelected
        .split(',')
        .map(h => {
          const match = h.trim().match(/^(\d+)/);
          return match ? parseInt(match[1]) : 0;
        })
        .filter(n => n > 0);

      if (selectedNumbers.length === 0) return null;

      // Find the appropriate report based on bet type
      let targetBetType = '';
      let shouldSort = true; // Par défaut, on trie (pour les paris désordre)
      switch (betType?.toLowerCase()) {
        case 'gagnant':
        case 'simple_gagnant':
          targetBetType = 'SIMPLE_GAGNANT';
          break;
        case 'place':
        case 'simple_place':
          targetBetType = 'SIMPLE_PLACE';
          break;
        case 'gagnant_place':
          targetBetType = 'SIMPLE_GAGNANT'; // Use winner odds for G-P
          break;
        case 'couple_gagnant':
          targetBetType = 'COUPLE_GAGNANT';
          break;
        case 'couple_place':
          targetBetType = 'COUPLE_PLACE';
          break;
        case 'couple_ordre':
          targetBetType = 'COUPLE_ORDRE';
          shouldSort = false; // Ordre important
          break;
        case 'trio':
          targetBetType = 'TRIO';
          break;
        case 'trio_ordre':
          targetBetType = 'TRIO_ORDRE';
          shouldSort = false; // Ordre important
          break;
        case 'tierce':
        case 'tiercé':
          targetBetType = 'TIERCE';
          break;
        case 'tierce_ordre':
          targetBetType = 'TIERCE';
          shouldSort = false; // Ordre important
          break;
        case 'quarte':
        case 'quarte+':
        case 'quarte_plus':
          targetBetType = 'QUARTE_PLUS';
          break;
        case 'quarte_ordre':
          targetBetType = 'QUARTE_PLUS';
          shouldSort = false; // Ordre important
          break;
        case 'quinte':
        case 'quinte+':
        case 'quinte_plus':
          targetBetType = 'QUINTE_PLUS';
          break;
        case 'quinte_ordre':
          targetBetType = 'QUINTE_PLUS';
          shouldSort = false; // Ordre important
          break;
        case 'deux_sur_quatre':
        case '2sur4':
          targetBetType = 'DEUX_SUR_QUATRE';
          break;
        case 'multi':
        case 'mini_multi':
          targetBetType = 'MULTI';
          break;
        case 'super4':
          targetBetType = 'SUPER_QUATRE';
          shouldSort = false; // Ordre important pour Super 4
          break;
        case 'pick5':
          targetBetType = 'PICK5';
          break;
        case 'trio_bonus':
          targetBetType = 'TRIO'; // Utiliser les cotes du Trio
          break;
        case 'quarte_bonus':
          targetBetType = 'QUARTE_PLUS'; // Utiliser les cotes du Quarté+
          break;
        default:
          this.logger.warn(`Unknown bet type: ${betType}`);
          return null;
      }

      // Find the report for this bet type
      const report = race.reports.find(r => r.betType === targetBetType);
      if (!report) {
        this.logger.warn(`No report found for bet type ${targetBetType}`);
        return null;
      }

      // Find the matching combination in the reports
      const reportData = report.reports as any[];
      
      // Pour les paris ORDRE, trier selon l'ordre d'arrivée réel
      let numbersToUse = selectedNumbers;
      if (!shouldSort) {
        // Récupérer l'ordre d'arrivée depuis les chevaux de la course
        const horses = await this.prisma.pmuHorse.findMany({
          where: {
            raceId: raceId,
            number: { in: selectedNumbers },
            arrivalOrder: { not: null },
          },
          orderBy: { arrivalOrder: 'asc' },
        });
        
        // Trier les numéros sélectionnés selon l'ordre d'arrivée
        numbersToUse = horses.map(h => h.number);
        this.logger.log(`   Ordre d'arrivée réel: ${numbersToUse.join('-')}`);
      } else {
        // Pour les paris désordre, trier par numéro croissant
        numbersToUse = [...selectedNumbers].sort((a, b) => a - b);
      }
      
      const combination = numbersToUse.join('-');

      this.logger.log(`🔍 Recherche de cote pour ${betType}`);
      this.logger.log(`   Chevaux sélectionnés: ${selectedNumbers.join('-')}`);
      this.logger.log(`   Combinaison cherchée: ${combination} (shouldSort: ${shouldSort})`);
      this.logger.log(`   Type de rapport: ${targetBetType}`);
      this.logger.log(`   Combinaisons disponibles: ${reportData.map(r => r.combinaison).join(', ')}`);

      // Try to find exact match
      let matchingReport = reportData.find(r => r.combinaison === combination);

      // For simple bets, try single number
      if (!matchingReport && selectedNumbers.length === 1) {
        matchingReport = reportData.find(r => r.combinaison === selectedNumbers[0].toString());
      }

      // For couples/trios désordre, try reverse order
      if (!matchingReport && selectedNumbers.length > 1 && shouldSort) {
        const reverseCombination = [...numbersToUse].reverse().join('-');
        matchingReport = reportData.find(r => r.combinaison === reverseCombination);
      }

      if (!matchingReport) {
        this.logger.warn(`No matching report found for combination ${combination}`);
        return null;
      }

      // Return odds in euros (dividende is in cents)
      const odds = matchingReport.dividendePourUnEuro / 100;
      this.logger.log(`Found odds for ${betType} ${combination}: ${odds}€`);
      return odds;
    } catch (error) {
      this.logger.error(`Error getting odds: ${error.message}`);
      return null;
    }
  }

  /**
   * Get statistics for a specific hippodrome
   */
  async getHippodromeStats(hippodromeCode: string, userId: string) {
    const bets = await this.prisma.bet.findMany({
      where: {
        userId,
        hippodrome: {
          contains: hippodromeCode,
          mode: 'insensitive',
        },
      },
      include: {
        pmuRace: {
          include: {
            hippodrome: true,
          },
        },
      },
    });

    const totalBets = bets.length;
    const wonBets = bets.filter((b) => b.status === 'won').length;
    const totalStake = bets.reduce((sum, b) => sum + Number(b.stake), 0);
    const totalProfit = bets.reduce((sum, b) => sum + Number(b.profit || 0), 0);

    return {
      hippodromeCode,
      totalBets,
      wonBets,
      winRate: totalBets > 0 ? (wonBets / totalBets) * 100 : 0,
      totalStake,
      totalProfit,
      roi: totalStake > 0 ? (totalProfit / totalStake) * 100 : 0,
    };
  }

  /**
   * Get statistics for a specific horse
   */
  async getHorseStats(horseName: string, userId: string) {
    const bets = await this.prisma.bet.findMany({
      where: {
        userId,
        horsesSelected: {
          contains: horseName,
          mode: 'insensitive',
        },
      },
    });

    const totalBets = bets.length;
    const wonBets = bets.filter((b) => b.status === 'won').length;
    const totalStake = bets.reduce((sum, b) => sum + Number(b.stake), 0);
    const totalProfit = bets.reduce((sum, b) => sum + Number(b.profit || 0), 0);

    return {
      horseName,
      totalBets,
      wonBets,
      winRate: totalBets > 0 ? (wonBets / totalBets) * 100 : 0,
      totalStake,
      totalProfit,
      roi: totalStake > 0 ? (totalProfit / totalStake) * 100 : 0,
    };
  }

  /**
   * Get top performing hippodromes for a user
   */
  async getTopHippodromes(userId: string, limit = 10) {
    const bets = await this.prisma.bet.groupBy({
      by: ['hippodrome'],
      where: {
        userId,
        hippodrome: { not: null },
      },
      _count: true,
      _sum: {
        profit: true,
      },
    });

    return bets
      .map((b) => ({
        hippodrome: b.hippodrome,
        totalBets: b._count,
        totalProfit: Number(b._sum.profit || 0),
      }))
      .sort((a, b) => b.totalProfit - a.totalProfit)
      .slice(0, limit);
  }
}
