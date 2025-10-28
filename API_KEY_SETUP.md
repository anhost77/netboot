# 🔑 Configuration des Clés API - BetTracker Pro

## 📋 Ce qui a été créé

### Backend
- ✅ Champ `apiKey` ajouté au modèle `UserSettings` (Prisma)
- ✅ 3 nouveaux endpoints dans `UserSettingsController` :
  - `POST /user-settings/api-key/generate` - Générer une clé
  - `GET /user-settings/api-key` - Voir la clé (masquée)
  - `DELETE /user-settings/api-key` - Révoquer la clé
- ✅ Méthode `verifyApiKey()` dans `UserSettingsService`
- ✅ API publique dans `/api/v1/` avec authentification par clé API
- ✅ Module `ApiModule` intégré dans `app.module.ts`

### Frontend
- ✅ Composant `ApiKeySection` avec interface complète
- ✅ Méthodes API dans `userSettingsAPI`
- ✅ Intégration dans la page Paramètres

## 🚀 Étapes d'installation

### 1. Migration Prisma

```bash
cd ~/netboot/backend
npx prisma migrate dev --name add_api_key_to_user_settings
npx prisma generate
```

### 2. Redémarrer le backend

```bash
npm run start:dev
```

### 3. Tester l'interface

1. Connectez-vous à l'application
2. Allez dans **Paramètres** (http://localhost:3000/dashboard/settings)
3. Scrollez jusqu'à la section **"Clé API"**
4. Cliquez sur **"Générer une clé API"**
5. **Copiez et sauvegardez la clé** (format: `btk_...`)

### 4. Tester l'API publique

```bash
# Lister les outils disponibles
curl http://localhost:3001/api/v1/tools/list \
  -H "X-API-Key: btk_votre_clé_ici"

# Exécuter un outil
curl -X POST http://localhost:3001/api/v1/tools/execute \
  -H "X-API-Key: btk_votre_clé_ici" \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "get_user_stats",
    "arguments": {"period": "month"}
  }'
```

## 🎨 Interface utilisateur

### Section Clé API

L'interface permet de :
- ✅ **Générer** une nouvelle clé API
- ✅ **Voir** la clé (masquée par défaut)
- ✅ **Copier** la clé en un clic
- ✅ **Révoquer** la clé existante
- ✅ **Régénérer** une nouvelle clé

### Fonctionnalités
- 🔒 **Sécurité** : La clé complète n'est affichée qu'une seule fois lors de la génération
- 👁️ **Visibilité** : Bouton pour afficher/masquer la clé complète
- 📋 **Copie** : Bouton de copie avec feedback visuel
- ⚠️ **Avertissements** : Messages d'alerte pour sauvegarder la clé
- 📚 **Documentation** : Liens vers les guides d'intégration

## 🔧 Utilisation de la clé API

### Avec le serveur MCP (Claude Desktop)

```json
{
  "mcpServers": {
    "bettracker-pro": {
      "command": "node",
      "args": ["/chemin/vers/netboot/mcp-server/dist/index.js"],
      "env": {
        "BETTRACKER_API_URL": "http://localhost:3001",
        "BETTRACKER_API_KEY": "btk_votre_clé_ici"
      }
    }
  }
}
```

### Avec l'API REST

```javascript
const apiKey = 'btk_votre_clé_ici';

// Lister les outils
const tools = await fetch('http://localhost:3001/api/v1/tools/list', {
  headers: { 'X-API-Key': apiKey }
}).then(r => r.json());

// Exécuter un outil
const result = await fetch('http://localhost:3001/api/v1/tools/execute', {
  method: 'POST',
  headers: {
    'X-API-Key': apiKey,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    tool: 'get_user_stats',
    arguments: { period: 'month' }
  })
}).then(r => r.json());
```

## 🛡️ Sécurité

### Génération de clés
- Clés générées avec `crypto.randomBytes(32)` (256 bits)
- Format : `btk_` + 64 caractères hexadécimaux
- Stockées en clair dans la base de données (champ `apiKey` unique)

### Validation
- Vérification automatique via `UserSettingsService.verifyApiKey()`
- Retourne le `userId` associé à la clé
- Erreur 401 si la clé est invalide

### Bonnes pratiques
- ✅ Ne jamais partager votre clé API publiquement
- ✅ Révoquer immédiatement une clé compromise
- ✅ Régénérer régulièrement vos clés
- ✅ Utiliser HTTPS en production

## 📊 Endpoints API disponibles

### Gestion des clés (authentifié JWT)
- `POST /user-settings/api-key/generate` - Générer
- `GET /user-settings/api-key` - Consulter (masquée)
- `DELETE /user-settings/api-key` - Révoquer

### API publique (authentifié par clé API)
- `GET /api/v1/tools/list` - Liste des outils
- `POST /api/v1/tools/execute` - Exécuter un outil
- `GET /api/v1/tools/documentation` - Documentation

## 🎯 Outils disponibles via l'API

1. `get_user_stats` - Statistiques de paris
2. `get_recent_bets` - Derniers paris
3. `get_budget_status` - État du budget
4. `get_user_settings` - Paramètres utilisateur
5. `get_pmu_stats` - Stats PMU globales
6. `get_my_hippodromes` - Liste des hippodromes
7. `get_hippodrome_stats` - Stats par hippodrome
8. `get_my_bet_horses` - Performances des chevaux
9. `get_my_jockey_stats` - Stats des jockeys
10. `get_my_horse_jockey_combinations` - Combinaisons
11. `get_my_cross_stats` - Statistiques croisées

## 📝 Exemple complet

```bash
# 1. Générer une clé via l'interface web
# → Vous obtenez : btk_a1b2c3d4e5f6...

# 2. Tester l'API
curl -X POST http://localhost:3001/api/v1/tools/execute \
  -H "X-API-Key: btk_a1b2c3d4e5f6..." \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "get_my_hippodromes"
  }'

# 3. Réponse
{
  "success": true,
  "tool": "get_my_hippodromes",
  "data": {
    "total": 5,
    "hippodromes": [
      {"code": "ENGHIEN", "name": "ENGHIEN", "count": 9},
      {"code": "CABOURG", "name": "CABOURG", "count": 4},
      ...
    ]
  }
}
```

## 🔄 Migration de la base de données

Le fichier de migration créé :
```sql
-- AlterTable
ALTER TABLE "user_settings" ADD COLUMN "api_key" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "user_settings_api_key_key" ON "user_settings"("api_key");
```

## ✅ Checklist finale

- [ ] Migration Prisma exécutée
- [ ] Backend redémarré
- [ ] Interface testée (génération de clé)
- [ ] API publique testée (curl)
- [ ] Serveur MCP configuré (optionnel)
- [ ] Documentation lue

## 🎉 C'est prêt !

Vous pouvez maintenant :
- Générer des clés API depuis l'interface
- Utiliser l'API publique avec authentification
- Intégrer BetTracker avec Claude Desktop
- Créer vos propres applications avec l'API

Pour plus d'informations, consultez :
- [README MCP Server](./mcp-server/README.md)
- [Guide de démarrage rapide](./mcp-server/QUICK_START.md)
- [Exemples d'utilisation](./mcp-server/EXAMPLES.md)
