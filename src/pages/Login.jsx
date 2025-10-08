import { useNavigate } from 'react-router-dom'
import useLocalStorage from '../hooks/useLocalStorage'

function Login() {
  const navigate = useNavigate()
  const [, setUser] = useLocalStorage('user', null)

  function setRole(role) {
    setUser({ role })
    if (role === 'admin') navigate('/admin-dashboard')
    else if (role === 'artisan') navigate('/artisan-dashboard')
    else if (role === 'marketing') navigate('/marketing-dashboard')
    else navigate('/')
  }

  return (
    <div className="content">
      <h1>Select Role to Login</h1>
      <div className="grid">
        <button className="add" onClick={() => setRole('buyer')}>Buyer</button>
        <button className="add" onClick={() => setRole('artisan')}>Artisan</button>
        <button className="add" onClick={() => setRole('admin')}>Admin</button>
        <button className="add" onClick={() => setRole('marketing')}>Marketing</button>
      </div>
    </div>
  )
}

export default Login

