import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../components/SEO'
import SearchBar from '../components/SearchBar'
import Filters from '../components/Filters'
import CarCard from '../components/CarCard'

function Home() {
  const [cars, setCars] = useState([])
  const [filteredCars, setFilteredCars] = useState([])
  const [loading, setLoading] = useState(true)
  const [editorial, setEditorial] = useState({
    title: 'Trouvez la voiture de vos rêves',
    subtitle: 'Des milliers d\'annonces de voitures d\'occasion vérifiées'
  })
  const [filters, setFilters] = useState({
    search: '',
    brand: '',
    minPrice: '',
    maxPrice: '',
    minYear: '',
    maxYear: '',
    fuel: '',
    transmission: ''
  })

  useEffect(() => {
    fetchCars()
    fetchEditorial()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [cars, filters])

  const fetchCars = async () => {
    try {
      const response = await fetch('/api/cars')
      const data = await response.json()
      setCars(data)
      setFilteredCars(data)
      setLoading(false)
    } catch (error) {
      console.error('Erreur lors du chargement des annonces:', error)
      setLoading(false)
    }
  }

  const fetchEditorial = async () => {
    try {
      const response = await fetch('/api/editorial/homepageBanner')
      const data = await response.json()
      if (data.title) {
        setEditorial(data)
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'éditorial:', error)
    }
  }

  const applyFilters = () => {
    let result = [...cars]

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      result = result.filter(car =>
        car.title.toLowerCase().includes(searchLower) ||
        car.brand.toLowerCase().includes(searchLower) ||
        car.model.toLowerCase().includes(searchLower)
      )
    }

    if (filters.brand) {
      result = result.filter(car => car.brand === filters.brand)
    }

    if (filters.minPrice) {
      result = result.filter(car => car.price >= parseInt(filters.minPrice))
    }

    if (filters.maxPrice) {
      result = result.filter(car => car.price <= parseInt(filters.maxPrice))
    }

    if (filters.minYear) {
      result = result.filter(car => car.year >= parseInt(filters.minYear))
    }

    if (filters.maxYear) {
      result = result.filter(car => car.year <= parseInt(filters.maxYear))
    }

    if (filters.fuel) {
      result = result.filter(car => car.fuel === filters.fuel)
    }

    if (filters.transmission) {
      result = result.filter(car => car.transmission === filters.transmission)
    }

    setFilteredCars(result)
  }

  const handleSearch = (searchTerm) => {
    setFilters({ ...filters, search: searchTerm })
  }

  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters })
  }

  return (
    <div>
      <SEO
        title="AutoMarket - Marketplace de voitures d'occasion"
        description="Trouvez la voiture de vos rêves parmi des milliers d'annonces vérifiées. Achetez et vendez des voitures d'occasion en toute confiance."
        keywords="voiture occasion, achat voiture, vente voiture, automobile, marketplace auto"
      />

      <section className="hero">
        <div className="container">
          <h1>{editorial.title}</h1>
          <p>{editorial.subtitle}</p>
        </div>
      </section>

      <div className="container">
        <SearchBar onSearch={handleSearch} />

        <Filters
          filters={filters}
          onFilterChange={handleFilterChange}
          brands={[...new Set(cars.map(car => car.brand))]}
        />

        <div className="results-info">
          <h2 style={{ marginBottom: '1rem', color: '#004e89' }}>
            {filteredCars.length} {filteredCars.length > 1 ? 'annonces trouvées' : 'annonce trouvée'}
          </h2>
        </div>

        {loading ? (
          <div className="loading">Chargement des annonces...</div>
        ) : filteredCars.length === 0 ? (
          <div className="empty-state">
            <h3>Aucune annonce trouvée</h3>
            <p>Essayez de modifier vos critères de recherche</p>
          </div>
        ) : (
          <div className="cars-grid">
            {filteredCars.map(car => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Home
