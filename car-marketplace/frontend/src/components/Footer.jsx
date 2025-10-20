import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

function Footer() {
  const [menuItems, setMenuItems] = useState([])

  useEffect(() => {
    fetchMenuItems()
  }, [])

  const fetchMenuItems = async () => {
    try {
      const response = await fetch('/api/menus/footer')
      const data = await response.json()
      if (data.items) {
        setMenuItems(data.items.sort((a, b) => a.order - b.order))
      }
    } catch (error) {
      console.error('Erreur lors du chargement du menu footer:', error)
    }
  }

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>AutoMarket</h3>
            <p>Votre marketplace de confiance pour l'achat et la vente de voitures d'occasion.</p>
          </div>
          <div className="footer-section">
            <h4>Liens utiles</h4>
            <nav className="footer-nav">
              {menuItems.map(item => (
                <Link key={item.id} to={item.url} className="footer-link">
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="footer-section">
            <h4>Contact</h4>
            <p>Email: contact@automarket.fr</p>
            <p>Tél: 01 23 45 67 89</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 AutoMarket - Tous droits réservés</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
