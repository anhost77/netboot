import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

function DashboardHome({ user }) {
  const [stats, setStats] = useState({
    adsCount: 0,
    messagesCount: 0,
    recentAds: []
  })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    const token = localStorage.getItem('userToken')

    try {
      const [adsRes, messagesRes] = await Promise.all([
        fetch('/api/users/my-ads', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/messages/conversations', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ])

      const ads = await adsRes.json()
      const messages = await messagesRes.json()

      setStats({
        adsCount: ads.length,
        messagesCount: messages.length,
        recentAds: ads.slice(0, 3)
      })
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(price)
  }

  return (
    <div className="user-home">
      <h1>Tableau de bord</h1>
      <p style={{ marginBottom: '2rem', color: '#666' }}>
        Bienvenue {user?.firstName} ! Gérez vos annonces et vos messages depuis cet espace.
      </p>

      <div className="user-stats">
        <div className="user-stat-card">
          <div className="user-stat-icon">🚗</div>
          <div className="user-stat-value">{stats.adsCount}</div>
          <div className="user-stat-label">Mes annonces</div>
          <Link to="/account/my-ads" className="btn btn-secondary" style={{ marginTop: '1rem' }}>
            Voir mes annonces
          </Link>
        </div>

        <div className="user-stat-card">
          <div className="user-stat-icon">💬</div>
          <div className="user-stat-value">{stats.messagesCount}</div>
          <div className="user-stat-label">Conversations</div>
          <Link to="/account/messages" className="btn btn-secondary" style={{ marginTop: '1rem' }}>
            Voir mes messages
          </Link>
        </div>

        <div className="user-stat-card">
          <div className="user-stat-icon">➕</div>
          <div className="user-stat-label">Nouvelle annonce</div>
          <Link to="/post-ad" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Déposer une annonce
          </Link>
        </div>
      </div>

      {stats.recentAds.length > 0 && (
        <div style={{ marginTop: '3rem' }}>
          <h2 style={{ marginBottom: '1.5rem', color: 'var(--secondary-color)' }}>
            Mes dernières annonces
          </h2>
          <div className="user-recent-ads">
            {stats.recentAds.map(ad => (
              <div key={ad.id} className="user-recent-ad-card">
                <img src={ad.image} alt={ad.title} className="user-recent-ad-image" />
                <div className="user-recent-ad-info">
                  <h3>{ad.title}</h3>
                  <p className="user-recent-ad-price">{formatPrice(ad.price)}</p>
                  <p style={{ color: '#666', fontSize: '0.9rem' }}>
                    {ad.year} • {ad.mileage.toLocaleString('fr-FR')} km
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                    <Link to={`/car/${ad.id}`} className="btn-small btn-view">
                      Voir
                    </Link>
                    <Link to="/account/my-ads" className="btn-small btn-edit">
                      Modifier
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default DashboardHome
