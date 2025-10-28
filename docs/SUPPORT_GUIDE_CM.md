# 📚 Guide Support - Community Managers

## 🎯 Objectif

Ce guide explique comment gérer efficacement les tickets de support et utiliser correctement les statuts pour assurer un suivi optimal des demandes utilisateurs.

---

## 📊 Interface Support Admin

### Accès
```
URL: http://localhost:3000/admin/support
```

### Vue d'ensemble
L'interface affiche :
- **5 statistiques** : Total, Nouveaux, En cours, Attente client, Résolus
- **Liste des tickets** : Filtrable par statut et priorité
- **Détails du ticket** : Conversation complète avec l'utilisateur
- **Actions rapides** : Boutons pour changer le statut

---

## 🏷️ Les 5 Statuts de Ticket

### 1. 🔵 **Nouveau** (`new`)
**Quand l'utiliser :**
- Ticket vient d'être créé par l'utilisateur
- Aucune action n'a encore été prise

**Action à prendre :**
- Lire le ticket
- Comprendre la demande
- Passer au statut "En cours" quand vous commencez à traiter

**Notification envoyée :** ❌ Aucune

---

### 2. 🟡 **En cours** (`in_progress`)
**Quand l'utiliser :**
- Vous êtes en train de traiter le ticket
- Vous recherchez une solution
- Vous avez répondu et attendez un retour interne

**Action à prendre :**
- Répondre à l'utilisateur
- Investiguer le problème
- Demander des informations complémentaires si besoin

**Notification envoyée :** ❌ Aucune (sauf si vous répondez)

**💡 Astuce :** Ce statut se met automatiquement quand vous envoyez une réponse

---

### 3. 🟠 **En attente client** (`waiting_customer`)
**Quand l'utiliser :**
- Vous avez répondu et attendez une réponse de l'utilisateur
- Vous avez demandé des informations complémentaires
- La balle est dans le camp de l'utilisateur

**Action à prendre :**
- Attendre la réponse de l'utilisateur
- Relancer après 48-72h si pas de réponse
- Fermer après 7 jours sans réponse

**Notification envoyée :** ⚠️ **OUI** - Type: Warning (Orange)
```
Titre: "Ticket de support : En attente de votre réponse"
Message: "Votre ticket '[Sujet]' est maintenant en attente de votre réponse."
```

**📧 Email envoyé :** Selon les préférences utilisateur

---

### 4. 🟢 **Résolu** (`resolved`)
**Quand l'utiliser :**
- Le problème est résolu
- La question a reçu une réponse satisfaisante
- L'utilisateur a confirmé que c'est OK
- Vous avez fourni une solution complète

**Action à prendre :**
- Vérifier que la solution est claire
- S'assurer que l'utilisateur est satisfait
- Le ticket peut être rouvert si besoin

**Notification envoyée :** ✅ **OUI** - Type: Success (Vert)
```
Titre: "Ticket de support : Résolu"
Message: "Votre ticket '[Sujet]' est maintenant résolu."
```

**📧 Email envoyé :** Selon les préférences utilisateur

**💡 Astuce :** Utilisez ce statut même si vous n'avez pas de confirmation explicite de l'utilisateur

---

### 5. ⚫ **Fermé** (`closed`)
**Quand l'utiliser :**
- Le ticket est définitivement terminé
- Aucune action supplémentaire n'est nécessaire
- Après 7 jours sans réponse en "En attente client"
- Ticket spam ou invalide

**Action à prendre :**
- Archivage automatique
- Plus de notifications envoyées
- Peut être rouvert si nécessaire

**Notification envoyée :** ℹ️ **OUI** - Type: Info (Bleu)
```
Titre: "Ticket de support : Fermé"
Message: "Votre ticket '[Sujet]' est maintenant fermé."
```

**📧 Email envoyé :** Selon les préférences utilisateur

---

## 🔄 Workflow Recommandé

### Scénario 1 : Question Simple
```
1. 🔵 Nouveau
   ↓ (Vous lisez le ticket)
2. 🟡 En cours
   ↓ (Vous répondez avec la solution)
3. 🟢 Résolu
   ↓ (Après 24h sans réponse)
4. ⚫ Fermé
```

