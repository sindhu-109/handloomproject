import { useState, useMemo } from 'react'
import DashboardSidebar from '../components/DashboardSidebar'
import useLocalStorage from '../hooks/useLocalStorage'
import productsData from '../data/products.json'

function SendNotification({ campaigns = [], products = [] }){
  const [notifications, setNotifications] = useLocalStorage('notifications', [])
  // `accounts` is passed from parent to avoid duplicate hooks and keep source of truth
  // If not provided, default to empty array
  // (parent component wires `accounts` via useLocalStorage)
  // eslint-disable-next-line no-unused-vars
  // accept accounts via props for read-only use
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [campaignId, setCampaignId] = useState('')

  function send(e){
    e && e.preventDefault()
    const now = Date.now()
    const recipients = (accounts || []).length
    const note = { id: `n_${now}`, subject, body, campaignId: campaignId || null, date: now, recipients }
    setNotifications([...(notifications||[]), note])
    setSubject('')
    setBody('')
    setCampaignId('')
    alert(`Mock notification queued to ${recipients} recipients`)
  }

  return (
    <form onSubmit={send} style={{ display:'grid', gap:8 }}>
      <input placeholder="Subject" value={subject} onChange={e=>setSubject(e.target.value)} />
      <textarea placeholder="Message" value={body} onChange={e=>setBody(e.target.value)} />
      <select value={campaignId} onChange={e=>setCampaignId(e.target.value)}>
        <option value="">No campaign</option>
        {(campaigns||[]).map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
      </select>
      <div style={{ display:'flex', gap:8 }}>
        <button className="btn primary" type="submit">Send Notification</button>
      </div>
    </form>
  )
}

function statusFor(c) {
  const now = Date.now()
  if (c.manualStatus === 'paused') return 'paused'
  if (c.manualStatus === 'ended') return 'ended'
  const start = new Date(c.start || 0).getTime()
  const end = new Date(c.end || 0).getTime()
  if (!start || now < start) return 'upcoming'
  if (start <= now && now <= end) return 'running'
  return 'expired'
}

function MarketingDashboard() {
  const [campaigns, setCampaigns] = useLocalStorage('campaigns', [])
  const [products] = useLocalStorage('products', productsData)
  const [orders] = useLocalStorage('orders', [])
  const [accounts] = useLocalStorage('accounts', [])
  const [tab, setTab] = useState('all')
  const [form, setForm] = useState({ title: '', start: '', end: '', discount: '', coupon: '', banner: '', featured: [] })

  const enriched = useMemo(()=> (campaigns||[]).map(c => ({ ...c, computedStatus: statusFor(c) })), [campaigns])

  const filtered = useMemo(()=>{
    if (tab === 'all') return enriched
    return enriched.filter(c => {
      if (tab === 'active') return c.computedStatus === 'running' || c.manualStatus === 'running'
      if (tab === 'upcoming') return c.computedStatus === 'upcoming'
      if (tab === 'expired') return c.computedStatus === 'expired' || c.computedStatus === 'ended'
      return true
    })
  }, [enriched, tab])

  function saveCampaign(e){
    e && e.preventDefault()
    const now = Date.now()
    const c = { id: `c_${now}`, title: form.title, start: form.start, end: form.end, discount: Number(form.discount||0), coupon: form.coupon || null, banner: form.banner || null, featured: form.featured || [], manualStatus: 'running' }
    setCampaigns([...(campaigns||[]), c])
    setForm({ title:'', start:'', end:'', discount:'', coupon:'', banner:'', featured:[] })
  }

  function removeCampaign(id){
    if (!confirm('Remove campaign?')) return
    setCampaigns((campaigns||[]).filter(c=> c.id !== id))
  }

  function togglePause(id){
    const next = (campaigns||[]).map(c => c.id === id ? { ...c, manualStatus: c.manualStatus === 'paused' ? 'running' : 'paused' } : c)
    setCampaigns(next)
  }

  function endCampaign(id){
    const next = (campaigns||[]).map(c => c.id === id ? { ...c, manualStatus: 'ended' } : c)
    setCampaigns(next)
  }

  function updateFeatured(id, productId){
    const next = (campaigns||[]).map(c => {
      if (c.id !== id) return c
      const arr = new Set(c.featured || [])
      if (arr.has(productId)) arr.delete(productId); else arr.add(productId)
      return { ...c, featured: Array.from(arr) }
    })
    setCampaigns(next)
  }

  return (
    <div className="content layout">
      <DashboardSidebar role="marketing" />
      <main className="dashboard">
        <section id="overview">
          <h1>Marketing Dashboard</h1>
          <p>Create and manage promotional campaigns.</p>
        </section>
        
          <section id="engagement" style={{ marginTop: 16 }}>
            <h2>Customer Engagement</h2>
            <p>Monitor outreach, feedback and regional demand.</p>

            {/* Notifications / Email campaigns (mock) */}
            <div className="card" style={{ marginBottom: 12 }}>
              <h3>Email & Notification Campaigns</h3>
              <p className="muted">Send a mock email/notification to all customers (saved in `notifications` localStorage).</p>
              <SendNotification campaigns={campaigns} products={products} accounts={accounts} />
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:12 }}>
              <div className="card">
                <div className="muted">Customer Reach</div>
                <div style={{ fontSize:18, fontWeight:700 }}>{(accounts||[]).length}</div>
                <div className="muted" style={{ marginTop:8 }}>Unique customers with accounts</div>
              </div>

              <div className="card">
                <div className="muted">Top Engaged Products</div>
                <div style={{ marginTop:8 }}>
                  {(() => {
                    const map = {}
                    ;(orders||[]).forEach(o => {
                      const items = o.items || o.lineItems || o.products || []
                      items.forEach(it => {
                        if (!it.productId) return
                        map[it.productId] = (map[it.productId] || 0) + (it.qty || it.quantity || 1)
                      })
                    })
                    const rows = Object.entries(map).map(([pid,qty]) => ({ pid, qty })).sort((a,b)=>b.qty-a.qty).slice(0,6)
                    if (!rows.length) return <p className="muted">No engagement data yet.</p>
                    return (<ol>{rows.map(r=>{ const p = (products||[]).find(x=> String(x.id) === String(r.pid)); return <li key={r.pid}>{p? p.name : r.pid} — {r.qty} interactions</li> })}</ol>)
                  })()}
                </div>
              </div>

              <div className="card">
                <div className="muted">Feedback on Campaigns</div>
                <div style={{ marginTop:8 }}>
                  {(() => {
                    // gather feedback from orders/items that include review/rating fields and were linked to campaigns
                    const feedback = []
                    ;(orders||[]).forEach(o => {
                      const items = o.items || o.lineItems || o.products || []
                      items.forEach(it => {
                        if ((it.review || it.feedback || it.rating) && (it.campaignId || o.campaignId || o.coupon)) {
                          feedback.push({ productId: it.productId, rating: it.rating, review: it.review || it.feedback, campaignId: it.campaignId || o.campaignId || o.coupon })
                        }
                      })
                    })
                    if (!feedback.length) return <p className="muted">No campaign feedback yet.</p>
                    return (<ul>{feedback.slice(0,8).map((f,i)=>{ const p = (products||[]).find(x=> String(x.id)===String(f.productId)); return <li key={i}><strong>{p? p.name: 'product'}</strong> — {f.rating ? `${f.rating}★` : ''} {f.review}</li> })}</ul>)
                  })()}
                </div>
              </div>
            </div>

            <div className="card" style={{ marginTop:12 }}>
              <h3>Regional Demand Insights</h3>
              {(() => {
                // aggregate sales by region/city from orders
                const map = {}
                ;(orders||[]).forEach(o => {
                  const region = (o.shipping && (o.shipping.region || o.shipping.state)) || o.region || o.state || o.shipping?.city || 'Unknown'
                  const amt = Number(o.total || o.amount || 0)
                  map[region] = (map[region] || 0) + amt
                })
                const rows = Object.entries(map).map(([k,v])=>({ region:k, value:v })).sort((a,b)=>b.value-a.value).slice(0,8)
                if (!rows.length) return <p className="muted">No regional sales data yet.</p>
                // simple bar chart
                const max = Math.max(...rows.map(r=>r.value)) || 1
                return (
                  <div style={{ display:'grid', gap:6 }}>
                    {rows.map(r => (
                      <div key={r.region} style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <div style={{ width:120 }} className="muted">{r.region}</div>
                        <div style={{ flex:1, height:12, background:'#eef2ff', borderRadius:6 }}>
                          <div style={{ width:`${(r.value/max)*100}%`, height:'100%', background:'#4f46e5', borderRadius:6 }} />
                        </div>
                        <div style={{ width:80, textAlign:'right' }}>${Number(r.value).toFixed(0)}</div>
                      </div>
                    ))}
                  </div>
                )
              })()}
            </div>
          </section>

        <section id="campaigns">
          <h2>Campaigns</h2>

          <div style={{ display:'flex', gap:8, marginBottom:12 }}>
            <button className={`btn ${tab==='all'?'primary':''}`} onClick={()=>setTab('all')}>All</button>
            <button className={`btn ${tab==='active'?'primary':''}`} onClick={()=>setTab('active')}>Active</button>
            <button className={`btn ${tab==='upcoming'?'primary':''}`} onClick={()=>setTab('upcoming')}>Upcoming</button>
            <button className={`btn ${tab==='expired'?'primary':''}`} onClick={()=>setTab('expired')}>Expired</button>
          </div>

          <form className="card" onSubmit={saveCampaign} style={{ marginBottom:12 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
              <input required placeholder="Campaign title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} />
              <input type="date" value={form.start} onChange={e=>setForm({...form,start:e.target.value})} />
              <input type="date" value={form.end} onChange={e=>setForm({...form,end:e.target.value})} />
              <input placeholder="Discount %" type="number" value={form.discount} onChange={e=>setForm({...form,discount:e.target.value})} />
              <input placeholder="Coupon code (optional)" value={form.coupon} onChange={e=>setForm({...form,coupon:e.target.value})} />
              <input placeholder="Banner image URL" value={form.banner} onChange={e=>setForm({...form,banner:e.target.value})} />
            </div>
            <div style={{ marginTop:8 }}>
              <div style={{ marginBottom:8 }}>Featured products (click to toggle)</div>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                {(products||[]).slice(0,12).map(p=> (
                  <button key={p.id} type="button" onClick={()=> setForm(f => ({ ...f, featured: f.featured.includes(p.id) ? f.featured.filter(x=>x!==p.id) : [...f.featured, p.id] }))} className={`btn small ${form.featured.includes(p.id)?'primary':''}`}>{p.name}</button>
                ))}
              </div>
            </div>
            <div style={{ marginTop:8 }}>
              <button className="btn primary" type="submit">Create Campaign</button>
            </div>
          </form>

          <div className="card">
            <table className="admin-table">
              <thead><tr><th>Title</th><th>Period</th><th>Discount</th><th>Coupon</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="muted">No campaigns</td></tr>
                ) : filtered.map(c => (
                  <tr key={c.id}>
                    <td>{c.title}</td>
                    <td>{c.start} → {c.end}</td>
                    <td>{c.discount}%</td>
                    <td>{c.coupon || '—'}</td>
                    <td>{c.manualStatus || c.computedStatus}</td>
                    <td>
                      <div className="actions">
                        <button className="btn small" onClick={()=>togglePause(c.id)}>{c.manualStatus === 'paused' ? 'Resume' : 'Pause'}</button>
                        <button className="btn small warn" onClick={()=>endCampaign(c.id)}>End</button>
                        <button className="btn small danger" onClick={()=>removeCampaign(c.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section id="analytics" style={{ marginTop:16 }}>
          <h2>Performance Analytics</h2>
          <p>Track views, clicks, conversions and sales for campaigns.</p>

          {/* Compute metrics per campaign */}
          {/** Simple chart helpers **/}
          <div className="card" style={{ marginBottom:12 }}>
            <h3>Campaign Summary</h3>
            <div style={{ display:'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap:12 }}>
              {(enriched||[]).map(c => {
                const views = Number(c.views || 0)
                const clicks = Number(c.clicks || 0)
                const ctr = views > 0 ? (clicks / views) * 100 : 0
                // sales: sum orders linked to campaign by id or coupon
                const sales = (orders||[]).reduce((s,o)=>{
                  const used = (o.campaignId && String(o.campaignId) === String(c.id)) || (o.coupon && c.coupon && String(o.coupon).toLowerCase() === String(c.coupon).toLowerCase())
                  if (used) return s + Number(o.total || o.amount || 0)
                  // also check items
                  const items = o.items || o.lineItems || o.products || []
                  const itemSum = items.reduce((isum,it)=>{
                    if (it.campaignId && String(it.campaignId) === String(c.id)) return isum + Number(it.total||it.price||0) * (it.qty||it.quantity||1)
                    return isum
                  },0)
                  return s + itemSum
                },0)

                const conversion = clicks > 0 ? (sales / clicks) * 100 : 0

                return (
                  <div key={c.id} className="card">
                    <div style={{ fontWeight:700 }}>{c.title}</div>
                    <div className="muted">Status: {c.manualStatus || c.computedStatus}</div>
                    <div style={{ marginTop:8 }}>Views: <strong>{views}</strong></div>
                    <div>Clicks: <strong>{clicks}</strong></div>
                    <div>CTR: <strong>{ctr.toFixed(2)}%</strong></div>
                    <div>Sales: <strong>${Number(sales||0).toFixed(2)}</strong></div>
                    <div>Conversion: <strong>{conversion.toFixed(2)}%</strong></div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Product-wise performance & simple charts */}
          <div className="card">
            <h3>Product-wise Promotion Performance</h3>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <div>
                <h4>Sales by Product (featured in campaigns)</h4>
                <div style={{ maxHeight:240, overflow:'auto' }}>
                  {(() => {
                    // compute product sales from orders where items reference productId and belong to any campaign
                    const map = {}
                    ;(orders||[]).forEach(o=>{
                      const items = o.items || o.lineItems || o.products || []
                      items.forEach(it=>{
                        if (!it.productId) return
                        const pid = String(it.productId)
                        const amount = Number(it.total || it.price || 0) * (it.qty||it.quantity||1)
                        map[pid] = (map[pid]||0) + amount
                      })
                    })
                    const rows = Object.entries(map).map(([pid,amt]) => ({ pid, amt }))
                    rows.sort((a,b)=>b.amt-a.amt)
                    return rows.length === 0 ? <p className="muted">No promoted product sales yet.</p> : (
                      <ul>
                        {rows.slice(0,20).map(r=>{
                          const p = (products||[]).find(x=> String(x.id) === String(r.pid))
                          return <li key={r.pid}>{p ? p.name : r.pid} — ${Number(r.amt).toFixed(2)}</li>
                        })}
                      </ul>
                    )
                  })()}
                </div>
              </div>

              <div>
                <h4>Sales Trend (last 14 days)</h4>
                {(() => {
                  const days = 14
                  const map = {}
                  for (let i = days-1; i>=0; i--) { const d = new Date(); d.setDate(d.getDate()-i); map[d.toISOString().slice(0,10)] = 0 }
                  ;(orders||[]).forEach(o=>{
                    const d = (o.date || o.createdAt || '').slice(0,10)
                    if (!d || !(d in map)) return
                    // count only sales tied to campaign (campaignId or coupon)
                    const used = (o.campaignId && enriched.find(c=> String(c.id)===String(o.campaignId))) || (o.coupon && enriched.find(c=> c.coupon && String(c.coupon).toLowerCase() === String(o.coupon).toLowerCase()))
                    if (!used) return
                    map[d] += Number(o.total || o.amount || 0)
                  })
                  const points = Object.keys(map).map(k=>({ label:k, value: map[k] }))
                  // simple SVG sparkline
                  const width = 400, height = 120
                  const max = Math.max(...points.map(p=>p.value)) || 1
                  const stepX = width / Math.max(1, points.length - 1)
                  const path = points.map((p,i)=> `${i===0?'M':'L'} ${i*stepX} ${height - (p.value/max)*height}`).join(' ')
                  return (
                    <div className="chart">
                      <svg width={width} height={height}><path d={path} fill="none" stroke="#3b82f6" strokeWidth={2} /></svg>
                    </div>
                  )
                })()}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default MarketingDashboard




