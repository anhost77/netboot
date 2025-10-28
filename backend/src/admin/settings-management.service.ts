import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

export interface PlatformSettings {
  siteName: string;
  siteDescription: string;
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  emailVerificationRequired: boolean;
  maxBetsPerDay: number;
  maxBetsPerMonth: number;
  minBetAmount: number;
  maxBetAmount: number;
  supportEmail: string;
  contactEmail: string;
  termsUrl: string;
  privacyUrl: string;
  faqUrl: string;
  socialLinks: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  features: {
    pmuIntegration: boolean;
    tipstersEnabled: boolean;
    budgetTracking: boolean;
    notifications: boolean;
    twoFactorAuth: boolean;
  };
  limits: {
    freePlanBetsPerMonth: number;
    basicPlanBetsPerMonth: number;
    premiumPlanBetsPerMonth: number;
  };
}

@Injectable()
export class SettingsManagementService {
  constructor(private prisma: PrismaService) {}

  private defaultSettings: PlatformSettings = {
    siteName: 'NetBoot',
    siteDescription: 'Plateforme de gestion de paris hippiques',
    maintenanceMode: false,
    registrationEnabled: true,
    emailVerificationRequired: false,
    maxBetsPerDay: 100,
    maxBetsPerMonth: 3000,
    minBetAmount: 1,
    maxBetAmount: 10000,
    supportEmail: 'support@netboot.fr',
    contactEmail: 'contact@netboot.fr',
    termsUrl: '/terms',
    privacyUrl: '/privacy',
    faqUrl: '/faq',
    socialLinks: {
      facebook: '',
      twitter: '',
      instagram: '',
      linkedin: '',
    },
    features: {
      pmuIntegration: true,
      tipstersEnabled: true,
      budgetTracking: true,
      notifications: true,
      twoFactorAuth: true,
    },
    limits: {
      freePlanBetsPerMonth: 50,
      basicPlanBetsPerMonth: 500,
      premiumPlanBetsPerMonth: 0, // 0 = unlimited
    },
  };

  async getSettings(): Promise<PlatformSettings> {
    const setting = await this.prisma.platformSetting.findFirst({
      orderBy: { updatedAt: 'desc' },
    });

    if (!setting) {
      // Create default settings if none exist
      const created = await this.prisma.platformSetting.create({
        data: {
          key: 'platform_config',
          value: this.defaultSettings,
        },
      });
      return created.value as PlatformSettings;
    }

    return setting.value as PlatformSettings;
  }

  async updateSettings(settings: Partial<PlatformSettings>): Promise<PlatformSettings> {
    const current = await this.getSettings();
    const updated = { ...current, ...settings };

    const setting = await this.prisma.platformSetting.findFirst();

    if (setting) {
      const result = await this.prisma.platformSetting.update({
        where: { id: setting.id },
        data: { value: updated },
      });
      return result.value as PlatformSettings;
    } else {
      const result = await this.prisma.platformSetting.create({
        data: {
          key: 'platform_config',
          value: updated,
        },
      });
      return result.value as PlatformSettings;
    }
  }

  async resetSettings(): Promise<PlatformSettings> {
    const setting = await this.prisma.platformSetting.findFirst();

    if (setting) {
      const result = await this.prisma.platformSetting.update({
        where: { id: setting.id },
        data: { value: this.defaultSettings },
      });
      return result.value as PlatformSettings;
    } else {
      const result = await this.prisma.platformSetting.create({
        data: {
          key: 'platform_config',
          value: this.defaultSettings,
        },
      });
      return result.value as PlatformSettings;
    }
  }

  async getSystemInfo() {
    const [
      totalUsers,
      totalBets,
      totalRevenue,
      activeSubscriptions,
      storageUsed,
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
      this.prisma.bet.count(), // Approximation for storage
    ]);

    return {
      totalUsers,
      totalBets,
      totalRevenue: totalRevenue._sum.total ? Number(totalRevenue._sum.total) : 0,
      activeSubscriptions,
      storageUsed: Math.round(storageUsed * 0.1), // MB approximation
      uptime: process.uptime(),
      nodeVersion: process.version,
      platform: process.platform,
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      },
    };
  }
}
