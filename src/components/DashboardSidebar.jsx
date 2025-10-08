import { Link } from 'react-router-dom'

function DashboardSidebar() {
  return (
    <aside className="sidebar">
      <h3>Dashboard</h3>
      <ul>
        <li><Link to="/artisan-dashboard">Artisan</Link></li>
        <li><Link to="/admin-dashboard">Admin</Link></li>
        <li><Link to="/marketing-dashboard">Marketing</Link></li>
      </ul>
    </aside>
  )
}

export default DashboardSidebar


