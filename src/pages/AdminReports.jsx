import { useMemo, useRef } from 'react'
import DashboardSidebar from '../components/DashboardSidebar'
import useLocalStorage from '../hooks/useLocalStorage'

function LineChart({ points = [], width = 600, height = 160 }) {
  if (!points.length) return <div>No data</div>
  const max = Math.max(...points.map(p => p.value)) || 1
  const stepX = width / Math.max(1, points.length - 1)
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${i * stepX} ${height - (p.value / max) * height}`).join(' ')
  return (
    <svg width={width} height={height} style={{ background: '#fff' }}>
      <path d={path} fill="none" stroke="#4f46e5" strokeWidth={2} />
    </svg>
  )
}

function BarChart({ bars = [], width = 600, height = 160 }) {
  if (!bars.length) return <div>No data</div>
  const max = Math.max(...bars.map(b => b.value)) || 1
  const bw = width / bars.length
  return (
    <svg width={width} height={height} style={{ background: '#fff' }}>
      {bars.map((b, i) => (
        <rect key={i} x={i * bw + 4} y={height - (b.value / max) * height} width={bw - 8} height={(b.value / max) * height} fill="#f97316" />
      ))}
    </svg>
  )
}

function PieChart({ slices = [], size = 160 }) {
  const total = slices.reduce((s, x) => s + x.value, 0) || 1
  let angle = -Math.PI / 2
  const r = size / 2
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {slices.map((s, i) => {
        const portion = s.value / total
        const next = angle + portion * Math.PI * 2
        const x1 = r + Math.cos(angle) * r
        const y1 = r + Math.sin(angle) * r
        const x2 = r + Math.cos(next) * r
        const y2 = r + Math.sin(next) * r
        const large = portion > 0.5 ? 1 : 0
        const path = `M ${r} ${r} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`
        angle = next
        const color = s.color || ['#ef4444','#f59e0b','#10b981','#3b82f6','#8b5cf6'][i % 5]
        return <path key={i} d={path} fill={color} stroke="#fff" />
      })}
    </svg>
  )
}

function downloadCSV(filename, rows) {
  const csv = rows.map(r => r.map(c => '"' + String(c).replace(/"/g, '""') + '"').join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url)
}

function AdminReports(){
  const [orders] = useLocalStorage('orders', [])
  const [products] = useLocalStorage('products', [])
  const [campaigns] = useLocalStorage('campaigns', [])
  const [accounts] = useLocalStorage('accounts', [])
  const ref = useRef()

  // Daily sales for last N days
  const daily = useMemo(()=>{
    const map = {}
    const days = 14
    for (let i = days-1; i >=0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i)
      const key = d.toISOString().slice(0,10); map[key] = 0
    }
    ;(orders||[]).forEach(o => {
      const k = (o.date || o.createdAt || '').slice(0,10)
      if (k in map) map[k] += Number(o.total || 0)
    })
    const points = Object.keys(map).map(k => ({ label: k, value: Number(map[k]) }))
    return points
  }, [orders])

  const categoryDist = useMemo(()=>{
    const counts = {}
    ;(products||[]).forEach(p => { const c = p.category || 'Uncategorized'; counts[c] = (counts[c]||0) + (p.sales || 0) })
    const items = Object.entries(counts).map(([k,v]) => ({ label:k, value:v }))
    return items.sort((a,b)=>b.value-a.value)
  }, [products])

  const topProducts = useMemo(()=>{
    return (products||[]).slice().sort((a,b)=> (b.sales||0) - (a.sales||0)).slice(0,10)
  }, [products])

  const topArtisans = useMemo(()=>{
    const map = {}
    ;(products||[]).forEach(p => { const a = p.artisan || p.seller || 'unknown'; map[a] = (map[a]||0) + (p.sales||0) })
    return Object.entries(map).map(([k,v])=>({ artisan:k, sales:v })).sort((a,b)=>b.sales-a.sales).slice(0,10)
  }, [products])

  const userGrowth = useMemo(()=>{
    const map = {}
    ;(accounts||[]).forEach(a => { const d = (a.registrationDate || '').slice(0,10) || (a.registeredAt||'').slice(0,10); if (!d) return; map[d] = (map[d]||0) + 1 })
    const points = Object.entries(map).sort().map(([k,v])=>({ label:k, value:v }))
    return points
  }, [accounts])

  function exportDailyCSV(){
    const rows = [['date','revenue'], ...daily.map(d=>[d.label, d.value])]
    downloadCSV('daily_sales.csv', rows)
  }

  function printPDF(){
    window.print()
  }

  // Smart insights (simple heuristics)
  const insights = useMemo(()=>{
    const suggested = []
    if ((categoryDist[0] && categoryDist[0].value === 0) || categoryDist.length===0) suggested.push('No sales data to suggest high-demand categories')
    else suggested.push(`Top category: ${categoryDist[0].label}`)
    if (daily.length) {
      const peak = daily.reduce((a,b)=> a.value>b.value?a:b)
      suggested.push(`Peak revenue day: ${peak.label} ($${peak.value.toFixed(2)})`)
    }
    const loss = (products||[]).filter(p => (p.price||0) < (p.cost||0))
    if (loss.length) suggested.push(`${loss.length} product(s) likely loss-making`) 
    else suggested.push('No obvious loss-making products detected')
    return suggested
  }, [categoryDist, daily, products])

  return (
    <div className="content layout" ref={ref}>
      <DashboardSidebar role="admin" />
      <main className="dashboard">
        <h1>Reports & Analytics</h1>

        <section>
          <h2>Revenue Trend (last 14 days)</h2>
          <LineChart points={daily} />
          <div style={{ marginTop:8 }}>
            <button onClick={exportDailyCSV} style={{ marginRight:8 }}>Download CSV</button>
            <button onClick={printPDF}>Print / Save as PDF</button>
          </div>
        </section>

        <section style={{ marginTop:16 }}>
          <h2>Daily Sales (bar)</h2>
          <BarChart bars={daily.map(d=>({ label:d.label, value:d.value }))} />
        </section>

        <section style={{ marginTop:16 }}>
          <h2>Category distribution</h2>
          <PieChart slices={categoryDist.map((s,i)=>({ label:s.label, value:s.value, color: ['#ef4444','#f59e0b','#10b981','#3b82f6','#8b5cf6'][i%5] }))} />
        </section>

        <section style={{ marginTop:16 }}>
          <h2>Top Selling Products</h2>
          <ol>
            {topProducts.map(p => (<li key={p.id}>{p.name} — {p.sales || 0} sales</li>))}
          </ol>
        </section>

        <section style={{ marginTop:16 }}>
          <h2>Best Performing Artisans</h2>
          <ol>
            {topArtisans.map(a => (<li key={a.artisan}>{a.artisan} — {a.sales} sales</li>))}
          </ol>
        </section>

        <section style={{ marginTop:16 }}>
          <h2>User Registration Growth</h2>
          <LineChart points={userGrowth} width={500} />
        </section>

        <section style={{ marginTop:16 }}>
          <h2>Smart Insights</h2>
          <ul>
            {insights.map((ins,i)=> <li key={i}>{ins}</li>)}
          </ul>
        </section>

      </main>
    </div>
  )
}

export default AdminReports
