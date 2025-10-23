import { IsEnum, IsOptional, IsInt, Min, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';

export class NotificationFiltersDto {
  @ApiPropertyOptional({ default: 1, description: 'Page number' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ default: 20, description: 'Items per page' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number = 20;

  @ApiPropertyOptional({
    enum: ['info', 'success', 'warning', 'error'],
    description: 'Filter by notification type',
  })
  @IsEnum(['info', 'success', 'warning', 'error'])
  @IsOptional()
  type?: 'info' | 'success' | 'warning' | 'error';

  @ApiPropertyOptional({
    description: 'Show only unread notifications',
    default: false,
  })
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  @IsOptional()
  unreadOnly?: boolean;
}
