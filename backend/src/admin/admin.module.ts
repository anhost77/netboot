import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminDashboardService } from './admin-dashboard.service';
import { UsersManagementService } from './users-management.service';
import { AuditLogService } from './audit-log.service';
import { PlansManagementService } from './plans-management.service';
import { BetsManagementService } from './bets-management.service';
import { SettingsManagementService } from './settings-management.service';
import { PrismaService } from '../prisma.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [AdminController],
  providers: [AdminDashboardService, UsersManagementService, AuditLogService, PlansManagementService, BetsManagementService, SettingsManagementService, PrismaService],
  exports: [AuditLogService], // Export for use in other modules
})
export class AdminModule {}
