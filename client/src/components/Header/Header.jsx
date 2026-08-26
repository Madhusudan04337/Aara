import { Link, useNavigate } from 'react-router-dom'
import AaraLogo from '../AaraLogo/AaraLogo'
import './Header.css'

const Header = ({ searchQuery, setSearchQuery }) => {
  const navigate = useNavigate()

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

        <div className="top-bar__actions">
          <button className="top-bar__signup-btn" id="btn-signup" onClick={() => navigate('/signup')}>Sign up</button>
          <button className="top-bar__login-btn" id="btn-login">Log in</button>
        </div>
      </div>

      {/* ── MOBILE RIGHT: Open App + Hamburger ── */}
      <div className="top-bar__mobile-actions top-bar__mobile-only">
        <button className="top-bar__open-app-btn" id="btn-open-app">Open App</button>
        <button className="top-bar__hamburger" id="btn-hamburger" aria-label="Open menu" aria-haspopup="true">
          <i className="fa-solid fa-bars" />
        </button>
      </div>

    </header>
  )
}

export default Header
