import { useEffect, useMemo, useState } from 'react'
import useLocalStorage from '../hooks/useLocalStorage'
import DashboardSidebar from '../components/DashboardSidebar'

function ensureAccountShape(accounts, setAccounts) {
  let changed = false
  const next = accounts.map(a => {
    const copy = { ...a }
    if (!copy.id) { copy.id = `u_${Date.now()}_${Math.floor(Math.random()*1000)}`; changed = true }
    if (!copy.status) { copy.status = 'active'; changed = true }
    if (!copy.registrationDate) { copy.registrationDate = new Date().toISOString(); changed = true }
    if (!('lastLogin' in copy)) { copy.lastLogin = null; changed = true }
    return copy
  })
  if (changed) setAccounts(next)
}

function AdminUsers() {
  const [accounts, setAccounts] = useLocalStorage('accounts', [])
  const [selected, setSelected] = useState([])
  const [q, setQ] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [editingId, setEditingId] = useState(null)
  const [editRole, setEditRole] = useState('buyer')

  useEffect(() => { ensureAccountShape(accounts, setAccounts) }, [])

  const filtered = useMemo(() => {
    return accounts.filter(a => {
      const matchesQ = !q || (a.email || '').toLowerCase().includes(q.toLowerCase())
      const matchesRole = roleFilter === 'all' || a.role === roleFilter
      return matchesQ && matchesRole
    })
  }, [accounts, q, roleFilter])

  function toggleSelect(id) {
    setSelected(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id])
  }

  function deleteUser(id) {
    if (!confirm('Delete this user?')) return
    setAccounts(prev => prev.filter(a => a.id !== id))
  }

  function bulkDelete() {
    if (!selected.length) return alert('No users selected')
    if (!confirm(`Delete ${selected.length} users?`)) return
    setAccounts(prev => prev.filter(a => !selected.includes(a.id)))
    setSelected([])
  }

  function toggleStatus(id) {
    setAccounts(prev => prev.map(a => a.id === id ? { ...a, status: a.status === 'active' ? 'suspended' : 'active' } : a))
  }

  function resetPassword(id) {
    const p = prompt('Enter new password for user:')
    if (!p) return
    setAccounts(prev => prev.map(a => a.id === id ? { ...a, password: p } : a))
  }

  function startEditRole(a) { setEditingId(a.id); setEditRole(a.role) }
  function applyEditRole() {
    if (!editingId) return
    setAccounts(prev => prev.map(a => a.id === editingId ? { ...a, role: editRole } : a))
    setEditingId(null)
  }

  function forceLogout(id) {
    const acc = accounts.find(a=>a.id===id)
    if (!acc) return
    // naive demo: remove active session if same email
    const currentUserRaw = localStorage.getItem('user')
    if (currentUserRaw) {
      try {
        const cur = JSON.parse(currentUserRaw)
        if (cur.email === acc.email) localStorage.removeItem('user')
      } catch {}
    }
    alert('Force logout executed (demo only).')
  }

  return (
    <div className="content layout">
      <DashboardSidebar role="admin" />
      <main className="dashboard">
        <section id="overview">
          <h1>Admin - User Management</h1>
          <p>View and manage all platform users.</p>
        </section>

        <section id="users">
          <div style={{ display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
            <input placeholder="Search by email" value={q} onChange={e=>setQ(e.target.value)} />
            <select value={roleFilter} onChange={e=>setRoleFilter(e.target.value)}>
              <option value="all">All roles</option>
              <option value="admin">Admin</option>
              <option value="artisan">Artisan</option>
              <option value="buyer">Buyer</option>
              <option value="marketing">Marketing</option>
            </select>
            <button onClick={()=>{ setQ(''); setRoleFilter('all') }}>Reset</button>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
              <button onClick={bulkDelete}>Delete Selected</button>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc' }}>
                  <th style={{ padding: 8 }}>#</th>
                  <th style={{ padding: 8 }}>Select</th>
                  <th style={{ padding: 8 }}>Email</th>
                  <th style={{ padding: 8 }}>Role</th>
                  <th style={{ padding: 8 }}>Status</th>
                  <th style={{ padding: 8 }}>Registered</th>
                  <th style={{ padding: 8 }}>Last Login</th>
                  <th style={{ padding: 8 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a, i) => (
                  <tr key={a.id} style={{ borderTop: '1px solid #eee' }}>
                    <td style={{ padding: 8 }}>{i+1}</td>
                    <td style={{ padding: 8 }}><input type="checkbox" checked={selected.includes(a.id)} onChange={()=>toggleSelect(a.id)} /></td>
                    <td style={{ padding: 8 }}>{a.email}</td>
                    <td style={{ padding: 8 }}>{a.role}</td>
                    <td style={{ padding: 8 }}>{a.status}</td>
                    <td style={{ padding: 8 }}>{a.registrationDate ? new Date(a.registrationDate).toLocaleString() : '-'}</td>
                    <td style={{ padding: 8 }}>{a.lastLogin ? new Date(a.lastLogin).toLocaleString() : '-'}</td>
                    <td style={{ padding: 8, whiteSpace: 'nowrap' }}>
                      <button onClick={()=>toggleStatus(a.id)} style={{ marginRight: 6 }}>{a.status === 'active' ? 'Suspend' : 'Activate'}</button>
                      <button onClick={()=>resetPassword(a.id)} style={{ marginRight: 6 }}>Reset PW</button>
                      <button onClick={()=>startEditRole(a)} style={{ marginRight: 6 }}>Change Role</button>
                      <button onClick={()=>forceLogout(a.id)} style={{ marginRight: 6 }}>Force Logout</button>
                      <button onClick={()=>deleteUser(a.id)} style={{ marginRight: 6 }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {editingId && (
            <div style={{ marginTop: 12, padding: 12, background: '#fff', border: '1px solid #eee' }}>
              <h4>Change Role</h4>
              <select value={editRole} onChange={e=>setEditRole(e.target.value)}>
                <option value="admin">Admin</option>
                <option value="artisan">Artisan</option>
                <option value="buyer">Buyer</option>
                <option value="marketing">Marketing</option>
              </select>
              <div style={{ marginTop: 8 }}>
                <button onClick={applyEditRole}>Apply</button>
                <button onClick={()=>setEditingId(null)} style={{ marginLeft: 8 }}>Cancel</button>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default AdminUsers