### Scénario 2 : Problème Technique Complexe
```
1. 🔵 Nouveau
   ↓ (Vous commencez l'investigation)
2. 🟡 En cours
   ↓ (Vous demandez des infos complémentaires)
3. 🟠 En attente client
   ↓ (L'utilisateur répond)
2. 🟡 En cours
   ↓ (Vous trouvez et appliquez la solution)
3. 🟢 Résolu
   ↓ (L'utilisateur confirme)
4. ⚫ Fermé
```

### Scénario 3 : Utilisateur Ne Répond Pas
```
1. 🔵 Nouveau
   ↓
2. 🟡 En cours
   ↓ (Vous demandez des précisions)
3. 🟠 En attente client
   ↓ (Pas de réponse après 3 jours - Relance)
3. 🟠 En attente client
   ↓ (Toujours pas de réponse après 7 jours)
4. ⚫ Fermé (avec message "Fermé faute de réponse")
```

---

## 📧 Système de Notifications

### Préférences Utilisateur
Chaque utilisateur peut choisir comment recevoir les notifications :

| Préférence | Web | Email | Push |
|------------|-----|-------|------|
| `web_only` | ✅ | ❌ | ❌ |
| `email_only` | ❌ | ✅ | ❌ |
| `both` | ✅ | ✅ | ✅ |
| `none` | ❌ | ❌ | ❌ |

**💡 Important :** Le système respecte automatiquement ces préférences. Vous n'avez rien à faire !

### Quand les Notifications sont Envoyées

**✅ Notification envoyée :**
- Quand vous **répondez** au ticket
- Quand vous passez en **"En attente client"**
- Quand vous passez en **"Résolu"**
- Quand vous passez en **"Fermé"**

**❌ Pas de notification :**
- Passage de "Nouveau" à "En cours"
- Changements internes de statut

---

## ✍️ Bonnes Pratiques de Réponse

### 1. Réponse Initiale (< 2h)
```markdown
Bonjour [Prénom],

Merci pour votre message. J'ai bien pris en compte votre demande concernant [sujet].

[Réponse ou demande d'informations]

Je reste à votre disposition.

Cordialement,
[Votre prénom]
Équipe Support BetTracker Pro
```

### 2. Demande d'Informations
```markdown
Bonjour [Prénom],

Pour mieux vous aider, pourriez-vous me préciser :
- [Question 1]
- [Question 2]
- [Question 3]

Cela me permettra de vous apporter une solution adaptée.

Merci d'avance,
[Votre prénom]
```

**⚠️ N'oubliez pas :** Passer le ticket en "En attente client" après cette réponse !

### 3. Solution Fournie
```markdown
Bonjour [Prénom],

J'ai trouvé la solution à votre problème :

[Explication détaillée de la solution]

Étapes à suivre :
1. [Étape 1]
2. [Étape 2]
3. [Étape 3]

N'hésitez pas à me recontacter si vous avez besoin d'aide supplémentaire.

Cordialement,
[Votre prénom]
```

**✅ Action :** Passer en "Résolu" après cette réponse

### 4. Fermeture Sans Réponse
```markdown
Bonjour [Prénom],

N'ayant pas eu de retour de votre part depuis [X jours], je considère que votre problème est résolu.

Je ferme donc ce ticket. Si vous avez encore besoin d'aide, n'hésitez pas à créer un nouveau ticket ou à répondre à celui-ci.

Cordialement,
[Votre prénom]
```

**⚫ Action :** Passer en "Fermé"

---

## 🎯 Objectifs de Performance

### Temps de Réponse
- **Première réponse** : < 2 heures (pendant les heures ouvrables)
- **Réponses suivantes** : < 4 heures
- **Résolution** : < 24 heures pour 80% des tickets

### Taux de Satisfaction
- **Objectif** : > 90% de tickets résolus au premier contact
- **Suivi** : Demander un feedback après résolution

### Gestion de la File
- **Tickets "Nouveau"** : Traiter en priorité
- **Tickets "En attente client"** : Relancer après 3 jours
- **Tickets "En cours"** : Ne pas laisser stagner > 24h

---

## 🚨 Cas Particuliers

### Ticket Spam
```
1. Vérifier que c'est bien du spam
2. Passer directement en "Fermé"
3. Pas de réponse nécessaire
```

