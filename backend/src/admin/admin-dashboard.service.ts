import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AdminDashboardService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get dashboard overview statistics
   */
  async getOverview() {
    const [
      totalUsers,
      totalBets,
      totalRevenue,
      activeSubscriptions,
      openTickets,
      recentUsers,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.bet.count(),
      this.prisma.invoice.aggregate({
        _sum: { total: true },
        where: { status: 'paid' },
      }),
      this.prisma.subscription.count({
        where: { status: { in: ['active', 'trial'] } },
      }),
      this.prisma.supportTicket.count({
        where: { status: { in: ['new', 'in_progress'] } },
      }),
      this.prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    return {
      users: {
        total: totalUsers,
        recent: recentUsers,
      },
      bets: {
        total: totalBets,
      },
      revenue: {
        total: totalRevenue._sum.total ? Number(totalRevenue._sum.total) : 0,
      },
      subscriptions: {
        active: activeSubscriptions,
      },
      support: {
        openTickets,
      },
    };
  }

  /**
   * Get recent activity
   */
  async getRecentActivity(limit: number = 20) {
    const [recentBets, recentUsers, recentTickets] = await Promise.all([
      this.prisma.bet.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, email: true, firstName: true, lastName: true },
          },
        },
      }),
      this.prisma.user.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          createdAt: true,
          role: true,
        },
      }),
      this.prisma.supportTicket.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, email: true, firstName: true },
          },
        },
      }),
    ]);

    return {
      recentBets,
      recentUsers,
      recentTickets,
    };
  }

  /**
   * Get charts data
   */
  async getChartsData(months: number = 6) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const [betsData, revenueData, usersData] = await Promise.all([
      this.prisma.$queryRaw<any[]>`
        SELECT
          DATE_TRUNC('month', date) as month,
          COUNT(*)::int as count,
          SUM(stake)::float as total_stake
        FROM bets
        WHERE date >= ${startDate}
        GROUP BY DATE_TRUNC('month', date)
        ORDER BY month ASC
      `,
      this.prisma.$queryRaw<any[]>`
        SELECT
          DATE_TRUNC('month', created_at) as month,
          SUM(total)::float as revenue
        FROM invoices
        WHERE created_at >= ${startDate} AND status = 'paid'
        GROUP BY DATE_TRUNC('month', created_at)
        ORDER BY month ASC
      `,
      this.prisma.$queryRaw<any[]>`
        SELECT
          DATE_TRUNC('month', created_at) as month,
          COUNT(*)::int as count
        FROM users
        WHERE created_at >= ${startDate}
        GROUP BY DATE_TRUNC('month', created_at)
        ORDER BY month ASC
      `,
    ]);

    return {
      bets: betsData,
      revenue: revenueData,
      users: usersData,
    };
  }
}
