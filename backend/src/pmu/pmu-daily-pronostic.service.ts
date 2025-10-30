import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma.service';
import { PmuPronosticAnalyzerService } from './pmu-pronostic-analyzer.service';
import { WeatherService } from './weather.service';
import { PmuAiService } from './pmu-ai.service';

@Injectable()
export class PmuDailyPronosticService {
  private readonly logger = new Logger(PmuDailyPronosticService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly pronosticAnalyzer: PmuPronosticAnalyzerService,
    private readonly weatherService: WeatherService,
    private readonly aiService: PmuAiService,
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

      // 3. Analyser TOUTES les courses
      this.logger.log('🎯 Analyzing ALL races...');
      const analyses: Array<{ race: any; analysis: any; score: number }> = [];
      let errorCount = 0;

      for (const race of races) {
        try {
          this.logger.log(`Analyzing ${race.hippodrome.name} - R${race.reunionNumber}C${race.raceNumber}`);
          
          const analysis = await this.pronosticAnalyzer.analyzeRace(race.id);
          
          if (analysis && analysis.horses.length > 0) {
            // Calculer un score de qualité de la course
            const qualityScore = this.calculateRaceQualityScore(race, analysis);
            
            analyses.push({
              race,
              analysis,
              score: qualityScore,
            });
            
            this.logger.debug(`✅ Race analyzed - Quality score: ${qualityScore.toFixed(1)}`);
          } else {
            errorCount++;
            this.logger.warn(`⚠️ Failed to analyze race ${race.id}`);
          }

          // Petit délai pour ne pas surcharger
          await this.delay(300);
        } catch (error) {
          errorCount++;
          this.logger.error(`❌ Error analyzing race ${race.id}:`, error.message);
        }
      }

      this.logger.log(`📊 Analyzed ${analyses.length} races successfully, ${errorCount} errors`);

      // 4. Trier par score de qualité et garder les meilleures
      analyses.sort((a, b) => b.score - a.score);

      // 5. Filtrer : garder seulement les courses avec un bon score
      const MIN_QUALITY_SCORE = 60; // Score minimum pour être publié
      const qualityRaces = analyses.filter(a => a.score >= MIN_QUALITY_SCORE);

      this.logger.log(`🏆 ${qualityRaces.length} races meet quality threshold (score >= ${MIN_QUALITY_SCORE})`);

      // 6. Stocker les pronostics des courses de qualité
      let successCount = 0;
      for (const { race, analysis } of qualityRaces) {
        try {
          await this.storePronosticAnalysis(race.id, analysis);
          successCount++;
        } catch (error) {
          this.logger.error(`Error storing pronostic for race ${race.id}:`, error.message);
        }
      }

      this.logger.log(`✅ Daily pronostics generation completed: ${successCount} quality races published`);
    } catch (error) {
      this.logger.error('❌ Error in daily pronostics generation:', error);
    }
  }

  /**
   * Calcule un score de qualité pour une course
   * Basé sur plusieurs critères pour déterminer si la course mérite un pronostic
   */
  private calculateRaceQualityScore(race: any, analysis: any): number {
    let score = 0;

    // 1. Type de course (30 points max)
    if (race.availableBetTypes?.includes('QUINTE_PLUS')) {
      score += 30; // Quinté+ = toujours publié
    } else if (race.availableBetTypes?.includes('QUARTE_PLUS')) {
      score += 25;
    } else if (race.availableBetTypes?.includes('TIERCE')) {
      score += 20;
    } else if (race.availableBetTypes?.includes('TRIO')) {
      score += 15;
    } else {
      score += 10;
    }

    // 2. Allocation (prize money) (20 points max)
    const prize = race.prize || 0;
    if (prize >= 100000) score += 20;
    else if (prize >= 50000) score += 15;
    else if (prize >= 30000) score += 10;
    else if (prize >= 20000) score += 5;

    // 3. Qualité de l'analyse (30 points max)
    // Si on a un cheval qui se démarque clairement = bonne opportunité
    const topHorse = analysis.horses[0];
    const secondHorse = analysis.horses[1];
    
    if (topHorse && secondHorse) {
      const scoreDiff = topHorse.totalScore - secondHorse.totalScore;
      
      // Écart significatif = pronostic plus fiable
      if (scoreDiff >= 15) score += 30; // Très clair
      else if (scoreDiff >= 10) score += 25; // Clair
      else if (scoreDiff >= 5) score += 20; // Assez clair
      else score += 10; // Course serrée
    }

    // 4. Confiance globale (10 points max)
    const highConfidenceHorses = analysis.horses.filter((h: any) => h.confidence === 'high').length;
    if (highConfidenceHorses >= 3) score += 10;
    else if (highConfidenceHorses >= 2) score += 7;
    else if (highConfidenceHorses >= 1) score += 5;

    // 5. Nombre de partants (10 points max)
    const nbHorses = analysis.horses.length;
    if (nbHorses >= 12 && nbHorses <= 18) score += 10; // Idéal
    else if (nbHorses >= 8 && nbHorses <= 20) score += 7;
    else score += 3;

    // Bonus : Quinté+ est toujours publié
    if (race.availableBetTypes?.includes('QUINTE_PLUS')) {
      score = Math.max(score, 100); // Force le score à 100 minimum
    }

    return Math.min(100, score);
  }

  /**
   * Priorise les courses (Quinté+ en premier, puis par montant de prize)
   * NOTE: Cette méthode n'est plus utilisée, on analyse toutes les courses
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
      // Générer le texte du pronostic avec OpenAI
      const pronosticText = await this.generatePronosticText(analysis);

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
   * Génère le texte du pronostic avec OpenAI
   */
  private async generatePronosticText(analysis: any): Promise<string> {
    try {
      // Préparer les données pour OpenAI
      const prompt = this.buildAiPrompt(analysis);
      
      // Appeler OpenAI
      const aiText = await this.aiService.generatePronosticText(prompt);
      
      if (aiText) {
        this.logger.debug('✅ AI-generated pronostic text');
        return aiText;
      }
      
      // Fallback sur template si OpenAI échoue
      this.logger.warn('⚠️ OpenAI failed, using template');
      return this.generateTemplateText(analysis);
    } catch (error) {
      this.logger.error('Error generating AI text:', error.message);
      return this.generateTemplateText(analysis);
    }
  }

  /**
   * Construit le prompt pour OpenAI
   */
  private buildAiPrompt(analysis: any): string {
    const cheval = analysis.recommendations.cheval_du_jour;
    const favoris = analysis.recommendations.favoris.slice(0, 3);
    const outsiders = analysis.recommendations.outsiders.slice(0, 2);

    return `Tu es un expert en pronostics hippiques. Génère un pronostic professionnel basé sur ces données RÉELLES calculées algorithmiquement :

**Course**: ${analysis.raceName}
**Hippodrome**: ${analysis.hippodrome}
**Distance**: ${analysis.distance}m - ${analysis.discipline}
**Conditions**: ${analysis.trackCondition || 'N/A'} - ${analysis.weather || 'N/A'}

**CHEVAL DU JOUR** (Score: ${cheval.totalScore.toFixed(1)}/100):
- N°${cheval.horseNumber} ${cheval.horseName}
- Jockey: ${cheval.jockey || 'N/A'}
- Entraîneur: ${cheval.trainer || 'N/A'}
- Scores détaillés:
  * Performance: ${cheval.performanceScore.toFixed(0)}/100 (musique: ${cheval.stats.recentForm})
  * Jockey: ${cheval.jockeyScore.toFixed(0)}/100
  * Entraîneur: ${cheval.trainerScore.toFixed(0)}/100
  * Cote: ${cheval.oddsScore.toFixed(0)}/100
  * Distance: ${cheval.distanceScore.toFixed(0)}/100
  * Conditions: ${cheval.conditionsScore.toFixed(0)}/100

**FAVORIS**:
${favoris.map((h: any) => `- N°${h.horseNumber} ${h.horseName} (${h.totalScore.toFixed(1)}/100)`).join('\n')}

**OUTSIDERS**:
${outsiders.map((h: any) => `- N°${h.horseNumber} ${h.horseName} (${h.totalScore.toFixed(1)}/100)`).join('\n')}

**SÉLECTIONS**:
- Quinté+: ${analysis.recommendations.quinte.join('-')}
- Trio: ${analysis.recommendations.trio.join('-')}

IMPORTANT:
1. Utilise UNIQUEMENT ces chiffres (ne les invente pas)
2. Explique POURQUOI ces chevaux sont sélectionnés (scores)
3. Analyse l'impact des conditions météo/terrain
4. Donne des conseils de paris concrets
5. Reste factuel, pas de garanties
6. Ton professionnel mais accessible
7. Maximum 500 mots

Format Markdown avec titres ##`;
  }

  /**
   * Génère le texte du pronostic (template de secours)
   */
  private generateTemplateText(analysis: any): string {
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

    const strengths: string[] = [];
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
