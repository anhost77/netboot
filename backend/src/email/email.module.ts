import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule], // Import to use NotificationsService
  controllers: [EmailController],
  providers: [EmailService],
  exports: [EmailService], // Export for use in Auth, Subscriptions, Support modules
})
export class EmailModule {}
