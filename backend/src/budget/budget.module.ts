import { Module } from '@nestjs/common';
import { BudgetService } from './budget.service';
import { BudgetController } from './budget.controller';
import { PrismaService } from '../prisma.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule], // For alerts
  controllers: [BudgetController],
  providers: [BudgetService, PrismaService],
  exports: [BudgetService], // Export for use in Bets module (to trigger alerts)
})
export class BudgetModule {}
