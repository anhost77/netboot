import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma.service';
import OpenAI from 'openai';

@Injectable()
export class PmuAiService {
  private readonly logger = new Logger(PmuAiService.name);
  private openai: OpenAI | null = null;
  private isConfigured: boolean = false;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    this.initializeOpenAI();
  }

  private initializeOpenAI() {
    const apiKey = this.config.get('OPENAI_API_KEY');

    if (!apiKey) {
      this.logger.warn('⚠️  OpenAI API key not configured - AI content generation disabled');
      this.isConfigured = false;
      return;
    }

    try {
      this.openai = new OpenAI({
        apiKey: apiKey,
      });
      this.isConfigured = true;
      this.logger.log('✅ OpenAI initialized for race content generation');
    } catch (error) {
      this.logger.error('❌ Failed to initialize OpenAI:', error);
      this.isConfigured = false;
    }
  }

  /**
   * Génère un texte de pronostic avec OpenAI
   */
  async generatePronosticText(prompt: string): Promise<string | null> {
    if (!this.isConfigured || !this.openai) {
      this.logger.warn('OpenAI not configured');
      return null;
    }

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Tu es un expert en pronostics hippiques. Tu analyses des données réelles et génères des pronostics professionnels, factuels et pédagogiques. Tu ne garantis jamais de résultats et rappelles toujours de jouer responsablement.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      const text = completion.choices[0]?.message?.content;
      
      if (text) {
        this.logger.debug(`✅ Generated ${text.length} characters with OpenAI`);
        return text;
      }

      return null;
    } catch (error) {
      this.logger.error('Error calling OpenAI:', error.message);
      return null;
    }
  }

  /**
   * Génère ou récupère le pronostic IA pour une course
   */
  async getOrGeneratePronostic(raceId: string): Promise<string | null> {
    if (!this.isConfigured) {
      return null;
    }

    try {
      // 1. Vérifier si le pronostic existe déjà en BDD
      const existingContent = await this.prisma.raceAiContent.findUnique({
        where: { raceId },
      });

      if (existingContent?.pronosticText) {
        this.logger.log(`📖 Pronostic existant trouvé pour race ${raceId}`);
        return existingContent.pronosticText;
      }

      // 2. Récupérer les données de la course
      const race = await this.prisma.pmuRace.findUnique({
        where: { id: raceId },
        include: {
          hippodrome: true,
          horses: {
            orderBy: { number: 'asc' },
          },
        },
      });

      if (!race) {
        this.logger.warn(`Course ${raceId} non trouvée`);
        return null;
      }

      // 3. Vérifier que la course n'est pas encore terminée
      // TEMPORAIRE: Commenté pour tester la génération de pronostic
      // const now = new Date();
      // const raceDate = new Date(race.startTime ? Number(race.startTime) : race.date);
      // if (now > raceDate) {
      //   this.logger.log(`Course ${raceId} déjà terminée, pas de pronostic généré`);
      //   return null;
      // }

      // 4. Générer le pronostic avec OpenAI
      this.logger.log(`🤖 Génération du pronostic pour ${race.hippodrome.name} R${race.reunionNumber}C${race.raceNumber}`);
      
      const prompt = this.buildPronosticPrompt(race);
      const completion = await this.openai!.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Tu es un expert en courses hippiques avec 20 ans d\'expérience. Tu analyses les courses PMU et fournis des pronostics détaillés, clairs et accessibles pour les débutants comme les experts.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      const pronosticText = completion.choices[0]?.message?.content;
      if (!pronosticText) {
        this.logger.error('Pas de texte généré par OpenAI');
        return null;
      }

      // 5. Sauvegarder en BDD
      await this.prisma.raceAiContent.upsert({
        where: { raceId },
        create: {
          raceId,
          pronosticText,
          pronosticModel: 'gpt-4o-mini',
          pronosticTokens: completion.usage?.total_tokens || 0,
        },
        update: {
          pronosticText,
          pronosticModel: 'gpt-4o-mini',
          pronosticTokens: completion.usage?.total_tokens || 0,
        },
      });

      this.logger.log(`✅ Pronostic généré et sauvegardé (${completion.usage?.total_tokens} tokens)`);
      return pronosticText;
    } catch (error) {
      this.logger.error('Erreur génération pronostic:', error);
      return null;
    }
  }

  /**
   * Génère ou récupère le compte-rendu IA pour une course terminée
   */
  async getOrGenerateReport(raceId: string): Promise<string | null> {
    if (!this.isConfigured) {
      return null;
    }

    try {
      // 1. Vérifier si le compte-rendu existe déjà
      const existingContent = await this.prisma.raceAiContent.findUnique({
        where: { raceId },
      });

      if (existingContent?.reportText) {
        this.logger.log(`📖 Compte-rendu existant trouvé pour race ${raceId}`);
        return existingContent.reportText;
      }

      // 2. Récupérer les données de la course avec résultats
      const race = await this.prisma.pmuRace.findUnique({
        where: { id: raceId },
        include: {
          hippodrome: true,
          horses: {
            orderBy: { arrivalOrder: 'asc' },
          },
          reports: true,
        },
      });

      if (!race) {
        this.logger.warn(`Course ${raceId} non trouvée`);
        return null;
      }

      // 3. Vérifier que la course est terminée et a des résultats
      const hasResults = race.horses.some(h => h.arrivalOrder !== null);
      if (!hasResults) {
        this.logger.log(`Course ${raceId} n'a pas encore de résultats`);
        return null;
      }

      // 4. Générer le compte-rendu avec OpenAI
      this.logger.log(`🤖 Génération du compte-rendu pour ${race.hippodrome.name} R${race.reunionNumber}C${race.raceNumber}`);
      
      const prompt = this.buildReportPrompt(race);
      const completion = await this.openai!.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Tu es un journaliste hippique expert qui rédige des comptes-rendus de courses. Ton style est vivant, précis et accessible. Tu analyses les performances et expliques le déroulement de la course.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      const reportText = completion.choices[0]?.message?.content;
      if (!reportText) {
        this.logger.error('Pas de texte généré par OpenAI');
        return null;
      }

      // 5. Sauvegarder en BDD
      await this.prisma.raceAiContent.upsert({
        where: { raceId },
        create: {
          raceId,
          reportText,
          reportModel: 'gpt-4o-mini',
          reportTokens: completion.usage?.total_tokens || 0,
        },
        update: {
          reportText,
          reportModel: 'gpt-4o-mini',
          reportTokens: completion.usage?.total_tokens || 0,
        },
      });

      this.logger.log(`✅ Compte-rendu généré et sauvegardé (${completion.usage?.total_tokens} tokens)`);
      return reportText;
    } catch (error) {
      this.logger.error('Erreur génération compte-rendu:', error);
      return null;
    }
  }

  private buildPronosticPrompt(race: any): string {
    const horses = race.horses.map((h: any) => 
      `- N°${h.number} ${h.name}${h.recentForm ? ` (Musique: ${h.recentForm})` : ''}`
    ).join('\n');

    return `Rédige un pronostic détaillé pour cette course hippique :

**Course:** ${race.name || `Course ${race.raceNumber}`}
**Hippodrome:** ${race.hippodrome.name}
**Date:** ${new Date(race.date).toLocaleDateString('fr-FR')}
**Discipline:** ${race.discipline || 'Non spécifié'}
**Distance:** ${race.distance || 'Non spécifié'}m
**Allocation:** ${race.prize ? `${race.prize.toLocaleString()}€` : 'Non spécifié'}

**Partants:**
${horses}

Fournis un pronostic structuré avec :
1. Une analyse générale de la course (2-3 phrases)
2. Les favoris à surveiller (2-3 chevaux avec justification)
3. Les outsiders intéressants (1-2 chevaux)
4. Un conseil de jeu concret

Sois concis, clair et accessible. Maximum 400 mots.`;
  }

  /**
   * Génère des sélections structurées pour la page pronostics
   */
  async generatePronosticSelections(raceId: string): Promise<any> {
    if (!this.isConfigured) {
      return null;
    }

    try {
      // Vérifier si existe déjà
      const existingContent = await this.prisma.raceAiContent.findUnique({
        where: { raceId },
      });

      if (existingContent?.selections) {
        return {
          selections: existingContent.selections,
          betType: existingContent.betType,
          stake: existingContent.stake,
        };
      }

      // Récupérer la course
      const race = await this.prisma.pmuRace.findUnique({
        where: { id: raceId },
        include: {
          hippodrome: true,
          horses: {
            orderBy: { number: 'asc' },
          },
        },
      });

      if (!race || race.horses.length === 0) {
        return null;
      }

      // Générer avec OpenAI
      const prompt = this.buildSelectionsPrompt(race);
      const completion = await this.openai!.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Tu es un expert en pronostics hippiques. Tu dois retourner UNIQUEMENT un JSON valide, sans texte avant ou après.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      });

      const responseText = completion.choices[0]?.message?.content?.trim();
      if (!responseText) return null;

      // Parser le JSON
      const data = JSON.parse(responseText);

      // Sauvegarder
      await this.prisma.raceAiContent.upsert({
        where: { raceId },
        create: {
          raceId,
          selections: data.selections,
          betType: data.betType,
          stake: data.stake,
        },
        update: {
          selections: data.selections,
          betType: data.betType,
          stake: data.stake,
        },
      });

      return data;
    } catch (error) {
      this.logger.error('Erreur génération sélections:', error);
      return null;
    }
  }

  private buildSelectionsPrompt(race: any): string {
    const horses = race.horses.map((h: any) => ({
      number: h.number,
      name: h.name,
      recentForm: h.recentForm,
      odds: h.odds ? Number(h.odds) : null,
    }));

    return `Analyse cette course et génère des sélections de pronostic.

**Course:** ${race.name || `Course ${race.raceNumber}`}
**Hippodrome:** ${race.hippodrome.name}
**Discipline:** ${race.discipline}
**Distance:** ${race.distance}m
**Partants:** ${JSON.stringify(horses)}

Retourne UNIQUEMENT un JSON avec cette structure exacte :
{
  "betType": "Quinté+" ou "Trio" ou "Couplé" (selon le nombre de chevaux),
  "stake": "2-5-8-11-14" (les numéros séparés par des tirets),
  "selections": [
    {
      "position": 1,
      "horseNumber": 2,
      "horseName": "NOM_CHEVAL",
      "confidence": "high" ou "medium" ou "low",
      "analysis": "Courte analyse de 1-2 phrases"
    }
  ]
}

Sélectionne 3 à 5 chevaux selon le type de pari. Base ton analyse sur la musique et les cotes si disponibles.`;
  }

  private buildReportPrompt(race: any): string {
    const podium = race.horses
      .filter((h: any) => h.arrivalOrder && h.arrivalOrder <= 3)
      .map((h: any) => `${h.arrivalOrder}. N°${h.number} ${h.name}`)
      .join('\n');

    const allResults = race.horses
      .filter((h: any) => h.arrivalOrder)
      .map((h: any) => `${h.arrivalOrder}° - N°${h.number} ${h.name}`)
      .join(', ');

    return `Rédige un compte-rendu de cette course hippique terminée :

**Course:** ${race.name || `Course ${race.raceNumber}`}
**Hippodrome:** ${race.hippodrome.name}
**Date:** ${new Date(race.date).toLocaleDateString('fr-FR')}
**Discipline:** ${race.discipline || 'Non spécifié'}
**Distance:** ${race.distance || 'Non spécifié'}m

**Podium:**
${podium}

**Classement complet:** ${allResults}

Rédige un compte-rendu structuré avec :
1. Le résumé du podium (qui a gagné et pourquoi c'est remarquable)
2. Le déroulement de la course (2-3 phrases sur la stratégie gagnante)
3. Les surprises ou déceptions éventuelles
4. Une conclusion sur les enseignements de cette course

Sois vivant, précis et accessible. Maximum 400 mots.`;
  }
}
