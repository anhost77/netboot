import { useEffect, useState } from 'react'
import { Link, useNavigate, Routes, Route } from 'react-router-dom'
import SEO from '../components/SEO'
import MyAds from '../components/user/MyAds'
import Messages from '../components/user/Messages'
import Profile from '../components/user/Profile'
import DashboardHome from '../components/user/DashboardHome'

function UserDashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    verifyAuth()
    fetchUnreadCount()
  }, [])

  const verifyAuth = async () => {
    const token = localStorage.getItem('userToken')

    if (!token) {
      navigate('/login')
      return
    }

    try {
      const response = await fetch('/api/users/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
        setLoading(false)
      } else {
        localStorage.removeItem('userToken')
        localStorage.removeItem('currentUser')
        navigate('/login')
      }
    } catch (error) {
      console.error('Erreur de vérification:', error)
      navigate('/login')
    }
  }

  const fetchUnreadCount = async () => {
    const token = localStorage.getItem('userToken')
    if (!token) return

    try {
      const response = await fetch('/api/messages/unread-count', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setUnreadCount(data.count)
      }
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('userToken')
    localStorage.removeItem('currentUser')
    navigate('/')
  }

  if (loading) {
    return <div className="container loading">Chargement...</div>
  }

  return (
    <div className="user-dashboard">
      <SEO
        title="Mon Compte - AutoMarket"
        description="Gérez vos annonces et vos messages"
      />

      <div className="user-sidebar">
        <div className="user-sidebar-header">
          <h2>👤 Mon Compte</h2>
          <p>Bienvenue, {user?.firstName}</p>
        </div>
        <nav className="user-nav">
          <Link to="/account" className="user-nav-link">
            📊 Tableau de bord
          </Link>
          <Link to="/account/my-ads" className="user-nav-link">
            🚗 Mes annonces
          </Link>
          <Link to="/account/messages" className="user-nav-link">
            💬 Messages
            {unreadCount > 0 && (
              <span className="badge">{unreadCount}</span>
            )}
          </Link>
          <Link to="/account/profile" className="user-nav-link">
            ⚙️ Mon profil
          </Link>
          <Link to="/" className="user-nav-link">
            🏠 Retour au site
          </Link>
          <button onClick={handleLogout} className="user-nav-link" style={{ border: 'none', background: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', color: 'white' }}>
            🚪 Déconnexion
          </button>
        </nav>
      </div>

      <div className="user-content">
        <Routes>
          <Route path="/" element={<DashboardHome user={user} />} />
          <Route path="/my-ads" element={<MyAds />} />
          <Route path="/messages" element={<Messages updateUnreadCount={fetchUnreadCount} />} />
          <Route path="/profile" element={<Profile user={user} setUser={setUser} />} />
        </Routes>
      </div>
    </div>
  )
}

export default UserDashboard
