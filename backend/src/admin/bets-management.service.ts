import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class BetsManagementService {
  constructor(private prisma: PrismaService) {}

  async getAllBets(
    page: number = 1,
    limit: number = 50,
    userId?: string,
    tipsterId?: string,
    status?: string,
    startDate?: string,
    endDate?: string,
  ) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (userId) where.userId = userId;
    if (tipsterId) where.tipsterId = tipsterId;
    if (status) where.status = status;

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const [bets, total] = await Promise.all([
      this.prisma.bet.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          tipster: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      this.prisma.bet.count({ where }),
    ]);

    return {
      data: bets.map(bet => ({
        ...bet,
        stake: Number(bet.stake),
        odds: bet.odds ? Number(bet.odds) : null,
        payout: bet.payout ? Number(bet.payout) : null,
        profit: bet.profit ? Number(bet.profit) : null,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getBetsStats(startDate?: string, endDate?: string) {
    const where: any = {};

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const [
      totalBets,
      totalStake,
      totalProfit,
      statusDistribution,
      betTypeDistribution,
      topUsers,
      topTipsters,
      recentBets,
    ] = await Promise.all([
      // Total bets
      this.prisma.bet.count({ where }),

      // Total stake
      this.prisma.bet.aggregate({
        where,
        _sum: { stake: true },
      }),

      // Total profit
      this.prisma.bet.aggregate({
        where,
        _sum: { profit: true },
      }),

      // Status distribution
      this.prisma.bet.groupBy({
        by: ['status'],
        where,
        _count: { status: true },
      }),

      // Bet type distribution
      this.prisma.bet.groupBy({
        by: ['betType'],
        where,
        _count: { betType: true },
        orderBy: { _count: { betType: 'desc' } },
        take: 10,
      }),

      // Top users by bets count
      this.prisma.bet.groupBy({
        by: ['userId'],
        where,
        _count: { userId: true },
        _sum: { stake: true, profit: true },
        orderBy: { _count: { userId: 'desc' } },
        take: 10,
      }),

      // Top tipsters
      this.prisma.bet.groupBy({
        by: ['tipsterId'],
        where: {
          ...where,
          tipsterId: { not: null },
        },
        _count: { tipsterId: true },
        _sum: { stake: true, profit: true },
        orderBy: { _count: { tipsterId: 'desc' } },
        take: 10,
      }),

      // Recent bets (last 24h)
      this.prisma.bet.count({
        where: {
          ...where,
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    // Get user details
    const userIds = topUsers.map(u => u.userId);
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });

    const topUsersWithDetails = topUsers.map(u => {
      const user = users.find(usr => usr.id === u.userId);
      return {
        userId: u.userId,
        email: user?.email || 'Unknown',
        name: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
        betsCount: u._count.userId,
        totalStake: u._sum.stake ? Number(u._sum.stake) : 0,
        totalProfit: u._sum.profit ? Number(u._sum.profit) : 0,
      };
    });

    // Get tipster details
    const tipsterIds = topTipsters.map(t => t.tipsterId).filter(Boolean) as string[];
    const tipsters = await this.prisma.tipster.findMany({
      where: { id: { in: tipsterIds } },
      select: {
        id: true,
        name: true,
      },
    });

    const topTipstersWithDetails = topTipsters.map(t => {
      const tipster = tipsters.find(tip => tip.id === t.tipsterId);
      return {
        tipsterId: t.tipsterId,
        name: tipster?.name || 'Unknown',
        betsCount: t._count.tipsterId,
        totalStake: t._sum.stake ? Number(t._sum.stake) : 0,
        totalProfit: t._sum.profit ? Number(t._sum.profit) : 0,
      };
    });

    // Calculate win rate
    const wonBets = statusDistribution.find(s => s.status === 'won')?._count.status || 0;
    const winRate = totalBets > 0 ? (wonBets / totalBets) * 100 : 0;

    return {
      totalBets,
      totalStake: totalStake._sum.stake ? Number(totalStake._sum.stake) : 0,
      totalProfit: totalProfit._sum.profit ? Number(totalProfit._sum.profit) : 0,
      winRate: Math.round(winRate * 100) / 100,
      recentBets24h: recentBets,
      statusDistribution: statusDistribution.map(s => ({
        status: s.status,
        count: s._count.status,
      })),
      betTypeDistribution: betTypeDistribution.map(b => ({
        betType: b.betType || 'Unknown',
        count: b._count.betType,
      })),
      topUsers: topUsersWithDetails,
      topTipsters: topTipstersWithDetails,
    };
  }

  async getBetsTimeline(days: number = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const bets = await this.prisma.bet.findMany({
      where: {
        date: {
          gte: startDate,
        },
      },
      select: {
        date: true,
        stake: true,
        profit: true,
      },
    });

    // Group by day
    const timeline: Record<string, { count: number; stake: number; profit: number }> = {};
    bets.forEach(bet => {
      const date = new Date(bet.date).toISOString().split('T')[0];
      if (!timeline[date]) {
        timeline[date] = { count: 0, stake: 0, profit: 0 };
      }
      timeline[date].count++;
      timeline[date].stake += Number(bet.stake);
      timeline[date].profit += bet.profit ? Number(bet.profit) : 0;
    });

    return Object.entries(timeline)
      .map(([date, data]) => ({
        date,
        count: data.count,
        stake: Math.round(data.stake * 100) / 100,
        profit: Math.round(data.profit * 100) / 100,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }
}
