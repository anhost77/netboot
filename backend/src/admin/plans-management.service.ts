import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PlansManagementService {
  constructor(private prisma: PrismaService) {}

  async getAllPlans() {
    const plans = await this.prisma.plan.findMany({
      orderBy: { displayOrder: 'asc' },
      include: {
        _count: {
          select: { subscriptions: true },
        },
      },
    });

    return plans.map(plan => ({
      ...plan,
      priceMonthly: Number(plan.priceMonthly),
      priceYearly: Number(plan.priceYearly),
      subscribersCount: plan._count.subscriptions,
    }));
  }

  async getPlan(id: string) {
    const plan = await this.prisma.plan.findUnique({
      where: { id },
      include: {
        _count: {
          select: { subscriptions: true },
        },
        subscriptions: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!plan) {
      return null;
    }

    return {
      ...plan,
      priceMonthly: Number(plan.priceMonthly),
      priceYearly: Number(plan.priceYearly),
      subscribersCount: plan._count.subscriptions,
    };
  }

  async createPlan(data: {
    name: string;
    slug: string;
    description?: string;
    priceMonthly: number;
    priceYearly: number;
    maxBetsPerMonth?: number;
    maxStorageMb?: number;
    features?: any;
    displayOrder?: number;
  }) {
    const plan = await this.prisma.plan.create({
      data: {
        ...data,
        active: true,
      },
    });

    return {
      ...plan,
      priceMonthly: Number(plan.priceMonthly),
      priceYearly: Number(plan.priceYearly),
    };
  }

  async updatePlan(
    id: string,
    data: {
      name?: string;
      slug?: string;
      description?: string;
      priceMonthly?: number;
      priceYearly?: number;
      maxBetsPerMonth?: number;
      maxStorageMb?: number;
      features?: any;
      active?: boolean;
      displayOrder?: number;
    },
  ) {
    const plan = await this.prisma.plan.update({
      where: { id },
      data,
    });

    return {
      ...plan,
      priceMonthly: Number(plan.priceMonthly),
      priceYearly: Number(plan.priceYearly),
    };
  }

  async deletePlan(id: string) {
    // Check if plan has active subscriptions
    const activeSubscriptions = await this.prisma.subscription.count({
      where: {
        planId: id,
        status: { in: ['active', 'trial'] },
      },
    });

    if (activeSubscriptions > 0) {
      throw new Error(
        `Cannot delete plan with ${activeSubscriptions} active subscriptions`,
      );
    }

    await this.prisma.plan.delete({
      where: { id },
    });

    return { message: 'Plan deleted successfully' };
  }

  async togglePlanStatus(id: string) {
    const plan = await this.prisma.plan.findUnique({
      where: { id },
    });

    if (!plan) {
      throw new Error('Plan not found');
    }

    const updated = await this.prisma.plan.update({
      where: { id },
      data: { active: !plan.active },
    });

    return {
      ...updated,
      priceMonthly: Number(updated.priceMonthly),
      priceYearly: Number(updated.priceYearly),
    };
  }

  async getPlanStats() {
    const [totalPlans, activePlans, totalSubscriptions, revenueStats] =
      await Promise.all([
        this.prisma.plan.count(),
        this.prisma.plan.count({ where: { active: true } }),
        this.prisma.subscription.count({
          where: { status: { in: ['active', 'trial'] } },
        }),
        this.prisma.invoice.aggregate({
          _sum: { total: true },
          where: { status: 'paid' },
        }),
      ]);

    const planDistribution = await this.prisma.plan.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: { subscriptions: true },
        },
      },
    });

    return {
      totalPlans,
      activePlans,
      totalSubscriptions,
      totalRevenue: revenueStats._sum.total
        ? Number(revenueStats._sum.total)
        : 0,
      planDistribution: planDistribution.map(p => ({
        planId: p.id,
        planName: p.name,
        subscribers: p._count.subscriptions,
      })),
    };
  }
}
