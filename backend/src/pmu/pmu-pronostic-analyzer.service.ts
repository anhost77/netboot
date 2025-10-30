import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

interface HorseAnalysis {
  horseNumber: number;
  horseName: string;
  jockey: string | null;
  trainer: string | null;
  
  // Scores détaillés
  performanceScore: number;      // 0-100 basé sur la musique
  jockeyScore: number;           // 0-100 basé sur stats jockey
  trainerScore: number;          // 0-100 basé sur stats entraîneur
  oddsScore: number;             // 0-100 basé sur rapport cote/valeur
  distanceScore: number;         // 0-100 basé sur performances à cette distance
  conditionsScore: number;       // 0-100 basé sur conditions (terrain, météo)
  
  // Score global
  totalScore: number;            // Moyenne pondérée
  
  // Recommandations
  confidence: 'high' | 'medium' | 'low';
  category: 'favori' | 'outsider' | 'longshot';
  betTypes: string[];            // ['gagnant', 'placé', 'couplé']
  
  // Statistiques brutes
  stats: {
    recentForm: string | null;
    age: number | null;
    weight: number | null;
    careerWins: number | null;
    careerStarts: number | null;
    winRate: number | null;
    totalEarnings: number | null;
    odds: number | null;
  };
}

interface RaceAnalysis {
  raceId: string;
  raceName: string;
  hippodrome: string;
  distance: number;
  discipline: string;
  trackCondition: string | null;
  weather: string | null;
  
  horses: HorseAnalysis[];
  
  // Recommandations globales
  recommendations: {
    cheval_du_jour: HorseAnalysis | null;
    favoris: HorseAnalysis[];
    outsiders: HorseAnalysis[];
    longshots: HorseAnalysis[];
    
    // Suggestions de paris
    gagnant: number[];           // Numéros chevaux
    place: number[];
    couple_gagnant: number[][];  // Paires
    trio: number[];
    quinte: number[];
  };
}

