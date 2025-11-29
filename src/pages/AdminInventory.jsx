import { useState, useMemo } from 'react'
import DashboardSidebar from '../components/DashboardSidebar'
import useLocalStorage from '../hooks/useLocalStorage'
import productsData from '../data/products.json'

function AdminInventory() {
  const [products, setProducts] = useLocalStorage('products', productsData)
  const [query, setQuery] = useState('')
  const lowStockThreshold = 5

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return (products || []).filter(p => !q || p.name.toLowerCase().includes(q) || (p.category||'').toLowerCase().includes(q))
  }, [products, query])

  function updateProduct(id, patch) {
    const next = (products || []).map(p => p.id === id ? { ...p, ...patch } : p)
    setProducts(next)
  }

  function deleteProduct(id) {
    const next = (products || []).filter(p => p.id !== id)
    setProducts(next)
  }

  function handleBulkUpload(file) {
    // placeholder: real implementation would parse CSV/JSON
    alert('Bulk upload placeholder — implement CSV/JSON parsing')
  }

  const lowStock = (products || []).filter(p => Number(p.stock || p.quantity || 0) <= lowStockThreshold)

  return (
    <div className="content layout">
      <DashboardSidebar role="admin" />
      <main className="dashboard">
        <h1>Inventory / Product Management</h1>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
          <input placeholder="Search product or category" value={query} onChange={e=>setQuery(e.target.value)} />
          <label style={{ marginLeft: 'auto' }}>Low stock threshold: <strong>{lowStockThreshold}</strong></label>
          <input type="file" accept=".csv,.json" onChange={e=>handleBulkUpload(e.target.files && e.target.files[0])} />
        </div>

        {lowStock.length > 0 && (
          <div style={{ marginBottom: 12, padding: 8, borderRadius: 6, background: '#fff6f6', border: '1px solid #ffd2d2' }}>
            <strong>Low-stock alerts:</strong> {lowStock.length} product(s) below threshold
          </div>
        )}

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ padding:8 }}>Image</th>
              <th style={{ padding:8 }}>Name</th>
              <th style={{ padding:8 }}>Category</th>
              <th style={{ padding:8 }}>Artisan</th>
              <th style={{ padding:8 }}>Price</th>
              <th style={{ padding:8 }}>Stock</th>
              <th style={{ padding:8 }}>Status</th>
              <th style={{ padding:8 }}>Approval</th>
              <th style={{ padding:8 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} style={{ borderTop: '1px solid #eee', background: Number(p.stock || p.quantity || 0) <= lowStockThreshold ? '#fff8e1' : 'transparent' }}>
                <td style={{ padding:8 }}><img src={p.image || p.img || ''} alt="" style={{ width:48, height:48, objectFit:'cover' }} /></td>
                <td style={{ padding:8 }}>{p.name}</td>
                <td style={{ padding:8 }}>{p.category}</td>
                <td style={{ padding:8 }}>{p.artisan || p.seller || '-'}</td>
                <td style={{ padding:8 }}>${Number(p.price || p.amount || 0).toFixed(2)}</td>
                <td style={{ padding:8 }}>{p.stock ?? p.quantity ?? 0}</td>
                <td style={{ padding:8 }}>{p.status || (p.stock > 0 ? 'Active' : 'Out of Stock')}</td>
                <td style={{ padding:8 }}>{p.approval || p.approved ? 'Approved' : 'Pending'}</td>
                <td style={{ padding:8 }}>
                  <button onClick={()=>updateProduct(p.id, { approval: true })} style={{ marginRight:6 }}>Approve</button>
                  <button onClick={()=>updateProduct(p.id, { status: 'disabled' })} style={{ marginRight:6 }}>Disable</button>
                  <button onClick={()=>deleteProduct(p.id)} style={{ color:'red' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

      </main>
    </div>
  )
}

export default AdminInventory
