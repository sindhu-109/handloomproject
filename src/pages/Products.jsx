import { useMemo, useState } from 'react'
import ProductCard from '../components/ProductCard'
import products from '../data/products.json'

function Products({ onAddToCart }) {
  const [q, setQ] = useState('')
  const [category, setCategory] = useState('all')
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

  return (
    <div className="content">
      <h1 className="section-title">All Products</h1>
      <div style={{display:'grid',gridTemplateColumns:'1fr auto auto auto',gap:12,margin:'0 0 16px'}}>
        <input placeholder="Search by name or artisan" value={q} onChange={e=>setQ(e.target.value)} />
        <select value={category} onChange={e=>setCategory(e.target.value)}>
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

