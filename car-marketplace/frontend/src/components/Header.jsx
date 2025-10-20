import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

function Header() {
  const [menuItems, setMenuItems] = useState([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [isUser, setIsUser] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)

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
    const adminToken = localStorage.getItem('adminToken')
    const userToken = localStorage.getItem('userToken')
    const userData = localStorage.getItem('currentUser')

    setIsAdmin(!!adminToken)
    setIsUser(!!userToken)
    if (userData) {
      setCurrentUser(JSON.parse(userData))
    }
  }

  const handleLogout = () => {
    if (isAdmin) {
      localStorage.removeItem('adminToken')
      localStorage.removeItem('adminUser')
    } else {
      localStorage.removeItem('userToken')
      localStorage.removeItem('currentUser')
    }
    setIsAdmin(false)
    setIsUser(false)
    setCurrentUser(null)
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
            ) : isUser ? (
              <>
                <Link to="/account" className="nav-link">
                  👤 {currentUser?.firstName}
                </Link>
                <Link to="/post-ad" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>
                  Déposer une annonce
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
              <>
                <Link to="/login" className="nav-link">
                  Connexion
                </Link>
                <Link to="/login" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>
                  Déposer une annonce
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header
