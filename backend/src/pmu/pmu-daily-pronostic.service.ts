import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma.service';
import { PmuPronosticAnalyzerService } from './pmu-pronostic-analyzer.service';
import { WeatherService } from './weather.service';

@Injectable()
export class PmuDailyPronosticService {
  private readonly logger = new Logger(PmuDailyPronosticService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly pronosticAnalyzer: PmuPronosticAnalyzerService,
    private readonly weatherService: WeatherService,
  ) {}

  /**
   * Génère les pronostics du jour à 8h du matin
   * Cron: Tous les jours à 8h00
   */
  @Cron('0 8 * * *', {
    name: 'generate-daily-pronostics',
    timeZone: 'Europe/Paris',
  })
  async generateDailyPronostics(): Promise<void> {
    this.logger.log('🏇 Starting daily pronostics generation...');

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // 1. Récupérer toutes les courses du jour
      const races = await this.prisma.pmuRace.findMany({
        where: {
          date: {
            gte: today,
            lt: tomorrow,
          },
        },
        include: {
          hippodrome: true,
        },
        orderBy: [
          { startTime: 'asc' },
        ],
      });

      this.logger.log(`📊 Found ${races.length} races for today`);

      if (races.length === 0) {
        this.logger.warn('⚠️ No races found for today');
        return;
      }

      // 2. Collecter la météo prévue pour chaque course
      this.logger.log('🌤️ Collecting weather forecasts...');
      const weatherPromises = races.map(async (race) => {
        if (!race.startTime) return;

        const raceTime = new Date(Number(race.startTime));
        const weather = await this.weatherService.getWeatherForecast(
          race.hippodrome.name,
          raceTime
        );

        if (weather) {
          // Stocker la météo prévue
          await this.weatherService.storeWeatherForRace(race.id, race.hippodrome.name);
          this.logger.debug(`✅ Weather forecast for ${race.hippodrome.name} at ${raceTime.toLocaleTimeString()}: ${weather.condition}, ${weather.temperature}°C`);
        }
      });

      await Promise.all(weatherPromises);

      // 3. Générer les pronostics pour les courses principales
      this.logger.log('🎯 Generating pronostics...');
      let successCount = 0;
      let errorCount = 0;

      // Prioriser les courses importantes (Quinté+, etc.)
      const prioritizedRaces = this.prioritizeRaces(races);

      for (const race of prioritizedRaces.slice(0, 10)) { // Limiter à 10 courses principales
        try {
          this.logger.log(`Analyzing ${race.hippodrome.name} - R${race.reunionNumber}C${race.raceNumber}`);
          
          const analysis = await this.pronosticAnalyzer.analyzeRace(race.id);
          
          if (analysis) {
            // Stocker les résultats dans RaceAiContent
            await this.storePronosticAnalysis(race.id, analysis);
            successCount++;
            this.logger.debug(`✅ Pronostic generated for race ${race.id}`);
          } else {
            errorCount++;
            this.logger.warn(`⚠️ Failed to generate pronostic for race ${race.id}`);
          }

          // Petit délai pour ne pas surcharger
          await this.delay(500);
        } catch (error) {
          errorCount++;
          this.logger.error(`❌ Error generating pronostic for race ${race.id}:`, error.message);
        }
      }

      this.logger.log(`✅ Daily pronostics generation completed: ${successCount} success, ${errorCount} errors`);
    } catch (error) {
      this.logger.error('❌ Error in daily pronostics generation:', error);
    }
  }

  /**
   * Priorise les courses (Quinté+ en premier, puis par montant de prize)
   */
  private prioritizeRaces(races: any[]): any[] {
    return races.sort((a, b) => {
      // 1. Quinté+ en premier
      const aIsQuinte = a.availableBetTypes?.includes('QUINTE_PLUS');
      const bIsQuinte = b.availableBetTypes?.includes('QUINTE_PLUS');
      if (aIsQuinte && !bIsQuinte) return -1;
      if (!aIsQuinte && bIsQuinte) return 1;

      // 2. Puis par prize (allocation)
      const aPrize = a.prize || 0;
      const bPrize = b.prize || 0;
      if (aPrize !== bPrize) return bPrize - aPrize;

      // 3. Puis par heure de départ
      const aTime = a.startTime ? Number(a.startTime) : 0;
      const bTime = b.startTime ? Number(b.startTime) : 0;
      return aTime - bTime;
    });
  }

  /**
   * Stocke l'analyse de pronostic dans la BDD
   */
  private async storePronosticAnalysis(raceId: string, analysis: any): Promise<void> {
    try {
      // Générer le texte du pronostic
      const pronosticText = this.generatePronosticText(analysis);

      // Stocker dans RaceAiContent
      await this.prisma.raceAiContent.upsert({
        where: { raceId },
        create: {
          raceId,
          pronosticText,
          pronosticModel: 'algorithmic-v1',
          selections: analysis.recommendations.quinte.map((num: number, index: number) => {
            const horse = analysis.horses.find((h: any) => h.horseNumber === num);
            return {
              position: index + 1,
              horseNumber: num,
              horseName: horse?.horseName || `N°${num}`,
              confidence: horse?.confidence || 'medium',
              analysis: this.getHorseAnalysisSummary(horse),
            };
          }),
          betType: 'Quinté+',
          stake: analysis.recommendations.quinte.join('-'),
        },
        update: {
          pronosticText,
          pronosticModel: 'algorithmic-v1',
          selections: analysis.recommendations.quinte.map((num: number, index: number) => {
            const horse = analysis.horses.find((h: any) => h.horseNumber === num);
            return {
              position: index + 1,
              horseNumber: num,
              horseName: horse?.horseName || `N°${num}`,
              confidence: horse?.confidence || 'medium',
              analysis: this.getHorseAnalysisSummary(horse),
            };
          }),
          betType: 'Quinté+',
          stake: analysis.recommendations.quinte.join('-'),
        },
      });
    } catch (error) {
      this.logger.error(`Error storing pronostic analysis for race ${raceId}:`, error);
    }
  }

  /**
   * Génère le texte du pronostic
   */
  private generatePronosticText(analysis: any): string {
    const cheval = analysis.recommendations.cheval_du_jour;
    const favoris = analysis.recommendations.favoris.slice(0, 3);
    const outsiders = analysis.recommendations.outsiders.slice(0, 2);

    let text = `# Pronostic ${analysis.raceName}\n\n`;
    text += `**${analysis.hippodrome}** - ${analysis.discipline} - ${analysis.distance}m\n\n`;

    if (analysis.weather) {
      text += `**Conditions**: ${analysis.trackCondition || 'N/A'} - ${analysis.weather}\n\n`;
    }

    text += `## 🏆 Cheval du jour\n\n`;
    text += `**N°${cheval.horseNumber} - ${cheval.horseName}** (Score: ${cheval.totalScore.toFixed(1)}/100)\n`;
    text += `- Jockey: ${cheval.jockey || 'N/A'}\n`;
    text += `- Entraîneur: ${cheval.trainer || 'N/A'}\n`;
    text += `- Confiance: ${cheval.confidence}\n\n`;

    text += `## ⭐ Favoris\n\n`;
    favoris.forEach((h: any, i: number) => {
      text += `${i + 1}. **N°${h.horseNumber} - ${h.horseName}** (${h.totalScore.toFixed(1)}/100)\n`;
    });

    if (outsiders.length > 0) {
      text += `\n## 💎 Outsiders intéressants\n\n`;
      outsiders.forEach((h: any) => {
        text += `- **N°${h.horseNumber} - ${h.horseName}** (${h.totalScore.toFixed(1)}/100)\n`;
      });
    }

    text += `\n## 🎯 Nos sélections\n\n`;
    text += `**Quinté+**: ${analysis.recommendations.quinte.join('-')}\n`;
    text += `**Trio**: ${analysis.recommendations.trio.join('-')}\n`;
    text += `**Couplé gagnant**: ${analysis.recommendations.couple_gagnant.map((p: number[]) => p.join('-')).join(' ou ')}\n`;

    return text;
  }

  /**
   * Résumé de l'analyse d'un cheval
   */
  private getHorseAnalysisSummary(horse: any): string {
    if (!horse) return 'Analyse non disponible';

    const strengths = [];
    if (horse.performanceScore > 75) strengths.push('excellente forme');
    if (horse.jockeyScore > 70) strengths.push('bon jockey');
    if (horse.distanceScore > 75) strengths.push('spécialiste de la distance');
    if (horse.conditionsScore > 75) strengths.push('aime ces conditions');

    return strengths.length > 0 
      ? `Atouts: ${strengths.join(', ')}`
      : 'Profil équilibré';
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Méthode manuelle pour tester
   */
  async generatePronosticsManually(): Promise<void> {
    this.logger.log('🔧 Manual pronostics generation triggered');
    await this.generateDailyPronostics();
  }
}
