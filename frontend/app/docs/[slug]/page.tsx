'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import Head from 'next/head';
import { ArrowLeft, BookOpen, Code, Zap, MessageSquare, Github, Twitter, Mail, Home, Menu, X, ChevronLeft, ChevronRight, Bell, User, Settings, LogOut, Target } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { authAPI } from '@/lib/api/auth';
import { NotificationsDropdown } from '@/components/layout/notifications-dropdown';
import { useSettings } from '@/contexts/SettingsContext';
import { getServerSettings } from '@/lib/server-settings';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Métadonnées SEO pour chaque page
const seoData: Record<string, { 
  title: string; 
  description: string; 
  keywords: string;
  ogImage?: string;
}> = {
  'mcp-server': {
    title: 'Serveur MCP BetTracker Pro - Installation Claude Desktop | Guide Complet',
    description: 'Guide d\'installation du serveur MCP BetTracker Pro pour Claude Desktop. Intégrez vos statistiques de paris hippiques directement dans Claude avec notre protocole MCP.',
    keywords: 'mcp, model context protocol, claude desktop, bettracker, installation, serveur mcp, paris hippiques, ia, chatbot',
  },
  'api': {
    title: 'API REST BetTracker Pro - Documentation Complète | Endpoints & Exemples',
    description: 'Documentation complète de l\'API REST BetTracker Pro. Accédez à vos données de paris hippiques via notre API sécurisée. Exemples en JavaScript, Python et cURL.',
    keywords: 'api rest, bettracker, documentation api, paris hippiques, endpoints, javascript, python, curl, authentification',
  },
  'chatgpt': {
    title: 'Intégration ChatGPT BetTracker Pro - Custom GPT & API OpenAI',
    description: 'Créez votre Custom GPT BetTracker Pro ou intégrez notre API avec ChatGPT. Guide complet pour utiliser vos données de paris hippiques avec l\'IA OpenAI.',
    keywords: 'chatgpt, custom gpt, openai, bettracker, integration, paris hippiques, gpt-4, actions, api',
  },
  'examples': {
    title: 'Exemples de Code BetTracker Pro - JavaScript, Python, React | API',
    description: 'Exemples pratiques d\'utilisation de l\'API BetTracker Pro. Code complet en JavaScript, Python et React pour intégrer vos statistiques de paris hippiques.',
    keywords: 'exemples code, javascript, python, react, api bettracker, tutoriel, paris hippiques, integration',
  },
  'support-guide': {
    title: 'Guide Support CM - Documentation Admin | BetTracker Pro',
    description: 'Guide complet pour les Community Managers. Gestion des tickets de support, statuts, workflows et bonnes pratiques. Accès réservé aux administrateurs.',
    keywords: 'support, community manager, admin, tickets, documentation interne, bettracker',
  },
  'support-cheatsheet': {
    title: 'Support Cheat Sheet - Référence Rapide Admin | BetTracker Pro',
    description: 'Cheat sheet rapide pour les Community Managers. Statuts, workflows, templates de réponses. Accès réservé aux administrateurs et modérateurs.',
    keywords: 'support, cheat sheet, admin, moderator, référence rapide, bettracker',
  },
};

interface MenuItem {
  id: string;
  label: string;
  url: string;
  children?: MenuItem[];
}

