import { useState } from 'react'

function Profile({ user, setUser }) {
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    password: '',
    confirmPassword: ''
  })
  const [saveMessage, setSaveMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaveMessage('')
    setLoading(true)

    if (formData.password && formData.password !== formData.confirmPassword) {
      setSaveMessage('❌ Les mots de passe ne correspondent pas')
      setLoading(false)
      return
    }

    const token = localStorage.getItem('userToken')
    const updateData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone
    }

    if (formData.password) {
      updateData.password = formData.password
    }

    try {
      const response = await fetch('/api/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      })

      if (response.ok) {
        const updatedUser = await response.json()
        setUser(updatedUser)
        localStorage.setItem('currentUser', JSON.stringify(updatedUser))
        setSaveMessage('✅ Profil mis à jour avec succès !')
        setFormData({
          ...formData,
          password: '',
          confirmPassword: ''
        })
        setTimeout(() => setSaveMessage(''), 3000)
      } else {
        setSaveMessage('❌ Erreur lors de la mise à jour')
      }
    } catch (error) {
      console.error('Erreur:', error)
      setSaveMessage('❌ Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="user-section">
      <h1>Mon profil</h1>
      <p style={{ marginBottom: '2rem', color: '#666' }}>
        Gérez vos informations personnelles
      </p>

      {saveMessage && (
        <div className={`admin-message ${saveMessage.includes('✅') ? 'success' : 'error'}`}>
          {saveMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ maxWidth: '600px' }}>
        <div className="form-group">
          <label className="form-label">Nom d'utilisateur</label>
          <input
            type="text"
            className="form-input"
            value={user?.username || ''}
            disabled
            style={{ background: '#f0f0f0', cursor: 'not-allowed' }}
          />
          <small style={{ color: '#666', fontSize: '0.85rem' }}>
            Le nom d'utilisateur ne peut pas être modifié
          </small>
        </div>

        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            type="email"
            className="form-input"
            value={user?.email || ''}
            disabled
            style={{ background: '#f0f0f0', cursor: 'not-allowed' }}
          />
          <small style={{ color: '#666', fontSize: '0.85rem' }}>
            L'email ne peut pas être modifié
          </small>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Prénom</label>
            <input
              type="text"
              name="firstName"
              className="form-input"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Nom</label>
            <input
              type="text"
              name="lastName"
              className="form-input"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Téléphone</label>
          <input
            type="tel"
            name="phone"
            className="form-input"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </div>

        <div style={{ borderTop: '1px solid #ddd', marginTop: '2rem', paddingTop: '2rem' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--secondary-color)' }}>
            Changer le mot de passe
          </h3>
          <p style={{ marginBottom: '1rem', color: '#666', fontSize: '0.9rem' }}>
            Laissez vide si vous ne souhaitez pas changer votre mot de passe
          </p>

          <div className="form-group">
            <label className="form-label">Nouveau mot de passe</label>
            <input
              type="password"
              name="password"
              className="form-input"
              value={formData.password}
              onChange={handleChange}
              minLength="6"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Confirmer le mot de passe</label>
            <input
              type="password"
              name="confirmPassword"
              className="form-input"
              value={formData.confirmPassword}
              onChange={handleChange}
              minLength="6"
            />
          </div>
        </div>

        <div style={{ marginTop: '2rem' }}>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default Profile