@Injectable()
export class PmuPronosticAnalyzerService {
  private readonly logger = new Logger(PmuPronosticAnalyzerService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Analyse complète d'une course
   */
  async analyzeRace(raceId: string): Promise<RaceAnalysis | null> {
    try {
      // 1. Récupérer la course avec tous les chevaux et leurs performances
      const race = await this.prisma.pmuRace.findUnique({
        where: { id: raceId },
        include: {
          hippodrome: true,
          horses: {
            include: {
              performances: {
                orderBy: { date: 'desc' },
                take: 10, // 10 dernières courses
              },
            },
            orderBy: { number: 'asc' },
          },
        },
      });

      if (!race || race.horses.length === 0) {
        this.logger.warn(`Race ${raceId} not found or has no horses`);
        return null;
      }

      this.logger.log(`🏇 Analyzing race: ${race.name || `R${race.reunionNumber}C${race.raceNumber}`}`);
      this.logger.log(`📊 ${race.horses.length} horses to analyze`);

      // 2. Analyser chaque cheval
      const horsesAnalysis: HorseAnalysis[] = [];
      for (const horse of race.horses) {
        const analysis = await this.analyzeHorse(horse, race);
        horsesAnalysis.push(analysis);
      }

      // 3. Trier par score total
      horsesAnalysis.sort((a, b) => b.totalScore - a.totalScore);

      // 4. Générer les recommandations
      const recommendations = this.generateRecommendations(horsesAnalysis);

      // 5. Afficher le tableau de stats
      this.displayStatsTable(horsesAnalysis);

      return {
        raceId: race.id,
        raceName: race.name || `Course ${race.raceNumber}`,
        hippodrome: race.hippodrome.name,
        distance: race.distance || 0,
        discipline: race.discipline || 'N/A',
        trackCondition: race.trackCondition,
        weather: race.weather,
        horses: horsesAnalysis,
        recommendations,
      };
    } catch (error) {
      this.logger.error(`Error analyzing race ${raceId}:`, error);
      return null;
    }
  }

  /**
   * Analyse un cheval individuel
   */
  private async analyzeHorse(horse: any, race: any): Promise<HorseAnalysis> {
    // 1. Score de performance (musique)
    const performanceScore = this.calculatePerformanceScore(horse.recentForm, horse.performances);

    // 2. Score jockey
    const jockeyScore = await this.calculateJockeyScore(horse.jockey);

    // 3. Score entraîneur
    const trainerScore = await this.calculateTrainerScore(horse.trainer);

    // 4. Score cotes (rapport valeur/cote)
    const oddsScore = this.calculateOddsScore(horse.odds, performanceScore);

    // 5. Score distance
    const distanceScore = this.calculateDistanceScore(horse.performances, race.distance);

    // 6. Score conditions
    const conditionsScore = this.calculateConditionsScore(horse.performances, race.trackCondition);

    // 7. Calcul du score total (moyenne pondérée)
    const totalScore = (
      performanceScore * 0.30 +
      jockeyScore * 0.20 +
      trainerScore * 0.15 +
      oddsScore * 0.15 +
      distanceScore * 0.10 +
      conditionsScore * 0.10
    );

    // 8. Déterminer la confiance et la catégorie
    const confidence = this.determineConfidence(totalScore);
    const category = this.determineCategory(totalScore, horse.odds);
    const betTypes = this.determineBetTypes(totalScore, horse.odds);

    // 9. Calculer le taux de victoire
    const winRate = horse.careerStarts && horse.careerWins 
      ? (horse.careerWins / horse.careerStarts) * 100 
      : null;

    return {
      horseNumber: horse.number,
      horseName: horse.name,
      jockey: horse.jockey,
      trainer: horse.trainer,
      performanceScore,
      jockeyScore,
      trainerScore,
      oddsScore,
      distanceScore,
      conditionsScore,
      totalScore,
      confidence,
      category,
      betTypes,
      stats: {
        recentForm: horse.recentForm,
        age: horse.age,
        weight: horse.weight,
        careerWins: horse.careerWins,
        careerStarts: horse.careerStarts,
        winRate,
        totalEarnings: horse.totalEarnings,
        odds: horse.odds ? Number(horse.odds) : null,
      },
    };
  }

  /**
   * Calcule le score de performance basé sur la musique
   */
  private calculatePerformanceScore(recentForm: string | null, performances: any[]): number {
    if (!recentForm) return 50; // Score neutre si pas de musique

    // Parser la musique: "1p2p3p" = [1, 2, 3]
    const positions = recentForm
      .split(/[pP]/)
      .filter(p => p && p !== '0')
      .map(p => parseInt(p))
      .filter(p => !isNaN(p))
      .slice(0, 5); // 5 dernières courses

    if (positions.length === 0) return 50;

    // Calculer le score basé sur les positions
    let score = 0;
    positions.forEach((pos, index) => {
      const weight = 1 - (index * 0.15); // Pondération décroissante
      if (pos === 1) score += 100 * weight;
      else if (pos === 2) score += 80 * weight;
      else if (pos === 3) score += 60 * weight;
      else if (pos <= 5) score += 40 * weight;
      else score += 20 * weight;
    });

    return Math.min(100, score / positions.length);
  }

  /**
   * Calcule le score du jockey
   */
  private async calculateJockeyScore(jockeyName: string | null): number {
    if (!jockeyName) return 50;

    try {
      // Récupérer les performances du jockey sur les 30 derniers jours
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const performances = await this.prisma.pmuHorsePerformance.findMany({
        where: {
          jockey: jockeyName,
          date: { gte: thirtyDaysAgo },
          arrivalPosition: { not: null },
        },
        select: {
          arrivalPosition: true,
        },
      });

      if (performances.length === 0) return 50;

      // Calculer le taux de victoire et de place
      const wins = performances.filter(p => p.arrivalPosition === 1).length;
      const places = performances.filter(p => p.arrivalPosition && p.arrivalPosition <= 3).length;

      const winRate = (wins / performances.length) * 100;
      const placeRate = (places / performances.length) * 100;

      return Math.min(100, (winRate * 0.7) + (placeRate * 0.3));
    } catch (error) {
      this.logger.warn(`Error calculating jockey score for ${jockeyName}:`, error);
      return 50;
    }
  }

  /**
   * Calcule le score de l'entraîneur
   */
  private async calculateTrainerScore(trainerName: string | null): number {
    if (!trainerName) return 50;

    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const performances = await this.prisma.pmuHorsePerformance.findMany({
        where: {
          trainer: trainerName,
          date: { gte: thirtyDaysAgo },
          arrivalPosition: { not: null },
        },
        select: {
          arrivalPosition: true,
        },
      });

      if (performances.length === 0) return 50;

      const wins = performances.filter(p => p.arrivalPosition === 1).length;
      const places = performances.filter(p => p.arrivalPosition && p.arrivalPosition <= 3).length;

      const winRate = (wins / performances.length) * 100;
      const placeRate = (places / performances.length) * 100;

      return Math.min(100, (winRate * 0.6) + (placeRate * 0.4));
    } catch (error) {
      this.logger.warn(`Error calculating trainer score for ${trainerName}:`, error);
      return 50;
    }
  }

  /**
   * Calcule le score basé sur les cotes (rapport valeur/cote)
   */
  private calculateOddsScore(odds: any, performanceScore: number): number {
    if (!odds) return 50;

    const oddsValue = Number(odds);
    
    // Si la cote est très basse (<2) et le cheval a un bon score = bon rapport
    if (oddsValue < 2 && performanceScore > 70) return 90;
    
    // Si la cote est moyenne (2-5) et bon score = excellent rapport
    if (oddsValue >= 2 && oddsValue <= 5 && performanceScore > 60) return 85;
    
    // Si la cote est élevée (>10) et bon score = outsider intéressant
    if (oddsValue > 10 && performanceScore > 50) return 70;
    
    // Cote très élevée (>20) = risqué
    if (oddsValue > 20) return 30;
    
    return 50;
  }

  /**
   * Calcule le score basé sur les performances à cette distance
   */
  private calculateDistanceScore(performances: any[], raceDistance: number | null): number {
    if (!raceDistance || performances.length === 0) return 50;

    // Filtrer les performances à distance similaire (±200m)
    const similarDistancePerfs = performances.filter(p => 
      p.distance && Math.abs(p.distance - raceDistance) <= 200
    );

    if (similarDistancePerfs.length === 0) return 50;

    // Calculer la moyenne des positions
    const avgPosition = similarDistancePerfs.reduce((sum, p) => 
      sum + (p.arrivalPosition || 10), 0
    ) / similarDistancePerfs.length;

    // Convertir en score (position 1 = 100, position 10+ = 0)
    return Math.max(0, 100 - (avgPosition - 1) * 10);
  }

  /**
   * Calcule le score basé sur les conditions de course
   */
  private calculateConditionsScore(performances: any[], trackCondition: string | null): number {
    if (!trackCondition || performances.length === 0) return 50;

    // Filtrer les performances sur terrain similaire
    const similarConditionPerfs = performances.filter(p => 
      p.rawData?.terrain === trackCondition
    );

    if (similarConditionPerfs.length === 0) return 50;

    const avgPosition = similarConditionPerfs.reduce((sum, p) => 
      sum + (p.arrivalPosition || 10), 0
    ) / similarConditionPerfs.length;

    return Math.max(0, 100 - (avgPosition - 1) * 10);
  }

  /**
   * Détermine le niveau de confiance
   */
  private determineConfidence(totalScore: number): 'high' | 'medium' | 'low' {
    if (totalScore >= 75) return 'high';
    if (totalScore >= 55) return 'medium';
    return 'low';
  }

  /**
   * Détermine la catégorie du cheval
   */
  private determineCategory(totalScore: number, odds: any): 'favori' | 'outsider' | 'longshot' {
    const oddsValue = odds ? Number(odds) : 10;
    
    if (totalScore >= 70 && oddsValue < 5) return 'favori';
    if (totalScore >= 55 && oddsValue >= 5 && oddsValue <= 15) return 'outsider';
    return 'longshot';
  }

  /**
   * Détermine les types de paris recommandés
   */
  private determineBetTypes(totalScore: number, odds: any): string[] {
    const types: string[] = [];
    const oddsValue = odds ? Number(odds) : 10;
    
    if (totalScore >= 75) {
      types.push('gagnant', 'placé', 'couplé');
    } else if (totalScore >= 60) {
      types.push('placé', 'couplé');
    } else if (totalScore >= 50) {
      types.push('placé');
    }
    
    if (oddsValue > 10 && totalScore >= 55) {
      types.push('outsider_value');
    }
    
    return types;
  }

