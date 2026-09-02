import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import AaraLogo from '../AaraLogo/AaraLogo'
import { useAuth } from '../../context/useAuth'
import './Header.css'

const Header = ({ searchQuery, setSearchQuery }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isAuthenticated, logout } = useAuth()

  const [showProfileMenu, setShowProfileMenu] = useState(false)
  
  const desktopMenuRef = useRef(null)
  const mobileMenuRef = useRef(null)
  const headerRef = useRef(null)

  // Close profile menu on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      const clickedInsideDesktop = desktopMenuRef.current && desktopMenuRef.current.contains(e.target)
      const clickedInsideMobile = mobileMenuRef.current && mobileMenuRef.current.contains(e.target)
      if (!clickedInsideDesktop && !clickedInsideMobile) {
        setShowProfileMenu(false)
      }
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowProfileMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const prevPathRef = useRef(location.pathname)
  useEffect(() => {
    if (prevPathRef.current !== location.pathname) {
      prevPathRef.current = location.pathname
      setShowProfileMenu(false)
    }
  }, [location.pathname])

  const initial = user?.name
    ? user.name.charAt(0).toUpperCase()
    : user?.email
    ? user.email.charAt(0).toUpperCase()
    : 'U'

  return (
    <header className="top-bar" role="banner" ref={headerRef}>

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
        {searchQuery && (
          <button 
            className="search-bar__clear-btn" 
            onClick={() => setSearchQuery && setSearchQuery('')}
            title="Clear search"
            aria-label="Clear search"
          >
            <i className="fa-solid fa-xmark" />
          </button>
        )}
        <div className="search-bar__divider" aria-hidden="true" />
        <button 
          className={`search-bar__browse-btn ${location.pathname === '/browse' ? 'search-bar__browse-btn--active' : ''}`} 
          aria-label="Browse categories" 
          title="Browse Catalog & Genres"
          onClick={() => navigate('/browse')}
          id="btn-search-browse-grid"
        >
          <i className="fa-solid fa-table-cells-large" />
        </button>
      </div>

      {/* ── DESKTOP RIGHT: Nav links + Actions ── */}
      <div className="top-bar__right top-bar__desktop-only">
        <nav className="top-bar__nav-links" aria-label="Main navigation">
          <Link 
            className={`top-bar__nav-link ${location.pathname === '/' ? 'top-bar__nav-link--active' : ''}`} 
            to="/" 
            id="nav-explore"
          >
            Explore
          </Link>
          <Link 
            className={`top-bar__nav-link ${location.pathname === '/browse' ? 'top-bar__nav-link--active' : ''}`} 
            to="/browse" 
            id="nav-browse"
          >
            Browse
          </Link>
          <Link 
            className={`top-bar__nav-link ${location.pathname === '/live' ? 'top-bar__nav-link--active' : ''}`} 
            to="/live" 
            id="nav-live"
          >
            <span className="top-bar__live-dot" /> Live
          </Link>
          <Link 
            className={`top-bar__nav-link top-bar__premium-link ${location.pathname === '/premium' ? 'top-bar__nav-link--active' : ''}`} 
            to="/premium" 
            id="nav-premium"
          >
            <span className="top-bar__premium-sparkle">✦</span> Premium
          </Link>
        </nav>

        {isAuthenticated ? (
          <div className="top-bar__user-section" ref={desktopMenuRef}>
            <button 
              className="top-bar__user-avatar"
              onClick={() => setShowProfileMenu(prev => !prev)}
              aria-label="User profile menu"
              aria-expanded={showProfileMenu}
              id="btn-user-profile"
              title={user?.name || user?.email || 'Account'}
            >
              {initial}
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

      {/* ── MOBILE RIGHT: Profile avatar or Auth buttons ── */}
      <div className="top-bar__mobile-actions top-bar__mobile-only">
        {isAuthenticated ? (
          <div className="top-bar__user-section" ref={mobileMenuRef}>
            <button 
              className="top-bar__user-avatar"
              onClick={() => setShowProfileMenu(prev => !prev)}
              title={user?.name || 'Account menu'}
              aria-label="Account menu"
              aria-expanded={showProfileMenu}
              id="btn-mobile-profile"
              style={{ width: '36px', height: '36px', cursor: 'pointer', border: 'none' }}
            >
              {initial}
            </button>

            {showProfileMenu && (
              <div className="top-bar__profile-dropdown mobile-profile-dropdown">
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
                  id="btn-mobile-logout"
                >
                  <i className="fa-solid fa-arrow-right-from-bracket" />
                  <span>Log out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="top-bar__mobile-auth">
            <button 
              className="top-bar__mobile-login-btn" 
              id="btn-mobile-login" 
              onClick={() => navigate('/login')}
            >
              Log in
            </button>
            <button 
              className="top-bar__mobile-signup-btn" 
              id="btn-mobile-signup" 
              onClick={() => navigate('/signup')}
            >
              Sign up
            </button>
          </div>
        )}
      </div>

    </header>
  )
}

export default Header

