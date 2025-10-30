import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PmuController, PmuTestController } from './pmu.controller';
import { PmuService } from './pmu.service';
import { PmuDataService } from './pmu-data.service';
import { PmuAutoUpdateService } from './pmu-auto-update.service';
import { PmuDailySyncService } from './pmu-daily-sync.service';
import { PmuHistoryCollectorService } from './pmu-history-collector.service';
import { PmuAiService } from './pmu-ai.service';
import { PrismaService } from '../prisma.service';
import { EmailModule } from '../email/email.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [HttpModule, EmailModule, NotificationsModule],
  controllers: [PmuController, PmuTestController],
  providers: [
    PmuService,
    PmuDataService,
    PmuAutoUpdateService,
    PmuAiService,
    PmuDailySyncService,
    PmuHistoryCollectorService,
    PrismaService,
  ],
  exports: [PmuService, PmuDataService, PmuHistoryCollectorService],
})
export class PmuModule {}
