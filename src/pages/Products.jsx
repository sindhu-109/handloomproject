import { useMemo, useState, useEffect } from 'react'
import ProductCard from '../components/ProductCard'
import products from '../data/products.json'
import { useLocation, useNavigate } from 'react-router-dom'

function Products({ onAddToCart }) {
  const [q, setQ] = useState('')
  const location = useLocation()
  const navigate = useNavigate()

  // Read category from query param if present (e.g. ?category=clothing)
  function getCategoryFromSearch() {
    try {
      const params = new URLSearchParams(location.search)
      const c = params.get('category')
      return c || 'all'
    } catch {
      return 'all'
    }
  }

  const [category, setCategory] = useState(getCategoryFromSearch)
  const [maxPrice, setMaxPrice] = useState('')

  const categories = useMemo(() => ['all', ...new Set(products.map(p => p.category).filter(Boolean))], [])

  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchesText = !q || p.name.toLowerCase().includes(q.toLowerCase()) || (p.artisan || '').toLowerCase().includes(q.toLowerCase())
      const matchesCat = category === 'all' || p.category === category
      const matchesPrice = !maxPrice || Number(p.price) <= Number(maxPrice)
      return matchesText && matchesCat && matchesPrice
    })
  }, [q, category, maxPrice])

  // keep category in sync with the URL search param
  useEffect(() => {
    const c = getCategoryFromSearch()
    if (c !== category) setCategory(c)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search])

  return (
    <div className="content">
      <h1 className="section-title">All Products</h1>
      <div style={{display:'grid',gridTemplateColumns:'1fr auto auto auto',gap:12,margin:'0 0 16px'}}>
        <input placeholder="Search by name or artisan" value={q} onChange={e=>setQ(e.target.value)} />
        <select value={category} onChange={e=>{
          const next = e.target.value
          setCategory(next)
          // update URL so category selection is shareable
          const params = new URLSearchParams(location.search)
          if (next === 'all') params.delete('category')
          else params.set('category', next)
          const qs = params.toString()
          navigate({ pathname: '/products', search: qs ? `?${qs}` : '' }, { replace: true })
        }}>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <input type="number" placeholder="Max price" value={maxPrice} onChange={e=>setMaxPrice(e.target.value)} />
        <button onClick={()=>{setQ('');setCategory('all');setMaxPrice('')}}>Reset</button>
      </div>
      <div className="grid">
        {filtered.map(p => (
          <ProductCard key={p.id} product={p} onAdd={onAddToCart} />
        ))}
      </div>
    </div>
  )
}

export default Products

