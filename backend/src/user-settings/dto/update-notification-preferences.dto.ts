import { IsEnum, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum NotificationPreference {
  WEB_ONLY = 'web_only',
  EMAIL_ONLY = 'email_only',
  BOTH = 'both',
  NONE = 'none',
}

export class UpdateNotificationPreferencesDto {
  @ApiPropertyOptional({
    description: 'Enable or disable notifications',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  notificationsEnabled?: boolean;

  @ApiPropertyOptional({
    description: 'Enable or disable push notifications',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  pushNotificationsEnabled?: boolean;

  @ApiPropertyOptional({
    description: 'Notification delivery preference',
    enum: NotificationPreference,
    example: NotificationPreference.BOTH,
  })
  @IsEnum(NotificationPreference)
  @IsOptional()
  notificationPreference?: NotificationPreference;
}
