# 🎮 Mode Simulation - Guide d'implémentation

## ✅ Déjà implémenté

### 1. Contexte et Toggle UI
- ✅ `ModeContext` créé (`frontend/contexts/ModeContext.tsx`)
- ✅ Toggle Réel/Simulation dans la sidebar
- ✅ Sauvegarde du mode dans localStorage
- ✅ Indicateurs visuels (vert pour Réel, bleu pour Simulation)
- ✅ ModeProvider ajouté dans le layout

### 2. Design du Toggle
- **Mode Réel**: Bouton vert avec icône ⚡ (Zap)
- **Mode Simulation**: Bouton bleu avec icône ▶️ (Play)
- Message contextuel: "💰 Mode réel" ou "🎮 Mode test"

## 📋 À implémenter

### 1. Backend - Ajout du champ `mode` dans la base de données

#### Modifier le schéma Prisma (`backend/prisma/schema.prisma`):

```prisma
model Bet {
  id                String   @id @default(uuid())
  userId            String   @map("user_id")
  // ... autres champs existants
  mode              String   @default("real") // 'real' ou 'simulation'
  // ...
}

model BankrollTransaction {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  // ... autres champs existants
  mode      String   @default("real")
  // ...
}

model Tipster {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  // ... autres champs existants
  mode      String   @default("real")
  // ...
}
```

#### Créer et appliquer la migration:
```bash
cd backend
npx prisma migrate dev --name add_simulation_mode
npx prisma generate
```

### 2. Backend - Middleware pour filtrer par mode

Créer `backend/src/common/decorators/mode.decorator.ts`:

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Mode = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.headers['x-app-mode'] || 'real';
  },
);
```

### 3. Frontend - Intercepteur pour ajouter le mode aux requêtes

Modifier `frontend/lib/api/client.ts`:

```typescript
// Dans le constructor, ajouter un intercepteur
this.client.interceptors.request.use(
  (config) => {
    const token = this.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Ajouter le mode actif
    const mode = localStorage.getItem('app-mode') || 'real';
    config.headers['X-App-Mode'] = mode;
    
    return config;
  },
  (error) => Promise.reject(error)
);
```

### 4. Backend - Modifier les services pour filtrer par mode

Exemple pour `BetsService`:

```typescript
async findAll(userId: string, mode: string = 'real') {
  return this.prisma.bet.findMany({
    where: {
      userId,
      mode, // Filtrer par mode
    },
    include: {
      platform: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

async create(userId: string, createBetDto: CreateBetDto, mode: string = 'real') {
  return this.prisma.bet.create({
    data: {
      ...createBetDto,
      userId,
      mode, // Sauvegarder le mode
    },
  });
}
```

### 5. Backend - Modifier les controllers

```typescript
@Get()
async findAll(@Request() req, @Mode() mode: string) {
  return this.betsService.findAll(req.user.id, mode);
}

@Post()
async create(@Request() req, @Body() createBetDto: CreateBetDto, @Mode() mode: string) {
  return this.betsService.create(req.user.id, createBetDto, mode);
}
```

### 6. Frontend - Indicateur visuel dans le Header

Ajouter un badge dans le header pour rappeler le mode actif:

```typescript
// Dans Header component
import { useMode } from '@/contexts/ModeContext';

const { mode, isSimulation } = useMode();

// Afficher un badge
{isSimulation && (
  <div className="flex items-center space-x-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
    <Play className="h-4 w-4" />
    <span>Mode Simulation</span>
  </div>
)}
```

### 7. Frontend - Avertissement lors du changement de mode

Ajouter une confirmation avant de changer de mode:

```typescript
const handleModeChange = (newMode: AppMode) => {
  if (confirm(`Voulez-vous passer en mode ${newMode === 'real' ? 'Réel' : 'Simulation'} ?`)) {
    setMode(newMode);
    // Recharger la page pour rafraîchir les données
    window.location.reload();
  }
};
```

### 8. Statistiques séparées

Créer une page de comparaison des stats Réel vs Simulation:

```
/dashboard/statistics/comparison
```

Afficher côte à côte:
- ROI en mode réel vs simulation
- Nombre de paris gagnants
- Bankroll évolution
- Meilleurs tipsters par mode

## 🎯 Avantages du système

1. **Test sans risque**: Les utilisateurs peuvent tester leurs stratégies
2. **Apprentissage**: Comprendre le système avant de parier en réel
3. **Comparaison**: Voir si leurs intuitions en simulation fonctionnent en réel
4. **Tipsters test**: Tester de nouveaux tipsters en simulation d'abord
5. **Données séparées**: Aucun mélange entre paris réels et tests

## 🚀 Ordre d'implémentation recommandé

1. ✅ UI et contexte (FAIT)
2. Schéma base de données + migrations
3. Intercepteur frontend
4. Middleware backend
5. Modifier les services (Bets, Bankroll, Tipsters)
6. Modifier les controllers
7. Indicateur visuel dans le header
8. Page de comparaison des stats
9. Tests et validation

## 📝 Notes importantes

- **Par défaut**: Tous les nouveaux paris sont en mode "real"
- **Migration des données existantes**: Tous les paris existants seront marqués comme "real"
- **Isolation complète**: Les données simulation ne doivent JAMAIS affecter les stats réelles
- **Performance**: Indexer le champ `mode` pour des requêtes rapides
