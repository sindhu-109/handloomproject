import { Link } from 'react-router-dom'

function Navbar({ role, user, onLogout }) {
  return (
    <nav className="nav">
      <div className="nav-brand" style={{fontSize:'2.2rem',fontWeight:'bold',color:'#6908dfff',letterSpacing:'2px',textShadow:'0 2px 8px #f1f1f1ff'}}>
        Handloom Heritage
      </div>
      <div className="nav-links">
        <Link to="/" style={{fontSize:'1.25rem',fontWeight:'600',color:'#6908dfff',padding:'0 12px'}}>Home</Link>
        <Link to="/products" style={{fontSize:'1.25rem',fontWeight:'600',color:'#6908dfff',padding:'0 12px'}}>Products</Link>
        <Link to="/cart" style={{fontSize:'1.25rem',fontWeight:'600',color:'#6908dfff',padding:'0 12px'}}>Cart</Link>
        
        {role === 'artisan' && <Link to="/artisan-dashboard" style={{fontSize:'1.25rem',fontWeight:'600',color:'#6908dfff',padding:'0 12px'}}>Artisan</Link>}
        {role === 'admin' && <Link to="/admin-dashboard" style={{fontSize:'1.25rem',fontWeight:'600',color:'#6908dfff',padding:'0 12px'}}>Admin</Link>}
        {role === 'marketing' && <Link to="/marketing-dashboard" style={{fontSize:'1.25rem',fontWeight:'600',color:'#6908dfff',padding:'0 12px'}}>Marketing</Link>}
        
        {role ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {user && user.email && (
              <span style={{fontSize:'0.9rem',color:'#666',fontStyle:'italic'}}>
                {user.email}
              </span>
            )}
            <button 
              onClick={onLogout}
              style={{
                fontSize:'1rem',
                fontWeight:'600',
                color:'white',
                background:'#dc3545',
                border:'none',
                borderRadius:'8px',
                padding:'8px 18px',
                cursor:'pointer',
                boxShadow:'0 2px 4px rgba(0,0,0,0.2)',
                transition:'background-color 0.2s'
              }}
              onMouseOver={(e) => e.target.style.background = '#c82333'}
              onMouseOut={(e) => e.target.style.background = '#dc3545'}
            >
              Logout
            </button>
          </div>
        ) : (
          <Link to="/login" style={{fontSize:'1.25rem',fontWeight:'700',color:'#6908dfff',background:'#fff7ed',borderRadius:'8px',padding:'6px 18px',boxShadow:'0 2px 8px #a785e1ff'}}>Login</Link>
        )}
      </div>
    </nav>
  )
}

export default Navbar
