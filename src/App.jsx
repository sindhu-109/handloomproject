import { useMemo, useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import useLocalStorage from './hooks/useLocalStorage'
import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetails from './pages/ProductDetails'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Login from './pages/Login'
import Feedback from './pages/Feedback'
import Signup from './pages/Signup'
import ArtisanDashboard from './pages/ArtisanDashboard'
import AdminDashboard from './pages/AdminDashboard'
import AdminUsers from './pages/AdminUsers'
import AdminArtisans from './pages/AdminArtisans'
import AdminInventory from './pages/AdminInventory'
import AdminOrders from './pages/AdminOrders'
import AdminPayments from './pages/AdminPayments'
import AdminReports from './pages/AdminReports'
import MarketingDashboard from './pages/MarketingDashboard'
import './App.css'
import './admin.css'

function AppContent() {
  const navigate = useNavigate()
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cart') || '{}') } catch { return {} }
  })
  const [user, setUser] = useLocalStorage('user', null)

  const totalItems = useMemo(() => {
    return Object.values(cart).reduce((sum, item) => sum + item.qty, 0)
  }, [cart])

  function handleAddToCart(product) {
    setCart(prev => {
      const existing = prev[product.id]
      const nextQty = existing ? existing.qty + 1 : 1
      return { ...prev, [product.id]: { ...product, qty: nextQty } }
    })
  }

  function handleLogout() {
    setUser(null)
    localStorage.removeItem('user')
    // Redirect to home page after logout
    navigate('/', { replace: true })
  }

  // persist cart & user
  if (typeof window !== 'undefined') {
    // naive but fine here
    localStorage.setItem('cart', JSON.stringify(cart))
    localStorage.setItem('user', JSON.stringify(user))
  }

  function handleCheckout() {
    alert('Proceeding to checkout...')
  }

  return (
    <div className="page">
      {/* Header removed: branding and cart moved to Navbar */}
      <Navbar role={user?.role || null} user={user} onLogout={handleLogout} />

      <Routes>
        <Route index element={<Home onAddToCart={handleAddToCart} />} />
        <Route path="/products" element={<Products onAddToCart={handleAddToCart} />} />
        <Route path="/products/:id" element={<ProductDetails onAddToCart={p => handleAddToCart(p)} />} />
        <Route path="/product/:id" element={<ProductDetails onAddToCart={p => handleAddToCart(p)} />} />
        <Route path="/cart" element={<Cart cart={cart} onCheckout={handleCheckout} />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/login" element={<Login />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/signup" element={<Signup />} />
        <Route 
          path="/artisan-dashboard" 
          element={
            <ProtectedRoute requiredRole="artisan">
              <ArtisanDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin-dashboard" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/artisans"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminArtisans />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/inventory"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminInventory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/payments"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminPayments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminReports />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/marketing-dashboard" 
          element={
            <ProtectedRoute requiredRole="marketing">
              <MarketingDashboard />
            </ProtectedRoute>
          } 
        />
      </Routes>

      <Footer />
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App
