import { IsEnum, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TimeSeriesDto {
  @ApiProperty({
    description: 'Time period granularity',
    enum: ['daily', 'weekly', 'monthly'],
  })
  @IsEnum(['daily', 'weekly', 'monthly'])
  period: 'daily' | 'weekly' | 'monthly';

  @ApiPropertyOptional({ description: 'Start date (ISO 8601 format)' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date (ISO 8601 format)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
