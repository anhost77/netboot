# 📚 Exemples d'utilisation - BetTracker Pro MCP Server

## 🤖 Avec Claude Desktop

### Exemple 1 : Statistiques mensuelles
```
Utilisateur: Montre-moi mes statistiques du mois

Claude: [Utilise get_user_stats avec period="month"]

Voici vos statistiques pour le mois :
📊 Total de paris : 45
✅ Gagnés : 23 (51.1%)
❌ Perdus : 18 (40.0%)
⏳ En attente : 4 (8.9%)
💰 Mise totale : 450.00€
📈 Profit : +125.50€
🎯 ROI : 27.9%
```

### Exemple 2 : Analyse d'hippodrome
```
Utilisateur: Comment je performe à Enghien ?

Claude: [Utilise get_hippodrome_stats avec code="ENGHIEN"]

Vos performances à ENGHIEN :
🏟️ Total de paris : 9
✅ Gagnés : 6 (66.7%)
💰 Profit : +87.50€
📊 ROI : 48.6%

C'est votre meilleur hippodrome ! Vous avez un excellent taux de réussite là-bas.
```

### Exemple 3 : Meilleures combinaisons
```
Utilisateur: Quelles sont mes meilleures combinaisons cheval-jockey ?

Claude: [Utilise get_my_horse_jockey_combinations]

🏆 Top 5 des combinaisons gagnantes :

1. ICI AVRILLY + F.GUY
   - 1 course ensemble
   - 100% de victoires
   
2. LIKE A PRAYER + T. LE BELLER
   - 1 course ensemble
   - 100% de victoires
   
3. KEOPS DE JUMILLY + P.Y. VERVA
   - 1 course ensemble
   - 100% de victoires

Ces combinaisons ont un historique parfait !
```

## 🌐 Avec l'API REST

### Exemple 1 : Obtenir les statistiques

```bash
curl -X POST http://localhost:3001/api/v1/tools/execute \
  -H "X-API-Key: your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "get_user_stats",
    "arguments": {"period": "month"},
    "userId": "user-123"
  }'
```

**Réponse :**
```json
{
  "success": true,
  "tool": "get_user_stats",
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

### Exemple 2 : Liste des hippodromes

```bash
curl -X POST http://localhost:3001/api/v1/tools/execute \
  -H "X-API-Key: your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "get_my_hippodromes",
    "userId": "user-123"
  }'
```

**Réponse :**
```json
{
  "success": true,
  "tool": "get_my_hippodromes",
  "data": {
    "total": 5,
    "hippodromes": [
      {"code": "COMPIEGNE", "name": "COMPIEGNE", "count": 3},
      {"code": "CABOURG", "name": "CABOURG", "count": 4},
      {"code": "ENGHIEN", "name": "ENGHIEN", "count": 9},
      {"code": "SAINT-CLOUD", "name": "SAINT-CLOUD", "count": 2},
      {"code": "LE", "name": "LE BOUSCAT", "count": 2}
    ]
  }
}
```

### Exemple 3 : Performances des chevaux

```bash
curl -X POST http://localhost:3001/api/v1/tools/execute \
  -H "X-API-Key: your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "get_my_bet_horses",
    "userId": "user-123"
  }'
```

**Réponse :**
```json
{
  "success": true,
  "tool": "get_my_bet_horses",
  "data": {
    "total": 53,
    "top_10_chevaux": [
      {
        "nom": "ICI AVRILLY",
        "courses": 1,
        "victoires": 1,
        "podiums": 1,
        "taux_victoire": "100.0%",
        "position_moyenne": "1.0"
      },
      {
        "nom": "LIKE A PRAYER",
        "courses": 1,
        "victoires": 1,
        "podiums": 1,
        "taux_victoire": "100.0%",
        "position_moyenne": "1.0"
      }
    ]
  }
}
```

## 💻 Avec Node.js

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api/v1',
  headers: {
    'X-API-Key': 'your_api_key',
    'Content-Type': 'application/json',
  },
});

// Obtenir les statistiques
async function getUserStats(userId, period = 'month') {
  const response = await api.post('/tools/execute', {
    tool: 'get_user_stats',
    arguments: { period },
    userId,
  });
  
  return response.data;
}

// Obtenir les meilleures combinaisons
async function getBestCombinations(userId) {
  const response = await api.post('/tools/execute', {
    tool: 'get_my_horse_jockey_combinations',
    userId,
  });
  
  return response.data;
}

// Utilisation
const stats = await getUserStats('user-123', 'month');
console.log('Statistiques:', stats.data);

const combos = await getBestCombinations('user-123');
console.log('Meilleures combinaisons:', combos.data.top_10_combinaisons);
```

## 🐍 Avec Python

