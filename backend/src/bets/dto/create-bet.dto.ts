import { IsString, IsNumber, IsEnum, IsOptional, IsDateString, IsArray, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BetStatus } from '@prisma/client';

// HorseBetType enum (matching schema.prisma)
export enum HorseBetType {
  gagnant = 'gagnant',
  place = 'place',
  gagnant_place = 'gagnant_place',
  couple = 'couple',
  couple_ordre = 'couple_ordre',
  trio = 'trio',
  trio_ordre = 'trio_ordre',
  quarte = 'quarte',
  quarte_ordre = 'quarte_ordre',
  quinte = 'quinte',
  quinte_ordre = 'quinte_ordre',
  multi = 'multi',
  pick5 = 'pick5',
  autre = 'autre',
}

export class CreateBetDto {
  @ApiProperty({ example: '2025-10-23' })
  @IsDateString()
  date: string;

  @ApiPropertyOptional({ example: '15:30' })
  @IsString()
  @IsOptional()
  time?: string;

  @ApiProperty({ example: 'PMU', description: 'Platform name (required)' })
  @IsString()
  platform: string;

  @ApiPropertyOptional({ example: 'Vincennes' })
  @IsString()
  @IsOptional()
  hippodrome?: string;

  @ApiPropertyOptional({ example: '5', description: 'Numéro de la course' })
  @IsString()
  @IsOptional()
  raceNumber?: string;

  @ApiPropertyOptional({
    enum: HorseBetType,
    example: 'gagnant',
    description: 'Type de pari hippique'
  })
  @IsEnum(HorseBetType)
  @IsOptional()
  betType?: HorseBetType;

  @ApiPropertyOptional({ example: '7, 12, 3', description: 'Numéros des chevaux sélectionnés' })
  @IsString()
  @IsOptional()
  horsesSelected?: string;

  @ApiPropertyOptional({ example: '7', description: 'Numéro du cheval gagnant (si connu)' })
  @IsString()
  @IsOptional()
  winningHorse?: string;

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
