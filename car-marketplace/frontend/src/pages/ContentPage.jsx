import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import SEO from '../components/SEO'

function ContentPage() {
  const { slug } = useParams()
  const [page, setPage] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPage()
  }, [slug])

  const fetchPage = async () => {
    try {
      const response = await fetch(`/api/pages/${slug}`)
      if (response.ok) {
        const data = await response.json()
        setPage(data)
      } else {
        setPage(null)
      }
      setLoading(false)
    } catch (error) {
      console.error('Erreur:', error)
      setPage(null)
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="container loading">Chargement...</div>
  }

  if (!page) {
    return (
      <div className="container">
        <div className="empty-state" style={{ padding: '4rem 0' }}>
          <h2>Page non trouvée</h2>
          <p>La page que vous recherchez n'existe pas ou n'est plus disponible.</p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: '2rem' }}>
            Retour à l'accueil
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <SEO
        title={page.metaTitle || page.title}
        description={page.metaDescription}
        canonical={`${window.location.origin}/page/${page.slug}`}
      />

      <div className="content-page">
        <div
          className="content-page-body"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </div>
    </div>
  )
}

export default ContentPage
