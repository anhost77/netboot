import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateBetDto } from './dto/create-bet.dto';
import { UpdateBetDto } from './dto/update-bet.dto';
import { BetFiltersDto } from './dto/bet-filters.dto';
import { BetQueryDto } from './dto/bet-query.dto';

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

    // Update user bankroll if needed
    if (dto.status === 'won' || dto.status === 'lost') {
      await this.updateBankroll(userId, profit || -dto.stake);
    }

    return bet;
  }

  async findAll(userId: string, filters: BetFiltersDto) {
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
    if (filters.tag) andConditions.push({ tags: { has: filters.tag } });

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

    // Get total count
    const total = await this.prisma.bet.count({ where });

    // Get bets with pagination
    const bets = await this.prisma.bet.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [safeSortBy]: sortOrder },
    });

    return {
      data: bets,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
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
    await this.findOne(userId, id);

    // Calculate new profit if payout changed
    const profit = dto.payout !== undefined ? dto.payout - (dto.stake || 0) : undefined;

    const updatedBet = await this.prisma.bet.update({
      where: { id },
      data: {
        ...dto,
        date: dto.date ? new Date(dto.date) : undefined,
        profit,
      },
    });

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

  async exportBets(userId: string, filters: BetFiltersDto) {
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

    // Convert to CSV format
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
    ].join(',');

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
      ].join(','),
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
