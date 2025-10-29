import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationFiltersDto } from './dto/notification-filters.dto';
import { PushNotificationService } from './push-notification.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => PushNotificationService))
    private pushService: PushNotificationService,
    @Inject(forwardRef(() => EmailService))
    private emailService: EmailService,
  ) {}

  /**
   * Create a new notification
   */
  async create(userId: string, dto: CreateNotificationDto, mode: string = 'real') {
    return this.prisma.notification.create({
      data: {
        userId,
        mode,
        type: dto.type,
        title: dto.title,
        message: dto.message,
        link: dto.link,
      },
    });
  }

  /**
   * Create a notification for multiple users (broadcast)
   */
  async createMany(userIds: string[], dto: CreateNotificationDto, mode: string = 'real') {
    const notifications = userIds.map(userId => ({
      userId,
      mode,
      type: dto.type,
      title: dto.title,
      message: dto.message,
      link: dto.link,
    }));

    return this.prisma.notification.createMany({
      data: notifications,
    });
  }

  /**
   * Get all notifications for a user with pagination and filters
   */
  async findAll(userId: string, filters: NotificationFiltersDto, mode: string = 'real') {
    const { page = 1, limit = 20, type, unreadOnly } = filters;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = { userId, mode };

    if (type) where.type = type;
    if (unreadOnly) where.readAt = null;

    // Get total count
    const total = await this.prisma.notification.count({ where });

    // Get notifications
    const notifications = await this.prisma.notification.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    return {
      data: notifications,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get unread notifications count
   */
  async getUnreadCount(userId: string, mode: string = 'real') {
    const count = await this.prisma.notification.count({
      where: {
        userId,
        mode,
        readAt: null,
      },
    });

    return { count };
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(userId: string, id: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id, userId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.readAt) {
      return notification; // Already read
    }

    return this.prisma.notification.update({
      where: { id },
      data: { readAt: new Date() },
    });
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string) {
    const result = await this.prisma.notification.updateMany({
      where: {
        userId,
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });

    return {
      message: 'All notifications marked as read',
      count: result.count,
    };
  }

  /**
   * Delete a notification
   */
  async remove(userId: string, id: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id, userId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    await this.prisma.notification.delete({
      where: { id },
    });

    return {
      message: 'Notification deleted successfully',
    };
  }

  /**
   * Delete all read notifications for a user
   */
  async clearRead(userId: string) {
    const result = await this.prisma.notification.deleteMany({
      where: {
        userId,
        readAt: { not: null },
      },
    });

    return {
      message: 'Read notifications cleared',
      count: result.count,
    };
  }

  /**
   * Delete all notifications for a user
   */
  async clearAll(userId: string) {
    const result = await this.prisma.notification.deleteMany({
      where: { userId },
    });

    return {
      message: 'All notifications cleared',
      count: result.count,
    };
  }

  // ============ HELPER METHODS FOR OTHER MODULES ============

  /**
   * Send a notification to a user (helper for other modules)
   * Handles web notification creation + push notifications + email based on user preferences
   */
  async notify(
    userId: string,
    type: 'info' | 'success' | 'warning' | 'error',
    title: string,
    message: string,
    link?: string,
    mode: string = 'real',
  ) {
    // Get user settings and user info to check notification preferences
    const settings = await this.prisma.userSettings.findUnique({
      where: { userId },
    });

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    const notificationPreference = settings?.notificationPreference || 'web_only';
    const pushEnabled = settings?.pushNotificationsEnabled || false;

    // Create web notification if preference allows
    if (notificationPreference !== 'none' && notificationPreference !== 'email_only') {
      await this.create(userId, { type, title, message, link }, mode);
    }

    // Send push notification if enabled and preference allows
    if (pushEnabled && notificationPreference !== 'none' && notificationPreference !== 'email_only') {
      try {
        await this.pushService.sendToUser(userId, title, message, { url: link });
      } catch (error) {
        console.error('Failed to send push notification:', error);
      }
    }

    // Send email notification if preference is 'email_only' or 'both'
    if (user && (notificationPreference === 'email_only' || notificationPreference === 'both')) {
      try {
        await this.emailService.sendNotificationEmail(
          user.email,
          type,
          title,
          message,
          link,
        );
      } catch (error) {
        console.error('Failed to send email notification:', error);
      }
    }

    return { message: 'Notification sent successfully' };
  }

  /**
   * Notify multiple users (helper for other modules)
   */
  async notifyMany(
    userIds: string[],
    type: 'info' | 'success' | 'warning' | 'error',
    title: string,
    message: string,
    link?: string,
    mode: string = 'real',
  ) {
    return this.createMany(userIds, { type, title, message, link }, mode);
  }

  /**
   * Send success notification
   */
  async notifySuccess(userId: string, title: string, message: string, link?: string, mode: string = 'real') {
    return this.notify(userId, 'success', title, message, link, mode);
  }

  /**
   * Send error notification
   */
  async notifyError(userId: string, title: string, message: string, link?: string, mode: string = 'real') {
    return this.notify(userId, 'error', title, message, link, mode);
  }

  /**
   * Send warning notification
   */
  async notifyWarning(userId: string, title: string, message: string, link?: string, mode: string = 'real') {
    return this.notify(userId, 'warning', title, message, link, mode);
  }

  /**
   * Send info notification
   */
  async notifyInfo(userId: string, title: string, message: string, link?: string, mode: string = 'real') {
    return this.notify(userId, 'info', title, message, link, mode);
  }
}
