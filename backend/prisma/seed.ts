import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create subscription plans
  console.log('Creating subscription plans...');
  const plans = await Promise.all([
    prisma.plan.upsert({
      where: { slug: 'gratuit' },
      update: {},
      create: {
        name: 'Gratuit',
        slug: 'gratuit',
        description: 'Plan gratuit pour découvrir l\'application',
        priceMonthly: 0,
        priceYearly: 0,
        maxBetsPerMonth: 20,
        maxStorageMb: 50,
        features: {
          bets: '20 paris/mois',
          storage: '50 MB',
          statistics: 'Statistiques basiques',
          support: 'Support communautaire',
        },
        active: true,
        displayOrder: 1,
      },
    }),
    prisma.plan.upsert({
      where: { slug: 'starter' },
      update: {},
      create: {
        name: 'Starter',
        slug: 'starter',
        description: 'Plan idéal pour commencer',
        priceMonthly: 9.99,
        priceYearly: 95.90,
        maxBetsPerMonth: 100,
        maxStorageMb: 500,
        features: {
          bets: '100 paris/mois',
          storage: '500 MB',
          statistics: 'Statistiques avancées',
          support: 'Support email',
          exports: 'Export CSV',
        },
        active: true,
        displayOrder: 2,
      },
    }),
    prisma.plan.upsert({
      where: { slug: 'pro' },
      update: {},
      create: {
        name: 'Pro',
        slug: 'pro',
        description: 'Pour les parieurs sérieux',
        priceMonthly: 19.99,
        priceYearly: 191.90,
        maxBetsPerMonth: null, // unlimited
        maxStorageMb: 2048,
        features: {
          bets: 'Paris illimités',
          storage: '2 GB',
          statistics: 'Statistiques complètes + Analytics IA',
          support: 'Support prioritaire',
          exports: 'Export CSV + JSON',
          api: 'Accès API',
          reports: 'Rapports mensuels automatiques',
        },
        active: true,
        displayOrder: 3,
      },
    }),
    prisma.plan.upsert({
      where: { slug: 'business' },
      update: {},
      create: {
        name: 'Business',
        slug: 'business',
        description: 'Pour les équipes et professionnels',
        priceMonthly: 49.99,
        priceYearly: 479.90,
        maxBetsPerMonth: null, // unlimited
        maxStorageMb: 10240,
        features: {
          bets: 'Paris illimités',
          storage: '10 GB',
          statistics: 'Statistiques complètes + Analytics IA avancée',
          support: 'Support VIP 24/7',
          exports: 'Export tous formats',
          api: 'Accès API étendu',
          reports: 'Rapports personnalisés',
          users: 'Jusqu\'à 5 utilisateurs',
          customization: 'Personnalisation avancée',
        },
        active: true,
        displayOrder: 4,
      },
    }),
  ]);
  console.log(`✅ Created ${plans.length} plans`);

  // Create admin user
  console.log('Creating admin user...');
  const passwordHash = await bcrypt.hash('Admin123!', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@bettracker.pro' },
    update: {},
    create: {
      email: 'admin@bettracker.pro',
      passwordHash,
      firstName: 'Admin',
      lastName: 'BetTracker',
      role: 'admin',
      emailVerifiedAt: new Date(),
      country: 'FR',
      locale: 'fr',
      timezone: 'Europe/Paris',
    },
  });
  console.log('✅ Created admin user: admin@bettracker.pro / Admin123!');

  // Create CMS pages
  console.log('Creating CMS pages...');
  const cmsPages = await Promise.all([
    prisma.cmsPage.upsert({
      where: { slug: 'cgu' },
      update: {},
      create: {
        slug: 'cgu',
        title: 'Conditions Générales d\'Utilisation',
        content: `
          <h1>Conditions Générales d'Utilisation</h1>
          <p>Dernière mise à jour : ${new Date().toLocaleDateString('fr-FR')}</p>

          <h2>1. Objet</h2>
          <p>Les présentes Conditions Générales d'Utilisation (CGU) régissent l'utilisation de la plateforme BetTracker Pro.</p>

          <h2>2. Inscription</h2>
          <p>L'inscription est réservée aux personnes majeures (18 ans et plus). L'utilisateur garantit l'exactitude des informations fournies.</p>

          <h2>3. Utilisation du service</h2>
          <p>BetTracker Pro est un outil de suivi de paris hippiques. L'utilisateur est seul responsable de ses paris et de leur légalité dans sa juridiction.</p>

          <h2>4. Responsabilités</h2>
          <p>BetTracker Pro ne peut être tenu responsable des pertes liées aux paris effectués par l'utilisateur.</p>

          <h2>5. Avertissement sur les risques</h2>
          <p><strong>JOUER COMPORTE DES RISQUES : ENDETTEMENT, ISOLEMENT, DÉPENDANCE</strong></p>
          <p><strong>POUR ÊTRE AIDÉ, APPELEZ LE 09 74 75 13 13 (GRATUIT)</strong></p>
        `,
        version: 1,
        published: true,
        metaTitle: 'CGU - BetTracker Pro',
        metaDescription: 'Conditions Générales d\'Utilisation de BetTracker Pro',
        publishedAt: new Date(),
      },
    }),
    prisma.cmsPage.upsert({
      where: { slug: 'cgv' },
      update: {},
      create: {
        slug: 'cgv',
        title: 'Conditions Générales de Vente',
        content: `
          <h1>Conditions Générales de Vente</h1>
          <p>Dernière mise à jour : ${new Date().toLocaleDateString('fr-FR')}</p>

          <h2>1. Prix</h2>
          <p>Les prix sont indiqués en euros TTC. Les abonnements sont facturés mensuellement ou annuellement selon le choix de l'utilisateur.</p>

          <h2>2. Paiement</h2>
          <p>Le paiement s'effectue par carte bancaire via Stripe, plateforme de paiement sécurisée.</p>

          <h2>3. Période d'essai</h2>
          <p>Une période d'essai gratuite de 14 jours est offerte. Aucune facturation n'intervient durant cette période.</p>

          <h2>4. Résiliation</h2>
          <p>L'utilisateur peut résilier son abonnement à tout moment. L'accès reste actif jusqu'à la fin de la période payée.</p>

          <h2>5. Remboursement</h2>
          <p>Aucun remboursement ne sera effectué pour les périodes déjà consommées.</p>
        `,
        version: 1,
        published: true,
        metaTitle: 'CGV - BetTracker Pro',
        metaDescription: 'Conditions Générales de Vente de BetTracker Pro',
        publishedAt: new Date(),
      },
    }),
    prisma.cmsPage.upsert({
      where: { slug: 'privacy' },
      update: {},
      create: {
        slug: 'privacy',
        title: 'Politique de Confidentialité',
        content: `
          <h1>Politique de Confidentialité</h1>
          <p>Dernière mise à jour : ${new Date().toLocaleDateString('fr-FR')}</p>

          <h2>1. Responsable du traitement</h2>
          <p>BetTracker Pro est responsable du traitement de vos données personnelles.</p>

          <h2>2. Données collectées</h2>
          <ul>
            <li>Données d'identification (nom, prénom, email)</li>
            <li>Données de connexion (IP, logs)</li>
            <li>Données de paris (plateformes, montants, résultats)</li>
            <li>Données de paiement (via Stripe)</li>
          </ul>

          <h2>3. Finalité du traitement</h2>
          <p>Les données sont utilisées pour fournir le service, gérer les abonnements, améliorer l'expérience utilisateur.</p>

          <h2>4. Durée de conservation</h2>
          <p>Les données sont conservées pendant la durée de l'abonnement + 3 ans pour les obligations légales.</p>

          <h2>5. Vos droits</h2>
          <p>Conformément au RGPD, vous disposez des droits suivants :</p>
          <ul>
            <li>Droit d'accès</li>
            <li>Droit de rectification</li>
            <li>Droit à l'effacement</li>
            <li>Droit à la portabilité</li>
            <li>Droit d'opposition</li>
          </ul>
          <p>Pour exercer vos droits, contactez-nous à privacy@bettracker.pro</p>

          <h2>6. Cookies</h2>
          <p>Notre site utilise des cookies nécessaires au fonctionnement et des cookies analytiques (avec votre consentement).</p>

          <h2>7. Réclamation</h2>
          <p>Vous pouvez introduire une réclamation auprès de la CNIL (www.cnil.fr).</p>
        `,
        version: 1,
        published: true,
        metaTitle: 'Politique de Confidentialité - BetTracker Pro',
        metaDescription: 'Politique de confidentialité et protection des données personnelles',
        publishedAt: new Date(),
      },
    }),
    prisma.cmsPage.upsert({
      where: { slug: 'about' },
      update: {},
      create: {
        slug: 'about',
        title: 'À Propos',
        content: `
          <h1>À Propos de BetTracker Pro</h1>

          <h2>Notre Mission</h2>
          <p>BetTracker Pro est une plateforme SaaS dédiée au suivi professionnel des paris hippiques. Notre mission est d'aider les parieurs à mieux gérer leur bankroll, analyser leurs performances et améliorer leurs stratégies.</p>

          <h2>Fonctionnalités</h2>
          <ul>
            <li>Suivi détaillé de tous vos paris hippiques</li>
            <li>Statistiques complètes et analyses avancées</li>
            <li>Gestion de bankroll et limites budgétaires</li>
            <li>Rapports automatiques et exports</li>
            <li>API pour intégrations personnalisées (Pro/Business)</li>
          </ul>

          <h2>Sécurité et Confidentialité</h2>
          <p>Vos données sont hébergées en France, chiffrées et sécurisées selon les normes les plus strictes (RGPD).</p>

          <h2>Contact</h2>
          <p>Pour toute question : contact@bettracker.pro</p>
        `,
        version: 1,
        published: true,
        metaTitle: 'À Propos - BetTracker Pro',
        metaDescription: 'Découvrez BetTracker Pro, plateforme de suivi de paris hippiques',
        publishedAt: new Date(),
      },
    }),
  ]);
  console.log(`✅ Created ${cmsPages.length} CMS pages`);

  // Create menu items
  console.log('Creating menu items...');
  const menuItems = await Promise.all([
    // Header menu
    prisma.menuItem.upsert({
      where: { id: 'home-header' },
      update: {},
      create: {
        id: 'home-header',
        menuType: 'header',
        title: 'Accueil',
        url: '/',
        icon: 'home',
        displayOrder: 1,
        visibility: 'all',
      },
    }),
    prisma.menuItem.upsert({
      where: { id: 'features-header' },
      update: {},
      create: {
        id: 'features-header',
        menuType: 'header',
        title: 'Fonctionnalités',
        url: '/features',
        icon: 'star',
        displayOrder: 2,
        visibility: 'all',
      },
    }),
    prisma.menuItem.upsert({
      where: { id: 'pricing-header' },
      update: {},
      create: {
        id: 'pricing-header',
        menuType: 'header',
        title: 'Tarifs',
        url: '/pricing',
        icon: 'tag',
        displayOrder: 3,
        visibility: 'all',
      },
    }),
    prisma.menuItem.upsert({
      where: { id: 'dashboard-header' },
      update: {},
      create: {
        id: 'dashboard-header',
        menuType: 'header',
        title: 'Dashboard',
        url: '/dashboard',
        icon: 'chart',
        displayOrder: 4,
        visibility: 'logged',
      },
    }),
    // Footer menu
    prisma.menuItem.upsert({
      where: { id: 'about-footer' },
      update: {},
      create: {
        id: 'about-footer',
        menuType: 'footer',
        title: 'À Propos',
        url: '/about',
        displayOrder: 1,
        visibility: 'all',
      },
    }),
    prisma.menuItem.upsert({
      where: { id: 'cgu-footer' },
      update: {},
      create: {
        id: 'cgu-footer',
        menuType: 'footer',
        title: 'CGU',
        url: '/cgu',
        displayOrder: 2,
        visibility: 'all',
      },
    }),
    prisma.menuItem.upsert({
      where: { id: 'cgv-footer' },
      update: {},
      create: {
        id: 'cgv-footer',
        menuType: 'footer',
        title: 'CGV',
        url: '/cgv',
        displayOrder: 3,
        visibility: 'all',
      },
    }),
    prisma.menuItem.upsert({
      where: { id: 'privacy-footer' },
      update: {},
      create: {
        id: 'privacy-footer',
        menuType: 'footer',
        title: 'Confidentialité',
        url: '/privacy',
        displayOrder: 4,
        visibility: 'all',
      },
    }),
  ]);
  console.log(`✅ Created ${menuItems.length} menu items`);

  console.log('');
  console.log('🎉 Database seeding completed successfully!');
  console.log('');
  console.log('📝 Admin credentials:');
  console.log('   Email: admin@bettracker.pro');
  console.log('   Password: Admin123!');
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
