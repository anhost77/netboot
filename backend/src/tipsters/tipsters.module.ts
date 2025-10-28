import { Module } from '@nestjs/common';
import { TipstersService } from './tipsters.service';
import { TipstersController } from './tipsters.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [TipstersController],
  providers: [TipstersService, PrismaService],
  exports: [TipstersService],
})
export class TipstersModule {}
