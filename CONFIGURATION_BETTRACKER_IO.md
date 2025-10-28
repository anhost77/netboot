# 🚀 Configuration Plesk pour bettracker.io

## 📋 Vue d'ensemble

Vous allez configurer **2 domaines** dans Plesk :
1. **`bettracker.io`** → Pour le frontend (interface utilisateur)
2. **`api.bettracker.io`** → Pour le backend (API)

---

## 🌐 Étape 1 : Ajouter le domaine principal

### Dans Plesk :

1. **Allez dans "Domaines"** (dans le menu de gauche)
2. Cliquez sur **"Ajouter un domaine"**
3. **Remplissez le formulaire :**

   ```
   Nom de domaine : bettracker.io

   ☑ Hébergement web
   Document root : /httpdocs

   ☑ SSL/TLS (Let's Encrypt)

   Utilisateur système : (laissez par défaut ou créez un nouveau)
   ```

4. Cliquez sur **"OK"** ou **"Ajouter"**

### ✅ Vérification :

Vous devriez maintenant voir **`bettracker.io`** dans votre liste de domaines.

---

## 🔧 Étape 2 : Ajouter le sous-domaine API

### Dans Plesk :

1. **Allez dans "Domaines"**
2. Cliquez sur **"Ajouter un sous-domaine"**
3. **Remplissez le formulaire :**

   ```
   Nom du sous-domaine : api
   Domaine parent : bettracker.io

   ☑ Hébergement web
   Document root : /api.bettracker.io

   ☑ SSL/TLS (Let's Encrypt)
   ```

4. Cliquez sur **"OK"** ou **"Ajouter"**

### ✅ Vérification :

Vous devriez maintenant voir :
- **`bettracker.io`** (domaine principal)
- **`api.bettracker.io`** (sous-domaine)

---

## 🗄️ Étape 3 : Créer la base de données PostgreSQL

### Dans Plesk :

1. **Allez dans "Bases de données"**
2. Cliquez sur **"Ajouter une base de données"**
3. **Remplissez le formulaire :**

   ```
   Nom de la base de données : bettracker_db
   Type : PostgreSQL

   Nom d'utilisateur : bettracker_user
   Mot de passe : (générez un mot de passe fort)

   ☑ Notez bien ce mot de passe !
   ```

4. Cliquez sur **"OK"**

### ✅ Vérification :

Vous devriez voir votre base de données PostgreSQL :
- **Nom** : `bettracker_db`
- **Utilisateur** : `bettracker_user`
- **Serveur** : `localhost`
- **Port** : `5432`

---

## 📝 Étape 4 : Noter les informations importantes

**Copiez ces informations dans un fichier texte sécurisé :**

```
=== CONFIGURATION BETTRACKER.IO ===

DOMAINES :
- Frontend : bettracker.io
- API : api.bettracker.io

BASE DE DONNÉES :
- Type : PostgreSQL
- Nom : bettracker_db
- Utilisateur : bettracker_user
- Mot de passe : [VOTRE_MOT_DE_PASSE_ICI]
- Serveur : localhost
- Port : 5432

CHEMINS SERVEUR :
- Frontend : /var/www/vhosts/bettracker.io/httpdocs
- Backend : /var/www/vhosts/bettracker.io/api.bettracker.io
```

---

## 🔐 Étape 5 : Vérifier l'accès SSH (optionnel)

### Si vous avez accès SSH :

1. **Allez dans "Accès web"** pour le domaine `bettracker.io`
2. Cherchez **"Accès SSH"**
3. Si disponible, notez :
   - **Utilisateur SSH** : _________
   - **Serveur SSH** : bettracker.io (ou l'IP de votre serveur)

### Pour tester l'accès SSH depuis votre ordinateur :

```bash
ssh utilisateur@bettracker.io
# ou
ssh utilisateur@IP_DU_SERVEUR
```

---

## 🌐 Étape 6 : Configuration DNS (IMPORTANT)

### Vérifier que votre domaine pointe vers le serveur Plesk :

1. **Allez chez votre registrar** (là où vous avez acheté bettracker.io)
2. **Configurez les DNS :**

   ```
   Type A :
   bettracker.io → IP_DE_VOTRE_SERVEUR_PLESK

   Type A :
   api.bettracker.io → IP_DE_VOTRE_SERVEUR_PLESK

   Type A (optionnel) :
   www.bettracker.io → IP_DE_VOTRE_SERVEUR_PLESK
   ```

3. **Attendez 5-30 minutes** que les DNS se propagent

### ✅ Vérifier que ça fonctionne :

Ouvrez un terminal et testez :

```bash
ping bettracker.io
ping api.bettracker.io
```

Les deux doivent répondre avec l'IP de votre serveur Plesk.

---

## 🎯 Récapitulatif : Qu'avez-vous fait ?

✅ Domaine principal créé : `bettracker.io`
✅ Sous-domaine API créé : `api.bettracker.io`
✅ Base PostgreSQL créée : `bettracker_db`
✅ Utilisateur DB créé : `bettracker_user`
✅ DNS configuré (en propagation)

---

## 🚀 Prochaine étape : Déployer l'application

Maintenant que Plesk est configuré, vous pouvez déployer :

### Option 1 : Guide détaillé
→ Ouvrez **`DEPLOIEMENT_PLESK_BETTRACKER_IO.md`** (je vais le créer pour vous)

### Option 2 : Checklist
→ Ouvrez **`CHECKLIST_DEPLOIEMENT.md`** et remplacez :
- `votredomaine.com` → `bettracker.io`
- `api.votredomaine.com` → `api.bettracker.io`

---

## ⏱️ Temps total : ~15 minutes

- Ajouter domaine : 3 min
- Ajouter sous-domaine : 3 min
- Créer base de données : 3 min
- Configuration DNS : 5 min
- Propagation DNS : 5-30 min

---

## 📞 Besoin d'aide ?

**Problème avec DNS ?**
- Vérifiez que bettracker.io pointe vers l'IP de votre Plesk
- Attendez 30 min max pour la propagation

**Problème avec PostgreSQL ?**
- Vérifiez qu'il est bien sélectionné (pas MySQL)
- Notez bien le mot de passe !

**Problème avec les domaines ?**
- Vérifiez qu'ils sont actifs dans Plesk
- Vérifiez que l'hébergement est activé

---

## 🎉 C'est fait !

Votre Plesk est maintenant configuré pour **bettracker.io** !

**Prochaine étape :** Déployer le code (backend + frontend)

Dites-moi quand vous avez terminé ces étapes ! 😊
