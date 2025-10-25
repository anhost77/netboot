import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BetStatus } from '@prisma/client';

export class UpdateBetStatusDto {
  @ApiProperty({ enum: BetStatus, example: 'won', description: 'New bet status' })
  @IsEnum(BetStatus)
  status: BetStatus;
}
