import { useEffect } from 'react'

function SEO({
  title = 'AutoMarket - Votre marketplace de voitures d\'occasion',
  description = 'Trouvez la voiture de vos rêves parmi des milliers d\'annonces vérifiées. Achetez et vendez des voitures d\'occasion en toute confiance.',
  keywords = 'voiture occasion, achat voiture, vente voiture, automobile, voiture d\'occasion, marketplace auto, petites annonces voitures',
  ogTitle,
  ogDescription,
  ogImage = 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1200',
  canonical
}) {
  useEffect(() => {
    // Update document title
    document.title = title

    // Update or create meta tags
    updateMetaTag('description', description)
    updateMetaTag('keywords', keywords)

    // Open Graph tags
    updateMetaTag('og:title', ogTitle || title, 'property')
    updateMetaTag('og:description', ogDescription || description, 'property')
    updateMetaTag('og:image', ogImage, 'property')
    updateMetaTag('og:type', 'website', 'property')
    updateMetaTag('og:url', window.location.href, 'property')

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image', 'name')
    updateMetaTag('twitter:title', ogTitle || title, 'name')
    updateMetaTag('twitter:description', ogDescription || description, 'name')
    updateMetaTag('twitter:image', ogImage, 'name')

    // Canonical URL
    if (canonical) {
      updateCanonicalLink(canonical)
    }
  }, [title, description, keywords, ogTitle, ogDescription, ogImage, canonical])

  return null
}

function updateMetaTag(name, content, attribute = 'name') {
  if (!content) return

  let element = document.querySelector(`meta[${attribute}="${name}"]`)

  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, name)
    document.head.appendChild(element)
  }

  element.setAttribute('content', content)
}

function updateCanonicalLink(url) {
  let element = document.querySelector('link[rel="canonical"]')

  if (!element) {
    element = document.createElement('link')
    element.setAttribute('rel', 'canonical')
    document.head.appendChild(element)
  }

  element.setAttribute('href', url)
}

export default SEO
