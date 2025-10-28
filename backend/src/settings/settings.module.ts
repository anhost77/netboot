import { Module } from '@nestjs/common';
import { SettingsController } from './settings.controller';
import { SettingsManagementService } from '../admin/settings-management.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [SettingsController],
  providers: [SettingsManagementService, PrismaService],
})
export class SettingsModule {}
