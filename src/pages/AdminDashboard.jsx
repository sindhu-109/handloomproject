import { useEffect, useMemo } from 'react'
import DashboardSidebar from '../components/DashboardSidebar'
import useLocalStorage from '../hooks/useLocalStorage'
import products from '../data/products.json'

function AdminDashboard() {
  const [accounts] = useLocalStorage('accounts', [])
  const [orders] = useLocalStorage('orders', [])
  const [supportTickets] = useLocalStorage('supportTickets', [])

  // Totals
  const totalUsers = accounts ? accounts.length : 0
  const totalArtisans = accounts ? accounts.filter(a => a.role === 'artisan').length : 0
  const totalProducts = products ? products.length : 0
  const totalOrders = orders ? orders.length : 0

  // Today's sales (sum of orders today - assume order.total or order.amount)
  const todaysSales = useMemo(() => {
    if (!orders || orders.length === 0) return 0
    const today = new Date().toISOString().slice(0,10)
    return orders.reduce((sum, o) => {
      const d = (o.createdAt || o.date || '').slice(0,10)
      const amt = Number(o.total || o.amount || o.price || 0)
      return d === today ? sum + amt : sum
    }, 0)
  }, [orders])

  const pendingApprovals = accounts ? accounts.filter(a => a.role === 'artisan' && a.status === 'pending').length : 0

  // Recent activity
  const recentUsers = accounts ? [...accounts].sort((a,b)=> (b.registrationDate || 0) - (a.registrationDate || 0)).slice(0,5) : []
  const recentProducts = products ? [...products].slice(-5).reverse() : []
  const recentCompletedOrders = orders ? orders.filter(o => (o.status === 'delivered' || o.status === 'completed')).slice(-5).reverse() : []
  const recentTickets = supportTickets ? (supportTickets || []).filter(t => t.status === 'open').slice(-5).reverse() : []

  useEffect(()=>{
    // placeholder for future side-effects
  }, [])

  return (
    <div className="content layout">
      <DashboardSidebar role="admin" />
      <main className="dashboard">
        <section id="overview">
          <h1>Admin Dashboard</h1>
          <p>Quick platform summary and recent activity.</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginTop: 16 }}>
            <div style={{ padding: 16, borderRadius: 12, background: '#fff', border: '1px solid #eef2ff' }}>
              <div style={{ color: '#6b7280' }}>Total Users</div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{totalUsers}</div>
            </div>
            <div style={{ padding: 16, borderRadius: 12, background: '#fff', border: '1px solid #eef2ff' }}>
              <div style={{ color: '#6b7280' }}>Total Artisans</div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{totalArtisans}</div>
            </div>
            <div style={{ padding: 16, borderRadius: 12, background: '#fff', border: '1px solid #eef2ff' }}>
              <div style={{ color: '#6b7280' }}>Total Products</div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{totalProducts}</div>
            </div>
            <div style={{ padding: 16, borderRadius: 12, background: '#fff', border: '1px solid #eef2ff' }}>
              <div style={{ color: '#6b7280' }}>Total Orders</div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{totalOrders}</div>
            </div>
            <div style={{ padding: 16, borderRadius: 12, background: '#fff', border: '1px solid #eef2ff' }}>
              <div style={{ color: '#6b7280' }}>Today's Sales</div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>${todaysSales.toFixed(2)}</div>
            </div>
            <div style={{ padding: 16, borderRadius: 12, background: '#fff', border: '1px solid #eef2ff' }}>
              <div style={{ color: '#6b7280' }}>Pending Approvals</div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{pendingApprovals}</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
            <a href="/admin/users" className="btn">Add New User</a>
            <a href="#artisans" className="btn">Approve Artisan</a>
            <a href="#inventory" className="btn">Add New Product</a>
            <a href="#reports" className="btn">View Today's Report</a>
          </div>
        </section>

        <section id="recent" style={{ marginTop: 20 }}>
          <h2>Recent Activity</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
            <div style={{ background: '#fff', padding: 12, borderRadius: 8, border: '1px solid #eef2ff' }}>
              <h3>New User Registrations</h3>
              {recentUsers.length === 0 ? <p>No recent users.</p> : (
                <ul>
                  {recentUsers.map(u => (
                    <li key={u.id || u.email}>{u.email}  {u.role}  {u.registrationDate ? new Date(u.registrationDate).toLocaleString() : ''}</li>
                  ))}
                </ul>
              )}

              <h3 style={{ marginTop: 12 }}>Recently Added Products</h3>
              {recentProducts.length === 0 ? <p>No recent products.</p> : (
                <ul>
                  {recentProducts.map(p => (
                    <li key={p.id}>{p.name}  {p.category}</li>
                  ))}
                </ul>
              )}
            </div>

            <div style={{ background: '#fff', padding: 12, borderRadius: 8, border: '1px solid #eef2ff' }}>
              <h3>Latest Completed Orders</h3>
              {recentCompletedOrders.length === 0 ? <p>No completed orders yet.</p> : (
                <ul>
                  {recentCompletedOrders.map(o => (
                    <li key={o.id || o.orderId}>{o.orderId || o.id}  ${Number(o.total || o.amount || 0).toFixed(2)}  {o.buyer || o.email || ''}</li>
                  ))}
                </ul>
              )}

              <h3 style={{ marginTop: 12 }}>Pending Support Tickets</h3>
              {recentTickets.length === 0 ? <p>No open tickets.</p> : (
                <ul>
                  {recentTickets.map(t => (
                    <li key={t.id}>{t.subject || t.id}  {t.status}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>

      </main>
    </div>
  )
}

export default AdminDashboard
