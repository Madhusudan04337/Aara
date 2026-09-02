import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AaraLogo from '../AaraLogo/AaraLogo'
import { useAuth } from '../../context/useAuth'
import './SignupPage.css'

const LoginPage = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()
      if (data.success) {
        if (data.data?.token) {
          login(data.data.token, data.data.user)
        }
        navigate('/')
      } else {
        setError(data.message || 'Login failed')
      }
    } catch {
      setError('Server error. Please check your backend connection.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="signup-page">
      <div className="signup-container">
        {/* Logo */}
        <div className="signup-logo-wrapper">
          <Link to="/">
            <AaraLogo />
          </Link>
        </div>

        {/* Heading */}
        <h1 className="signup-title">
          Log in to Aara
        </h1>

        {error && <div className="signup-error-banner">{error}</div>}

        <form onSubmit={handleSubmit} className="signup-form">
          <div className="signup-field">
            <label htmlFor="login-email">Email Address</label>
            <input
              type="email"
              id="login-email"
              placeholder="name@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="signup-field">
            <label htmlFor="login-password">Password</label>
            <input
              type="password"
              id="login-password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="signup-next-btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        {/* Footer */}
        <div className="signup-footer" style={{ marginTop: '24px' }}>
          <p className="signup-footer-text">Don&apos;t have an account?</p>
          <Link to="/signup" className="signup-login-link">
            Sign up for Aara
          </Link>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
