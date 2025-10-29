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
  Header,
  Res,
  Ip,
  Headers,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { BetsService } from './bets.service';
import { CreateBetDto } from './dto/create-bet.dto';
import { UpdateBetDto } from './dto/update-bet.dto';
import { UpdateBetStatusDto } from './dto/update-bet-status.dto';
import { UpdateBetResultDto } from './dto/update-bet-result.dto';
import { BetFiltersDto } from './dto/bet-filters.dto';
import { BetQueryDto } from './dto/bet-query.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Mode } from '../common/decorators/mode.decorator';

@ApiTags('Bets')
@Controller('bets')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BetsController {
  constructor(private readonly betsService: BetsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new bet' })
  create(@Request() req: any, @Body() createBetDto: CreateBetDto, @Mode() mode: string, @Ip() ipAddress: string, @Headers('user-agent') userAgent: string) {
    return this.betsService.create(req.user.id, createBetDto, mode, ipAddress, userAgent);
  }

  @Get()
  @ApiOperation({ summary: 'Get all bets with pagination and filters' })
  findAll(
    @Request() req: any,
    @Query() filters: BetFiltersDto,
    @Mode() mode: string,
  ) {
    return this.betsService.findAll(req.user.id, filters, mode);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get betting statistics' })
  @ApiQuery({ name: 'startDate', required: false, example: '2025-10-01' })
  @ApiQuery({ name: 'endDate', required: false, example: '2025-10-31' })
  getStats(
    @Request() req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.betsService.getStats(req.user.id, startDate, endDate);
  }

  @Get('stats/platform')
  @ApiOperation({ summary: 'Get statistics by platform' })
  getStatsByPlatform(@Request() req: any) {
    return this.betsService.getStatsByPlatform(req.user.id);
  }

  @Get('stats/bet-type')
  @ApiOperation({ summary: 'Get statistics by bet type' })
  getStatsByBetType(@Request() req: any) {
    return this.betsService.getStatsByBetType(req.user.id);
  }

  @Post('enrich-pmu-data')
  @ApiOperation({ summary: 'Enrich existing bets with PMU data (jockey, trainer)' })
  async enrichBetsWithPmuData(@Request() req: any) {
    return this.betsService.enrichExistingBetsWithPmuData(req.user.id);
  }

  @Get('export/:format')
  @ApiOperation({ summary: 'Export bets to CSV or Excel' })
  async exportBets(
    @Request() req: any,
    @Res() res: Response,
    @Param('format') format: string,
    @Query() filters: BetFiltersDto
  ) {
    const data = await this.betsService.exportBets(req.user.id, format, filters);

    // Set appropriate headers based on format
    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="bets.csv"');
    } else if (format === 'excel') {
      res.setHeader('Content-Type', 'application/vnd.ms-excel');
      res.setHeader('Content-Disposition', 'attachment; filename="bets.xls"');
    }

    res.send(data);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single bet by ID' })
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.betsService.findOne(req.user.id, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a bet' })
  update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateBetDto: UpdateBetDto,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string,
  ) {
    return this.betsService.update(req.user.id, id, updateBetDto, ipAddress, userAgent);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Quick update bet status (won/lost/pending)' })
  updateStatus(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateBetStatusDto,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string,
  ) {
    return this.betsService.updateStatus(req.user.id, id, updateStatusDto.status, ipAddress, userAgent);
  }

  @Patch(':id/result')
  @ApiOperation({ summary: 'Update bet result manually (for non-PMU platforms)' })
  updateBetResult(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateResultDto: UpdateBetResultDto,
  ) {
    return this.betsService.updateBetResult(id, req.user.id, updateResultDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a bet' })
  remove(@Request() req: any, @Param('id') id: string, @Ip() ipAddress: string, @Headers('user-agent') userAgent: string) {
    return this.betsService.remove(req.user.id, id, ipAddress, userAgent);
  }
}
