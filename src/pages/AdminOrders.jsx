import { useState, useMemo } from 'react'
import DashboardSidebar from '../components/DashboardSidebar'
import useLocalStorage from '../hooks/useLocalStorage'

function AdminOrders() {
  const [orders, setOrders] = useLocalStorage('orders', [])
  const [expanded, setExpanded] = useState(null)
  const [filter, setFilter] = useState('all')

  const statuses = ['pending','confirmed','shipped','delivered','cancelled','returned']

  function updateOrder(id, patch) {
    const next = (orders || []).map(o => o.id === id ? { ...o, ...patch } : o)
    setOrders(next)
  }

  function handleStatusChange(id, status) {
    updateOrder(id, { status })
  }

  function handleCancel(id) {
    updateOrder(id, { status: 'cancelled' })
  }

  const visible = (orders || []).filter(o => filter === 'all' ? true : o.status === filter)

  const totals = useMemo(() => {
    const totalAmount = (orders || []).reduce((s, o) => s + Number(o.total || 0), 0)
    const pending = (orders || []).filter(o => o.status === 'pending').length
    return { totalAmount, pending }
  }, [orders])

  return (
    <div className="content layout">
      <DashboardSidebar role="admin" />
      <main className="dashboard">
        <h1>Order Management</h1>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
          <div>Total revenue: <strong>${totals.totalAmount.toFixed(2)}</strong></div>
          <div>Pending orders: <strong>{totals.pending}</strong></div>
          <label style={{ marginLeft: 'auto' }}>Filter: <select value={filter} onChange={e=>setFilter(e.target.value)}>
            <option value="all">All</option>
            {statuses.map(s=> <option key={s} value={s}>{s}</option>)}
          </select></label>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ padding:8 }}>Order ID</th>
              <th style={{ padding:8 }}>Buyer</th>
              <th style={{ padding:8 }}>Product(s)</th>
              <th style={{ padding:8 }}>Qty</th>
              <th style={{ padding:8 }}>Order Date</th>
              <th style={{ padding:8 }}>Total</th>
              <th style={{ padding:8 }}>Delivery Addr</th>
              <th style={{ padding:8 }}>Status</th>
              <th style={{ padding:8 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {visible.map(o => (
              <tr key={o.id} style={{ borderTop: '1px solid #eee' }}>
                <td style={{ padding:8 }}>{o.id}</td>
                <td style={{ padding:8 }}>{o.buyerName || o.email}</td>
                <td style={{ padding:8 }}>{(o.items || []).map(i=> i.name).join(', ')}</td>
                <td style={{ padding:8 }}>{(o.items || []).reduce((s,i)=> s + (i.qty||1), 0)}</td>
                <td style={{ padding:8 }}>{o.date || o.createdAt || ''}</td>
                <td style={{ padding:8 }}>${Number(o.total || 0).toFixed(2)}</td>
                <td style={{ padding:8 }}>{o.address || o.deliveryAddress || ''}</td>
                <td style={{ padding:8 }}>
                  <select value={o.status || 'pending'} onChange={e=>handleStatusChange(o.id, e.target.value)}>
                    {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td style={{ padding:8 }}>
                  <button onClick={()=>setExpanded(expanded === o.id ? null : o.id)} style={{ marginRight:6 }}>View</button>
                  <button onClick={()=>handleCancel(o.id)} style={{ color:'red' }}>Cancel</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {expanded && (()=>{
          const ord = (orders||[]).find(x=>x.id===expanded)
          if(!ord) return null
          return (
            <section style={{ marginTop: 16, padding: 12, background:'#fff', border:'1px solid #eee' }}>
              <h3>Order {ord.id}</h3>
              <div><strong>Buyer:</strong> {ord.buyerName || ord.email}</div>
              <div><strong>Address:</strong> {ord.address || ord.deliveryAddress}</div>
              <div><strong>Items:</strong>
                <ul>{(ord.items||[]).map(it => <li key={it.id}>{it.name} x {it.qty} — ${Number(it.price||0).toFixed(2)}</li>)}</ul>
              </div>
              <div><strong>Total:</strong> ${Number(ord.total||0).toFixed(2)}</div>
            </section>
          )
        })()}

      </main>
    </div>
  )
}

export default AdminOrders
