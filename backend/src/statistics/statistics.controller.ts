import {
  Controller,
  Get,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StatisticsService } from './statistics.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { DateRangeDto } from './dto/date-range.dto';
import { TimeSeriesDto } from './dto/time-series.dto';
import { ComparativeAnalysisDto } from './dto/comparative-analysis.dto';

@ApiTags('Statistics')
@Controller('statistics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('dashboard')
  @ApiOperation({
    summary: 'Get comprehensive dashboard statistics',
    description: 'Returns current month, last month, year-to-date, all-time stats, and trends',
  })
  getDashboard(@Request() req: any) {
    return this.statisticsService.getDashboardStats(req.user.id);
  }

  @Get('time-series')
  @ApiOperation({
    summary: 'Get time series data for charts',
    description: 'Returns aggregated data by day, week, or month for graphing',
  })
  getTimeSeries(
    @Request() req: any,
    @Query() dto: TimeSeriesDto,
  ) {
    const startDate = dto.startDate ? new Date(dto.startDate) : undefined;
    const endDate = dto.endDate ? new Date(dto.endDate) : undefined;

    return this.statisticsService.getTimeSeriesData(
      req.user.id,
      dto.period,
      startDate,
      endDate,
    );
  }

  @Get('performance')
  @ApiOperation({
    summary: 'Get advanced performance metrics',
    description: 'Returns streaks, volatility, Sharpe ratio, best/worst bets, consistency score',
  })
  getPerformance(
    @Request() req: any,
    @Query() dto: DateRangeDto,
  ) {
    const startDate = dto.startDate ? new Date(dto.startDate) : undefined;
    const endDate = dto.endDate ? new Date(dto.endDate) : undefined;

    return this.statisticsService.getPerformanceMetrics(
      req.user.id,
      startDate,
      endDate,
    );
  }

  @Get('breakdowns')
  @ApiOperation({
    summary: 'Get statistical breakdowns',
    description: 'Returns breakdowns by type, status, stake range, and odds range',
  })
  getBreakdowns(
    @Request() req: any,
    @Query() dto: DateRangeDto,
  ) {
    const startDate = dto.startDate ? new Date(dto.startDate) : undefined;
    const endDate = dto.endDate ? new Date(dto.endDate) : undefined;

    return this.statisticsService.getBreakdowns(
      req.user.id,
      startDate,
      endDate,
    );
  }

  @Get('comparative')
  @ApiOperation({
    summary: 'Get comparative analysis',
    description: 'Compares current period vs previous period of same duration',
  })
  getComparative(
    @Request() req: any,
    @Query() dto: ComparativeAnalysisDto,
  ) {
    return this.statisticsService.getComparativeAnalysis(
      req.user.id,
      new Date(dto.currentStart),
      new Date(dto.currentEnd),
    );
  }
}
