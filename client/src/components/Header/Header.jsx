import SpotifyLogo from '../SpotifyLogo/SpotifyLogo'
import './Header.css'

const Header = () => {
  return (
    <header className="top-bar" role="banner">
      {/* Left - Logo + Nav */}
      <div className="top-bar__left">
        <SpotifyLogo />
        <button className="top-bar__nav-btn" aria-label="Go to home">
          <i className="fa-solid fa-house" />
        </button>
      </div>

      {/* Center - Search */}
      <div className="search-bar" role="search">
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

      {/* Right - Nav Links + Actions */}
      <div className="top-bar__right">
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
    </header>
  )
}

export default Header
