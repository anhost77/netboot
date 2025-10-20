import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import SEO from '../components/SEO'

function PostAd() {
  const navigate = useNavigate()
  const [success, setSuccess] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    title: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    price: '',
    mileage: '',
    fuel: 'Essence',
    transmission: 'Manuelle',
    location: '',
    description: '',
    image: ''
  })

  useEffect(() => {
    const token = localStorage.getItem('userToken')
    if (!token) {
      setLoading(false)
      setIsAuthenticated(false)
    } else {
      setIsAuthenticated(true)
      setLoading(false)
    }
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const token = localStorage.getItem('userToken')

    try {
      const response = await fetch('/api/cars', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          year: parseInt(formData.year),
          price: parseInt(formData.price),
          mileage: parseInt(formData.mileage)
        })
      })

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => {
          navigate('/account/my-ads')
        }, 2000)
      }
    } catch (error) {
      console.error('Erreur lors de la création de l\'annonce:', error)
      alert('Une erreur est survenue. Veuillez réessayer.')
    }
  }

  if (loading) {
    return <div className="container loading">Chargement...</div>
  }

  if (!isAuthenticated) {
    return (
      <div className="container">
        <SEO
          title="Connexion requise - AutoMarket"
          description="Connectez-vous pour déposer une annonce"
        />
        <div className="empty-state" style={{ padding: '4rem 0' }}>
          <h2>🔐 Connexion requise</h2>
          <p style={{ marginBottom: '2rem' }}>
            Vous devez être connecté pour déposer une annonce
          </p>
          <Link to="/login" className="btn btn-primary">
            Se connecter ou créer un compte
          </Link>
        </div>
      </div>
    )
  }

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i)

  return (
    <div className="container">
      <SEO
        title="Déposer une annonce - AutoMarket"
        description="Publiez votre annonce de vente de véhicule sur AutoMarket"
      />
      <form className="post-ad-form" onSubmit={handleSubmit}>
        <h2>Déposer une annonce</h2>

        {success && (
          <div className="success-message">
            ✅ Votre annonce a été créée avec succès ! Redirection...
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Titre de l'annonce *</label>
          <input
            type="text"
            name="title"
            className="form-input"
            value={formData.title}
            onChange={handleChange}
            placeholder="Ex: Renault Clio 5 Intens"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Marque *</label>
            <input
              type="text"
              name="brand"
              className="form-input"
              value={formData.brand}
              onChange={handleChange}
              placeholder="Ex: Renault"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Modèle *</label>
            <input
              type="text"
              name="model"
              className="form-input"
              value={formData.model}
              onChange={handleChange}
              placeholder="Ex: Clio"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Année *</label>
            <select
              name="year"
              className="form-select"
              value={formData.year}
              onChange={handleChange}
              required
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
              name="price"
              className="form-input"
              value={formData.price}
              onChange={handleChange}
              placeholder="Ex: 18500"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Kilométrage (km) *</label>
            <input
              type="number"
              name="mileage"
              className="form-input"
              value={formData.mileage}
              onChange={handleChange}
              placeholder="Ex: 25000"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Carburant *</label>
            <select
              name="fuel"
              className="form-select"
              value={formData.fuel}
              onChange={handleChange}
              required
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
              name="transmission"
              className="form-select"
              value={formData.transmission}
              onChange={handleChange}
              required
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
            name="location"
            className="form-input"
            value={formData.location}
            onChange={handleChange}
            placeholder="Ex: Paris"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Description *</label>
          <textarea
            name="description"
            className="form-textarea"
            value={formData.description}
            onChange={handleChange}
            placeholder="Décrivez votre véhicule..."
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">URL de l'image</label>
          <input
            type="url"
            name="image"
            className="form-input"
            value={formData.image}
            onChange={handleChange}
            placeholder="https://exemple.com/image.jpg"
          />
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/')}>
            Annuler
          </button>
          <button type="submit" className="btn btn-primary">
            Publier l'annonce
          </button>
        </div>
      </form>
    </div>
  )
}

export default PostAd
