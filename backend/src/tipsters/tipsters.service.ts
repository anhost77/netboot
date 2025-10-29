import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateTipsterDto } from './dto/create-tipster.dto';
import { UpdateTipsterDto } from './dto/update-tipster.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class TipstersService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createTipsterDto: CreateTipsterDto, mode: string = 'real') {
    // Vérifier si un tipster avec ce nom existe déjà pour cet utilisateur dans ce mode
    const existing = await this.prisma.tipster.findFirst({
      where: {
        userId,
        name: createTipsterDto.name,
        mode,
      },
    });

    if (existing) {
      throw new ConflictException('Un tipster avec ce nom existe déjà');
    }

    // Nettoyer les données avant insertion
    const data: any = {
      userId,
      mode, // Ajouter le mode
      name: createTipsterDto.name,
      description: createTipsterDto.description || null,
      website: createTipsterDto.website || null,
      color: createTipsterDto.color || null,
      isActive: createTipsterDto.isActive !== undefined ? createTipsterDto.isActive : true,
    };

    // Ajouter socialMedia seulement s'il est défini et non vide
    if (createTipsterDto.socialMedia && Object.keys(createTipsterDto.socialMedia).length > 0) {
      data.socialMedia = createTipsterDto.socialMedia;
    }

    return this.prisma.tipster.create({ data });
  }

  async findAll(userId: string, mode: string = 'real') {
    return this.prisma.tipster.findMany({
      where: { userId, mode },
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { bets: true },
        },
      },
    });
  }

  async findOne(id: string, userId: string) {
    const tipster = await this.prisma.tipster.findFirst({
      where: { id, userId },
      include: {
        _count: {
          select: { bets: true },
        },
      },
    });

    if (!tipster) {
      throw new NotFoundException('Tipster non trouvé');
    }

    return tipster;
  }

  async update(id: string, userId: string, updateTipsterDto: UpdateTipsterDto) {
    await this.findOne(id, userId); // Vérifier que le tipster existe

    // Si le nom est modifié, vérifier qu'il n'existe pas déjà
    if (updateTipsterDto.name) {
      const existing = await this.prisma.tipster.findFirst({
        where: {
          userId,
          name: updateTipsterDto.name,
          NOT: { id },
        },
      });

      if (existing) {
        throw new ConflictException('Un tipster avec ce nom existe déjà');
      }
    }

    return this.prisma.tipster.update({
      where: { id },
      data: updateTipsterDto,
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId); // Vérifier que le tipster existe

    return this.prisma.tipster.delete({
      where: { id },
    });
  }

  async getStatistics(id: string, userId: string) {
    await this.findOne(id, userId); // Vérifier que le tipster existe

    const bets = await this.prisma.bet.findMany({
      where: {
        tipsterId: id,
        userId,
      },
    });

    const totalBets = bets.length;
    const wonBets = bets.filter(b => b.status === 'won').length;
    const lostBets = bets.filter(b => b.status === 'lost').length;
    const pendingBets = bets.filter(b => b.status === 'pending').length;

    const totalStake = bets.reduce((sum, bet) => sum + Number(bet.stake), 0);
    const totalPayout = bets.reduce((sum, bet) => sum + Number(bet.payout || 0), 0);
    const totalProfit = bets.reduce((sum, bet) => sum + Number(bet.profit || 0), 0);

    const winRate = totalBets > 0 ? (wonBets / totalBets) * 100 : 0;
    const roi = totalStake > 0 ? (totalProfit / totalStake) * 100 : 0;

    // Statistiques par type de pari
    const betTypeStats = bets.reduce((acc, bet) => {
      if (!bet.betType) return acc;
      
      if (!acc[bet.betType]) {
        acc[bet.betType] = {
          total: 0,
          won: 0,
          lost: 0,
          stake: 0,
          profit: 0,
        };
      }

      acc[bet.betType].total++;
      if (bet.status === 'won') acc[bet.betType].won++;
      if (bet.status === 'lost') acc[bet.betType].lost++;
      acc[bet.betType].stake += Number(bet.stake);
      acc[bet.betType].profit += Number(bet.profit || 0);

      return acc;
    }, {} as Record<string, any>);

    // Calculer le ROI par type de pari
    Object.keys(betTypeStats).forEach(type => {
      const stats = betTypeStats[type];
      stats.winRate = stats.total > 0 ? (stats.won / stats.total) * 100 : 0;
      stats.roi = stats.stake > 0 ? (stats.profit / stats.stake) * 100 : 0;
    });

    // Statistiques mensuelles (derniers 12 mois)
    const monthlyStats = await this.getMonthlyStats(id, userId);

    return {
      totalBets,
      wonBets,
      lostBets,
      pendingBets,
      totalStake,
      totalPayout,
      totalProfit,
      winRate: Math.round(winRate * 100) / 100,
      roi: Math.round(roi * 100) / 100,
      betTypeStats,
      monthlyStats,
    };
  }

  private async getMonthlyStats(tipsterId: string, userId: string) {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const bets = await this.prisma.bet.findMany({
      where: {
        tipsterId,
        userId,
        date: {
          gte: twelveMonthsAgo,
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    const monthlyData = bets.reduce((acc, bet) => {
      const month = bet.date.toISOString().substring(0, 7); // YYYY-MM

      if (!acc[month]) {
        acc[month] = {
          month,
          total: 0,
          won: 0,
          lost: 0,
          stake: 0,
          profit: 0,
        };
      }

      acc[month].total++;
      if (bet.status === 'won') acc[month].won++;
      if (bet.status === 'lost') acc[month].lost++;
      acc[month].stake += Number(bet.stake);
      acc[month].profit += Number(bet.profit || 0);

      return acc;
    }, {} as Record<string, any>);

    // Calculer le ROI et winRate pour chaque mois
    return Object.values(monthlyData).map((stats: any) => ({
      ...stats,
      winRate: stats.total > 0 ? (stats.won / stats.total) * 100 : 0,
      roi: stats.stake > 0 ? (stats.profit / stats.stake) * 100 : 0,
    }));
  }

  async getAllStatistics(userId: string, mode: string = 'real') {
    const tipsters = await this.findAll(userId, mode);
    
    const statsPromises = tipsters.map(async (tipster) => {
      const stats = await this.getStatistics(tipster.id, userId);
      return {
        id: tipster.id,
        name: tipster.name,
        color: tipster.color,
        isActive: tipster.isActive,
        ...stats,
      };
    });

    return Promise.all(statsPromises);
  }

  async exportTipsters(userId: string, format: string = 'csv') {
    const statistics = await this.getAllStatistics(userId);
    
    const separator = format === 'excel' ? '\t' : ',';
    
    const headers = [
      'Nom',
      'Statut',
      'Paris totaux',
      'Gagnés',
      'Perdus',
      'En cours',
      'Taux de réussite (%)',
      'Mise totale (€)',
      'Profit/Perte (€)',
      'ROI (%)',
      'Cote moyenne',
    ].join(separator);
    
    const escapeCSV = (value: any) => {
      if (value === null || value === undefined) return '';
      const str = String(value);
      if (str.includes(separator) || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };
    
    const rows = statistics.map((stat) => {
      return [
        escapeCSV(stat.name),
        escapeCSV(stat.isActive ? 'Actif' : 'Inactif'),
        escapeCSV(stat.totalBets),
        escapeCSV(stat.wonBets),
        escapeCSV(stat.lostBets),
        escapeCSV(stat.pendingBets),
        escapeCSV(stat.winRate.toFixed(2)),
        escapeCSV(stat.totalStake.toFixed(2)),
        escapeCSV(stat.totalProfit.toFixed(2)),
        escapeCSV(stat.roi.toFixed(2)),
        escapeCSV(((stat as any).avgOdds || 0).toFixed(2)),
      ].join(separator);
    });
    
    return [headers, ...rows].join('\n');
  }

  async exportTipsterStats(tipsterId: string, userId: string, format: string = 'csv') {
    const tipster = await this.findOne(tipsterId, userId);
    const stats = await this.getStatistics(tipsterId, userId);
    
    const separator = format === 'excel' ? '\t' : ',';
    
    const escapeCSV = (value: any) => {
      if (value === null || value === undefined) return '';
      const str = String(value);
      if (str.includes(separator) || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };
    
    // En-tête avec informations du tipster
    const tipsterInfo = [
      `Tipster${separator}${escapeCSV(tipster.name)}`,
      `Description${separator}${escapeCSV(tipster.description || '-')}`,
      `Site web${separator}${escapeCSV(tipster.website || '-')}`,
      `Statut${separator}${escapeCSV(tipster.isActive ? 'Actif' : 'Inactif')}`,
      '',
      'STATISTIQUES',
      '',
    ].join('\n');
    
    // Statistiques détaillées
    const statsData = [
      ['Métrique', 'Valeur'].join(separator),
      ['Paris totaux', stats.totalBets].join(separator),
      ['Paris gagnés', stats.wonBets].join(separator),
      ['Paris perdus', stats.lostBets].join(separator),
      ['Paris en cours', stats.pendingBets].join(separator),
      ['Taux de réussite (%)', stats.winRate.toFixed(2)].join(separator),
      ['Mise totale (€)', stats.totalStake.toFixed(2)].join(separator),
      ['Gains totaux (€)', stats.totalPayout.toFixed(2)].join(separator),
      ['Profit/Perte (€)', stats.totalProfit.toFixed(2)].join(separator),
      ['ROI (%)', stats.roi.toFixed(2)].join(separator),
      ['Cote moyenne', ((stats as any).avgOdds || 0).toFixed(2)].join(separator),
    ].join('\n');
    
    return `${tipsterInfo}\n${statsData}`;
  }
}
