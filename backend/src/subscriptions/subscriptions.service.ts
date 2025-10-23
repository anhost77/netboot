import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SubscriptionsService {
  private isDemoMode: boolean;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    // Demo mode if no Stripe key configured
    const stripeKey = this.config.get('STRIPE_SECRET_KEY');
    this.isDemoMode = !stripeKey || stripeKey === 'sk_test_' || stripeKey.length < 20;

    if (this.isDemoMode) {
      console.log('⚠️  Subscriptions running in DEMO MODE (Stripe not configured)');
    }
  }

  async getCurrentSubscription(userId: string) {
    const subscription = await this.prisma.subscription.findFirst({
      where: {
        userId,
        status: { in: ['trial', 'active', 'past_due'] },
      },
      include: {
        plan: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!subscription) {
      throw new NotFoundException('No active subscription found');
    }

    return {
      ...subscription,
      demoMode: this.isDemoMode,
    };
  }

  async getAllPlans() {
    const plans = await this.prisma.plan.findMany({
      where: { active: true },
      orderBy: { displayOrder: 'asc' },
    });

    return plans.map((plan: any) => ({
      ...plan,
      demoMode: this.isDemoMode,
    }));
  }

  async createCheckoutSession(userId: string, planId: string, billingCycle: 'monthly' | 'yearly') {
    const plan = await this.prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    if (this.isDemoMode) {
      // Demo mode: simulate checkout
      return {
        demoMode: true,
        message: 'Running in demo mode - Stripe not configured',
        checkoutUrl: `${this.config.get('FRONTEND_URL')}/checkout/demo?plan=${plan.slug}&cycle=${billingCycle}`,
        plan: {
          name: plan.name,
          price: billingCycle === 'monthly' ? plan.priceMonthly : plan.priceYearly,
          cycle: billingCycle,
        },
      };
    }

    // Real Stripe integration would go here
    throw new BadRequestException('Stripe integration not yet implemented. Use demo mode.');
  }

  async changePlan(userId: string, newPlanId: string) {
    const currentSub = await this.getCurrentSubscription(userId);
    const newPlan = await this.prisma.plan.findUnique({
      where: { id: newPlanId },
    });

    if (!newPlan) {
      throw new NotFoundException('New plan not found');
    }

    if (this.isDemoMode) {
      // Demo mode: just update the subscription
      const updated = await this.prisma.subscription.update({
        where: { id: currentSub.id },
        data: {
          planId: newPlanId,
        },
        include: {
          plan: true,
        },
      });

      return {
        demoMode: true,
        message: 'Plan changed in demo mode',
        subscription: updated,
      };
    }

    // Real Stripe plan change would go here
    throw new BadRequestException('Stripe integration not yet implemented. Use demo mode.');
  }

  async cancelSubscription(userId: string) {
    const subscription = await this.getCurrentSubscription(userId);

    if (this.isDemoMode) {
      // Demo mode: mark as cancelled
      const updated = await this.prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          cancelAtPeriodEnd: true,
          cancelledAt: new Date(),
        },
      });

      return {
        demoMode: true,
        message: 'Subscription cancelled in demo mode',
        subscription: updated,
      };
    }

    // Real Stripe cancellation would go here
    throw new BadRequestException('Stripe integration not yet implemented. Use demo mode.');
  }

  async resumeSubscription(userId: string) {
    const subscription = await this.getCurrentSubscription(userId);

    if (!subscription.cancelAtPeriodEnd) {
      throw new BadRequestException('Subscription is not cancelled');
    }

    if (this.isDemoMode) {
      // Demo mode: mark as resumed
      const updated = await this.prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          cancelAtPeriodEnd: false,
          cancelledAt: null,
        },
      });

      return {
        demoMode: true,
        message: 'Subscription resumed in demo mode',
        subscription: updated,
      };
    }

    // Real Stripe resumption would go here
    throw new BadRequestException('Stripe integration not yet implemented. Use demo mode.');
  }

  async getInvoices(userId: string) {
    const invoices = await this.prisma.invoice.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return {
      demoMode: this.isDemoMode,
      invoices,
    };
  }

  async getInvoice(userId: string, invoiceId: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        userId,
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return {
      demoMode: this.isDemoMode,
      invoice,
    };
  }

  async simulateDemoPayment(userId: string, planId: string, billingCycle: 'monthly' | 'yearly') {
    if (!this.isDemoMode) {
      throw new BadRequestException('This endpoint is only available in demo mode');
    }

    const plan = await this.prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    // Check if user already has an active subscription
    const existingSub = await this.prisma.subscription.findFirst({
      where: {
        userId,
        status: { in: ['trial', 'active'] },
      },
    });

    if (existingSub) {
      // Update existing subscription
      const updated = await this.prisma.subscription.update({
        where: { id: existingSub.id },
        data: {
          planId,
          billingCycle,
          status: 'active',
          currentPeriodStart: new Date(),
          currentPeriodEnd: this.calculatePeriodEnd(billingCycle),
          trialEndsAt: null,
        },
        include: {
          plan: true,
        },
      });

      // Create demo invoice
      await this.createDemoInvoice(userId, updated.id, plan, billingCycle);

      return {
        demoMode: true,
        message: 'Demo payment successful - subscription updated',
        subscription: updated,
      };
    }

    // Create new subscription
    const subscription = await this.prisma.subscription.create({
      data: {
        userId,
        planId,
        status: 'active',
        billingCycle,
        currentPeriodStart: new Date(),
        currentPeriodEnd: this.calculatePeriodEnd(billingCycle),
      },
      include: {
        plan: true,
      },
    });

    // Create demo invoice
    await this.createDemoInvoice(userId, subscription.id, plan, billingCycle);

    return {
      demoMode: true,
      message: 'Demo payment successful - subscription created',
      subscription,
    };
  }

  private calculatePeriodEnd(billingCycle: 'monthly' | 'yearly'): Date {
    const end = new Date();
    if (billingCycle === 'monthly') {
      end.setMonth(end.getMonth() + 1);
    } else {
      end.setFullYear(end.getFullYear() + 1);
    }
    return end;
  }

  private async createDemoInvoice(
    userId: string,
    subscriptionId: string,
    plan: any,
    billingCycle: 'monthly' | 'yearly',
  ) {
    const amount = billingCycle === 'monthly'
      ? plan.priceMonthly.toNumber()
      : plan.priceYearly.toNumber();
    const tax = amount * 0.2; // 20% TVA
    const total = amount + tax;

    // Generate invoice number
    const year = new Date().getFullYear();
    const count = await this.prisma.invoice.count();
    const invoiceNumber = `DEMO-${year}-${String(count + 1).padStart(5, '0')}`;

    return this.prisma.invoice.create({
      data: {
        userId,
        subscriptionId,
        invoiceNumber,
        amount,
        tax,
        total,
        currency: 'EUR',
        status: 'paid',
        paidAt: new Date(),
      },
    });
  }
}
