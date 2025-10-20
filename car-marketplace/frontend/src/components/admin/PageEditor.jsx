import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'

function PageEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    metaTitle: '',
    metaDescription: '',
    isPublished: true
  })
  const [loading, setLoading] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  useEffect(() => {
    if (id) {
      fetchPage()
    }
  }, [id])

  const fetchPage = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`/api/admin/pages/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      setFormData(data)
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  const handleContentChange = (content) => {
    setFormData({
      ...formData,
      content
    })
  }

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleTitleChange = (e) => {
    const title = e.target.value
    setFormData({
      ...formData,
      title,
      slug: id ? formData.slug : generateSlug(title),
      metaTitle: id ? formData.metaTitle : title
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setSaveMessage('')

    try {
      const token = localStorage.getItem('adminToken')
      const url = id ? `/api/admin/pages/${id}` : '/api/admin/pages'
      const method = id ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setSaveMessage('✅ Page enregistrée avec succès !')
        setTimeout(() => {
          navigate('/admin/pages')
        }, 1500)
      } else {
        setSaveMessage('❌ Erreur lors de l\'enregistrement')
      }
    } catch (error) {
      console.error('Erreur:', error)
      setSaveMessage('❌ Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      ['link', 'image'],
      ['clean']
    ]
  }

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h1>{id ? 'Modifier la page' : 'Nouvelle page'}</h1>
      </div>

      {saveMessage && (
        <div className={`admin-message ${saveMessage.includes('✅') ? 'success' : 'error'}`}>
          {saveMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="page-editor-form">
        <div className="form-row">
          <div className="form-group" style={{ flex: 2 }}>
            <label className="form-label">Titre de la page *</label>
            <input
              type="text"
              name="title"
              className="form-input"
              value={formData.title}
              onChange={handleTitleChange}
              required
            />
          </div>

          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">
              <input
                type="checkbox"
                name="isPublished"
                checked={formData.isPublished}
                onChange={handleChange}
                style={{ marginRight: '0.5rem' }}
              />
              Publier
            </label>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Slug (URL) *</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: '#666' }}>/page/</span>
            <input
              type="text"
              name="slug"
              className="form-input"
              value={formData.slug}
              onChange={handleChange}
              required
              style={{ flex: 1 }}
            />
          </div>
          <small style={{ color: '#666', fontSize: '0.85rem' }}>
            Format: utiliser des tirets, pas d'espaces, pas d'accents
          </small>
        </div>

        <div className="form-group">
          <label className="form-label">Contenu *</label>
          <div className="editor-container">
            <ReactQuill
              theme="snow"
              value={formData.content}
              onChange={handleContentChange}
              modules={modules}
              style={{ height: '400px', marginBottom: '50px' }}
            />
          </div>
        </div>

        <div className="seo-section">
          <h3 style={{ marginBottom: '1rem', color: '#004e89' }}>
            🔍 Référencement SEO
          </h3>

          <div className="form-group">
            <label className="form-label">Titre SEO (balise title)</label>
            <input
              type="text"
              name="metaTitle"
              className="form-input"
              value={formData.metaTitle}
              onChange={handleChange}
              maxLength="60"
            />
            <small style={{ color: '#666', fontSize: '0.85rem' }}>
              {formData.metaTitle.length}/60 caractères
            </small>
          </div>

          <div className="form-group">
            <label className="form-label">Description SEO (meta description)</label>
            <textarea
              name="metaDescription"
              className="form-textarea"
              value={formData.metaDescription}
              onChange={handleChange}
              maxLength="160"
              rows="3"
            />
            <small style={{ color: '#666', fontSize: '0.85rem' }}>
              {formData.metaDescription.length}/160 caractères
            </small>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/admin/pages')}
          >
            Annuler
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default PageEditor
