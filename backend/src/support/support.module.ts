import { Module } from '@nestjs/common';
import { SupportService } from './support.service';
import { SupportController } from './support.controller';
import { PrismaService } from '../prisma.service';
import { EmailModule } from '../email/email.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [EmailModule, NotificationsModule], // Import for services
  controllers: [SupportController],
  providers: [SupportService, PrismaService],
  exports: [SupportService], // Export for potential use in Admin module
})
export class SupportModule {}
