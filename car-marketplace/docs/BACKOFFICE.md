# Guide du Backoffice AutoMarket

## 🔐 Accès à l'administration

### Connexion

1. Accédez à la page de connexion : `http://localhost:3000/admin/login`
2. Utilisez les identifiants par défaut :
   - **Utilisateur** : `admin`
   - **Mot de passe** : `admin123`

### Sécurité

⚠️ **IMPORTANT** : Changez le mot de passe admin dans un environnement de production !

## 📊 Tableau de bord

Après connexion, vous accédez au tableau de bord principal avec 3 sections :

### 📄 Pages de contenu
Gérez toutes les pages statiques du site (mentions légales, contact, CGU, etc.)

### 🧭 Menus
Configurez les menus de navigation (header et footer)

### ✍️ Contenu éditorial
Modifiez les textes de la page d'accueil

## 📄 Gestion des pages

### Créer une nouvelle page

1. Cliquez sur **"Pages de contenu"** dans le menu
2. Cliquez sur **"+ Nouvelle page"**
3. Remplissez le formulaire :
   - **Titre** : Le titre de votre page
   - **Slug** : L'URL de la page (généré automatiquement, modifiable)
   - **Contenu** : Utilisez l'éditeur WYSIWYG pour créer votre contenu
   - **Publier** : Cochez pour rendre la page visible publiquement

### Éditeur WYSIWYG

L'éditeur vous permet de :
- **Formater le texte** : Gras, italique, souligné
- **Ajouter des titres** : H1 à H6
- **Créer des listes** : À puces ou numérotées
- **Insérer des liens** : Vers d'autres pages
- **Ajouter des images** : Via URL
- **Changer les couleurs** : Texte et fond
- **Aligner le texte** : Gauche, centre, droite

### Optimisation SEO

Pour chaque page, vous pouvez configurer :

#### Titre SEO (balise title)
- Maximum 60 caractères
- Apparaît dans l'onglet du navigateur
- Très important pour le référencement

**Exemple** : `Contact - AutoMarket | Marketplace Voitures`

#### Description SEO (meta description)
- Maximum 160 caractères
- Apparaît dans les résultats Google
- Doit être attractive et descriptive

**Exemple** : `Contactez l'équipe AutoMarket pour toute question sur l'achat ou la vente de voitures d'occasion. Service client disponible 7j/7.`

### Modifier une page existante

1. Allez dans **"Pages de contenu"**
2. Cliquez sur **"✏️ Modifier"** sur la page souhaitée
3. Effectuez vos modifications
4. Cliquez sur **"Enregistrer"**

### Voir une page

Cliquez sur **"👁️ Voir"** pour ouvrir la page dans un nouvel onglet.

### Supprimer une page

Cliquez sur **"🗑️ Supprimer"** (confirmation demandée).

### Structure d'URL

Les pages sont accessibles via : `/page/[slug]`

**Exemples** :
- `/page/mentions-legales`
- `/page/contact`
- `/page/conditions-generales`

## 🧭 Gestion des menus

### Menus disponibles

Le système gère 2 menus :
1. **Menu Principal** (header) - Navigation en haut du site
2. **Menu Footer** - Liens dans le pied de page

### Modifier un menu

1. Cliquez sur **"Menus"** dans le menu admin
2. Cliquez sur **"✏️ Modifier"** sur le menu souhaité
3. Une fenêtre s'ouvre avec la liste des éléments

### Ajouter un élément de menu

