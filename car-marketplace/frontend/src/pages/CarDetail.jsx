import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'

function CarDetail() {
  const { id } = useParams()
  const [car, setCar] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCar()
  }, [id])

  const fetchCar = async () => {
    try {
      const response = await fetch(`/api/cars/${id}`)
      const data = await response.json()
      setCar(data)
      setLoading(false)
    } catch (error) {
      console.error('Erreur lors du chargement de l\'annonce:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="container loading">Chargement de l'annonce...</div>
  }

  if (!car) {
    return (
      <div className="container">
        <div className="empty-state">
          <h3>Annonce non trouvée</h3>
          <Link to="/" className="btn btn-primary">Retour aux annonces</Link>
        </div>
      </div>
    )
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(price)
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <div className="container">
      <div style={{ margin: '2rem 0' }}>
        <Link to="/" className="btn btn-secondary">← Retour aux annonces</Link>
      </div>

      <div className="car-detail">
        <img src={car.image} alt={car.title} className="car-detail-image" />

        <div className="car-detail-content">
          <div className="car-detail-header">
            <div>
              <h1 className="car-detail-title">{car.title}</h1>
              <p className="car-location">📍 {car.location}</p>
              <p style={{ color: '#666', marginTop: '0.5rem' }}>
                Publié le {formatDate(car.createdAt)}
              </p>
            </div>
            <div className="car-detail-price">{formatPrice(car.price)}</div>
          </div>

          <div className="car-specs">
            <div className="car-spec">
              <span className="car-spec-label">Marque</span>
              <span className="car-spec-value">{car.brand}</span>
            </div>
            <div className="car-spec">
              <span className="car-spec-label">Modèle</span>
              <span className="car-spec-value">{car.model}</span>
            </div>
            <div className="car-spec">
              <span className="car-spec-label">Année</span>
              <span className="car-spec-value">{car.year}</span>
            </div>
            <div className="car-spec">
              <span className="car-spec-label">Kilométrage</span>
              <span className="car-spec-value">{car.mileage.toLocaleString('fr-FR')} km</span>
            </div>
            <div className="car-spec">
              <span className="car-spec-label">Carburant</span>
              <span className="car-spec-value">{car.fuel}</span>
            </div>
            <div className="car-spec">
              <span className="car-spec-label">Transmission</span>
              <span className="car-spec-value">{car.transmission}</span>
            </div>
          </div>

          <div className="car-description">
            <h3>Description</h3>
            <p style={{ lineHeight: '1.8', color: '#555' }}>{car.description}</p>
          </div>

          <div className="seller-info">
            <h3>Informations du vendeur</h3>
            <div className="seller-contact">
              <div className="seller-contact-item">
                <span>👤</span>
                <strong>{car.seller}</strong>
              </div>
              <div className="seller-contact-item">
                <span>📞</span>
                <a href={`tel:${car.phone}`} style={{ color: 'inherit' }}>{car.phone}</a>
              </div>
              <div className="seller-contact-item">
                <span>📧</span>
                <a href={`mailto:${car.email}`} style={{ color: 'inherit' }}>{car.email}</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CarDetail
