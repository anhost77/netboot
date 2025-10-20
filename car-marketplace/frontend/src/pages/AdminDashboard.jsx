import { useEffect, useState } from 'react'
import { Link, useNavigate, Routes, Route } from 'react-router-dom'
import SEO from '../components/SEO'
import PagesManager from '../components/admin/PagesManager'
import PageEditor from '../components/admin/PageEditor'
import MenusManager from '../components/admin/MenusManager'
import EditorialManager from '../components/admin/EditorialManager'
import UsersManager from '../components/admin/UsersManager'
import AdsManager from '../components/admin/AdsManager'

function AdminDashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    verifyAuth()
  }, [])

  const verifyAuth = async () => {
    const token = localStorage.getItem('adminToken')

    if (!token) {
      navigate('/admin/login')
      return
    }

    try {
      const response = await fetch('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const userData = JSON.parse(localStorage.getItem('adminUser'))
        setUser(userData)
        setLoading(false)
      } else {
        localStorage.removeItem('adminToken')
        localStorage.removeItem('adminUser')
        navigate('/admin/login')
      }
    } catch (error) {
      console.error('Erreur de vérification:', error)
      navigate('/admin/login')
    }
  }

  if (loading) {
    return <div className="container loading">Chargement...</div>
  }

  return (
    <div className="admin-dashboard">
      <SEO
        title="Dashboard Admin - AutoMarket"
        description="Tableau de bord d'administration"
      />

      <div className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h2>⚙️ Administration</h2>
          <p>Bienvenue, {user?.username}</p>
        </div>
        <nav className="admin-nav">
          <Link to="/admin" className="admin-nav-link">
            📊 Tableau de bord
          </Link>
          <Link to="/admin/users" className="admin-nav-link">
            👥 Utilisateurs
          </Link>
          <Link to="/admin/ads" className="admin-nav-link">
            🚗 Annonces
          </Link>
          <Link to="/admin/pages" className="admin-nav-link">
            📄 Pages de contenu
          </Link>
          <Link to="/admin/menus" className="admin-nav-link">
            🧭 Menus
          </Link>
          <Link to="/admin/editorial" className="admin-nav-link">
            ✍️ Contenu éditorial
          </Link>
          <Link to="/" className="admin-nav-link">
            🏠 Retour au site
          </Link>
        </nav>
      </div>

      <div className="admin-content">
        <Routes>
          <Route path="/" element={<DashboardHome />} />
          <Route path="/users" element={<UsersManager />} />
          <Route path="/ads" element={<AdsManager />} />
          <Route path="/pages" element={<PagesManager />} />
          <Route path="/pages/new" element={<PageEditor />} />
          <Route path="/pages/edit/:id" element={<PageEditor />} />
          <Route path="/menus" element={<MenusManager />} />
          <Route path="/editorial" element={<EditorialManager />} />
        </Routes>
      </div>
    </div>
  )
}

function DashboardHome() {
  return (
    <div className="admin-home">
      <h1>Tableau de bord</h1>
      <p style={{ marginBottom: '2rem', color: '#666' }}>
        Gérez votre site AutoMarket depuis cette interface
      </p>

      <div className="admin-cards">
        <Link to="/admin/users" className="admin-card">
          <div className="admin-card-icon">👥</div>
          <h3>Utilisateurs</h3>
          <p>Gérer les utilisateurs du site</p>
        </Link>

        <Link to="/admin/ads" className="admin-card">
          <div className="admin-card-icon">🚗</div>
          <h3>Annonces</h3>
          <p>Gérer toutes les annonces publiées</p>
        </Link>

        <Link to="/admin/pages" className="admin-card">
          <div className="admin-card-icon">📄</div>
          <h3>Pages de contenu</h3>
          <p>Gérer les pages (mentions légales, contact, etc.)</p>
        </Link>

        <Link to="/admin/menus" className="admin-card">
          <div className="admin-card-icon">🧭</div>
          <h3>Menus</h3>
          <p>Configurer les menus de navigation</p>
        </Link>

        <Link to="/admin/editorial" className="admin-card">
          <div className="admin-card-icon">✍️</div>
          <h3>Contenu éditorial</h3>
          <p>Modifier les textes de la page d'accueil</p>
        </Link>
      </div>
    </div>
  )
}

export default AdminDashboard
