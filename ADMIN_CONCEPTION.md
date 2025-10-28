# 🔐 Espace Administrateur - Conception

## 📋 Vue d'ensemble

L'espace administrateur permettra de gérer l'ensemble de la plateforme BetTracker Pro avec un accès sécurisé via authentification admin.

## 🔑 Authentification Admin

### Variables d'environnement (.env)
```env
ADMIN_EMAIL=admin@bettracker.pro
ADMIN_PASSWORD=your_secure_password_here
ADMIN_SECRET_KEY=your_admin_secret_key
```

### Sécurité
- ✅ Authentification JWT avec rôle `admin`
- ✅ Guard `RolesGuard` déjà implémenté dans le backend
- ✅ Middleware de vérification du rôle admin
- ✅ Logs d'audit pour toutes les actions admin

## 📊 Fonctionnalités Backend Existantes

### 1. Dashboard Admin (`/admin/dashboard`)
**Endpoints disponibles :**
- `GET /admin/dashboard/overview` - Vue d'ensemble
  - Total utilisateurs
  - Total paris
  - Revenu total
  - Abonnements actifs
  - Tickets support ouverts
  - Nouveaux utilisateurs (30 derniers jours)

- `GET /admin/dashboard/activity` - Activité récente
  - Paris récents
  - Utilisateurs récents
  - Tickets récents

- `GET /admin/dashboard/charts` - Graphiques
  - Évolution des paris par mois
  - Évolution du revenu par mois
  - Évolution des utilisateurs par mois

### 2. Gestion des Utilisateurs (`/admin/users`)
**Endpoints disponibles :**
- `GET /admin/users` - Liste paginée des utilisateurs
  - Filtres : recherche, rôle
  - Pagination : page, limit

- `PATCH /admin/users/:id/role` - Modifier le rôle d'un utilisateur
  - Rôles : `user`, `admin`, `moderator`

- `DELETE /admin/users/:id` - Supprimer un utilisateur (soft delete)

### 3. Logs d'Audit (`/admin/audit-logs`)
**Endpoints disponibles :**
- `GET /admin/audit-logs` - Historique des actions admin
  - Filtres : adminId, action
  - Pagination : page, limit

## 🎨 Structure Frontend à Créer

### Route : `/admin`

```
/admin
├── /login              # Page de connexion admin
├── /dashboard          # Dashboard principal
├── /users              # Gestion des utilisateurs
├── /bets               # Vue d'ensemble des paris
├── /subscriptions      # Gestion des abonnements
├── /support            # Gestion du support
├── /cms                # Gestion du contenu (CMS)
├── /audit-logs         # Logs d'audit
└── /settings           # Paramètres admin
```

## 📱 Pages à Développer

### 1. 🔐 Page de Connexion Admin (`/admin/login`)
**Fonctionnalités :**
- Formulaire email/mot de passe
- Vérification avec les credentials .env
- Redirection vers `/admin/dashboard` si authentifié
- Design sécurisé et professionnel

**Composants :**
- Input email
- Input password (masqué)
- Bouton de connexion
- Message d'erreur
- Logo/branding

---

### 2. 📊 Dashboard Principal (`/admin/dashboard`)
**Sections :**

#### A. Statistiques Globales (Cards)
- 👥 **Utilisateurs**
  - Total
  - Nouveaux (30j)
  - Croissance %

- 🎲 **Paris**
  - Total
  - Aujourd'hui
  - Cette semaine

- 💰 **Revenus**
  - Total
  - Ce mois
  - Croissance %

- 📝 **Abonnements**
  - Actifs
  - Essais
  - Taux de conversion

- 🎫 **Support**
  - Tickets ouverts
  - En attente
  - Résolus aujourd'hui

#### B. Graphiques
- 📈 Évolution des utilisateurs (6 mois)
- 📈 Évolution des paris (6 mois)
- 📈 Évolution du revenu (6 mois)

#### C. Activité Récente
- **Derniers utilisateurs inscrits**
  - Nom, Email, Date, Rôle
  - Actions rapides

- **Derniers paris**
  - Utilisateur, Montant, Cote, Date
  - Statut

- **Derniers tickets support**
  - Utilisateur, Sujet, Statut, Date
  - Lien vers le ticket

---

### 3. 👥 Gestion des Utilisateurs (`/admin/users`)
**Fonctionnalités :**
- 📋 **Liste des utilisateurs**
  - Tableau avec colonnes :
    - Avatar/Initiales
    - Nom complet
    - Email
    - Rôle
    - Abonnement
    - Date d'inscription
    - Statut (actif/inactif)
    - Actions

