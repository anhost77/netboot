function Filters({ filters, onFilterChange, brands }) {
  const handleChange = (e) => {
    const { name, value } = e.target
    onFilterChange({ [name]: value })
  }

  const resetFilters = () => {
    onFilterChange({
      brand: '',
      minPrice: '',
      maxPrice: '',
      minYear: '',
      maxYear: '',
      fuel: '',
      transmission: ''
    })
  }

  return (
    <div className="filters">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3>Filtres</h3>
        <button className="btn btn-secondary" onClick={resetFilters} style={{ padding: '0.5rem 1rem' }}>
          Réinitialiser
        </button>
      </div>

      <div className="filter-group">
        <div>
          <label className="filter-label">Marque</label>
          <select
            name="brand"
            className="filter-select"
            value={filters.brand}
            onChange={handleChange}
          >
            <option value="">Toutes les marques</option>
            {brands.sort().map(brand => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="filter-label">Prix minimum</label>
          <input
            type="number"
            name="minPrice"
            className="filter-input"
            placeholder="Min €"
            value={filters.minPrice}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="filter-label">Prix maximum</label>
          <input
            type="number"
            name="maxPrice"
            className="filter-input"
            placeholder="Max €"
            value={filters.maxPrice}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="filter-label">Année minimum</label>
          <input
            type="number"
            name="minYear"
            className="filter-input"
            placeholder="Min"
            value={filters.minYear}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="filter-label">Année maximum</label>
          <input
            type="number"
            name="maxYear"
            className="filter-input"
            placeholder="Max"
            value={filters.maxYear}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="filter-label">Carburant</label>
          <select
            name="fuel"
            className="filter-select"
            value={filters.fuel}
            onChange={handleChange}
          >
            <option value="">Tous</option>
            <option value="Essence">Essence</option>
            <option value="Diesel">Diesel</option>
            <option value="Électrique">Électrique</option>
            <option value="Hybride">Hybride</option>
          </select>
        </div>

        <div>
          <label className="filter-label">Transmission</label>
          <select
            name="transmission"
            className="filter-select"
            value={filters.transmission}
            onChange={handleChange}
          >
            <option value="">Toutes</option>
            <option value="Manuelle">Manuelle</option>
            <option value="Automatique">Automatique</option>
          </select>
        </div>
      </div>
    </div>
  )
}

export default Filters
