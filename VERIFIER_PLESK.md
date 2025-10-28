# ✅ Vérification Plesk - BetTracker Pro

Vous avez : **Plesk Obsidian Web Pro Edition v18.0.72** ✅

---

## 🔍 Étapes de vérification (5 minutes)

### 1️⃣ Vérifier Node.js

**Comment faire :**

1. Dans Plesk, allez dans le menu de gauche
2. Cherchez **"Extensions"** (en bas)
3. Cliquez sur **"Extensions"**
4. Cherchez **"Node.js"** dans la liste

**Résultat attendu :**

✅ **Si Node.js est installé :**
- Vous verrez "Node.js" avec une version (ex: 18.x, 20.x)
- Vous pourrez cliquer dessus pour voir les détails
- → **PARFAIT ! Passez à l'étape 2**

❌ **Si Node.js n'est PAS installé :**
- Vous verrez un bouton "Installer" ou "Get"
- Cliquez sur "Installer" ou "Get"
- Attendez l'installation (2-5 minutes)
- → **Ensuite passez à l'étape 2**

---

### 2️⃣ Vérifier PostgreSQL

**Comment faire :**

1. Dans Plesk, allez dans **"Bases de données"** (dans le menu de gauche)
2. Cliquez sur **"Ajouter une base de données"**
3. Regardez si **PostgreSQL** est disponible dans le menu déroulant "Type de base de données"

**Résultat attendu :**

✅ **Si PostgreSQL est disponible :**
- Vous voyez "PostgreSQL" dans la liste des types
- → **PARFAIT ! Passez à l'étape 3**

❌ **Si PostgreSQL n'est PAS disponible :**
- Vous voyez seulement "MySQL" ou "MariaDB"
- → **Voir la section "Solutions" en bas**

---

### 3️⃣ Vérifier l'accès SSH (optionnel mais recommandé)

**Comment faire :**

1. Dans Plesk, allez dans **"Accès web"** (Web Hosting Access)
2. Regardez si vous voyez une section **"Accès SSH"** ou **"Shell Access"**

**Résultat attendu :**

✅ **Si l'accès SSH est disponible :**
- Vous voyez un nom d'utilisateur SSH
- Vous pouvez activer/désactiver SSH
- → **PARFAIT ! Le déploiement sera plus facile**

❌ **Si l'accès SSH n'est PAS disponible :**
- Pas de section SSH visible
- → **Pas grave, vous pouvez quand même déployer, mais ça sera un peu plus manuel**

---

### 4️⃣ Vérifier votre domaine

**Comment faire :**

1. Dans Plesk, allez dans **"Domaines"**
2. Vérifiez que vous avez au moins un domaine configuré

**Résultat attendu :**

✅ **Si vous avez un domaine :**
- Vous voyez votre domaine (ex: monsite.com)
- → **PARFAIT ! Notez ce nom de domaine**

---

## 📊 Récapitulatif

Remplissez ce tableau après vos vérifications :

| Composant | Statut | Notes |
|-----------|--------|-------|
| Node.js | ✅ / ❌ | Version : _____ |
| PostgreSQL | ✅ / ❌ | |
| Accès SSH | ✅ / ❌ | Optionnel |
| Domaine | ✅ / ❌ | Nom : _____ |

---

## 🎯 Scénarios possibles

### ✅ **Scénario IDÉAL (tout est OK)**
- Node.js ✅
- PostgreSQL ✅
- SSH ✅
- Domaine ✅

→ **Vous pouvez suivre le guide `DEPLOIEMENT_PLESK.md` tel quel !** 🎉

---

### ⚠️ **Scénario COURANT (PostgreSQL manquant)**
- Node.js ✅
- PostgreSQL ❌
- SSH ✅
- Domaine ✅

→ **Solution 1 : Installer PostgreSQL**
```bash
# Via SSH, installer PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib
```

→ **Solution 2 : Utiliser MySQL à la place**
- Modifiez le fichier `backend/prisma/schema.prisma`
- Changez `provider = "postgresql"` en `provider = "mysql"`
- Utilisez MySQL au lieu de PostgreSQL

→ **Solution 3 : Base de données externe**
- Backend sur Plesk
- Base de données sur Railway (gratuit) ou ElephantSQL (gratuit PostgreSQL)

---

### ❌ **Scénario DIFFICILE (Node.js et PostgreSQL manquants)**
- Node.js ❌
- PostgreSQL ❌

→ **Solutions alternatives :**

**Option A : Upgrade votre Plesk**
- Contactez votre hébergeur
- Demandez l'activation de Node.js et PostgreSQL
- Coût : Peut-être gratuit selon votre plan

**Option B : Hébergement hybride**
- Frontend statique (HTML) sur Plesk
- Backend + DB sur Railway (~7€/mois)

**Option C : Hébergement complet ailleurs**
- Tout sur Vercel (frontend) + Railway (backend)
- Ou tout sur un VPS (Hetzner ~5€/mois)

---

## 🔧 Installation de Node.js dans Plesk

Si Node.js n'est pas installé :

1. **Via l'interface Plesk :**
   - Extensions → Catalogue
   - Cherchez "Node.js"
   - Cliquez sur "Installer"

2. **Via ligne de commande (SSH) :**
   ```bash
   # Installer Node.js 20.x
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt install -y nodejs

   # Vérifier
   node --version
   npm --version
   ```

---

## 🐘 Installation de PostgreSQL

Si PostgreSQL n'est pas disponible :

```bash
# Via SSH
sudo apt update
sudo apt install postgresql postgresql-contrib

# Vérifier
sudo systemctl status postgresql

# Créer un utilisateur PostgreSQL
sudo -u postgres createuser --interactive
# Nom: votre_utilisateur_plesk
# Superuser: yes
```

---

## 📞 Contact avec votre hébergeur

Si vous n'arrivez pas à installer Node.js ou PostgreSQL, contactez votre hébergeur :

**Questions à poser :**
```
Bonjour,

J'utilise Plesk Obsidian Web Pro Edition v18.0.72 et j'aimerais
héberger une application Node.js avec une base PostgreSQL.

Questions :
1. Est-ce que Node.js est disponible/installable sur mon plan ?
2. Est-ce que PostgreSQL est disponible/installable ?
3. Est-ce que j'ai besoin d'un upgrade de mon plan ?

Merci !
```

---

## 🚀 Prochaines étapes

Une fois que vous avez vérifié tout ça :

1. **Tout est OK ?**
   → Suivez le guide `DEPLOIEMENT_PLESK.md`

2. **Il manque des choses ?**
   → Choisissez une solution alternative ci-dessus

3. **Besoin d'aide ?**
   → Dites-moi ce qui est disponible et je vous guiderai

---

**Créé le :** 28 octobre 2025
**Version Plesk testée :** Obsidian Web Pro Edition v18.0.72
