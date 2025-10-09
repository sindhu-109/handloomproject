import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useLocalStorage from '../hooks/useLocalStorage'

function Login() {
  const navigate = useNavigate()
  const [, setUser] = useLocalStorage('user', null)
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('buyer')

  const handleSubmit = (e) => {
    e.preventDefault()

    const userData = { email, password, role }

    // Store user details (for demo — replace with backend auth)
    setUser(userData)

    // Navigate based on role
    if (role === 'admin') navigate('/admin-dashboard')
    else if (role === 'artisan') navigate('/artisan-dashboard')
    else if (role === 'marketing') navigate('/marketing-dashboard')
    else navigate('/')

    setEmail('')
    setPassword('')
  }

  return (
    <div className="content" style={{ maxWidth: '400px', margin: '60px auto', textAlign: 'center' }}>
      <h1>{isSignUp ? 'Sign Up' : 'Sign In'}</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: '10px', fontSize: '1rem', borderRadius: '8px', border: '1px solid #ccc' }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: '10px', fontSize: '1rem', borderRadius: '8px', border: '1px solid #ccc' }}
        />

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
        >
          <option value="buyer">Buyer</option>
          <option value="artisan">Artisan</option>
          <option value="admin">Admin</option>
          <option value="marketing">Marketing</option>
        </select>

        <button
          type="submit"
          className="add"
          style={{
            backgroundColor: '#6908df',
            color: 'white',
            border: 'none',
            padding: '12px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: 'bold',
          }}
        >
          {isSignUp ? 'Sign Up' : 'Sign In'}
        </button>
      </form>

      <p style={{ marginTop: '15px' }}>
        {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
        <button
          onClick={() => setIsSignUp(!isSignUp)}
          style={{
            background: 'none',
            border: 'none',
            color: '#6908df',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          {isSignUp ? 'Sign In' : 'Sign Up'}
        </button>
      </p>
    </div>
  )
}

export default Login
