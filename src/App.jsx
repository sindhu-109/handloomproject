import { useMemo, useState } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
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
import MarketingDashboard from './pages/MarketingDashboard'
import './App.css'

function App() {
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cart') || '{}') } catch { return {} }
  })
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null') } catch { return null }
  })

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
    <BrowserRouter>
      <div className="page">
        {/* Header removed: branding and cart moved to Navbar */}
        <Navbar role={user?.role || null} onLogout={handleLogout} />

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
          <Route path="/artisan-dashboard" element={<ArtisanDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/marketing-dashboard" element={<MarketingDashboard />} />
        </Routes>

        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default App
