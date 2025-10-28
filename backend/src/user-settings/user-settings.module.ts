import { Module, forwardRef } from '@nestjs/common';
import { UserSettingsController } from './user-settings.controller';
import { UserSettingsService } from './user-settings.service';
import { PrismaService } from '../prisma.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [forwardRef(() => NotificationsModule)],
  controllers: [UserSettingsController],
  providers: [UserSettingsService, PrismaService],
  exports: [UserSettingsService],
})
export class UserSettingsModule {}
