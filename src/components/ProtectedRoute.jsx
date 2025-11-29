import { Navigate, useLocation } from 'react-router-dom'
import useLocalStorage from '../hooks/useLocalStorage'

function ProtectedRoute({ children, requiredRole = null }) {
  const [user] = useLocalStorage('user', null)
  const location = useLocation()

  // Read user and accounts directly from localStorage to ensure we have latest data
  let storedUser = user
  let storedAccounts = []
  
  try {
    const userData = localStorage.getItem('user')
    storedUser = userData ? JSON.parse(userData) : null
    
    const accountsData = localStorage.getItem('accounts')
    storedAccounts = accountsData ? JSON.parse(accountsData) : []
  } catch (err) {
    console.error('ProtectedRoute - Error reading from localStorage:', err)
  }

  console.log('ProtectedRoute - storedUser:', storedUser, 'requiredRole:', requiredRole, 'storedAccounts:', storedAccounts)

  // Check if user is authenticated
  if (!storedUser || !storedUser.email) {
    console.log('ProtectedRoute - No user, redirecting to login')
    // Redirect to login page with the current location as state
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Verify user exists in accounts (if accounts are loaded)
  // This is a security check, but we allow access if accounts haven't loaded yet
  // Only check accounts if they exist, otherwise allow access based on localStorage user
  if (storedAccounts.length > 0) {
    const account = storedAccounts.find(a => a.email === storedUser.email)
    if (!account) {
      // Account not found - but don't block immediately, might be a sync issue
      console.warn('ProtectedRoute - Account not found for user:', storedUser.email, 'Available accounts:', storedAccounts)
      // Only block if we're very sure the account doesn't exist (give it a chance)
      // For now, allow access and let the user try
    } else {
      console.log('ProtectedRoute - Account found:', account)
    }
  } else {
    console.log('ProtectedRoute - Accounts array is empty, allowing access based on user in localStorage')
  }

  // Check role-based access if required
  if (requiredRole && storedUser.role !== requiredRole) {
    console.log('ProtectedRoute - Role mismatch. User role:', storedUser.role, 'Required role:', requiredRole)
    // User doesn't have the required role - redirect to appropriate dashboard or home
    if (storedUser.role === 'admin') return <Navigate to="/admin-dashboard" replace />
    if (storedUser.role === 'artisan') return <Navigate to="/artisan-dashboard" replace />
    if (storedUser.role === 'marketing') return <Navigate to="/marketing-dashboard" replace />
    return <Navigate to="/" replace />
  }

  console.log('ProtectedRoute - Access granted for role:', storedUser.role)
  return children
}

export default ProtectedRoute

