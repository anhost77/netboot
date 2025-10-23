import { IsString, IsNumber, IsEnum, IsOptional, IsDateString, IsArray, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BetStatus } from '@prisma/client';

export class CreateBetDto {
  @ApiProperty({ example: '2025-10-23' })
  @IsDateString()
  date: string;

  @ApiPropertyOptional({ example: '15:30' })
  @IsString()
  @IsOptional()
  time?: string;

  @ApiPropertyOptional({ example: 'PMU' })
  @IsString()
  @IsOptional()
  platform?: string;

  @ApiPropertyOptional({ example: 'Vincennes' })
  @IsString()
  @IsOptional()
  hippodrome?: string;

  @ApiPropertyOptional({ example: '5' })
  @IsString()
  @IsOptional()
  raceNumber?: string;

  @ApiPropertyOptional({ example: 'Simple Gagnant' })
  @IsString()
  @IsOptional()
  betType?: string;

  @ApiPropertyOptional({ example: 'Cheval 7' })
  @IsString()
  @IsOptional()
  horsesSelected?: string;

  @ApiProperty({ example: 10.00, description: 'Stake amount' })
  @IsNumber()
  @Min(0.01)
  stake: number;

  @ApiPropertyOptional({ example: 3.50, description: 'Odds' })
  @IsNumber()
  @IsOptional()
  @Min(1.01)
  odds?: number;

  @ApiProperty({ enum: BetStatus, example: 'pending' })
  @IsEnum(BetStatus)
  status: BetStatus;

  @ApiPropertyOptional({ example: 35.00, description: 'Payout if won' })
  @IsNumber()
  @IsOptional()
  @Min(0)
  payout?: number;

  @ApiPropertyOptional({ example: 'Belle course, cheval en forme' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ example: ['favori', 'bon-entrainement'], type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}
