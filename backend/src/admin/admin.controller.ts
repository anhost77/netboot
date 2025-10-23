import { Controller, Get, Patch, Delete, Body, Param, Query, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { AdminDashboardService } from './admin-dashboard.service';
import { UsersManagementService } from './users-management.service';
import { AuditLogService } from './audit-log.service';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
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

  @Get('audit-logs')
  @ApiOperation({ summary: 'Get audit logs', description: 'Get admin action logs (admin only)' })
  getAuditLogs(@Query('page') page?: string, @Query('limit') limit?: string, @Query('adminId') adminId?: string, @Query('action') action?: string) {
    return this.auditLog.findAll(page ? parseInt(page) : 1, limit ? parseInt(limit) : 50, adminId, action);
  }
}
