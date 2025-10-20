import { useState, useEffect } from 'react'
import UserDetails from './UserDetails'

function UsersManager() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteMessage, setDeleteMessage] = useState('')
  const [selectedUserId, setSelectedUserId] = useState(null)

  useEffect(() => {
    fetchUsers()
  }, [])

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
      setLoading(false)
    } catch (error) {
      console.error('Erreur:', error)
      setLoading(false)
    }
  }

  const handleDelete = async (userId, userName) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${userName} ? Cette action est irréversible.`)) {
      return
    }

    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        setDeleteMessage(`✅ Utilisateur ${userName} supprimé avec succès`)
        fetchUsers()
        setTimeout(() => setDeleteMessage(''), 3000)
      }
    } catch (error) {
      console.error('Erreur:', error)
      setDeleteMessage('❌ Erreur lors de la suppression')
    }
  }

  if (loading) {
    return <div className="loading">Chargement...</div>
  }

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <div>
          <h1>Gestion des utilisateurs</h1>
          <p style={{ color: '#666' }}>
            {users.length} utilisateur{users.length > 1 ? 's' : ''} enregistré{users.length > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {deleteMessage && (
        <div className={`admin-message ${deleteMessage.includes('✅') ? 'success' : 'error'}`}>
          {deleteMessage}
        </div>
      )}

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nom</th>
              <th>Email</th>
              <th>Téléphone</th>
              <th>Inscrit le</th>
              <th>Annonces</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>
                  <code style={{ fontSize: '0.8rem', color: '#666' }}>
                    {user.id.substring(0, 8)}...
                  </code>
                </td>
                <td>
                  <strong>{user.firstName} {user.lastName}</strong>
                </td>
                <td>{user.email}</td>
                <td>{user.phone || '-'}</td>
                <td>
                  {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                </td>
                <td>
                  <span className="badge" style={{ background: 'var(--primary-color)' }}>
                    {user.adsCount || 0}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn-edit"
                      onClick={() => setSelectedUserId(user.id)}
                    >
                      👁️ Détails
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(user.id, `${user.firstName} ${user.lastName}`)}
                    >
                      🗑️ Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <div className="empty-state" style={{ padding: '3rem' }}>
            <h3>Aucun utilisateur</h3>
            <p>Aucun utilisateur n'est encore enregistré</p>
          </div>
        )}
      </div>

      {selectedUserId && (
        <UserDetails
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
        />
      )}
    </div>
  )
}

export default UsersManager
