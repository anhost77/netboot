# 🤖 BetTracker Pro MCP Server

Serveur MCP (Model Context Protocol) pour BetTracker Pro permettant d'utiliser les outils de l'assistant IA directement dans Claude Desktop, ChatGPT et autres clients MCP.

## 📋 Table des matières

- [Installation](#installation)
- [Configuration](#configuration)
- [Intégration Claude Desktop](#intégration-claude-desktop)
- [Intégration ChatGPT](#intégration-chatgpt)
- [API REST](#api-rest)
- [Outils disponibles](#outils-disponibles)

## 🚀 Installation

```bash
cd mcp-server
npm install
npm run build
```

## ⚙️ Configuration

1. Copiez le fichier `.env.example` vers `.env`:
```bash
cp .env.example .env
```

2. Configurez vos variables d'environnement:
```env
BETTRACKER_API_URL=http://localhost:3001
BETTRACKER_API_KEY=your_api_key_here
```

## 🔧 Intégration Claude Desktop

### Configuration automatique

1. Ouvrez Claude Desktop
2. Allez dans `Settings` > `Developer` > `Edit Config`
3. Ajoutez la configuration suivante:

```json
{
  "mcpServers": {
    "bettracker-pro": {
      "command": "node",
      "args": [
        "/chemin/absolu/vers/netboot/mcp-server/dist/index.js"
      ],
      "env": {
        "BETTRACKER_API_URL": "http://localhost:3001",
        "BETTRACKER_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

### Emplacement du fichier de configuration

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

### Vérification

1. Redémarrez Claude Desktop
2. Ouvrez une nouvelle conversation
3. Tapez `/` pour voir les outils disponibles
4. Vous devriez voir tous les outils BetTracker Pro

## 💬 Intégration ChatGPT

### Via OpenAI API

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const tools = [
  {
    type: 'function',
    function: {
      name: 'get_user_stats',
      description: 'Obtenir les statistiques de paris de l\'utilisateur',
      parameters: {
        type: 'object',
        properties: {
          period: {
            type: 'string',
            enum: ['all', 'month', 'week'],
          },
        },
      },
    },
  },
  // ... autres outils
];

const response = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'Montre-moi mes statistiques' }],
  tools: tools,
});
```

### Via Custom GPT

1. Allez sur [chat.openai.com](https://chat.openai.com)
2. Créez un nouveau GPT personnalisé
3. Dans "Actions", ajoutez l'API BetTracker:

```yaml
openapi: 3.0.0
info:
  title: BetTracker Pro API
  version: 1.0.0
servers:
  - url: http://localhost:3001
paths:
  /support/ai-chat:
    post:
      summary: Execute AI tool
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                message:
                  type: string
      responses:
        '200':
          description: Success
```

## 🌐 API REST

Le serveur MCP expose également une API REST pour une intégration personnalisée.

### Endpoints

#### POST /tools/execute

Exécute un outil spécifique.

**Request:**
```json
{
  "tool": "get_user_stats",
  "arguments": {
    "period": "month"
  },
  "userId": "user-id-here"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "period": "month",
    "total_bets": 45,
    "won": 23,
    "lost": 18,
    "pending": 4,
    "win_rate": "56.1%",
    "total_stake": "450.00€",
    "total_profit": "125.50€",
    "roi": "27.9%"
  }
}
```

#### GET /tools/list

Liste tous les outils disponibles.

**Response:**
```json
{
  "tools": [
    {
      "name": "get_user_stats",
      "description": "Obtenir les statistiques de paris",
      "parameters": { ... }
    },
    ...
  ]
}
```

### Authentification

Ajoutez votre clé API dans le header:
```
Authorization: Bearer your_api_key_here
```

## 🛠️ Outils disponibles

### 💰 Gestion des Paris & Budget

| Outil | Description |
|-------|-------------|
| `get_user_stats` | Statistiques de paris (nombre, taux de réussite, profit, ROI) |
| `get_recent_bets` | Les 10 derniers paris avec détails |
| `get_budget_status` | État du budget (limites, dépenses, reste) |
| `get_user_settings` | Paramètres utilisateur (bankroll, notifications) |

### 🏇 Statistiques PMU

| Outil | Description |
|-------|-------------|
| `get_pmu_stats` | Vue d'ensemble PMU (hippodromes, courses, paris) |
| `get_my_hippodromes` | Liste des hippodromes où vous avez parié |
| `get_hippodrome_stats` | Stats détaillées d'un hippodrome (code requis) |
| `get_my_bet_horses` | Top 10 chevaux avec performances |
| `get_my_jockey_stats` | Top 10 jockeys avec statistiques |
| `get_my_horse_jockey_combinations` | Meilleures combinaisons cheval-jockey |
| `get_my_cross_stats` | Stats croisées (hippodrome + jockey + cheval) |

## 📝 Exemples d'utilisation

### Claude Desktop

```
Utilisateur: Montre-moi mes statistiques du mois

Claude: [Utilise get_user_stats avec period="month"]
Voici vos statistiques pour le mois:
- Total de paris: 45
- Taux de réussite: 56.1%
- Profit total: 125.50€
- ROI: 27.9%
```

### API REST

```bash
curl -X POST http://localhost:3001/tools/execute \
  -H "Authorization: Bearer your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "get_my_hippodromes",
    "userId": "user-123"
  }'
```

## 🔒 Sécurité

- Toutes les requêtes nécessitent une authentification
- Les données sont filtrées par utilisateur
- Les clés API doivent être stockées de manière sécurisée
- Utilisez HTTPS en production

## 🐛 Débogage

### Logs

Les logs du serveur MCP sont disponibles dans:
- **Claude Desktop**: `~/Library/Logs/Claude/mcp-server-bettracker-pro.log`
- **Console**: Utilisez `npm run dev` pour voir les logs en temps réel

### Problèmes courants

**Le serveur ne démarre pas**
- Vérifiez que Node.js est installé (`node --version`)
- Vérifiez que les dépendances sont installées (`npm install`)
- Vérifiez le fichier `.env`

**Les outils ne s'affichent pas dans Claude**
- Redémarrez Claude Desktop
- Vérifiez le chemin absolu dans la configuration
- Vérifiez les logs

**Erreur d'authentification**
- Vérifiez votre `BETTRACKER_API_KEY`
- Vérifiez que l'API BetTracker est accessible

## 📚 Ressources

- [Documentation MCP](https://modelcontextprotocol.io)
- [Claude Desktop](https://claude.ai/desktop)
- [OpenAI API](https://platform.openai.com/docs)
- [BetTracker Pro](https://bettracker.pro)

## 🤝 Support

Pour toute question ou problème:
- 📧 Email: support@bettracker.pro
- 💬 Discord: [BetTracker Community]
- 📖 Documentation: [docs.bettracker.pro]

## 📄 Licence

MIT License - voir LICENSE pour plus de détails.