const docs: Record<string, { title: string; icon: any; content: string }> = {
  'mcp-server': {
    title: 'Serveur MCP - Guide d\'installation',
    icon: Zap,
    content: `
# 🤖 Serveur MCP - Guide d'installation

## Qu'est-ce que le serveur MCP ?

Le serveur MCP (Model Context Protocol) permet d'utiliser tous les outils BetTracker Pro directement dans Claude Desktop ou ChatGPT. Vous pouvez poser des questions en langage naturel et l'IA utilisera vos données en temps réel.

## 📋 Prérequis

- Claude Desktop installé sur votre ordinateur
- Une clé API BetTracker (générez-la dans vos [paramètres](/dashboard/settings))

## 🚀 Configuration (2 minutes)

### 1. Générez votre clé API

Allez dans [Paramètres](/dashboard/settings) > **Clé API** et cliquez sur **Générer une clé API**.

> ⚠️ **Important** : Copiez et sauvegardez votre clé immédiatement, vous ne pourrez plus la voir ensuite !

### 2. Configuration Claude Desktop

Selon votre système d'exploitation, ouvrez le fichier de configuration :

#### 🍎 macOS
\`\`\`bash
code ~/Library/Application\\ Support/Claude/claude_desktop_config.json
\`\`\`

#### 🐧 Linux
\`\`\`bash
code ~/.config/Claude/claude_desktop_config.json
\`\`\`

#### 🪟 Windows
Ouvrez l'Explorateur de fichiers et allez à :
\`\`\`
%APPDATA%\\Claude\\claude_desktop_config.json
\`\`\`

Ajoutez cette configuration (copiez-collez et remplacez juste votre clé API) :

\`\`\`json
{
  "mcpServers": {
    "bettracker-pro": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-fetch",
        "${API_URL}/api/mcp"
      ],
      "env": {
        "BETTRACKER_API_KEY": "btk_votre_clé_ici"
      }
    }
  }
}
\`\`\`

> **🔑 Important** : Remplacez \`btk_votre_clé_ici\` par votre vraie clé API générée à l'étape 1.

### 3. Redémarrez Claude Desktop

Fermez complètement Claude Desktop et relancez-le.

## ✅ Test

Ouvrez Claude Desktop et tapez :

> "Montre-moi mes statistiques de paris du mois"

Claude devrait utiliser l'outil \`get_user_stats\` et vous afficher vos statistiques !

## 🛠️ Outils disponibles

Le serveur MCP expose 11 outils :

### Gestion des Paris
- **get_user_stats** - Statistiques de paris (nombre, taux de réussite, profit, ROI)
- **get_recent_bets** - Les 10 derniers paris avec détails
- **get_budget_status** - État du budget (limites, dépenses, reste)
- **get_user_settings** - Paramètres utilisateur (bankroll, notifications)

### Statistiques PMU
- **get_pmu_stats** - Vue d'ensemble PMU (hippodromes, courses, paris)
- **get_my_hippodromes** - Liste des hippodromes où vous avez parié
- **get_hippodrome_stats** - Stats détaillées d'un hippodrome (code requis)
- **get_my_bet_horses** - Top 10 chevaux avec performances
- **get_my_jockey_stats** - Top 10 jockeys avec statistiques
- **get_my_horse_jockey_combinations** - Meilleures combinaisons cheval-jockey
- **get_my_cross_stats** - Stats croisées (hippodrome + jockey + cheval)

## 🐛 Dépannage

### Les outils ne s'affichent pas

1. Vérifiez le chemin absolu dans la configuration
2. Vérifiez que le backend est démarré
3. Consultez les logs : \`~/Library/Logs/Claude/mcp-server-bettracker-pro.log\`

### Erreur d'authentification

Vérifiez que votre clé API est correcte dans le fichier de configuration.

## 📚 Ressources

- [API REST](/docs/api)
- [Exemples de code](/docs/examples)
- [Intégration ChatGPT](/docs/chatgpt)
`,
  },
  'api': {
    title: 'API REST - Documentation',
    icon: Code,
    content: `
# 🌐 API REST - Documentation

## Introduction

L'API REST BetTracker Pro vous permet d'accéder à toutes vos données de paris depuis n'importe quelle application. Authentifiez-vous avec votre clé API et commencez à construire !

## 🔑 Authentification

Toutes les requêtes nécessitent une clé API dans le header :

\`\`\`
X-API-Key: btk_votre_clé_ici
\`\`\`

Générez votre clé API dans [Paramètres](/dashboard/settings) > **Clé API**.

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

### cURL

\`\`\`bash
curl -X POST http://localhost:3001/api/v1/tools/execute \\
  -H "X-API-Key: btk_votre_clé" \\
  -H "Content-Type: application/json" \\
  -d '{"tool":"get_user_stats","arguments":{"period":"month"}}'
\`\`\`

### JavaScript

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
  },
  'chatgpt': {
    title: 'Intégration ChatGPT',
    icon: MessageSquare,
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
3. **API Key** : Votre clé BetTracker (générez-la dans vos [paramètres](/dashboard/settings))

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
  },
  'examples': {
    title: 'Exemples de code',
    icon: BookOpen,
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
  },
  'support-guide': {
    title: 'Guide Support - Community Managers',
    icon: BookOpen,
    content: `# 📚 Guide Support - Community Managers

⚠️ **Accès Réservé** : Cette documentation est réservée aux administrateurs et modérateurs.

## 🏷️ Les 5 Statuts de Ticket

### 1. 🔵 **Nouveau** (\`new\`)
- Ticket vient d'être créé
- **Action** : Lire et passer en "En cours"
- **Notification** : ❌ Aucune

### 2. 🟡 **En cours** (\`in_progress\`)
- Vous traitez le ticket
- **Action** : Répondre et investiguer
- **Notification** : ❌ Aucune (sauf si vous répondez)
- 💡 Se met automatiquement quand vous répondez

### 3. 🟠 **En attente client** (\`waiting_customer\`)
- Vous attendez une réponse de l'utilisateur
- **Action** : Relancer après 3 jours, fermer après 7 jours
- **Notification** : ⚠️ **OUI** (Warning - Orange)

### 4. 🟢 **Résolu** (\`resolved\`)
- Problème résolu, solution fournie
- **Action** : Fermer après 24h sans réponse
- **Notification** : ✅ **OUI** (Success - Vert)

### 5. ⚫ **Fermé** (\`closed\`)
- Ticket terminé définitivement
- **Action** : Archivage
- **Notification** : ℹ️ **OUI** (Info - Bleu)

## 🔄 Workflows Recommandés

### Question Simple (80% des cas)
\`\`\`
🔵 Nouveau → 🟡 En cours → 🟢 Résolu → ⚫ Fermé
\`\`\`

### Problème Technique
\`\`\`
🔵 Nouveau → 🟡 En cours → 🟠 En attente client → 🟡 En cours → 🟢 Résolu → ⚫ Fermé
\`\`\`

### Pas de Réponse
\`\`\`
🔵 Nouveau → 🟡 En cours → 🟠 En attente (3j) → Relance → (7j) → ⚫ Fermé
\`\`\`

## ⏱️ Temps de Réponse

| Action | Temps Max |
|--------|-----------|
| Première réponse | **< 2h** |
| Réponses suivantes | **< 4h** |
| Résolution simple | **< 24h** |
| Relance | **3 jours** |
| Fermeture sans réponse | **7 jours** |

## 📧 Système de Notifications

Le système respecte automatiquement les préférences utilisateur :

| Préférence | Web | Email | Push |
|------------|-----|-------|------|
| \`web_only\` | ✅ | ❌ | ❌ |
| \`email_only\` | ❌ | ✅ | ❌ |
| \`both\` | ✅ | ✅ | ✅ |
| \`none\` | ❌ | ❌ | ❌ |

**Notifications envoyées quand :**
- Vous répondez au ticket
- Passage en "En attente client"
- Passage en "Résolu"
- Passage en "Fermé"

## ✍️ Templates de Réponses

### Accusé Réception
\`\`\`
Bonjour [Prénom],

Merci pour votre message. J'ai bien pris en compte votre demande.
Je reviens vers vous rapidement.

Cordialement,
[Votre prénom]
Équipe Support BetTracker Pro
\`\`\`

### Demande d'Informations
\`\`\`
Bonjour [Prénom],

Pour mieux vous aider, pourriez-vous me préciser :
- [Question 1]
- [Question 2]

Merci d'avance,
[Votre prénom]
\`\`\`

⚠️ **N'oubliez pas** : Passer en "En attente client" après !

### Solution Fournie
\`\`\`
Bonjour [Prénom],

J'ai trouvé la solution à votre problème :
[Explication détaillée]

N'hésitez pas à me recontacter si besoin.

Cordialement,
[Votre prénom]
\`\`\`

✅ **Action** : Passer en "Résolu"

## 🎯 Règles d'Or

1. **Nouveau ticket** → Traiter < 2h
2. **Répondu** → Mettre le bon statut
3. **En attente client** → Relancer après 3 jours
4. **Résolu** → Fermer après 24h sans réponse
5. **Toujours** → Rester professionnel et courtois

## 🚨 Cas Particuliers

- **Spam** : Fermer directement
- **Bug critique** : En cours + Escalade immédiate
- **Demande feature** : Résolu + Transférer équipe produit
- **Utilisateur mécontent** : Rester calme + Escalade si besoin

## ✅ Checklist Quotidienne

### Début de Journée
- [ ] Vérifier tickets "Nouveau" (objectif : 0)
- [ ] Relancer "En attente client" > 3 jours
- [ ] Vérifier "En cours" > 24h

### Fin de Journée
- [ ] Fermer "Résolu" > 24h sans réponse
- [ ] Préparer tickets pour le lendemain

---

💡 **Rappel** : Un bon support = Réponse rapide + Statut correct + Communication claire

Les notifications automatiques font le reste ! 🚀
`,
  },
  'support-cheatsheet': {
    title: 'Support - Cheat Sheet Rapide',
    icon: Zap,
    content: `# 🚀 Support - Cheat Sheet Rapide

⚠️ **Accès Réservé** : Documentation pour administrateurs et modérateurs uniquement.

## 📊 Les 5 Statuts

| Statut | Emoji | Quand | Notification | Action |
|--------|-------|-------|--------------|--------|
| **Nouveau** | 🔵 | Ticket créé | ❌ Non | Lire et passer en "En cours" |
| **En cours** | 🟡 | Vous traitez | ❌ Non* | Répondre et investiguer |
| **En attente client** | 🟠 | Attente user | ⚠️ **OUI** | Relancer après 3j |
| **Résolu** | 🟢 | Solution OK | ✅ **OUI** | Fermer après 24h |
| **Fermé** | ⚫ | Terminé | ℹ️ **OUI** | Archivé |

*Notification envoyée uniquement quand vous répondez

## 🔄 Workflows Rapides

### ⚡ Question Simple (80%)
\`\`\`
🔵 Nouveau → 🟡 En cours (répondre) → 🟢 Résolu → ⚫ Fermé
\`\`\`

### 🔧 Problème Technique
\`\`\`
🔵 Nouveau → 🟡 En cours → 🟠 En attente → 🟡 En cours → 🟢 Résolu → ⚫ Fermé
\`\`\`

### 💤 Pas de Réponse
\`\`\`
🔵 Nouveau → 🟡 En cours → 🟠 En attente (3j) → Relance → (7j) → ⚫ Fermé
\`\`\`

## ⏱️ Temps de Réponse

| Action | Temps |
|--------|-------|
| Première réponse | **< 2h** |
| Réponses suivantes | **< 4h** |
| Résolution | **< 24h** |
| Relance | **3 jours** |
| Fermeture | **7 jours** |

## 📧 Notifications

**✅ Envoyées :**
- Quand vous répondez
- Passage en 🟠 En attente client
- Passage en 🟢 Résolu
- Passage en ⚫ Fermé

**❌ Pas envoyées :**
- Passage 🔵 → 🟡

## 🎯 Règles d'Or

1. **Nouveau** → Traiter < 2h
2. **Répondu** → Bon statut
3. **En attente** → Relancer 3j
4. **Résolu** → Fermer 24h
5. **Toujours** → Professionnel

## 🚨 Cas d'Urgence

| Situation | Action |
|-----------|--------|
| Bug critique | 🟡 + Escalade |
| User mécontent | Calme + Escalade |
| Spam | ⚫ Direct |
| Feature | 🟢 + Transfert |

## 📝 Templates

### Accusé
\`\`\`
Bonjour [Prénom],
Merci, je prends en charge.
Cordialement, [Nom]
\`\`\`

### Demande Infos
\`\`\`
Bonjour [Prénom],
Pourriez-vous préciser : [Question]
Merci, [Nom]
\`\`\`

### Solution
\`\`\`
Bonjour [Prénom],
Voici la solution : [Explication]
Cordialement, [Nom]
\`\`\`

## 🎯 Objectifs Quotidiens

- [ ] **0** "Nouveau" en fin de journée
- [ ] **< 5** "En cours" > 24h
- [ ] **Relancer** "En attente" > 3j
- [ ] **Fermer** "Résolu" > 24h

## 💡 Astuces Pro

✅ Répondre vite > Répondre parfait  
✅ Statut correct = Notifs auto  
✅ Relance proactive = Satisfaction  
✅ Documentation = Moins de tickets  

---

**🚀 Bon support !**
`,
  },
  'gestion-paris': {
    title: 'Gestion des Paris Auto/Manuel',
    icon: Target,
    content: `
# 📚 Gestion des Paris - Auto vs Manuel

> **Documentation réservée aux membres, modérateurs et administrateurs**

---

## 🎯 Vue d'Ensemble

Le système de gestion des paris distingue **deux types de plateformes** :

| Type | Plateforme | Mise à jour | Badge |
|------|-----------|-------------|-------|
| **PMU** | PMU | ✅ Automatique | 🟢 Auto |
| **Autres** | Betclic, Unibet, Zeturf, etc. | ⚠️ Manuelle | 🟠 Manuel |

Cette distinction garantit que **les cotes et résultats sont toujours corrects**, quelle que soit la plateforme utilisée.

---

## 1️⃣ Création d'une Bankroll

### Étapes

1. Aller sur **Dashboard → Bankroll**
2. Cliquer sur **"Nouvelle plateforme"**
3. Sélectionner le **type de plateforme** :
   - **PMU** : Résultats mis à jour automatiquement ✨
   - **Autre** : Vous devrez saisir le résultat manuellement 📝
4. Saisir le **nom** (ex: "PMU", "Betclic", "Unibet")
5. Saisir la **bankroll initiale**
6. Cliquer sur **"Créer"**

### Badges Visuels

Une fois créée, votre plateforme affichera un badge :
- 🟢 **Auto** (vert) = PMU → Mise à jour automatique
- 🟠 **Manuel** (orange) = Autre → Mise à jour manuelle

---

## 2️⃣ Création d'un Pari

### Mode "Sélection Course" (PMU)

1. Cliquer sur **"Nouveau pari"**
2. Sélectionner **"Sélection Course"**
3. Choisir le **type de pari** (Simple Gagnant, Couplé, etc.)
4. Sélectionner votre **bankroll** :
   - Badge 🟢 **Auto** = Résultats automatiques
   - Badge 🟠 **Manuel** = Vous devrez mettre à jour
5. Choisir **hippodrome**, **course** et **chevaux**
6. Saisir la **mise**
7. Valider

### Mode "Saisie Manuelle"

1. Cliquer sur **"Nouveau pari"**
2. Sélectionner **"Saisie Manuelle"**
3. Choisir la **plateforme** dans le menu déroulant :
   - **PMU (Auto)** = ✅ Résultat mis à jour automatiquement
   - **Betclic (Manuel)** = ⚠️ Vous devrez saisir le résultat
4. Remplir les informations (hippodrome, course, chevaux, mise, cote)
5. Valider

---

## 3️⃣ Validation Automatique (PMU)

### Comment ça fonctionne ?

Pour les **paris PMU**, un système automatique vérifie les résultats **toutes les 10 minutes** :

\`\`\`
Cron Job (toutes les 10 min)
  ↓
Récupère les paris PMU en attente
  ↓
Vérifie les résultats sur l'API PMU
  ↓
Met à jour automatiquement :
  - Statut (Gagné/Perdu)
  - Cote finale officielle
  - Gain/Perte
  ↓
Envoie notification
\`\`\`

### Ce qui est mis à jour automatiquement

- ✅ **Statut** : Gagné, Perdu ou Remboursé
- ✅ **Cote finale** : Cote officielle PMU
- ✅ **Gain** : Calcul automatique (mise × cote)
- ✅ **Profit** : Gain - Mise
- ✅ **Bankroll** : Mise à jour automatique

### Notifications

Vous recevez une notification :
- 🎉 **"Pari gagné !"** avec le montant du gain
- 😔 **"Pari perdu"** avec la perte

---

## 4️⃣ Validation Manuelle (Autres Plateformes)

### Comment ça fonctionne ?

Pour les **paris sur autres plateformes** (Betclic, Unibet, etc.), **vous devez saisir le résultat manuellement** :

\`\`\`
Pari créé sur Betclic
  ↓
Badge "⏰ À mettre à jour" affiché
  ↓
1h après la course
  ↓
Notification : "Mettez à jour votre pari"
  ↓
Vous cliquez sur "Gagné" ou "Perdu"
  ↓
Vous saisissez la cote finale réelle
  ↓
Validation → Bankroll mise à jour
\`\`\`

### Étapes de mise à jour

#### Si le pari est gagné :

1. Sur la page **Paris**, repérez votre pari avec le badge **"⏰ À mettre à jour"**
2. Cliquez sur le bouton **✅ Gagné**
3. Une modal s'ouvre :
   - **Titre** : "Saisissez la cote finale affichée par votre bookmaker"
   - **Champ** : Saisissez la **cote réelle** affichée par Betclic/Unibet
   - **Gain estimé** : Calcul automatique (mise × cote)
4. Cliquez sur **"Valider le gain"**
5. ✅ Pari mis à jour, bankroll ajustée, badge disparaît

#### Si le pari est perdu :

1. Cliquez sur le bouton **❌ Perdu**
2. Confirmation immédiate
3. ✅ Pari mis à jour, perte enregistrée

### Pourquoi saisir manuellement ?

Les bookmakers comme Betclic, Unibet, Zeturf n'ont **pas d'API publique**. Nous ne pouvons donc pas récupérer automatiquement :
- Les résultats des courses
- Les cotes finales
- Les gains

**C'est pourquoi vous devez saisir ces informations vous-même** pour garantir l'exactitude de vos statistiques.

---

## 5️⃣ Badges et Indicateurs

### Sur les Bankrolls

| Badge | Signification |
|-------|--------------|
| 🟢 **Auto** | Plateforme PMU - Résultats automatiques |
| 🟠 **Manuel** | Autre plateforme - Mise à jour manuelle |

### Sur les Paris

| Badge | Signification |
|-------|--------------|
| 🟡 **En cours** | Pari en attente de résultat |
| 🟢 **Gagné** | Pari gagné |
| 🔴 **Perdu** | Pari perdu |
| ⚪ **Remboursé** | Pari annulé/remboursé |
| ⏰ **À mettre à jour** | Pari manuel nécessitant votre action |

---

## 6️⃣ FAQ et Dépannage

### ❓ Pourquoi mon pari Betclic n'est pas mis à jour automatiquement ?

**Réponse** : Les paris sur Betclic, Unibet et autres bookmakers nécessitent une **mise à jour manuelle** car ces plateformes n'ont pas d'API publique. Seuls les paris PMU sont mis à jour automatiquement.

### ❓ J'ai oublié de mettre à jour mon pari, que faire ?

**Réponse** : Pas de panique ! Vous pouvez mettre à jour un pari à tout moment :
1. Allez sur la page **Paris**
2. Trouvez votre pari avec le badge **"⏰ À mettre à jour"**
3. Cliquez sur **Gagné** ou **Perdu**
4. Saisissez la cote finale

### ❓ Puis-je modifier le type d'une bankroll existante ?

**Réponse** : Oui ! Allez sur **Bankroll**, cliquez sur **Modifier** (icône crayon), et changez le type. 

⚠️ **Attention** : Cela affectera uniquement les **futurs paris**, pas les paris existants.

### ❓ La cote PMU automatique est différente de ma cote saisie, c'est normal ?

**Réponse** : Oui, c'est normal et c'est justement l'intérêt du système :
- **Cote saisie** = Cote au moment où vous avez placé le pari
- **Cote finale PMU** = Cote officielle après la course

Le système utilise la **cote finale** pour calculer vos gains réels.

### ❓ Je ne reçois pas les notifications de mise à jour

**Réponse** : Vérifiez :
1. Vos **paramètres de notification** dans votre profil
2. Que votre **email est vérifié**
3. Que les notifications ne sont pas dans vos **spams**

### ❓ Puis-je avoir plusieurs bankrolls du même type ?

**Réponse** : Oui ! Vous pouvez avoir :
- Plusieurs bankrolls PMU (ex: "PMU Principal", "PMU Test")
- Plusieurs bankrolls Betclic (ex: "Betclic FR", "Betclic BE")

Chaque bankroll est indépendante.

---

## 🔧 Pour les Administrateurs

### Vérifier les paris en attente de mise à jour

\`\`\`sql
SELECT 
  b.id,
  b.date,
  b.platform,
  p.platform_type,
  b.status,
  b.requires_manual_update
FROM bets b
LEFT JOIN platforms p ON b.platform_id = p.id
WHERE b.status = 'pending'
  AND b.requires_manual_update = true
ORDER BY b.date DESC;
\`\`\`

### Forcer la mise à jour d'anciens paris

Si des paris créés avant l'implémentation n'ont pas le flag \`requires_manual_update\`, exécutez :

\`\`\`bash
cd backend
npx ts-node scripts/migrate-manual-bets.ts
\`\`\`

### Logs du Cron Job

Les logs du cron job PMU sont visibles dans la console backend :

\`\`\`
🔄 Starting automatic bet status update...
Found 5 pending PMU bets to check (auto-update only)
✅ Automatic bet status update completed
\`\`\`

---

## 📊 Statistiques

### Répartition Auto vs Manuel

Pour voir la répartition de vos paris :

1. Allez sur **Dashboard → Statistiques**
2. Filtrez par **Plateforme**
3. Comparez les performances entre PMU (auto) et autres (manuel)

---

## ✅ Résumé

| Aspect | PMU (Auto) | Autres (Manuel) |
|--------|-----------|-----------------|
| **Création bankroll** | Type "PMU" | Type "Autre" |
| **Badge** | 🟢 Auto | 🟠 Manuel |
| **Mise à jour résultat** | ✅ Automatique (10 min) | ⚠️ Manuelle (vous) |
| **Cote finale** | 📡 API PMU | 📝 Vous saisissez |
| **Notification** | 🎉 Gagné/Perdu | ⏰ À mettre à jour |
| **Avantage** | Zéro effort | Fonctionne partout |

---

**🎯 Vous avez maintenant toutes les clés pour gérer vos paris efficacement !**

*Pour toute question, contactez le support ou consultez les autres pages de documentation.*
`,
  },
};

export default function DocPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const doc = docs[slug];
  const [footerMenus, setFooterMenus] = useState<Record<string, MenuItem[]>>({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const { settings } = useSettings();
  
  // User & Notifications
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(true);

  // Docs réservées aux admins/moderators
  const restrictedDocs = ['support-guide', 'support-cheatsheet'];
  const isRestrictedDoc = restrictedDocs.includes(slug);

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Vérifier si on a un token avant de faire la requête
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      if (!token) {
        setIsAuthenticated(false);
        // Si c'est une doc restreinte, rediriger
        if (isRestrictedDoc) {
          setIsAuthorized(false);
          router.push('/login?redirect=/docs/' + slug);
        }
        return;
      }

      const userData = await authAPI.getProfile();
      setUser(userData);
      setIsAuthenticated(true);

      // Vérifier les rôles pour les docs restreintes
      if (isRestrictedDoc) {
        const allowedRoles = ['admin', 'moderator'];
        if (!allowedRoles.includes(userData.role)) {
          setIsAuthorized(false);
          router.push('/dashboard');
        }
      }
    } catch (error) {
      // Erreur silencieuse - l'utilisateur n'est juste pas connecté
      setIsAuthenticated(false);
      setUser(null);
      
      // Si c'est une doc restreinte, rediriger
      if (isRestrictedDoc) {
        setIsAuthorized(false);
        router.push('/login?redirect=/docs/' + slug);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      setIsAuthenticated(false);
      setUser(null);
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
      setTimeout(checkScroll, 100);
    }
  };

  // Vérification d'accès pour les docs restreintes
  if (isRestrictedDoc && !isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="bg-red-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Accès Restreint</h1>
          <p className="text-gray-600 mb-6">
            Cette documentation est réservée aux administrateurs et modérateurs.
          </p>
          <div className="space-y-3">
            <Link
              href="/dashboard"
              className="block w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Retour au Dashboard
            </Link>
            <Link
              href="/docs/api"
              className="block w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Documentation Publique
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
          <p className="text-gray-600 mb-6">Documentation non trouvée</p>
          <Link
            href="/docs/mcp-server"
            className="text-primary-600 hover:text-primary-700"
          >
            Retour à la documentation
          </Link>
        </div>
      </div>
    );
  }

  const Icon = doc.icon;
  const seo = seoData[slug] || {
    title: 'Documentation - BetTracker Pro',
    description: 'Documentation BetTracker Pro',
    keywords: 'bettracker, documentation, paris hippiques',
  };

  return (
    <>
      <Head>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        <meta name="keywords" content={seo.keywords} />
        
        {/* Open Graph */}
        <meta property="og:title" content={seo.title} />
        <meta property="og:description" content={seo.description} />
        <meta property="og:type" content="article" />
        <meta property="og:locale" content="fr_FR" />
        <meta property="og:site_name" content="BetTracker Pro" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seo.title} />
        <meta name="twitter:description" content={seo.description} />
        
        {/* Canonical URL */}
        <link rel="canonical" href={`https://bettracker.pro/docs/${slug}`} />
        
        {/* Langue */}
        <meta httpEquiv="content-language" content="fr" />
        
        {/* Robots */}
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <div className="p-2 bg-primary-600 rounded-lg">
                <Home className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">{settings?.siteName || 'BetTracker'}</span>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
                Accueil
              </Link>
              <Link href="/docs/mcp-server" className="text-gray-600 hover:text-gray-900 transition-colors">
                Documentation
              </Link>
              
              {isAuthenticated ? (
                <>
                  {/* Notifications */}
                  <NotificationsDropdown />

                  {/* User Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="h-8 w-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {user?.firstName?.[0] || user?.email?.[0] || 'U'}
                      </div>
                    </button>

                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                        <Link
                          href="/dashboard"
                          className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Home className="h-4 w-4" />
                          <span>Dashboard</span>
                        </Link>
                        <Link
                          href="/dashboard/settings"
                          className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Settings className="h-4 w-4" />
                          <span>Paramètres</span>
                        </Link>
                        <hr className="my-2" />
                        <button
                          onClick={handleLogout}
                          className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Déconnexion</span>
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <Link href="/dashboard" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                  Connexion
                </Link>
              )}
            </nav>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <nav className="flex flex-col space-y-3">
                <Link 
                  href="/" 
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Accueil
                </Link>
                <Link 
                  href="/docs/mcp-server" 
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Documentation
                </Link>
                
                {isAuthenticated ? (
                  <>
                    <Link 
                      href="/dashboard" 
                      className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Bell className="h-5 w-5" />
                      <span>Notifications</span>
                    </Link>
                    <Link 
                      href="/dashboard" 
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex items-center space-x-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Home className="h-5 w-5" />
                      <span>Dashboard</span>
                    </Link>
                    <Link 
                      href="/dashboard/settings" 
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex items-center space-x-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Settings className="h-5 w-5" />
                      <span>Paramètres</span>
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="mx-4 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center space-x-2"
                    >
                      <LogOut className="h-5 w-5" />
                      <span>Déconnexion</span>
                    </button>
                  </>
                ) : (
                  <Link 
                    href="/dashboard" 
                    className="mx-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Connexion
                  </Link>
                )}
              </nav>
            </div>
          )}
        </div>
      </div>

      {/* Page Header avec gradient */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-white/10 backdrop-blur-sm rounded-xl">
              <Icon className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <h1 className="text-4xl font-bold">{doc.title}</h1>
                {isRestrictedDoc && (
                  <span className="px-3 py-1 bg-red-500 text-white text-sm font-semibold rounded-full">
                    Admin Only
                  </span>
                )}
              </div>
              <p className="text-primary-100 mt-2">
                {isRestrictedDoc 
                  ? 'Documentation réservée aux administrateurs et modérateurs' 
                  : 'Documentation complète et exemples pratiques'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation avec tabs modernes - Responsive avec flèches */}
      <div className="bg-white shadow-sm sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Bouton scroll gauche */}
          {canScrollLeft && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white shadow-lg rounded-full hover:bg-gray-100 transition-colors ml-2"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
          )}

          {/* Bouton scroll droite */}
          {canScrollRight && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white shadow-lg rounded-full hover:bg-gray-100 transition-colors mr-2"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
          )}

          <nav 
            ref={scrollContainerRef}
            onScroll={checkScroll}
            className="flex space-x-2 py-4 overflow-x-auto scrollbar-hide"
          >
            {Object.entries(docs)
              .filter(([key]) => {
                // Filtrer les docs restreintes si l'utilisateur n'est pas admin/moderator
                if (restrictedDocs.includes(key)) {
                  return user && (user.role === 'admin' || user.role === 'moderator');
                }
                return true;
              })
              .map(([key, { title, icon: NavIcon }]) => (
                <Link
                  key={key}
                  href={`/docs/${key}`}
                  className={`flex items-center space-x-2 px-3 sm:px-4 py-2.5 rounded-lg transition-all whitespace-nowrap flex-shrink-0 ${
                    slug === key
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <NavIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="font-medium text-sm sm:text-base">{title.split(' - ')[0]}</span>
                </Link>
              ))}
          </nav>
        </div>
      </div>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* Content avec meilleur espacement */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-12">
          <article className="prose prose-lg max-w-none 
            prose-headings:text-gray-900 prose-headings:font-bold
            prose-h1:text-4xl prose-h1:mb-6 prose-h1:pb-4 prose-h1:border-b prose-h1:border-gray-200
            prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-4
            prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-3
            prose-p:text-gray-700 prose-p:leading-relaxed
            prose-a:text-primary-600 prose-a:no-underline hover:prose-a:underline
            prose-strong:text-gray-900 prose-strong:font-semibold
            prose-ul:my-6 prose-li:my-2
            prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:shadow-lg
            prose-code:text-primary-600 prose-code:bg-primary-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-code:text-sm prose-code:before:content-none prose-code:after:content-none
            prose-table:border-collapse prose-th:bg-gray-50 prose-th:border prose-th:border-gray-300 prose-th:p-3 prose-td:border prose-td:border-gray-300 prose-td:p-3
            prose-blockquote:border-l-4 prose-blockquote:border-primary-500 prose-blockquote:bg-primary-50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:italic
          ">
            <ReactMarkdown
              components={{
                code({ node, inline, className, children, ...props }: any) {
                  if (inline) {
                    return (
                      <code className="text-sm font-mono bg-primary-50 text-primary-600 px-1.5 py-0.5 rounded font-medium" {...props}>
                        {children}
                      </code>
                    );
                  }
                  return (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
                pre({ children, ...props }: any) {
                  return (
                    <pre className="bg-gray-900 text-gray-100 p-6 rounded-xl overflow-x-auto shadow-lg border border-gray-800 my-6" {...props}>
                      {children}
                    </pre>
                  );
                },
                h2({ children }) {
                  return <h2 className="flex items-center space-x-2 text-gray-900">{children}</h2>;
                },
                h3({ children }) {
                  return <h3 className="text-gray-800">{children}</h3>;
                },
                blockquote({ children }) {
                  return (
                    <blockquote className="border-l-4 border-primary-500 bg-primary-50 py-3 px-5 rounded-r-lg my-6">
                      {children}
                    </blockquote>
                  );
                },
                p({ children, ...props }: any) {
                  return <p {...props}>{children}</p>;
                },
              }}
            >
              {doc.content}
            </ReactMarkdown>
          </article>
        </div>

        {/* Footer avec liens utiles */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <h3 className="font-semibold text-gray-900 mb-2">💡 Besoin d'aide ?</h3>
            <p className="text-sm text-gray-600 mb-4">
              Consultez notre chatbot IA pour une assistance personnalisée
            </p>
            <Link href="/dashboard" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              Ouvrir le chatbot →
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <h3 className="font-semibold text-gray-900 mb-2">🔑 Clé API</h3>
            <p className="text-sm text-gray-600 mb-4">
              Générez votre clé API pour utiliser ces intégrations
            </p>
            <Link href="/dashboard/settings" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              Gérer mes clés →
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <h3 className="font-semibold text-gray-900 mb-2">📊 Statistiques</h3>
            <p className="text-sm text-gray-600 mb-4">
              Explorez vos données PMU et paris hippiques
            </p>
            <Link href="/dashboard/statistics/pmu" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              Voir mes stats →
            </Link>
          </div>
        </div>

      </div>

      {/* Footer fullsize */}
      <footer className="bg-gray-900 text-gray-300 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Colonne 1 - À propos */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="p-2 bg-primary-600 rounded-lg">
                  <Home className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">{settings?.siteName || 'BetTracker'}</h3>
              </div>
              <p className="text-sm text-gray-400 mb-4">
                {settings?.siteDescription || 'Plateforme de gestion de paris hippiques'}
              </p>
              <div className="flex space-x-3">
                <a
                  href="https://github.com/bettracker"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                  aria-label="GitHub"
                >
                  <Github className="h-5 w-5" />
                </a>
                <a
                  href="https://twitter.com/bettracker"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter className="h-5 w-5" />
                </a>
                <a
                  href="mailto:support@bettracker.pro"
                  className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                  aria-label="Email"
                >
                  <Mail className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Colonnes de liens */}
            <>
                <div>
                  <h4 className="font-semibold text-white mb-4">Produit</h4>
                  <ul className="space-y-2">
                    <li>
                      <Link href="/fonctionnalites" className="text-sm text-gray-400 hover:text-primary-400 transition-colors">
                        Fonctionnalités
                      </Link>
                    </li>
                    <li>
                      <Link href="/#tarifs" className="text-sm text-gray-400 hover:text-primary-400 transition-colors">
                        Tarifs
                      </Link>
                    </li>
                    <li>
                      <Link href="/calendrier-courses" className="text-sm text-gray-400 hover:text-primary-400 transition-colors">
                        Calendrier des courses
                      </Link>
                    </li>
                    <li>
                      <Link href="/pronostics" className="text-sm text-gray-400 hover:text-primary-400 transition-colors">
                        Pronostics gratuits
                      </Link>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-white mb-4">Ressources</h4>
                  <ul className="space-y-2">
                    <li>
                      <Link href="/blog" className="text-sm text-gray-400 hover:text-primary-400 transition-colors">
                        Blog PMU
                      </Link>
                    </li>
                    <li>
                      <Link href="/hippodromes" className="text-sm text-gray-400 hover:text-primary-400 transition-colors">
                        Guide Hippodromes
                      </Link>
                    </li>
                    <li>
                      <Link href="/docs/api" className="text-sm text-gray-400 hover:text-primary-400 transition-colors">
                        API & MCP
                      </Link>
                    </li>
                    <li>
                      <Link href="/docs/examples" className="text-sm text-gray-400 hover:text-primary-400 transition-colors">
                        Exemples de code
                      </Link>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-white mb-4">Support</h4>
                  <ul className="space-y-2">
                    <li>
                      <Link href="/comment-ca-marche" className="text-sm text-gray-400 hover:text-primary-400 transition-colors">
                        Comment ça marche ?
                      </Link>
                    </li>
                    <li>
                      <Link href="/docs/mcp-server" className="text-sm text-gray-400 hover:text-primary-400 transition-colors">
                        Documentation technique
                      </Link>
                    </li>
                    <li>
                      <Link href="/docs/chatgpt" className="text-sm text-gray-400 hover:text-primary-400 transition-colors">
                        Intégration ChatGPT
                      </Link>
                    </li>
                    <li>
                      <Link href="/contact" className="text-sm text-gray-400 hover:text-primary-400 transition-colors">
                        Contactez-nous
                      </Link>
                    </li>
                  </ul>
                </div>
              </>
          </div>

          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between text-sm">
              <p className="text-gray-400">
                © {new Date().getFullYear()} {settings?.siteName || 'BetTracker'}. Tous droits réservés.
              </p>
              <p className="text-gray-500 mt-2 md:mt-0">
                {settings?.footerText || 'Fait avec ❤️ pour les passionnés de turf'}
              </p>
            </div>
          </div>
        </div>
      </footer>
      </div>
    </>
  );
}
