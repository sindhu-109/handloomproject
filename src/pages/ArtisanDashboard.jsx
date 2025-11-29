import { useMemo, useState } from 'react'
import DashboardSidebar from '../components/DashboardSidebar'
import useLocalStorage from '../hooks/useLocalStorage'

function ArtisanDashboard() {
  const [user, setUser] = useLocalStorage('user', null)
  const [products, setProducts] = useLocalStorage('products', [])
  const [orders, setOrders] = useLocalStorage('orders', [])
  const [transactions, setTransactions] = useLocalStorage('transactions', [])
  const [accounts, setAccounts] = useLocalStorage('accounts', [])

  // Identify artisan key (email or id)
  const artisanKey = user?.email || user?.id || user?.username || null

  const myProducts = useMemo(() => {
    if (!products) return []
    return products.filter(p => {
      // common product owner keys
      if (!artisanKey) return false
      return (p.artisan === artisanKey) || (p.seller === artisanKey) || (p.owner === artisanKey) || (p.artisanId === artisanKey) || (String(p.userId) === String(artisanKey))
    })
  }, [products, artisanKey])

  const totalProducts = myProducts.length

  // Orders that include any of this artisan's products
  const myOrders = useMemo(() => {
    if (!orders) return []
    return orders.filter(o => {
      const items = o.items || o.lineItems || o.products || []
      if (!Array.isArray(items)) return false
      return items.some(it => {
        // item may have productId or artisan/seller info
        if (!artisanKey) return false
        if (it.artisan === artisanKey || it.seller === artisanKey) return true
        if (it.owner === artisanKey) return true
        if (it.product && (it.product.artisan === artisanKey || it.product.seller === artisanKey)) return true
        if (it.productId) {
          const prod = products.find(p => String(p.id) === String(it.productId))
          if (prod) return (prod.artisan === artisanKey) || (prod.seller === artisanKey) || (String(prod.userId) === String(artisanKey))
        }
        return false
      })
    })
  }, [orders, products, artisanKey])

  const totalOrders = myOrders.length

  const pendingOrders = myOrders.filter(o => !o.status || o.status === 'pending' || o.status === 'processing' || o.status === 'waiting').length

  const totalEarnings = useMemo(() => {
    return myOrders.reduce((sum, o) => {
      const items = o.items || o.lineItems || o.products || []
      const myItemSum = items.reduce((s, it) => {
        // item-level amount
        const qty = Number(it.qty || it.quantity || it.qtyOrdered || 1)
        const price = Number(it.total || it.price || it.unitPrice || it.amount || 0)
        // if item belongs to this artisan
        let belongs = false
        if (it.artisan === artisanKey || it.seller === artisanKey) belongs = true
        if (it.productId) {
          const prod = products.find(p => String(p.id) === String(it.productId))
          if (prod && ((prod.artisan === artisanKey) || (prod.seller === artisanKey) || (String(prod.userId) === String(artisanKey)))) belongs = true
        }
        if (belongs) return s + qty * price
        return s
      }, 0)
      return sum + myItemSum
    }, 0)
  }, [myOrders, products, artisanKey])

  const lowStock = myProducts.filter(p => (p.stock !== undefined) && Number(p.stock) <= (p.reorderLevel || 5))

  const recentProducts = myProducts.slice().sort((a,b)=> (b.createdAt||b.addedAt||0) - (a.createdAt||a.addedAt||0)).slice(0,5)
  const recentOrders = myOrders.slice().sort((a,b)=> (new Date(b.createdAt || b.date || b.updatedAt || 0)) - (new Date(a.createdAt || a.date || a.updatedAt || 0))).slice(0,5)

  // Earnings & profile
  const monthlyEarnings = useMemo(()=>{
    const now = new Date(); const month = now.getMonth(); const year = now.getFullYear()
    return myOrders.reduce((s,o)=>{
      const d = new Date(o.createdAt || o.date || 0)
      if (d.getMonth() === month && d.getFullYear() === year) {
        const items = o.items || o.lineItems || o.products || []
        const mySum = items.reduce((ss,it)=>{
          const qty = Number(it.qty||it.quantity||1)
          const price = Number(it.total||it.price||it.unitPrice||0)
          // belongs?
          let belongs = false
          if (it.artisan === artisanKey || it.seller === artisanKey) belongs = true
          if (it.productId) {
            const prod = products.find(p=> String(p.id) === String(it.productId))
            if (prod && ((prod.artisan===artisanKey) || (prod.seller===artisanKey))) belongs = true
          }
          return belongs ? ss + qty*price : ss
        },0)
        return s + mySum
      }
      return s
    },0)
  }, [myOrders, products, artisanKey])

  const pendingPayouts = useMemo(()=>{
    // transactions where seller/artisan matches and status pending or no payout recorded
    return (transactions || []).filter(tx => (tx.seller === artisanKey || tx.artisan === artisanKey || tx.vendor === artisanKey) && (tx.status === 'pending' || tx.payout === undefined)).reduce((s,tx)=> s + Number(tx.amount||0), 0)
  }, [transactions, artisanKey])

  // transaction history filtered to this artisan where possible
  const myTransactions = useMemo(()=>{
    return (transactions||[]).filter(tx => tx.seller === artisanKey || tx.artisan === artisanKey || tx.vendor === artisanKey)
  }, [transactions, artisanKey])

  // Profile editing
  const currentAccount = accounts?.find(a => a.email === user?.email) || {}
  const [profileForm, setProfileForm] = useState({ name: currentAccount.name || '', bio: currentAccount.bio || '', bankName: currentAccount.bankName || '', accountNumber: currentAccount.accountNumber || '', ifsc: currentAccount.ifsc || '' })

  function saveProfile(e){
    e && e.preventDefault()
    const nextAccounts = (accounts||[]).map(a => a.email === user?.email ? { ...a, ...profileForm } : a)
    // if not present, add
    if (!nextAccounts.find(a=>a.email===user?.email)) nextAccounts.push({ email: user?.email, role: 'artisan', ...profileForm })
    setAccounts(nextAccounts)
    // also update user to reflect name
    setUser({ ...user, name: profileForm.name })
    alert('Profile saved')
  }

  // Ratings & reviews - attempt to read from orders' review fields
  const reviews = useMemo(()=>{
    const revs = []
    myOrders.forEach(o => {
      const items = o.items || o.lineItems || o.products || []
      items.forEach(it => {
        if (it.rating || it.review || it.feedback) {
          const prod = products.find(p=> String(p.id) === String(it.productId))
          if (prod && ((prod.artisan===artisanKey) || (prod.seller===artisanKey))) revs.push({ product: prod.name, rating: it.rating, review: it.review || it.feedback, date: o.createdAt || o.date })
        }
      })
    })
    return revs
  }, [myOrders, products, artisanKey])

  // Orders management state
  const [detailsOpen, setDetailsOpen] = useState({})

  const counts = useMemo(()=>{
    const c = { new:0, processing:0, shipped:0, delivered:0, cancelled:0, returned:0 }
    myOrders.forEach(o => {
      const s = (o.status || 'pending').toLowerCase()
      if (s.includes('new') || s === 'pending') c.new++
      else if (s.includes('processing')) c.processing++
      else if (s.includes('shipped')) c.shipped++
      else if (s.includes('delivered') || s === 'completed') c.delivered++
      else if (s.includes('cancel') ) c.cancelled++
      else if (s.includes('return')) c.returned++
      else c.processing++
    })
    return c
  }, [myOrders])

  function updateOrderStatus(orderId, nextStatus){
    const updated = (orders||[]).map(o => {
      if (String(o.id) !== String(orderId) && String(o.orderId) !== String(orderId)) return o
      return { ...o, status: nextStatus, updatedAt: Date.now() }
    })
    setOrders(updated)
  }

  function toggleDetails(id){
    setDetailsOpen(prev => ({ ...prev, [id]: !prev[id] }))
  }

  // Product management UI state
  const [showAdd, setShowAdd] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ name: '', category: '', price: '', stock: '', status: 'active' })

  function resetForm() { setForm({ name: '', category: '', price: '', stock: '', status: 'active' }); setEditingId(null); setShowAdd(false) }

  function handleAddClick() {
    setShowAdd(true)
    setEditingId(null)
    setForm({ name: '', category: '', price: '', stock: '', status: 'active' })
  }

  function handleEditClick(p) {
    setEditingId(p.id)
    setShowAdd(false)
    setForm({ name: p.name || '', category: p.category || '', price: p.price || '', stock: p.stock || '', status: p.status || 'active' })
  }

  function saveProduct(e) {
    e && e.preventDefault()
    const now = Date.now()
    if (editingId) {
      const next = (products||[]).map(p => {
        if (String(p.id) !== String(editingId)) return p
        return { ...p, name: form.name, category: form.category, price: Number(form.price||0), stock: Number(form.stock||0), status: form.status, updatedAt: now }
      })
      setProducts(next)
      resetForm()
      return
    }

    const newProd = {
      id: `p_${now}`,
      name: form.name,
      category: form.category,
      price: Number(form.price||0),
      stock: Number(form.stock||0),
      status: form.status || 'active',
      approved: false,
      artisan: artisanKey,
      createdAt: now
    }
    setProducts([...(products||[]), newProd])
    resetForm()
  }

  function handleDelete(id) {
    if (!confirm('Delete this product?')) return
    setProducts((products||[]).filter(p => String(p.id) !== String(id)))
  }

  function toggleStatus(p) {
    const next = (products||[]).map(prod => prod.id === p.id ? { ...prod, status: prod.status === 'active' ? 'hidden' : 'active' } : prod)
    setProducts(next)
  }

  return (
    <div className="content layout">
      <DashboardSidebar role="artisan" />
      <main className="dashboard">
        <section id="overview">
          <h1>Artisan Dashboard</h1>
          <p>Quick snapshot of your shop activity.</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginTop: 12 }}>
            <div className="card">
              <div className="muted">Total Products Uploaded</div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{totalProducts}</div>
            </div>
            <div className="card">
              <div className="muted">Total Orders Received</div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{totalOrders}</div>
            </div>
            <div className="card">
              <div className="muted">Pending Orders</div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{pendingOrders}</div>
            </div>
            <div className="card">
              <div className="muted">Total Earnings</div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>${Number(totalEarnings || 0).toFixed(2)}</div>
            </div>
            <div className="card">
              <div className="muted">Low Stock Alerts</div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{lowStock.length}</div>
            </div>
          </div>

        </section>

        <section style={{ marginTop: 18 }} id="earnings-profile">
          <h2>Earnings & Profile</h2>
          <div style={{ display:'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap:12, marginBottom:12 }}>
            <div className="card">
              <div className="muted">Total Earnings</div>
              <div style={{ fontSize:18, fontWeight:700 }}>${Number(totalEarnings||0).toFixed(2)}</div>
            </div>
            <div className="card">
              <div className="muted">This Month</div>
              <div style={{ fontSize:18, fontWeight:700 }}>${Number(monthlyEarnings||0).toFixed(2)}</div>
            </div>
            <div className="card">
              <div className="muted">Pending Payouts</div>
              <div style={{ fontSize:18, fontWeight:700 }}>${Number(pendingPayouts||0).toFixed(2)}</div>
            </div>
            <div className="card">
              <div className="muted">Transactions</div>
              <div style={{ fontSize:18, fontWeight:700 }}>{myTransactions.length}</div>
            </div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns: '1fr 1fr', gap:12 }}>
            <div className="card">
              <h3>Transaction History</h3>
              {myTransactions.length === 0 ? <p className="muted">No transactions found.</p> : (
                <table className="admin-table">
                  <thead><tr><th>ID</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
                  <tbody>
                    {myTransactions.map(tx => (
                      <tr key={tx.id}><td>{tx.id}</td><td>${Number(tx.amount||0).toFixed(2)}</td><td>{tx.status||'pending'}</td><td>{tx.date||tx.transactionDate}</td></tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="card">
              <h3>Edit Profile</h3>
              <form onSubmit={saveProfile} style={{ display:'grid', gap:8 }}>
                <input placeholder="Name" value={profileForm.name} onChange={e=>setProfileForm({...profileForm,name:e.target.value})} />
                <input placeholder="Bio" value={profileForm.bio} onChange={e=>setProfileForm({...profileForm,bio:e.target.value})} />
                <hr />
                <div style={{ fontWeight:700 }}>Bank & Payment Details</div>
                <input placeholder="Bank Name" value={profileForm.bankName} onChange={e=>setProfileForm({...profileForm,bankName:e.target.value})} />
                <input placeholder="Account Number" value={profileForm.accountNumber} onChange={e=>setProfileForm({...profileForm,accountNumber:e.target.value})} />
                <input placeholder="IFSC / Routing" value={profileForm.ifsc} onChange={e=>setProfileForm({...profileForm,ifsc:e.target.value})} />
                <div style={{ display:'flex', gap:8 }}>
                  <button className="btn primary" type="submit">Save Profile</button>
                </div>
              </form>

              <h4 style={{ marginTop:12 }}>Ratings & Reviews</h4>
              {reviews.length === 0 ? <p className="muted">No reviews yet.</p> : (
                <ul>
                  {reviews.map((r,i)=> (<li key={i}><strong>{r.product}</strong> — {r.rating || '—'} stars — {r.review}</li>))}
                </ul>
              )}
            </div>
          </div>
        </section>

        <section style={{ marginTop: 18 }}>
          <h2>Recent Activity</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="card">
              <h3>Recent Products</h3>
              {recentProducts.length === 0 ? <p>No recent products.</p> : (
                <ul>
                  {recentProducts.map(p => (
                    <li key={p.id || p.sku}>{p.name} — {p.category} {p.stock !== undefined ? `(stock: ${p.stock})` : ''}</li>
                  ))}
                </ul>
              )}
            </div>

            <div className="card">
              <h3>Recent Orders</h3>
              {recentOrders.length === 0 ? <p>No recent orders.</p> : (
                <ul>
                  {recentOrders.map(o => (
                    <li key={o.id || o.orderId}>{o.orderId || o.id} — ${Number(o.total || o.amount || 0).toFixed(2)} — {o.status || 'pending'}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>

        <section style={{ marginTop: 18 }} id="manage-products">
          <h2>Product Management</h2>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div>
              <button className="btn primary" onClick={handleAddClick}>Add New Product</button>
            </div>
            <div className="filters">
              <input type="search" placeholder="Search products..." onChange={(e)=>{ /* optional search */ }} />
            </div>
          </div>

          {showAdd && (
            <form className="card" onSubmit={saveProduct} style={{ marginBottom: 12 }}>
              <div style={{ display:'grid', gridTemplateColumns: '1fr 1fr', gap:8 }}>
                <input required placeholder="Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
                <input placeholder="Category" value={form.category} onChange={e=>setForm({...form,category:e.target.value})} />
                <input required placeholder="Price" type="number" value={form.price} onChange={e=>setForm({...form,price:e.target.value})} />
                <input required placeholder="Stock" type="number" value={form.stock} onChange={e=>setForm({...form,stock:e.target.value})} />
                <select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>
                  <option value="active">Active</option>
                  <option value="out_of_stock">Out of stock</option>
                  <option value="hidden">Hidden</option>
                </select>
              </div>
              <div style={{ marginTop:8, display:'flex', gap:8 }}>
                <button className="btn primary" type="submit">Save Product</button>
                <button type="button" className="btn" onClick={resetForm}>Cancel</button>
              </div>
            </form>
          )}

          <div className="card">
            <table className="admin-table">
              <thead>
                <tr><th>Product</th><th>Price</th><th>Stock</th><th>Status</th><th>Approval</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {myProducts.length === 0 ? (
                  <tr><td colSpan={6} className="muted">No products uploaded yet.</td></tr>
                ) : myProducts.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        {p.image ? <img src={p.image} className="thumb" alt="" /> : <div style={{ width:46,height:46,background:'#f3f4f6',borderRadius:8 }} />}
                        <div>
                          <div style={{ fontWeight:700 }}>{p.name}</div>
                          <div className="muted">{p.category}</div>
                        </div>
                      </div>
                    </td>
                    <td>${Number(p.price||0).toFixed(2)}</td>
                    <td>{p.stock !== undefined ? p.stock : '—'}</td>
                    <td>{p.status || 'active'}</td>
                    <td>{p.approved ? <span style={{ color:'#10b981', fontWeight:700 }}>Approved</span> : <span className="muted">Pending</span>}</td>
                    <td>
                      <div className="actions">
                        <button className="btn small" onClick={()=>handleEditClick(p)}>Edit</button>
                        <button className="btn small ghost" onClick={()=>toggleStatus(p)}>Toggle</button>
                        <button className="btn small danger" onClick={()=>handleDelete(p.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section style={{ marginTop: 18 }} id="manage-orders">
          <h2>Order Management</h2>

          <div style={{ display:'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap:12, marginBottom:12 }}>
            <div className="card">
              <div className="muted">New Orders</div>
              <div style={{ fontSize:18, fontWeight:700 }}>{counts.new}</div>
            </div>
            <div className="card">
              <div className="muted">Processing</div>
              <div style={{ fontSize:18, fontWeight:700 }}>{counts.processing}</div>
            </div>
            <div className="card">
              <div className="muted">Shipped</div>
              <div style={{ fontSize:18, fontWeight:700 }}>{counts.shipped}</div>
            </div>
            <div className="card">
              <div className="muted">Delivered</div>
              <div style={{ fontSize:18, fontWeight:700 }}>{counts.delivered}</div>
            </div>
            <div className="card">
              <div className="muted">Cancelled/Returned</div>
              <div style={{ fontSize:18, fontWeight:700 }}>{counts.cancelled + counts.returned}</div>
            </div>
          </div>

          <div className="card">
            <table className="admin-table">
              <thead>
                <tr><th>Order</th><th>Customer</th><th>Amount</th><th>Status</th><th>Items</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {myOrders.length === 0 ? (
                  <tr><td colSpan={6} className="muted">No orders for your products.</td></tr>
                ) : myOrders.map(o => {
                  const buyer = o.buyer || o.customer || o.email || (o.shipping && o.shipping.name) || 'Customer'
                  const amount = Number(o.total || o.amount || (o.items && o.items.reduce? o.items.reduce((s,i)=> s + (Number(i.total||i.price||0) * (i.qty||i.quantity||1)),0):0) || 0)
                  return (
                    <tr key={o.id || o.orderId}>
                      <td>{o.orderId || o.id}</td>
                      <td>{buyer}</td>
                      <td>${amount.toFixed(2)}</td>
                      <td>
                        <select value={o.status || 'pending'} onChange={(e)=>updateOrderStatus(o.id || o.orderId, e.target.value)}>
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="returned">Returned</option>
                        </select>
                      </td>
                      <td>{(o.items || o.lineItems || o.products || []).length}</td>
                      <td>
                        <div className="actions">
                          <button className="btn small" onClick={()=>toggleDetails(o.id || o.orderId)}>{detailsOpen[o.id||o.orderId] ? 'Hide' : 'View'}</button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {/* Details */}
            {myOrders.map(o => (detailsOpen[o.id || o.orderId]) ? (
              <div key={`details-${o.id||o.orderId}`} className="card" style={{ marginTop:8 }}>
                <h4>Order {o.orderId || o.id}</h4>
                <div><strong>Customer:</strong> {o.buyer || o.customer || o.email || '—'}</div>
                <div><strong>Delivery:</strong> {o.shipping ? `${o.shipping.address || ''} ${o.shipping.city||''} ${o.shipping.postal||''}` : (o.address || '—')}</div>
                <div style={{ marginTop:8 }}>
                  <strong>Items (yours)</strong>
                  <ul>
                    {(o.items || o.lineItems || o.products || []).filter(it => {
                      if (it.product && (it.product.artisan === artisanKey || it.product.seller === artisanKey)) return true
                      if (it.artisan === artisanKey || it.seller === artisanKey) return true
                      if (it.productId) {
                        const prod = products.find(p=> String(p.id) === String(it.productId))
                        if (prod && ((prod.artisan === artisanKey) || (prod.seller === artisanKey) || (String(prod.userId) === String(artisanKey)))) return true
                      }
                      return false
                    }).map((it, idx) => (
                      <li key={idx}>{(it.name || (it.product && it.product.name) || it.title) } — qty: {it.qty || it.quantity || 1} — ${Number(it.total||it.price||it.unitPrice||0).toFixed(2)}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : null)}
          </div>
        </section>
      </main>
    </div>
  )
}

export default ArtisanDashboard