### Ticket Urgent (Bug Critique)
```
1. Passer en "En cours" immédiatement
2. Escalader à l'équipe technique
3. Tenir l'utilisateur informé toutes les 2h
4. Passer en "Résolu" une fois le bug corrigé
```

### Demande de Fonctionnalité
```
1. Remercier l'utilisateur pour sa suggestion
2. Expliquer le processus de prise en compte
3. Passer en "Résolu" (la demande est notée)
4. Transférer à l'équipe produit
```

### Utilisateur Mécontent
```
1. Rester calme et professionnel
2. S'excuser pour le désagrément
3. Proposer une solution concrète
4. Escalader si nécessaire
5. Suivre de près jusqu'à résolution
```

---

## 📊 Tableau de Bord

### Statistiques à Surveiller
- **Total** : Nombre total de tickets
- **Nouveaux** : À traiter en priorité (objectif : 0)
- **En cours** : Vos tickets actifs
- **En attente client** : À relancer après 3 jours
- **Résolus** : Votre performance du jour

### Filtres Disponibles
- **Par statut** : Tous, Nouveau, En cours, En attente client, Résolu, Fermé
- **Par priorité** : Toutes, Basse, Normale, Haute, Urgente
- **Recherche** : Par sujet, message, email ou nom d'utilisateur

---

## 🔍 FAQ CM

### Q: Quand dois-je passer un ticket en "Résolu" vs "Fermé" ?
**R:** Utilisez "Résolu" dès que vous avez fourni une solution complète. Passez en "Fermé" après 24-48h si l'utilisateur ne revient pas, ou immédiatement si l'utilisateur confirme que c'est OK.

### Q: L'utilisateur ne répond pas, que faire ?
**R:** 
1. Relance après 3 jours en "En attente client"
2. Deuxième relance après 5 jours
3. Fermeture après 7 jours avec message explicatif

### Q: Puis-je rouvrir un ticket fermé ?
**R:** Oui ! Si l'utilisateur répond à un ticket fermé, repassez-le en "En cours".

### Q: Comment gérer plusieurs demandes dans un même ticket ?
**R:** Traitez toutes les demandes avant de passer en "Résolu". Si une demande nécessite plus de temps, expliquez-le et gardez en "En cours".

### Q: Que faire si je ne connais pas la réponse ?
**R:** 
1. Accusez réception rapidement
2. Passez en "En cours"
3. Escaladez à l'équipe technique
4. Tenez l'utilisateur informé de l'avancement

### Q: Les notifications sont-elles envoyées à chaque changement de statut ?
**R:** Non, seulement pour les statuts importants : "En attente client", "Résolu", "Fermé", et quand vous répondez.

---

## 📞 Support Interne

### Besoin d'Aide ?
- **Slack** : #support-team
- **Email** : support-internal@bettrackerpro.com
- **Escalade technique** : #dev-team

### Ressources
- **Base de connaissances** : `/docs/kb`
- **Templates de réponses** : `/docs/templates`
- **FAQ technique** : `/docs/faq-tech`

---

## ✅ Checklist Quotidienne

### Début de Journée
- [ ] Vérifier les tickets "Nouveau" (objectif : 0)
- [ ] Relancer les tickets "En attente client" > 3 jours
- [ ] Vérifier les tickets "En cours" > 24h

### Pendant la Journée
- [ ] Répondre aux nouveaux tickets < 2h
- [ ] Mettre à jour les statuts correctement
- [ ] Documenter les problèmes récurrents

### Fin de Journée
- [ ] Fermer les tickets "Résolu" > 24h sans réponse
- [ ] Préparer les tickets pour le lendemain
- [ ] Mettre à jour le rapport quotidien

---

## 🎓 Formation Continue

### Ressources Recommandées
- Guide des erreurs courantes
- Tutoriels vidéo internes
- Sessions de formation hebdomadaires
- Feedback des utilisateurs

### Amélioration Continue
- Analyser les tickets récurrents
- Proposer des améliorations de process
- Partager les bonnes pratiques
- Créer des templates de réponses

---

**📅 Dernière mise à jour :** 28 octobre 2025  
**📝 Version :** 1.0  
**👤 Contact :** support-team@bettrackerpro.com

---

**💡 Rappel Important :**  
Un bon support = Réponse rapide + Statut correct + Communication claire  
Les notifications automatiques font le reste ! 🚀
