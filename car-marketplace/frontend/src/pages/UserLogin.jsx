import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import SEO from '../components/SEO'

function UserLogin() {
  const navigate = useNavigate()
  const [isRegister, setIsRegister] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password
        })
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem('userToken', data.token)
        localStorage.setItem('currentUser', JSON.stringify(data.user))
        navigate('/account')
      } else {
        setError(data.error || 'Erreur de connexion')
      }
    } catch (err) {
      setError('Erreur de connexion au serveur')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem('userToken', data.token)
        localStorage.setItem('currentUser', JSON.stringify(data.user))
        navigate('/account')
      } else {
        setError(data.error || 'Erreur d\'inscription')
      }
    } catch (err) {
      setError('Erreur de connexion au serveur')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <SEO
        title={`${isRegister ? 'Inscription' : 'Connexion'} - AutoMarket`}
        description="Connectez-vous ou créez un compte pour déposer vos annonces"
      />

      <div className="user-auth-container">
        <div className="user-auth-box">
          <h1>{isRegister ? '👤 Créer un compte' : '🔑 Connexion'}</h1>
          <p style={{ marginBottom: '2rem', color: '#666' }}>
            {isRegister
              ? 'Créez votre compte pour déposer des annonces'
              : 'Connectez-vous à votre espace personnel'}
          </p>

          {error && (
            <div className="error-message" style={{ marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          {!isRegister ? (
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label className="form-label">Email ou nom d'utilisateur</label>
                <input
                  type="text"
                  name="username"
                  className="form-input"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label className="form-label">Mot de passe</label>
                <input
                  type="password"
                  name="password"
                  className="form-input"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '1rem' }}
                disabled={loading}
              >
                {loading ? 'Connexion...' : 'Se connecter'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Prénom *</label>
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
                  <label className="form-label">Nom *</label>
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
                <label className="form-label">Nom d'utilisateur *</label>
                <input
                  type="text"
                  name="username"
                  className="form-input"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email *</label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Téléphone *</label>
                <input
                  type="tel"
                  name="phone"
                  className="form-input"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="06 12 34 56 78"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Mot de passe *</label>
                <input
                  type="password"
                  name="password"
                  className="form-input"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength="6"
                />
                <small style={{ color: '#666', fontSize: '0.85rem' }}>
                  Minimum 6 caractères
                </small>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '1rem' }}
                disabled={loading}
              >
                {loading ? 'Création...' : 'Créer mon compte'}
              </button>
            </form>
          )}

          <div style={{ textAlign: 'center', marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid #ddd' }}>
            {!isRegister ? (
              <p style={{ color: '#666' }}>
                Pas encore de compte ?{' '}
                <button
                  onClick={() => setIsRegister(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary-color)',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Créer un compte
                </button>
              </p>
            ) : (
              <p style={{ color: '#666' }}>
                Déjà inscrit ?{' '}
                <button
                  onClick={() => setIsRegister(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary-color)',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Se connecter
                </button>
              </p>
            )}
          </div>

          {!isRegister && (
            <div style={{ marginTop: '2rem', padding: '1rem', background: '#f8f9fa', borderRadius: '5px' }}>
              <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
                <strong>Comptes de démonstration :</strong>
              </p>
              <p style={{ fontSize: '0.85rem', color: '#666' }}>
                Email : jean.dupont@email.com<br />
                Mot de passe : password123
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default UserLogin
