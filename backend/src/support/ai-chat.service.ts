import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma.service';
import OpenAI from 'openai';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

@Injectable()
export class AiChatService {
  private readonly logger = new Logger(AiChatService.name);
  private openai: OpenAI | null = null;
  private isConfigured: boolean = false;

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    this.initializeOpenAI();
  }

  private initializeOpenAI() {
    const apiKey = this.config.get('OPENAI_API_KEY');

    if (!apiKey) {
      this.logger.warn('⚠️  OpenAI API key not configured - AI chat running in DEMO MODE');
      this.isConfigured = false;
      return;
    }

    try {
      this.openai = new OpenAI({
        apiKey: apiKey,
      });
      this.isConfigured = true;
      this.logger.log('✅ OpenAI configured successfully');
    } catch (error) {
      this.logger.error('❌ Failed to configure OpenAI:', error.message);
      this.isConfigured = false;
    }
  }

  /**
   * Define available tools/functions for the AI
   */
  private getTools(): OpenAI.Chat.ChatCompletionTool[] {
    return [
      {
        type: 'function',
        function: {
          name: 'get_user_stats',
          description: 'Obtenir les statistiques de paris de l\'utilisateur (nombre de paris, taux de réussite, profit total)',
          parameters: {
            type: 'object',
            properties: {
              period: {
                type: 'string',
                enum: ['all', 'month', 'week'],
                description: 'Période pour les statistiques',
              },
            },
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'get_recent_bets',
          description: 'Obtenir les derniers paris de l\'utilisateur',
          parameters: {
            type: 'object',
            properties: {
              limit: {
                type: 'number',
                description: 'Nombre de paris à récupérer (max 10)',
              },
            },
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'get_budget_status',
          description: 'Obtenir l\'état actuel du budget de l\'utilisateur (limites, dépenses, reste disponible)',
          parameters: {
            type: 'object',
            properties: {},
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'get_user_settings',
          description: 'Obtenir les paramètres de l\'utilisateur (mode bankroll, notifications, etc.)',
          parameters: {
            type: 'object',
            properties: {},
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'create_support_ticket',
          description: 'Créer un ticket de support lorsque l\'IA ne peut pas résoudre le problème de l\'utilisateur. Utilise la conversation actuelle et génère un résumé.',
          parameters: {
            type: 'object',
            properties: {
              subject: {
                type: 'string',
                description: 'Sujet du ticket (résumé court du problème)',
              },
              category: {
                type: 'string',
                enum: ['technical', 'billing', 'feature_request', 'other'],
                description: 'Catégorie du ticket',
              },
              priority: {
                type: 'string',
                enum: ['low', 'normal', 'high', 'urgent'],
                description: 'Priorité du ticket basée sur la gravité du problème',
              },
              summary: {
                type: 'string',
                description: 'Résumé détaillé de la demande de l\'utilisateur',
              },
            },
            required: ['subject', 'category', 'priority', 'summary'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'get_pmu_stats',
          description: 'Obtenir les statistiques PMU de l\'utilisateur (hippodromes, courses, chevaux pariés)',
          parameters: {
            type: 'object',
            properties: {},
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'get_my_hippodromes',
          description: 'Obtenir la liste des hippodromes où l\'utilisateur a parié',
          parameters: {
            type: 'object',
            properties: {},
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'get_hippodrome_stats',
          description: 'Obtenir les statistiques détaillées d\'un hippodrome spécifique (paris, taux de réussite, profit)',
          parameters: {
            type: 'object',
            properties: {
              code: {
                type: 'string',
                description: 'Code de l\'hippodrome (ex: "ENGHIEN", "SAINT-CLOUD")',
              },
            },
            required: ['code'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'get_my_bet_horses',
          description: 'Obtenir les performances des chevaux sur lesquels l\'utilisateur a parié',
          parameters: {
            type: 'object',
            properties: {},
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'get_my_jockey_stats',
          description: 'Obtenir les statistiques des jockeys présents dans les courses où l\'utilisateur a parié',
          parameters: {
            type: 'object',
            properties: {},
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'get_my_horse_jockey_combinations',
          description: 'Obtenir les meilleures combinaisons cheval-jockey dans les paris de l\'utilisateur',
          parameters: {
            type: 'object',
            properties: {},
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'get_my_cross_stats',
          description: 'Obtenir les statistiques croisées (hippodrome + jockey + cheval) des paris de l\'utilisateur',
          parameters: {
            type: 'object',
            properties: {},
          },
        },
      },
    ];
  }

  /**
   * Get system prompt for the support chatbot
   */
  private getSystemPrompt(): string {
    return `Tu es un assistant de support pour BetTracker Pro, une application de gestion de paris hippiques.

INFORMATIONS SUR L'APPLICATION:
- BetTracker Pro permet de suivre et analyser les paris hippiques
- Fonctionnalités principales: gestion des paris, statistiques, budget, notifications
- L'application propose différents types de paris: Simple Gagnant, Placé, Couplé, Trio, Quarté, Quinté, etc.
- Les utilisateurs peuvent gérer leur bankroll avec deux modes: déduction immédiate ou à la perte
- Système de notifications: Web, Push et Email
- Gestion de budget avec limites journalières, hebdomadaires et mensuelles
- Statistiques PMU avancées: hippodromes, chevaux, jockeys, combinaisons gagnantes
- Analyse des performances par hippodrome avec graphiques détaillés
- Suivi des meilleures combinaisons cheval-jockey
- Statistiques croisées (hippodrome + jockey + cheval)

TON RÔLE:
- Répondre aux questions sur l'utilisation de l'application
- Aider à résoudre les problèmes techniques
- Expliquer les fonctionnalités
- Être courtois, professionnel et concis
- Répondre TOUJOURS en français
- Si tu ne peux pas résoudre le problème, utilise l'outil create_support_ticket pour créer automatiquement un ticket

INSTRUCTIONS:
- Sois concis et précis
- Utilise des emojis pour rendre la conversation plus agréable
- Si l'utilisateur a un problème complexe, une demande spécifique, ou si tu ne peux pas l'aider, utilise l'outil create_support_ticket
- Lors de la création d'un ticket, génère un résumé clair et détaillé de la demande de l'utilisateur
- Choisis la bonne catégorie (technical/billing/feature_request/other) et priorité (low/normal/high/urgent)
- Ne donne jamais d'informations sur les paris ou de conseils de jeu
- Concentre-toi uniquement sur l'aide technique de l'application`;
  }

  /**
   * Execute a function call requested by the AI
   */
  private async executeFunction(
    functionName: string,
    args: any,
    userId: string,
    conversationHistory: ChatMessage[] = [],
  ): Promise<string> {
    try {
      switch (functionName) {
        case 'get_user_stats':
          return await this.getUserStats(userId, args.period || 'all');
        case 'get_recent_bets':
          return await this.getRecentBets(userId, args.limit || 5);
        case 'get_budget_status':
          return await this.getBudgetStatus(userId);
        case 'get_user_settings':
          return await this.getUserSettings(userId);
        case 'create_support_ticket':
          return await this.createSupportTicket(userId, args, conversationHistory);
        case 'get_pmu_stats':
          return await this.getPmuStats(userId);
        case 'get_my_hippodromes':
          return await this.getMyHippodromes(userId);
        case 'get_hippodrome_stats':
          return await this.getHippodromeStats(userId, args.code);
        case 'get_my_bet_horses':
          return await this.getMyBetHorses(userId);
        case 'get_my_jockey_stats':
          return await this.getMyJockeyStats(userId);
        case 'get_my_horse_jockey_combinations':
          return await this.getMyHorseJockeyCombinations(userId);
        case 'get_my_cross_stats':
          return await this.getMyCrossStats(userId);
        default:
          return JSON.stringify({ error: 'Function not found' });
      }
    } catch (error) {
      this.logger.error(`Error executing function ${functionName}:`, error);
      return JSON.stringify({ error: error.message });
    }
  }

  /**
   * Get user statistics
   */
  private async getUserStats(userId: string, period: string): Promise<string> {
    const now = new Date();
    let startDate: Date | undefined;

    if (period === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (period === 'week') {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
    }

    const where: any = { userId };
    if (startDate) {
      where.date = { gte: startDate };
    }

    const bets = await this.prisma.bet.findMany({ where });

    const total = bets.length;
    const won = bets.filter((b) => b.status === 'won').length;
    const lost = bets.filter((b) => b.status === 'lost').length;
    const pending = bets.filter((b) => b.status === 'pending').length;

    const totalStake = bets.reduce((sum, b) => sum + Number(b.stake), 0);
    const totalProfit = bets.reduce((sum, b) => sum + Number(b.profit || 0), 0);
    const winRate = total > 0 ? ((won / (won + lost)) * 100).toFixed(1) : '0';

    return JSON.stringify({
      period,
      total_bets: total,
      won,
      lost,
      pending,
      win_rate: `${winRate}%`,
      total_stake: `${totalStake.toFixed(2)}€`,
      total_profit: `${totalProfit.toFixed(2)}€`,
      roi: total > 0 ? `${((totalProfit / totalStake) * 100).toFixed(1)}%` : '0%',
    });
  }

  /**
   * Get recent bets
   */
  private async getRecentBets(userId: string, limit: number): Promise<string> {
    const bets = await this.prisma.bet.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: Math.min(limit, 10),
      select: {
        date: true,
        hippodrome: true,
        raceNumber: true,
        betType: true,
        stake: true,
        odds: true,
        status: true,
        profit: true,
      },
    });

    return JSON.stringify(
      bets.map((b) => ({
        date: b.date.toISOString().split('T')[0],
        hippodrome: b.hippodrome,
        race: b.raceNumber,
        type: b.betType,
        stake: `${Number(b.stake).toFixed(2)}€`,
        odds: b.odds ? Number(b.odds).toFixed(2) : null,
        status: b.status,
        profit: b.profit ? `${Number(b.profit).toFixed(2)}€` : null,
      })),
    );
  }

  /**
   * Get budget status
   */
  private async getBudgetStatus(userId: string): Promise<string> {
    const settings = await this.prisma.userSettings.findUnique({
      where: { userId },
    });

    if (!settings) {
      return JSON.stringify({ error: 'No budget settings found' });
    }

    // Calculate current period spending
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const dailyBets = await this.prisma.bet.findMany({
      where: { userId, date: { gte: startOfDay } },
    });
    const weeklyBets = await this.prisma.bet.findMany({
      where: { userId, date: { gte: startOfWeek } },
    });
    const monthlyBets = await this.prisma.bet.findMany({
      where: { userId, date: { gte: startOfMonth } },
    });

    const dailySpent = dailyBets.reduce((sum, b) => sum + Number(b.stake), 0);
    const weeklySpent = weeklyBets.reduce((sum, b) => sum + Number(b.stake), 0);
    const monthlySpent = monthlyBets.reduce((sum, b) => sum + Number(b.stake), 0);

    return JSON.stringify({
      daily: {
        limit: settings.dailyLimit ? `${Number(settings.dailyLimit).toFixed(2)}€` : 'Aucune',
        spent: `${dailySpent.toFixed(2)}€`,
        remaining: settings.dailyLimit
          ? `${(Number(settings.dailyLimit) - dailySpent).toFixed(2)}€`
          : 'Illimité',
      },
      weekly: {
        limit: settings.weeklyLimit ? `${Number(settings.weeklyLimit).toFixed(2)}€` : 'Aucune',
        spent: `${weeklySpent.toFixed(2)}€`,
        remaining: settings.weeklyLimit
          ? `${(Number(settings.weeklyLimit) - weeklySpent).toFixed(2)}€`
          : 'Illimité',
      },
      monthly: {
        limit: settings.monthlyLimit ? `${Number(settings.monthlyLimit).toFixed(2)}€` : 'Aucune',
        spent: `${monthlySpent.toFixed(2)}€`,
        remaining: settings.monthlyLimit
          ? `${(Number(settings.monthlyLimit) - monthlySpent).toFixed(2)}€`
          : 'Illimité',
      },
      current_bankroll: settings.currentBankroll
        ? `${Number(settings.currentBankroll).toFixed(2)}€`
        : 'Non défini',
    });
  }

  /**
   * Create a support ticket
   */
  private async createSupportTicket(
    userId: string,
    args: {
      subject: string;
      category: 'technical' | 'billing' | 'feature_request' | 'other';
      priority: 'low' | 'normal' | 'high' | 'urgent';
      summary: string;
    },
    conversationHistory: ChatMessage[] = [],
  ): Promise<string> {
    try {
      // Créer le ticket via Prisma
      const ticket = await this.prisma.supportTicket.create({
        data: {
          userId,
          subject: args.subject,
          category: args.category,
          priority: args.priority,
          status: 'new',
        },
      });

      // Formater l'historique de conversation
      const conversationText = conversationHistory
        .map((msg) => {
          const role = msg.role === 'user' ? 'Utilisateur' : 'Assistant';
          return `**${role}:** ${msg.content}`;
        })
        .join('\n\n');

      // Construire le message complet avec résumé et historique
      const fullMessage = `${args.summary}\n\n---\n\n**Historique de la conversation:**\n\n${conversationText}`;

      // Ajouter le premier message avec le résumé et la conversation
      await this.prisma.supportMessage.create({
        data: {
          ticketId: ticket.id,
          userId,
          message: fullMessage,
          isInternalNote: false,
        },
      });

      this.logger.log(`Ticket ${ticket.id} créé par l'IA pour l'utilisateur ${userId}`);

      return JSON.stringify({
        success: true,
        ticket_id: ticket.id,
        message: `Ticket créé avec succès (ID: ${ticket.id.substring(0, 8)}). Notre équipe vous répondra bientôt.`,
      });
    } catch (error) {
      this.logger.error('Error creating support ticket:', error);
      return JSON.stringify({
        success: false,
        error: 'Impossible de créer le ticket. Veuillez réessayer.',
      });
    }
  }

  /**
   * Get user settings
   */
  private async getUserSettings(userId: string): Promise<string> {
    const settings = await this.prisma.userSettings.findUnique({
      where: { userId },
    });

    if (!settings) {
      return JSON.stringify({ error: 'No settings found' });
    }

    return JSON.stringify({
      bankroll_mode: settings.bankrollMode,
      notifications_enabled: settings.notificationsEnabled,
      push_notifications: settings.pushNotificationsEnabled,
      notification_preference: settings.notificationPreference,
      theme: settings.theme,
      currency: settings.currency,
    });
  }

  /**
   * Chat with the AI assistant
   */
  async chat(
    userMessage: string,
    conversationHistory: ChatMessage[] = [],
    userId?: string,
  ): Promise<{ message: string; suggestTicket: boolean }> {
    // Demo mode - return predefined responses
    if (!this.isConfigured) {
      return this.getDemoResponse(userMessage);
    }

    try {
      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        { role: 'system', content: this.getSystemPrompt() },
        ...conversationHistory.map((msg) => ({
          role: msg.role as 'user' | 'assistant' | 'system',
          content: msg.content,
        })),
        { role: 'user', content: userMessage },
      ];

      // First API call with tools
      let completion = await this.openai!.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: messages,
        tools: userId ? this.getTools() : undefined,
        tool_choice: userId ? 'auto' : undefined,
        temperature: 0.7,
        max_tokens: 500,
      });

      let responseMessage = completion.choices[0].message;

      // Handle function calls
      while (responseMessage.tool_calls && userId) {
        // Add assistant's response with tool calls to messages
        messages.push(responseMessage as any);

        // Execute each tool call
        for (const toolCall of responseMessage.tool_calls) {
          // Type guard to check if it's a function tool call
          if (toolCall.type !== 'function') continue;

          const functionName = (toolCall as any).function.name;
          const functionArgs = JSON.parse((toolCall as any).function.arguments);

          this.logger.debug(`Executing function: ${functionName} with args:`, functionArgs);

          const functionResult = await this.executeFunction(
            functionName,
            functionArgs,
            userId,
            conversationHistory,
          );

          // Add function result to messages
          messages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: functionResult,
          } as any);
        }

        // Get final response from AI with function results
        completion = await this.openai!.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: messages,
          temperature: 0.7,
          max_tokens: 500,
        });

        responseMessage = completion.choices[0].message;
      }

      const finalMessage = responseMessage.content || 
        'Désolé, je n\'ai pas pu générer une réponse. Voulez-vous créer un ticket de support ?';

      // Déterminer si on doit suggérer un ticket
      const suggestTicket = this.shouldSuggestTicket(userMessage, finalMessage);

      return {
        message: finalMessage,
        suggestTicket,
      };
    } catch (error) {
      this.logger.error('Failed to get AI response:', error);
      return {
        message: 'Désolé, une erreur s\'est produite. Voulez-vous créer un ticket de support pour obtenir de l\'aide ?',
        suggestTicket: true,
      };
    }
  }

  /**
   * Determine if we should suggest creating a ticket
   */
  private shouldSuggestTicket(userMessage: string, aiResponse: string): boolean {
    const ticketKeywords = [
      'bug',
      'erreur',
      'ne fonctionne pas',
      'problème',
      'crash',
      'perte de données',
      'remboursement',
      'facturation',
      'abonnement',
    ];

    const lowerUserMessage = userMessage.toLowerCase();
    const lowerAiResponse = aiResponse.toLowerCase();

    // Suggérer un ticket si le message contient des mots-clés critiques
    const hasCriticalKeyword = ticketKeywords.some(
      (keyword) => lowerUserMessage.includes(keyword),
    );

    // Ou si l'IA mentionne de créer un ticket
    const aiSuggestsTicket = lowerAiResponse.includes('ticket') || 
                             lowerAiResponse.includes('support');

    return hasCriticalKeyword || aiSuggestsTicket;
  }

  /**
   * Get demo response when OpenAI is not configured
   */
  private getDemoResponse(userMessage: string): { message: string; suggestTicket: boolean } {
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('comment') || lowerMessage.includes('aide')) {
      return {
        message: '👋 Je peux vous aider avec BetTracker Pro ! Voici ce que je peux faire:\n\n' +
                 '• Expliquer les fonctionnalités\n' +
                 '• Vous guider dans l\'utilisation\n' +
                 '• Résoudre des problèmes techniques\n\n' +
                 'Quelle est votre question ?',
        suggestTicket: false,
      };
    }

    if (lowerMessage.includes('pari') || lowerMessage.includes('bet')) {
      return {
        message: '🎯 Pour créer un pari:\n\n' +
                 '1. Allez sur la page "Paris"\n' +
                 '2. Cliquez sur "Nouveau pari"\n' +
                 '3. Remplissez les informations (hippodrome, course, chevaux, mise)\n' +
                 '4. Validez !\n\n' +
                 'Vous pouvez aussi utiliser le mode "Saisie rapide" pour aller plus vite.',
        suggestTicket: false,
      };
    }

    if (lowerMessage.includes('notification')) {
      return {
        message: '🔔 Les notifications sont disponibles en 3 modes:\n\n' +
                 '• Web uniquement (dans l\'app)\n' +
                 '• Email uniquement\n' +
                 '• Les deux (Web + Push + Email)\n\n' +
                 'Configurez vos préférences dans Paramètres > Notifications.',
        suggestTicket: false,
      };
    }

    if (lowerMessage.includes('bug') || lowerMessage.includes('erreur') || lowerMessage.includes('problème')) {
      return {
        message: '😔 Je suis désolé que vous rencontriez un problème. Pour une assistance personnalisée, ' +
                 'je vous recommande de créer un ticket de support. Notre équipe vous répondra rapidement !',
        suggestTicket: true,
      };
    }

    return {
      message: '🤖 Je suis en mode DEMO (OpenAI non configuré). Je peux répondre à des questions basiques sur:\n\n' +
               '• La création de paris\n' +
               '• Les notifications\n' +
               '• La gestion du budget\n\n' +
               'Pour une aide plus détaillée, n\'hésitez pas à créer un ticket de support !',
      suggestTicket: false,
    };
  }

  /**
   * PMU Tools - Mode lecture uniquement
   */
  private async getPmuStats(userId: string): Promise<string> {
    const stats = await this.prisma.bet.findMany({
      where: { userId, pmuRaceId: { not: null } },
    });
    
    const hippodromes = await this.prisma.pmuHippodrome.count();
    const races = await this.prisma.pmuRace.count();
    
    return JSON.stringify({
      hippodromes_suivis: hippodromes,
      courses_enregistrees: races,
      paris_pmu: stats.length,
    });
  }

  private async getMyHippodromes(userId: string): Promise<string> {
    const bets = await this.prisma.bet.findMany({
      where: { userId, pmuRaceId: { not: null } },
      include: { pmuRace: { include: { hippodrome: true } } },
    });

    const hippodromeMap = new Map();
    bets.forEach(bet => {
      if (bet.pmuRace?.hippodrome) {
        const code = bet.pmuRace.hippodrome.code;
        hippodromeMap.set(code, {
          code,
          name: bet.pmuRace.hippodrome.name,
          count: (hippodromeMap.get(code)?.count || 0) + 1,
        });
      }
    });

    return JSON.stringify({
      total: hippodromeMap.size,
      hippodromes: Array.from(hippodromeMap.values()),
    });
  }

  private async getHippodromeStats(userId: string, code: string): Promise<string> {
    const bets = await this.prisma.bet.findMany({
      where: {
        userId,
        pmuRace: {
          hippodrome: { code },
        },
      },
    });

    const won = bets.filter(b => b.status === 'won').length;
    const lost = bets.filter(b => b.status === 'lost').length;
    const totalStake = bets.reduce((sum, b) => sum + Number(b.stake), 0);
    const totalProfit = bets.reduce((sum, b) => sum + Number(b.profit || 0), 0);

    return JSON.stringify({
      hippodrome: code,
      total_paris: bets.length,
      gagnés: won,
      perdus: lost,
      taux_reussite: bets.length > 0 ? `${((won / (won + lost)) * 100).toFixed(1)}%` : '0%',
      profit_total: `${totalProfit.toFixed(2)}€`,
      roi: totalStake > 0 ? `${((totalProfit / totalStake) * 100).toFixed(1)}%` : '0%',
    });
  }

  private async getMyBetHorses(userId: string): Promise<string> {
    try {
      // Récupérer les IDs des courses où l'utilisateur a parié
      const userBets = await this.prisma.bet.findMany({
        where: { userId, pmuRaceId: { not: null } },
        select: { pmuRaceId: true },
      });

      const raceIds = [...new Set(userBets.map(b => b.pmuRaceId).filter(Boolean))];
      if (raceIds.length === 0) {
        return JSON.stringify({ message: 'Aucun pari PMU trouvé' });
      }

      // Récupérer les performances
      const performances = await this.prisma.pmuHorsePerformance.findMany({
        where: {
          arrivalPosition: { not: null },
          horse: { raceId: { in: raceIds as string[] } },
        },
        include: { horse: { select: { name: true } } },
      });

      // Agréger par cheval
      const horseMap = new Map();
      performances.forEach(perf => {
        const name = perf.horse.name;
        if (!horseMap.has(name)) {
          horseMap.set(name, { totalRaces: 0, wins: 0, podiums: 0, totalPosition: 0 });
        }
        const stats = horseMap.get(name);
        stats.totalRaces++;
        stats.totalPosition += perf.arrivalPosition!;
        if (perf.arrivalPosition === 1) stats.wins++;
        if (perf.arrivalPosition! <= 3) stats.podiums++;
      });

      const horses = Array.from(horseMap.entries())
        .map(([name, stats]) => ({
          nom: name,
          courses: stats.totalRaces,
          victoires: stats.wins,
          podiums: stats.podiums,
          taux_victoire: `${((stats.wins / stats.totalRaces) * 100).toFixed(1)}%`,
          position_moyenne: (stats.totalPosition / stats.totalRaces).toFixed(1),
        }))
        .sort((a, b) => parseFloat(b.taux_victoire) - parseFloat(a.taux_victoire))
        .slice(0, 10);

      return JSON.stringify({ total: horseMap.size, top_10_chevaux: horses });
    } catch (error) {
      return JSON.stringify({ error: 'Impossible de récupérer les données des chevaux' });
    }
  }

  private async getMyJockeyStats(userId: string): Promise<string> {
    try {
      const userBets = await this.prisma.bet.findMany({
        where: { userId, pmuRaceId: { not: null } },
        select: { pmuRaceId: true },
      });

      const raceIds = [...new Set(userBets.map(b => b.pmuRaceId).filter(Boolean))];
      if (raceIds.length === 0) {
        return JSON.stringify({ message: 'Aucun pari PMU trouvé' });
      }

      const performances = await this.prisma.pmuHorsePerformance.findMany({
        where: {
          jockey: { not: null },
          arrivalPosition: { not: null },
          horse: { raceId: { in: raceIds as string[] } },
        },
        select: { jockey: true, arrivalPosition: true },
      });

      const jockeyMap = new Map();
      performances.forEach(perf => {
        const jockey = perf.jockey!;
        if (!jockeyMap.has(jockey)) {
          jockeyMap.set(jockey, { totalRaces: 0, wins: 0, podiums: 0, totalPosition: 0 });
        }
        const stats = jockeyMap.get(jockey);
        stats.totalRaces++;
        stats.totalPosition += perf.arrivalPosition!;
        if (perf.arrivalPosition === 1) stats.wins++;
        if (perf.arrivalPosition! <= 3) stats.podiums++;
      });

      const jockeys = Array.from(jockeyMap.entries())
        .map(([name, stats]) => ({
          nom: name,
          courses: stats.totalRaces,
          victoires: stats.wins,
          podiums: stats.podiums,
          taux_victoire: `${((stats.wins / stats.totalRaces) * 100).toFixed(1)}%`,
          taux_podium: `${((stats.podiums / stats.totalRaces) * 100).toFixed(1)}%`,
          position_moyenne: (stats.totalPosition / stats.totalRaces).toFixed(1),
        }))
        .filter(j => j.courses >= 1)
        .sort((a, b) => parseFloat(b.taux_victoire) - parseFloat(a.taux_victoire))
        .slice(0, 10);

      return JSON.stringify({ total: jockeyMap.size, top_10_jockeys: jockeys });
    } catch (error) {
      return JSON.stringify({ error: 'Impossible de récupérer les statistiques des jockeys' });
    }
  }

  private async getMyHorseJockeyCombinations(userId: string): Promise<string> {
    try {
      const userBets = await this.prisma.bet.findMany({
        where: { userId, pmuRaceId: { not: null } },
        select: { pmuRaceId: true },
      });

      const raceIds = [...new Set(userBets.map(b => b.pmuRaceId).filter(Boolean))];
      if (raceIds.length === 0) {
        return JSON.stringify({ message: 'Aucun pari PMU trouvé' });
      }

      const performances = await this.prisma.pmuHorsePerformance.findMany({
        where: {
          jockey: { not: null },
          arrivalPosition: { not: null },
          horse: { raceId: { in: raceIds as string[] } },
        },
        include: { horse: { select: { name: true } } },
      });

      const comboMap = new Map();
      performances.forEach(perf => {
        const key = `${perf.horse.name}|${perf.jockey}`;
        if (!comboMap.has(key)) {
          comboMap.set(key, {
            horseName: perf.horse.name,
            jockey: perf.jockey!,
            totalRaces: 0,
            wins: 0,
            podiums: 0,
            totalPosition: 0,
          });
        }
        const stats = comboMap.get(key);
        stats.totalRaces++;
        stats.totalPosition += perf.arrivalPosition!;
        if (perf.arrivalPosition === 1) stats.wins++;
        if (perf.arrivalPosition! <= 3) stats.podiums++;
      });

      const combos = Array.from(comboMap.values())
        .map(stats => ({
          cheval: stats.horseName,
          jockey: stats.jockey,
          courses_ensemble: stats.totalRaces,
          victoires: stats.wins,
          podiums: stats.podiums,
          taux_victoire: `${((stats.wins / stats.totalRaces) * 100).toFixed(1)}%`,
          taux_podium: `${((stats.podiums / stats.totalRaces) * 100).toFixed(1)}%`,
          position_moyenne: (stats.totalPosition / stats.totalRaces).toFixed(1),
        }))
        .filter(c => c.courses_ensemble >= 1)
        .sort((a, b) => parseFloat(b.taux_victoire) - parseFloat(a.taux_victoire))
        .slice(0, 10);

      return JSON.stringify({ total: comboMap.size, top_10_combinaisons: combos });
    } catch (error) {
      return JSON.stringify({ error: 'Impossible de récupérer les combinaisons' });
    }
  }

  private async getMyCrossStats(userId: string): Promise<string> {
    try {
      const userBets = await this.prisma.bet.findMany({
        where: { userId, pmuRaceId: { not: null } },
        select: { pmuRaceId: true },
      });

      const raceIds = [...new Set(userBets.map(b => b.pmuRaceId).filter(Boolean))];
      if (raceIds.length === 0) {
        return JSON.stringify({ message: 'Aucun pari PMU trouvé' });
      }

      const performances = await this.prisma.pmuHorsePerformance.findMany({
        where: {
          jockey: { not: null },
          arrivalPosition: { not: null },
          horse: { raceId: { in: raceIds as string[] } },
        },
        include: { horse: { select: { name: true } } },
      });

      // Triple combinations (Hippodrome + Jockey + Horse)
      const tripleMap = new Map();
      performances.forEach(perf => {
        const key = `${perf.hippodrome}|${perf.jockey}|${perf.horse.name}`;
        if (!tripleMap.has(key)) {
          tripleMap.set(key, {
            hippodrome: perf.hippodrome,
            jockey: perf.jockey!,
            horseName: perf.horse.name,
            totalRaces: 0,
            wins: 0,
            podiums: 0,
            totalPosition: 0,
          });
        }
        const stats = tripleMap.get(key);
        stats.totalRaces++;
        stats.totalPosition += perf.arrivalPosition!;
        if (perf.arrivalPosition === 1) stats.wins++;
        if (perf.arrivalPosition! <= 3) stats.podiums++;
      });

      const triples = Array.from(tripleMap.values())
        .map(stats => ({
          hippodrome: stats.hippodrome,
          jockey: stats.jockey,
          cheval: stats.horseName,
          courses: stats.totalRaces,
          victoires: stats.wins,
          podiums: stats.podiums,
          taux_victoire: `${((stats.wins / stats.totalRaces) * 100).toFixed(1)}%`,
          position_moyenne: (stats.totalPosition / stats.totalRaces).toFixed(1),
        }))
        .sort((a, b) => parseFloat(b.taux_victoire) - parseFloat(a.taux_victoire))
        .slice(0, 10);

      // Hippodrome + Jockey combinations
      const hippoJockeyMap = new Map();
      performances.forEach(perf => {
        const key = `${perf.hippodrome}|${perf.jockey}`;
        if (!hippoJockeyMap.has(key)) {
          hippoJockeyMap.set(key, {
            hippodrome: perf.hippodrome,
            jockey: perf.jockey!,
            totalRaces: 0,
            wins: 0,
          });
        }
        const stats = hippoJockeyMap.get(key);
        stats.totalRaces++;
        if (perf.arrivalPosition === 1) stats.wins++;
      });

      const bestHippoJockey = Array.from(hippoJockeyMap.values())
        .map(stats => ({
          hippodrome: stats.hippodrome,
          jockey: stats.jockey,
          courses: stats.totalRaces,
          victoires: stats.wins,
          taux_victoire: `${((stats.wins / stats.totalRaces) * 100).toFixed(1)}%`,
        }))
        .sort((a, b) => parseFloat(b.taux_victoire) - parseFloat(a.taux_victoire))
        .slice(0, 5);

      return JSON.stringify({
        total_combinaisons_completes: tripleMap.size,
        top_10_combinaisons_completes: triples,
        top_5_hippodrome_jockey: bestHippoJockey,
      });
    } catch (error) {
      return JSON.stringify({ error: 'Impossible de récupérer les statistiques croisées' });
    }
  }
}
