import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import StructuredData from './components/StructuredData'
import Home from './pages/Home'
import CarDetail from './pages/CarDetail'
import PostAd from './pages/PostAd'
import ContentPage from './pages/ContentPage'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import UserLogin from './pages/UserLogin'
import UserDashboard from './pages/UserDashboard'

function AppContent() {
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')
  const isAccountRoute = location.pathname.startsWith('/account')
  const hideLayout = isAdminRoute || isAccountRoute

  return (
    <div className="app">
      <StructuredData type="website" />
      <StructuredData type="organization" />

      {!hideLayout && <Header />}

      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/car/:id" element={<CarDetail />} />
        <Route path="/post-ad" element={<PostAd />} />
        <Route path="/page/:slug" element={<ContentPage />} />

        {/* User routes */}
        <Route path="/login" element={<UserLogin />} />
        <Route path="/account/*" element={<UserDashboard />} />

        {/* Admin routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/*" element={<AdminDashboard />} />
      </Routes>

      {!hideLayout && <Footer />}
    </div>
  )
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App
