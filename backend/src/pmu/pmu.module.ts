import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PmuController, PmuTestController } from './pmu.controller';
import { PmuService } from './pmu.service';
import { PmuDataService } from './pmu-data.service';
import { PmuAutoUpdateService } from './pmu-auto-update.service';
import { PmuAiService } from './pmu-ai.service';
import { PmuPronosticAnalyzerService } from './pmu-pronostic-analyzer.service';
import { PmuDailySyncService } from './pmu-daily-sync.service';
import { PmuHistoryCollectorService } from './pmu-history-collector.service';
import { WeatherService } from './weather.service';
import { WeatherCacheService } from './weather-cache.service';
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
    PmuPronosticAnalyzerService,
    WeatherService,
    WeatherCacheService,
    PmuDailySyncService,
    PmuHistoryCollectorService,
    PrismaService,
  ],
  exports: [PmuService, PmuDataService, PmuHistoryCollectorService, PmuPronosticAnalyzerService],
})
export class PmuModule {}
