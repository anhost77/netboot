import { IsNumber, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateBudgetSettingsDto {
  @ApiProperty({
    description: 'Initial bankroll (capital de départ)',
    example: 1000,
    required: false,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  initialBankroll?: number;

  @ApiProperty({
    description: 'Current bankroll (capital actuel)',
    example: 950,
    required: false,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  currentBankroll?: number;

  @ApiProperty({
    description: 'Daily spending limit in euros',
    example: 50,
    required: false,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  dailyLimit?: number | null;

  @ApiProperty({
    description: 'Weekly spending limit in euros',
    example: 200,
    required: false,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  weeklyLimit?: number | null;

  @ApiProperty({
    description: 'Monthly spending limit in euros',
    example: 500,
    required: false,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  monthlyLimit?: number | null;

  @ApiProperty({
    description: 'Alert threshold percentage (e.g., 80 for 80%)',
    example: 80,
    required: false,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  alertThreshold?: number | null;
}
