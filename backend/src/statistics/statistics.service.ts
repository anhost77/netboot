import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class StatisticsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get comprehensive dashboard statistics
   */
  async getDashboardStats(userId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Current month stats
    const currentMonth = await this.calculatePeriodStats(userId, startOfMonth, now);

    // Last month stats for comparison
    const lastMonth = await this.calculatePeriodStats(userId, startOfLastMonth, endOfLastMonth);

    // Year to date stats
    const yearToDate = await this.calculatePeriodStats(userId, startOfYear, now);

    // All time stats
    const allTime = await this.calculatePeriodStats(userId);

    // Calculate trends (% change from last month)
    const trends = {
      bets: this.calculateTrend(currentMonth.totalBets, lastMonth.totalBets),
      profit: this.calculateTrend(currentMonth.totalProfit, lastMonth.totalProfit),
      roi: this.calculateTrend(currentMonth.roi, lastMonth.roi),
      winRate: this.calculateTrend(currentMonth.winRate, lastMonth.winRate),
    };

    return {
      currentMonth,
      lastMonth,
      yearToDate,
      allTime,
      trends,
    };
  }

  /**
   * Get statistics for predefined periods (today, yesterday, this week, etc.)
   */
  async getPeriodStats(userId: string) {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    const endOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, -1);

    // Week starts on Monday
    const currentDay = now.getDay();
    const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() + distanceToMonday);
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfLastWeek = new Date(startOfWeek);
    startOfLastWeek.setDate(startOfWeek.getDate() - 7);
    const endOfLastWeek = new Date(startOfWeek);
    endOfLastWeek.setMilliseconds(-1);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    const [today, yesterday, thisWeek, lastWeek, thisMonth, lastMonth] = await Promise.all([
      this.calculatePeriodStats(userId, startOfToday, now),
      this.calculatePeriodStats(userId, startOfYesterday, endOfYesterday),
      this.calculatePeriodStats(userId, startOfWeek, now),
      this.calculatePeriodStats(userId, startOfLastWeek, endOfLastWeek),
      this.calculatePeriodStats(userId, startOfMonth, now),
      this.calculatePeriodStats(userId, startOfLastMonth, endOfLastMonth),
    ]);

    return {
      today,
      yesterday,
      thisWeek,
      lastWeek,
      thisMonth,
      lastMonth,
    };
  }

  /**
   * Get time series data for charts (daily/weekly/monthly)
   */
  async getTimeSeriesData(
    userId: string,
    period: 'daily' | 'weekly' | 'monthly',
    startDate?: Date,
    endDate?: Date,
  ) {
    const end = endDate || new Date();
    const start = startDate || this.getDefaultStartDate(period);

    const bets = await this.prisma.bet.findMany({
      where: {
        userId,
        date: {
          gte: start,
          lte: end,
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Group by period
    const grouped = this.groupByPeriod(bets, period);

    return grouped.map(group => ({
      period: group.period,
      totalBets: group.bets.length,
      wonBets: group.bets.filter(b => b.status === 'won').length,
      lostBets: group.bets.filter(b => b.status === 'lost').length,
      totalStake: group.bets.reduce((sum, b) => sum + Number(b.stake), 0),
      totalPayout: group.bets.reduce((sum, b) => sum + (Number(b.payout) || 0), 0),
      totalProfit: group.bets.reduce((sum, b) => sum + (Number(b.profit) || 0), 0),
      winRate: group.bets.length > 0
        ? (group.bets.filter(b => b.status === 'won').length / group.bets.length) * 100
        : 0,
      avgOdds: group.bets.length > 0
        ? group.bets.reduce((sum, b) => sum + (Number(b.odds) || 0), 0) / group.bets.length
        : 0,
      roi: this.calculateROI(
        group.bets.reduce((sum, b) => sum + (Number(b.profit) || 0), 0),
        group.bets.reduce((sum, b) => sum + Number(b.stake), 0),
      ),
    }));
  }

  /**
   * Get performance metrics and advanced analytics
   */
  async getPerformanceMetrics(userId: string, startDate?: Date, endDate?: Date) {
    const where: any = { userId };
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = startDate;
      if (endDate) where.date.lte = endDate;
    }

    const bets = await this.prisma.bet.findMany({
      where,
      orderBy: { date: 'asc' },
    });

    if (bets.length === 0) {
      return this.getEmptyMetrics();
    }

    // Calculate streaks
    const streaks = this.calculateStreaks(bets);

    // Calculate volatility
    const profits = bets.map((b: any) => Number(b.profit) || 0);
    const avgProfit = profits.reduce((sum: number, p: number) => sum + p, 0) / profits.length;
    const variance = profits.reduce((sum: number, p: number) => sum + Math.pow(p - avgProfit, 2), 0) / profits.length;
    const volatility = Math.sqrt(variance);

    // Sharpe Ratio (simplified - assuming risk-free rate of 0)
    const sharpeRatio = volatility > 0 ? avgProfit / volatility : 0;

    // Best and worst bets
    const sortedByProfit = [...bets].sort((a, b) => Number(b.profit || 0) - Number(a.profit || 0));
    const bestBet = sortedByProfit[0];
    const worstBet = sortedByProfit[sortedByProfit.length - 1];

    // Consistency score (0-100, based on win rate stability across periods)
    const consistencyScore = this.calculateConsistencyScore(bets);

    return {
      streaks,
      volatility: Math.round(volatility * 100) / 100,
      sharpeRatio: Math.round(sharpeRatio * 100) / 100,
      avgProfit: Math.round(avgProfit * 100) / 100,
      bestBet: bestBet ? {
        id: bestBet.id,
        date: bestBet.date,
        profit: Number(bestBet.profit),
        stake: Number(bestBet.stake),
        odds: Number(bestBet.odds),
      } : null,
      worstBet: worstBet ? {
        id: worstBet.id,
        date: worstBet.date,
        profit: Number(worstBet.profit),
        stake: Number(worstBet.stake),
        odds: Number(worstBet.odds),
      } : null,
      consistencyScore,
    };
  }

  /**
   * Get breakdown by bet type, category, etc.
   */
  async getBreakdowns(userId: string, startDate?: Date, endDate?: Date) {
    const where: any = { userId };
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = startDate;
      if (endDate) where.date.lte = endDate;
    }

    const bets = await this.prisma.bet.findMany({ where });

    // Breakdown by bet type (gagnant, placé, etc.)
    const byBetType = this.groupAndAggregate(bets, 'betType');

    // Breakdown by status
    const byStatus = this.groupAndAggregate(bets, 'status');

    // Breakdown by stake range
    const byStakeRange = this.groupByStakeRange(bets);

    // Breakdown by odds range
    const byOddsRange = this.groupByOddsRange(bets);

    // Breakdown by hippodrome
    const byHippodrome = this.groupAndAggregate(bets, 'hippodrome');

    // Breakdown by platform
    const byPlatform = this.groupAndAggregate(bets, 'platform');

    return {
      byBetType,
      byStatus,
      byStakeRange,
      byOddsRange,
      byHippodrome,
      byPlatform,
    };
  }

  /**
   * Get comparative analysis (current vs previous period)
   */
  async getComparativeAnalysis(
    userId: string,
    currentStart: Date,
    currentEnd: Date,
  ) {
    // Calculate previous period of same duration
    const duration = currentEnd.getTime() - currentStart.getTime();
    const previousStart = new Date(currentStart.getTime() - duration);
    const previousEnd = new Date(currentEnd.getTime() - duration);

    const current = await this.calculatePeriodStats(userId, currentStart, currentEnd);
    const previous = await this.calculatePeriodStats(userId, previousStart, previousEnd);

    return {
      current: {
        period: { start: currentStart, end: currentEnd },
        stats: current,
      },
      previous: {
        period: { start: previousStart, end: previousEnd },
        stats: previous,
      },
      comparison: {
        betsChange: this.calculateTrend(current.totalBets, previous.totalBets),
        profitChange: this.calculateTrend(current.totalProfit, previous.totalProfit),
        roiChange: this.calculateTrend(current.roi, previous.roi),
        winRateChange: this.calculateTrend(current.winRate, previous.winRate),
        stakeChange: this.calculateTrend(current.totalStake, previous.totalStake),
      },
    };
  }

  // ============ PRIVATE HELPER METHODS ============

  private async calculatePeriodStats(userId: string, startDate?: Date, endDate?: Date) {
    const where: any = { userId };
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = startDate;
      if (endDate) where.date.lte = endDate;
    }

    const aggregates = await this.prisma.bet.aggregate({
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
      _count: true,
    });

    const wonBets = await this.prisma.bet.count({
      where: { ...where, status: 'won' },
    });

    const lostBets = await this.prisma.bet.count({
      where: { ...where, status: 'lost' },
    });

    const totalBets = aggregates._count;
    const totalStake = Number(aggregates._sum.stake) || 0;
    const totalPayout = Number(aggregates._sum.payout) || 0;
    const totalProfit = Number(aggregates._sum.profit) || 0;
    const avgStake = Number(aggregates._avg.stake) || 0;
    const avgOdds = Number(aggregates._avg.odds) || 0;
    const winRate = totalBets > 0 ? (wonBets / totalBets) * 100 : 0;
    const roi = this.calculateROI(totalProfit, totalStake);

    return {
      totalBets,
      wonBets,
      lostBets,
      pendingBets: totalBets - wonBets - lostBets,
      totalStake: Math.round(totalStake * 100) / 100,
      totalPayout: Math.round(totalPayout * 100) / 100,
      totalProfit: Math.round(totalProfit * 100) / 100,
      avgStake: Math.round(avgStake * 100) / 100,
      avgOdds: Math.round(avgOdds * 100) / 100,
      winRate: Math.round(winRate * 100) / 100,
      roi: Math.round(roi * 100) / 100,
    };
  }

  private calculateROI(profit: number, stake: number): number {
    return stake > 0 ? (profit / stake) * 100 : 0;
  }

  private calculateTrend(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }

  private getDefaultStartDate(period: 'daily' | 'weekly' | 'monthly'): Date {
    const now = new Date();
    switch (period) {
      case 'daily':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // Last 30 days
      case 'weekly':
        return new Date(now.getTime() - 12 * 7 * 24 * 60 * 60 * 1000); // Last 12 weeks
      case 'monthly':
        return new Date(now.getFullYear() - 1, now.getMonth(), 1); // Last 12 months
    }
  }

  private groupByPeriod(bets: any[], period: 'daily' | 'weekly' | 'monthly') {
    const groups = new Map<string, any[]>();

    bets.forEach(bet => {
      const date = new Date(bet.date);
      let key: string;

      switch (period) {
        case 'daily':
          key = date.toISOString().split('T')[0]; // YYYY-MM-DD
          break;
        case 'weekly':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split('T')[0];
          break;
        case 'monthly':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
      }

      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(bet);
    });

    return Array.from(groups.entries())
      .map(([period, bets]) => ({ period, bets }))
      .sort((a, b) => a.period.localeCompare(b.period));
  }

  private calculateStreaks(bets: any[]) {
    let currentWinStreak = 0;
    let currentLoseStreak = 0;
    let maxWinStreak = 0;
    let maxLoseStreak = 0;

    bets.forEach(bet => {
      if (bet.status === 'won') {
        currentWinStreak++;
        currentLoseStreak = 0;
        maxWinStreak = Math.max(maxWinStreak, currentWinStreak);
      } else if (bet.status === 'lost') {
        currentLoseStreak++;
        currentWinStreak = 0;
        maxLoseStreak = Math.max(maxLoseStreak, currentLoseStreak);
      }
    });

    return {
      currentWinStreak,
      currentLoseStreak,
      maxWinStreak,
      maxLoseStreak,
    };
  }

  private calculateConsistencyScore(bets: any[]): number {
    if (bets.length < 10) return 0; // Not enough data

    // Split into chunks of 10 bets
    const chunkSize = 10;
    const chunks: any[][] = [];
    for (let i = 0; i < bets.length; i += chunkSize) {
      chunks.push(bets.slice(i, i + chunkSize));
    }

    if (chunks.length < 2) return 0;

    // Calculate win rate for each chunk
    const winRates = chunks.map(chunk => {
      const won = chunk.filter(b => b.status === 'won').length;
      return (won / chunk.length) * 100;
    });

    // Calculate standard deviation of win rates
    const avgWinRate = winRates.reduce((sum, wr) => sum + wr, 0) / winRates.length;
    const variance = winRates.reduce((sum, wr) => sum + Math.pow(wr - avgWinRate, 2), 0) / winRates.length;
    const stdDev = Math.sqrt(variance);

    // Lower standard deviation = higher consistency
    // Convert to 0-100 scale (100 = perfect consistency)
    const consistencyScore = Math.max(0, 100 - stdDev * 2);
    return Math.round(consistencyScore);
  }

  private groupAndAggregate(bets: any[], field: string) {
    const groups = new Map<string, any[]>();

    bets.forEach(bet => {
      const key = bet[field] || 'unknown';
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(bet);
    });

    return Array.from(groups.entries()).map(([key, groupBets]) => {
      const totalStake = groupBets.reduce((sum, b) => sum + Number(b.stake), 0);
      const totalProfit = groupBets.reduce((sum, b) => sum + (Number(b.profit) || 0), 0);
      const wonBets = groupBets.filter(b => b.status === 'won').length;

      return {
        category: key,
        totalBets: groupBets.length,
        wonBets,
        winRate: groupBets.length > 0 ? (wonBets / groupBets.length) * 100 : 0,
        totalStake: Math.round(totalStake * 100) / 100,
        totalProfit: Math.round(totalProfit * 100) / 100,
        roi: this.calculateROI(totalProfit, totalStake),
      };
    });
  }

  private groupByStakeRange(bets: any[]) {
    const ranges = [
      { label: '0-10€', min: 0, max: 10 },
      { label: '10-50€', min: 10, max: 50 },
      { label: '50-100€', min: 50, max: 100 },
      { label: '100-500€', min: 100, max: 500 },
      { label: '500€+', min: 500, max: Infinity },
    ];

    return ranges.map(range => {
      const rangeBets = bets.filter(b => {
        const stake = Number(b.stake);
        return stake >= range.min && stake < range.max;
      });

      const totalStake = rangeBets.reduce((sum, b) => sum + Number(b.stake), 0);
      const totalProfit = rangeBets.reduce((sum, b) => sum + (Number(b.profit) || 0), 0);
      const wonBets = rangeBets.filter(b => b.status === 'won').length;

      return {
        range: range.label,
        totalBets: rangeBets.length,
        wonBets,
        winRate: rangeBets.length > 0 ? (wonBets / rangeBets.length) * 100 : 0,
        totalStake: Math.round(totalStake * 100) / 100,
        totalProfit: Math.round(totalProfit * 100) / 100,
        roi: this.calculateROI(totalProfit, totalStake),
      };
    });
  }

  private groupByOddsRange(bets: any[]) {
    const ranges = [
      { label: '1.00-1.50', min: 1.0, max: 1.5 },
      { label: '1.50-2.00', min: 1.5, max: 2.0 },
      { label: '2.00-3.00', min: 2.0, max: 3.0 },
      { label: '3.00-5.00', min: 3.0, max: 5.0 },
      { label: '5.00+', min: 5.0, max: Infinity },
    ];

    return ranges.map(range => {
      const rangeBets = bets.filter(b => {
        const odds = Number(b.odds) || 0;
        return odds >= range.min && odds < range.max;
      });

      const totalStake = rangeBets.reduce((sum, b) => sum + Number(b.stake), 0);
      const totalProfit = rangeBets.reduce((sum, b) => sum + (Number(b.profit) || 0), 0);
      const wonBets = rangeBets.filter(b => b.status === 'won').length;

      return {
        range: range.label,
        totalBets: rangeBets.length,
        wonBets,
        winRate: rangeBets.length > 0 ? (wonBets / rangeBets.length) * 100 : 0,
        totalStake: Math.round(totalStake * 100) / 100,
        totalProfit: Math.round(totalProfit * 100) / 100,
        roi: this.calculateROI(totalProfit, totalStake),
      };
    });
  }

  private getEmptyMetrics() {
    return {
      streaks: {
        currentWinStreak: 0,
        currentLoseStreak: 0,
        maxWinStreak: 0,
        maxLoseStreak: 0,
      },
      volatility: 0,
      sharpeRatio: 0,
      avgProfit: 0,
      bestBet: null,
      worstBet: null,
      consistencyScore: 0,
    };
  }
}
