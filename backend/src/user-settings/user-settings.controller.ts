import { Controller, Get, Patch, Post, Delete, Body, UseGuards, Request, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserSettingsService } from './user-settings.service';
import { PushNotificationService } from '../notifications/push-notification.service';
import { UpdateBankrollModeDto } from './dto/update-bankroll-mode.dto';
import { UpdateNotificationPreferencesDto } from './dto/update-notification-preferences.dto';
import { CreatePushSubscriptionDto } from './dto/push-subscription.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('User Settings')
@Controller('user-settings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserSettingsController {
  constructor(
    private readonly userSettingsService: UserSettingsService,
    private readonly pushService: PushNotificationService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get user settings' })
  async getSettings(@Request() req: any) {
    return this.userSettingsService.getSettings(req.user.id);
  }

  @Patch('bankroll-mode')
  @ApiOperation({ summary: 'Update bankroll deduction mode' })
  async updateBankrollMode(
    @Request() req: any,
    @Body() dto: UpdateBankrollModeDto,
  ) {
    return this.userSettingsService.updateBankrollMode(req.user.id, dto);
  }

  @Patch('notification-preferences')
  @ApiOperation({ summary: 'Update notification preferences' })
  async updateNotificationPreferences(
    @Request() req: any,
    @Body() dto: UpdateNotificationPreferencesDto,
  ) {
    return this.userSettingsService.updateNotificationPreferences(req.user.id, dto);
  }

  @Post('push-subscriptions')
  @ApiOperation({ summary: 'Subscribe to push notifications' })
  async createPushSubscription(
    @Request() req: any,
    @Body() dto: CreatePushSubscriptionDto,
  ) {
    return this.userSettingsService.createPushSubscription(req.user.id, dto);
  }

  @Get('push-subscriptions')
  @ApiOperation({ summary: 'Get all push subscriptions' })
  async getPushSubscriptions(@Request() req: any) {
    return this.userSettingsService.getPushSubscriptions(req.user.id);
  }

  @Delete('push-subscriptions/:endpoint')
  @ApiOperation({ summary: 'Unsubscribe from push notifications' })
  async deletePushSubscription(
    @Request() req: any,
    @Param('endpoint') endpoint: string,
  ) {
    return this.userSettingsService.deletePushSubscription(req.user.id, decodeURIComponent(endpoint));
  }

  @Get('vapid-public-key')
  @ApiOperation({ summary: 'Get VAPID public key for push notifications' })
  async getVapidPublicKey() {
    return {
      publicKey: this.pushService.getVapidPublicKey(),
    };
  }

  @Post('api-key/generate')
  @ApiOperation({ summary: 'Generate a new API key' })
  async generateApiKey(@Request() req: any) {
    return this.userSettingsService.generateApiKey(req.user.id);
  }

  @Get('api-key')
  @ApiOperation({ summary: 'Get current API key (masked)' })
  async getApiKey(@Request() req: any) {
    return this.userSettingsService.getApiKey(req.user.id);
  }

  @Delete('api-key')
  @ApiOperation({ summary: 'Revoke API key' })
  async revokeApiKey(@Request() req: any) {
    return this.userSettingsService.revokeApiKey(req.user.id);
  }
}
