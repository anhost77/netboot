import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UpdateBankrollModeDto } from './dto/update-bankroll-mode.dto';
import { UpdateNotificationPreferencesDto } from './dto/update-notification-preferences.dto';
import { CreatePushSubscriptionDto } from './dto/push-subscription.dto';
import * as crypto from 'crypto';

@Injectable()
export class UserSettingsService {
  constructor(private prisma: PrismaService) {}

  async getSettings(userId: string) {
    let settings = await this.prisma.userSettings.findUnique({
      where: { userId },
    });

    // Create default settings if they don't exist
    if (!settings) {
      settings = await this.prisma.userSettings.create({
        data: {
          userId,
          bankrollMode: 'immediate',
        },
      });
    }

    return settings;
  }

  async updateBankrollMode(userId: string, dto: UpdateBankrollModeDto) {
    // Check if settings exist
    let settings = await this.prisma.userSettings.findUnique({
      where: { userId },
    });

    if (!settings) {
      // Create settings if they don't exist
      settings = await this.prisma.userSettings.create({
        data: {
          userId,
          bankrollMode: dto.bankrollMode,
        },
      });
    } else {
      // Update existing settings
      settings = await this.prisma.userSettings.update({
        where: { userId },
        data: {
          bankrollMode: dto.bankrollMode,
        },
      });
    }

    return {
      message: 'Bankroll mode updated successfully',
      bankrollMode: settings.bankrollMode,
    };
  }

  async updateNotificationPreferences(userId: string, dto: UpdateNotificationPreferencesDto) {
    // Check if settings exist
    let settings = await this.prisma.userSettings.findUnique({
      where: { userId },
    });

    if (!settings) {
      // Create settings if they don't exist
      settings = await this.prisma.userSettings.create({
        data: {
          userId,
          ...dto,
        },
      });
    } else {
      // Update existing settings
      settings = await this.prisma.userSettings.update({
        where: { userId },
        data: dto,
      });
    }

    return {
      message: 'Notification preferences updated successfully',
      settings: {
        notificationsEnabled: settings.notificationsEnabled,
        pushNotificationsEnabled: settings.pushNotificationsEnabled,
        notificationPreference: settings.notificationPreference,
      },
    };
  }

  // Push Subscription Management
  async createPushSubscription(userId: string, dto: CreatePushSubscriptionDto) {
    try {
      const subscription = await this.prisma.pushSubscription.create({
        data: {
          userId,
          endpoint: dto.endpoint,
          p256dh: dto.p256dh,
          auth: dto.auth,
          userAgent: dto.userAgent,
        },
      });

      return {
        message: 'Push subscription created successfully',
        subscription,
      };
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('This device is already subscribed');
      }
      throw error;
    }
  }

  async getPushSubscriptions(userId: string) {
    return this.prisma.pushSubscription.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deletePushSubscription(userId: string, endpoint: string) {
    const subscription = await this.prisma.pushSubscription.findFirst({
      where: { userId, endpoint },
    });

    if (!subscription) {
      throw new NotFoundException('Push subscription not found');
    }

    await this.prisma.pushSubscription.delete({
      where: { id: subscription.id },
    });

    return {
      message: 'Push subscription deleted successfully',
    };
  }

  // API Key Management
  async generateApiKey(userId: string) {
    // Generate a secure random API key
    const apiKey = `btk_${crypto.randomBytes(32).toString('hex')}`;

    // Update user settings with the new API key
    let settings = await this.prisma.userSettings.findUnique({
      where: { userId },
    });

    if (!settings) {
      settings = await this.prisma.userSettings.create({
        data: {
          userId,
          apiKey,
        },
      });
    } else {
      settings = await this.prisma.userSettings.update({
        where: { userId },
        data: { apiKey },
      });
    }

    return {
      message: 'API key generated successfully',
      apiKey, // Return the full key only once
      warning: 'Save this key securely. You won\'t be able to see it again.',
    };
  }

  async getApiKey(userId: string) {
    const settings = await this.prisma.userSettings.findUnique({
      where: { userId },
      select: { apiKey: true },
    });

    if (!settings || !settings.apiKey) {
      return {
        hasApiKey: false,
        message: 'No API key generated yet',
      };
    }

    // Return masked version
    const masked = `${settings.apiKey.substring(0, 8)}...${settings.apiKey.substring(settings.apiKey.length - 4)}`;

    return {
      hasApiKey: true,
      apiKey: masked,
      message: 'API key is active',
    };
  }

  async revokeApiKey(userId: string) {
    await this.prisma.userSettings.update({
      where: { userId },
      data: { apiKey: null },
    });

    return {
      message: 'API key revoked successfully',
    };
  }

  // Verify API key (used by API controller)
  async verifyApiKey(apiKey: string): Promise<string | null> {
    const settings = await this.prisma.userSettings.findFirst({
      where: { apiKey },
      select: { userId: true },
    });

    return settings?.userId || null;
  }
}
