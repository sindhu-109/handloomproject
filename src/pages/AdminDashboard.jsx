import DashboardSidebar from '../components/DashboardSidebar'

function AdminDashboard() {
  return (
    <div className="content layout">
      <DashboardSidebar />
      <main className="dashboard">
        <h1>Admin Dashboard</h1>
        <p>Manage users, inventory, and reports.</p>
      </main>
    </div>
  )
}

export default AdminDashboard




