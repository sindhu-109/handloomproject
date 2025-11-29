import { useEffect, useState } from 'react'

function DashboardSidebar({ role }) {
  const itemsByRole = {
    artisan: [
      { id: 'overview', label: 'Overview', href: '#overview' },
      { id: 'products', label: 'Products', href: '#manage-products' },
      { id: 'orders', label: 'Orders', href: '#manage-orders' },
      { id: 'earnings', label: 'Earnings & Profile', href: '#earnings-profile' },
    ],
    admin: [
      { id: 'overview', label: 'Overview', href: '/admin-dashboard' },
      { id: 'users', label: 'Users', href: '/admin/users' },
      { id: 'artisans', label: 'Artisans', href: '/admin/artisans' },
      { id: 'inventory', label: 'Inventory', href: '/admin/inventory' },
      { id: 'reports', label: 'Reports', href: '/admin/reports' },
    ],
    marketing: [
      { id: 'overview', label: 'Overview' },
      { id: 'campaigns', label: 'Campaigns' },
      { id: 'analytics', label: 'Analytics' },
    ],
  }

  const items = itemsByRole[role] || []
  const [activeHash, setActiveHash] = useState(typeof window !== 'undefined' ? window.location.hash || '' : '')

  useEffect(()=>{
    function onHash(){ setActiveHash(window.location.hash || '') }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  },[])

  function handleClick(e, href){
    if (!href) return
    if (href.startsWith('#')){
      e.preventDefault()
      const id = href.slice(1)
      const el = document.getElementById(id)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        try { history.replaceState(null, '', href) } catch(e) {}
        setActiveHash(href)
      } else {
        // fallback to setting hash
        try { history.replaceState(null, '', href) } catch(e) { window.location.hash = href }
        setActiveHash(href)
      }
    }
  }

  return (
    <aside className="sidebar">
      <h3>Dashboard</h3>
      {items.length ? (
        <ul>
          {items.map((it) => {
            const href = it.href || `#${it.id}`
            const isActive = href === activeHash
            return (
              <li key={it.id}><a href={href} onClick={(e)=>handleClick(e, href)} className={isActive? 'active' : ''}>{it.label}</a></li>
            )
          })}
        </ul>
      ) : (
        <p style={{ margin: 0 }}>No local links configured.</p>
      )}
    </aside>
  )
}

export default DashboardSidebar


