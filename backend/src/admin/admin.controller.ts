import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Request, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { AdminDashboardService } from './admin-dashboard.service';
import { UsersManagementService } from './users-management.service';
import { AuditLogService } from './audit-log.service';
import { PlansManagementService } from './plans-management.service';
import { BetsManagementService } from './bets-management.service';
import { SettingsManagementService } from './settings-management.service';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.admin)
@ApiBearerAuth()
export class AdminController {
  constructor(
    private dashboard: AdminDashboardService,
    private usersManagement: UsersManagementService,
    private auditLog: AuditLogService,
    private plansManagement: PlansManagementService,
    private betsManagement: BetsManagementService,
    private settingsManagement: SettingsManagementService,
  ) {}

  @Get('dashboard/overview')
  @ApiOperation({ summary: 'Get dashboard overview', description: 'Get platform statistics (admin only)' })
  getOverview() {
    return this.dashboard.getOverview();
  }

  @Get('dashboard/activity')
  @ApiOperation({ summary: 'Get recent activity', description: 'Get recent bets, users, tickets (admin only)' })
  getActivity(@Query('limit') limit?: string) {
    return this.dashboard.getRecentActivity(limit ? parseInt(limit) : 20);
  }

  @Get('dashboard/charts')
  @ApiOperation({ summary: 'Get charts data', description: 'Get monthly charts data (admin only)' })
  getCharts(@Query('months') months?: string) {
    return this.dashboard.getChartsData(months ? parseInt(months) : 6);
  }

  @Get('users')
  @ApiOperation({ summary: 'List all users', description: 'Get paginated users list (admin only)' })
  getUsers(@Query('page') page?: string, @Query('limit') limit?: string, @Query('search') search?: string, @Query('role') role?: UserRole) {
    return this.usersManagement.findAll(page ? parseInt(page) : 1, limit ? parseInt(limit) : 20, search, role);
  }