- 🔍 **Filtres et Recherche**
  - Recherche par nom/email
  - Filtre par rôle (user, admin, moderator)
  - Filtre par statut d'abonnement
  - Filtre par date d'inscription

- ⚙️ **Actions**
  - Voir le profil détaillé
  - Modifier le rôle
  - Suspendre/Activer le compte
  - Supprimer l'utilisateur
  - Voir l'historique des paris
  - Voir les tickets support

- 📊 **Vue détaillée utilisateur (Modal/Page)**
  - Informations personnelles
  - Statistiques de paris
  - Abonnement actuel
  - Historique des paiements
  - Tickets support
  - Logs d'activité

---

### 4. 🎲 Vue d'ensemble des Paris (`/admin/bets`)
**Fonctionnalités :**
- 📋 **Liste des paris**
  - Tableau avec colonnes :
    - Utilisateur
    - Type de pari
    - Mise
    - Cote
    - Gain potentiel
    - Statut
    - Date
    - Plateforme

- 🔍 **Filtres**
  - Par utilisateur
  - Par statut (en cours, gagné, perdu)
  - Par type de pari
  - Par plateforme
  - Par période

- 📊 **Statistiques**
  - Total des mises
  - Total des gains
  - ROI global
  - Taux de réussite
  - Répartition par type

---

### 5. 💳 Gestion des Abonnements (`/admin/subscriptions`)
**Fonctionnalités :**
- 📋 **Liste des abonnements**
  - Tableau avec colonnes :
    - Utilisateur
    - Plan
    - Statut
    - Prix
    - Cycle de facturation
    - Date de début
    - Date de fin
    - Actions

- 🔍 **Filtres**
  - Par plan (Free, Starter, Pro, Enterprise)
  - Par statut (trial, active, cancelled, expired)
  - Par cycle (monthly, yearly)

- ⚙️ **Actions**
  - Voir les détails
  - Modifier le plan
  - Annuler l'abonnement
  - Prolonger l'essai
  - Voir les factures

- 📊 **Statistiques**
  - MRR (Monthly Recurring Revenue)
  - ARR (Annual Recurring Revenue)
  - Churn rate
  - Répartition par plan
  - Taux de conversion trial → paid

---

### 6. 🎫 Gestion du Support (`/admin/support`)
**Fonctionnalités :**
- 📋 **Liste des tickets**
  - Tableau avec colonnes :
    - ID
    - Utilisateur
    - Sujet
    - Catégorie
    - Priorité
    - Statut
    - Dernière mise à jour
    - Actions

- 🔍 **Filtres**
  - Par statut (new, in_progress, resolved, closed)
  - Par priorité (low, medium, high, urgent)
  - Par catégorie
  - Par utilisateur

- ⚙️ **Actions**
  - Ouvrir le ticket
  - Répondre
  - Changer le statut
  - Assigner à un admin
  - Fermer le ticket

- 📊 **Statistiques**
  - Tickets ouverts
  - Temps de réponse moyen
  - Taux de résolution
  - Satisfaction client

---

### 7. 📝 Gestion du Contenu CMS (`/admin/cms`)
**Fonctionnalités :**
- 📄 **Pages**
  - Liste des pages
  - Créer/Modifier/Supprimer
  - Prévisualisation
  - Publication/Brouillon

- 📰 **Articles de blog**
  - Liste des articles
  - Créer/Modifier/Supprimer
  - Catégories et tags
  - Images et médias

- 🔧 **Paramètres du site**
  - Nom du site
  - Description
  - Logo
  - Favicon
  - Réseaux sociaux

---

### 8. 📜 Logs d'Audit (`/admin/audit-logs`)
**Fonctionnalités :**
- 📋 **Liste des logs**
  - Tableau avec colonnes :
    - Date/Heure
    - Admin
    - Action
    - Cible (utilisateur/ressource)
    - IP
    - Détails

- 🔍 **Filtres**
  - Par admin
  - Par action
  - Par période
  - Par IP

- 📊 **Statistiques**
  - Actions par admin
  - Actions par type
  - Timeline des actions

---

### 9. ⚙️ Paramètres Admin (`/admin/settings`)
**Sections :**

#### A. Paramètres Généraux
- Nom de l'application
- URL du site
- Email de contact
- Fuseau horaire

#### B. Paramètres d'Email
- Configuration SMTP
- Templates d'emails
- Test d'envoi

#### C. Paramètres de Paiement
- Configuration Stripe
- Webhooks
- Mode test/production

