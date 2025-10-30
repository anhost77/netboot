import { Controller, Get, Post, Query, Param, ParseIntPipe, HttpException, HttpStatus, SetMetadata, UseGuards, Req, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PmuService } from './pmu.service';
import { PmuDataService } from './pmu-data.service';
import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client';

export const Public = () => SetMetadata('isPublic', true);

@ApiTags('PMU')
@ApiBearerAuth()
@Controller('pmu')
@UseGuards(JwtAuthGuard)
export class PmuController {
  constructor(
    private readonly pmuService: PmuService,
    private readonly pmuDataService: PmuDataService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Détecte les types de paris disponibles depuis les rapports PMU
   */
  private detectAvailableBetTypesFromReports(reports: any[]): string[] {
    const betTypes: string[] = [];
    
    // Mapping des types de rapports PMU vers nos types de paris
    const reportMapping: Record<string, string[]> = {
      'SIMPLE_GAGNANT': ['gagnant'],
      'SIMPLE_PLACE': ['place'],
      'COUPLE_ORDRE': ['couple_ordre'],
      'COUPLE_GAGNANT': ['couple_gagnant'],
      'COUPLE_PLACE': ['couple_place'],
      'TRIO': ['trio'],
      'TRIO_ORDRE': ['trio_ordre'],
      'TIERCE': ['tierce', 'tierce_ordre'],
      'QUARTE_PLUS': ['quarte', 'quarte_ordre', 'quarte_bonus'],
      'QUINTÉ_PLUS': ['quinte', 'quinte_ordre'],
      'DEUX_SUR_QUATRE': ['deux_sur_quatre'],
      'MULTI': ['multi', 'mini_multi'],
      'SUPER_QUATRE': ['super4'],
      'PICK5': ['pick5'],
    };
    
    // Extraire les types depuis les rapports
    for (const report of reports) {
      const mappedTypes = reportMapping[report.betType];
      if (mappedTypes) {
        betTypes.push(...mappedTypes);
      }
    }
    
    // Toujours ajouter gagnant_place si on a gagnant ET place
    if (betTypes.includes('gagnant') && betTypes.includes('place')) {
      betTypes.push('gagnant_place');
    }
    
    // Supprimer les doublons
    return [...new Set(betTypes)];
  }

  /**
   * Détecte les types de paris disponibles selon les types de jeu proposés par le PMU
   */
  private detectAvailableBetTypes(raceDetails: any): string[] {
    const betTypes: string[] = [];
    
    // Récupérer les types de jeu depuis l'API PMU
    const typesJeu = raceDetails.typesJeu || [];
    
    // Log pour debug
    console.log('🎯 Race:', raceDetails.libelle);
    console.log('🎲 Types de jeu PMU:', typesJeu);
    
    // Mapping des types de jeu PMU vers nos types de paris
    const typeMapping: Record<string, string[]> = {
      'SIMPLE_GAGNANT': ['gagnant'],
      'SIMPLE_PLACE': ['place'],
      'SIMPLE_GAGNANT_PLACE': ['gagnant_place'],
      'COUPLE': ['couple_gagnant', 'couple_place', 'couple_ordre'], // Générique
      'COUPLE_GAGNANT': ['couple_gagnant'],
      'COUPLE_PLACE': ['couple_place'],
      'COUPLE_ORDRE': ['couple_ordre'],
      'TRIO': ['trio'],
      'TRIO_ORDRE': ['trio_ordre'],
      'TIERCE': ['tierce', 'tierce_ordre'],
      'QUARTE_PLUS': ['quarte', 'quarte_ordre', 'quarte_bonus'],
      'QUINTE_PLUS': ['quinte', 'quinte_ordre'],
      'DEUX_SUR_QUATRE': ['deux_sur_quatre'],
      'MULTI': ['multi', 'mini_multi'],
      'SUPER_QUATRE': ['super4'],
      'PICK5': ['pick5'],
    };
    
    // Ajouter les types de paris selon les types de jeu disponibles
    for (const typeJeu of typesJeu) {
      const mappedTypes = typeMapping[typeJeu];
      if (mappedTypes) {
        betTypes.push(...mappedTypes);
      }
    }
    
    // Si aucun type détecté, ajouter au moins les paris simples (fallback)
    if (betTypes.length === 0) {
      betTypes.push('gagnant', 'place', 'gagnant_place');
    }
    
    // Supprimer les doublons
    return [...new Set(betTypes)];
  }

  @Get('program/today')
  @ApiOperation({ summary: 'Get today\'s race program' })
  async getTodayProgram() {
    return this.pmuService.getTodayProgram();
  }

  @Get('program')
  @ApiOperation({ summary: 'Get race program for a specific date' })
  async getProgramByDate(@Query('date') date: string) {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      throw new Error('Invalid date format. Use YYYY-MM-DD');
    }
    return this.pmuService.getProgramByDate(parsedDate);
  }

  @Get('race/participants')
  @ApiOperation({ summary: 'Get race participants' })
  async getRaceParticipants(
    @Query('date') date: string,
    @Query('reunion', ParseIntPipe) reunion: number,
    @Query('course', ParseIntPipe) course: number,
  ) {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      throw new Error('Invalid date format. Use YYYY-MM-DD');
    }
    
    // Get participants from PMU API (returns array)
    const participantsArray = await this.pmuService.getRaceParticipants(parsedDate, reunion, course);
    
    // Enrich with jockey data from our database
    if (participantsArray && participantsArray.length > 0) {
      const enrichedParticipants = await Promise.all(
        participantsArray.map(async (p: any) => {
          // Find jockey info from our database for this horse
          const horsePerf = await this.prisma.pmuHorsePerformance.findFirst({
            where: {
              horse: {
                name: p.name,
              },
              jockey: { not: null },
            },
            orderBy: {
              createdAt: 'desc', // Most recent performance
            },
            select: {
              jockey: true,
            },
          });
          
          return {
            ...p,
            jockey: horsePerf?.jockey || p.jockey,
          };
        })
      );
      
      return {
        participants: enrichedParticipants,
      };
    }
    
