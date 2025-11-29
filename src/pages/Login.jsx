import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import useLocalStorage from '../hooks/useLocalStorage'

function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const [user, setUser] = useLocalStorage('user', null)
  const [accounts, setAccounts] = useLocalStorage('accounts', [])
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('buyer')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Get the redirect path from location state, or default to home
  const from = location.state?.from?.pathname || '/'

  // Redirect if user is already logged in and has valid credentials
  // Only redirect if we're not in the middle of a form submission
  useEffect(() => {
    // Only redirect if user exists, we're not submitting, and we're actually on the login page
    if (user && user.email && !isSubmitting && window.location.pathname === '/login') {
      // Read accounts directly from localStorage
      let storedAccounts = []
      try {
        const accountsData = localStorage.getItem('accounts')
        storedAccounts = accountsData ? JSON.parse(accountsData) : []
      } catch (err) {
        console.error('Failed to read accounts:', err)
      }
      
      const account = storedAccounts.find(a => a.email === user.email)
      if (account || storedAccounts.length === 0) {
       
        console.log('Login useEffect - Redirecting logged in user:', user.role)
        let redirectPath = '/'
        if (user.role === 'admin') {
          redirectPath = '/admin-dashboard'
        } else if (user.role === 'artisan') {
          redirectPath = '/artisan-dashboard'
        } else if (user.role === 'marketing') {
          redirectPath = '/marketing-dashboard'
        }
        // Use window.location for reliable navigation
        window.location.href = redirectPath
      }
    }
  }, [user?.email, isSubmitting])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)
    console.log('Form submitted - isSignUp:', isSignUp, 'email:', email, 'role:', role)

    if (isSignUp) {
      // Sign up: check for existing account
      if (!email || !password) {
        setError('Please provide both email and password to sign up')
        return
      }

      if (password.length < 6) {
        setError('Password must be at least 6 characters long')
        return
      }

      // Read accounts from localStorage to check
      let storedAccounts = []
      try {
        const accountsData = localStorage.getItem('accounts')
        storedAccounts = accountsData ? JSON.parse(accountsData) : []
      } catch (err) {
        console.error('Failed to read accounts:', err)
        storedAccounts = accounts
      }
      
      const exists = storedAccounts.find(a => a.email === email)
      if (exists) {
        setError('An account with this email already exists. Please sign in instead.')
        setIsSubmitting(false)
        return
      }

      // Store new account in local storage
      const newAccount = { email, password, role }
      const updatedAccounts = [...accounts, newAccount]
      console.log('Signing up - new account:', newAccount, 'all accounts:', updatedAccounts)
      setAccounts(updatedAccounts)

      // Also directly save to localStorage to ensure it's saved immediately
      try {
        localStorage.setItem('accounts', JSON.stringify(updatedAccounts))
        console.log('Accounts saved to localStorage')
      } catch (err) {
        console.error('Failed to save accounts:', err)
      }

      // Set user and navigate
      const userData = { email, role }
      setUser(userData)
      
      // Also directly save user to localStorage
      try {
        localStorage.setItem('user', JSON.stringify(userData))
      } catch (err) {
        console.error('Failed to save user:', err)
      }
      
      // Navigate based on role or redirect to intended page
      if (from !== '/' && from !== '/login') {
        navigate(from, { replace: true })
      } else if (role === 'admin') {
        navigate('/admin-dashboard', { replace: true })
      } else if (role === 'artisan') {
        navigate('/artisan-dashboard', { replace: true })
      } else if (role === 'marketing') {
        navigate('/marketing-dashboard', { replace: true })
      } else {
        navigate('/', { replace: true })
      }

      setEmail('')
      setPassword('')
      return
    }

    // Sign in: verify credentials against stored accounts
    if (!email || !password) {
      setError('Please provide both email and password to sign in')
      setIsSubmitting(false)
      return
    }

    // Read accounts directly from localStorage to ensure we have the latest data
    let storedAccounts = []
    try {
      const accountsData = localStorage.getItem('accounts')
      storedAccounts = accountsData ? JSON.parse(accountsData) : []
    } catch (err) {
      console.error('Failed to read accounts from localStorage:', err)
      storedAccounts = accounts
    }

    console.log('Signing in - checking accounts:', storedAccounts)
    console.log('Looking for - email:', email, 'password length:', password.length, 'role:', role)
    
    // First check if email exists
    const emailMatch = storedAccounts.find(a => a.email === email)
    if (!emailMatch) {
      setError('No account found with this email address.')
      console.log('No email match found - stored accounts:', storedAccounts)
      setIsSubmitting(false)
      return
    }
    
    console.log('Email found, checking password. Stored password:', emailMatch.password, 'Entered password:', password)
    
    // Then check password
    const match = storedAccounts.find(a => a.email === email && a.password === password)
    console.log('Match found:', match)
    
    if (!match) {
      setError('Invalid password. Please check your password and try again.')
      console.log('Password mismatch - stored password:', emailMatch.password, 'entered password:', password)
      setIsSubmitting(false)
      return
    }

    // Check if role matches
    console.log('Checking role - stored role:', match.role, 'selected role:', role)
    if (match.role !== role) {
      setError(`This account is registered as ${match.role}, not ${role}. Please select the correct role.`)
      setIsSubmitting(false)
      return
    }

    // Authenticated - store user in local storage
    const userData = { email, role: match.role }
    
    // Save user to localStorage first
    try {
      localStorage.setItem('user', JSON.stringify(userData))
      console.log('User saved to localStorage:', userData)
    } catch (err) {
      console.error('Failed to save user:', err)
      setIsSubmitting(false)
      setError('Failed to save user data. Please try again.')
      return
    }
    
    // Update React state
    setUser(userData)
    
    // Also update accounts state to keep it in sync (though we read from localStorage)
    setAccounts(storedAccounts)
    
    // Navigate immediately
    console.log('Navigating to dashboard for role:', match.role, 'from:', from)
    let targetPath = '/'
    if (from !== '/' && from !== '/login') {
      targetPath = from
    } else if (match.role === 'admin') {
      targetPath = '/admin-dashboard'
      console.log('Navigating to /admin-dashboard')
    } else if (match.role === 'artisan') {
      targetPath = '/artisan-dashboard'
      console.log('Navigating to /artisan-dashboard')
    } else if (match.role === 'marketing') {
      targetPath = '/marketing-dashboard'
      console.log('Navigating to /marketing-dashboard')
    } else {
      console.log('Navigating to home')
    }
    
    // Clear form after setting navigation target
    setEmail('')
    setPassword('')
    
    // Navigate immediately using window.location for guaranteed navigation
    console.log('Attempting navigation to:', targetPath)
    console.log('Current user in localStorage:', localStorage.getItem('user'))
    console.log('User data being saved:', userData)
    
    // Use window.location.href for immediate, reliable navigation
    // This bypasses any React Router issues and ensures the page actually navigates
    window.location.href = targetPath
    
    // Reset submitting flag after navigation starts
    setIsSubmitting(false)
  }

  return (
    <div className="content" style={{ maxWidth: '400px', margin: '60px auto', textAlign: 'center', padding: '2rem' }}>
      <h1 style={{ marginBottom: '1.5rem', color: '#6908df' }}>
        {isSignUp ? 'Sign Up' : 'Sign In'}
      </h1>
      
      {error && (
        <div style={{
          backgroundColor: '#fee',
          color: '#c33',
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '1rem',
          border: '1px solid #fcc'
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            setError('')
          }}
          required
          style={{ 
            padding: '12px', 
            fontSize: '1rem', 
            borderRadius: '8px', 
            border: '1px solid #ccc',
            outline: 'none'
          }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value)
            setError('')
          }}
          required
          minLength={isSignUp ? 6 : undefined}
          style={{ 
            padding: '12px', 
            fontSize: '1rem', 
            borderRadius: '8px', 
            border: '1px solid #ccc',
            outline: 'none'
          }}
        />

        <select
          value={role}
          onChange={(e) => {
            setRole(e.target.value)
            setError('')
          }}
          style={{ 
            padding: '12px', 
            borderRadius: '8px', 
            border: '1px solid #ccc',
            outline: 'none',
            cursor: 'pointer'
          }}
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
            marginTop: '0.5rem',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#5a07c4'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#6908df'}
        >
          {isSignUp ? 'Sign Up' : 'Sign In'}
        </button>
      </form>

      <p style={{ marginTop: '20px', fontSize: '0.95rem' }}>
        {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
        <button
          onClick={() => {
            setIsSignUp(!isSignUp)
            setError('')
            setEmail('')
            setPassword('')
          }}
          style={{
            background: 'none',
            border: 'none',
            color: '#6908df',
            fontWeight: 'bold',
            cursor: 'pointer',
            textDecoration: 'underline',
            fontSize: '0.95rem'
          }}
        >
          {isSignUp ? 'Sign In' : 'Sign Up'}
        </button>
      </p>
    </div>
  )
}

export default Login
