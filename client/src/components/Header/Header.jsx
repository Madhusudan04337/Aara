import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AaraLogo from '../AaraLogo/AaraLogo'
import { useAuth } from '../../context/useAuth'
import './Header.css'

const Header = ({ searchQuery, setSearchQuery }) => {
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuth()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowProfileMenu(false)
      }
    }
    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showProfileMenu])

  const initial = user?.name
    ? user.name.charAt(0).toUpperCase()
    : user?.email
    ? user.email.charAt(0).toUpperCase()
    : 'U'

  return (
    <header className="top-bar" role="banner">

      {/* ── DESKTOP LEFT: Logo + Home btn ── */}
      <div className="top-bar__left">
        <Link to="/" className="top-bar__logo-link">
          <AaraLogo />
        </Link>
        <button
          className="top-bar__nav-btn top-bar__desktop-only"
          aria-label="Go to home"
          onClick={() => navigate('/')}
        >
          <i className="fa-solid fa-house" />
        </button>
      </div>

      {/* ── DESKTOP CENTER: Search bar ── */}
      <div className="search-bar top-bar__desktop-only" role="search">
        <i className="fa-solid fa-magnifying-glass search-bar__icon" aria-hidden="true" />
        <input
          id="search-input"
          className="search-bar__input"
          type="text"
          placeholder="What do you want to play?"
          aria-label="Search for songs, artists, or podcasts"
          value={searchQuery || ''}
          onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
        />
        <div className="search-bar__divider" aria-hidden="true" />
        <button className="search-bar__browse-btn" aria-label="Browse categories" title="Browse">
          <i className="fa-solid fa-table-cells-large" />
        </button>
      </div>

      {/* ── DESKTOP RIGHT: Nav links + Actions ── */}
      <div className="top-bar__right top-bar__desktop-only">
        <nav className="top-bar__nav-links" aria-label="Main navigation">
          <a className="top-bar__nav-link" href="#" id="nav-explore">Explore</a>
          <a className="top-bar__nav-link" href="#" id="nav-browse">Browse</a>
          <a className="top-bar__nav-link" href="#" id="nav-live">Live</a>
          <a className="top-bar__nav-link top-bar__premium-link" href="#" id="nav-premium">
            <span className="top-bar__premium-sparkle">✦</span> Premium
          </a>
        </nav>

        {isAuthenticated ? (
          <div className="top-bar__user-section" ref={menuRef}>
            <button 
              className="top-bar__user-btn"
              onClick={() => setShowProfileMenu(prev => !prev)}
              aria-label="User profile menu"
              id="btn-user-profile"
            >
              <div className="top-bar__user-avatar">
                {initial}
              </div>
              <span className="top-bar__user-name">{user?.name || 'Account'}</span>
              <i className={`fa-solid fa-chevron-${showProfileMenu ? 'up' : 'down'} top-bar__user-caret`} />
            </button>

            {showProfileMenu && (
              <div className="top-bar__profile-dropdown">
                <div className="top-bar__profile-header">
                  <span className="profile-header-name">{user?.name || 'User'}</span>
                  <span className="profile-header-email">{user?.email}</span>
                </div>
                <div className="top-bar__dropdown-divider" />
                <button 
                  className="top-bar__dropdown-item"
                  onClick={() => {
                    logout()
                    setShowProfileMenu(false)
                  }}
                  id="btn-logout"
                >
                  <i className="fa-solid fa-arrow-right-from-bracket" />
                  <span>Log out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="top-bar__actions">
            <button className="top-bar__signup-btn" id="btn-signup" onClick={() => navigate('/signup')}>Sign up</button>
            <button className="top-bar__login-btn" id="btn-login" onClick={() => navigate('/login')}>Log in</button>
          </div>
        )}
      </div>

      {/* ── MOBILE RIGHT: Open App + Hamburger ── */}
      <div className="top-bar__mobile-actions top-bar__mobile-only">
        {isAuthenticated ? (
          <button 
            className="top-bar__user-avatar"
            onClick={() => logout()}
            title="Log out"
            style={{ width: '36px', height: '36px' }}
          >
            {initial}
          </button>
        ) : (
          <button className="top-bar__open-app-btn" id="btn-open-app" onClick={() => navigate('/login')}>Log in</button>
        )}
        <button className="top-bar__hamburger" id="btn-hamburger" aria-label="Open menu" aria-haspopup="true">
          <i className="fa-solid fa-bars" />
        </button>
      </div>

    </header>
  )
}

export default Header