```python
import requests

class BetTrackerAPI:
    def __init__(self, api_key, base_url='http://localhost:3001/api/v1'):
        self.base_url = base_url
        self.headers = {
            'X-API-Key': api_key,
            'Content-Type': 'application/json'
        }
    
    def execute_tool(self, tool, user_id, arguments=None):
        response = requests.post(
            f'{self.base_url}/tools/execute',
            headers=self.headers,
            json={
                'tool': tool,
                'arguments': arguments or {},
                'userId': user_id
            }
        )
        return response.json()
    
    def get_user_stats(self, user_id, period='month'):
        return self.execute_tool('get_user_stats', user_id, {'period': period})
    
    def get_hippodromes(self, user_id):
        return self.execute_tool('get_my_hippodromes', user_id)
    
    def get_best_combinations(self, user_id):
        return self.execute_tool('get_my_horse_jockey_combinations', user_id)

# Utilisation
api = BetTrackerAPI('your_api_key')

stats = api.get_user_stats('user-123', 'month')
print('Statistiques:', stats['data'])

hippodromes = api.get_hippodromes('user-123')
print('Hippodromes:', hippodromes['data']['hippodromes'])

combos = api.get_best_combinations('user-123')
print('Combinaisons:', combos['data']['top_10_combinaisons'])
```

## 🔄 Intégration dans une application

### React

```typescript
import { useState, useEffect } from 'react';

const API_KEY = process.env.REACT_APP_BETTRACKER_API_KEY;
const API_URL = 'http://localhost:3001/api/v1';

export function useUserStats(userId: string, period: string = 'month') {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchStats() {
      const response = await fetch(`${API_URL}/tools/execute`, {
        method: 'POST',
        headers: {
          'X-API-Key': API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tool: 'get_user_stats',
          arguments: { period },
          userId,
        }),
      });
      
      const data = await response.json();
      setStats(data.data);
      setLoading(false);
    }
    
    fetchStats();
  }, [userId, period]);
  
  return { stats, loading };
}

// Utilisation dans un composant
function StatsComponent({ userId }) {
  const { stats, loading } = useUserStats(userId, 'month');
  
  if (loading) return <div>Chargement...</div>;
  
  return (
    <div>
      <h2>Statistiques du mois</h2>
      <p>Total de paris: {stats.total_bets}</p>
      <p>Taux de réussite: {stats.win_rate}</p>
      <p>ROI: {stats.roi}</p>
    </div>
  );
}
```

## 📱 Cas d'usage avancés

### Dashboard personnalisé

```javascript
// Récupérer toutes les données pour un dashboard complet
async function getDashboardData(userId) {
  const [stats, hippodromes, horses, jockeys, combinations] = await Promise.all([
    executeTool('get_user_stats', userId, { period: 'month' }),
    executeTool('get_my_hippodromes', userId),
    executeTool('get_my_bet_horses', userId),
    executeTool('get_my_jockey_stats', userId),
    executeTool('get_my_horse_jockey_combinations', userId),
  ]);
  
  return {
    stats: stats.data,
    hippodromes: hippodromes.data.hippodromes,
    topHorses: horses.data.top_10_chevaux,
    topJockeys: jockeys.data.top_10_jockeys,
    bestCombinations: combinations.data.top_10_combinaisons,
  };
}
```

### Analyse comparative

```javascript
// Comparer les performances sur différentes périodes
async function comparePerformances(userId) {
  const [week, month, all] = await Promise.all([
    executeTool('get_user_stats', userId, { period: 'week' }),
    executeTool('get_user_stats', userId, { period: 'month' }),
    executeTool('get_user_stats', userId, { period: 'all' }),
  ]);
  
  return {
    week: week.data,
    month: month.data,
    all: all.data,
  };
}
```

## 🎯 Bonnes pratiques

1. **Toujours gérer les erreurs**
```javascript
try {
  const result = await executeTool('get_user_stats', userId);
  // Traiter le résultat
} catch (error) {
  console.error('Erreur:', error.message);
  // Afficher un message à l'utilisateur
}
```

2. **Mettre en cache les résultats**
```javascript
const cache = new Map();

async function getCachedStats(userId, period) {
  const key = `${userId}-${period}`;
  
  if (cache.has(key)) {
    return cache.get(key);
  }
  
  const stats = await executeTool('get_user_stats', userId, { period });
  cache.set(key, stats);
  
  return stats;
}
```

3. **Limiter les appels API**
```javascript
import { debounce } from 'lodash';

const debouncedFetch = debounce(async (userId) => {
  const stats = await executeTool('get_user_stats', userId);
  updateUI(stats);
}, 500);
```

## 📖 Documentation complète

Pour plus d'informations, consultez :
- [README.md](./README.md) - Documentation complète
- [QUICK_START.md](./QUICK_START.md) - Guide de démarrage rapide
