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
}