  /**
   * Génère les recommandations globales
   */
  private generateRecommendations(horses: HorseAnalysis[]): RaceAnalysis['recommendations'] {
    const favoris = horses.filter(h => h.category === 'favori').slice(0, 3);
    const outsiders = horses.filter(h => h.category === 'outsider').slice(0, 3);
    const longshots = horses.filter(h => h.category === 'longshot' && h.totalScore >= 45).slice(0, 2);

    const cheval_du_jour = horses[0] || null;

    // Suggestions de paris
    const gagnant = horses.slice(0, 2).map(h => h.horseNumber);
    const place = horses.slice(0, 4).map(h => h.horseNumber);
    const couple_gagnant = [
      [horses[0]?.horseNumber, horses[1]?.horseNumber],
      [horses[0]?.horseNumber, horses[2]?.horseNumber],
    ].filter(pair => pair[0] && pair[1]);
    const trio = horses.slice(0, 3).map(h => h.horseNumber);
    const quinte = horses.slice(0, 5).map(h => h.horseNumber);

    return {
      cheval_du_jour,
      favoris,
      outsiders,
      longshots,
      gagnant,
      place,
      couple_gagnant,
      trio,
      quinte,
    };
  }

  /**
   * Affiche le tableau de stats dans les logs
   */
  private displayStatsTable(horses: HorseAnalysis[]): void {
    this.logger.log('\n' + '='.repeat(150));
    this.logger.log('📊 TABLEAU D\'ANALYSE DÉTAILLÉE');
    this.logger.log('='.repeat(150));
    
    this.logger.log(
      `${'N°'.padEnd(4)} | ` +
      `${'Cheval'.padEnd(20)} | ` +
      `${'Jockey'.padEnd(15)} | ` +
      `${'Perf'.padEnd(5)} | ` +
      `${'Jock'.padEnd(5)} | ` +
      `${'Entr'.padEnd(5)} | ` +
      `${'Cote'.padEnd(5)} | ` +
      `${'Dist'.padEnd(5)} | ` +
      `${'Cond'.padEnd(5)} | ` +
      `${'TOTAL'.padEnd(6)} | ` +
      `${'Catégorie'.padEnd(10)} | ` +
      `${'Conf'.padEnd(6)} | ` +
      `${'Musique'.padEnd(10)}`
    );
    this.logger.log('-'.repeat(150));

    horses.forEach(horse => {
      this.logger.log(
        `${String(horse.horseNumber).padEnd(4)} | ` +
        `${horse.horseName.substring(0, 20).padEnd(20)} | ` +
        `${(horse.jockey || 'N/A').substring(0, 15).padEnd(15)} | ` +
        `${horse.performanceScore.toFixed(0).padEnd(5)} | ` +
        `${horse.jockeyScore.toFixed(0).padEnd(5)} | ` +
        `${horse.trainerScore.toFixed(0).padEnd(5)} | ` +
        `${horse.oddsScore.toFixed(0).padEnd(5)} | ` +
        `${horse.distanceScore.toFixed(0).padEnd(5)} | ` +
        `${horse.conditionsScore.toFixed(0).padEnd(5)} | ` +
        `${horse.totalScore.toFixed(1).padEnd(6)} | ` +
        `${horse.category.padEnd(10)} | ` +
        `${horse.confidence.padEnd(6)} | ` +
        `${(horse.stats.recentForm || 'N/A').padEnd(10)}`
      );
    });

    this.logger.log('='.repeat(150));
    this.logger.log('\n🏆 RECOMMANDATIONS:');
    this.logger.log(`Cheval du jour: N°${horses[0]?.horseNumber} - ${horses[0]?.horseName} (Score: ${horses[0]?.totalScore.toFixed(1)})`);
    this.logger.log(`Gagnant: ${horses.slice(0, 2).map(h => `N°${h.horseNumber}`).join(', ')}`);
    this.logger.log(`Placé: ${horses.slice(0, 4).map(h => `N°${h.horseNumber}`).join(', ')}`);
    this.logger.log(`Quinté+: ${horses.slice(0, 5).map(h => `N°${h.horseNumber}`).join('-')}`);
    this.logger.log('='.repeat(150) + '\n');
  }
}
