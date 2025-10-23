import { IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ComparativeAnalysisDto {
  @ApiProperty({ description: 'Current period start date (ISO 8601 format)' })
  @IsDateString()
  currentStart: string;

  @ApiProperty({ description: 'Current period end date (ISO 8601 format)' })
  @IsDateString()
  currentEnd: string;
}
