import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationFiltersDto } from './dto/notification-filters.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a notification (admin only)',
    description: 'Create a notification for the current user. Typically used for testing.',
  })
  create(@Request() req: any, @Body() dto: CreateNotificationDto) {
    return this.notificationsService.create(req.user.id, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all notifications',
    description: 'Get paginated list of notifications for the current user with optional filters',
  })
  findAll(@Request() req: any, @Query() filters: NotificationFiltersDto) {
    return this.notificationsService.findAll(req.user.id, filters);
  }

  @Get('unread-count')
  @ApiOperation({
    summary: 'Get unread notifications count',
    description: 'Get the count of unread notifications for badge display',
  })
  getUnreadCount(@Request() req: any) {
    return this.notificationsService.getUnreadCount(req.user.id);
  }

  @Patch(':id/read')
  @ApiOperation({
    summary: 'Mark notification as read',
    description: 'Mark a specific notification as read',
  })
  markAsRead(@Request() req: any, @Param('id') id: string) {
    return this.notificationsService.markAsRead(req.user.id, id);
  }

  @Patch('mark-all-read')
  @ApiOperation({
    summary: 'Mark all notifications as read',
    description: 'Mark all unread notifications as read for the current user',
  })
  @HttpCode(HttpStatus.OK)
  markAllAsRead(@Request() req: any) {
    return this.notificationsService.markAllAsRead(req.user.id);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a notification',
    description: 'Delete a specific notification',
  })
  @HttpCode(HttpStatus.OK)
  remove(@Request() req: any, @Param('id') id: string) {
    return this.notificationsService.remove(req.user.id, id);
  }

  @Delete('clear/read')
  @ApiOperation({
    summary: 'Clear all read notifications',
    description: 'Delete all read notifications for the current user',
  })
  @HttpCode(HttpStatus.OK)
  clearRead(@Request() req: any) {
    return this.notificationsService.clearRead(req.user.id);
  }

  @Delete('clear/all')
  @ApiOperation({
    summary: 'Clear all notifications',
    description: 'Delete all notifications for the current user',
  })
  @HttpCode(HttpStatus.OK)
  clearAll(@Request() req: any) {
    return this.notificationsService.clearAll(req.user.id);
  }
}
