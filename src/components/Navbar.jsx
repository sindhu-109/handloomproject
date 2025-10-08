import { Link } from 'react-router-dom'

function Navbar({ role, onLogout }) {
  return (
    <nav className="nav">
      <div className="nav-brand" style={{fontSize:'2.2rem',fontWeight:'bold',color:'#6908dfff',letterSpacing:'2px',textShadow:'0 2px 8px #f1f1f1ff'}}>
        Handloom Heritage
      </div>
      <div className="nav-links">
        <Link to="/" style={{fontSize:'1.25rem',fontWeight:'600',color:'#6908dfff',padding:'0 12px'}}>Home</Link>
        <Link to="/products" style={{fontSize:'1.25rem',fontWeight:'600',color:'#6908dfff',padding:'0 12px'}}>Products</Link>
        <Link to="/cart" style={{fontSize:'1.25rem',fontWeight:'600',color:'#6908dfff',padding:'0 12px'}}>Cart</Link>
        
        {role === 'artisan' && <Link to="/artisan-dashboard">Artisan</Link>}
        {role === 'admin' && <Link to="/admin-dashboard">Admin</Link>}
        {role === 'marketing' && <Link to="/marketing-dashboard">Marketing</Link>}
        
        {role ? (
          <button className="add" onClick={onLogout}>Logout</button>
        ) : (
          <Link to="/login" style={{fontSize:'1.25rem',fontWeight:'700',color:'#6908dfff',background:'#fff7ed',borderRadius:'8px',padding:'6px 18px',boxShadow:'0 2px 8px #a785e1ff'}}>Login</Link>
        )}
      </div>
    </nav>
  )
}

export default Navbar