1. Dans l'éditeur de menu, cliquez sur **"+ Ajouter un élément"**
2. Remplissez :
   - **Label** : Texte affiché (ex: "Contact")
   - **URL** : Lien (ex: `/page/contact` ou `/` pour l'accueil)
3. Cliquez sur **"Enregistrer"**

### Modifier un élément

Modifiez directement le label ou l'URL dans les champs.

### Supprimer un élément

Cliquez sur l'icône **🗑️** à droite de l'élément.

### Ordre des éléments

Les éléments sont affichés dans l'ordre de la liste. L'ordre est automatiquement géré.

### Exemples d'URL

- Page d'accueil : `/`
- Déposer une annonce : `/post-ad`
- Page de contenu : `/page/mentions-legales`
- Lien externe : `https://www.example.com`

## ✍️ Contenu éditorial

### Bannière de la page d'accueil

Modifiez les textes principaux affichés en haut de la page d'accueil :

1. Cliquez sur **"Contenu éditorial"**
2. Modifiez :
   - **Titre principal** : Le grand titre (ex: "Trouvez la voiture de vos rêves")
   - **Sous-titre** : La description (ex: "Des milliers d'annonces vérifiées")
3. Cliquez sur **"Enregistrer"**

### Aperçu en direct

Un aperçu vous montre comment le contenu apparaîtra sur le site.

## 🔍 Référencement SEO

### Métadonnées automatiques

Le site génère automatiquement :
- **Balises Open Graph** : Pour Facebook, LinkedIn
- **Twitter Cards** : Pour Twitter
- **Structured Data (JSON-LD)** : Pour les moteurs de recherche
- **Canonical URLs** : Pour éviter le contenu dupliqué

### Structured Data

Le site génère automatiquement des données structurées pour :
- **Organisation** : Informations sur AutoMarket
- **Produits** : Chaque annonce de voiture
- **Site Web** : Informations générales

### Conseils SEO

#### Pour les titres
✅ Bon : `Contact - AutoMarket | Marketplace Voitures`
❌ Mauvais : `Contact`

#### Pour les descriptions
✅ Bon : `Contactez notre équipe pour toute question sur l'achat ou la vente de voitures d'occasion. Service client disponible 7j/7.`
❌ Mauvais : `Page de contact`

#### Pour le contenu
- Utilisez des **titres structurés** (H2, H3)
- Créez des **paragraphes courts**
- Ajoutez des **liens internes**
- Utilisez des **mots-clés pertinents**

## 🎨 Bonnes pratiques

### Organisation des pages

1. **Mentions légales** : Informations légales obligatoires
2. **Politique de confidentialité** : Protection des données
3. **CGU** : Conditions d'utilisation
4. **Contact** : Coordonnées et formulaire
5. **À propos** : Présentation de l'entreprise
6. **FAQ** : Questions fréquentes

### Structure des menus

#### Menu Principal (Header)
- Liens essentiels (3-5 maximum)
- Navigation principale
- Exemples : Accueil, Déposer une annonce

#### Menu Footer
- Liens légaux et informatifs
- Peut contenir plus d'éléments (5-10)
- Exemples : Mentions légales, CGU, Contact, etc.

### Rédaction de contenu

1. **Soyez clair et concis**
2. **Utilisez des listes** à puces
3. **Structurez avec des titres**
4. **Ajoutez des liens** utiles
5. **Pensez à l'utilisateur** avant tout

## 🔒 Déconnexion

Pour vous déconnecter :
1. Cliquez sur **"Déconnexion"** dans le header admin
2. Ou fermez simplement votre navigateur

## 🆘 Résolution de problèmes

### Je ne peux pas me connecter

- Vérifiez vos identifiants
- Assurez-vous que le backend est démarré
- Vérifiez la console du navigateur (F12)

### Mes modifications ne s'affichent pas

- Videz le cache du navigateur (Ctrl+Shift+R)
- Vérifiez que la page est bien publiée
- Vérifiez que le menu est correctement configuré

### L'éditeur WYSIWYG ne fonctionne pas

- Assurez-vous que `react-quill` est installé : `cd frontend && npm install`
- Redémarrez le serveur de développement

### Les images ne s'affichent pas

- Vérifiez que l'URL de l'image est valide
- Assurez-vous que l'image est accessible publiquement

## 📱 Responsive

L'interface admin est entièrement responsive :
- **Desktop** : Interface complète avec sidebar
- **Tablet** : Adaptation de la mise en page
- **Mobile** : Menu empilé verticalement

## 🚀 Prochaines étapes

### Améliorations possibles

- [ ] Upload d'images directement dans l'éditeur
- [ ] Gestion des médias (bibliothèque)
- [ ] Éditeur de thème (couleurs, polices)
- [ ] Statistiques de pages vues
- [ ] Multilingue
- [ ] Versioning des pages
- [ ] Prévisualisation avant publication
- [ ] Programmation de publication

## 📚 Ressources

### Documentation technique

- **API Documentation** : Voir `docs/API.md`
- **Installation** : Voir `docs/INSTALLATION.md`
- **README général** : Voir `README.md`

### Support

Pour toute question :
- Ouvrez une issue sur le repository
- Consultez la documentation technique
- Contactez l'équipe de développement

---

**Bonne gestion de contenu ! 🎉**
