import { NavLink, useLocation } from 'react-router-dom'
import { usePlayer } from '../../context/usePlayer'
import './BottomNavBar.css'

const BottomNavBar = () => {
  const location = useLocation()
  const { favorites } = usePlayer()

  // Hide bottom nav on full-screen auth routes
  if (location.pathname === '/login' || location.pathname === '/signup') {
    return null
  }

  const isLibraryActive = location.pathname === '/library' || location.pathname === '/liked-songs' || location.pathname.startsWith('/playlist/')

  return (
    <nav className="mobile-bottom-nav" role="navigation" aria-label="Mobile Navigation">
      <NavLink
        to="/"
        className={({ isActive }) =>
          `mobile-bottom-nav__item ${isActive && location.pathname === '/' ? 'mobile-bottom-nav__item--active' : ''}`
        }
        id="tab-explore"
      >
        <div className="mobile-bottom-nav__icon-box">
          <i className="fa-solid fa-compass" />
        </div>
        <span className="mobile-bottom-nav__label">Explore</span>
      </NavLink>

      <NavLink
        to="/search"
        className={({ isActive }) =>
          `mobile-bottom-nav__item ${isActive ? 'mobile-bottom-nav__item--active' : ''}`
        }
        id="tab-search"
      >
        <div className="mobile-bottom-nav__icon-box">
          <i className="fa-solid fa-magnifying-glass" />
        </div>
        <span className="mobile-bottom-nav__label">Search</span>
      </NavLink>

      <NavLink
        to="/library"
        className={`mobile-bottom-nav__item ${isLibraryActive ? 'mobile-bottom-nav__item--active' : ''}`}
        id="tab-library"
      >
        <div className="mobile-bottom-nav__icon-box">
          <i className="fa-solid fa-lines-leaning" />
          {favorites.length > 0 && (
            <span className="mobile-bottom-nav__dot" aria-label={`${favorites.length} liked songs`} />
          )}
        </div>
        <span className="mobile-bottom-nav__label">Library</span>
      </NavLink>

      <NavLink
        to="/premium"
        className={({ isActive }) =>
          `mobile-bottom-nav__item ${isActive ? 'mobile-bottom-nav__item--active' : ''}`
        }
        id="tab-premium"
      >
        <div className="mobile-bottom-nav__icon-box">
          <i className="fa-solid fa-gem" />
        </div>
        <span className="mobile-bottom-nav__label">Premium</span>
      </NavLink>
    </nav>
  )
}

export default BottomNavBar
