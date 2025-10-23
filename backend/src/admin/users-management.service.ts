import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UserRole } from '@prisma/client';
import { AuditLogService } from './audit-log.service';

@Injectable()
export class UsersManagementService {
  constructor(
    private prisma: PrismaService,
    private auditLog: AuditLogService,
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
}
