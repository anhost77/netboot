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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { BetsService } from './bets.service';
import { CreateBetDto } from './dto/create-bet.dto';
import { UpdateBetDto } from './dto/update-bet.dto';
import { BetFiltersDto } from './dto/bet-filters.dto';
import { BetQueryDto } from './dto/bet-query.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Bets')
@Controller('bets')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BetsController {
  constructor(private readonly betsService: BetsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new bet' })
  create(@Request() req: any, @Body() createBetDto: CreateBetDto) {
    return this.betsService.create(req.user.id, createBetDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all bets with pagination and filters' })
  findAll(
    @Request() req: any,
    @Query() filters: BetFiltersDto,
  ) {
    return this.betsService.findAll(req.user.id, filters);
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

  @Get('export')
  @ApiOperation({ summary: 'Export bets to CSV' })
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename="bets.csv"')
  async exportBets(@Request() req: any, @Query() filters: BetFiltersDto) {
    return this.betsService.exportBets(req.user.id, filters);
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
  ) {
    return this.betsService.update(req.user.id, id, updateBetDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a bet' })
  remove(@Request() req: any, @Param('id') id: string) {
    return this.betsService.remove(req.user.id, id);
  }
}
