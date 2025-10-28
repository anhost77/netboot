import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AuditLogService {
  constructor(private prisma: PrismaService) {}

  async log(adminId: string, action: string, entityType: string, entityId?: string, changes?: any, ipAddress?: string, userAgent?: string) {
    return this.prisma.auditLog.create({
      data: {
        adminId,
        action,
        entityType,
        entityId,
        changes,
        ipAddress,
        userAgent,
      },
    });
  }

  async findAll(page: number = 1, limit: number = 50, adminId?: string, action?: string, entityType?: string, startDate?: string, endDate?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};
    
    if (adminId) where.adminId = adminId;
    if (action) where.action = action;
    if (entityType) where.entityType = entityType;
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { 
          admin: { 
            select: { 
              id: true,
              email: true, 
              firstName: true, 
              lastName: true,
              role: true,
            } 
          } 
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return { data: logs, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async getStats(startDate?: string, endDate?: string) {
    const where: any = {};
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [
      totalLogs,
      actionDistribution,
      entityTypeDistribution,
      topUsers,
      recentActivity,
      activityByHour,
    ] = await Promise.all([
      // Total logs
      this.prisma.auditLog.count({ where }),

      // Actions distribution
      this.prisma.auditLog.groupBy({
        by: ['action'],
        where,
        _count: { action: true },
        orderBy: { _count: { action: 'desc' } },
        take: 10,
      }),

      // Entity types distribution
      this.prisma.auditLog.groupBy({
        by: ['entityType'],
        where,
        _count: { entityType: true },
        orderBy: { _count: { entityType: 'desc' } },
      }),

      // Top users by activity
      this.prisma.auditLog.groupBy({
        by: ['adminId'],
        where,
        _count: { adminId: true },
        orderBy: { _count: { adminId: 'desc' } },
        take: 10,
      }),

      // Recent activity (last 24h)
      this.prisma.auditLog.count({
        where: {
          ...where,
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      }),

      // Activity by hour (last 24h)
      this.prisma.auditLog.findMany({
        where: {
          ...where,
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
        select: {
          createdAt: true,
        },
      }),
    ]);

    // Get user details for top users
    const userIds = topUsers.map(u => u.adminId);
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    const topUsersWithDetails = topUsers.map(u => {
      const user = users.find(usr => usr.id === u.adminId);
      return {
        userId: u.adminId,
        email: user?.email || 'Unknown',
        name: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
        role: user?.role || 'user',
        count: u._count.adminId,
      };
    });

    // Process activity by hour
    const hourlyActivity = new Array(24).fill(0);
    activityByHour.forEach(log => {
      const hour = new Date(log.createdAt).getHours();
      hourlyActivity[hour]++;
    });

    return {
      totalLogs,
      recentActivity24h: recentActivity,
      actionDistribution: actionDistribution.map(a => ({
        action: a.action,
        count: a._count.action,
      })),
      entityTypeDistribution: entityTypeDistribution.map(e => ({
        entityType: e.entityType,
        count: e._count.entityType,
      })),
      topUsers: topUsersWithDetails,
      activityByHour: hourlyActivity.map((count, hour) => ({
        hour,
        count,
      })),
    };
  }

  async getActivityTimeline(days: number = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const logs = await this.prisma.auditLog.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      select: {
        createdAt: true,
        action: true,
      },
    });

    // Group by day
    const timeline: Record<string, number> = {};
    logs.forEach(log => {
      const date = new Date(log.createdAt).toISOString().split('T')[0];
      timeline[date] = (timeline[date] || 0) + 1;
    });

    return Object.entries(timeline).map(([date, count]) => ({
      date,
      count,
    })).sort((a, b) => a.date.localeCompare(b.date));
  }
}
