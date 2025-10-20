import { useState, useEffect } from 'react'

function AdsManager() {
  const [ads, setAds] = useState([])
  const [users, setUsers] = useState([])
  const [editingAd, setEditingAd] = useState(null)
  const [assigningAd, setAssigningAd] = useState(null)
  const [selectedUserId, setSelectedUserId] = useState('')
  const [loading, setLoading] = useState(true)
  const [saveMessage, setSaveMessage] = useState('')

  useEffect(() => {
    fetchAds()
    fetchUsers()
  }, [])

  const fetchAds = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch('/api/admin/ads', {
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

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      setUsers(data)
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const handleEdit = (ad) => {
    setEditingAd(JSON.parse(JSON.stringify(ad)))
  }

  const handleChange = (field, value) => {
    setEditingAd({
      ...editingAd,
      [field]: value
    })
  }

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`/api/admin/ads/${editingAd.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: editingAd.title,
          brand: editingAd.brand,
          model: editingAd.model,
          year: parseInt(editingAd.year),
          price: parseInt(editingAd.price),
          mileage: parseInt(editingAd.mileage),
          fuel: editingAd.fuel,
          transmission: editingAd.transmission,
          location: editingAd.location,
          description: editingAd.description,
          image: editingAd.image,
          status: editingAd.status
        })
      })

      if (response.ok) {
        setSaveMessage('✅ Annonce mise à jour avec succès !')
        fetchAds()
        setEditingAd(null)
        setTimeout(() => setSaveMessage(''), 3000)
      }
    } catch (error) {
      console.error('Erreur:', error)
      setSaveMessage('❌ Erreur lors de la mise à jour')
    }
  }

  const handleDelete = async (adId, adTitle) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'annonce "${adTitle}" ?`)) {
      return
    }

    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`/api/admin/ads/${adId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        setSaveMessage('✅ Annonce supprimée avec succès')
        fetchAds()
        setTimeout(() => setSaveMessage(''), 3000)
      }
    } catch (error) {
      console.error('Erreur:', error)
      setSaveMessage('❌ Erreur lors de la suppression')
    }
  }

  const handleOpenAssign = (ad) => {
    setAssigningAd(ad)
    setSelectedUserId('')
  }

  const handleAssignUser = async () => {
    if (!selectedUserId) {
      setSaveMessage('❌ Veuillez sélectionner un utilisateur')
      setTimeout(() => setSaveMessage(''), 3000)
      return
    }

    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`/api/admin/ads/${assigningAd.id}/assign-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId: selectedUserId })
      })

      if (response.ok) {
        const data = await response.json()
        setSaveMessage(`✅ Annonce attribuée à ${data.user.firstName} ${data.user.lastName}`)
        fetchAds()
        setAssigningAd(null)
        setSelectedUserId('')
        setTimeout(() => setSaveMessage(''), 3000)
      }
    } catch (error) {
      console.error('Erreur:', error)
      setSaveMessage('❌ Erreur lors de l\'attribution')
    }
  }

  if (loading) {
    return <div className="loading">Chargement...</div>
  }

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i)

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <div>
          <h1>Gestion des annonces</h1>
          <p style={{ color: '#666' }}>
            {ads.length} annonce{ads.length > 1 ? 's' : ''} au total
          </p>
        </div>
      </div>

      {saveMessage && (
        <div className={`admin-message ${saveMessage.includes('✅') ? 'success' : 'error'}`}>
          {saveMessage}
        </div>
      )}

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Titre</th>
              <th>Propriétaire</th>
              <th>Prix</th>
              <th>Statut</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {ads.map(ad => (
              <tr key={ad.id}>
                <td>
                  <img
                    src={ad.image || 'https://via.placeholder.com/100x75?text=No+Image'}
                    alt={ad.title}
                    style={{ width: '100px', height: '75px', objectFit: 'cover', borderRadius: '4px' }}
                  />
                </td>
                <td>
                  <strong>{ad.title}</strong>
                  <br />
                  <span style={{ fontSize: '0.85rem', color: '#666' }}>
                    {ad.brand} {ad.model} - {ad.year}
                  </span>
                </td>
                <td>
                  {ad.owner ? (
                    <>
                      <strong>{ad.owner.firstName} {ad.owner.lastName}</strong>
                      <br />
                      <span style={{ fontSize: '0.85rem', color: '#666' }}>
                        {ad.owner.email}
                      </span>
                    </>
                  ) : (
                    <>
                      <span style={{ color: '#999', display: 'block', marginBottom: '0.5rem' }}>
                        Sans utilisateur
                      </span>
                      <button
                        className="btn-edit"
                        style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem' }}
                        onClick={() => handleOpenAssign(ad)}
                      >
                        👤 Attribuer
                      </button>
                    </>
                  )}
                </td>
                <td>
                  <strong style={{ color: 'var(--secondary-color)' }}>
                    {ad.price.toLocaleString('fr-FR')} €
                  </strong>
                </td>
                <td>
                  <span className={`ad-status ${ad.status}`}>
                    {ad.status === 'published' ? 'Publié' : 'En attente'}
                  </span>
                </td>
                <td>
                  {new Date(ad.createdAt).toLocaleDateString('fr-FR')}
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn-edit"
                      onClick={() => handleEdit(ad)}
                    >
                      ✏️ Modifier
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(ad.id, ad.title)}
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {ads.length === 0 && (
          <div className="empty-state" style={{ padding: '3rem' }}>
            <h3>Aucune annonce</h3>
            <p>Aucune annonce n'a encore été publiée</p>
          </div>
        )}
      </div>

      {assigningAd && (
        <div className="modal-overlay" onClick={() => setAssigningAd(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Attribuer l'annonce à un utilisateur</h2>
              <button className="modal-close" onClick={() => setAssigningAd(null)}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              <p style={{ marginBottom: '1.5rem', color: '#666' }}>
                Annonce: <strong>{assigningAd.title}</strong>
              </p>

              <div className="form-group">
                <label className="form-label">Sélectionner un utilisateur *</label>
                <select
                  className="form-select"
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                >
                  <option value="">-- Choisir un utilisateur --</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.firstName} {user.lastName} ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              {users.length === 0 && (
                <p style={{ color: '#dc3545', fontSize: '0.9rem', marginTop: '1rem' }}>
                  ⚠️ Aucun utilisateur disponible. Veuillez créer un utilisateur d'abord.
                </p>
              )}
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setAssigningAd(null)}
              >
                Annuler
              </button>
              <button
                className="btn btn-primary"
                onClick={handleAssignUser}
                disabled={!selectedUserId}
              >
                Attribuer
              </button>
            </div>
          </div>
        </div>
      )}

      {editingAd && (
        <div className="modal-overlay" onClick={() => setEditingAd(null)}>
          <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Modifier l'annonce</h2>
              <button className="modal-close" onClick={() => setEditingAd(null)}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Titre *</label>
                <input
                  type="text"
                  className="form-input"
                  value={editingAd.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Marque *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editingAd.brand}
                    onChange={(e) => handleChange('brand', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Modèle *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editingAd.model}
                    onChange={(e) => handleChange('model', e.target.value)}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Année *</label>
                  <select
                    className="form-select"
                    value={editingAd.year}
                    onChange={(e) => handleChange('year', e.target.value)}
                  >
                    {years.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Prix (€) *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={editingAd.price}
                    onChange={(e) => handleChange('price', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Kilométrage *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={editingAd.mileage}
                    onChange={(e) => handleChange('mileage', e.target.value)}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Carburant *</label>
                  <select
                    className="form-select"
                    value={editingAd.fuel}
                    onChange={(e) => handleChange('fuel', e.target.value)}
                  >
                    <option value="Essence">Essence</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Électrique">Électrique</option>
                    <option value="Hybride">Hybride</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Transmission *</label>
                  <select
                    className="form-select"
                    value={editingAd.transmission}
                    onChange={(e) => handleChange('transmission', e.target.value)}
                  >
                    <option value="Manuelle">Manuelle</option>
                    <option value="Automatique">Automatique</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Localisation *</label>
                <input
                  type="text"
                  className="form-input"
                  value={editingAd.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea
                  className="form-textarea"
                  rows="4"
                  value={editingAd.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">URL de l'image</label>
                <input
                  type="url"
                  className="form-input"
                  value={editingAd.image}
                  onChange={(e) => handleChange('image', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Statut *</label>
                <select
                  className="form-select"
                  value={editingAd.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                >
                  <option value="published">Publié</option>
                  <option value="pending">En attente</option>
                </select>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setEditingAd(null)}
              >
                Annuler
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSave}
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdsManager
