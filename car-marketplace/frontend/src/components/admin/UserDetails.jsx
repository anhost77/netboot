import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

function UserDetails({ userId, onClose }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [newNote, setNewNote] = useState('')
  const [addingNote, setAddingNote] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (userId) {
      fetchUserDetails()
    }
  }, [userId])

  const fetchUserDetails = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`/api/admin/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      setUser(data)
      setLoading(false)
    } catch (error) {
      console.error('Erreur:', error)
      setLoading(false)
    }
  }

  const handleAddNote = async () => {
    if (!newNote.trim()) {
      setMessage('❌ Veuillez saisir une note')
      setTimeout(() => setMessage(''), 3000)
      return
    }

    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`/api/admin/users/${userId}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ note: newNote })
      })

      if (response.ok) {
        setMessage('✅ Note ajoutée avec succès')
        setNewNote('')
        setAddingNote(false)
        fetchUserDetails()
        setTimeout(() => setMessage(''), 3000)
      }
    } catch (error) {
      console.error('Erreur:', error)
      setMessage('❌ Erreur lors de l\'ajout de la note')
    }
  }

  if (loading) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
          <div className="loading">Chargement...</div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content user-details-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>👤 Détails de l'utilisateur</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {message && (
            <div className={`admin-message ${message.includes('✅') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}

          {/* Informations personnelles */}
          <section className="user-details-section">
            <h3>📋 Informations personnelles</h3>
            <div className="user-details-grid">
              <div className="detail-item">
                <span className="detail-label">ID:</span>
                <code className="detail-value">{user.id}</code>
              </div>
              <div className="detail-item">
                <span className="detail-label">Nom complet:</span>
                <span className="detail-value">{user.firstName} {user.lastName}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Email:</span>
                <span className="detail-value">{user.email}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Téléphone:</span>
                <span className="detail-value">{user.phone || 'Non renseigné'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Adresse:</span>
                <span className="detail-value">{user.address || 'Non renseignée'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Nom d'utilisateur:</span>
                <span className="detail-value">{user.username}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Statut:</span>
                <span className={`status-badge ${user.status}`}>
                  {user.status === 'active' ? 'Actif' : 'Inactif'}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Inscrit le:</span>
                <span className="detail-value">
                  {new Date(user.createdAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Dernière connexion:</span>
                <span className="detail-value">
                  {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : 'Jamais'}
                </span>
              </div>
            </div>
          </section>

          {/* Statistiques */}
          <section className="user-details-section">
            <h3>📊 Statistiques</h3>
            <div className="stats-row">
              <div className="stat-box">
                <div className="stat-number">{user.adsCount}</div>
                <div className="stat-label">Annonces</div>
              </div>
              <div className="stat-box">
                <div className="stat-number">{user.messagesCount}</div>
                <div className="stat-label">Messages</div>
              </div>
              <div className="stat-box">
                <div className="stat-number">{user.connectionHistory?.length || 0}</div>
                <div className="stat-label">Connexions</div>
              </div>
            </div>
          </section>

          {/* Annonces de l'utilisateur */}
          <section className="user-details-section">
            <h3>🚗 Annonces ({user.ads.length})</h3>
            {user.ads.length > 0 ? (
              <div className="user-ads-list">
                {user.ads.map(ad => (
                  <div key={ad.id} className="user-ad-item">
                    <img
                      src={ad.image || 'https://via.placeholder.com/80x60?text=No+Image'}
                      alt={ad.title}
                    />
                    <div className="user-ad-info">
                      <h4>{ad.title}</h4>
                      <p>{ad.brand} {ad.model} - {ad.year}</p>
                      <p className="ad-price">{ad.price.toLocaleString('fr-FR')} €</p>
                    </div>
                    <div className="user-ad-meta">
                      <span className={`ad-status ${ad.status}`}>
                        {ad.status === 'published' ? 'Publié' : 'En attente'}
                      </span>
                      <span className="ad-date">
                        {new Date(ad.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-message">Aucune annonce publiée</p>
            )}
          </section>

          {/* Historique de connexion */}
          <section className="user-details-section">
            <h3>🌐 Historique de connexion ({user.connectionHistory?.length || 0})</h3>
            {user.connectionHistory && user.connectionHistory.length > 0 ? (
              <div className="connection-history">
                <table className="details-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Heure</th>
                      <th>Adresse IP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {user.connectionHistory.slice(0, 10).map((conn, index) => (
                      <tr key={index}>
                        <td>{new Date(conn.date).toLocaleDateString('fr-FR')}</td>
                        <td>{new Date(conn.date).toLocaleTimeString('fr-FR')}</td>
                        <td><code>{conn.ip}</code></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {user.connectionHistory.length > 10 && (
                  <p className="more-info">... et {user.connectionHistory.length - 10} connexions de plus</p>
                )}
              </div>
            ) : (
              <p className="empty-message">Aucun historique de connexion</p>
            )}
          </section>

          {/* Notes de transaction */}
          <section className="user-details-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3>📝 Notes de transaction ({user.transactionNotes?.length || 0})</h3>
              {!addingNote && (
                <button
                  className="btn btn-primary"
                  onClick={() => setAddingNote(true)}
                  style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
                >
                  + Ajouter une note
                </button>
              )}
            </div>

            {addingNote && (
              <div className="add-note-form">
                <textarea
                  className="form-textarea"
                  rows="3"
                  placeholder="Saisir une note..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                />
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button
                    className="btn btn-primary"
                    onClick={handleAddNote}
                  >
                    Enregistrer
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      setAddingNote(false)
                      setNewNote('')
                    }}
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}

            {user.transactionNotes && user.transactionNotes.length > 0 ? (
              <div className="transaction-notes">
                {user.transactionNotes.map((note, index) => (
                  <div key={note.id || index} className="note-item">
                    <div className="note-header">
                      <span className="note-author">👤 {note.author}</span>
                      <span className="note-date">
                        {new Date(note.date).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <div className="note-content">{note.note}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-message">Aucune note</p>
            )}
          </section>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  )
}

export default UserDetails
