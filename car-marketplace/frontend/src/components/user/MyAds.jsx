import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function MyAds() {
  const navigate = useNavigate()
  const [ads, setAds] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingAd, setEditingAd] = useState(null)
  const [saveMessage, setSaveMessage] = useState('')

  useEffect(() => {
    fetchMyAds()
  }, [])

  const fetchMyAds = async () => {
    const token = localStorage.getItem('userToken')

    try {
      const response = await fetch('/api/users/my-ads', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      setAds(data)
      setLoading(false)
    } catch (error) {
      console.error('Erreur:', error)
      setLoading(false)
    }
  }

  const deleteAd = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) {
      return
    }

    const token = localStorage.getItem('userToken')

    try {
      await fetch(`/api/users/my-ads/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      fetchMyAds()
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const handleEdit = (ad) => {
    setEditingAd({...ad})
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setEditingAd({
      ...editingAd,
      [name]: value
    })
  }

  const handleSave = async () => {
    const token = localStorage.getItem('userToken')

    try {
      const response = await fetch(`/api/users/my-ads/${editingAd.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editingAd)
      })

      if (response.ok) {
        setSaveMessage('✅ Annonce modifiée avec succès !')
        fetchMyAds()
        setEditingAd(null)
        setTimeout(() => setSaveMessage(''), 3000)
      }
    } catch (error) {
      console.error('Erreur:', error)
      setSaveMessage('❌ Erreur lors de la modification')
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(price)
  }

  if (loading) {
    return <div className="loading">Chargement...</div>
  }

  return (
    <div className="user-section">
      <div className="user-section-header">
        <h1>Mes annonces</h1>
        <Link to="/post-ad" className="btn btn-primary">
          + Nouvelle annonce
        </Link>
      </div>

      {saveMessage && (
        <div className={`admin-message ${saveMessage.includes('✅') ? 'success' : 'error'}`}>
          {saveMessage}
        </div>
      )}

      {ads.length === 0 ? (
        <div className="empty-state">
          <h3>Aucune annonce</h3>
          <p>Vous n'avez pas encore déposé d'annonce</p>
          <Link to="/post-ad" className="btn btn-primary" style={{ marginTop: '2rem' }}>
            Déposer ma première annonce
          </Link>
        </div>
      ) : (
        <div className="user-ads-grid">
          {ads.map(ad => (
            <div key={ad.id} className="user-ad-card">
              <img src={ad.image} alt={ad.title} className="user-ad-image" />
              <div className="user-ad-info">
                <h3>{ad.title}</h3>
                <div className="user-ad-price">{formatPrice(ad.price)}</div>
                <div style={{ display: 'flex', gap: '0.5rem', color: '#666', fontSize: '0.9rem', marginBottom: '1rem' }}>
                  <span>{ad.year}</span>
                  <span>•</span>
                  <span>{ad.mileage.toLocaleString('fr-FR')} km</span>
                  <span>•</span>
                  <span>{ad.fuel}</span>
                </div>
                <div className="action-buttons">
                  <Link to={`/car/${ad.id}`} className="btn-small btn-view">
                    👁️ Voir
                  </Link>
                  <button onClick={() => handleEdit(ad)} className="btn-small btn-edit">
                    ✏️ Modifier
                  </button>
                  <button onClick={() => deleteAd(ad.id)} className="btn-small btn-delete">
                    🗑️ Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingAd && (
        <div className="modal-overlay" onClick={() => setEditingAd(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
            <div className="modal-header">
              <h2>Modifier l'annonce</h2>
              <button className="modal-close" onClick={() => setEditingAd(null)}>✕</button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Titre</label>
                <input
                  type="text"
                  name="title"
                  className="form-input"
                  value={editingAd.title}
                  onChange={handleChange}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Marque</label>
                  <input
                    type="text"
                    name="brand"
                    className="form-input"
                    value={editingAd.brand}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Modèle</label>
                  <input
                    type="text"
                    name="model"
                    className="form-input"
                    value={editingAd.model}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Prix (€)</label>
                  <input
                    type="number"
                    name="price"
                    className="form-input"
                    value={editingAd.price}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Année</label>
                  <input
                    type="number"
                    name="year"
                    className="form-input"
                    value={editingAd.year}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Kilométrage</label>
                  <input
                    type="number"
                    name="mileage"
                    className="form-input"
                    value={editingAd.mileage}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Carburant</label>
                  <select name="fuel" className="form-select" value={editingAd.fuel} onChange={handleChange}>
                    <option>Essence</option>
                    <option>Diesel</option>
                    <option>Électrique</option>
                    <option>Hybride</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Transmission</label>
                  <select name="transmission" className="form-select" value={editingAd.transmission} onChange={handleChange}>
                    <option>Manuelle</option>
                    <option>Automatique</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Localisation</label>
                <input
                  type="text"
                  name="location"
                  className="form-input"
                  value={editingAd.location}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  className="form-textarea"
                  value={editingAd.description}
                  onChange={handleChange}
                  rows="4"
                />
              </div>

              <div className="form-group">
                <label className="form-label">URL de l'image</label>
                <input
                  type="url"
                  name="image"
                  className="form-input"
                  value={editingAd.image}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setEditingAd(null)}>
                Annuler
              </button>
              <button className="btn btn-primary" onClick={handleSave}>
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyAds
