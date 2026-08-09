import SpotifyLogo from '../SpotifyLogo/SpotifyLogo'
import './Header.css'

const Header = () => {
  return (
    <header className="top-bar" role="banner">

      {/* ── DESKTOP LEFT: Logo + Home btn ── */}
      <div className="top-bar__left">
        <SpotifyLogo />
        <button className="top-bar__nav-btn top-bar__desktop-only" aria-label="Go to home">
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
        />
        <div className="search-bar__divider" aria-hidden="true" />
        <button className="search-bar__browse-btn" aria-label="Browse categories">
          <i className="fa-solid fa-table-cells-large" />
        </button>
      </div>

      {/* ── DESKTOP RIGHT: Nav links + Actions ── */}
      <div className="top-bar__right top-bar__desktop-only">
        <nav className="top-bar__nav-links" aria-label="Main navigation">
          <a className="top-bar__nav-link" href="#" id="nav-premium">Premium</a>
          <a className="top-bar__nav-link" href="#" id="nav-support">Support</a>
          <a className="top-bar__nav-link" href="#" id="nav-download">Download</a>
        </nav>

        <div className="top-bar__divider" aria-hidden="true" />

        <div className="top-bar__actions">
          <button className="top-bar__install-btn" id="btn-install-app">
            <i className="fa-solid fa-arrow-down-to-bracket" aria-hidden="true" />
            <span>Install App</span>
          </button>
          <button className="top-bar__signup-btn" id="btn-signup">Sign up</button>
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
