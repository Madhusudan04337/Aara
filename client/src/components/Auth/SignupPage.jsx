import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AaraLogo from '../AaraLogo/AaraLogo'
import './SignupPage.css'

const SignupPage = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [step, setStep] = useState(1) // Step 1: Email, Step 2: Password/Name
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleNext = (e) => {
    e.preventDefault()
    if (!email) return
    setStep(2)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('http://localhost:5000/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      })

      const data = await res.json()
      if (data.success) {
        if (data.data?.token) {
          localStorage.setItem('aara_token', data.data.token)
          localStorage.setItem('aara_user', JSON.stringify(data.data.user))
        }
        navigate('/')
      } else {
        setError(data.message || 'Signup failed')
      }
    } catch (err) {
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
          Sign up to start<br />listening
        </h1>

        {error && <div className="signup-error-banner">{error}</div>}

        {step === 1 ? (
          /* Step 1: Email Entry */
          <form onSubmit={handleNext} className="signup-form">
            <div className="signup-field">
              <label htmlFor="signup-email">Email Address</label>
              <input
                type="email"
                id="signup-email"
                placeholder="name@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="signup-next-btn">
              Next
            </button>
          </form>
        ) : (
          /* Step 2: Password & Name Entry */
          <form onSubmit={handleSubmit} className="signup-form">
            <div className="signup-field">
              <label htmlFor="signup-name">Profile Name</label>
              <input
                type="text"
                id="signup-name"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="signup-field">
              <label htmlFor="signup-password">Password</label>
              <input
                type="password"
                id="signup-password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <button type="submit" className="signup-next-btn" disabled={loading}>
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>
        )}

        {/* Footer */}
        <div className="signup-footer" style={{ marginTop: '24px' }}>
          <p className="signup-footer-text">Already have account ?</p>
          <Link to="/login" className="signup-login-link">
            Log in
          </Link>
        </div>
      </div>
    </div>
  )
}

export default SignupPage