    return { participants: participantsArray || [] };
  }

  @Get('race/details')
  @ApiOperation({ summary: 'Get race details' })
  async getRaceDetails(
    @Query('date') date: string,
    @Query('reunion', ParseIntPipe) reunion: number,
    @Query('course', ParseIntPipe) course: number,
  ) {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      throw new Error('Invalid date format. Use YYYY-MM-DD');
    }
    return this.pmuService.getRaceDetails(parsedDate, reunion, course);
  }

  @Post('data/races/:date/:reunion/:course/sync')
  @Public()
  @ApiOperation({ summary: 'Sync a specific race to database' })
  async syncSpecificRace(
    @Param('date') date: string,
    @Param('reunion', ParseIntPipe) reunion: number,
    @Param('course', ParseIntPipe) course: number,
  ) {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      throw new Error('Invalid date format. Use YYYY-MM-DD');
    }

    // Récupérer les détails de la course depuis l'API PMU
    const raceDetails = await this.pmuService.getRaceDetails(parsedDate, reunion, course);
    const participants = await this.pmuService.getRaceParticipants(parsedDate, reunion, course);

    // Créer ou récupérer l'hippodrome
    let hippodrome = await this.prisma.pmuHippodrome.findUnique({
      where: { code: raceDetails.hippodrome.codeHippodrome },
    });

    if (!hippodrome) {
      hippodrome = await this.prisma.pmuHippodrome.create({
        data: {
          code: raceDetails.hippodrome.codeHippodrome,
          name: raceDetails.hippodrome.libelleCourt,
          fullName: raceDetails.hippodrome.libelleLong || raceDetails.hippodrome.libelleCourt,
        },
      });
    }

    // Créer ou mettre à jour la course (sans les types de paris pour l'instant)
    const race = await this.prisma.pmuRace.upsert({
      where: {
        hippodromeCode_date_reunionNumber_raceNumber: {
          hippodromeCode: hippodrome.code,
          date: parsedDate,
          reunionNumber: reunion,
          raceNumber: course,
        },
      },
      create: {
        date: parsedDate,
        reunionNumber: reunion,
        raceNumber: course,
        name: raceDetails.libelle,
        hippodromeCode: hippodrome.code,
        startTime: raceDetails.heureDepart ? BigInt(raceDetails.heureDepart) : null,
        discipline: raceDetails.discipline,
        distance: raceDetails.distance,
        prize: raceDetails.montantPrix,
        availableBetTypes: [], // Sera mis à jour après récupération des rapports
      },
      update: {
        name: raceDetails.libelle,
        startTime: raceDetails.heureDepart ? BigInt(raceDetails.heureDepart) : null,
        discipline: raceDetails.discipline,
        distance: raceDetails.distance,
        prize: raceDetails.montantPrix,
        // availableBetTypes sera mis à jour après récupération des rapports
      },
    });

    // Créer les chevaux participants
    // participants peut être soit un tableau directement, soit un objet {participants: [...]}
    const participantsList = Array.isArray(participants) ? participants : (participants.participants || []);
    console.log('🐴 Participants count:', participantsList.length);
    
    if (participantsList && participantsList.length > 0) {
      console.log(`🐴 Creating ${participantsList.length} horses for race ${race.id}`);
      // Construire un map des positions d'arrivée
      const arrivalMap = new Map<number, number>();
      if (raceDetails.ordreArrivee && Array.isArray(raceDetails.ordreArrivee)) {
        console.log('ordreArrivee:', raceDetails.ordreArrivee);
        raceDetails.ordreArrivee.forEach((position: any[], index: number) => {
          if (position && position.length > 0) {
            position.forEach((horseNumber: number) => {
              arrivalMap.set(horseNumber, index + 1);
              console.log(`Horse ${horseNumber} finished at position ${index + 1}`);
            });
          }
        });
      }
      console.log('Arrival map:', Array.from(arrivalMap.entries()));

      for (const participant of participantsList) {
        const arrivalOrder = arrivalMap.get(participant.number) || participant.arrivalOrder || null;
        
        // Créer ou mettre à jour le cheval lié à cette course avec sa position si disponible
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
            arrivalOrder: arrivalOrder,
            recentForm: participant.recentForm || null,
            blinkers: participant.blinkers && participant.blinkers !== 'SANS_OEILLERES',
            unshod: participant.unshod || null,
            firstTime: participant.firstTime || false,
            odds: participant.odds || null,
          },
          update: {
            name: participant.name,
            arrivalOrder: arrivalOrder,
            recentForm: participant.recentForm || null,
            blinkers: participant.blinkers && participant.blinkers !== 'SANS_OEILLERES',
            unshod: participant.unshod || null,
            firstTime: participant.firstTime || false,
            odds: participant.odds || null,
          },
        });
      }
    }

    // Synchroniser les cotes et rapports si la course est terminée
    if (raceDetails.arriveeDefinitive) {
      try {
        // Mettre à jour les cotes depuis les rapports
        await this.pmuDataService.updateHorseOddsFromReports(
          race.id,
          parsedDate,
          reunion,
          course,
        );
        
        // Mettre à jour les types de paris disponibles depuis les rapports
        const raceWithReports = await this.prisma.pmuRace.findUnique({
          where: { id: race.id },
          include: { reports: true },
        });
        
        if (raceWithReports && raceWithReports.reports.length > 0) {
          const availableBetTypes = this.detectAvailableBetTypesFromReports(raceWithReports.reports);
          console.log('✅ Types de paris détectés depuis les rapports:', availableBetTypes);
          
          await this.prisma.pmuRace.update({
            where: { id: race.id },
            data: { availableBetTypes },
          });
          
          race.availableBetTypes = availableBetTypes;
        }
      } catch (error) {
        console.error('Error updating odds:', error);
        // Continue même si les cotes échouent
      }
    }

    // Convertir tous les BigInt en string pour la sérialisation JSON
    return JSON.parse(JSON.stringify(race, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));
  }

  // ===== ENDPOINTS DE VÉRIFICATION DES DONNÉES =====

  @Get('data/hippodromes')
  @ApiOperation({ summary: 'Get all stored hippodromes' })
  async getStoredHippodromes() {
    return this.prisma.pmuHippodrome.findMany({
      include: {
        _count: {
          select: { races: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  @Get('data/my-hippodromes')
  @ApiOperation({ summary: 'Get hippodromes where user has placed bets' })
  async getMyHippodromes(@Req() req) {
    const userId = req.user.sub;
    
    // Récupérer uniquement les hippodromes où l'utilisateur a des paris
    const hippodromes = await this.prisma.pmuHippodrome.findMany({
      where: {
        races: {
          some: {
            bets: {
              some: {
                userId: userId,
              },
            },
          },
        },
      },
      include: {
        _count: {
          select: { 
            races: {
              where: {
                bets: {
                  some: {
                    userId: userId,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });
    
    return hippodromes;
  }

  @Get('data/hippodrome-stats/:code')
  @ApiOperation({ summary: 'Get betting statistics for a specific hippodrome' })
  async getHippodromeStats(@Param('code') code: string, @Req() req) {
    const userId = req.user.sub;

    // Récupérer tous les paris de l'utilisateur pour cet hippodrome
    const bets = await this.prisma.bet.findMany({
      where: {
        userId,
        pmuRace: {
          hippodrome: {
            code,
          },
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

    // Calculer les statistiques
    const totalBets = bets.length;
    const totalStake = bets.reduce((sum, bet) => sum + Number(bet.stake), 0);
    const totalPayout = bets.reduce((sum, bet) => sum + Number(bet.payout || 0), 0);
    const profit = totalPayout - totalStake;
    const roi = totalStake > 0 ? ((profit / totalStake) * 100) : 0;
    
    const wonBets = bets.filter(bet => bet.status === 'won').length;
    const lostBets = bets.filter(bet => bet.status === 'lost').length;
    const pendingBets = bets.filter(bet => bet.status === 'pending').length;
    const winRate = totalBets > 0 ? ((wonBets / totalBets) * 100) : 0;

    // Stats par type de pari
    const betsByType = bets.reduce((acc, bet) => {
      const type = bet.betType || 'SIMPLE';
      if (!acc[type]) {
        acc[type] = { count: 0, stake: 0, payout: 0, won: 0 };
      }
      acc[type].count++;
      acc[type].stake += Number(bet.stake);
      acc[type].payout += Number(bet.payout || 0);
      if (bet.status === 'won') acc[type].won++;
      return acc;
    }, {} as Record<string, any>);

    // Stats par mois
    const betsByMonth = bets.reduce((acc, bet) => {
      const month = new Date(bet.createdAt).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short' });
      if (!acc[month]) {
        acc[month] = { count: 0, stake: 0, payout: 0, profit: 0 };
      }
      acc[month].count++;
      acc[month].stake += Number(bet.stake);
      acc[month].payout += Number(bet.payout || 0);
      acc[month].profit += Number(bet.payout || 0) - Number(bet.stake);
      return acc;
    }, {} as Record<string, any>);

    // Convertir tous les BigInt en string pour la sérialisation JSON
    const result = {
      hippodrome: await this.prisma.pmuHippodrome.findUnique({ where: { code } }),
      totalBets,
      totalStake,
      totalPayout,
      profit,
      roi,
      wonBets,
      lostBets,
      pendingBets,
      winRate,
      betsByType,
      betsByMonth,
      recentBets: bets.slice(0, 10).map(bet => ({
        ...bet,
        stake: bet.stake.toString(),
        payout: bet.payout?.toString() || null,
        odds: bet.odds?.toString() || null,
      })),
    };

    return JSON.parse(JSON.stringify(result, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));
  }

  @Get('data/races')
  @ApiOperation({ summary: 'Get all stored races' })
  async getStoredRaces(@Query('limit') limitStr?: string) {
    const limit = limitStr ? parseInt(limitStr, 10) : 50;
    const races = await this.prisma.pmuRace.findMany({
      take: Number.isNaN(limit) ? 50 : limit,
      include: {
        hippodrome: true,
        _count: {
          select: { horses: true, bets: true },
        },
      },
      orderBy: { date: 'desc' },
    });
    
    // Convert BigInt to string for JSON serialization
    return races.map(race => ({
      ...race,
      startTime: race.startTime ? race.startTime.toString() : null,
    }));
  }

  @Get('data/races/:id')
  @ApiOperation({ summary: 'Get race details with horses' })
  async getRaceById(@Param('id') id: string) {
    const race = await this.prisma.pmuRace.findUnique({
      where: { id },
      include: {
        hippodrome: true,
        horses: {
          orderBy: { number: 'asc' },
        },
        reports: {
          orderBy: { betType: 'asc' },
        },
        bets: {
          select: {
            id: true,
            date: true,
            stake: true,
            status: true,
            profit: true,
          },
        },
      },
    });
    
    if (!race) return null;
    
    // Si la course n'a pas de chevaux, essayer de les synchroniser automatiquement
    if (race.horses.length === 0) {
      console.log(`🔄 Course ${race.id} sans chevaux, synchronisation automatique...`);
      try {
        const participants = await this.pmuService.getRaceParticipants(
          race.date,
          race.reunionNumber,
          race.raceNumber
        );
        
        const participantsList = Array.isArray(participants) ? participants : (participants.participants || []);
        
        if (participantsList && participantsList.length > 0) {
          console.log(`🐴 Synchronisation de ${participantsList.length} chevaux`);
          
          for (const participant of participantsList) {
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
                blinkers: participant.blinkers && participant.blinkers !== 'SANS_OEILLERES',
                unshod: participant.unshod || null,
                firstTime: participant.firstTime || false,
                odds: participant.odds || null,
              },
              update: {
                name: participant.name,
                arrivalOrder: participant.arrivalOrder || null,
                recentForm: participant.recentForm || null,
                blinkers: participant.blinkers && participant.blinkers !== 'SANS_OEILLERES',
                unshod: participant.unshod || null,
                firstTime: participant.firstTime || false,
                odds: participant.odds || null,
              },
            });
          }
          
          // Recharger la course avec les chevaux
          return this.getRaceById(id);
        }
      } catch (error) {
        console.error('❌ Erreur lors de la synchronisation automatique:', error.message);
        // Continuer même en cas d'erreur
      }
    }
    
    // Convert BigInt to string and Decimal to number for JSON serialization
    return JSON.parse(JSON.stringify(race, (key, value) => {
      if (typeof value === 'bigint') {
        return value.toString();
      }
      if (value && typeof value === 'object' && value.constructor && value.constructor.name === 'Decimal') {
        return Number(value);
      }
      return value;
    }));
  }

  @Get('data/horses')
  @ApiOperation({ summary: 'Get all stored horses' })
  async getStoredHorses(@Query('limit') limitStr?: string) {
    const limit = limitStr ? parseInt(limitStr) : 100;
    const horses = await this.prisma.pmuHorse.findMany({
      take: limit,
      include: {
        race: {
          include: {
            hippodrome: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    
    // Convert BigInt to string and Decimal to number for JSON serialization
    return horses.map(horse => ({
      ...horse,
      odds: horse.odds ? Number(horse.odds) : null,
      race: horse.race ? {
        ...horse.race,
        startTime: horse.race.startTime ? horse.race.startTime.toString() : null,
      } : null,
    }));
  }

  @Get('data/stats')
  @ApiOperation({ summary: 'Get PMU data statistics' })
  async getStats() {
    const hippodromes = await this.prisma.pmuHippodrome.count();
    const races = await this.prisma.pmuRace.count();
    const horses = await this.prisma.pmuHorse.count();
    const betsLinkedToPmu = await this.prisma.bet.count({
      where: { pmuRaceId: { not: null } },
    });

    return {
      hippodromes,
      races,
      horses,
      betsLinkedToPmu,
    };
  }

  @Get('data/my-bet-horses-performance')
  @ApiOperation({ summary: 'Get performance of horses I have bet on' })
  async getMyBetHorsesPerformance() {
    // Récupérer tous les paris avec leurs courses PMU et chevaux
    const bets = await this.prisma.bet.findMany({
      where: {
        pmuRaceId: { not: null },
      },
      include: {
        pmuRace: {
          include: {
            horses: {
              include: {
                performances: {
                  where: {
                    arrivalPosition: { not: null },
                  },
                  orderBy: {
                    date: 'desc',
                  },
                },
              },
            },
          },
        },
      },
    });

    // Agréger les stats par nom de cheval
    const horseStatsMap = new Map();

    for (const bet of bets) {
      if (!bet.pmuRace) continue;

      for (const horse of bet.pmuRace.horses) {
        const horseName = horse.name;
        
        if (!horseStatsMap.has(horseName)) {
          horseStatsMap.set(horseName, {
            horseId: horse.id,
            horseName: horseName,
            totalRaces: 0,
            wins: 0,
            podiums: 0,
            totalPosition: 0,
            lastRace: null,
            betCount: 0,
          });
        }

        const stats = horseStatsMap.get(horseName);
        stats.betCount++; // Compter combien de fois on a parié sur ce cheval

        // Agréger les performances historiques si disponibles
        for (const perf of horse.performances) {
          if (!perf.arrivalPosition) continue;
          
          // Éviter de compter plusieurs fois la même performance
          const perfKey = `${perf.date}-${perf.hippodrome}`;
          if (!stats.processedPerfs) stats.processedPerfs = new Set();
          if (stats.processedPerfs.has(perfKey)) continue;
          stats.processedPerfs.add(perfKey);

          stats.totalRaces++;
          stats.totalPosition += perf.arrivalPosition;
          
          if (perf.arrivalPosition === 1) stats.wins++;
          if (perf.arrivalPosition <= 3) stats.podiums++;
          
          if (!stats.lastRace || new Date(perf.date) > new Date(stats.lastRace.date)) {
            stats.lastRace = {
              date: perf.date,
              hippodrome: perf.hippodrome,
              position: perf.arrivalPosition,
              odds: null,
            };
          }
        }

        // Si pas de performances historiques, utiliser les données de la course pariée
        if (stats.totalRaces === 0 && horse.arrivalOrder) {
          stats.totalRaces = 1;
          stats.totalPosition = horse.arrivalOrder;
          if (horse.arrivalOrder === 1) stats.wins = 1;
          if (horse.arrivalOrder <= 3) stats.podiums = 1;
          stats.lastRace = {
            date: bet.pmuRace.date,
            hippodrome: bet.pmuRace.hippodromeCode || 'Inconnu',
            position: horse.arrivalOrder,
            odds: horse.odds ? parseFloat(horse.odds.toString()) : null,
          };
        }
      }
    }

    // Calculer les moyennes et trier
    const horseStats = Array.from(horseStatsMap.values())
      .map(stats => ({
        horseId: stats.horseId,
        horseName: stats.horseName,
        totalRaces: stats.totalRaces,
        wins: stats.wins,
        podiums: stats.podiums,
        avgPosition: stats.totalRaces > 0 ? Math.round((stats.totalPosition / stats.totalRaces) * 10) / 10 : 0,
        avgOdds: 0,
        winRate: stats.totalRaces > 0 ? (stats.wins / stats.totalRaces) * 100 : 0,
        podiumRate: stats.totalRaces > 0 ? (stats.podiums / stats.totalRaces) * 100 : 0,
        lastRace: stats.lastRace,
      }))
      .sort((a, b) => {
        if (b.winRate !== a.winRate) return b.winRate - a.winRate;
        return b.totalRaces - a.totalRaces;
      });

    return horseStats;
  }

  @Get('data/horse-performance')
  @ApiOperation({ summary: 'Get horse performance statistics from collected historical data' })
  async getHorsePerformance() {
    // Récupérer les performances historiques directement (plus efficace)
    const performances = await this.prisma.pmuHorsePerformance.findMany({
      where: {
        arrivalPosition: { not: null },
      },
      include: {
        horse: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
      take: 5000, // Limiter à 5000 performances récentes
    });

    // Agréger les stats par nom de cheval
    const horseStatsMap = new Map();

    for (const perf of performances) {
      const horseName = perf.horse.name;
      
      if (!horseStatsMap.has(horseName)) {
        horseStatsMap.set(horseName, {
          horseId: perf.horse.id,
          horseName: horseName,
          totalRaces: 0,
          wins: 0,
          podiums: 0,
          totalPosition: 0,
          lastRace: null,
        });
      }

      const stats = horseStatsMap.get(horseName);
      stats.totalRaces++;
      stats.totalPosition += perf.arrivalPosition!;
      
      if (perf.arrivalPosition === 1) stats.wins++;
      if (perf.arrivalPosition! <= 3) stats.podiums++;
      
      // Update last race
      if (!stats.lastRace || new Date(perf.date) > new Date(stats.lastRace.date)) {
        stats.lastRace = {
          date: perf.date,
          hippodrome: perf.hippodrome,
          position: perf.arrivalPosition!,
          odds: null,
        };
      }
    }

    // Calculer les moyennes et trier
    const horseStats = Array.from(horseStatsMap.values())
      .map(stats => ({
        horseId: stats.horseId,
        horseName: stats.horseName,
        totalRaces: stats.totalRaces,
        wins: stats.wins,
        podiums: stats.podiums,
        avgPosition: stats.totalRaces > 0 ? Math.round((stats.totalPosition / stats.totalRaces) * 10) / 10 : 0,
        avgOdds: 0, // Not available in historical data
        winRate: stats.totalRaces > 0 ? (stats.wins / stats.totalRaces) * 100 : 0,
        podiumRate: stats.totalRaces > 0 ? (stats.podiums / stats.totalRaces) * 100 : 0,
        lastRace: stats.lastRace,
      }))
      .filter(stats => stats.totalRaces >= 3) // Au moins 3 courses pour avoir des stats significatives
      .sort((a, b) => {
        // Trier par taux de victoire, puis par nombre de courses
        if (b.winRate !== a.winRate) return b.winRate - a.winRate;
        return b.totalRaces - a.totalRaces;
      });

    return horseStats.slice(0, 100); // Top 100 chevaux
  }

  @Get('data/races/:id/update-odds')
  @ApiOperation({ summary: 'Update horse odds from race reports' })
  async updateRaceOdds(@Param('id') raceId: string) {
    const race = await this.prisma.pmuRace.findUnique({
      where: { id: raceId },
    });

    if (!race) {
      throw new HttpException('Race not found', HttpStatus.NOT_FOUND);
    }

    await this.pmuDataService.updateHorseOddsFromReports(
      raceId,
      new Date(race.date),
      race.reunionNumber,
      race.raceNumber,
    );

    return { message: 'Odds updated successfully' };
  }

  @Get('data/races/:id/odds')
  @ApiOperation({ summary: 'Get odds for a specific bet' })
  async getOddsForBet(
    @Param('id') raceId: string,
    @Query('betType') betType: string,
    @Query('horses') horses: string,
  ) {
    const odds = await this.pmuDataService.getOddsForBet(raceId, betType, horses);
    return { odds };
  }

  @Get('test/reports/:date/:reunion/:race')
  @ApiOperation({ summary: 'Test - Get raw PMU reports JSON' })
  async testGetReports(
    @Param('date') dateStr: string,
    @Param('reunion') reunion: string,
    @Param('race') race: string,
  ) {
    const date = new Date(dateStr);
    const reports = await this.pmuService.getRaceReports(date, parseInt(reunion), parseInt(race));
    return reports;
  }

}

// Contrôleur séparé pour les tests
@ApiTags('PMU Test')
@ApiBearerAuth()
@Controller('pmu-test')
@UseGuards(JwtAuthGuard)
export class PmuTestController {
  constructor(
    private readonly pmuService: PmuService,
    private readonly pmuDataService: PmuDataService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('sync-today')
  @ApiOperation({ summary: 'Test - Manually sync today\'s program' })
  async testSyncToday() {
    const { PmuDailySyncService } = await import('./pmu-daily-sync.service');
    const syncService = new PmuDailySyncService(
      this.prisma,
      this.pmuService,
      this.pmuDataService,
    );
    
    await syncService.syncDailyProgram();
    return { message: 'Daily program sync triggered' };
  }

  @Get('sync-yesterday-results')
  @ApiOperation({ summary: 'Test - Manually sync yesterday\'s results' })
  async testSyncYesterdayResults() {
    const { PmuDailySyncService } = await import('./pmu-daily-sync.service');
    const syncService = new PmuDailySyncService(
      this.prisma,
      this.pmuService,
      this.pmuDataService,
    );
    
    await syncService.syncDailyResults();
    return { message: 'Yesterday results sync triggered' };
  }

  @Get('horse-performance')
  @ApiOperation({ summary: 'Test - View horse performance stats' })
  async testHorsePerformance() {
    // Récupérer tous les chevaux avec leurs résultats
    const horses = await this.prisma.pmuHorse.findMany({
      where: {
        arrivalOrder: { not: null },
      },
      include: {
        race: {
          include: {
            hippodrome: true,
          },
        },
      },
      take: 20,
    });

    return {
      total: horses.length,
      horses: horses.map(h => ({
        name: h.name,
        number: h.number,
        position: h.arrivalOrder,
        race: `R${h.race.reunionNumber}C${h.race.raceNumber}`,
        hippodrome: h.race.hippodrome.name,
        date: h.race.date,
      })),
    };
  }

  @Get('my-jockey-stats')
  @ApiOperation({ summary: 'Get jockey performance statistics from user bets' })
  async getMyJockeyStats(@Req() req) {
    const userId = req.user.sub;

    // Récupérer les IDs des courses où l'utilisateur a parié
    const userBets = await this.prisma.bet.findMany({
      where: { userId, pmuRaceId: { not: null } },
      select: { pmuRaceId: true },
    });

    console.log('🎯 User bets with PMU races:', userBets.length);

    const raceIds = [...new Set(userBets.map(b => b.pmuRaceId).filter(Boolean))];

    console.log('🏇 Unique race IDs:', raceIds.length);

    if (raceIds.length === 0) {
      return { total: 0, topJockeys: [] };
    }

    // Récupérer les chevaux de ces courses avec leurs performances
    const horses = await this.prisma.pmuHorse.findMany({
      where: {
        raceId: { in: raceIds as string[] },
      },
      select: {
        name: true,
        performances: {
          where: {
            jockey: { not: null },
            arrivalPosition: { not: null },
          },
          select: {
            jockey: true,
            arrivalPosition: true,
          },
        },
      },
    });

    console.log('🐴 Horses found:', horses.length);
    console.log('🔍 Sample horse:', horses[0]);

    // Aplatir les performances
    const performances = horses.flatMap(horse => 
      horse.performances.map(perf => ({
        jockey: perf.jockey,
        arrivalPosition: perf.arrivalPosition,
        horseName: horse.name,
      }))
    );

    console.log('📊 Performances found:', performances.length);

    // Si pas de performances dans PmuHorsePerformance, essayer de les récupérer depuis l'API PMU
    if (performances.length === 0) {
      console.log('⚠️ No performances found - Trying to fetch from PMU API');
      
      try {
        // Pour chaque course, récupérer les détails et créer les performances
        let syncedCount = 0;
        for (const raceId of raceIds) { // Synchroniser toutes les courses de l'utilisateur
          const race = await this.prisma.pmuRace.findUnique({
            where: { id: raceId as string },
            include: { hippodrome: true },
          });

          if (!race) continue;

          const raceDate = new Date(race.date);
          
          // Récupérer les participants de la course depuis l'API PMU
          try {
            const participants = await this.pmuService.getRaceParticipants(
              raceDate,
              race.reunionNumber,
              race.raceNumber
            );

            console.log(`📋 Participants structure:`, {
              hasParticipants: !!participants,
              participantsCount: participants?.length || 0,
              sampleParticipant: participants?.[0],
            });

            if (participants && participants.length > 0) {
              // Créer les performances pour chaque cheval
              for (const participant of participants) {
                console.log(`🐴 Processing participant:`, {
                  nom: participant.nom,
                  jockey: participant.jockey,
                  ordreArrivee: participant.ordreArrivee,
                });
                
                if (!participant.nom || !participant.jockey) {
                  console.log(`⚠️ Skipping - missing nom or jockey`);
                  continue;
                }

                // Trouver le cheval correspondant
                const horse = await this.prisma.pmuHorse.findFirst({
                  where: {
                    raceId: race.id,
                    name: participant.nom,
                  },
                });

                if (!horse) {
                  console.log(`⚠️ Horse not found in DB: ${participant.nom} for race ${race.id}`);
                  continue;
                }

                // Créer la performance
                await this.prisma.pmuHorsePerformance.create({
                  data: {
                    horseId: horse.id,
                    date: race.date,
                    hippodrome: race.hippodrome.name,
                    raceName: race.name,
                    discipline: race.discipline,
                    distance: race.distance,
                    prize: race.prize,
                    nbParticipants: participants.length,
                    arrivalPosition: participant.ordreArrivee || null,
                    status: participant.ordreArrivee ? 'PLACE' : 'NON_PLACE',
                    jockey: participant.jockey,
                    rawData: participant,
                  },
                });
                console.log(`✅ Created performance for ${participant.nom} with jockey ${participant.jockey}`);
                syncedCount++;
              }
            }
          } catch (err) {
            console.log(`Failed to sync race ${race.reunionNumber}C${race.raceNumber}:`, err.message);
          }
        }

        console.log(`✅ Synced ${syncedCount} performances`);

        if (syncedCount === 0) {
          return { 
            total: 0, 
            topJockeys: [],
            message: 'Aucune donnée de jockey disponible pour vos courses.'
          };
        }

        // Recharger TOUTES les performances depuis la base
        const newHorses = await this.prisma.pmuHorse.findMany({
          where: { raceId: { in: raceIds as string[] } },
          select: {
            name: true,
            performances: {
              where: {
                jockey: { not: null },
                arrivalPosition: { not: null },
              },
              select: {
                jockey: true,
                arrivalPosition: true,
              },
            },
          },
        });

        console.log(`🔄 Reloaded ${newHorses.length} horses from DB`);

        const newPerformances = newHorses.flatMap(horse => 
          horse.performances.map(perf => ({
            jockey: perf.jockey,
            arrivalPosition: perf.arrivalPosition,
            horseName: horse.name,
          }))
        );

        console.log(`📊 Total performances after reload: ${newPerformances.length}`);

        if (newPerformances.length === 0) {
          return { 
            total: 0, 
            topJockeys: [],
            message: 'Aucune donnée de jockey disponible pour vos courses.'
          };
        }

        // Remplacer les performances vides par les nouvelles
        performances.length = 0;
        performances.push(...newPerformances);
      } catch (error) {
        console.error('Failed to sync performances:', error);
        return { 
          total: 0, 
          topJockeys: [],
          message: 'Erreur lors de la récupération des données.'
        };
      }
    }

    // Agréger par jockey
    const jockeyStatsMap = new Map();

    for (const perf of performances) {
      const jockey = perf.jockey!;
      
      if (!jockeyStatsMap.has(jockey)) {
        jockeyStatsMap.set(jockey, {
          jockey,
          totalRaces: 0,
          wins: 0,
          podiums: 0,
          top5: 0,
          avgPosition: 0,
          totalPosition: 0,
          horses: new Set(),
        });
      }

      const stats = jockeyStatsMap.get(jockey);
      stats.totalRaces++;
      stats.totalPosition += perf.arrivalPosition!;
      stats.horses.add(perf.horseName);
      
      if (perf.arrivalPosition === 1) stats.wins++;
      if (perf.arrivalPosition! <= 3) stats.podiums++;
      if (perf.arrivalPosition! <= 5) stats.top5++;
    }

    // Calculer les stats finales et trier
    const jockeyStats = Array.from(jockeyStatsMap.values())
      .map(stats => ({
        jockey: stats.jockey,
        totalRaces: stats.totalRaces,
        wins: stats.wins,
        podiums: stats.podiums,
        top5: stats.top5,
        winRate: (stats.wins / stats.totalRaces) * 100,
        podiumRate: (stats.podiums / stats.totalRaces) * 100,
        avgPosition: Math.round((stats.totalPosition / stats.totalRaces) * 10) / 10,
        uniqueHorses: stats.horses.size,
      }))
      .filter(stats => stats.totalRaces >= 1) // Au moins 1 course
      .sort((a, b) => b.winRate - a.winRate);

    console.log(`📊 Final jockey stats: ${jockeyStats.length} jockeys`);

    return {
      total: jockeyStats.length,
      topJockeys: jockeyStats,
    };
  }

  @Get('debug/raw-data/:horseId')
  @ApiOperation({ summary: 'Debug: Get raw PMU data for a horse performance' })
  async getDebugRawData(@Param('horseId') horseId: string) {
    const performance = await this.prisma.pmuHorsePerformance.findFirst({
      where: { horseId },
      orderBy: { date: 'desc' },
    });

    if (!performance) {
      throw new NotFoundException('No performance found for this horse');
    }

    return {
      id: performance.id,
      date: performance.date,
      jockey: performance.jockey,
      trainer: performance.trainer,
      rawData: performance.rawData,
    };
  }

  @Get('jockey-stats')
  @ApiOperation({ summary: 'Get jockey performance statistics' })
  async getJockeyStats() {
    // Get all performances with jockey info (limiter pour éviter surcharge mémoire)
    const performances = await this.prisma.pmuHorsePerformance.findMany({
      where: {
        jockey: { not: null },
        arrivalPosition: { not: null },
        rawData: { not: Prisma.JsonNull },
      },
      select: {
        jockey: true,
        arrivalPosition: true,
        horse: {
          select: {
            name: true,
          },
        },
      },
      take: 10000, // Limiter à 10000 performances max pour éviter crash
    });

    // Aggregate by jockey
    const jockeyStatsMap = new Map();

    for (const perf of performances) {
      const jockey = perf.jockey!;
      
      if (!jockeyStatsMap.has(jockey)) {
        jockeyStatsMap.set(jockey, {
          jockey,
          totalRaces: 0,
          wins: 0,
          podiums: 0,
          top5: 0,
          avgPosition: 0,
          totalPosition: 0,
          horses: new Set(),
        });
      }

      const stats = jockeyStatsMap.get(jockey);
      stats.totalRaces++;
      stats.totalPosition += perf.arrivalPosition!;
      stats.horses.add(perf.horse.name);
      
      if (perf.arrivalPosition === 1) stats.wins++;
      if (perf.arrivalPosition! <= 3) stats.podiums++;
      if (perf.arrivalPosition! <= 5) stats.top5++;
    }

    // Calculate final stats and sort
    const jockeyStats = Array.from(jockeyStatsMap.values())
      .map(stats => ({
        jockey: stats.jockey,
        totalRaces: stats.totalRaces,
        wins: stats.wins,
        podiums: stats.podiums,
        top5: stats.top5,
        winRate: (stats.wins / stats.totalRaces) * 100,
        podiumRate: (stats.podiums / stats.totalRaces) * 100,
        avgPosition: Math.round((stats.totalPosition / stats.totalRaces) * 10) / 10,
        uniqueHorses: stats.horses.size,
      }))
      .filter(stats => stats.totalRaces >= 5) // Au moins 5 courses
      .sort((a, b) => b.winRate - a.winRate);

    return {
      total: jockeyStats.length,
      topJockeys: jockeyStats.slice(0, 50), // Limiter à 50 max pour éviter surcharge
    };
  }

  @Get('my-cross-stats')
  @ApiOperation({ summary: 'Get cross-statistics for user bets: hippodrome-jockey-horse combinations' })
  async getMyCrossStats(@Req() req) {
    const userId = req.user.sub;

    // Récupérer les IDs des courses où l'utilisateur a parié
    const userBets = await this.prisma.bet.findMany({
      where: { userId, pmuRaceId: { not: null } },
      select: { pmuRaceId: true },
    });

    const raceIds = [...new Set(userBets.map(b => b.pmuRaceId).filter(Boolean))];

    if (raceIds.length === 0) {
      return {
        hippodromeJockey: [],
        hippodromeHorse: [],
        tripleCombinations: [],
      };
    }

    // Récupérer les performances des courses de l'utilisateur
    const performances = await this.prisma.pmuHorsePerformance.findMany({
      where: {
        jockey: { not: null },
        arrivalPosition: { not: null },
        horse: {
          raceId: { in: raceIds as string[] },
        },
      },
      include: {
        horse: {
          select: {
            name: true,
          },
        },
      },
    });

    console.log(`📊 Cross-stats: ${performances.length} performances from ${raceIds.length} races`);

    // 1. Hippodrome + Jockey combinations
    const hippoJockeyMap = new Map();
    
    // 2. Hippodrome + Horse combinations
    const hippoHorseMap = new Map();
    
    // 3. Triple combinations (Hippodrome + Jockey + Horse)
    const tripleMap = new Map();

    for (const perf of performances) {
      const hippoJockeyKey = `${perf.hippodrome}|${perf.jockey}`;
      const hippoHorseKey = `${perf.hippodrome}|${perf.horse.name}`;
      const tripleKey = `${perf.hippodrome}|${perf.jockey}|${perf.horse.name}`;

      // Hippodrome + Jockey
      if (!hippoJockeyMap.has(hippoJockeyKey)) {
        hippoJockeyMap.set(hippoJockeyKey, {
          hippodrome: perf.hippodrome,
          jockey: perf.jockey!,
          totalRaces: 0,
          wins: 0,
          podiums: 0,
          totalPosition: 0,
        });
      }
      const hjStats = hippoJockeyMap.get(hippoJockeyKey);
      hjStats.totalRaces++;
      hjStats.totalPosition += perf.arrivalPosition!;
      if (perf.arrivalPosition === 1) hjStats.wins++;
      if (perf.arrivalPosition! <= 3) hjStats.podiums++;

      // Hippodrome + Horse
      if (!hippoHorseMap.has(hippoHorseKey)) {
        hippoHorseMap.set(hippoHorseKey, {
          hippodrome: perf.hippodrome,
          horseName: perf.horse.name,
          totalRaces: 0,
          wins: 0,
          podiums: 0,
          totalPosition: 0,
        });
      }
      const hhStats = hippoHorseMap.get(hippoHorseKey);
      hhStats.totalRaces++;
      hhStats.totalPosition += perf.arrivalPosition!;
      if (perf.arrivalPosition === 1) hhStats.wins++;
      if (perf.arrivalPosition! <= 3) hhStats.podiums++;

      // Triple combination
      if (!tripleMap.has(tripleKey)) {
        tripleMap.set(tripleKey, {
          hippodrome: perf.hippodrome,
          jockey: perf.jockey!,
          horseName: perf.horse.name,
          totalRaces: 0,
          wins: 0,
          podiums: 0,
          totalPosition: 0,
        });
      }
      const tripleStats = tripleMap.get(tripleKey);
      tripleStats.totalRaces++;
      tripleStats.totalPosition += perf.arrivalPosition!;
      if (perf.arrivalPosition === 1) tripleStats.wins++;
      if (perf.arrivalPosition! <= 3) tripleStats.podiums++;
    }

    // Process and sort results
    const processStats = (statsMap: Map<string, any>, minRaces: number) => {
      return Array.from(statsMap.values())
        .map(stats => ({
          ...stats,
          winRate: (stats.wins / stats.totalRaces) * 100,
          podiumRate: (stats.podiums / stats.totalRaces) * 100,
          avgPosition: Math.round((stats.totalPosition / stats.totalRaces) * 10) / 10,
        }))
        .filter(stats => stats.totalRaces >= minRaces)
        .sort((a, b) => {
          if (b.winRate !== a.winRate) return b.winRate - a.winRate;
          return b.totalRaces - a.totalRaces;
        });
    };

    return {
      hippodromeJockey: processStats(hippoJockeyMap, 1),
      hippodromeHorse: processStats(hippoHorseMap, 1),
      tripleCombinations: processStats(tripleMap, 1),
    };
  }

  @Get('cross-stats')
  @ApiOperation({ summary: 'Get cross-statistics: hippodrome-jockey-horse combinations' })
  async getCrossStats() {
    // Get all performances with complete data (limiter pour éviter crash)
    const performances = await this.prisma.pmuHorsePerformance.findMany({
      where: {
        jockey: { not: null },
        arrivalPosition: { not: null },
        rawData: { not: Prisma.JsonNull },
      },
      include: {
        horse: {
          select: {
            name: true,
          },
        },
      },
      take: 10000, // Limiter à 10000 performances max
    });

    // 1. Hippodrome + Jockey combinations
    const hippoJockeyMap = new Map();
    
    // 2. Hippodrome + Horse combinations
    const hippoHorseMap = new Map();
    
    // 3. Triple combinations (Hippodrome + Jockey + Horse)
    const tripleMap = new Map();

    for (const perf of performances) {
      const hippoJockeyKey = `${perf.hippodrome}|${perf.jockey}`;
      const hippoHorseKey = `${perf.hippodrome}|${perf.horse.name}`;
      const tripleKey = `${perf.hippodrome}|${perf.jockey}|${perf.horse.name}`;

      // Hippodrome + Jockey
      if (!hippoJockeyMap.has(hippoJockeyKey)) {
        hippoJockeyMap.set(hippoJockeyKey, {
          hippodrome: perf.hippodrome,
          jockey: perf.jockey!,
          totalRaces: 0,
          wins: 0,
          podiums: 0,
          totalPosition: 0,
        });
      }
      const hjStats = hippoJockeyMap.get(hippoJockeyKey);
      hjStats.totalRaces++;
      hjStats.totalPosition += perf.arrivalPosition!;
      if (perf.arrivalPosition === 1) hjStats.wins++;
      if (perf.arrivalPosition! <= 3) hjStats.podiums++;

      // Hippodrome + Horse
      if (!hippoHorseMap.has(hippoHorseKey)) {
        hippoHorseMap.set(hippoHorseKey, {
          hippodrome: perf.hippodrome,
          horseName: perf.horse.name,
          totalRaces: 0,
          wins: 0,
          podiums: 0,
          totalPosition: 0,
        });
      }
      const hhStats = hippoHorseMap.get(hippoHorseKey);
      hhStats.totalRaces++;
      hhStats.totalPosition += perf.arrivalPosition!;
      if (perf.arrivalPosition === 1) hhStats.wins++;
      if (perf.arrivalPosition! <= 3) hhStats.podiums++;

      // Triple combination
      if (!tripleMap.has(tripleKey)) {
        tripleMap.set(tripleKey, {
          hippodrome: perf.hippodrome,
          jockey: perf.jockey!,
          horseName: perf.horse.name,
          totalRaces: 0,
          wins: 0,
          podiums: 0,
          totalPosition: 0,
        });
      }
      const tripleStats = tripleMap.get(tripleKey);
      tripleStats.totalRaces++;
      tripleStats.totalPosition += perf.arrivalPosition!;
      if (perf.arrivalPosition === 1) tripleStats.wins++;
      if (perf.arrivalPosition! <= 3) tripleStats.podiums++;
    }

    // Process and sort results
    const processStats = (statsMap: Map<string, any>, minRaces: number) => {
      return Array.from(statsMap.values())
        .map(stats => ({
          ...stats,
          winRate: (stats.wins / stats.totalRaces) * 100,
          podiumRate: (stats.podiums / stats.totalRaces) * 100,
          avgPosition: Math.round((stats.totalPosition / stats.totalRaces) * 10) / 10,
        }))
        .filter(stats => stats.totalRaces >= minRaces)
        .sort((a, b) => {
          if (b.winRate !== a.winRate) return b.winRate - a.winRate;
          return b.totalRaces - a.totalRaces;
        });
    };

    return {
      hippodromeJockey: {
        total: hippoJockeyMap.size,
        top: processStats(hippoJockeyMap, 3).slice(0, 50), // Limiter à 50
      },
      hippodromeHorse: {
        total: hippoHorseMap.size,
        top: processStats(hippoHorseMap, 3).slice(0, 50), // Limiter à 50
      },
      tripleCombinations: {
        total: tripleMap.size,
        top: processStats(tripleMap, 2).slice(0, 30), // Limiter à 30
      },
    };
  }

  @Get('my-horse-jockey-combinations')
  @ApiOperation({ summary: 'Get best horse-jockey combinations from user bets' })
  async getMyHorseJockeyCombinations(@Req() req) {
    const userId = req.user.sub;

    // Récupérer les IDs des courses où l'utilisateur a parié
    const userBets = await this.prisma.bet.findMany({
      where: { userId, pmuRaceId: { not: null } },
      select: { pmuRaceId: true },
    });

    const raceIds = [...new Set(userBets.map(b => b.pmuRaceId).filter(Boolean))];

    if (raceIds.length === 0) {
      return { total: 0, topCombinations: [] };
    }

    // Récupérer les performances des courses de l'utilisateur
    const performances = await this.prisma.pmuHorsePerformance.findMany({
      where: {
        jockey: { not: null },
        arrivalPosition: { not: null },
        horse: {
          raceId: { in: raceIds as string[] },
        },
      },
      select: {
        jockey: true,
        arrivalPosition: true,
        horse: {
          select: {
            name: true,
          },
        },
      },
    });

    console.log(`🤝 Horse-Jockey combinations: ${performances.length} performances`);

    // Aggregate by horse-jockey combination
    const combinationMap = new Map();

    for (const perf of performances) {
      const key = `${perf.horse.name}|${perf.jockey}`;
      
      if (!combinationMap.has(key)) {
        combinationMap.set(key, {
          horseName: perf.horse.name,
          jockey: perf.jockey!,
          totalRaces: 0,
          wins: 0,
          podiums: 0,
          avgPosition: 0,
          totalPosition: 0,
        });
      }

      const stats = combinationMap.get(key);
      stats.totalRaces++;
      stats.totalPosition += perf.arrivalPosition!;
      
      if (perf.arrivalPosition === 1) stats.wins++;
      if (perf.arrivalPosition! <= 3) stats.podiums++;
    }

    // Calculate final stats and sort
    const combinations = Array.from(combinationMap.values())
      .map(stats => ({
        horseName: stats.horseName,
        jockey: stats.jockey,
        totalRaces: stats.totalRaces,
        wins: stats.wins,
        podiums: stats.podiums,
        winRate: (stats.wins / stats.totalRaces) * 100,
        podiumRate: (stats.podiums / stats.totalRaces) * 100,
        avgPosition: Math.round((stats.totalPosition / stats.totalRaces) * 10) / 10,
      }))
      .filter(stats => stats.totalRaces >= 1) // Au moins 1 course
      .sort((a, b) => {
        if (b.winRate !== a.winRate) return b.winRate - a.winRate;
        return b.totalRaces - a.totalRaces;
      });

    return {
      total: combinations.length,
      topCombinations: combinations,
    };
  }

  @Get('horse-jockey-combinations')
  @ApiOperation({ summary: 'Get best horse-jockey combinations' })
  async getHorseJockeyCombinations() {
    // Get all performances with horse and jockey (limiter pour éviter crash)
    const performances = await this.prisma.pmuHorsePerformance.findMany({
      where: {
        jockey: { not: null },
        arrivalPosition: { not: null },
        rawData: { not: Prisma.JsonNull },
      },
      select: {
        jockey: true,
        arrivalPosition: true,
        horse: {
          select: {
            name: true,
          },
        },
      },
      take: 10000, // Limiter à 10000 performances max
    });

    // Aggregate by horse-jockey combination
    const combinationMap = new Map();

    for (const perf of performances) {
      const key = `${perf.horse.name}|${perf.jockey}`;
      
      if (!combinationMap.has(key)) {
        combinationMap.set(key, {
          horseName: perf.horse.name,
          jockey: perf.jockey!,
          totalRaces: 0,
          wins: 0,
          podiums: 0,
          avgPosition: 0,
          totalPosition: 0,
        });
      }

      const stats = combinationMap.get(key);
      stats.totalRaces++;
      stats.totalPosition += perf.arrivalPosition!;
      
      if (perf.arrivalPosition === 1) stats.wins++;
      if (perf.arrivalPosition! <= 3) stats.podiums++;
    }

    // Calculate final stats and sort
    const combinations = Array.from(combinationMap.values())
      .map(stats => ({
        horseName: stats.horseName,
        jockey: stats.jockey,
        totalRaces: stats.totalRaces,
        wins: stats.wins,
        podiums: stats.podiums,
        winRate: (stats.wins / stats.totalRaces) * 100,
        podiumRate: (stats.podiums / stats.totalRaces) * 100,
        avgPosition: Math.round((stats.totalPosition / stats.totalRaces) * 10) / 10,
      }))
      .filter(stats => stats.totalRaces >= 3) // Au moins 3 courses ensemble
      .sort((a, b) => {
        // Sort by win rate, then by number of races
        if (b.winRate !== a.winRate) return b.winRate - a.winRate;
        return b.totalRaces - a.totalRaces;
      });

    return {
      total: combinations.length,
      topCombinations: combinations.slice(0, 50), // Limiter à 50 max
    };
  }

  @Get('horse-by-name/:horseName/performances')
  @ApiOperation({ summary: 'Get historical performances for a horse by name' })
  async getHorsePerformancesByName(@Param('horseName') horseName: string) {
    // Get all horses with this name and their performances with rawData
    const allHorsesWithSameName = await this.prisma.pmuHorse.findMany({
      where: { name: horseName },
      include: {
        performances: {
          where: {
            rawData: { not: Prisma.JsonNull }, // Only get performances with rawData (competitors info)
          },
          orderBy: { date: 'desc' },
        },
      },
    });

    if (allHorsesWithSameName.length === 0) {
      return {
        horseName,
        performances: [],
        stats: null,
      };
    }

    // Aggregate all performances
    const allPerformances = allHorsesWithSameName.flatMap(h => h.performances);
    const performances = allPerformances
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);

    if (performances.length === 0) {
      return {
        horseName,
        performances: [],
        stats: null,
      };
    }

    // Calculate statistics
    const totalRaces = performances.length;
    const wins = performances.filter(p => p.arrivalPosition === 1).length;
    const podiums = performances.filter(p => p.arrivalPosition && p.arrivalPosition <= 3).length;
    const avgPosition = performances
      .filter(p => p.arrivalPosition)
      .reduce((sum, p) => sum + p.arrivalPosition!, 0) / performances.filter(p => p.arrivalPosition).length;

    return {
      horseName,
      performances: performances.map(p => ({
        date: p.date,
        hippodrome: p.hippodrome,
        raceName: p.raceName,
        discipline: p.discipline,
        distance: p.distance,
        prize: p.prize,
        nbParticipants: p.nbParticipants,
        position: p.arrivalPosition,
        status: p.status,
        jockey: p.jockey,
        competitors: (p.rawData as any)?.participants || [], // Include all competitors from raw data
      })),
      stats: {
        totalRaces,
        wins,
        podiums,
        winRate: (wins / totalRaces) * 100,
        podiumRate: (podiums / totalRaces) * 100,
        avgPosition: Math.round(avgPosition * 10) / 10,
        hippodromeStats: {},
      },
    };
  }

  @Get('horse/:horseId/performances')
  @ApiOperation({ summary: 'Get historical performances for a horse by ID or name' })
  async getHorsePerformances(@Param('horseId') horseId: string) {
    // First, try to find the horse by ID
    const horse = await this.prisma.pmuHorse.findUnique({
      where: { id: horseId },
    });

    if (!horse) {
      return {
        horseId,
        performances: [],
        stats: null,
      };
    }

    // Get all horses with the same name (same horse, different races)
    const allHorsesWithSameName = await this.prisma.pmuHorse.findMany({
      where: { name: horse.name },
      include: {
        performances: {
          orderBy: { date: 'desc' },
        },
      },
    });

    // Aggregate all performances from all instances of this horse
    const allPerformances = allHorsesWithSameName.flatMap(h => h.performances);
    
    // Sort by date and take top 10
    const performances = allPerformances
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);

    if (performances.length === 0) {
      return {
        horseId,
        performances: [],
        stats: null,
      };
    }

    // Calculate statistics
    const totalRaces = performances.length;
    const wins = performances.filter(p => p.arrivalPosition === 1).length;
    const podiums = performances.filter(p => p.arrivalPosition && p.arrivalPosition <= 3).length;
    const avgPosition = performances
      .filter(p => p.arrivalPosition)
      .reduce((sum, p) => sum + p.arrivalPosition!, 0) / performances.filter(p => p.arrivalPosition).length;

    // Group by hippodrome
    const hippodromeStats = performances.reduce((acc, p) => {
      if (!acc[p.hippodrome]) {
        acc[p.hippodrome] = { races: 0, wins: 0, podiums: 0, avgPosition: [] };
      }
      acc[p.hippodrome].races++;
      if (p.arrivalPosition === 1) acc[p.hippodrome].wins++;
      if (p.arrivalPosition && p.arrivalPosition <= 3) acc[p.hippodrome].podiums++;
      if (p.arrivalPosition) acc[p.hippodrome].avgPosition.push(p.arrivalPosition);
      return acc;
    }, {} as Record<string, any>);

    // Calculate average position per hippodrome
    Object.keys(hippodromeStats).forEach(key => {
      const positions = hippodromeStats[key].avgPosition;
      hippodromeStats[key].avgPosition = positions.length > 0
        ? positions.reduce((sum: number, p: number) => sum + p, 0) / positions.length
        : null;
    });

    return {
      horseId,
      performances: performances.map(p => ({
        date: p.date,
        hippodrome: p.hippodrome,
        raceName: p.raceName,
        discipline: p.discipline,
        distance: p.distance,
        prize: p.prize,
        nbParticipants: p.nbParticipants,
        position: p.arrivalPosition,
        status: p.status,
        jockey: p.jockey,
      })),
      stats: {
        totalRaces,
        wins,
        podiums,
        winRate: (wins / totalRaces) * 100,
        podiumRate: (podiums / totalRaces) * 100,
        avgPosition: Math.round(avgPosition * 10) / 10,
        hippodromeStats,
      },
    };
  }

  @Public()
  @Get('public/races')
  @ApiOperation({ summary: 'Get races from database for a specific date (public access)' })
  async getPublicRaces(@Query('date') dateStr: string) {
    // Parse and validate date
    if (!dateStr) {
      throw new HttpException('Date parameter is required (format: YYYY-MM-DD)', HttpStatus.BAD_REQUEST);
    }

    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      throw new HttpException('Invalid date format. Use YYYY-MM-DD', HttpStatus.BAD_REQUEST);
    }

    // Set date to start of day (00:00:00) for accurate comparison
    date.setHours(0, 0, 0, 0);
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    // Fetch races from database for the specified date
    const races = await this.prisma.pmuRace.findMany({
      where: {
        date: {
          gte: date,
          lt: nextDay,
        },
      },
      include: {
        hippodrome: true,
      },
      orderBy: [
        { reunionNumber: 'asc' },
        { raceNumber: 'asc' },
      ],
    });

    // Format races for frontend
    return races.map(race => ({
      id: `${race.hippodromeCode}-R${race.reunionNumber}-C${race.raceNumber}`,
      hippodrome: race.hippodrome.name,
      reunionNumber: race.reunionNumber,
      raceNumber: race.raceNumber,
      name: race.name || `Course ${race.raceNumber}`,
      startTime: race.startTime ? new Date(Number(race.startTime)).toTimeString().substring(0, 5) : null,
      discipline: race.discipline || 'N/A',
      distance: race.distance || 0,
      prize: race.prize || 0,
      betTypes: race.availableBetTypes || ['Simple Gagnant', 'Simple Placé'],
    }));
  }
}
