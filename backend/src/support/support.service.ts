import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { EmailService } from '../email/email.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { AddMessageDto } from './dto/add-message.dto';
import { TicketFiltersDto } from './dto/ticket-filters.dto';
import { TicketStatus, TicketPriority, UserRole } from '@prisma/client';

@Injectable()
export class SupportService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private notificationsService: NotificationsService,
  ) {}

  /**
   * Create a new support ticket
   */
  async createTicket(userId: string, dto: CreateTicketDto) {
    const ticket = await this.prisma.supportTicket.create({
      data: {
        userId,
        subject: dto.subject,
        category: dto.category,
        priority: dto.priority || TicketPriority.normal,
        status: TicketStatus.new,
      },
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
    });

    // Create the first message
    await this.prisma.supportMessage.create({
      data: {
        ticketId: ticket.id,
        userId,
        message: dto.message,
        attachments: dto.attachments || null,
      },
    });

    // Notify user
    await this.notificationsService.notifySuccess(
      userId,
      'Ticket créé',
      `Votre ticket #${ticket.id.slice(0, 8)} a été créé avec succès`,
      `/support/${ticket.id}`,
    );

    return ticket;
  }

  /**
   * Get all tickets with filters (user or admin)
   */
  async findAll(userId: string, userRole: UserRole, filters: TicketFiltersDto) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    // Non-admins can only see their own tickets
    if (userRole !== UserRole.admin) {
      where.userId = userId;
    } else {
      // Admin filters
      if (filters.userId) {
        where.userId = filters.userId;
      }
      if (filters.assignedToAdminId) {
        where.assignedToAdminId = filters.assignedToAdminId;
      }
    }

    // Common filters
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.priority) {
      where.priority = filters.priority;
    }
    if (filters.category) {
      where.category = filters.category;
    }

    const [tickets, total] = await Promise.all([
      this.prisma.supportTicket.findMany({
        where,
        skip,
        take: limit,
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
          assignedTo: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          _count: {
            select: { messages: true },
          },
        },
      }),
      this.prisma.supportTicket.count({ where }),
    ]);

    return {
      data: tickets,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a single ticket by ID
   */
  async findOne(ticketId: string, userId: string, userRole: UserRole) {
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
        assignedTo: {
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
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket non trouvé');
    }

    // Non-admins can only view their own tickets
    if (userRole !== UserRole.admin && ticket.userId !== userId) {
      throw new ForbiddenException('Accès refusé à ce ticket');
    }

    return ticket;
  }

  /**
   * Update a ticket (status, priority, assignment)
   */
  async updateTicket(
    ticketId: string,
    userId: string,
    userRole: UserRole,
    dto: UpdateTicketDto,
  ) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
          },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket non trouvé');
    }

    // Only admins can update tickets
    if (userRole !== UserRole.admin) {
      throw new ForbiddenException('Seuls les admins peuvent modifier les tickets');
    }

    const updateData: any = {};

    if (dto.status !== undefined) {
      updateData.status = dto.status;

      // If closing the ticket, set closedAt
      if (dto.status === TicketStatus.closed) {
        updateData.closedAt = new Date();
      }
    }

    if (dto.priority !== undefined) {
      updateData.priority = dto.priority;
    }

    if (dto.assignedToAdminId !== undefined) {
      updateData.assignedToAdminId = dto.assignedToAdminId;
    }

    const updated = await this.prisma.supportTicket.update({
      where: { id: ticketId },
      data: updateData,
      include: {
        user: true,
        assignedTo: true,
      },
    });

    // Notify user of status change
    if (dto.status && dto.status !== ticket.status) {
      const statusMessages: Record<string, string> = {
        in_progress: 'Votre ticket est en cours de traitement',
        waiting_customer: 'En attente de votre réponse',
        resolved: 'Votre ticket a été résolu',
        closed: 'Votre ticket a été fermé',
      };

      const message = statusMessages[dto.status] || `Statut changé: ${dto.status}`;

      await this.notificationsService.notifyInfo(
        ticket.userId,
        'Mise à jour du ticket',
        message,
        `/support/${ticketId}`,
      );
    }

    return updated;
  }

  /**
   * Add a message to a ticket
   */
  async addMessage(
    ticketId: string,
    userId: string,
    userRole: UserRole,
    dto: AddMessageDto,
  ) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
          },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket non trouvé');
    }

    // Non-admins can only add messages to their own tickets
    if (userRole !== UserRole.admin && ticket.userId !== userId) {
      throw new ForbiddenException('Accès refusé à ce ticket');
    }

    // Internal notes can only be created by admins
    if (dto.isInternalNote && userRole !== UserRole.admin) {
      throw new ForbiddenException('Seuls les admins peuvent créer des notes internes');
    }

    const message = await this.prisma.supportMessage.create({
      data: {
        ticketId,
        userId,
        message: dto.message,
        attachments: dto.attachments || null,
        isInternalNote: dto.isInternalNote || false,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    // Update ticket status if it was waiting for customer
    if (
      ticket.status === TicketStatus.waiting_customer &&
      ticket.userId === userId
    ) {
      await this.prisma.supportTicket.update({
        where: { id: ticketId },
        data: { status: TicketStatus.in_progress },
      });
    }

    // If admin replied (not an internal note), notify the user and send email
    if (userRole === UserRole.admin && !dto.isInternalNote) {
      await this.emailService.sendSupportReply(
        ticket.user.email,
        ticketId.slice(0, 8),
        ticket.userId,
      );
    }

    // If user replied, notify admins (in-app only)
    if (userRole !== UserRole.admin) {
      // Set status to in_progress if it was waiting_customer
      if (ticket.status === TicketStatus.waiting_customer) {
        await this.notificationsService.notify(
          ticket.userId,
          'info',
          'Réponse reçue',
          `Nouvelle réponse sur le ticket #${ticketId.slice(0, 8)}`,
          `/support/${ticketId}`,
        );
      }
    }

    return message;
  }

  /**
   * Get messages for a ticket
   */
  async getMessages(ticketId: string, userId: string, userRole: UserRole) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
      select: { userId: true },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket non trouvé');
    }

    // Non-admins can only view messages from their own tickets
    if (userRole !== UserRole.admin && ticket.userId !== userId) {
      throw new ForbiddenException('Accès refusé à ce ticket');
    }

    const where: any = { ticketId };

    // Non-admins cannot see internal notes
    if (userRole !== UserRole.admin) {
      where.isInternalNote = false;
    }

    const messages = await this.prisma.supportMessage.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    return messages;
  }

  /**
   * Close a ticket (user or admin)
   */
  async closeTicket(ticketId: string, userId: string, userRole: UserRole) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket non trouvé');
    }

    // Non-admins can only close their own tickets
    if (userRole !== UserRole.admin && ticket.userId !== userId) {
      throw new ForbiddenException('Accès refusé à ce ticket');
    }

    const updated = await this.prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        status: TicketStatus.closed,
        closedAt: new Date(),
      },
      include: {
        user: true,
      },
    });

    await this.notificationsService.notifySuccess(
      ticket.userId,
      'Ticket fermé',
      `Le ticket #${ticketId.slice(0, 8)} a été fermé`,
      `/support/${ticketId}`,
    );

    return updated;
  }

  /**
   * Get ticket statistics (admin only)
   */
  async getStatistics() {
    const [
      totalTickets,
      openTickets,
      closedTickets,
      ticketsByStatus,
      ticketsByPriority,
      avgResponseTime,
    ] = await Promise.all([
      this.prisma.supportTicket.count(),
      this.prisma.supportTicket.count({
        where: {
          status: {
            in: [
              TicketStatus.new,
              TicketStatus.in_progress,
              TicketStatus.waiting_customer,
            ],
          },
        },
      }),
      this.prisma.supportTicket.count({
        where: {
          status: {
            in: [TicketStatus.resolved, TicketStatus.closed],
          },
        },
      }),
      this.prisma.supportTicket.groupBy({
        by: ['status'],
        _count: true,
      }),
      this.prisma.supportTicket.groupBy({
        by: ['priority'],
        _count: true,
      }),
      // This is a simplified avg response time calculation
      this.prisma.$queryRaw<{ avg_hours: number }[]>`
        SELECT AVG(EXTRACT(EPOCH FROM (closed_at - created_at)) / 3600) as avg_hours
        FROM support_tickets
        WHERE closed_at IS NOT NULL
      `,
    ]);

    return {
      totalTickets,
      openTickets,
      closedTickets,
      byStatus: ticketsByStatus.reduce((acc: Record<string, number>, item: any) => {
        acc[item.status] = item._count;
        return acc;
      }, {} as Record<string, number>),
      byPriority: ticketsByPriority.reduce((acc: Record<string, number>, item: any) => {
        acc[item.priority] = item._count;
        return acc;
      }, {} as Record<string, number>),
      avgResponseTimeHours: avgResponseTime[0]?.avg_hours || 0,
    };
  }
}
