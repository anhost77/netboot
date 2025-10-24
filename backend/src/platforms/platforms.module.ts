import { Module } from '@nestjs/common';
import { PlatformsService } from './platforms.service';
import { PlatformsController } from './platforms.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [PlatformsController],
  providers: [PlatformsService, PrismaService],
  exports: [PlatformsService],
})
export class PlatformsModule {}
