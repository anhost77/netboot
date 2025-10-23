import { IsEnum, IsOptional, IsString, IsDateString, IsInt, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BetStatus } from '@prisma/client';
import { Type } from 'class-transformer';

export class BetFiltersDto {
  // Pagination
  @ApiPropertyOptional({ default: 1, description: 'Page number' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ default: 20, description: 'Items per page' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number;

  // Sorting
  @ApiPropertyOptional({ default: 'date', description: 'Field to sort by' })
  @IsString()
  @IsOptional()
  sortBy?: string;

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc', description: 'Sort order' })
  @IsEnum(['asc', 'desc'])
  @IsOptional()
  sortOrder?: 'asc' | 'desc';

  // Filters
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
}
