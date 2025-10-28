#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

const API_URL = process.env.BETTRACKER_API_URL || 'http://localhost:3001';
const API_KEY = process.env.BETTRACKER_API_KEY || '';

// Create axios instance with auth
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    ...(API_KEY && { 'Authorization': `Bearer ${API_KEY}` }),
  },
});

// Define all available tools
const tools: Tool[] = [
  {
    name: 'get_user_stats',
    description: 'Obtenir les statistiques de paris de l\'utilisateur (nombre de paris, taux de réussite, profit total)',
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
];

// Create server instance
const server = new Server(
  {
    name: 'bettracker-pro',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Handle tool listing
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result;

    switch (name) {
      case 'get_user_stats':
        result = await api.post('/support/ai-chat', {
          message: `get_user_stats:${args?.period || 'all'}`,
        });
        break;

      case 'get_recent_bets':
        result = await api.post('/support/ai-chat', {
          message: `get_recent_bets:${args?.limit || 5}`,
        });
        break;

      case 'get_budget_status':
        result = await api.post('/support/ai-chat', {
          message: 'get_budget_status',
        });
        break;

      case 'get_user_settings':
        result = await api.post('/support/ai-chat', {
          message: 'get_user_settings',
        });
        break;

      case 'get_pmu_stats':
        result = await api.post('/support/ai-chat', {
          message: 'get_pmu_stats',
        });
        break;

      case 'get_my_hippodromes':
        result = await api.post('/support/ai-chat', {
          message: 'get_my_hippodromes',
        });
        break;

      case 'get_hippodrome_stats':
        result = await api.post('/support/ai-chat', {
          message: `get_hippodrome_stats:${args?.code}`,
        });
        break;

      case 'get_my_bet_horses':
        result = await api.post('/support/ai-chat', {
          message: 'get_my_bet_horses',
        });
        break;

      case 'get_my_jockey_stats':
        result = await api.post('/support/ai-chat', {
          message: 'get_my_jockey_stats',
        });
        break;

      case 'get_my_horse_jockey_combinations':
        result = await api.post('/support/ai-chat', {
          message: 'get_my_horse_jockey_combinations',
        });
        break;

      case 'get_my_cross_stats':
        result = await api.post('/support/ai-chat', {
          message: 'get_my_cross_stats',
        });
        break;

      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result.data, null, 2),
        },
      ],
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('BetTracker Pro MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
