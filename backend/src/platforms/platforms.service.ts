import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreatePlatformDto } from './dto/create-platform.dto';
import { UpdatePlatformDto } from './dto/update-platform.dto';
import { CreateTransactionDto, TransactionType } from './dto/create-transaction.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class PlatformsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createPlatformDto: CreatePlatformDto) {
    const platform = await this.prisma.platform.create({
      data: {
        userId,
        name: createPlatformDto.name,
        initialBankroll: new Decimal(createPlatformDto.initialBankroll),
        currentBankroll: new Decimal(createPlatformDto.initialBankroll),
      },
    });

    return platform;
  }

  async findAll(userId: string) {
    return this.prisma.platform.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { transactions: true },
        },
      },
    });
  }

  async findOne(userId: string, id: string) {
    const platform = await this.prisma.platform.findFirst({
      where: { id, userId },
      include: {
        transactions: {
          orderBy: { date: 'desc' },
          take: 10,
        },
      },
    });

    if (!platform) {
      throw new NotFoundException(`Platform with ID ${id} not found`);
    }

    return platform;
  }

  async update(userId: string, id: string, updatePlatformDto: UpdatePlatformDto) {
    // Vérifier que la plateforme existe et appartient à l'utilisateur
    await this.findOne(userId, id);

    return this.prisma.platform.update({
      where: { id },
      data: updatePlatformDto,
    });
  }

  async remove(userId: string, id: string) {
    // Vérifier que la plateforme existe et appartient à l'utilisateur
    await this.findOne(userId, id);

    await this.prisma.platform.delete({
      where: { id },
    });

    return { message: 'Platform deleted successfully' };
  }

  async createTransaction(
    userId: string,
    platformId: string,
    createTransactionDto: CreateTransactionDto,
  ) {
    // Vérifier que la plateforme existe et appartient à l'utilisateur
    const platform = await this.findOne(userId, platformId);

    const amount = new Decimal(createTransactionDto.amount);
    let newBalance: Decimal;

    if (createTransactionDto.type === TransactionType.DEPOSIT) {
      // Ajouter des fonds
      newBalance = new Decimal(platform.currentBankroll).plus(amount);
    } else {
      // Retirer des fonds
      newBalance = new Decimal(platform.currentBankroll).minus(amount);

      // Vérifier qu'on ne va pas en négatif
      if (newBalance.isNegative()) {
        throw new BadRequestException(
          'Insufficient funds. Cannot withdraw more than the current bankroll.',
        );
      }
    }

    // Créer la transaction et mettre à jour la bankroll en une seule transaction DB
    const [transaction] = await this.prisma.$transaction([
      this.prisma.bankrollTransaction.create({
        data: {
          userId,
          platformId,
          type: createTransactionDto.type,
          amount,
          balanceAfter: newBalance,
          description: createTransactionDto.description,
          date: createTransactionDto.date
            ? new Date(createTransactionDto.date)
            : new Date(),
        },
      }),
      this.prisma.platform.update({
        where: { id: platformId },
        data: { currentBankroll: newBalance },
      }),
    ]);

    return transaction;
  }

  async getTransactions(userId: string, platformId: string) {
    // Vérifier que la plateforme existe et appartient à l'utilisateur
    await this.findOne(userId, platformId);

    return this.prisma.bankrollTransaction.findMany({
      where: { platformId, userId },
      orderBy: { date: 'desc' },
    });
  }

  async getGlobalBankroll(userId: string) {
    const platforms = await this.prisma.platform.findMany({
      where: { userId, isActive: true },
      select: {
        id: true,
        name: true,
        initialBankroll: true,
        currentBankroll: true,
      },
    });

    type PlatformData = {
      id: string;
      name: string;
      initialBankroll: Decimal;
      currentBankroll: Decimal;
    };

    const totalInitial = platforms.reduce(
      (sum: Decimal, p: PlatformData) => sum.plus(new Decimal(p.initialBankroll)),
      new Decimal(0),
    );

    const totalCurrent = platforms.reduce(
      (sum: Decimal, p: PlatformData) => sum.plus(new Decimal(p.currentBankroll)),
      new Decimal(0),
    );

    const totalProfit = totalCurrent.minus(totalInitial);

    return {
      platforms,
      totalInitialBankroll: totalInitial.toNumber(),
      totalCurrentBankroll: totalCurrent.toNumber(),
      totalProfit: totalProfit.toNumber(),
      roi:
        totalInitial.toNumber() > 0
          ? (totalProfit.toNumber() / totalInitial.toNumber()) * 100
          : 0,
    };
  }

  private getDateGrouping(period: 'day' | 'week' | 'month' | 'year'): string {
    switch (period) {
      case 'day':
        return 'DATE("date")';
      case 'week':
        return 'DATE("date", "weekday 0", "-6 days")';
      case 'month':
        return 'DATE("date", "start of month")';
      case 'year':
        return 'DATE("date", "start of year")';
    }
  }

  async getBankrollEvolution(
    userId: string,
    platformId: string,
    period: 'day' | 'week' | 'month' | 'year' = 'day',
    startDate?: string,
    endDate?: string,
  ) {
    // Vérifier que la plateforme existe et appartient à l'utilisateur
    await this.findOne(userId, platformId);

    // Définir les dates par défaut (30 derniers jours si non spécifié)
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Récupérer toutes les transactions dans la plage de dates
    const transactions = await this.prisma.bankrollTransaction.findMany({
      where: {
        userId,
        platformId,
        date: {
          gte: start,
          lte: end,
        },
      },
      orderBy: { date: 'asc' },
    });

    // Grouper par période et obtenir le dernier solde de chaque période
    const groupedData = new Map<string, { date: Date; balance: number }>();

    transactions.forEach((transaction: any) => {
      const date = new Date(transaction.date);
      let periodKey: string;

      switch (period) {
        case 'day':
          periodKey = date.toISOString().split('T')[0];
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          periodKey = weekStart.toISOString().split('T')[0];
          break;
        case 'month':
          periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
          break;
        case 'year':
          periodKey = `${date.getFullYear()}-01-01`;
          break;
      }

      // Garder seulement la dernière transaction de chaque période
      if (
        !groupedData.has(periodKey) ||
        transaction.date > groupedData.get(periodKey)!.date
      ) {
        groupedData.set(periodKey, {
          date: transaction.date,
          balance: new Decimal(transaction.balanceAfter).toNumber(),
        });
      }
    });

    // Convertir en tableau et trier par date
    const evolution = Array.from(groupedData.entries())
      .map(([periodKey, data]) => ({
        period: periodKey,
        balance: data.balance,
        date: data.date,
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    return evolution;
  }

  async getGlobalBankrollEvolution(
    userId: string,
    period: 'day' | 'week' | 'month' | 'year' = 'day',
    startDate?: string,
    endDate?: string,
  ) {
    // Définir les dates par défaut (30 derniers jours si non spécifié)
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Récupérer toutes les plateformes actives de l'utilisateur
    const platforms = await this.prisma.platform.findMany({
      where: { userId, isActive: true },
      select: { id: true },
    });

    const platformIds = platforms.map((p: any) => p.id);

    // Récupérer toutes les transactions de toutes les plateformes
    const transactions = await this.prisma.bankrollTransaction.findMany({
      where: {
        userId,
        platformId: { in: platformIds },
        date: {
          gte: start,
          lte: end,
        },
      },
      orderBy: { date: 'asc' },
    });

    // Grouper par période et calculer le solde total
    const groupedData = new Map<
      string,
      { date: Date; balancesByPlatform: Map<string, number> }
    >();

    transactions.forEach((transaction: any) => {
      const date = new Date(transaction.date);
      let periodKey: string;

      switch (period) {
        case 'day':
          periodKey = date.toISOString().split('T')[0];
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          periodKey = weekStart.toISOString().split('T')[0];
          break;
        case 'month':
          periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
          break;
        case 'year':
          periodKey = `${date.getFullYear()}-01-01`;
          break;
      }

      if (!groupedData.has(periodKey)) {
        groupedData.set(periodKey, {
          date: transaction.date,
          balancesByPlatform: new Map(),
        });
      }

      const periodData = groupedData.get(periodKey)!;

      // Mettre à jour le solde de cette plateforme pour cette période
      periodData.balancesByPlatform.set(
        transaction.platformId,
        new Decimal(transaction.balanceAfter).toNumber(),
      );

      // Mettre à jour la date si cette transaction est plus récente
      if (transaction.date > periodData.date) {
        periodData.date = transaction.date;
      }
    });

    // Calculer le solde total pour chaque période
    const evolution = Array.from(groupedData.entries())
      .map(([periodKey, data]) => {
        const totalBalance = Array.from(data.balancesByPlatform.values()).reduce(
          (sum, balance) => sum + balance,
          0,
        );

        return {
          period: periodKey,
          balance: totalBalance,
          date: data.date,
        };
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    return evolution;
  }
}
