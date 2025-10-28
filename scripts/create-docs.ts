/**
 * Script pour créer les pages de documentation dans le CMS
 * Usage: npx ts-node scripts/create-docs.ts
 */

import axios from 'axios';

const API_URL = 'http://localhost:3001/api';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'YOUR_ADMIN_JWT_TOKEN';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Authorization': `Bearer ${ADMIN_TOKEN}`,
    'Content-Type': 'application/json',
  },
});

const docs = [
  {
    title: 'Serveur MCP - Guide d\'installation',
    slug: 'mcp-server',
    excerpt: 'Installez et configurez le serveur MCP pour utiliser BetTracker Pro avec Claude Desktop',
    content: `
# 🤖 Serveur MCP - Guide d'installation

## Qu'est-ce que le serveur MCP ?

Le serveur MCP (Model Context Protocol) permet d'utiliser tous les outils BetTracker Pro directement dans Claude Desktop ou ChatGPT. Vous pouvez poser des questions en langage naturel et l'IA utilisera vos données en temps réel.

## 📋 Prérequis

- Node.js 18+ installé
- BetTracker Pro backend en cours d'exécution
- Une clé API BetTracker (générez-la dans vos paramètres)

## 🚀 Installation

### 1. Installation des dépendances

\`\`\`bash
cd mcp-server
npm install
npm run build
\`\`\`

### 2. Configuration

Créez un fichier \`.env\` :

\`\`\`env
BETTRACKER_API_URL=http://localhost:3001
BETTRACKER_API_KEY=votre_clé_api_ici
\`\`\`

### 3. Configuration Claude Desktop

**macOS** : Éditez \`~/Library/Application Support/Claude/claude_desktop_config.json\`

**Linux** : Éditez \`~/.config/Claude/claude_desktop_config.json\`

**Windows** : Éditez \`%APPDATA%\\Claude\\claude_desktop_config.json\`

Ajoutez cette configuration :

\`\`\`json
{
  "mcpServers": {
    "bettracker-pro": {
      "command": "node",
      "args": ["/chemin/absolu/vers/netboot/mcp-server/dist/index.js"],
      "env": {
        "BETTRACKER_API_URL": "http://localhost:3001",
        "BETTRACKER_API_KEY": "votre_clé_api"
      }
    }
  }
}
\`\`\`

### 4. Redémarrez Claude Desktop

Fermez complètement Claude Desktop et relancez-le.

## ✅ Test

Ouvrez Claude Desktop et tapez :

> "Montre-moi mes statistiques de paris du mois"

Claude devrait utiliser l'outil \`get_user_stats\` et vous afficher vos statistiques !

## 🛠️ Outils disponibles

Le serveur MCP expose 11 outils :

### Gestion des Paris
- \`get_user_stats\` - Statistiques de paris
- \`get_recent_bets\` - Derniers paris
- \`get_budget_status\` - État du budget
- \`get_user_settings\` - Paramètres

### Statistiques PMU
- \`get_pmu_stats\` - Vue d'ensemble PMU
- \`get_my_hippodromes\` - Liste des hippodromes
- \`get_hippodrome_stats\` - Stats par hippodrome
- \`get_my_bet_horses\` - Performances des chevaux
- \`get_my_jockey_stats\` - Stats des jockeys
- \`get_my_horse_jockey_combinations\` - Combinaisons
- \`get_my_cross_stats\` - Statistiques croisées

## 🐛 Dépannage

### Les outils ne s'affichent pas

1. Vérifiez le chemin absolu dans la configuration
2. Vérifiez que le backend est démarré
3. Consultez les logs : \`~/Library/Logs/Claude/mcp-server-bettracker-pro.log\`

### Erreur d'authentification

Vérifiez que votre clé API est correcte dans le fichier de configuration.

## 📚 Ressources

- [Documentation complète](https://github.com/bettracker/mcp-server)
- [Exemples d'utilisation](/docs/examples)
- [API REST](/docs/api)
`,
    status: 'published',
    seoTitle: 'Serveur MCP BetTracker Pro - Installation Claude Desktop',
    seoDescription: 'Guide complet pour installer et configurer le serveur MCP BetTracker Pro avec Claude Desktop',
    seoKeywords: 'mcp, claude desktop, bettracker, installation, configuration',
  },
  {
    title: 'API REST - Documentation',
    slug: 'api',
    excerpt: 'Documentation complète de l\'API REST BetTracker Pro pour créer vos propres intégrations',
    content: `
# 🌐 API REST - Documentation

## Introduction

L'API REST BetTracker Pro vous permet d'accéder à toutes vos données de paris depuis n'importe quelle application. Authentifiez-vous avec votre clé API et commencez à construire !

## 🔑 Authentification

Toutes les requêtes nécessitent une clé API dans le header :

\`\`\`
X-API-Key: btk_votre_clé_ici
\`\`\`

Générez votre clé API dans **Paramètres** > **Clé API**.

## 📡 Endpoints

### Base URL

\`\`\`
http://localhost:3001/api/v1
\`\`\`

### Lister les outils

\`\`\`bash
GET /tools/list
\`\`\`

**Réponse :**
\`\`\`json
{
  "tools": [
    {
      "name": "get_user_stats",
      "description": "Obtenir les statistiques de paris",
      "parameters": {
        "period": { "type": "string", "enum": ["all", "month", "week"] }
      }
    }
  ]
}
\`\`\`

### Exécuter un outil

\`\`\`bash
POST /tools/execute
Content-Type: application/json

{
  "tool": "get_user_stats",
  "arguments": {
    "period": "month"
  }
}
\`\`\`

**Réponse :**
\`\`\`json
{
  "success": true,
  "tool": "get_user_stats",
  "data": {
    "period": "month",
    "total_bets": 45,
    "won": 23,
    "lost": 18,
    "win_rate": "56.1%",
    "total_profit": "125.50€",
    "roi": "27.9%"
  }
}
\`\`\`

## 📝 Exemples

### JavaScript / Node.js

\`\`\`javascript
const API_KEY = 'btk_votre_clé';
const API_URL = 'http://localhost:3001/api/v1';

async function getUserStats() {
  const response = await fetch(\`\${API_URL}/tools/execute\`, {
    method: 'POST',
    headers: {
      'X-API-Key': API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      tool: 'get_user_stats',
      arguments: { period: 'month' }
    })
  });
  
  return response.json();
}
\`\`\`

### Python

\`\`\`python
import requests

API_KEY = 'btk_votre_clé'
API_URL = 'http://localhost:3001/api/v1'

def get_user_stats():
    response = requests.post(
        f'{API_URL}/tools/execute',
        headers={'X-API-Key': API_KEY},
        json={
            'tool': 'get_user_stats',
            'arguments': {'period': 'month'}
        }
    )
    return response.json()
\`\`\`

### cURL

\`\`\`bash
curl -X POST http://localhost:3001/api/v1/tools/execute \\
  -H "X-API-Key: btk_votre_clé" \\
  -H "Content-Type: application/json" \\
  -d '{"tool":"get_user_stats","arguments":{"period":"month"}}'
\`\`\`

## 🛡️ Sécurité

- ✅ Ne partagez jamais votre clé API
- ✅ Utilisez HTTPS en production
- ✅ Révoquez les clés compromises immédiatement
- ✅ Régénérez vos clés régulièrement

## 📊 Limites

- **Rate limit** : 100 requêtes / minute
- **Timeout** : 30 secondes par requête
- **Taille max** : 1 MB par requête

## 🔄 Codes d'erreur

| Code | Description |
|------|-------------|
| 200 | Succès |
| 400 | Requête invalide |
| 401 | Clé API invalide |
| 404 | Outil non trouvé |
| 429 | Trop de requêtes |
| 500 | Erreur serveur |

## 📚 Ressources

- [Serveur MCP](/docs/mcp-server)
- [Exemples de code](/docs/examples)
- [Intégration ChatGPT](/docs/chatgpt)
`,
    status: 'published',
    seoTitle: 'API REST BetTracker Pro - Documentation complète',
    seoDescription: 'Documentation de l\'API REST BetTracker Pro avec exemples en JavaScript, Python et cURL',
    seoKeywords: 'api rest, bettracker, documentation, javascript, python, curl',
  },
  {
    title: 'Intégration ChatGPT',
    slug: 'chatgpt',
    excerpt: 'Utilisez BetTracker Pro avec ChatGPT via Custom GPT ou l\'API OpenAI',
    content: `
# 💬 Intégration ChatGPT

## Méthode 1 : Custom GPT

### Créer un Custom GPT

1. Allez sur [chat.openai.com](https://chat.openai.com)
2. Cliquez sur votre nom > **My GPTs** > **Create a GPT**
3. Dans **Configure** :
   - **Name** : BetTracker Pro Assistant
   - **Description** : Assistant pour gérer vos paris hippiques
   - **Instructions** : Copiez le texte ci-dessous

### Instructions

\`\`\`
Tu es un assistant spécialisé dans l'analyse de paris hippiques avec BetTracker Pro.
Tu as accès à 11 outils pour aider l'utilisateur :

1. get_user_stats - Statistiques de paris
2. get_recent_bets - Derniers paris
3. get_budget_status - État du budget
4. get_user_settings - Paramètres
5. get_pmu_stats - Stats PMU globales
6. get_my_hippodromes - Liste des hippodromes
7. get_hippodrome_stats - Stats par hippodrome
8. get_my_bet_horses - Performances des chevaux
9. get_my_jockey_stats - Stats des jockeys
10. get_my_horse_jockey_combinations - Combinaisons
11. get_my_cross_stats - Statistiques croisées

Sois précis, concis et toujours en français.
\`\`\`

### Ajouter les Actions

Dans **Actions**, cliquez sur **Create new action** et collez :

\`\`\`yaml
openapi: 3.0.0
info:
  title: BetTracker Pro API
  version: 1.0.0
servers:
  - url: http://localhost:3001/api/v1
paths:
  /tools/execute:
    post:
      operationId: executeTool
      summary: Execute a BetTracker tool
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                tool:
                  type: string
                arguments:
                  type: object
      responses:
        '200':
          description: Success
      security:
        - ApiKeyAuth: []
components:
  securitySchemes:
    ApiKeyAuth:
      type: apiKey
      in: header
      name: X-API-Key
\`\`\`

### Configuration de l'authentification

1. Dans **Authentication**, sélectionnez **API Key**
2. **Header name** : \`X-API-Key\`
3. **API Key** : Votre clé BetTracker (btk_...)

## Méthode 2 : API OpenAI

### Code JavaScript

\`\`\`javascript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const tools = [
  {
    type: 'function',
    function: {
      name: 'get_user_stats',
      description: 'Obtenir les statistiques de paris',
      parameters: {
        type: 'object',
        properties: {
          period: {
            type: 'string',
            enum: ['all', 'month', 'week']
          }
        }
      }
    }
  }
];

const response = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [
    { role: 'user', content: 'Montre-moi mes stats du mois' }
  ],
  tools: tools
});
\`\`\`

## ✅ Test

Demandez à votre Custom GPT :

> "Montre-moi mes statistiques de paris du mois"

ChatGPT devrait appeler l'API BetTracker et vous afficher vos stats !

## 📚 Ressources

- [API REST](/docs/api)
- [Serveur MCP](/docs/mcp-server)
- [Exemples de code](/docs/examples)
`,
    status: 'published',
    seoTitle: 'Intégration ChatGPT - BetTracker Pro',
    seoDescription: 'Guide pour intégrer BetTracker Pro avec ChatGPT via Custom GPT ou l\'API OpenAI',
    seoKeywords: 'chatgpt, custom gpt, openai, bettracker, integration',
  },
  {
    title: 'Exemples de code',
    slug: 'examples',
    excerpt: 'Exemples pratiques d\'utilisation de l\'API BetTracker Pro en JavaScript, Python, React',
    content: `
# 📚 Exemples de code

## JavaScript / Node.js

### Client API simple

\`\`\`javascript
class BetTrackerClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = 'http://localhost:3001/api/v1';
  }

  async executeTool(tool, args = {}) {
    const response = await fetch(\`\${this.baseURL}/tools/execute\`, {
      method: 'POST',
      headers: {
        'X-API-Key': this.apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ tool, arguments: args })
    });
    
    if (!response.ok) {
      throw new Error(\`API error: \${response.statusText}\`);
    }
    
    return response.json();
  }

  async getUserStats(period = 'month') {
    return this.executeTool('get_user_stats', { period });
  }

  async getHippodromes() {
    return this.executeTool('get_my_hippodromes');
  }

  async getBestCombinations() {
    return this.executeTool('get_my_horse_jockey_combinations');
  }
}

// Utilisation
const client = new BetTrackerClient('btk_votre_clé');

const stats = await client.getUserStats('month');
console.log('Statistiques:', stats.data);

const hippodromes = await client.getHippodromes();
console.log('Hippodromes:', hippodromes.data);
\`\`\`

## Python

### Client API complet

\`\`\`python
import requests
from typing import Dict, Any, Optional

class BetTrackerClient:
    def __init__(self, api_key: str, base_url: str = 'http://localhost:3001/api/v1'):
        self.api_key = api_key
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({'X-API-Key': api_key})
    
    def execute_tool(self, tool: str, arguments: Optional[Dict[str, Any]] = None) -> Dict:
        response = self.session.post(
            f'{self.base_url}/tools/execute',
            json={'tool': tool, 'arguments': arguments or {}}
        )
        response.raise_for_status()
        return response.json()
    
    def get_user_stats(self, period: str = 'month') -> Dict:
        return self.execute_tool('get_user_stats', {'period': period})
    
    def get_hippodromes(self) -> Dict:
        return self.execute_tool('get_my_hippodromes')
    
    def get_best_combinations(self) -> Dict:
        return self.execute_tool('get_my_horse_jockey_combinations')

# Utilisation
client = BetTrackerClient('btk_votre_clé')

stats = client.get_user_stats('month')
print('Statistiques:', stats['data'])

hippodromes = client.get_hippodromes()
print('Hippodromes:', hippodromes['data'])
\`\`\`

## React

### Hook personnalisé

\`\`\`typescript
import { useState, useEffect } from 'react';

const API_KEY = process.env.NEXT_PUBLIC_BETTRACKER_API_KEY;
const API_URL = 'http://localhost:3001/api/v1';

export function useBetTrackerTool<T>(tool: string, args?: any) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const response = await fetch(\`\${API_URL}/tools/execute\`, {
          method: 'POST',
          headers: {
            'X-API-Key': API_KEY!,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ tool, arguments: args })
        });

        if (!response.ok) throw new Error('API error');

        const result = await response.json();
        setData(result.data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [tool, JSON.stringify(args)]);

  return { data, loading, error };
}

// Utilisation dans un composant
function StatsComponent() {
  const { data, loading, error } = useBetTrackerTool('get_user_stats', { period: 'month' });

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error.message}</div>;

  return (
    <div>
      <h2>Statistiques du mois</h2>
      <p>Paris: {data.total_bets}</p>
      <p>Taux de réussite: {data.win_rate}</p>
      <p>ROI: {data.roi}</p>
    </div>
  );
}
\`\`\`

## Dashboard complet

### Récupérer toutes les données

\`\`\`javascript
async function getDashboardData(apiKey) {
  const client = new BetTrackerClient(apiKey);
  
  const [stats, hippodromes, horses, jockeys, combinations] = await Promise.all([
    client.getUserStats('month'),
    client.getHippodromes(),
    client.executeTool('get_my_bet_horses'),
    client.executeTool('get_my_jockey_stats'),
    client.getBestCombinations()
  ]);
  
  return {
    stats: stats.data,
    hippodromes: hippodromes.data,
    topHorses: horses.data.top_10_chevaux,
    topJockeys: jockeys.data.top_10_jockeys,
    bestCombinations: combinations.data.top_10_combinaisons
  };
}
\`\`\`

## 📚 Ressources

- [API REST](/docs/api)
- [Serveur MCP](/docs/mcp-server)
- [Intégration ChatGPT](/docs/chatgpt)
`,
    status: 'published',
    seoTitle: 'Exemples de code - API BetTracker Pro',
    seoDescription: 'Exemples pratiques d\'utilisation de l\'API BetTracker Pro en JavaScript, Python et React',
    seoKeywords: 'exemples, code, javascript, python, react, api, bettracker',
  },
];

async function createDocs() {
  console.log('🚀 Création des pages de documentation...\n');

  for (const doc of docs) {
    try {
      console.log(`📝 Création de "${doc.title}"...`);
      const response = await api.post('/cms/pages', doc);
      console.log(`✅ Page créée avec succès (ID: ${response.data.id})\n`);
    } catch (error: any) {
      if (error.response?.status === 409) {
        console.log(`⚠️  Page "${doc.title}" existe déjà, mise à jour...\n`);
      } else {
        console.error(`❌ Erreur lors de la création de "${doc.title}":`, error.message);
        console.error('Détails:', error.response?.data || error.message);
      }
    }
  }

  console.log('✨ Terminé !');
}

createDocs().catch(console.error);
