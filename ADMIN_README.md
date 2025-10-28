# 🔐 Espace Administrateur - Guide de démarrage

## 📋 Vue d'ensemble

L'espace administrateur permet de gérer l'ensemble de la plateforme BetTracker Pro avec un accès sécurisé.

## 🚀 Démarrage rapide

### 1. Configuration des variables d'environnement

Ajoutez ces variables dans votre fichier `.env` (backend) :

```env
# Admin credentials
ADMIN_EMAIL=admin@bettracker.pro
ADMIN_PASSWORD=VotreMotDePasseSecurise123!
```

### 2. Créer le compte administrateur

Exécutez la commande suivante dans le dossier `backend` :

```bash
npm run create-admin
```

Cette commande va :
- ✅ Créer un utilisateur avec le rôle `admin`
- ✅ Utiliser les credentials du `.env`
- ✅ Hasher le mot de passe de manière sécurisée
- ✅ Marquer l'email comme vérifié

**Sortie attendue :**
```
✅ Admin user created successfully!
📧 Email: admin@bettracker.pro
🔑 Password: VotreMotDePasseSecurise123!
👤 Role: admin

⚠️  Please change the password after first login!
```

Si l'admin existe déjà :
```
✅ Admin already exists: admin@bettracker.pro
Role: admin
```

### 3. Se connecter à l'interface admin

1. Démarrez le frontend : `npm run dev`
2. Accédez à : `http://localhost:3000/admin/login`
3. Connectez-vous avec les credentials du `.env`
4. Vous serez redirigé vers le dashboard admin

## 📱 Pages disponibles

### ✅ Déjà implémentées

#### 1. 🔐 Login Admin (`/admin/login`)
- Authentification sécurisée
- Vérification du rôle admin
- Design professionnel

#### 2. 📊 Dashboard (`/admin/dashboard`)
- **Statistiques globales** :
  - Total utilisateurs + nouveaux (30j)
  - Total paris
  - Revenus totaux
  - Abonnements actifs
  - Tickets support ouverts

- **Activité récente** :
  - Derniers utilisateurs inscrits
  - Derniers paris placés

#### 3. 📐 Layout Admin
- Sidebar avec navigation
- Responsive (desktop + mobile)
- Menu utilisateur avec déconnexion
- Design moderne et professionnel

### 🚧 À implémenter

Les pages suivantes sont prévues mais pas encore développées :

- 👥 **Gestion des utilisateurs** (`/admin/users`)
- 🎲 **Vue d'ensemble des paris** (`/admin/bets`)
- 💳 **Gestion des abonnements** (`/admin/subscriptions`)
- 🎫 **Gestion du support** (`/admin/support`)
- 📜 **Logs d'audit** (`/admin/audit-logs`)
- ⚙️ **Paramètres** (`/admin/settings`)

## 🔒 Sécurité

### Authentification
- ✅ Même système JWT que les utilisateurs normaux
- ✅ Vérification du rôle `admin` sur chaque route
- ✅ Guard frontend + backend
- ✅ Redirection automatique si non autorisé

### Backend
Les routes admin sont protégées par :
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.admin)
```

### Frontend
Le layout admin vérifie automatiquement :
```typescript
if (userData.role !== 'admin') {
  router.push('/admin/login');
  return;
}
```

## 🛠️ API Backend disponibles

### Dashboard
- `GET /admin/dashboard/overview` - Statistiques globales
- `GET /admin/dashboard/activity` - Activité récente
- `GET /admin/dashboard/charts` - Données graphiques

### Gestion des utilisateurs
- `GET /admin/users` - Liste paginée des utilisateurs
- `PATCH /admin/users/:id/role` - Modifier le rôle
- `DELETE /admin/users/:id` - Supprimer un utilisateur

### Logs d'audit
- `GET /admin/audit-logs` - Historique des actions admin

## 📝 Structure des fichiers

```
frontend/
├── app/
│   └── admin/
│       ├── layout.tsx              # Layout avec sidebar
│       ├── login/
│       │   └── page.tsx            # Page de connexion
│       └── dashboard/
│           └── page.tsx            # Dashboard principal
└── lib/
    └── api/
        └── admin.ts                # API client admin

backend/
└── src/
    ├── admin/
    │   ├── admin.controller.ts     # Routes admin
    │   ├── admin-dashboard.service.ts
    │   ├── users-management.service.ts
    │   └── audit-log.service.ts
    └── cli/
        └── create-admin.ts         # Script de création admin
```

## 🎨 Design System

### Couleurs
- **Sidebar** : Gris foncé (#1f2937)
- **Primary** : Bleu (#1e40af)
- **Success** : Vert (#10b981)
- **Warning** : Jaune (#f59e0b)
- **Danger** : Rouge (#ef4444)

### Layout
- Sidebar fixe à gauche (desktop)
- Menu burger (mobile)
- Header avec breadcrumb
- Contenu principal responsive

## 🔄 Workflow de développement

### Pour ajouter une nouvelle page admin :

1. **Créer la page** : `frontend/app/admin/[nom]/page.tsx`
2. **Ajouter la route** dans le layout : `frontend/app/admin/layout.tsx`
3. **Créer l'API** (si nécessaire) : `frontend/lib/api/admin.ts`
4. **Implémenter le backend** (si nécessaire) : `backend/src/admin/`

### Exemple : Ajouter la page "Utilisateurs"

```typescript
// 1. Créer la page
// frontend/app/admin/users/page.tsx
'use client';
export default function AdminUsersPage() {
  // Votre code ici
}

// 2. La route est déjà dans le layout
// Aucune modification nécessaire

// 3. L'API existe déjà
// adminAPI.getUsers() est disponible

// 4. Le backend existe déjà
// GET /admin/users fonctionne
```

## 📊 Prochaines étapes

1. ✅ ~~Créer le compte admin~~
2. ✅ ~~Implémenter le login~~
3. ✅ ~~Créer le layout avec sidebar~~
4. ✅ ~~Développer le dashboard~~
5. 🚧 Implémenter la gestion des utilisateurs
6. 🚧 Ajouter les graphiques (Chart.js)
7. 🚧 Implémenter les autres sections
8. 🚧 Ajouter les exports CSV/Excel
9. 🚧 Implémenter le CMS

## ⚠️ Notes importantes

1. **Sécurité** : Ne jamais commiter le `.env` avec les vrais credentials
2. **Mot de passe** : Changez le mot de passe admin après la première connexion
3. **Rôle** : Seuls les utilisateurs avec `role: 'admin'` peuvent accéder
4. **Logs** : Toutes les actions admin sont tracées dans `audit_logs`

## 🆘 Dépannage

### L'admin ne peut pas se connecter
- Vérifiez que le compte existe : `npm run create-admin`
- Vérifiez les credentials dans le `.env`
- Vérifiez que le rôle est bien `admin` dans la DB

### Redirection vers /admin/login
- Le token JWT a peut-être expiré
- Le rôle n'est pas `admin`
- Reconnectez-vous

### Erreur 403 Forbidden
- L'utilisateur n'a pas le rôle `admin`
- Le token JWT est invalide
- Vérifiez les guards backend

## 📞 Support

Pour toute question ou problème, consultez :
- Documentation backend : `/backend/src/admin/README.md`
- Conception détaillée : `/ADMIN_CONCEPTION.md`
- Schéma Prisma : `/backend/prisma/schema.prisma`

---

**Date de création** : 27 octobre 2025
**Version** : 1.0.0
**Statut** : 🚧 En développement
