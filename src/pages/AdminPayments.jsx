import { useMemo } from 'react'
import DashboardSidebar from '../components/DashboardSidebar'
import useLocalStorage from '../hooks/useLocalStorage'

function AdminPayments(){
  const [transactions, setTransactions] = useLocalStorage('transactions', [])

  // Summary cards
  const summary = useMemo(()=>{
    const totalRevenue = (transactions || []).reduce((s,t) => s + (Number(t.amount||0)), 0)
    const now = new Date()
    const month = now.getMonth(); const year = now.getFullYear()
    const monthly = (transactions || []).reduce((s,t)=>{
      const d = new Date(t.date || t.transactionDate || 0)
      return (d.getMonth() === month && d.getFullYear() === year) ? s + Number(t.amount||0) : s
    }, 0)
    const pending = (transactions || []).filter(t => t.status === 'pending').length
    const refunded = (transactions || []).filter(t=> t.refundStatus === 'refunded').reduce((s,t)=> s + Number(t.amount||0), 0)
    return { totalRevenue, monthly, pending, refunded }
  }, [transactions])

  function verify(txId){
    const next = (transactions || []).map(t => t.id === txId ? { ...t, status: 'verified' } : t)
    setTransactions(next)
  }

  function refund(txId){
    const next = (transactions || []).map(t => t.id === txId ? { ...t, refundStatus: 'refunded', status: 'refunded' } : t)
    setTransactions(next)
  }

  return (
    <div className="content layout">
      <DashboardSidebar role="admin" />
      <main className="dashboard">
        <h1>Payment Management</h1>

        <div style={{ display:'flex', gap:12, marginBottom:12 }}>
          <div style={{ padding:12, background:'#fff', border:'1px solid #eef2ff' }}>
            <div style={{ color:'#6b7280' }}>Total Revenue</div>
            <div style={{ fontSize:18, fontWeight:700 }}>${summary.totalRevenue.toFixed(2)}</div>
          </div>
          <div style={{ padding:12, background:'#fff', border:'1px solid #eef2ff' }}>
            <div style={{ color:'#6b7280' }}>Monthly Revenue</div>
            <div style={{ fontSize:18, fontWeight:700 }}>${summary.monthly.toFixed(2)}</div>
          </div>
          <div style={{ padding:12, background:'#fff', border:'1px solid #eef2ff' }}>
            <div style={{ color:'#6b7280' }}>Pending Payments</div>
            <div style={{ fontSize:18, fontWeight:700 }}>{summary.pending}</div>
          </div>
          <div style={{ padding:12, background:'#fff', border:'1px solid #eef2ff' }}>
            <div style={{ color:'#6b7280' }}>Refunded Amount</div>
            <div style={{ fontSize:18, fontWeight:700 }}>${summary.refunded.toFixed(2)}</div>
          </div>
        </div>

        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr>
              <th style={{ padding:8 }}>Transaction ID</th>
              <th style={{ padding:8 }}>Order ID</th>
              <th style={{ padding:8 }}>Buyer</th>
              <th style={{ padding:8 }}>Mode</th>
              <th style={{ padding:8 }}>Amount</th>
              <th style={{ padding:8 }}>Status</th>
              <th style={{ padding:8 }}>Date</th>
              <th style={{ padding:8 }}>Refund Status</th>
              <th style={{ padding:8 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(transactions || []).map(tx => (
              <tr key={tx.id} style={{ borderTop:'1px solid #eee' }}>
                <td style={{ padding:8 }}>{tx.id}</td>
                <td style={{ padding:8 }}>{tx.orderId}</td>
                <td style={{ padding:8 }}>{tx.buyerName || tx.email}</td>
                <td style={{ padding:8 }}>{tx.mode || tx.paymentMode || ''}</td>
                <td style={{ padding:8 }}>${Number(tx.amount||0).toFixed(2)}</td>
                <td style={{ padding:8 }}>{tx.status || 'pending'}</td>
                <td style={{ padding:8 }}>{tx.date || tx.transactionDate}</td>
                <td style={{ padding:8 }}>{tx.refundStatus || 'none'}</td>
                <td style={{ padding:8 }}>
                  {tx.status !== 'verified' && <button onClick={()=>verify(tx.id)} style={{ marginRight:6 }}>Verify</button>}
                  {tx.refundStatus !== 'refunded' && <button onClick={()=>refund(tx.id)} style={{ color:'red' }}>Refund</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

      </main>
    </div>
  )
}

export default AdminPayments
