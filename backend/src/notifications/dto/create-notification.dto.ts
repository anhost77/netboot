import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateNotificationDto {
  @ApiProperty({
    description: 'Notification type',
    enum: ['info', 'success', 'warning', 'error'],
    example: 'info',
  })
  @IsEnum(['info', 'success', 'warning', 'error'])
  type: 'info' | 'success' | 'warning' | 'error';

  @ApiProperty({
    description: 'Notification title',
    example: 'New feature available',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Notification message',
    example: 'You can now export your bets to CSV format!',
  })
  @IsString()
  message: string;

  @ApiPropertyOptional({
    description: 'Link to relevant page (optional)',
    example: '/bets/export',
  })
  @IsString()
  @IsOptional()
  link?: string;
}
