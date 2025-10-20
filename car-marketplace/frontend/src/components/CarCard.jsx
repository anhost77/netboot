import { Link } from 'react-router-dom'

function CarCard({ car }) {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(price)
  }

  return (
    <Link to={`/car/${car.id}`} className="car-card">
      <img src={car.image} alt={car.title} className="car-image" />
      <div className="car-info">
        <h3 className="car-title">{car.title}</h3>
        <div className="car-price">{formatPrice(car.price)}</div>
        <div className="car-details">
          <span className="car-detail-item">📅 {car.year}</span>
          <span className="car-detail-item">⚡ {car.fuel}</span>
          <span className="car-detail-item">🔧 {car.transmission}</span>
          <span className="car-detail-item">🛣️ {car.mileage.toLocaleString('fr-FR')} km</span>
        </div>
        <div className="car-location">📍 {car.location}</div>
      </div>
    </Link>
  )
}

export default CarCard
