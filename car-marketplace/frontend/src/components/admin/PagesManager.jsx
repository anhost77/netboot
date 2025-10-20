import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

function PagesManager() {
  const [pages, setPages] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPages()
  }, [])

  const fetchPages = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch('/api/admin/pages', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      setPages(data)
      setLoading(false)
    } catch (error) {
      console.error('Erreur:', error)
      setLoading(false)
    }
  }

  const deletePage = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette page ?')) {
      return
    }

    try {
      const token = localStorage.getItem('adminToken')
      await fetch(`/api/admin/pages/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      fetchPages()
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  if (loading) {
    return <div className="loading">Chargement...</div>
  }

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h1>Pages de contenu</h1>
        <Link to="/admin/pages/new" className="btn btn-primary">
          + Nouvelle page
        </Link>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Titre</th>
              <th>Slug</th>
              <th>Statut</th>
              <th>Dernière modification</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pages.map(page => (
              <tr key={page.id}>
                <td><strong>{page.title}</strong></td>
                <td><code>/page/{page.slug}</code></td>
                <td>
                  <span className={`status-badge ${page.isPublished ? 'published' : 'draft'}`}>
                    {page.isPublished ? 'Publié' : 'Brouillon'}
                  </span>
                </td>
                <td>{new Date(page.updatedAt).toLocaleDateString('fr-FR')}</td>
                <td>
                  <div className="action-buttons">
                    <Link
                      to={`/admin/pages/edit/${page.id}`}
                      className="btn-small btn-edit"
                    >
                      ✏️ Modifier
                    </Link>
                    <a
                      href={`/page/${page.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-small btn-view"
                    >
                      👁️ Voir
                    </a>
                    <button
                      onClick={() => deletePage(page.id)}
                      className="btn-small btn-delete"
                    >
                      🗑️ Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default PagesManager
