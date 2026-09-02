import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './MainContent.css'
import { fetchArtists } from '../../data/artistsData'
import AaraLogo from '../AaraLogo/AaraLogo'
import { usePlayer } from '../../context/usePlayer'
import { useDebounce } from '../../hooks/useDebounce'
import { handleImageError, DEFAULT_TRACK_ARTWORK, DEFAULT_ARTIST_IMAGE } from '../../utils/imageFallback'

const SHOW_ALL_THRESHOLD = 5
const API_URL = '/api/songs'
const SEARCH_API_URL = '/api/v1/music/search'

const MainContent = ({ searchQuery = '' }) => {
  const navigate = useNavigate()
  const { playTrack, togglePlay, isTrackActive, isTrackPlaying, toggleFavorite, isFavorite } = usePlayer()

  const [songs, setSongs] = useState([])
  const [artists, setArtists] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [hoveredCard, setHoveredCard] = useState(null)
  const [scrollPositions, setScrollPositions] = useState({})
  const scrollContainersRef = useRef({})
  const [showPromoBanner, setShowPromoBanner] = useState(true)

  // Debounced search query to eliminate immediate setState calls on empty string / typing pass
  const debouncedSearch = useDebounce(searchQuery.trim(), 350)

  // Search state with pagination & infinite load for results
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState(null)
  const [searchPage, setSearchPage] = useState(1)
  const [searchHasMore, setSearchHasMore] = useState(false)
  const [loadingMoreSearch, setLoadingMoreSearch] = useState(false)

  // Fetch default songs and dynamic artists
  useEffect(() => {
    let isMounted = true
    const fetchData = async () => {
      try {
        setLoading(true)
        // 1. Fetch songs
        const res = await fetch(API_URL)
        const data = await res.json()
        if (!isMounted) return

        if (data.success && data.data && data.data.length > 0) {
          setSongs(data.data)
        } else {
          // Fallback to Jamendo trending tracks
          const trendingRes = await fetch('/api/v1/music/trending?limit=20')
          const trendingData = await trendingRes.json()
          if (!isMounted) return
          if (trendingData.success) {
            setSongs(trendingData.data || [])
          } else {
            setError(data.error || 'Failed to fetch songs')
          }
        }

        // 2. Fetch dynamic artists from Jamendo backend
        const artistsRes = await fetchArtists('', 1, 20)
        if (isMounted && artistsRes.artists) {
          setArtists(artistsRes.artists)
        }
      } catch (err) {
        if (isMounted) {
          console.warn('Initial data fetch failed:', err)
          setError('Server connection failed. Make sure the backend server is running.')
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchData()
    return () => { isMounted = false }
  }, [])

  // Clean, debounced search effect: only runs when debounced value updates
  useEffect(() => {
    if (!debouncedSearch) return

    let isMounted = true
    const performSearch = async () => {
      try {
        setIsSearching(true)
        setSearchError(null)
        setSearchPage(1)
        const res = await fetch(`${SEARCH_API_URL}?q=${encodeURIComponent(debouncedSearch)}&page=1&limit=20`)
        const data = await res.json()
        if (!isMounted) return
        if (data.success) {
          setSearchResults(data.data || [])
          setSearchHasMore(Boolean(data.meta?.hasMore))
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
    }

    performSearch()
    return () => { 
      isMounted = false 
    }
  }, [debouncedSearch])

  // Derive active search results based on whether debouncedSearch is present
  const displaySearchResults = debouncedSearch ? searchResults : []
  const displaySearchError = debouncedSearch ? searchError : null
  const displayIsSearching = debouncedSearch ? isSearching : false
  const displaySearchHasMore = debouncedSearch ? searchHasMore : false

  // Pagination loader for search results
  const loadMoreSearchResults = async () => {
    if (loadingMoreSearch || !searchHasMore || !debouncedSearch) return
    try {
      setLoadingMoreSearch(true)
      const nextPage = searchPage + 1
      const res = await fetch(`${SEARCH_API_URL}?q=${encodeURIComponent(debouncedSearch)}&page=${nextPage}&limit=20`)
      const data = await res.json()
      if (data.success && Array.isArray(data.data)) {
        setSearchResults(prev => [...prev, ...data.data])
        setSearchPage(nextPage)
        setSearchHasMore(Boolean(data.meta?.hasMore))
      }
    } catch (err) {
      console.warn('Error loading more search results:', err)
    } finally {
      setLoadingMoreSearch(false)
    }
  }

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
  }, [loading, songs, artists])

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

  const hasSearchQuery = Boolean(debouncedSearch)

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
            <h2 className="section-title-static">Search Results for &ldquo;{debouncedSearch}&rdquo;</h2>
            {displaySearchResults.length > 0 && (
              <span style={{ fontSize: '0.875rem', color: '#b3b3b3' }}>
                {displaySearchResults.length} track{displaySearchResults.length === 1 ? '' : 's'}
              </span>
            )}
          </div>

          {displayIsSearching && <p style={{ color: '#b3b3b3' }}>Searching tracks...</p>}

          {displaySearchError && <p style={{ color: '#e74c3c' }}>{displaySearchError}</p>}

          {!displayIsSearching && !displaySearchError && displaySearchResults.length === 0 && (
            <p style={{ color: '#b3b3b3' }}>No tracks found matching your query.</p>
          )}

          {!displayIsSearching && displaySearchResults.length > 0 && (
            <>
              <div
                className="cards-row"
                style={{ overflowX: 'auto', display: 'flex', gap: '16px', paddingBottom: '12px' }}
              >
                {displaySearchResults.map((track) => {
                  const trackId = track.id || track._id
                  const active = isTrackActive(track)
                  const playing = isTrackPlaying(track)
                  const favorited = isFavorite(trackId)

                  return (
                    <div
                      key={`search-${trackId}`}
                      className={`card ${active ? 'card--active' : ''}`}
                      onClick={() => handleSongPlay(track, displaySearchResults)}
                      onMouseEnter={() => setHoveredCard(`search-${trackId}`)}
                      onMouseLeave={() => setHoveredCard(null)}
                      style={{ cursor: 'pointer', position: 'relative' }}
                    >
                      <div className="card-image-container">
                        <img
                          src={track.album_image || track.artworkUrl || DEFAULT_TRACK_ARTWORK}
                          alt={track.name || track.title}
                          className="card-image"
                          referrerPolicy="no-referrer"
                          onError={(e) => handleImageError(e, DEFAULT_TRACK_ARTWORK)}
                        />
                      </div>
                      <button
                        className={`play-btn ${
                          hoveredCard === `search-${trackId}` || active ? 'play-btn--visible' : ''
                        }`}
                        aria-label={playing ? 'Pause' : 'Play'}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSongPlay(track, displaySearchResults)
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

              {displaySearchHasMore && (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '4px' }}>
                  <button
                    className="show-all-btn"
                    onClick={loadMoreSearchResults}
                    disabled={loadingMoreSearch}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#282828',
                      borderRadius: '20px',
                      color: '#ffffff',
                      border: '1px solid rgba(255,255,255,0.1)',
                      cursor: 'pointer'
                    }}
                  >
                    {loadingMoreSearch ? 'Loading more...' : 'Load more results'}
                  </button>
                </div>
              )}
            </>
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
                    <img
                      src={song.imageUrl || song.image || DEFAULT_TRACK_ARTWORK}
                      alt={song.title}
                      className="card-image"
                      referrerPolicy="no-referrer"
                      onError={(e) => handleImageError(e, DEFAULT_TRACK_ARTWORK)}
                    />
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
          {artists.length > SHOW_ALL_THRESHOLD && (
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
            {artists.map((artist) => (
              <div
                key={`artist-${artist.id}`}
                className="card card--artist"
                onMouseEnter={() => setHoveredCard(`artist-${artist.id}`)}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => handleShowAll(2)}
                style={{ cursor: 'pointer' }}
              >
                <div className="card-image-container card-image-container--round">
                  <img
                    src={artist.image || DEFAULT_ARTIST_IMAGE}
                    alt={artist.name}
                    className="card-image"
                    referrerPolicy="no-referrer"
                    onError={(e) => handleImageError(e, DEFAULT_ARTIST_IMAGE)}
                  />
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
                  <p className="card-subtitle">{artist.role || 'Artist'}</p>
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
