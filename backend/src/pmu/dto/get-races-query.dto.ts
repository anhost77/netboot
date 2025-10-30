import { IsOptional, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetRacesQueryDto {
  @ApiPropertyOptional({ example: '2025-10-29', description: 'Date de la course (YYYY-MM-DD)' })
  @IsDateString()
  @IsOptional()
  date?: string;

  @ApiPropertyOptional({ example: 'AUT', description: 'Code de l\'hippodrome' })
  @IsOptional()
  hippodromeCode?: string;
}
