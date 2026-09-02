import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './MainContent.css'
import { staticArtists } from '../../data/artistsData'
import AaraLogo from '../AaraLogo/AaraLogo'
import { usePlayer } from '../../context/usePlayer'

const SHOW_ALL_THRESHOLD = 5
const API_URL = '/api/songs'
const SEARCH_API_URL = '/api/v1/music/search'

const MainContent = ({ searchQuery = '' }) => {
  const navigate = useNavigate()
  const { playTrack, togglePlay, isTrackActive, isTrackPlaying, toggleFavorite, isFavorite } = usePlayer()

  const [songs, setSongs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [hoveredCard, setHoveredCard] = useState(null)
  const [scrollPositions, setScrollPositions] = useState({})
  const scrollContainersRef = useRef({})
  const [showPromoBanner, setShowPromoBanner] = useState(true)

  // Search state
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState(null)

  // Fetch default songs directly from backend MongoDB API with Jamendo fallback
  useEffect(() => {
    let isMounted = true
    const fetchSongs = async () => {
      try {
        setLoading(true)
        const res = await fetch(API_URL)
        const data = await res.json()
        if (!isMounted) return

        if (data.success && data.data && data.data.length > 0) {
          setSongs(data.data)
        } else {
          // Fallback to Jamendo trending tracks
          const trendingRes = await fetch('/api/v1/music/trending')
          const trendingData = await trendingRes.json()
          if (!isMounted) return
          if (trendingData.success) {
            setSongs(trendingData.data || [])
          } else {
            setError(data.error || 'Failed to fetch songs')
          }
        }
      } catch (err) {
        if (isMounted) {
          console.warn('Song fetch failed:', err)
          setError('Server connection failed. Make sure the backend server is running.')
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchSongs()
    return () => { isMounted = false }
  }, [])

  // Debounced search logic for Jamendo API
  useEffect(() => {
    const trimmed = searchQuery.trim()
    if (!trimmed) {
      return
    }

    let isMounted = true
    const timer = setTimeout(async () => {
      try {
        setIsSearching(true)
        setSearchError(null)
        const res = await fetch(`${SEARCH_API_URL}?q=${encodeURIComponent(trimmed)}`)
        const data = await res.json()
        if (!isMounted) return
        if (data.success) {
          setSearchResults(data.data || [])
        } else {
          setSearchError(data.message || 'Search failed')
        }
      } catch (err) {
        if (isMounted) {
          console.warn('Search request failed:', err)
          setSearchError('Failed to fetch search results from server')
        }
      } finally {
        if (isMounted) setIsSearching(false)
      }
    }, 350)

    return () => {
      isMounted = false
      clearTimeout(timer)
    }
  }, [searchQuery])

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

  const handleSongPlay = (song, songList = songs) => {
    const trackObj = {
      id: song._id || song.id,
      title: song.title || song.name,
      artist: song.artist || song.artist_name || song.artistName,
      artworkUrl: song.imageUrl || song.album_image || song.image,
      audioUrl: song.audioUrl || song.audio,
      licenseUrl: song.licenseUrl || song.license_ccurl,
      duration: song.duration,
    }

    if (isTrackActive(trackObj)) {
      togglePlay()
    } else {
      const queueList = songList.map((s) => ({
        id: s._id || s.id,
        title: s.title || s.name,
        artist: s.artist || s.artist_name || s.artistName,
        artworkUrl: s.imageUrl || s.album_image || s.image,
        audioUrl: s.audioUrl || s.audio,
        licenseUrl: s.licenseUrl || s.license_ccurl,
        duration: s.duration,
      }))
      playTrack(trackObj, queueList)
    }
  }

  const trendingScrollState = scrollPositions['trending-songs'] || { canScrollLeft: false, canScrollRight: true }
  const artistsScrollState = scrollPositions['popular-artists'] || { canScrollLeft: false, canScrollRight: true }

  const hasSearchQuery = searchQuery.trim() !== ''

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
      {/* ── SEARCH RESULTS SECTION (using Header Search input) ── */}
      {hasSearchQuery && (
        <section className="content-section">
          <div className="section-header">
            <h2 className="section-title-static">Search Results for &ldquo;{searchQuery}&rdquo;</h2>
          </div>

          {isSearching && <p style={{ color: '#b3b3b3' }}>Searching tracks...</p>}

          {searchError && <p style={{ color: '#e74c3c' }}>{searchError}</p>}

          {!isSearching && !searchError && searchResults.length === 0 && (
            <p style={{ color: '#b3b3b3' }}>No tracks found matching your query.</p>
          )}

          {!isSearching && searchResults.length > 0 && (
            <div
              className="cards-row"
              style={{ overflowX: 'auto', display: 'flex', gap: '16px', paddingBottom: '12px' }}
            >
              {searchResults.map((track) => {
                const trackId = track.id || track._id
                const active = isTrackActive(track)
                const playing = isTrackPlaying(track)
                const favorited = isFavorite(trackId)

                return (
                  <div
                    key={`search-${trackId}`}
                    className={`card ${active ? 'card--active' : ''}`}
                    onClick={() => handleSongPlay(track, searchResults)}
                    onMouseEnter={() => setHoveredCard(`search-${trackId}`)}
                    onMouseLeave={() => setHoveredCard(null)}
                    style={{ cursor: 'pointer', position: 'relative' }}
                  >
                    <div className="card-image-container">
                      <img
                        src={track.album_image || track.artworkUrl}
                        alt={track.name || track.title}
                        className="card-image"
                      />
                    </div>
                    <button
                      className={`play-btn ${
                        hoveredCard === `search-${trackId}` || active ? 'play-btn--visible' : ''
                      }`}
                      aria-label={playing ? 'Pause' : 'Play'}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSongPlay(track, searchResults)
                      }}
                    >
                      <i className={playing ? 'fa-solid fa-pause' : 'fa-solid fa-play'} />
                    </button>
                    <div className="card-info">
                      <h3
                        className="card-title"
                        style={{ color: active ? '#1ed760' : '#ffffff' }}
                        title={track.name || track.title}
                      >
                        {track.name || track.title}
                      </h3>
                      <p className="card-subtitle" title={track.artist_name || track.artistName}>
                        {track.artist_name || track.artistName}
                      </p>
                      {track.album_name && (
                        <p
                          style={{
                            fontSize: '11px',
                            color: '#a7a7a7',
                            margin: '2px 0 0 0',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                          title={track.album_name}
                        >
                          Album: {track.album_name}
                        </p>
                      )}
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginTop: '6px',
                        }}
                      >
                        {(track.license_ccurl || track.licenseUrl) && (
                          <a
                            href={track.license_ccurl || track.licenseUrl}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            style={{ fontSize: '11px', color: '#1db954', textDecoration: 'underline' }}
                          >
                            CC License
                          </a>
                        )}
                        <button
                          aria-label={favorited ? 'Remove favorite' : 'Add favorite'}
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleFavorite(track)
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: favorited ? '#1ed760' : '#b3b3b3',
                            cursor: 'pointer',
                            fontSize: '14px',
                            padding: '2px 4px',
                          }}
                          title={favorited ? 'Remove from favorites' : 'Save to favorites'}
                        >
                          <i className={favorited ? 'fa-solid fa-heart' : 'fa-regular fa-heart'} />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      )}

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
            Premium Standard only. ₹799 for 1 year, then ₹139 per month after. Limited Eligibility.{' '}
            <a href="#">Terms apply</a>. Offer ends October 15, 2026.
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
            {songs.map((song) => {
              const songId = song._id || song.id
              const active = isTrackActive(song)
              const playing = isTrackPlaying(song)

              return (
                <div
                  key={`trending-${songId}`}
                  className={`card ${active ? 'card--active' : ''}`}
                  onClick={() => handleSongPlay(song, songs)}
                  onMouseEnter={() => setHoveredCard(`trending-${songId}`)}
                  onMouseLeave={() => setHoveredCard(null)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="card-image-container">
                    <img src={song.imageUrl || song.image} alt={song.title} className="card-image" />
                  </div>
                  <button
                    className={`play-btn ${
                      hoveredCard === `trending-${songId}` || active ? 'play-btn--visible' : ''
                    }`}
                    aria-label={playing ? `Pause ${song.title}` : `Play ${song.title}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSongPlay(song, songs)
                    }}
                  >
                    <i className={playing ? 'fa-solid fa-pause' : 'fa-solid fa-play'} />
                  </button>
                  <div className="card-info">
                    <h3
                      className="card-title"
                      style={{ color: active ? '#1ed760' : '#ffffff' }}
                      title={song.title}
                    >
                      {song.title}
                    </h3>
                    <p className="card-subtitle" title={song.artist}>{song.artist}</p>
                  </div>
                </div>
              )
            })}
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
                onClick={() => handleShowAll(2)}
                style={{ cursor: 'pointer' }}
              >
                <div className="card-image-container card-image-container--round">
                  <img src={artist.image} alt={artist.name} className="card-image" />
                </div>
                <button
                  className={`play-btn ${
                    hoveredCard === `artist-${artist.id}` ? 'play-btn--visible' : ''
                  }`}
                  aria-label={`View artist ${artist.name}`}
                >
                  <i className="fa-solid fa-arrow-right" />
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
