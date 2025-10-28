import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { UpdateBudgetSettingsDto } from './dto/update-budget-settings.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class BudgetService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  /**
   * Get or create user budget settings
   */
  async getSettings(userId: string) {
    let settings = await this.prisma.userSettings.findUnique({
      where: { userId },
    });

    // Create default settings if they don't exist
    if (!settings) {
      settings = await this.prisma.userSettings.create({
        data: {
          userId,
          initialBankroll: new Decimal(0),
          currentBankroll: new Decimal(0),
        },
      });
    }

    return settings;
  }

  /**
   * Update budget settings
   */
  async updateSettings(userId: string, dto: UpdateBudgetSettingsDto) {
    const settings = await this.getSettings(userId);

    const updateData: any = {};

    if (dto.initialBankroll !== undefined) {
      updateData.initialBankroll = new Decimal(dto.initialBankroll);
    }
    if (dto.currentBankroll !== undefined) {
      updateData.currentBankroll = new Decimal(dto.currentBankroll);
    }
    if (dto.dailyLimit !== undefined) {
      updateData.dailyLimit = dto.dailyLimit !== null ? new Decimal(dto.dailyLimit) : null;
    }
    if (dto.weeklyLimit !== undefined) {
      updateData.weeklyLimit = dto.weeklyLimit !== null ? new Decimal(dto.weeklyLimit) : null;
    }
    if (dto.monthlyLimit !== undefined) {
      updateData.monthlyLimit = dto.monthlyLimit !== null ? new Decimal(dto.monthlyLimit) : null;
    }
    if (dto.alertThreshold !== undefined) {
      updateData.alertThreshold = dto.alertThreshold !== null ? new Decimal(dto.alertThreshold) : null;
    }

    const updated = await this.prisma.userSettings.update({
      where: { userId },
      data: updateData,
    });

    await this.notificationsService.notifySuccess(
      userId,
      'Budget mis à jour',
      'Vos paramètres de budget ont été enregistrés',
      '/settings/budget',
    );

    return updated;
  }

  /**
   * Get budget consumption for a period
   */
  async getConsumption(userId: string, period: 'daily' | 'weekly' | 'monthly') {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'daily':
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'weekly':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'monthly':
        startDate = new Date(now);
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
        break;
    }

    const bets = await this.prisma.bet.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
        },
      },
    });

    const totalStake = bets.reduce((sum: number, bet: any) => {
      return sum + Number(bet.stake);
    }, 0);

    const totalProfit = bets.reduce((sum: number, bet: any) => {
      return sum + (bet.profit ? Number(bet.profit) : 0);
    }, 0);

    const settings = await this.getSettings(userId);
    let limit: number | null = null;

    switch (period) {
      case 'daily':
        limit = settings.dailyLimit ? Number(settings.dailyLimit) : null;
        break;
      case 'weekly':
        limit = settings.weeklyLimit ? Number(settings.weeklyLimit) : null;
        break;
      case 'monthly':
        limit = settings.monthlyLimit ? Number(settings.monthlyLimit) : null;
        break;
    }

    const percentage = limit ? (totalStake / limit) * 100 : null;
    const remaining = limit ? limit - totalStake : null;

    return {
      period,
      startDate,
      endDate: now,
      totalStake,
      totalProfit,
      limit,
      consumed: totalStake,
      remaining,
      percentage,
      betsCount: bets.length,
    };
  }

  /**
   * Get budget overview (all periods)
   */
  async getOverview(userId: string) {
    const settings = await this.getSettings(userId);

    const [daily, weekly, monthly] = await Promise.all([
      this.getConsumption(userId, 'daily'),
      this.getConsumption(userId, 'weekly'),
      this.getConsumption(userId, 'monthly'),
    ]);

    // Check for alerts
    const alerts: string[] = [];
    const alertThreshold = settings.alertThreshold ? Number(settings.alertThreshold) : 80;

    if (daily.percentage && daily.percentage >= alertThreshold) {
      alerts.push(`Vous avez consommé ${daily.percentage.toFixed(1)}% de votre budget journalier`);
    }
    if (weekly.percentage && weekly.percentage >= alertThreshold) {
      alerts.push(`Vous avez consommé ${weekly.percentage.toFixed(1)}% de votre budget hebdomadaire`);
    }
    if (monthly.percentage && monthly.percentage >= alertThreshold) {
      alerts.push(`Vous avez consommé ${monthly.percentage.toFixed(1)}% de votre budget mensuel`);
    }

    // Bankroll status - Récupérer depuis les plateformes
    const platforms = await this.prisma.platform.findMany({
      where: { userId },
      select: {
        initialBankroll: true,
        currentBankroll: true,
      },
    });

    const initialBankroll = platforms.reduce((sum, p) => sum + Number(p.initialBankroll || 0), 0);
    const currentBankroll = platforms.reduce((sum, p) => sum + Number(p.currentBankroll || 0), 0);
    const bankrollChange = currentBankroll - initialBankroll;
    const bankrollChangePercent = initialBankroll > 0 ? (bankrollChange / initialBankroll) * 100 : 0;

    return {
      settings: {
        initialBankroll,
        currentBankroll,
        dailyLimit: settings.dailyLimit ? Number(settings.dailyLimit) : null,
        weeklyLimit: settings.weeklyLimit ? Number(settings.weeklyLimit) : null,
        monthlyLimit: settings.monthlyLimit ? Number(settings.monthlyLimit) : null,
        alertThreshold,
      },
      daily,
      weekly,
      monthly,
      bankroll: {
        initial: initialBankroll,
        current: currentBankroll,
        change: bankrollChange,
        changePercent: bankrollChangePercent,
      },
      alerts,
      hasAlerts: alerts.length > 0,
    };
  }

  /**
   * Check budgets and send alerts if needed (called after bet creation)
   */
  async checkBudgetsAndAlert(userId: string) {
    const settings = await this.getSettings(userId);
    const alertThreshold = settings.alertThreshold ? Number(settings.alertThreshold) : 80;

    const [daily, weekly, monthly] = await Promise.all([
      this.getConsumption(userId, 'daily'),
      this.getConsumption(userId, 'weekly'),
      this.getConsumption(userId, 'monthly'),
    ]);

    // Check daily
    if (daily.limit && daily.percentage && daily.percentage >= alertThreshold) {
      if (daily.percentage >= 100) {
        await this.notificationsService.notifyError(
          userId,
          '⚠️ Budget journalier dépassé',
          `Vous avez dépassé votre budget journalier de ${(daily.consumed - daily.limit).toFixed(2)}€`,
          '/budget',
        );
      } else {
        await this.notificationsService.notifyWarning(
          userId,
          '⚠️ Budget journalier',
          `Vous avez consommé ${daily.percentage.toFixed(1)}% de votre budget journalier`,
          '/budget',
        );
      }
    }

    // Check weekly
    if (weekly.limit && weekly.percentage && weekly.percentage >= alertThreshold) {
      if (weekly.percentage >= 100) {
        await this.notificationsService.notifyError(
          userId,
          '⚠️ Budget hebdomadaire dépassé',
          `Vous avez dépassé votre budget hebdomadaire de ${(weekly.consumed - weekly.limit).toFixed(2)}€`,
          '/budget',
        );
      } else {
        await this.notificationsService.notifyWarning(
          userId,
          '⚠️ Budget hebdomadaire',
          `Vous avez consommé ${weekly.percentage.toFixed(1)}% de votre budget hebdomadaire`,
          '/budget',
        );
      }
    }

    // Check monthly
    if (monthly.limit && monthly.percentage && monthly.percentage >= alertThreshold) {
      if (monthly.percentage >= 100) {
        await this.notificationsService.notifyError(
          userId,
          '⚠️ Budget mensuel dépassé',
          `Vous avez dépassé votre budget mensuel de ${(monthly.consumed - monthly.limit).toFixed(2)}€`,
          '/budget',
        );
      } else {
        await this.notificationsService.notifyWarning(
          userId,
          '⚠️ Budget mensuel',
          `Vous avez consommé ${monthly.percentage.toFixed(1)}% de votre budget mensuel`,
          '/budget',
        );
      }
    }
  }

  /**
   * Update bankroll after a bet result
   */
  async updateBankroll(userId: string, profitAmount: number) {
    const settings = await this.getSettings(userId);
    const currentBankroll = settings.currentBankroll ? Number(settings.currentBankroll) : 0;
    const newBankroll = currentBankroll + profitAmount;

    await this.prisma.userSettings.update({
      where: { userId },
      data: {
        currentBankroll: new Decimal(newBankroll),
      },
    });

    // Notify if significant change
    if (Math.abs(profitAmount) >= 50) {
      const message =
        profitAmount > 0
          ? `Votre bankroll a augmenté de ${profitAmount.toFixed(2)}€`
          : `Votre bankroll a diminué de ${Math.abs(profitAmount).toFixed(2)}€`;

      await this.notificationsService.notify(
        userId,
        profitAmount > 0 ? 'success' : 'warning',
        'Bankroll mis à jour',
        message,
        '/budget',
      );
    }

    return { previousBankroll: currentBankroll, currentBankroll: newBankroll, change: profitAmount };
  }

  /**
   * Get monthly budget history (for charts)
   */
  async getMonthlyHistory(userId: string, months: number = 6) {
    const now = new Date();
    const startDate = new Date(now);
    startDate.setMonth(now.getMonth() - months);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    const bets = await this.prisma.bet.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
        },
      },
      orderBy: { date: 'asc' },
    });

    // Group by month
    const monthlyData: Record<string, any> = {};

    bets.forEach((bet: any) => {
      const monthKey = bet.date.toISOString().slice(0, 7); // YYYY-MM

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthKey,
          totalStake: 0,
          totalProfit: 0,
          betsCount: 0,
          wonBets: 0,
        };
      }

      monthlyData[monthKey].totalStake += Number(bet.stake);
      monthlyData[monthKey].totalProfit += bet.profit ? Number(bet.profit) : 0;
      monthlyData[monthKey].betsCount += 1;
      
      // Compter les paris gagnés (status 'won' ou profit > 0)
      if (bet.status === 'won' || (bet.profit && Number(bet.profit) > 0)) {
        monthlyData[monthKey].wonBets += 1;
      }
    });

    // Calculer winRate et ROI pour chaque mois
    const result = Object.values(monthlyData).map((data: any) => {
      const winRate = data.betsCount > 0 ? (data.wonBets / data.betsCount) * 100 : 0;
      const roi = data.totalStake > 0 ? (data.totalProfit / data.totalStake) * 100 : 0;
      
      return {
        ...data,
        winRate: Number(winRate.toFixed(2)),
        roi: Number(roi.toFixed(2)),
      };
    });

    return result.sort((a, b) => a.month.localeCompare(b.month));
  }
}
