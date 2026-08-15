import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './MainContent.css'
import { staticArtists } from '../../data/artistsData'
import AaraLogo from '../AaraLogo/AaraLogo'

const SHOW_ALL_THRESHOLD = 5
const API_URL = 'http://localhost:5000/api/songs'

const MainContent = () => {
  const navigate = useNavigate()
  const [songs, setSongs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [hoveredCard, setHoveredCard] = useState(null)
  const [scrollPositions, setScrollPositions] = useState({})
  const scrollContainersRef = useRef({})

  // Fetch songs directly from backend MongoDB API
  useEffect(() => {
    const fetchSongs = async () => {
      try {
        setLoading(true)
        const res = await fetch(API_URL)
        const data = await res.json()
        if (data.success) {
          setSongs(data.data)
        } else {
          setError(data.error || 'Failed to fetch songs')
        }
      } catch (err) {
        setError('Server connection failed. Make sure the backend server is running.')
      } finally {
        setLoading(false)
      }
    }

    fetchSongs()
  }, [])

  const updateScrollState = (key) => {
    const el = scrollContainersRef.current[key]
    if (!el) return
    const canScrollLeft = el.scrollLeft > 5
    const canScrollRight = el.scrollLeft + el.clientWidth < el.scrollWidth - 5
    setScrollPositions((prev) => ({
      ...prev,
      [key]: { canScrollLeft, canScrollRight }
    }))
  }

  useEffect(() => {
    updateScrollState('trending-songs')
    updateScrollState('popular-artists')
  }, [loading, songs])

  const handleScroll = (key) => {
    updateScrollState(key)
  }

  const scrollLeft = (key) => {
    if (scrollContainersRef.current[key]) {
      scrollContainersRef.current[key].scrollBy({ left: -500, behavior: 'smooth' })
    }
  }

  const scrollRight = (key) => {
    if (scrollContainersRef.current[key]) {
      scrollContainersRef.current[key].scrollBy({ left: 500, behavior: 'smooth' })
    }
  }

  const handleShowAll = (identifier) => {
    navigate(`/session/${identifier}`)
  }

  const trendingScrollState = scrollPositions['trending-songs'] || { canScrollLeft: false, canScrollRight: true }
  const artistsScrollState = scrollPositions['popular-artists'] || { canScrollLeft: false, canScrollRight: true }

  const [showPromoBanner, setShowPromoBanner] = useState(true)

  if (error) {
    return (
      <div className="main-content">
        <div className="error-container">
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="main-content">
      {/* ── MOBILE / TABLET PROMO CARD (AFTER HEADER) ── */}
      {showPromoBanner && (
        <div className="home-promo-card">
          <button
            className="home-promo-card__close"
            aria-label="Close banner"
            onClick={() => setShowPromoBanner(false)}
          >
            <i className="fa-solid fa-xmark" />
          </button>

          <div className="home-promo-card__header">
            <div className="home-promo-card__logo-wrapper">
              <AaraLogo />
            </div>
            <span className="home-promo-card__brand">Premium</span>
          </div>

          <h2 className="home-promo-card__headline">
            Listen without limits. Try 1 year of Premium Standard for ₹799.
          </h2>

          <p className="home-promo-card__subtext">
            Only ₹139/month after. Cancel anytime.
          </p>

          <div className="home-promo-card__actions">
            <button className="home-promo-card__btn-primary">
              Try 1 year for ₹799
            </button>
            <button className="home-promo-card__btn-secondary">
              View all plans
            </button>
          </div>

          <p className="home-promo-card__disclaimer">
            Premium Standard only. ₹799 for 1 year, then ₹139 per month after. Limited Eligibility. <a href="#">Terms apply</a>. Offer ends October 15, 2026.
          </p>
        </div>
      )}

      {/* ── 1. TRENDING SONGS SECTION ── */}
      <section className="content-section">
        <div className="section-header">
          <h2 className="section-title-static">Trending songs</h2>
          {songs.length > SHOW_ALL_THRESHOLD && (
            <div className="section-header-actions">
              <button className="show-all-btn" onClick={() => handleShowAll(1)}>
                Show all
              </button>
            </div>
          )}
        </div>

        <div className="row-scroll-wrapper">
          {trendingScrollState.canScrollLeft && (
            <button
              className="scroll-btn scroll-btn--left"
              onClick={() => scrollLeft('trending-songs')}
              aria-label="Scroll left"
            >
              <i className="fa-solid fa-chevron-left" />
            </button>
          )}

          <div
            className="cards-row"
            ref={(el) => (scrollContainersRef.current['trending-songs'] = el)}
            onScroll={() => handleScroll('trending-songs')}
          >
            {songs.map((song) => (
              <div
                key={`trending-${song._id || song.id}`}
                className="card"
                onMouseEnter={() => setHoveredCard(`trending-${song._id || song.id}`)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className="card-image-container">
                  <img src={song.imageUrl || song.image} alt={song.title} className="card-image" />
                </div>
                <button
                  className={`play-btn ${
                    hoveredCard === `trending-${song._id || song.id}` ? 'play-btn--visible' : ''
                  }`}
                  aria-label={`Play ${song.title}`}
                >
                  <i className="fa-solid fa-play" />
                </button>
                <div className="card-info">
                  <h3 className="card-title" title={song.title}>{song.title}</h3>
                  <p className="card-subtitle" title={song.artist}>{song.artist}</p>
                </div>
              </div>
            ))}
          </div>

          {trendingScrollState.canScrollRight && (
            <button
              className="scroll-btn scroll-btn--right"
              onClick={() => scrollRight('trending-songs')}
              aria-label="Scroll right"
            >
              <i className="fa-solid fa-chevron-right" />
            </button>
          )}
        </div>
      </section>

      {/* ── 2. POPULAR ARTISTS SECTION ── */}
      <section className="content-section">
        <div className="section-header">
          <h2 className="section-title-static">Popular artists</h2>
          {staticArtists.length > SHOW_ALL_THRESHOLD && (
            <div className="section-header-actions">
              <button className="show-all-btn" onClick={() => handleShowAll(2)}>
                Show all
              </button>
            </div>
          )}
        </div>

        <div className="row-scroll-wrapper">
          {artistsScrollState.canScrollLeft && (
            <button
              className="scroll-btn scroll-btn--left"
              onClick={() => scrollLeft('popular-artists')}
              aria-label="Scroll left"
            >
              <i className="fa-solid fa-chevron-left" />
            </button>
          )}

          <div
            className="cards-row"
            ref={(el) => (scrollContainersRef.current['popular-artists'] = el)}
            onScroll={() => handleScroll('popular-artists')}
          >
            {staticArtists.map((artist) => (
              <div
                key={`artist-${artist.id}`}
                className="card card--artist"
                onMouseEnter={() => setHoveredCard(`artist-${artist.id}`)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className="card-image-container card-image-container--round">
                  <img src={artist.image} alt={artist.name} className="card-image" />
                </div>
                <button
                  className={`play-btn ${
                    hoveredCard === `artist-${artist.id}` ? 'play-btn--visible' : ''
                  }`}
                  aria-label={`Play ${artist.name}`}
                >
                  <i className="fa-solid fa-play" />
                </button>
                <div className="card-info">
                  <h3 className="card-title" title={artist.name}>{artist.name}</h3>
                  <p className="card-subtitle">{artist.role}</p>
                </div>
              </div>
            ))}
          </div>

          {artistsScrollState.canScrollRight && (
            <button
              className="scroll-btn scroll-btn--right"
              onClick={() => scrollRight('popular-artists')}
              aria-label="Scroll right"
            >
              <i className="fa-solid fa-chevron-right" />
            </button>
          )}
        </div>
      </section>
    </div>
  )
}

export default MainContent
