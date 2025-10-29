import {
  Controller,
  Get,
  Patch,
  Body,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BudgetService } from './budget.service';
import { UpdateBudgetSettingsDto } from './dto/update-budget-settings.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Mode } from '../common/decorators/mode.decorator';

@ApiTags('Budget')
@Controller('budget')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BudgetController {
  constructor(private readonly budgetService: BudgetService) {}

  @Get('settings')
  @ApiOperation({
    summary: 'Get budget settings',
    description: 'Get user budget settings (limits, bankroll, alert threshold)',
  })
  getSettings(@Request() req: any) {
    return this.budgetService.getSettings(req.user.id);
  }

  @Patch('settings')
  @ApiOperation({
    summary: 'Update budget settings',
    description: 'Update budget limits and bankroll',
  })
  @HttpCode(HttpStatus.OK)
  updateSettings(@Request() req: any, @Body() dto: UpdateBudgetSettingsDto, @Mode() mode?: string) {
    return this.budgetService.updateSettings(req.user.id, dto, mode || 'real');
  }

  @Get('overview')
  @ApiOperation({
    summary: 'Get budget overview',
    description: 'Get complete budget overview with daily, weekly, monthly consumption and alerts',
  })
  getOverview(@Request() req: any, @Mode() mode: string) {
    return this.budgetService.getOverview(req.user.id, mode);
  }

  @Get('consumption')
  @ApiOperation({
    summary: 'Get budget consumption for a period',
    description: 'Get detailed consumption for a specific period (daily, weekly, or monthly)',
  })
  getConsumption(
    @Request() req: any,
    @Query('period') period: 'daily' | 'weekly' | 'monthly' = 'monthly',
    @Mode() mode?: string,
  ) {
    return this.budgetService.getConsumption(req.user.id, period, mode || 'real');
  }

  @Get('history')
  @ApiOperation({
    summary: 'Get monthly budget history',
    description: 'Get historical budget data by month for charts',
  })
  getHistory(@Request() req: any, @Query('months') months?: string, @Mode() mode?: string) {
    const monthsCount = months ? parseInt(months) : 6;
    return this.budgetService.getMonthlyHistory(req.user.id, monthsCount, mode || 'real');
  }
}
