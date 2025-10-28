import { Module, forwardRef } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { PushNotificationService } from './push-notification.service';
import { PrismaService } from '../prisma.service';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [forwardRef(() => EmailModule)],
  controllers: [NotificationsController],
  providers: [NotificationsService, PushNotificationService, PrismaService],
  exports: [NotificationsService, PushNotificationService], // Export for use in other modules
})
export class NotificationsModule {}
