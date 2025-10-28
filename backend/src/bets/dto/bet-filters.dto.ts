import { IsEnum, IsOptional, IsString, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BetStatus } from '@prisma/client';
import { BetQueryDto } from './bet-query.dto';

export class BetFiltersDto extends BetQueryDto {
  @ApiPropertyOptional({ enum: BetStatus })
  @IsEnum(BetStatus)
  @IsOptional()
  status?: BetStatus;

  @ApiPropertyOptional({ example: 'PMU' })
  @IsString()
  @IsOptional()
  platform?: string;

  @ApiPropertyOptional({ example: 'Vincennes' })
  @IsString()
  @IsOptional()
  hippodrome?: string;

  @ApiPropertyOptional({ example: 'Simple Gagnant' })
  @IsString()
  @IsOptional()
  betType?: string;

  @ApiPropertyOptional({ example: '2025-10-01' })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ example: '2025-10-31' })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({ example: 'favori' })
  @IsString()
  @IsOptional()
  tag?: string;

  @ApiPropertyOptional({ example: 'cheval' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ example: 'uuid-tipster-id' })
  @IsString()
  @IsOptional()
  tipsterId?: string;
}
