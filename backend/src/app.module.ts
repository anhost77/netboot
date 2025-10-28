import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { AuthModule } from './auth/auth.module';
import { BetsModule } from './bets/bets.module';
import { StorageModule } from './storage/storage.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { StatisticsModule } from './statistics/statistics.module';
import { NotificationsModule } from './notifications/notifications.module';
import { EmailModule } from './email/email.module';
import { SupportModule } from './support/support.module';
import { CmsModule } from './cms/cms.module';
import { BudgetModule } from './budget/budget.module';
import { AdminModule } from './admin/admin.module';
import { PlatformsModule } from './platforms/platforms.module';
import { UserSettingsModule } from './user-settings/user-settings.module';
import { PmuModule } from './pmu/pmu.module';
import { TipstersModule } from './tipsters/tipsters.module';
import { ApiModule } from './api/api.module';
import { McpModule } from './mcp/mcp.module';
import { SettingsModule } from './settings/settings.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([{
      ttl: parseInt(process.env.THROTTLE_TTL || '60') * 1000,
      limit: parseInt(process.env.THROTTLE_LIMIT || '100'),
    }]),
    ScheduleModule.forRoot(),
    AuthModule,
    BetsModule,
    StorageModule,
    SubscriptionsModule,
    StatisticsModule,
    NotificationsModule,
    EmailModule,
    SupportModule,
    CmsModule,
    BudgetModule,
    AdminModule,
    PlatformsModule,
    UserSettingsModule,
    PmuModule,
    TipstersModule,
    ApiModule,
    McpModule,
    SettingsModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
