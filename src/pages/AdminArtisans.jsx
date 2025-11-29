import { useState } from 'react'
import DashboardSidebar from '../components/DashboardSidebar'
import useLocalStorage from '../hooks/useLocalStorage'

function AdminArtisans() {
  const [accounts, setAccounts] = useLocalStorage('accounts', [])
  const [tickets, setTickets] = useLocalStorage('supportTickets', [])
  const [filter, setFilter] = useState('all')

  function updateAccount(id, patch) {
    const next = accounts.map(a => a.id === id ? { ...a, ...patch } : a)
    setAccounts(next)
  }

  function handleApprove(id) { updateAccount(id, { status: 'active' }) }
  function handleReject(id) { updateAccount(id, { status: 'rejected' }) }
  function handleSuspend(id) { updateAccount(id, { status: 'suspended' }) }

  function resolveTicket(ticketId) {
    const next = (tickets || []).map(t => t.id === ticketId ? { ...t, status: 'resolved' } : t)
    setTickets(next)
  }

  const visible = (accounts || []).filter(a => filter === 'all' ? true : a.status === filter)

  return (
    <div className="content layout">
      <DashboardSidebar role="admin" />
      <main className="dashboard">
        <h1>Artisan Management</h1>
        <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
          <label>Filter: <select value={filter} onChange={e=>setFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="rejected">Rejected</option>
          </select></label>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left' }}>
              <th style={{ padding:8 }}>Artisan ID</th>
              <th style={{ padding:8 }}>Name / Contact</th>
              <th style={{ padding:8 }}>Shop / Brand</th>
              <th style={{ padding:8 }}>Verification</th>
              <th style={{ padding:8 }}>Products</th>
              <th style={{ padding:8 }}>Sales</th>
              <th style={{ padding:8 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {visible.map(a => (
              <tr key={a.id} style={{ borderTop: '1px solid #eee' }}>
                <td style={{ padding:8 }}>{a.id || a.email}</td>
                <td style={{ padding:8 }}>{a.name || a.email}<br/><small>{a.phone || ''}</small></td>
                <td style={{ padding:8 }}>{a.shopName || a.brand || '-'}</td>
                <td style={{ padding:8 }}>{a.status || 'pending'}</td>
                <td style={{ padding:8 }}>{a.totalProducts || 0}</td>
                <td style={{ padding:8 }}>{a.totalSales ? '$' + Number(a.totalSales).toFixed(2) : '-'}</td>
                <td style={{ padding:8 }}>
                  {a.status !== 'active' && <button onClick={()=>handleApprove(a.id)} style={{marginRight:6}}>Approve</button>}
                  {a.status !== 'rejected' && <button onClick={()=>handleReject(a.id)} style={{marginRight:6}}>Reject</button>}
                  <button onClick={()=>handleSuspend(a.id)}>Suspend</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <section style={{ marginTop: 20 }}>
          <h2>Complaints / Tickets</h2>
          {(tickets || []).length === 0 ? <p>No complaints.</p> : (
            <ul>
              {(tickets || []).map(t => (
                <li key={t.id}>{t.subject} — {t.status} <button onClick={()=>resolveTicket(t.id)} style={{ marginLeft: 8 }}>Resolve</button></li>
              ))}
            </ul>
          )}
        </section>

      </main>
    </div>
  )
}

export default AdminArtisans
