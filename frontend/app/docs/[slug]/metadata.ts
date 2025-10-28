import { Metadata } from 'next';

export const seoData: Record<string, Metadata> = {
  'mcp-server': {
    title: 'Serveur MCP BetTracker Pro - Installation Claude Desktop | Guide Complet',
    description: 'Guide d\'installation du serveur MCP BetTracker Pro pour Claude Desktop. Intégrez vos statistiques de paris hippiques directement dans Claude avec notre protocole MCP.',
    keywords: 'mcp, model context protocol, claude desktop, bettracker, installation, serveur mcp, paris hippiques, ia, chatbot',
    openGraph: {
      title: 'Serveur MCP BetTracker Pro - Installation Claude Desktop',
      description: 'Guide d\'installation du serveur MCP BetTracker Pro pour Claude Desktop',
      type: 'article',
      locale: 'fr_FR',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Serveur MCP BetTracker Pro - Installation Claude Desktop',
      description: 'Guide d\'installation du serveur MCP BetTracker Pro pour Claude Desktop',
    },
  },
  'api': {
    title: 'API REST BetTracker Pro - Documentation Complète | Endpoints & Exemples',
    description: 'Documentation complète de l\'API REST BetTracker Pro. Accédez à vos données de paris hippiques via notre API sécurisée. Exemples en JavaScript, Python et cURL.',
    keywords: 'api rest, bettracker, documentation api, paris hippiques, endpoints, javascript, python, curl, authentification',
    openGraph: {
      title: 'API REST BetTracker Pro - Documentation Complète',
      description: 'Documentation complète de l\'API REST BetTracker Pro avec exemples',
      type: 'article',
      locale: 'fr_FR',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'API REST BetTracker Pro - Documentation Complète',
      description: 'Documentation complète de l\'API REST BetTracker Pro avec exemples',
    },
  },
  'chatgpt': {
    title: 'Intégration ChatGPT BetTracker Pro - Custom GPT & API OpenAI',
    description: 'Créez votre Custom GPT BetTracker Pro ou intégrez notre API avec ChatGPT. Guide complet pour utiliser vos données de paris hippiques avec l\'IA OpenAI.',
    keywords: 'chatgpt, custom gpt, openai, bettracker, integration, paris hippiques, gpt-4, actions, api',
    openGraph: {
      title: 'Intégration ChatGPT BetTracker Pro - Custom GPT',
      description: 'Créez votre Custom GPT BetTracker Pro ou intégrez notre API avec ChatGPT',
      type: 'article',
      locale: 'fr_FR',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Intégration ChatGPT BetTracker Pro',
      description: 'Créez votre Custom GPT BetTracker Pro',
    },
  },
  'examples': {
    title: 'Exemples de Code BetTracker Pro - JavaScript, Python, React | API',
    description: 'Exemples pratiques d\'utilisation de l\'API BetTracker Pro. Code complet en JavaScript, Python et React pour intégrer vos statistiques de paris hippiques.',
    keywords: 'exemples code, javascript, python, react, api bettracker, tutoriel, paris hippiques, integration',
    openGraph: {
      title: 'Exemples de Code BetTracker Pro - JavaScript, Python, React',
      description: 'Exemples pratiques d\'utilisation de l\'API BetTracker Pro',
      type: 'article',
      locale: 'fr_FR',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Exemples de Code BetTracker Pro',
      description: 'Exemples pratiques d\'utilisation de l\'API BetTracker Pro',
    },
  },
  'gestion-paris': {
    title: 'Gestion des Paris Auto/Manuel - Guide Complet | BetTracker Pro',
    description: 'Comprendre la différence entre les paris PMU (automatiques) et les paris sur autres plateformes (manuels). Guide complet pour les membres et administrateurs.',
    keywords: 'gestion paris, pmu, betclic, unibet, automatique, manuel, validation, cotes, guide',
    openGraph: {
      title: 'Gestion des Paris Auto/Manuel - Guide Complet',
      description: 'Comprendre la différence entre les paris PMU et les autres plateformes',
      type: 'article',
      locale: 'fr_FR',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Gestion des Paris Auto/Manuel',
      description: 'Guide complet pour les membres et administrateurs',
    },
  },
};

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const slug = params.slug;
  const metadata = seoData[slug];

  if (!metadata) {
    return {
      title: 'Documentation - BetTracker Pro',
      description: 'Documentation BetTracker Pro',
    };
  }

  return metadata;
}
