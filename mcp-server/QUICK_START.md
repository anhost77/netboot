# 🚀 Guide de démarrage rapide - BetTracker Pro MCP Server

## Installation en 5 minutes

### 1. Installation des dépendances

```bash
cd mcp-server
npm install
```

### 2. Configuration

```bash
cp .env.example .env
```

Éditez `.env` et ajoutez votre configuration :
```env
BETTRACKER_API_URL=http://localhost:3001
BETTRACKER_API_KEY=your_api_key_here
```

### 3. Build

```bash
npm run build
```

### 4. Test

```bash
npm run dev
```

## 🎯 Intégration Claude Desktop (2 minutes)

### macOS

1. Ouvrez le fichier de configuration :
```bash
code ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

2. Ajoutez cette configuration :
```json
{
  "mcpServers": {
    "bettracker-pro": {
      "command": "node",
      "args": ["/CHEMIN_ABSOLU/netboot/mcp-server/dist/index.js"],
      "env": {
        "BETTRACKER_API_URL": "http://localhost:3001",
        "BETTRACKER_API_KEY": "your_api_key"
      }
    }
  }
}
```

3. Redémarrez Claude Desktop

### Windows

1. Ouvrez : `%APPDATA%\Claude\claude_desktop_config.json`
2. Ajoutez la même configuration (avec le bon chemin Windows)
3. Redémarrez Claude Desktop

### Linux

1. Ouvrez : `~/.config/Claude/claude_desktop_config.json`
2. Ajoutez la configuration
3. Redémarrez Claude Desktop

## 🧪 Test rapide

Ouvrez Claude Desktop et tapez :
```
Montre-moi mes statistiques de paris
```

Claude devrait utiliser l'outil `get_user_stats` et vous afficher vos statistiques !

## 📡 API REST (optionnel)

### Obtenir la liste des outils

```bash
curl http://localhost:3001/api/v1/tools/list \
  -H "X-API-Key: your_api_key"
```

### Exécuter un outil

```bash
curl -X POST http://localhost:3001/api/v1/tools/execute \
  -H "X-API-Key: your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "get_user_stats",
    "arguments": {"period": "month"},
    "userId": "your-user-id"
  }'
```

### Documentation interactive

Ouvrez : http://localhost:3001/api/v1/tools/documentation

## 🔑 Obtenir votre clé API

1. Connectez-vous à BetTracker Pro
2. Allez dans **Paramètres** > **API**
3. Cliquez sur **Générer une clé API**
4. Copiez la clé et ajoutez-la dans votre `.env`

## ❓ Problèmes courants

### "Cannot find module"
```bash
cd mcp-server
npm install
npm run build
```

### "Invalid API key"
Vérifiez que votre clé API est correcte dans le fichier `.env`

### "Connection refused"
Assurez-vous que le backend BetTracker est démarré sur le port 3001

### Claude ne voit pas les outils
1. Vérifiez le chemin absolu dans la configuration
2. Redémarrez complètement Claude Desktop
3. Vérifiez les logs : `~/Library/Logs/Claude/mcp-server-bettracker-pro.log`

## 📚 Documentation complète

Voir [README.md](./README.md) pour la documentation complète.

## 🎉 C'est tout !

Vous pouvez maintenant utiliser tous les outils BetTracker Pro directement dans Claude Desktop ou via l'API REST !
