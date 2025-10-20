import { useEffect } from 'react'

// Structured Data for SEO (JSON-LD)
function StructuredData({ type, data }) {
  useEffect(() => {
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.id = `structured-data-${type}`

    let structuredData = {}

    if (type === 'website') {
      structuredData = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "AutoMarket",
        "url": window.location.origin,
        "description": "Marketplace de voitures d'occasion",
        "potentialAction": {
          "@type": "SearchAction",
          "target": `${window.location.origin}/?search={search_term_string}`,
          "query-input": "required name=search_term_string"
        }
      }
    } else if (type === 'product' && data) {
      structuredData = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": data.title,
        "description": data.description,
        "image": data.image,
        "brand": {
          "@type": "Brand",
          "name": data.brand
        },
        "offers": {
          "@type": "Offer",
          "price": data.price,
          "priceCurrency": "EUR",
          "availability": "https://schema.org/InStock",
          "seller": {
            "@type": "Person",
            "name": data.seller
          }
        },
        "additionalProperty": [
          {
            "@type": "PropertyValue",
            "name": "Année",
            "value": data.year
          },
          {
            "@type": "PropertyValue",
            "name": "Kilométrage",
            "value": `${data.mileage} km`
          },
          {
            "@type": "PropertyValue",
            "name": "Carburant",
            "value": data.fuel
          },
          {
            "@type": "PropertyValue",
            "name": "Transmission",
            "value": data.transmission
          }
        ]
      }
    } else if (type === 'organization') {
      structuredData = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "AutoMarket",
        "url": window.location.origin,
        "logo": `${window.location.origin}/logo.png`,
        "description": "Marketplace leader de voitures d'occasion en France",
        "contactPoint": {
          "@type": "ContactPoint",
          "contactType": "Service Client",
          "telephone": "+33-1-23-45-67-89",
          "email": "contact@automarket.fr"
        }
      }
    }

    script.text = JSON.stringify(structuredData)

    // Remove existing script if any
    const existing = document.getElementById(`structured-data-${type}`)
    if (existing) {
      existing.remove()
    }

    document.head.appendChild(script)

    return () => {
      const element = document.getElementById(`structured-data-${type}`)
      if (element) {
        element.remove()
      }
    }
  }, [type, data])

  return null
}

export default StructuredData