#### D. Paramètres de Sécurité
- Durée de session
- Politique de mot de passe
- 2FA obligatoire
- IP autorisées

#### E. Paramètres de Notification
- Notifications admin
- Alertes système
- Seuils d'alerte

---

## 🎨 Design System Admin

### Couleurs
- **Primary** : Bleu foncé (#1e40af)
- **Success** : Vert (#10b981)
- **Warning** : Orange (#f59e0b)
- **Danger** : Rouge (#ef4444)
- **Info** : Bleu clair (#3b82f6)
- **Background** : Gris clair (#f9fafb)
- **Sidebar** : Gris foncé (#1f2937)

### Layout
```
┌─────────────────────────────────────────┐
│  Sidebar    │  Header (breadcrumb)      │
│             ├───────────────────────────┤
│  - Dashboard│                           │
│  - Users    │                           │
│  - Bets     │     Main Content          │
│  - Support  │                           │
│  - CMS      │                           │
│  - Logs     │                           │
│  - Settings │                           │
│             │                           │
│  [Logout]   │                           │
└─────────────────────────────────────────┘
```

### Composants Réutilisables
- **StatCard** : Carte de statistique avec icône
- **DataTable** : Tableau avec tri, pagination, filtres
- **Chart** : Graphiques (Line, Bar, Pie)
- **UserAvatar** : Avatar utilisateur avec fallback
- **StatusBadge** : Badge de statut coloré
- **ActionMenu** : Menu d'actions (3 points)
- **Modal** : Modal réutilisable
- **SearchBar** : Barre de recherche avec filtres
- **Pagination** : Pagination standard

---

## 🔒 Sécurité

### Authentification
1. Login avec email/password depuis .env
2. JWT token avec rôle `admin`
3. Refresh token pour sessions longues
4. Logout sécurisé

### Autorisation
1. Vérification du rôle sur chaque route
2. Guard côté frontend et backend
3. Redirection si non autorisé

### Audit
1. Log de toutes les actions admin
2. Stockage de l'IP et user-agent
3. Historique consultable

---

## 📦 Technologies

### Frontend
- **Next.js 14** : Framework React
- **TypeScript** : Typage fort
- **Tailwind CSS** : Styling
- **Lucide Icons** : Icônes
- **Chart.js / Recharts** : Graphiques
- **React Hook Form** : Formulaires
- **Zod** : Validation
- **React Query** : Gestion d'état serveur

### Backend (Déjà en place)
- **NestJS** : Framework Node.js
- **Prisma** : ORM
- **PostgreSQL** : Base de données
- **JWT** : Authentification
- **Guards & Decorators** : Sécurité

---

## 🚀 Plan de Développement

### Phase 1 : Authentification & Layout
1. ✅ Créer `/admin/login`
2. ✅ Créer le layout admin avec sidebar
3. ✅ Implémenter l'authentification admin
4. ✅ Créer les composants de base (StatCard, DataTable)

### Phase 2 : Dashboard
1. ✅ Implémenter le dashboard principal
2. ✅ Intégrer les graphiques
3. ✅ Afficher les statistiques
4. ✅ Afficher l'activité récente

### Phase 3 : Gestion des Utilisateurs
1. ✅ Liste des utilisateurs
2. ✅ Filtres et recherche
3. ✅ Actions (modifier rôle, supprimer)
4. ✅ Vue détaillée utilisateur

### Phase 4 : Autres Sections
1. ✅ Vue d'ensemble des paris
2. ✅ Gestion des abonnements
3. ✅ Gestion du support
4. ✅ Logs d'audit

### Phase 5 : CMS & Paramètres
1. ✅ Gestion du contenu
2. ✅ Paramètres admin

---

## 📝 Notes Importantes

1. **Sécurité** : Ne jamais exposer les credentials admin dans le code
2. **Performance** : Pagination obligatoire pour toutes les listes
3. **UX** : Confirmations pour toutes les actions destructives
4. **Logs** : Tracer toutes les actions admin
5. **Responsive** : L'admin doit être utilisable sur tablette
6. **Export** : Permettre l'export CSV/Excel des données

---

## 🎯 Prochaines Étapes

1. Créer la structure de dossiers `/admin` dans le frontend
2. Implémenter la page de login admin
3. Créer le layout avec sidebar
4. Développer le dashboard principal
5. Implémenter la gestion des utilisateurs
6. Ajouter les autres sections progressivement

---

**Date de création** : 27 octobre 2025
**Statut** : 📋 En conception
**Priorité** : 🔴 Haute
