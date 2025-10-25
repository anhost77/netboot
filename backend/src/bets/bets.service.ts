import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateBetDto } from './dto/create-bet.dto';
import { UpdateBetDto } from './dto/update-bet.dto';
import { BetFiltersDto } from './dto/bet-filters.dto';
import { BetQueryDto } from './dto/bet-query.dto';
import { TransactionType } from '../platforms/dto/create-transaction.dto';
import { Decimal } from '@prisma/client/runtime/library';
import { Prisma } from '@prisma/client';

@Injectable()
export class BetsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateBetDto) {
    // Check monthly bet limit based on subscription
    await this.checkBetLimit(userId);

    // Calculate profit if status is won or lost
    const profit = dto.payout ? dto.payout - dto.stake : null;

    const bet = await this.prisma.bet.create({
      data: {
        userId,
        date: new Date(dto.date),
        time: dto.time,
        platform: dto.platform,
        hippodrome: dto.hippodrome,
        raceNumber: dto.raceNumber,
        betType: dto.betType,
        horsesSelected: dto.horsesSelected,
        stake: dto.stake,
        odds: dto.odds,
        status: dto.status,
        payout: dto.payout,
        profit,
        notes: dto.notes,
        tags: dto.tags,
      },
    });

    // Update platform bankroll if bet is won or lost
    if (dto.status === 'won' || dto.status === 'lost') {
      await this.updatePlatformBankroll(userId, dto.platform, profit || -dto.stake, bet.id);
    }

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

  async update(userId: string, id: string, dto: UpdateBetDto) {
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

    // Handle bankroll updates when status changes
    const oldStatus = existingBet.status;
    const newStatus = dto.status || oldStatus;
    const platform = dto.platform || existingBet.platform;

    // If status changed from pending to won/lost, or between won/lost
    if (oldStatus !== newStatus && (newStatus === 'won' || newStatus === 'lost') && platform) {
      const finalProfit = profit !== undefined ? profit : (existingBet.profit?.toNumber() || -newStake);
      await this.updatePlatformBankroll(userId, platform, finalProfit, id);
    }

    return updatedBet;
  }

  async updateStatus(userId: string, id: string, status: string) {
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
      await this.updatePlatformBankroll(userId, platform, finalProfit, id);
    }

    return updatedBet;
  }

  async remove(userId: string, id: string) {
    // Check if bet exists and belongs to user
    await this.findOne(userId, id);

    await this.prisma.bet.delete({
      where: { id },
    });

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
    ]);

    const totalStake = aggregates._sum.stake?.toNumber() || 0;
    const totalPayout = aggregates._sum.payout?.toNumber() || 0;
    const totalProfit = aggregates._sum.profit?.toNumber() || 0;
    const averageStake = aggregates._avg.stake?.toNumber() || 0;
    const averageOdds = aggregates._avg.odds?.toNumber() || 0;

    const winRate = totalBets > 0 ? (wonBets / totalBets) * 100 : 0;
    const roi = totalStake > 0 ? (totalProfit / totalStake) * 100 : 0;

    return {
      totalBets,
      wonBets,
      lostBets,
      pendingBets,
      winRate: Math.round(winRate * 100) / 100,
      totalStake: Math.round(totalStake * 100) / 100,
      totalPayout: Math.round(totalPayout * 100) / 100,
      totalProfit: Math.round(totalProfit * 100) / 100,
      averageStake: Math.round(averageStake * 100) / 100,
      averageOdds: Math.round(averageOdds * 100) / 100,
      roi: Math.round(roi * 100) / 100,
    };
  }

  async getStatsByPlatform(userId: string) {
    const bets = await this.prisma.bet.findMany({
      where: { userId, platform: { not: null } },
      select: {
        platform: true,
        stake: true,
        profit: true,
        status: true,
      },
    });

    const platformStats: any = {};

    bets.forEach((bet: any) => {
      const platform = bet.platform || 'Unknown';
      if (!platformStats[platform]) {
        platformStats[platform] = {
          platform,
          totalBets: 0,
          wonBets: 0,
          totalStake: 0,
          totalProfit: 0,
        };
      }

      platformStats[platform].totalBets++;
      if (bet.status === 'won') platformStats[platform].wonBets++;
      platformStats[platform].totalStake += bet.stake.toNumber();
      platformStats[platform].totalProfit += (bet.profit?.toNumber() || 0);
    });

    return Object.values(platformStats).map((stats: any) => ({
      ...stats,
      winRate: stats.totalBets > 0 ? (stats.wonBets / stats.totalBets) * 100 : 0,
      roi: stats.totalStake > 0 ? (stats.totalProfit / stats.totalStake) * 100 : 0,
    }));
  }

  async getStatsByBetType(userId: string) {
    const bets = await this.prisma.bet.findMany({
      where: { userId, betType: { not: null } },
      select: {
        betType: true,
        stake: true,
        profit: true,
        status: true,
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
          totalStake: 0,
          totalProfit: 0,
        };
      }

      betTypeStats[betType].totalBets++;
      if (bet.status === 'won') betTypeStats[betType].wonBets++;
      betTypeStats[betType].totalStake += bet.stake.toNumber();
      betTypeStats[betType].totalProfit += (bet.profit?.toNumber() || 0);
    });

    return Object.values(betTypeStats).map((stats: any) => ({
      ...stats,
      winRate: stats.totalBets > 0 ? (stats.wonBets / stats.totalBets) * 100 : 0,
      roi: stats.totalStake > 0 ? (stats.totalProfit / stats.totalStake) * 100 : 0,
    }));
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
    });

    // Determine separator based on format
    const separator = format === 'excel' ? '\t' : ',';

    // Convert to CSV/TSV format
    const headers = [
      'Date',
      'Heure',
      'Plateforme',
      'Hippodrome',
      'Course',
      'Type',
      'Chevaux',
      'Mise',
      'Cote',
      'Statut',
      'Gain',
      'Profit',
    ].join(separator);

    const rows = bets.map((bet: any) =>
      [
        bet.date.toISOString().split('T')[0],
        bet.time || '',
        bet.platform || '',
        bet.hippodrome || '',
        bet.raceNumber || '',
        bet.betType || '',
        bet.horsesSelected || '',
        bet.stake.toString(),
        bet.odds?.toString() || '',
        bet.status,
        bet.payout?.toString() || '',
        bet.profit?.toString() || '',
      ].join(separator),
    );

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
          date: new Date(),
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
}
