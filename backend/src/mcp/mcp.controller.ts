import { Controller, Post, Get, Body, Headers, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader } from '@nestjs/swagger';
import { UserSettingsService } from '../user-settings/user-settings.service';
import { AiChatService } from '../support/ai-chat.service';

@ApiTags('MCP Server')
@Controller('mcp')
export class McpController {
  constructor(
    private userSettingsService: UserSettingsService,
    private aiChatService: AiChatService,
  ) {}

  @Get('tools')
  @ApiOperation({ summary: 'List all available MCP tools' })
  @ApiHeader({ name: 'X-API-Key', required: true })
  async listTools(@Headers('x-api-key') apiKey: string) {
    // Validate API key
    if (!apiKey) {
      throw new HttpException('API key required', HttpStatus.UNAUTHORIZED);
    }

    const userId = await this.userSettingsService.verifyApiKey(apiKey);
    if (!userId) {
      throw new HttpException('Invalid API key', HttpStatus.UNAUTHORIZED);
    }

    return {
      tools: [
        {
          name: 'get_user_stats',
          description: 'Obtenir les statistiques de paris de l\'utilisateur (nombre de paris, taux de réussite, profit total, ROI)',
          inputSchema: {
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
        {
          name: 'get_recent_bets',
          description: 'Obtenir les derniers paris de l\'utilisateur',
          inputSchema: {
            type: 'object',
            properties: {
              limit: {
                type: 'number',
                description: 'Nombre de paris à récupérer (max 10)',
                default: 5,
              },
            },
          },
        },
        {
          name: 'get_budget_status',
          description: 'Obtenir l\'état actuel du budget de l\'utilisateur (limites, dépenses, reste disponible)',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'get_user_settings',
          description: 'Obtenir les paramètres de l\'utilisateur (mode bankroll, notifications, etc.)',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'get_pmu_stats',
          description: 'Obtenir les statistiques PMU de l\'utilisateur (hippodromes, courses, chevaux pariés)',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'get_my_hippodromes',
          description: 'Obtenir la liste des hippodromes où l\'utilisateur a parié',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'get_hippodrome_stats',
          description: 'Obtenir les statistiques détaillées d\'un hippodrome spécifique (paris, taux de réussite, profit)',
          inputSchema: {
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
        {
          name: 'get_my_bet_horses',
          description: 'Obtenir les performances des chevaux sur lesquels l\'utilisateur a parié',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'get_my_jockey_stats',
          description: 'Obtenir les statistiques des jockeys présents dans les courses où l\'utilisateur a parié',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'get_my_horse_jockey_combinations',
          description: 'Obtenir les meilleures combinaisons cheval-jockey dans les paris de l\'utilisateur',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'get_my_cross_stats',
          description: 'Obtenir les statistiques croisées (hippodrome + jockey + cheval) des paris de l\'utilisateur',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
      ],
    };
  }

  @Post('call-tool')
  @ApiOperation({ summary: 'Execute an MCP tool' })
  @ApiHeader({ name: 'X-API-Key', required: true })
  async callTool(
    @Headers('x-api-key') apiKey: string,
    @Body() body: { name: string; arguments?: any },
  ) {
    // Validate API key
    if (!apiKey) {
      throw new HttpException('API key required', HttpStatus.UNAUTHORIZED);
    }

    const userId = await this.userSettingsService.verifyApiKey(apiKey);
    if (!userId) {
      throw new HttpException('Invalid API key', HttpStatus.UNAUTHORIZED);
    }

    const { name, arguments: args } = body;

    if (!name) {
      throw new HttpException('Tool name is required', HttpStatus.BAD_REQUEST);
    }

    try {
      // Map tool names to internal function names
      const toolMap: Record<string, string> = {
        get_user_stats: 'getUserStats',
        get_recent_bets: 'getRecentBets',
        get_budget_status: 'getBudgetStatus',
        get_user_settings: 'getUserSettings',
        get_pmu_stats: 'getPmuStats',
        get_my_hippodromes: 'getMyHippodromes',
        get_hippodrome_stats: 'getHippodromeStats',
        get_my_bet_horses: 'getMyBetHorses',
        get_my_jockey_stats: 'getMyJockeyStats',
        get_my_horse_jockey_combinations: 'getMyHorseJockeyCombinations',
        get_my_cross_stats: 'getMyCrossStats',
      };

      const functionName = toolMap[name];
      if (!functionName) {
        throw new HttpException(`Unknown tool: ${name}`, HttpStatus.BAD_REQUEST);
      }

      // Execute the tool
      const result = await (this.aiChatService as any)[functionName](userId, args);

      return {
        content: [
          {
            type: 'text',
            text: result,
          },
        ],
      };
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Error executing tool',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
