import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma.service';
import * as webPush from 'web-push';

@Injectable()
export class PushNotificationService {
  private readonly logger = new Logger(PushNotificationService.name);

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    // Configure web-push with VAPID keys
    const vapidPublicKey = this.config.get('VAPID_PUBLIC_KEY');
    const vapidPrivateKey = this.config.get('VAPID_PRIVATE_KEY');
    const vapidSubject = this.config.get('VAPID_SUBJECT', 'mailto:admin@bettracker.com');

    if (vapidPublicKey && vapidPrivateKey) {
      webPush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
    } else {
      this.logger.warn('VAPID keys not configured. Push notifications will not work.');
    }
  }

  /**
   * Send push notification to a specific user
   */
  async sendToUser(
    userId: string,
    title: string,
    body: string,
    data?: any,
  ): Promise<{ sent: number; failed: number }> {
    // Get user's push subscriptions
    const subscriptions = await this.prisma.pushSubscription.findMany({
      where: { userId },
    });

    if (subscriptions.length === 0) {
      this.logger.debug(`No push subscriptions found for user ${userId}`);
      return { sent: 0, failed: 0 };
    }

    const payload = JSON.stringify({
      title,
      body,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      data: {
        url: data?.url || '/dashboard/notifications',
        ...data,
      },
    });

    let sent = 0;
    let failed = 0;

    // Send to all user's subscriptions
    for (const subscription of subscriptions) {
      try {
        await webPush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dh,
              auth: subscription.auth,
            },
          },
          payload,
        );
        sent++;
        this.logger.debug(`Push notification sent to ${subscription.endpoint}`);
      } catch (error) {
        failed++;
        this.logger.error(`Failed to send push notification: ${error.message}`);

        // If subscription is no longer valid (410 Gone), delete it
        if (error.statusCode === 410) {
          await this.prisma.pushSubscription.delete({
            where: { id: subscription.id },
          });
          this.logger.debug(`Deleted invalid subscription ${subscription.id}`);
        }
      }
    }

    return { sent, failed };
  }

  /**
   * Send push notification to multiple users
   */
  async sendToUsers(
    userIds: string[],
    title: string,
    body: string,
    data?: any,
  ): Promise<{ sent: number; failed: number }> {
    let totalSent = 0;
    let totalFailed = 0;

    for (const userId of userIds) {
      const result = await this.sendToUser(userId, title, body, data);
      totalSent += result.sent;
      totalFailed += result.failed;
    }

    return { sent: totalSent, failed: totalFailed };
  }

  /**
   * Get VAPID public key for client subscription
   */
  getVapidPublicKey(): string {
    return this.config.get('VAPID_PUBLIC_KEY', '');
  }
}