  @Patch('users/:id/role')
  @ApiOperation({ summary: 'Update user role', description: 'Change user role (admin only)' })
  @HttpCode(HttpStatus.OK)
  updateUserRole(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateUserRoleDto) {
    return this.usersManagement.updateRole(req.user.id, id, dto.role, req.ip);
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Delete user', description: 'Soft delete user (admin only)' })
  @HttpCode(HttpStatus.OK)
  deleteUser(@Request() req: any, @Param('id') id: string) {
    return this.usersManagement.deleteUser(req.user.id, id, req.ip);
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get user details', description: 'Get detailed user information (admin only)' })
  getUserDetails(@Param('id') id: string) {
    return this.usersManagement.findOne(id);
  }

  @Patch('users/:id')
  @ApiOperation({ summary: 'Update user details', description: 'Update user information (admin only)' })
  @HttpCode(HttpStatus.OK)
  updateUser(@Request() req: any, @Param('id') id: string, @Body() data: any) {
    return this.usersManagement.updateUser(req.user.id, id, data, req.ip);
  }

  @Patch('users/:id/suspend')
  @ApiOperation({ summary: 'Suspend user', description: 'Suspend user account (admin only)' })
  @HttpCode(HttpStatus.OK)
  suspendUser(@Request() req: any, @Param('id') id: string) {
    return this.usersManagement.suspendUser(req.user.id, id, req.ip);
  }

  @Post('users/:id/reset-password')
  @ApiOperation({ summary: 'Reset user password', description: 'Send password reset email (admin only)' })
  @HttpCode(HttpStatus.OK)
  resetUserPassword(@Request() req: any, @Param('id') id: string) {
    return this.usersManagement.resetUserPassword(req.user.id, id, req.ip);
  }

  @Post('users/:id/disable-2fa')
  @ApiOperation({ summary: 'Disable user 2FA', description: 'Disable two-factor authentication (admin only)' })
  @HttpCode(HttpStatus.OK)
  disableUser2FA(@Request() req: any, @Param('id') id: string) {
    return this.usersManagement.disableUser2FA(req.user.id, id, req.ip);
  }

  @Get('users/:id/export-data')
  @ApiOperation({ summary: 'Export user data', description: 'Export all user data (RGPD Art. 20)' })
  exportUserData(@Param('id') id: string) {
    return this.usersManagement.exportUserData(id);
  }

  @Delete('users/:id/gdpr-delete')
  @ApiOperation({ summary: 'Delete user data', description: 'Permanently delete all user data (RGPD Art. 17)' })
  @HttpCode(HttpStatus.OK)
  gdprDeleteUser(@Request() req: any, @Param('id') id: string) {
    return this.usersManagement.gdprDeleteUser(req.user.id, id, req.ip);
  }

  @Get('users/:id/stats')
  @ApiOperation({ summary: 'Get user stats', description: 'Get user betting statistics (admin only)' })
  getUserStats(@Param('id') id: string) {
    return this.usersManagement.getUserStats(id);
  }

  @Get('users/:id/subscription')
  @ApiOperation({ summary: 'Get user subscription', description: 'Get user subscription details (admin only)' })
  getUserSubscription(@Param('id') id: string) {
    return this.usersManagement.getUserSubscription(id);
  }

  @Get('users/:id/invoices')
  @ApiOperation({ summary: 'Get user invoices', description: 'Get user invoices list (admin only)' })
  getUserInvoices(@Param('id') id: string) {
    return this.usersManagement.getUserInvoices(id);
  }

  @Get('users/:id/tickets')
  @ApiOperation({ summary: 'Get user tickets', description: 'Get user support tickets (admin only)' })
  getUserTickets(@Param('id') id: string) {
    return this.usersManagement.getUserTickets(id);
  }

  @Get('users/:id/notifications')
  @ApiOperation({ summary: 'Get user notifications', description: 'Get user notifications with pagination (admin only)' })
  getUserNotifications(
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.usersManagement.getUserNotifications(
      id,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 50,
    );
  }

  @Get('users/:id/audit-logs')
  @ApiOperation({ summary: 'Get user audit logs', description: 'Get user activity logs with IP and user agent (admin only)' })
  getUserAuditLogs(
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.usersManagement.getUserAuditLogs(
      id,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 50,
    );
  }

  @Get('users/:id/tipsters')
  @ApiOperation({ summary: 'Get user tipsters', description: 'Get user tipsters list (admin only)' })
  getUserTipsters(@Param('id') id: string) {
    return this.usersManagement.getUserTipsters(id);
  }

  @Get('users/:id/platforms')
  @ApiOperation({ summary: 'Get user platforms', description: 'Get user betting platforms (admin only)' })
  getUserPlatforms(@Param('id') id: string) {
    return this.usersManagement.getUserPlatforms(id);
  }

  @Get('users/:id/budget')
  @ApiOperation({ summary: 'Get user budget', description: 'Get user budget and monthly history (admin only)' })
  getUserBudget(@Param('id') id: string) {
    return this.usersManagement.getUserBudget(id);
  }

  @Get('users/:id/bets')
  @ApiOperation({ summary: 'Get user bets', description: 'Get all user bets (admin only)' })
  getUserBets(@Param('id') id: string) {
    return this.usersManagement.getUserBets(id);
  }

  @Get('users/:id/detailed-stats')
  @ApiOperation({ summary: 'Get user detailed stats', description: 'Get detailed statistics for user (admin only)' })
  getUserDetailedStats(@Param('id') id: string) {
    return this.usersManagement.getUserDetailedStats(id);
  }

  @Get('audit-logs')
  @ApiOperation({ summary: 'Get audit logs', description: 'Get admin action logs (admin only)' })
  getAuditLogs(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('adminId') adminId?: string,
    @Query('action') action?: string,
    @Query('entityType') entityType?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.auditLog.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 50,
      adminId,
      action,
      entityType,
      startDate,
      endDate,
    );
  }

  @Get('audit-logs/stats')
  @ApiOperation({ summary: 'Get audit logs statistics', description: 'Get audit logs statistics and charts data (admin only)' })
  getAuditLogsStats(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    return this.auditLog.getStats(startDate, endDate);
  }

  @Get('audit-logs/timeline')
  @ApiOperation({ summary: 'Get activity timeline', description: 'Get activity timeline for last N days (admin only)' })
  getActivityTimeline(@Query('days') days?: string) {
    return this.auditLog.getActivityTimeline(days ? parseInt(days) : 7);
  }

  @Get('support/tickets')
  @ApiOperation({ summary: 'Get all support tickets', description: 'Get all support tickets (admin only)' })
  getAllTickets() {
    return this.usersManagement.getAllTickets();
  }

  @Get('support/tickets/:id')
  @ApiOperation({ summary: 'Get ticket by ID', description: 'Get support ticket details (admin only)' })
  getTicketById(@Param('id') id: string) {
    return this.usersManagement.getTicketById(id);
  }

  @Post('support/tickets/:id/respond')
  @ApiOperation({ summary: 'Respond to ticket', description: 'Send response to support ticket (admin only)' })
  respondToTicket(@Param('id') id: string, @Body() body: { message: string }, @Req() req) {
    const adminId = req.user.sub;
    return this.usersManagement.respondToTicket(id, body.message, adminId);
  }

  @Patch('support/tickets/:id/status')
  @ApiOperation({ summary: 'Update ticket status', description: 'Update support ticket status (admin only)' })
  updateTicketStatus(@Param('id') id: string, @Body() body: { status: string }, @Req() req) {
    const adminId = req.user.sub;
    return this.usersManagement.updateTicketStatus(id, body.status, adminId);
  }

  // Plans Management Endpoints
  @Get('plans')
  @ApiOperation({ summary: 'Get all plans', description: 'Get all subscription plans (admin only)' })
  getAllPlans() {
    return this.plansManagement.getAllPlans();
  }

  @Get('plans/stats')
  @ApiOperation({ summary: 'Get plans statistics', description: 'Get subscription plans statistics (admin only)' })
  getPlanStats() {
    return this.plansManagement.getPlanStats();
  }

  @Get('plans/:id')
  @ApiOperation({ summary: 'Get plan details', description: 'Get single plan details with subscribers (admin only)' })
  getPlan(@Param('id') id: string) {
    return this.plansManagement.getPlan(id);
  }

  @Post('plans')
  @ApiOperation({ summary: 'Create plan', description: 'Create a new subscription plan (admin only)' })
  createPlan(@Body() dto: CreatePlanDto) {
    return this.plansManagement.createPlan(dto);
  }

  @Patch('plans/:id')
  @ApiOperation({ summary: 'Update plan', description: 'Update subscription plan (admin only)' })
  updatePlan(@Param('id') id: string, @Body() dto: UpdatePlanDto) {
    return this.plansManagement.updatePlan(id, dto);
  }

  @Patch('plans/:id/toggle')
  @ApiOperation({ summary: 'Toggle plan status', description: 'Activate/deactivate plan (admin only)' })
  togglePlanStatus(@Param('id') id: string) {
    return this.plansManagement.togglePlanStatus(id);
  }

  @Delete('plans/:id')
  @ApiOperation({ summary: 'Delete plan', description: 'Delete subscription plan (admin only)' })
  deletePlan(@Param('id') id: string) {
    return this.plansManagement.deletePlan(id);
  }

  // Bets Management Endpoints
  @Get('bets')
  @ApiOperation({ summary: 'Get all bets', description: 'Get all bets with filters (admin only)' })
  getAllBets(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('userId') userId?: string,
    @Query('tipsterId') tipsterId?: string,
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.betsManagement.getAllBets(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 50,
      userId,
      tipsterId,
      status,
      startDate,
      endDate,
    );
  }

  @Get('bets/stats')
  @ApiOperation({ summary: 'Get bets statistics', description: 'Get bets statistics and charts data (admin only)' })
  getBetsStats(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    return this.betsManagement.getBetsStats(startDate, endDate);
  }

  @Get('bets/timeline')
  @ApiOperation({ summary: 'Get bets timeline', description: 'Get bets timeline for last N days (admin only)' })
  getBetsTimeline(@Query('days') days?: string) {
    return this.betsManagement.getBetsTimeline(days ? parseInt(days) : 7);
  }

  // Settings Management Endpoints
  @Get('settings')
  @ApiOperation({ summary: 'Get platform settings', description: 'Get all platform settings (admin only)' })
  getSettings() {
    return this.settingsManagement.getSettings();
  }

  @Patch('settings')
  @ApiOperation({ summary: 'Update platform settings', description: 'Update platform settings (admin only)' })
  updateSettings(@Body() settings: any) {
    return this.settingsManagement.updateSettings(settings);
  }

  @Post('settings/reset')
  @ApiOperation({ summary: 'Reset platform settings', description: 'Reset settings to default values (admin only)' })
  resetSettings() {
    return this.settingsManagement.resetSettings();
  }

  @Get('settings/system-info')
  @ApiOperation({ summary: 'Get system information', description: 'Get system and platform information (admin only)' })
  getSystemInfo() {
    return this.settingsManagement.getSystemInfo();
  }
}
