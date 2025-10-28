import { Injectable, NotFoundException, ForbiddenException, Inject, forwardRef, Optional } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateBetDto } from './dto/create-bet.dto';
import { UpdateBetDto } from './dto/update-bet.dto';
import { BetFiltersDto } from './dto/bet-filters.dto';
import { BetQueryDto } from './dto/bet-query.dto';
import { TransactionType } from '../platforms/dto/create-transaction.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { PmuDataService } from '../pmu/pmu-data.service';
import { AuditLogService } from '../admin/audit-log.service';
import { Decimal } from '@prisma/client/runtime/library';
import { Prisma } from '@prisma/client';

@Injectable()
export class BetsService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => NotificationsService))
    private notificationsService: NotificationsService,
    private auditLog: AuditLogService,
    @Optional() private pmuDataService?: PmuDataService,
  ) {}

  async create(userId: string, dto: CreateBetDto, ipAddress?: string, userAgent?: string) {
    // Check monthly bet limit based on subscription
    await this.checkBetLimit(userId);

    // Calculate profit if status is won or lost
    const profit = dto.payout ? dto.payout - dto.stake : null;

    // Extract PMU data from notes if present
    let pmuRaceId: string | null = null;
    console.log('🔍 Checking PMU data...', { 
      hasNotes: !!dto.notes, 
      hasPmuCode: dto.notes?.includes('Code PMU:'),
      hasPmuService: !!this.pmuDataService 
    });
    
    if (dto.notes && dto.notes.includes('Code PMU:') && this.pmuDataService) {
      const pmuCodeMatch = dto.notes.match(/R(\d+)C(\d+)/);
      console.log('🏇 PMU Code Match:', pmuCodeMatch);
      
      if (pmuCodeMatch && dto.hippodrome) {
        const reunionNumber = parseInt(pmuCodeMatch[1]);
        const raceNumber = parseInt(pmuCodeMatch[2]);
        
        // Extract hippodrome code from notes or use first 3 letters
        const hippodromeCode = dto.hippodrome.substring(0, 3).toUpperCase();
        
        console.log('💾 Saving PMU data:', { reunionNumber, raceNumber, hippodromeCode, date: dto.date });
        
        try {
          pmuRaceId = await this.pmuDataService.savePmuData({
            date: dto.date,
            reunionNumber,
            raceNumber,
            hippodromeCode,
            hippodromeName: dto.hippodrome,
            hippodromeFullName: dto.hippodrome,
          });
          console.log('✅ PMU data saved, race ID:', pmuRaceId);
        } catch (error) {
          // Log error but don't fail the bet creation
          console.error('❌ Failed to save PMU data:', error);
        }
      }
    }

    // Enrichir avec les données PMU si disponibles
    let jockey: string | null = null;
    let trainer: string | null = null;
    let raceTime: string | null = dto.time || null;

    if (pmuRaceId && this.pmuDataService) {
      try {
        // Récupérer la course PMU pour avoir l'heure
        const race = await this.prisma.pmuRace.findUnique({
          where: { id: pmuRaceId },
        });

        // Convertir le timestamp en heure (HH:MM)
        if (race?.startTime && !dto.time) {
          const timestamp = Number(race.startTime);
          const date = new Date(timestamp);
          raceTime = date.toLocaleTimeString('fr-FR', { 
            hour: '2-digit', 
            minute: '2-digit',
            timeZone: 'Europe/Paris'
          });
        }

        // Enrichir avec jockey/trainer si on a les chevaux sélectionnés
        if (dto.horsesSelected) {
          const enrichedData = await this.enrichBetWithPmuData(pmuRaceId, dto.horsesSelected);
          jockey = enrichedData.jockey;
          trainer = enrichedData.trainer;
        }
      } catch (error) {
        console.error('Failed to enrich bet with PMU data:', error);
      }
    }

    // Déterminer si le pari nécessite une mise à jour manuelle
    let requiresManualUpdate = false;
    let platformId: string | null = null;
    let oddsSource = 'manual';
    
    if (dto.platform) {
      // Chercher la plateforme (bankroll) correspondante par ID ou par nom (fallback)
      let platform = await this.prisma.platform.findFirst({
        where: {
          userId,
          id: dto.platform,
        },
      });
      
      // Si pas trouvé par ID, essayer par nom (pour rétrocompatibilité)
      if (!platform) {
        platform = await this.prisma.platform.findFirst({
          where: {
            userId,
            name: dto.platform,
          },
        });
      }
      
      console.log('🔍 Platform lookup:', {
        userId,
        platformIdOrName: dto.platform,
        found: !!platform,
        platformName: platform?.name,
        platformType: platform?.platformType,
        status: dto.status,
      });
      
      if (platform) {
        platformId = platform.id;
        oddsSource = platform.name;
        
        // Si plateforme non-PMU et pari en attente, marquer pour mise à jour manuelle
        if (platform.platformType !== 'PMU' && dto.status === 'pending') {
          requiresManualUpdate = true;
          console.log('✅ requiresManualUpdate set to TRUE for', platform.name);
        } else {
          console.log('ℹ️ requiresManualUpdate remains FALSE:', {
            platformName: platform.name,
            platformType: platform.platformType,
            status: dto.status,
          });
        }
      } else {
        console.log('⚠️ Platform not found for id/name:', dto.platform);
      }
    }

    const bet = await this.prisma.bet.create({
      data: {
        userId,
        date: new Date(dto.date),
        time: raceTime,
        platform: oddsSource, // Stocker le nom de la plateforme, pas l'ID
        hippodrome: dto.hippodrome,
        raceNumber: dto.raceNumber,
        betType: dto.betType,
        horsesSelected: dto.horsesSelected,
        stake: dto.stake,
        odds: dto.odds,
        oddsSource,
        platformId,
        requiresManualUpdate,
        status: dto.status,
        payout: dto.payout,
        profit,
        jockey,
        trainer,
        notes: dto.notes,
        tags: dto.tags,
        pmuRaceId,
        tipsterId: dto.tipsterId || null,
      },
    });

    // Get user's bankroll mode preference
    const settings = await this.prisma.userSettings.findUnique({
      where: { userId },
    });
    const bankrollMode = settings?.bankrollMode || 'immediate';

    // Update platform bankroll based on mode
    if (dto.platform) {
      if (bankrollMode === 'immediate') {
        // Immediate mode: deduct stake on creation
        await this.updatePlatformBankroll(userId, dto.platform, -dto.stake, bet.id, bet.date);
      } else if (dto.status === 'won' || dto.status === 'lost') {
        // On loss mode: only update when bet is won or lost
        await this.updatePlatformBankroll(userId, dto.platform, profit || -dto.stake, bet.id, bet.date);
      }
    }

    // Log bet creation
    await this.auditLog.log(userId, 'BET_CREATE', 'Bet', bet.id, {
      stake: dto.stake,
      odds: dto.odds,
      betType: dto.betType,
      hippodrome: dto.hippodrome,
    }, ipAddress, userAgent);

    // Send notification
    await this.notificationsService.notifySuccess(
      userId,
      'Pari créé',
      `Votre pari de ${dto.stake}€ a été enregistré avec succès`,
      '/dashboard/bets'
    );

    return bet;
  }

  async findAll(userId: string, filters: BetFiltersDto) {
    try {
      const { page = 1, limit = 20, sortBy = 'date', sortOrder = 'desc' } = filters;
      const skip = (page - 1) * limit;

      // Validate sortBy field
      const validSortFields = ['date', 'stake', 'profit', 'createdAt', 'updatedAt'];
      const safeSortBy = validSortFields.includes(sortBy) ? sortBy : 'date';

      // Build where clause - start with AND array to properly combine conditions
      const andConditions: any[] = [];

      // Always filter by userId
      const where: any = { userId };

      // Add specific filters
      if (filters.status) andConditions.push({ status: filters.status });
      if (filters.platform) andConditions.push({ platform: { contains: filters.platform, mode: 'insensitive' } });
      if (filters.hippodrome) andConditions.push({ hippodrome: { contains: filters.hippodrome, mode: 'insensitive' } });
      if (filters.betType) andConditions.push({ betType: { contains: filters.betType, mode: 'insensitive' } });
      if (filters.tipsterId) andConditions.push({ tipsterId: filters.tipsterId });
      // For Json fields containing arrays, use array_contains instead of has
      if (filters.tag) andConditions.push({ tags: { array_contains: filters.tag } });

      // Add date range filter
      if (filters.startDate || filters.endDate) {
        const dateFilter: any = {};
        if (filters.startDate) dateFilter.gte = new Date(filters.startDate);
        if (filters.endDate) dateFilter.lte = new Date(filters.endDate);
        andConditions.push({ date: dateFilter });
      }

      // Add search filter (OR condition)
      if (filters.search) {
        andConditions.push({
          OR: [
            { horsesSelected: { contains: filters.search, mode: 'insensitive' } },
            { notes: { contains: filters.search, mode: 'insensitive' } },
            { platform: { contains: filters.search, mode: 'insensitive' } },
            { hippodrome: { contains: filters.search, mode: 'insensitive' } },
          ],
        });
      }

      // Combine all conditions with AND
      if (andConditions.length > 0) {
        where.AND = andConditions;
      }

      // Debug logging
      console.log('🔍 [BetsService.findAll] Query details:');
      console.log('Filters:', JSON.stringify(filters, null, 2));
      console.log('Where clause:', JSON.stringify(where, null, 2));
      console.log('OrderBy:', { [safeSortBy]: sortOrder });

      // Get total count
      const total = await this.prisma.bet.count({ where });
      console.log('✅ Count query successful, total:', total);

      // Get bets with pagination
      const bets = await this.prisma.bet.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [safeSortBy]: sortOrder },
        include: {
          tipster: true, // Include tipster relation
        },
      });
      console.log('✅ FindMany query successful, found:', bets.length, 'bets');

      return {
        data: bets,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('❌ [BetsService.findAll] Error occurred:');
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      console.error('Filters received:', JSON.stringify(filters, null, 2));

      // Re-throw with more context
      throw new Error(`Failed to fetch bets: ${error.message}`);
    }
  }

  async findOne(userId: string, id: string) {
    const bet = await this.prisma.bet.findFirst({
      where: { id, userId },
    });

    if (!bet) {
      throw new NotFoundException('Bet not found');
    }

    return bet;
  }

  async update(userId: string, id: string, dto: UpdateBetDto, ipAddress?: string, userAgent?: string) {
    // Check if bet exists and belongs to user
    const existingBet = await this.findOne(userId, id);

    // Calculate new profit if payout changed
    const newStake = dto.stake !== undefined ? dto.stake : existingBet.stake.toNumber();
    const newPayout = dto.payout !== undefined ? dto.payout : (existingBet.payout?.toNumber() || 0);
    const profit = dto.payout !== undefined || dto.stake !== undefined ? newPayout - newStake : undefined;

    const updatedBet = await this.prisma.bet.update({
      where: { id },
      data: {
        ...dto,
        date: dto.date ? new Date(dto.date) : undefined,
        profit,
      },
    });

    // Get user's bankroll mode preference
    const settings = await this.prisma.userSettings.findUnique({
      where: { userId },
    });
    const bankrollMode = settings?.bankrollMode || 'immediate';

    // Handle bankroll updates when status changes
    const oldStatus = existingBet.status;
    const newStatus = dto.status || oldStatus;
    const platform = dto.platform || existingBet.platform;

    if (platform) {
      if (bankrollMode === 'immediate') {
        // Immediate mode: handle status changes
        if (oldStatus === 'pending' && (newStatus === 'won' || newStatus === 'lost')) {
          // Stake was already deducted on creation, now add payout if won
          if (newStatus === 'won') {
            const payout = dto.payout !== undefined ? dto.payout : (existingBet.payout?.toNumber() || 0);
            const betDate = dto.date ? new Date(dto.date) : existingBet.date;
            await this.updatePlatformBankroll(userId, platform, payout, id, betDate);
          }
          // If lost, nothing to do (stake already deducted)
        } else if (oldStatus === 'won' && newStatus === 'lost') {
          // Was won, now lost: remove the payout that was added
          const oldPayout = existingBet.payout?.toNumber() || 0;
          const betDate = dto.date ? new Date(dto.date) : existingBet.date;
          await this.updatePlatformBankroll(userId, platform, -oldPayout, id, betDate);
        } else if (oldStatus === 'lost' && newStatus === 'won') {
          // Was lost, now won: add the payout
          const payout = dto.payout !== undefined ? dto.payout : 0;
          const betDate = dto.date ? new Date(dto.date) : existingBet.date;
          await this.updatePlatformBankroll(userId, platform, payout, id, betDate);
        }
      } else {
        // On loss mode: only update when status changes to won/lost
        if (oldStatus !== newStatus && (newStatus === 'won' || newStatus === 'lost')) {
          let finalProfit: number;

          if (profit !== undefined) {
            finalProfit = profit;
          } else if (existingBet.profit !== null) {
            finalProfit = existingBet.profit.toNumber();
          } else {
            if (newStatus === 'lost') {
              finalProfit = -newStake;
            } else {
              throw new Error(`Cannot update bankroll: profit is required for ${newStatus} bets. Please provide payout for won bets.`);
            }
          }

          const betDate = dto.date ? new Date(dto.date) : existingBet.date;
          await this.updatePlatformBankroll(userId, platform, finalProfit, id, betDate);
        }
      }
    }

    // Send notifications based on status change
    if (oldStatus !== newStatus) {
      if (newStatus === 'won') {
        const payout = dto.payout !== undefined ? dto.payout : (existingBet.payout?.toNumber() || 0);
        const profitAmount = payout - newStake;
        await this.notificationsService.notifySuccess(
          userId,
          'Pari gagné ! 🎉',
          `Félicitations ! Vous avez gagné ${profitAmount.toFixed(2)}€`,
          '/dashboard/bets'
        );
      } else if (newStatus === 'lost') {
        await this.notificationsService.notifyError(
          userId,
          'Pari perdu',
          `Votre pari de ${newStake}€ a été marqué comme perdu`,
          '/dashboard/bets'
        );
      }
    }

    // Log bet update
    await this.auditLog.log(userId, 'BET_UPDATE', 'Bet', id, {
      changes: dto,
      oldStatus: existingBet.status,
      newStatus: dto.status,
    }, ipAddress, userAgent);

    return updatedBet;
  }

  async updateStatus(userId: string, id: string, status: string, ipAddress?: string, userAgent?: string) {
    // Get existing bet
    const existingBet = await this.findOne(userId, id);

    // Calculate profit based on new status
    let profit: number | null = null;
    if (status === 'won' && existingBet.payout) {
      profit = existingBet.payout.toNumber() - existingBet.stake.toNumber();
    } else if (status === 'lost') {
      profit = -existingBet.stake.toNumber();
    }

    // Update bet
    const updatedBet = await this.prisma.bet.update({
      where: { id },
      data: {
        status: status as any,
        profit: profit !== null ? profit : null,
      },
    });

    // Handle bankroll updates when status changes
    const oldStatus = existingBet.status;
    const newStatus = status;
    const platform = existingBet.platform;

    // If status changed to won/lost and platform exists
    if (oldStatus !== newStatus && (newStatus === 'won' || newStatus === 'lost') && platform) {
      const finalProfit = profit !== null ? profit : -existingBet.stake.toNumber();
      await this.updatePlatformBankroll(userId, platform, finalProfit, id, existingBet.date);
    }

    // Log status update
    await this.auditLog.log(userId, 'BET_STATUS_UPDATE', 'Bet', id, {
      oldStatus,
      newStatus,
      profit,
    }, ipAddress, userAgent);

    return updatedBet;
  }

  async remove(userId: string, id: string, ipAddress?: string, userAgent?: string) {
    // Check if bet exists and belongs to user
    const bet = await this.findOne(userId, id);

    await this.prisma.bet.delete({
      where: { id },
    });

    // Log bet deletion
    await this.auditLog.log(userId, 'BET_DELETE', 'Bet', id, {
      stake: bet.stake.toNumber(),
      hippodrome: bet.hippodrome,
      betType: bet.betType,
    }, ipAddress, userAgent);

    return { message: 'Bet deleted successfully' };
  }

  async getStats(userId: string, startDate?: string, endDate?: string) {
    const where: any = { userId };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const [
      totalBets,
      wonBets,
      lostBets,
      pendingBets,
      aggregates,
      platforms,
      pendingBetsData,
    ] = await Promise.all([
      this.prisma.bet.count({ where }),
      this.prisma.bet.count({ where: { ...where, status: 'won' } }),
      this.prisma.bet.count({ where: { ...where, status: 'lost' } }),
      this.prisma.bet.count({ where: { ...where, status: 'pending' } }),
      this.prisma.bet.aggregate({
        where,
        _sum: {
          stake: true,
          payout: true,
          profit: true,
        },
        _avg: {
          stake: true,
          odds: true,
        },
      }),
      this.prisma.platform.findMany({
        where: { userId },
        select: {
          initialBankroll: true,
          currentBankroll: true,
        },
      }),
      this.prisma.bet.aggregate({
        where: { ...where, status: 'pending' },
        _sum: {
          stake: true,
        },
      }),
    ]);

    const totalStake = aggregates._sum.stake?.toNumber() || 0;
    const totalPayout = aggregates._sum.payout?.toNumber() || 0;
    const totalProfit = aggregates._sum.profit?.toNumber() || 0;
    const averageStake = aggregates._avg.stake?.toNumber() || 0;
    const averageOdds = aggregates._avg.odds?.toNumber() || 0;
    const pendingStake = pendingBetsData._sum.stake?.toNumber() || 0;

    // Calculer les bankrolls
    const initialBankroll = platforms.reduce((sum, p) => sum + p.initialBankroll.toNumber(), 0);
    const currentBankroll = platforms.reduce((sum, p) => sum + p.currentBankroll.toNumber(), 0);
    const bankrollOperations = currentBankroll - initialBankroll - totalProfit;
    const roc = initialBankroll > 0 ? ((currentBankroll - initialBankroll) / initialBankroll) * 100 : 0;

    const winRate = totalBets > 0 ? (wonBets / totalBets) * 100 : 0;
    const roi = totalStake > 0 ? (totalProfit / totalStake) * 100 : 0;

    return {
      totalBets,
      wonBets,
      lostBets,
      pendingBets,
      winRate: Math.round(winRate * 100) / 100,
      totalStake: Math.round(totalStake * 100) / 100,
      pendingStake: Math.round(pendingStake * 100) / 100,
      totalPayout: Math.round(totalPayout * 100) / 100,
      totalProfit: Math.round(totalProfit * 100) / 100,
      averageStake: Math.round(averageStake * 100) / 100,
      averageOdds: Math.round(averageOdds * 100) / 100,
      roi: Math.round(roi * 100) / 100,
      initialBankroll: Math.round(initialBankroll * 100) / 100,
      currentBankroll: Math.round(currentBankroll * 100) / 100,
      bankrollOperations: Math.round(bankrollOperations * 100) / 100,
      roc: Math.round(roc * 100) / 100,
    };
  }

  async getStatsByPlatform(userId: string) {
    const bets = await this.prisma.bet.findMany({
      where: { userId, platform: { not: null } },
      select: {
        platform: true,
        stake: true,
        payout: true,
        profit: true,
        status: true,
        odds: true,
      },
    });

    // Get platform bankrolls
    const platforms = await this.prisma.platform.findMany({
      where: { userId },
      select: {
        name: true,
        initialBankroll: true,
        currentBankroll: true,
      },
    });

    const platformBankrolls = platforms.reduce((acc, p) => {
      acc[p.name] = {
        initialBalance: p.initialBankroll.toNumber(),
        currentBalance: p.currentBankroll.toNumber(),
      };
      return acc;
    }, {} as any);

    const platformStats: any = {};

    bets.forEach((bet: any) => {
      const platform = bet.platform || 'Unknown';
      if (!platformStats[platform]) {
        platformStats[platform] = {
          platform,
          totalBets: 0,
          wonBets: 0,
          lostBets: 0,
          pendingBets: 0,
          refundedBets: 0,
          totalStake: 0,
          totalPayout: 0,
          totalProfit: 0,
          totalOdds: 0,
          oddsCount: 0,
        };
      }

      platformStats[platform].totalBets++;
      
      if (bet.status === 'won') platformStats[platform].wonBets++;
      else if (bet.status === 'lost') platformStats[platform].lostBets++;
      else if (bet.status === 'pending') platformStats[platform].pendingBets++;
      else if (bet.status === 'refunded') platformStats[platform].refundedBets++;
      
      platformStats[platform].totalStake += bet.stake.toNumber();
      platformStats[platform].totalPayout += (bet.payout?.toNumber() || 0);
      platformStats[platform].totalProfit += (bet.profit?.toNumber() || 0);
      
      if (bet.odds) {
        platformStats[platform].totalOdds += bet.odds.toNumber();
        platformStats[platform].oddsCount++;
      }
    });

    return Object.values(platformStats).map((stats: any) => {
      // Calculer les paris perdus comme total - (gagnés + en cours + remboursés)
      const calculatedLostBets = stats.totalBets - stats.wonBets - stats.pendingBets - stats.refundedBets;
      
      return {
        platform: stats.platform,
        totalBets: stats.totalBets,
        wonBets: stats.wonBets,
        lostBets: Math.max(stats.lostBets, calculatedLostBets), // Prendre le max entre explicite et calculé
        pendingBets: stats.pendingBets,
        refundedBets: stats.refundedBets,
        totalStake: stats.totalStake,
        totalPayout: stats.totalPayout,
        totalProfit: stats.totalProfit,
        avgOdds: stats.oddsCount > 0 ? stats.totalOdds / stats.oddsCount : 0,
        winRate: stats.totalBets > 0 ? (stats.wonBets / stats.totalBets) * 100 : 0,
        roi: stats.totalStake > 0 ? (stats.totalProfit / stats.totalStake) * 100 : 0,
        initialBalance: platformBankrolls[stats.platform]?.initialBalance || 0,
        currentBalance: platformBankrolls[stats.platform]?.currentBalance || 0,
      };
    });
  }

  async getStatsByBetType(userId: string) {
    const bets = await this.prisma.bet.findMany({
      where: { userId, betType: { not: null } },
      select: {
        betType: true,
        stake: true,
        payout: true,
        profit: true,
        status: true,
        odds: true,
      },
    });

    const betTypeStats: any = {};

    bets.forEach((bet: any) => {
      const betType = bet.betType || 'Unknown';
      if (!betTypeStats[betType]) {
        betTypeStats[betType] = {
          betType,
          totalBets: 0,
          wonBets: 0,
          lostBets: 0,
          pendingBets: 0,
          refundedBets: 0,
          totalStake: 0,
          totalPayout: 0,
          totalProfit: 0,
          totalOdds: 0,
          oddsCount: 0,
        };
      }

      betTypeStats[betType].totalBets++;
      
      if (bet.status === 'won') betTypeStats[betType].wonBets++;
      else if (bet.status === 'lost') betTypeStats[betType].lostBets++;
      else if (bet.status === 'pending') betTypeStats[betType].pendingBets++;
      else if (bet.status === 'refunded') betTypeStats[betType].refundedBets++;
      
      betTypeStats[betType].totalStake += bet.stake.toNumber();
      betTypeStats[betType].totalPayout += (bet.payout?.toNumber() || 0);
      betTypeStats[betType].totalProfit += (bet.profit?.toNumber() || 0);
      
      if (bet.odds) {
        betTypeStats[betType].totalOdds += bet.odds.toNumber();
        betTypeStats[betType].oddsCount++;
      }
    });

    return Object.values(betTypeStats).map((stats: any) => ({
      betType: stats.betType,
      totalBets: stats.totalBets,
      wonBets: stats.wonBets,
      lostBets: stats.lostBets,
      pendingBets: stats.pendingBets,
      refundedBets: stats.refundedBets,
      totalStake: stats.totalStake,
      totalPayout: stats.totalPayout,
      totalProfit: stats.totalProfit,
      avgOdds: stats.oddsCount > 0 ? stats.totalOdds / stats.oddsCount : 0,
      winRate: stats.totalBets > 0 ? (stats.wonBets / stats.totalBets) * 100 : 0,
      roi: stats.totalStake > 0 ? (stats.totalProfit / stats.totalStake) * 100 : 0,
    }));
  }

  /**
   * Enrichir tous les paris existants avec les données PMU
   */
  async enrichExistingBetsWithPmuData(userId: string) {
    const bets = await this.prisma.bet.findMany({
      where: {
        userId,
        pmuRaceId: { not: null },
        OR: [
          { jockey: null },
          { trainer: null },
        ],
      },
    });

    let enrichedCount = 0;
    let errorCount = 0;

    for (const bet of bets) {
      if (!bet.pmuRaceId || !bet.horsesSelected) continue;

      try {
        // Récupérer la course PMU pour avoir l'heure
        const race = await this.prisma.pmuRace.findUnique({
          where: { id: bet.pmuRaceId },
        });

        let raceTime: string | null = bet.time;
        if (race?.startTime && !bet.time) {
          const timestamp = Number(race.startTime);
          const date = new Date(timestamp);
          raceTime = date.toLocaleTimeString('fr-FR', { 
            hour: '2-digit', 
            minute: '2-digit',
            timeZone: 'Europe/Paris'
          });
        }

        const enrichedData = await this.enrichBetWithPmuData(bet.pmuRaceId, bet.horsesSelected);
        
        // Mettre à jour si on a trouvé des données ou l'heure
        if (enrichedData.jockey || enrichedData.trainer || (raceTime && raceTime !== bet.time)) {
          await this.prisma.bet.update({
            where: { id: bet.id },
            data: {
              time: raceTime || bet.time,
              jockey: enrichedData.jockey || bet.jockey,
              trainer: enrichedData.trainer || bet.trainer,
            },
          });
          enrichedCount++;
        }
      } catch (error) {
        console.error(`Failed to enrich bet ${bet.id}:`, error);
        errorCount++;
      }
    }

    return {
      message: 'Enrichissement terminé',
      totalBets: bets.length,
      enrichedCount,
      errorCount,
    };
  }

  /**
   * Enrichir un pari avec les données PMU (jockey, trainer)
   * Utilise les données de la course actuelle via l'API PMU
   */
  private async enrichBetWithPmuData(pmuRaceId: string, horsesSelected: string): Promise<{ jockey: string | null; trainer: string | null }> {
    try {
      // Récupérer la course PMU
      const race = await this.prisma.pmuRace.findUnique({
        where: { id: pmuRaceId },
      });

      if (!race) {
        return { jockey: null, trainer: null };
      }

      // Extraire le numéro du cheval depuis horsesSelected (ex: "5", "5-7", "5,7,9")
      const horseNumbers = horsesSelected.split(/[-,]/).map(n => parseInt(n.trim())).filter(n => !isNaN(n));
      
      if (horseNumbers.length === 0) {
        return { jockey: null, trainer: null };
      }

      // Prendre le premier cheval sélectionné
      const firstHorseNumber = horseNumbers[0];

      // Récupérer les participants de la course via l'API PMU si le service est disponible
      if (this.pmuDataService) {
        try {
          const participants = await (this.pmuDataService as any).pmuService.getRaceParticipants(
            race.date,
            race.reunionNumber,
            race.raceNumber,
          );

          if (participants?.participants) {
            const participant = participants.participants.find((p: any) => p.number === firstHorseNumber);
            if (participant) {
              return {
                jockey: participant.jockey || null,
                trainer: participant.trainer || null,
              };
            }
          }
        } catch (apiError) {
          console.warn('Could not fetch participants from PMU API:', apiError.message);
        }
      }

      // Fallback: essayer de récupérer depuis les performances historiques
      const horse = await this.prisma.pmuHorse.findFirst({
        where: {
          raceId: pmuRaceId,
          number: firstHorseNumber,
        },
      });

      if (horse) {
        const performance = await this.prisma.pmuHorsePerformance.findFirst({
          where: {
            horseId: horse.id,
          },
          orderBy: {
            date: 'desc',
          },
        });

        return {
          jockey: performance?.jockey || null,
          trainer: performance?.trainer || null,
        };
      }

      return { jockey: null, trainer: null };
    } catch (error) {
      console.error('Error enriching bet with PMU data:', error);
      return { jockey: null, trainer: null };
    }
  }

  async exportBets(userId: string, format: string, filters: BetFiltersDto) {
    const where: any = { userId };

    if (filters.status) where.status = filters.status;
    if (filters.platform) where.platform = { contains: filters.platform };
    if (filters.hippodrome) where.hippodrome = { contains: filters.hippodrome };
    if (filters.startDate || filters.endDate) {
      where.date = {};
      if (filters.startDate) where.date.gte = new Date(filters.startDate);
      if (filters.endDate) where.date.lte = new Date(filters.endDate);
    }

    const bets = await this.prisma.bet.findMany({
      where,
      orderBy: { date: 'desc' },
      include: {
        tipster: true, // Include tipster relation to get the name
      },
    });

    // Récupérer toutes les plateformes pour faire la corrélation
    const platforms = await this.prisma.platform.findMany({
      where: { userId },
    });

    // Créer un map pour accès rapide
    const platformMap = new Map(platforms.map(p => [p.id, p.name]));

    // Determine separator based on format
    const separator = format === 'excel' ? '\t' : ',';

    // Convert to CSV/TSV format with all data
    const headers = [
      'Date',
      'Heure',
      'Plateforme',
      'Hippodrome',
      'Course',
      'Type de pari',
      'Chevaux sélectionnés',
      'Mise (€)',
      'Cote',
      'Statut',
      'Gain (€)',
      'Profit/Perte (€)',
      'Jockey',
      'Tipster',
    ].join(separator);

    const rows = bets.map((bet: any) => {
      // Escape special characters for CSV
      const escapeCSV = (value: any) => {
        if (value === null || value === undefined) return '';
        const str = String(value);
        // If contains separator, quotes or newlines, wrap in quotes and escape existing quotes
        if (str.includes(separator) || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      // Récupérer le nom de la plateforme depuis le map
      const platformName = bet.platform ? (platformMap.get(bet.platform) || bet.platform) : '';

      // Extraire le code hippodrome (premiers mots en majuscules)
      const hippodromeCode = bet.hippodrome ? bet.hippodrome.split(' ')[0].toUpperCase() : '';

      // Formater la course en "R1 C5" depuis les notes ou raceNumber
      let courseFormat = '';
      if (bet.notes && bet.notes.includes('Code PMU:')) {
        const rMatch = bet.notes.match(/R(\d+)/);
        const cMatch = bet.notes.match(/C(\d+)/);
        if (rMatch && cMatch) {
          courseFormat = `R${rMatch[1]} C${cMatch[1]}`;
        }
      } else if (bet.raceNumber) {
        courseFormat = bet.raceNumber;
      }

      // Extraire uniquement les numéros de chevaux (sans noms)
      let horseNumbers = '';
      if (bet.horsesSelected) {
        // Si c'est déjà juste des numéros (ex: "5-7-9" ou "5,7,9")
        horseNumbers = bet.horsesSelected;
      } else if (bet.notes && bet.notes.includes('Code PMU:')) {
        // Extraire depuis les notes si format "Code PMU: R1C1 5-7-9"
        const horseMatch = bet.notes.match(/(\d+[-,]\d+|\d+)$/);
        if (horseMatch) {
          horseNumbers = horseMatch[0];
        }
      }

      return [
        escapeCSV(bet.date.toISOString().split('T')[0]),
        escapeCSV(bet.time || ''),
        escapeCSV(platformName),
        escapeCSV(hippodromeCode),
        escapeCSV(courseFormat),
        escapeCSV(bet.betType || ''),
        escapeCSV(horseNumbers),
        escapeCSV(bet.stake.toString()),
        escapeCSV(bet.odds?.toString() || ''),
        escapeCSV(bet.status),
        escapeCSV(bet.payout?.toString() || '0'),
        escapeCSV(bet.profit?.toString() || '0'),
        escapeCSV(bet.jockey || ''),
        escapeCSV(bet.tipster?.name || ''),
      ].join(separator);
    });

    return [headers, ...rows].join('\n');
  }

  private async checkBetLimit(userId: string) {
    // Get user's current subscription
    const subscription = await this.prisma.subscription.findFirst({
      where: {
        userId,
        status: { in: ['trial', 'active'] },
      },
      include: {
        plan: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!subscription) {
      throw new ForbiddenException('No active subscription found');
    }

    const maxBets = subscription.plan.maxBetsPerMonth;

    // If unlimited bets (null), no check needed
    if (maxBets === null) {
      return;
    }

    // Count bets this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const betCount = await this.prisma.bet.count({
      where: {
        userId,
        createdAt: {
          gte: startOfMonth,
        },
      },
    });

    if (betCount >= maxBets) {
      throw new ForbiddenException(
        `Monthly bet limit reached (${maxBets} bets). Upgrade your plan for more.`,
      );
    }
  }

  /**
   * Update platform bankroll and create transaction when bet is won or lost
   * Handles multiple status changes by canceling previous transaction
   */
  private async updatePlatformBankroll(
    userId: string,
    platformName: string,
    profitOrLoss: number,
    betId: string,
    betDate?: Date,
  ) {
    // Find the platform by name
    const platform = await this.prisma.platform.findFirst({
      where: {
        userId,
        name: platformName,
      },
    });

    if (!platform) {
      // Platform not found, skip bankroll update
      console.warn(`Platform "${platformName}" not found for user ${userId}`);
      return;
    }

    // Check if a transaction already exists for this bet
    const existingTransaction = await this.prisma.bankrollTransaction.findFirst({
      where: {
        betId,
        platformId: platform.id,
      },
    });

    let currentBalance = new Decimal(platform.currentBankroll);

    // If there's an existing transaction, reverse it first
    if (existingTransaction) {
      // Calculate the original effect (reverse of what was done)
      const oldAmount = new Decimal(existingTransaction.amount);
      const wasDeposit = existingTransaction.type === TransactionType.DEPOSIT;

      // Reverse the old transaction effect
      currentBalance = wasDeposit
        ? currentBalance.minus(oldAmount)  // Remove old gain
        : currentBalance.plus(oldAmount);   // Add back old loss
    }

    // Apply new transaction
    const amount = new Decimal(Math.abs(profitOrLoss));
    const transactionType = profitOrLoss >= 0 ? TransactionType.DEPOSIT : TransactionType.WITHDRAWAL;
    const newBalance = currentBalance.plus(profitOrLoss);

    // Perform operations in a database transaction
    await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Delete old transaction if exists
      if (existingTransaction) {
        await tx.bankrollTransaction.delete({
          where: { id: existingTransaction.id },
        });
      }

      // Create new transaction
      await tx.bankrollTransaction.create({
        data: {
          userId,
          platformId: platform.id,
          betId,
          type: transactionType,
          amount,
          balanceAfter: newBalance,
          description: `Pari ${profitOrLoss >= 0 ? 'gagné' : 'perdu'} - ID: ${betId.substring(0, 8)}`,
          date: betDate || new Date(),
        },
      });

      // Update platform bankroll
      await tx.platform.update({
        where: { id: platform.id },
        data: { currentBankroll: newBalance },
      });
    });
  }

  private async updateBankroll(userId: string, profitOrLoss: number) {
    const settings = await this.prisma.userSettings.findUnique({
      where: { userId },
    });

    if (!settings || !settings.currentBankroll) {
      return;
    }

    const newBankroll = settings.currentBankroll.toNumber() + profitOrLoss;

    await this.prisma.userSettings.update({
      where: { userId },
      data: {
        currentBankroll: Math.max(0, newBankroll),
      },
    });
  }

  /**
   * Update bet result manually (for non-PMU platforms)
   */
  async updateBetResult(
    betId: string,
    userId: string,
    updateDto: { status: 'won' | 'lost' | 'refunded'; finalOdds?: number; payout?: number },
  ) {
    // Vérifier que le pari appartient à l'utilisateur
    const bet = await this.prisma.bet.findFirst({
      where: { id: betId, userId },
      include: { bettingPlatform: true },
    });

    if (!bet) {
      throw new NotFoundException('Pari non trouvé');
    }

    // Vérifier que le pari est en attente
    if (bet.status !== 'pending') {
      throw new ForbiddenException('Ce pari a déjà été mis à jour');
    }

    // Calculer le profit et le payout
    let profit: number | null = null;
    let payout: number | null = updateDto.payout || null;
    let finalOdds = updateDto.finalOdds || bet.odds?.toNumber() || null;

    if (updateDto.status === 'won') {
      // Si payout fourni, l'utiliser
      if (payout) {
        profit = payout - bet.stake.toNumber();
      } 
      // Sinon calculer avec finalOdds
      else if (finalOdds) {
        payout = bet.stake.toNumber() * finalOdds;
        profit = payout - bet.stake.toNumber();
      }
    } else if (updateDto.status === 'lost') {
      profit = -bet.stake.toNumber();
      payout = 0;
    } else if (updateDto.status === 'refunded') {
      profit = 0;
      payout = bet.stake.toNumber(); // Remboursement
    }

    // Mettre à jour le pari
    const updatedBet = await this.prisma.bet.update({
      where: { id: betId },
      data: {
        status: updateDto.status,
        finalOdds: finalOdds,
        finalOddsSource: 'user_manual',
        oddsUpdatedAt: new Date(),
        payout: payout,
        profit: profit,
        requiresManualUpdate: false,
      },
    });

    // Mettre à jour la bankroll si nécessaire
    if (bet.platform && profit !== null) {
      const settings = await this.prisma.userSettings.findUnique({
        where: { userId },
      });
      const bankrollMode = settings?.bankrollMode || 'immediate';

      if (bankrollMode === 'immediate') {
        // En mode immédiat, on a déjà déduit la mise, donc on ajoute le payout
        if (payout && payout > 0) {
          await this.updatePlatformBankroll(userId, bet.platform, payout, bet.id, bet.date);
        }
      } else {
        // En mode "on loss", on met à jour avec le profit/perte
        await this.updatePlatformBankroll(userId, bet.platform, profit, bet.id, bet.date);
      }
    }

    // Log de l'action
    await this.auditLog.log(userId, 'BET_UPDATE_RESULT', 'Bet', betId, {
      status: updateDto.status,
      finalOdds,
      payout,
      profit,
    });

    // Notification
    const message = updateDto.status === 'won' 
      ? `Félicitations ! Votre pari est gagné. Gain: ${profit?.toFixed(2)}€`
      : updateDto.status === 'lost'
      ? `Votre pari est perdu. Perte: ${Math.abs(profit || 0).toFixed(2)}€`
      : `Votre pari a été annulé. Mise remboursée: ${bet.stake}€`;

    await this.notificationsService.notifySuccess(
      userId,
      'Pari mis à jour',
      message,
      '/dashboard/bets'
    );

    return updatedBet;
  }
}
