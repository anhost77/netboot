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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PlatformsService } from './platforms.service';
import { CreatePlatformDto } from './dto/create-platform.dto';
import { UpdatePlatformDto } from './dto/update-platform.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Mode } from '../common/decorators/mode.decorator';

@ApiTags('platforms')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('platforms')
export class PlatformsController {
  constructor(private readonly platformsService: PlatformsService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle plateforme' })
  @ApiResponse({ status: 201, description: 'Plateforme créée avec succès' })
  create(@Request() req: any, @Body() createPlatformDto: CreatePlatformDto, @Mode() mode: string) {
    return this.platformsService.create(req.user.id, createPlatformDto, mode);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer toutes les plateformes de l\'utilisateur' })
  @ApiResponse({ status: 200, description: 'Liste des plateformes' })
  findAll(@Request() req: any, @Mode() mode: string) {
    return this.platformsService.findAll(req.user.id, mode);
  }

  @Get('global-bankroll')
  @ApiOperation({ summary: 'Récupérer la bankroll globale de toutes les plateformes' })
  @ApiResponse({ status: 200, description: 'Bankroll globale' })
  getGlobalBankroll(@Request() req: any, @Mode() mode: string) {
    return this.platformsService.getGlobalBankroll(req.user.id, mode);
  }

  @Get('global-bankroll-evolution')
  @ApiOperation({ summary: 'Récupérer l\'évolution de la bankroll globale' })
  @ApiResponse({ status: 200, description: 'Évolution de la bankroll globale' })
  getGlobalBankrollEvolution(
    @Request() req: any,
    @Query('period') period?: 'day' | 'week' | 'month' | 'year',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Mode() mode?: string,
  ) {
    return this.platformsService.getGlobalBankrollEvolution(
      req.user.id,
      period || 'day',
      startDate,
      endDate,
      mode || 'real',
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une plateforme par ID' })
  @ApiResponse({ status: 200, description: 'Plateforme trouvée' })
  @ApiResponse({ status: 404, description: 'Plateforme non trouvée' })
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.platformsService.findOne(req.user.id, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour une plateforme' })
  @ApiResponse({ status: 200, description: 'Plateforme mise à jour' })
  @ApiResponse({ status: 404, description: 'Plateforme non trouvée' })
  update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updatePlatformDto: UpdatePlatformDto,
  ) {
    return this.platformsService.update(req.user.id, id, updatePlatformDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une plateforme' })
  @ApiResponse({ status: 200, description: 'Plateforme supprimée' })
  @ApiResponse({ status: 404, description: 'Plateforme non trouvée' })
  remove(@Request() req: any, @Param('id') id: string) {
    return this.platformsService.remove(req.user.id, id);
  }

  @Post(':id/transactions')
  @ApiOperation({ summary: 'Créer une transaction (dépôt ou retrait)' })
  @ApiResponse({ status: 201, description: 'Transaction créée' })
  @ApiResponse({ status: 400, description: 'Fonds insuffisants' })
  @ApiResponse({ status: 404, description: 'Plateforme non trouvée' })
  createTransaction(
    @Request() req: any,
    @Param('id') id: string,
    @Body() createTransactionDto: CreateTransactionDto,
  ) {
    return this.platformsService.createTransaction(
      req.user.id,
      id,
      createTransactionDto,
    );
  }

  @Get(':id/transactions')
  @ApiOperation({ summary: 'Récupérer toutes les transactions d\'une plateforme' })
  @ApiResponse({ status: 200, description: 'Liste des transactions' })
  @ApiResponse({ status: 404, description: 'Plateforme non trouvée' })
  getTransactions(@Request() req: any, @Param('id') id: string) {
    return this.platformsService.getTransactions(req.user.id, id);
  }

  @Get(':id/bankroll-evolution')
  @ApiOperation({ summary: 'Récupérer l\'évolution de la bankroll d\'une plateforme' })
  @ApiResponse({ status: 200, description: 'Évolution de la bankroll' })
  @ApiResponse({ status: 404, description: 'Plateforme non trouvée' })
  getBankrollEvolution(
    @Request() req: any,
    @Param('id') id: string,
    @Query('period') period?: 'day' | 'week' | 'month' | 'year',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Mode() mode?: string,
  ) {
    return this.platformsService.getBankrollEvolution(
      req.user.id,
      id,
      period || 'day',
      startDate,
      endDate,
      mode || 'real',
    );
  }
}
