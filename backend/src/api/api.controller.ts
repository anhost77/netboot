import { Controller, Post, Get, Body, Headers, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { AiChatService } from '../support/ai-chat.service';
import { UserSettingsService } from '../user-settings/user-settings.service';

interface ToolExecuteRequest {
  tool: string;
  arguments?: any;
  userId?: string; // Optional, will be extracted from API key if not provided
}

@ApiTags('API Tools')
@Controller('v1')
export class ApiController {
  constructor(
    private aiChatService: AiChatService,
    private userSettingsService: UserSettingsService,
  ) {}

  @Post('tools/execute')
  @ApiOperation({ summary: 'Execute a specific tool' })
  @ApiBearerAuth()
  @ApiHeader({ name: 'X-API-Key', required: true })
  async executeTool(
    @Body() body: ToolExecuteRequest,
    @Headers('x-api-key') apiKey: string,
  ) {
    // Validate API key and get userId
    if (!apiKey) {
      throw new HttpException('API key is required', HttpStatus.UNAUTHORIZED);
    }

    const userId = await this.userSettingsService.verifyApiKey(apiKey);
    if (!userId) {
      throw new HttpException('Invalid API key', HttpStatus.UNAUTHORIZED);
    }

    const { tool, arguments: args } = body;

    if (!tool) {
      throw new HttpException('Tool is required', HttpStatus.BAD_REQUEST);
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

      const functionName = toolMap[tool];
      if (!functionName) {
        throw new HttpException(`Unknown tool: ${tool}`, HttpStatus.BAD_REQUEST);
      }

      // Execute the tool via AiChatService
      const result = await (this.aiChatService as any)[functionName](userId, args);
      
      return {
        success: true,
        tool,
        data: JSON.parse(result),
      };
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Error executing tool',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('tools/list')
  @ApiOperation({ summary: 'List all available tools' })
  @ApiBearerAuth()
  @ApiHeader({ name: 'X-API-Key', required: true })
  async listTools(@Headers('x-api-key') apiKey: string) {
    // Validate API key
    if (!apiKey) {
      throw new HttpException('API key is required', HttpStatus.UNAUTHORIZED);
    }

    const userId = await this.userSettingsService.verifyApiKey(apiKey);
    if (!userId) {
      throw new HttpException('Invalid API key', HttpStatus.UNAUTHORIZED);
    }

    return {
      tools: [
        {
          name: 'get_user_stats',
          description: 'Obtenir les statistiques de paris de l\'utilisateur',
          parameters: {
            period: { type: 'string', enum: ['all', 'month', 'week'] },
          },
        },
        {
          name: 'get_recent_bets',
          description: 'Obtenir les derniers paris de l\'utilisateur',
          parameters: {
            limit: { type: 'number', default: 5, max: 10 },
          },
        },
        {
          name: 'get_budget_status',
          description: 'Obtenir l\'état actuel du budget',
          parameters: {},
        },
        {
          name: 'get_user_settings',
          description: 'Obtenir les paramètres de l\'utilisateur',
          parameters: {},
        },
        {
          name: 'get_pmu_stats',
          description: 'Obtenir les statistiques PMU globales',
          parameters: {},
        },
        {
          name: 'get_my_hippodromes',
          description: 'Obtenir la liste des hippodromes',
          parameters: {},
        },
        {
          name: 'get_hippodrome_stats',
          description: 'Obtenir les statistiques d\'un hippodrome',
          parameters: {
            code: { type: 'string', required: true },
          },
        },
        {
          name: 'get_my_bet_horses',
          description: 'Obtenir les performances des chevaux',
          parameters: {},
        },
        {
          name: 'get_my_jockey_stats',
          description: 'Obtenir les statistiques des jockeys',
          parameters: {},
        },
        {
          name: 'get_my_horse_jockey_combinations',
          description: 'Obtenir les meilleures combinaisons cheval-jockey',
          parameters: {},
        },
        {
          name: 'get_my_cross_stats',
          description: 'Obtenir les statistiques croisées',
          parameters: {},
        },
      ],
    };
  }

  @Get('tools/documentation')
  @ApiOperation({ summary: 'Get API documentation' })
  async getDocumentation() {
    return {
      name: 'BetTracker Pro API',
      version: '1.0.0',
      description: 'API pour accéder aux outils de l\'assistant BetTracker Pro',
      authentication: {
        type: 'API Key',
        header: 'X-API-Key',
        description: 'Obtenez votre clé API dans les paramètres de votre compte',
      },
      endpoints: {
        execute: {
          method: 'POST',
          path: '/api/v1/tools/execute',
          description: 'Exécuter un outil spécifique',
          example: {
            tool: 'get_user_stats',
            arguments: { period: 'month' },
            userId: 'user-id-here',
          },
        },
        list: {
          method: 'GET',
          path: '/api/v1/tools/list',
          description: 'Lister tous les outils disponibles',
        },
      },
      examples: [
        {
          title: 'Obtenir les statistiques du mois',
          curl: `curl -X POST http://localhost:3001/api/v1/tools/execute \\
  -H "X-API-Key: your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{"tool":"get_user_stats","arguments":{"period":"month"},"userId":"user-123"}'`,
        },
        {
          title: 'Lister les hippodromes',
          curl: `curl -X POST http://localhost:3001/api/v1/tools/execute \\
  -H "X-API-Key: your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{"tool":"get_my_hippodromes","userId":"user-123"}'`,
        },
      ],
    };
  }
}
