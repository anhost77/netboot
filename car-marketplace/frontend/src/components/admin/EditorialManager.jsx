import { useState, useEffect } from 'react'

function EditorialManager() {
  const [editorial, setEditorial] = useState({})
  const [loading, setLoading] = useState(true)
  const [saveMessage, setSaveMessage] = useState('')

  useEffect(() => {
    fetchEditorial()
  }, [])

  const fetchEditorial = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch('/api/admin/editorial', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      setEditorial(data)
      setLoading(false)
    } catch (error) {
      console.error('Erreur:', error)
      setLoading(false)
    }
  }

  const handleChange = (key, field, value) => {
    setEditorial({
      ...editorial,
      [key]: {
        ...editorial[key],
        [field]: value
      }
    })
  }

  const handleSave = async (key) => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`/api/admin/editorial/${key}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editorial[key])
      })

      if (response.ok) {
        setSaveMessage('✅ Contenu enregistré avec succès !')
        setTimeout(() => setSaveMessage(''), 3000)
      }
    } catch (error) {
      console.error('Erreur:', error)
      setSaveMessage('❌ Erreur lors de l\'enregistrement')
    }
  }

  if (loading) {
    return <div className="loading">Chargement...</div>
  }

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h1>Contenu éditorial</h1>
        <p style={{ color: '#666' }}>
          Modifiez les textes affichés sur le site
        </p>
      </div>

      {saveMessage && (
        <div className={`admin-message ${saveMessage.includes('✅') ? 'success' : 'error'}`}>
          {saveMessage}
        </div>
      )}

      <div className="editorial-sections">
        {/* Homepage Banner */}
        <div className="editorial-card">
          <h3>🏠 Bannière de la page d'accueil</h3>
          <p style={{ color: '#666', marginBottom: '1.5rem' }}>
            Le texte principal affiché en haut de la page d'accueil
          </p>

          <div className="form-group">
            <label className="form-label">Titre principal</label>
            <input
              type="text"
              className="form-input"
              value={editorial.homepageBanner?.title || ''}
              onChange={(e) => handleChange('homepageBanner', 'title', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Sous-titre</label>
            <textarea
              className="form-textarea"
              rows="2"
              value={editorial.homepageBanner?.subtitle || ''}
              onChange={(e) => handleChange('homepageBanner', 'subtitle', e.target.value)}
            />
          </div>

          <button
            className="btn btn-primary"
            onClick={() => handleSave('homepageBanner')}
          >
            Enregistrer
          </button>
        </div>

        {/* Preview */}
        <div className="editorial-preview">
          <h3>👁️ Aperçu</h3>
          <div className="hero-preview">
            <h1>{editorial.homepageBanner?.title}</h1>
            <p>{editorial.homepageBanner?.subtitle}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditorialManager
