import { Module, forwardRef } from '@nestjs/common';
import { BetsService } from './bets.service';
import { BetsController } from './bets.controller';
import { PrismaService } from '../prisma.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { PmuModule } from '../pmu/pmu.module';
import { AuditLogService } from '../admin/audit-log.service';

@Module({
  imports: [
    forwardRef(() => NotificationsModule),
    PmuModule,
  ],
  controllers: [BetsController],
  providers: [BetsService, PrismaService, AuditLogService],
  exports: [BetsService],
})
export class BetsModule {}
