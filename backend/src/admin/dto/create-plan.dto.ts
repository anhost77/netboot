import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsBoolean, IsInt, Min } from 'class-validator';

export class CreatePlanDto {
  @ApiProperty({ example: 'Premium' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'premium' })
  @IsString()
  slug: string;

  @ApiProperty({ example: 'Plan premium avec toutes les fonctionnalités', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 9.99 })
  @IsNumber()
  @Min(0)
  priceMonthly: number;

  @ApiProperty({ example: 99.99 })
  @IsNumber()
  @Min(0)
  priceYearly: number;

  @ApiProperty({ example: 1000, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  maxBetsPerMonth?: number;

  @ApiProperty({ example: 500, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  maxStorageMb?: number;

  @ApiProperty({ 
    example: ['Statistiques avancées', 'Support prioritaire', 'Export illimité'],
    required: false 
  })
  @IsOptional()
  features?: any;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number;
}
