import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminDashboardService } from './admin-dashboard.service';
import { UsersManagementService } from './users-management.service';
import { AuditLogService } from './audit-log.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [AdminController],
  providers: [AdminDashboardService, UsersManagementService, AuditLogService, PrismaService],
  exports: [AuditLogService], // Export for use in other modules
})
export class AdminModule {}
