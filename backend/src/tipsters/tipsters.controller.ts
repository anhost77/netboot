import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { TipstersService } from './tipsters.service';
import { CreateTipsterDto } from './dto/create-tipster.dto';
import { UpdateTipsterDto } from './dto/update-tipster.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Mode } from '../common/decorators/mode.decorator';

@ApiTags('Tipsters')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tipsters')
export class TipstersController {
  constructor(private readonly tipstersService: TipstersService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un nouveau tipster' })
  @ApiResponse({ status: 201, description: 'Tipster créé avec succès' })
  @ApiResponse({ status: 409, description: 'Un tipster avec ce nom existe déjà' })
  create(@Request() req: any, @Body() createTipsterDto: CreateTipsterDto) {
    return this.tipstersService.create(req.user.id, createTipsterDto);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les tipsters de l\'utilisateur' })
  @ApiResponse({ status: 200, description: 'Liste des tipsters' })
  findAll(@Request() req: any, @Mode() mode: string) {
    return this.tipstersService.findAll(req.user.id, mode);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Récupérer les statistiques de tous les tipsters' })
  @ApiResponse({ status: 200, description: 'Statistiques de tous les tipsters' })
  getAllStatistics(@Request() req: any) {
    return this.tipstersService.getAllStatistics(req.user.id);
  }

  @Get('export/all')
  @ApiOperation({ summary: 'Exporter tous les tipsters en CSV/Excel' })
  @ApiResponse({ status: 200, description: 'Export réussi' })
  async exportAll(
    @Request() req: any,
    @Query('format') format: string,
    @Res() res: Response,
  ) {
    const data = await this.tipstersService.exportTipsters(req.user.id, format);
    
    const filename = `tipsters_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xls' : 'csv'}`;
    const contentType = format === 'excel' 
      ? 'application/vnd.ms-excel' 
      : 'text/csv';
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(data);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un tipster par ID' })
  @ApiResponse({ status: 200, description: 'Tipster trouvé' })
  @ApiResponse({ status: 404, description: 'Tipster non trouvé' })
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.tipstersService.findOne(id, req.user.id);
  }

  @Get(':id/statistics')
  @ApiOperation({ summary: 'Récupérer les statistiques d\'un tipster' })
  @ApiResponse({ status: 200, description: 'Statistiques du tipster' })
  @ApiResponse({ status: 404, description: 'Tipster non trouvé' })
  getStatistics(@Param('id') id: string, @Request() req: any) {
    return this.tipstersService.getStatistics(id, req.user.id);
  }

  @Get(':id/export')
  @ApiOperation({ summary: 'Exporter les statistiques d\'un tipster en CSV/Excel' })
  @ApiResponse({ status: 200, description: 'Export réussi' })
  @ApiResponse({ status: 404, description: 'Tipster non trouvé' })
  async exportOne(
    @Param('id') id: string,
    @Request() req: any,
    @Query('format') format: string,
    @Res() res: Response,
  ) {
    const data = await this.tipstersService.exportTipsterStats(id, req.user.id, format);
    
    const filename = `tipster_${id}_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xls' : 'csv'}`;
    const contentType = format === 'excel' 
      ? 'application/vnd.ms-excel' 
      : 'text/csv';
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(data);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour un tipster' })
  @ApiResponse({ status: 200, description: 'Tipster mis à jour' })
  @ApiResponse({ status: 404, description: 'Tipster non trouvé' })
  @ApiResponse({ status: 409, description: 'Un tipster avec ce nom existe déjà' })
  update(@Param('id') id: string, @Request() req: any, @Body() updateTipsterDto: UpdateTipsterDto) {
    return this.tipstersService.update(id, req.user.id, updateTipsterDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un tipster' })
  @ApiResponse({ status: 200, description: 'Tipster supprimé' })
  @ApiResponse({ status: 404, description: 'Tipster non trouvé' })
  remove(@Param('id') id: string, @Request() req: any) {
    return this.tipstersService.remove(id, req.user.id);
  }
}
