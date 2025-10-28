import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { SupportController } from './support.controller';
import { SupportService } from './support.service';
import { AiChatService } from './ai-chat.service';
import { PrismaService } from '../prisma.service';
import { EmailModule } from '../email/email.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [HttpModule, EmailModule, NotificationsModule], // Import for services
  controllers: [SupportController],
  providers: [SupportService, AiChatService, PrismaService],
  exports: [SupportService, AiChatService], // Export for potential use in Admin module
})
export class SupportModule {}
