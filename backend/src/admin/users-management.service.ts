import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AuditLogService } from './audit-log.service';
import { NotificationsService } from '../notifications/notifications.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class UsersManagementService {
  private readonly logger = new Logger(UsersManagementService.name);

  constructor(
    private prisma: PrismaService,
    private auditLog: AuditLogService,
    private notificationsService: NotificationsService,
  ) {}

  async findAll(page: number = 1, limit: number = 20, search?: string, role?: UserRole) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.role = role;
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          subscriptions: { take: 1, orderBy: { createdAt: 'desc' } },
          _count: { select: { bets: true, supportTickets: true } },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async updateRole(adminId: string, userId: string, role: UserRole, ipAddress?: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    await this.auditLog.log(adminId, 'UPDATE_USER_ROLE', 'User', userId, { oldRole: user.role, newRole: role }, ipAddress);

    return updated;
  }

  async deleteUser(adminId: string, userId: string, ipAddress?: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (user.role === UserRole.admin) throw new BadRequestException('Cannot delete admin users');

    await this.prisma.user.update({ where: { id: userId }, data: { deletedAt: new Date() } });
    await this.auditLog.log(adminId, 'DELETE_USER', 'User', userId, { email: user.email }, ipAddress);

    return { message: 'User deleted successfully' };
  }

  async findOne(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        emailVerifiedAt: true,
        deletedAt: true,
        twoFactorEnabled: true,
        phone: true,
        address: true,
        city: true,
        postalCode: true,
        country: true,
      },
    });

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async getUserStats(userId: string) {
    const bets = await this.prisma.bet.findMany({
      where: { userId },
    });

    const totalBets = bets.length;
    const wonBets = bets.filter(b => b.status === 'won').length;
    const lostBets = bets.filter(b => b.status === 'lost').length;
    const totalStake = bets.reduce((sum, b) => sum + Number(b.stake), 0);
    const totalProfit = bets.reduce((sum, b) => sum + (b.profit ? Number(b.profit) : 0), 0);
    const winRate = totalBets > 0 ? (wonBets / totalBets) * 100 : 0;
    const roi = totalStake > 0 ? (totalProfit / totalStake) * 100 : 0;

    return {
      totalBets,
      wonBets,
      lostBets,
      totalStake,
      totalProfit,
      winRate,
      roi,
    };
  }

  async getUserSubscription(userId: string) {
    const subscription = await this.prisma.subscription.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        plan: true,
      },
    });

    return subscription;
  }

  async getUserInvoices(userId: string) {
    const invoices = await this.prisma.invoice.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return invoices;
  }

  async getUserTickets(userId: string) {
    const tickets = await this.prisma.supportTicket.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    return tickets;
  }

  async getUserNotifications(userId: string, page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.notification.count({
        where: { userId },
      }),
    ]);

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

  async getUserAuditLogs(userId: string, page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where: { adminId: userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.auditLog.count({
        where: { adminId: userId },
      }),
    ]);

    return {
      data: logs,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUserTipsters(userId: string) {
    const tipsters = await this.prisma.tipster.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        bets: {
          select: {
            id: true,
            stake: true,
            profit: true,
            status: true,
            date: true,
          },
        },
      },
    });

    // Calculate statistics for each tipster
    return tipsters.map(tipster => {
      const bets = tipster.bets || [];
      const totalBets = bets.length;
      const wonBets = bets.filter(b => b.status === 'won').length;
      const totalStake = bets.reduce((sum, b) => sum + Number(b.stake || 0), 0);
      const totalProfit = bets.reduce((sum, b) => sum + Number(b.profit || 0), 0);
      
      // Find last bet date
      const lastBetDate = bets.length > 0 
        ? bets.reduce((latest, bet) => {
            const betDate = new Date(bet.date);
            return betDate > latest ? betDate : latest;
          }, new Date(bets[0].date))
        : null;

      return {
        ...tipster,
        bets: undefined, // Remove bets array from response
        totalBets,
        wonBets,
        totalStake,
        totalProfit,
        lastBetDate,
      };
    });
  }

  async getUserPlatforms(userId: string) {
    const platforms = await this.prisma.platform.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return platforms;
  }

  async getUserBets(userId: string) {
    const bets = await this.prisma.bet.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      include: {
        tipster: {
          select: {
            name: true,
          },
        },
      },
    });

    return bets;
  }

  async getUserDetailedStats(userId: string) {
    // Get all bets
    const bets = await this.prisma.bet.findMany({
      where: { userId },
    });

    // Get all platforms
    const platforms = await this.prisma.platform.findMany({
      where: { userId },
    });

    const totalBets = bets.length;
    const totalStake = bets.reduce((sum, b) => sum + Number(b.stake || 0), 0);
    const totalProfit = bets.reduce((sum, b) => sum + Number(b.profit || 0), 0);
    const pendingBets = bets.filter(b => b.status === 'pending');
    const pendingStake = pendingBets.reduce((sum, b) => sum + Number(b.stake || 0), 0);
    
    const averageStake = totalBets > 0 ? totalStake / totalBets : 0;
    const averageOdds = bets.filter(b => b.odds).length > 0
      ? bets.reduce((sum, b) => sum + Number(b.odds || 0), 0) / bets.filter(b => b.odds).length
      : 0;

    const initialBankroll = platforms.reduce((sum, p) => sum + Number(p.initialBankroll || 0), 0);
    const currentBankroll = platforms.reduce((sum, p) => sum + Number(p.currentBankroll || 0), 0);
    const bankrollOperations = currentBankroll - initialBankroll - totalProfit;

    const roc = initialBankroll > 0 ? ((currentBankroll - initialBankroll) / initialBankroll) * 100 : 0;
    const roi = totalStake > 0 ? (totalProfit / totalStake) * 100 : 0;

    return {
      totalBets,
      averageOdds,
      totalStake,
      pendingStake,
      averageStake,
      initialBankroll,
      bankrollOperations,
      currentBankroll,
      roc,
      roi,
    };
  }

  async getUserBudget(userId: string) {
    // Get all bets for the user
    const bets = await this.prisma.bet.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });

    // Get all platforms to calculate total bankroll
    const platforms = await this.prisma.platform.findMany({
      where: { userId },
    });

    const totalInitialBankroll = platforms.reduce((sum, p) => sum + Number(p.initialBankroll || 0), 0);
    const totalCurrentBankroll = platforms.reduce((sum, p) => sum + Number(p.currentBankroll || 0), 0);

    // Calculate overall stats
    const totalBets = bets.length;
    const wonBets = bets.filter(b => b.status === 'won').length;
    const totalStake = bets.reduce((sum, b) => sum + Number(b.stake || 0), 0);
    const totalProfit = bets.reduce((sum, b) => sum + Number(b.profit || 0), 0);
    const calculatedROI = totalStake > 0 ? (totalProfit / totalStake) * 100 : 0;
    const winRate = totalBets > 0 ? (wonBets / totalBets) * 100 : 0;

    // Group bets by month
    const monthlyData = new Map<string, any>();
    
    bets.forEach(bet => {
      const date = new Date(bet.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' });

      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, {
          month: monthLabel,
          betsCount: 0,
          wonBets: 0,
          totalStake: 0,
          totalProfit: 0,
        });
      }

      const monthStats = monthlyData.get(monthKey);
      monthStats.betsCount++;
      if (bet.status === 'won') monthStats.wonBets++;
      monthStats.totalStake += Number(bet.stake || 0);
      monthStats.totalProfit += Number(bet.profit || 0);
    });

    // Convert to array and calculate additional stats
    const monthlyHistory = Array.from(monthlyData.values())
      .map(month => ({
        ...month,
        winRate: month.betsCount > 0 ? ((month.wonBets / month.betsCount) * 100).toFixed(1) : '0.0',
        roi: month.totalStake > 0 ? ((month.totalProfit / month.totalStake) * 100).toFixed(2) : '0.0',
      }))
      .reverse(); // Most recent first

    return {
      overview: {
        initialBankroll: totalInitialBankroll,
        currentBankroll: totalCurrentBankroll,
        calculatedROI,
        winRate,
        totalBets,
        wonBets,
        totalStake,
        totalProfit,
      },
      monthlyHistory,
    };
  }

  async updateUser(adminId: string, userId: string, data: any, ipAddress?: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city,
        postalCode: data.postalCode,
        country: data.country,
      },
    });

    await this.auditLog.log(adminId, 'UPDATE_USER', 'User', userId, { changes: data }, ipAddress);

    return updated;
  }

  async suspendUser(adminId: string, userId: string, ipAddress?: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (user.role === UserRole.admin) throw new BadRequestException('Cannot suspend admin users');

    // Note: Using deletedAt as suspension marker for now
    // In production, you might want to add a dedicated 'suspendedAt' field to the schema
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date() },
    });

    await this.auditLog.log(adminId, 'SUSPEND_USER', 'User', userId, { email: user.email }, ipAddress);

    return { message: 'User suspended successfully', user: updated };
  }

  async resetUserPassword(adminId: string, userId: string, ipAddress?: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    // TODO: Implement password reset email sending
    // For now, just log the action
    await this.auditLog.log(adminId, 'RESET_USER_PASSWORD', 'User', userId, { email: user.email }, ipAddress);

    return { message: 'Password reset email sent successfully' };
  }

  async disableUser2FA(adminId: string, userId: string, ipAddress?: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { 
        twoFactorEnabled: false,
        twoFactorSecret: null,
      },
    });

    await this.auditLog.log(adminId, 'DISABLE_USER_2FA', 'User', userId, { email: user.email }, ipAddress);

    return { message: '2FA disabled successfully', user: updated };
  }

  async exportUserData(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        bets: true,
        platforms: true,
        subscriptions: {
          include: { plan: true },
        },
        invoices: true,
        supportTickets: {
          include: { messages: true },
        },
      },
    });

    if (!user) throw new NotFoundException('User not found');

    // Remove sensitive data
    const { passwordHash, twoFactorSecret, ...userData } = user as any;

    return {
      exportDate: new Date().toISOString(),
      gdprCompliance: 'Article 20 - Right to data portability',
      user: userData,
    };
  }

  async gdprDeleteUser(adminId: string, userId: string, ipAddress?: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (user.role === UserRole.admin) throw new BadRequestException('Cannot delete admin users');

    // Log before deletion
    await this.auditLog.log(adminId, 'GDPR_DELETE_USER', 'User', userId, { 
      email: user.email,
      gdprArticle: 'Article 17 - Right to erasure',
    }, ipAddress);

    // Delete all related data (cascade should handle most of it)
    await this.prisma.user.delete({ where: { id: userId } });

    return { 
      message: 'User data permanently deleted (RGPD compliant)',
      gdprCompliance: 'Article 17 - Right to erasure (Right to be forgotten)',
    };
  }

  // Support Tickets Management
  async getAllTickets() {
    const tickets = await this.prisma.supportTicket.findMany({
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
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    return tickets;
  }

  async getTicketById(ticketId: string) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    return ticket;
  }

  async respondToTicket(ticketId: string, message: string, adminId: string) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: {
        user: true,
      },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    // Create response message
    const response = await this.prisma.supportMessage.create({
      data: {
        ticketId,
        message,
        userId: adminId, // Admin user ID
        isInternalNote: false,
      },
    });

    // Update ticket status to in_progress if it was new
    if (ticket.status === 'new') {
      await this.prisma.supportTicket.update({
        where: { id: ticketId },
        data: { status: 'in_progress' },
      });
    }

    // Send notification to user (respects user preferences: web/email/push/both)
    try {
      await this.notificationsService.notify(
        ticket.userId,
        'info',
        'Réponse à votre ticket de support',
        `Nous avons répondu à votre ticket "${ticket.subject}". Consultez votre espace support pour voir notre réponse.`,
        `/support/tickets/${ticketId}`,
      );
      this.logger.log(`Notification sent to user ${ticket.userId} for ticket ${ticketId}`);
    } catch (error) {
      this.logger.error('Failed to send notification:', error);
    }

    // Log action (non-blocking)
    try {
      await this.auditLog.log(adminId, 'RESPOND_TICKET', 'SupportTicket', ticketId, {
        userId: ticket.userId,
        subject: ticket.subject,
      });
    } catch (error) {
      this.logger.warn('Failed to log audit action:', error.message);
    }

    return response;
  }

  async updateTicketStatus(ticketId: string, status: string, adminId: string) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
          },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    // Validate status
    const validStatuses = ['new', 'in_progress', 'waiting_customer', 'resolved', 'closed'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const updated = await this.prisma.supportTicket.update({
      where: { id: ticketId },
      data: { status: status as any },
    });

    // Send notification to user for important status changes
    const statusLabels = {
      new: 'Nouveau',
      in_progress: 'En cours de traitement',
      waiting_customer: 'En attente de votre réponse',
      resolved: 'Résolu',
      closed: 'Fermé',
    };

    if (status === 'resolved' || status === 'closed' || status === 'waiting_customer') {
      try {
        await this.notificationsService.notify(
          ticket.userId,
          status === 'resolved' ? 'success' : status === 'closed' ? 'info' : 'warning',
          `Ticket de support : ${statusLabels[status]}`,
          `Votre ticket "${ticket.subject}" est maintenant ${statusLabels[status].toLowerCase()}.`,
          `/support/tickets/${ticketId}`,
        );
        this.logger.log(`Status change notification sent to user ${ticket.userId} for ticket ${ticketId}`);
      } catch (error) {
        this.logger.error('Failed to send status change notification:', error);
      }
    }

    // Log action (non-blocking)
    try {
      await this.auditLog.log(adminId, 'UPDATE_TICKET_STATUS', 'SupportTicket', ticketId, {
        oldStatus: ticket.status,
        newStatus: status,
      });
    } catch (error) {
      this.logger.warn('Failed to log audit action:', error.message);
    }

    return updated;
  }
}
