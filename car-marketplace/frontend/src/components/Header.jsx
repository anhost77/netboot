import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

function Header() {
  const [menuItems, setMenuItems] = useState([])
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    fetchMenuItems()
    checkAuth()
  }, [])

  const fetchMenuItems = async () => {
    try {
      const response = await fetch('/api/menus/main')
      const data = await response.json()
      if (data.items) {
        setMenuItems(data.items.sort((a, b) => a.order - b.order))
      }
    } catch (error) {
      console.error('Erreur lors du chargement du menu:', error)
    }
  }

  const checkAuth = () => {
    const token = localStorage.getItem('adminToken')
    setIsAdmin(!!token)
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    setIsAdmin(false)
    window.location.href = '/'
  }

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            🚗 AutoMarket
          </Link>
          <nav className="nav">
            {menuItems.map(item => (
              <Link key={item.id} to={item.url} className="nav-link">
                {item.label}
              </Link>
            ))}
            {isAdmin ? (
              <>
                <Link to="/admin" className="nav-link" style={{ color: '#ffd700' }}>
                  ⚙️ Admin
                </Link>
                <button
                  onClick={handleLogout}
                  className="btn btn-secondary"
                  style={{ padding: '0.5rem 1rem' }}
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <Link to="/admin/login" className="nav-link">
                Connexion
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header
