import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import CarDetail from './pages/CarDetail'
import PostAd from './pages/PostAd'

function App() {
  return (
    <Router>
      <div className="app">
        <header className="header">
          <div className="container">
            <div className="header-content">
              <Link to="/" className="logo">
                🚗 AutoMarket
              </Link>
              <nav className="nav">
                <Link to="/" className="nav-link">Accueil</Link>
                <Link to="/post-ad" className="btn btn-primary">
                  Déposer une annonce
                </Link>
              </nav>
            </div>
          </div>
        </header>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/car/:id" element={<CarDetail />} />
          <Route path="/post-ad" element={<PostAd />} />
        </Routes>

        <footer className="footer">
          <div className="container">
            <p>&copy; 2025 AutoMarket - Votre marketplace de voitures d'occasion</p>
          </div>
        </footer>
      </div>
    </Router>
  )
}

export default App
