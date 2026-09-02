import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import '../MainContent/MainContent.css'
import { fetchArtists } from '../../data/artistsData'
import { usePlayer } from '../../context/usePlayer'
import { handleImageError, DEFAULT_TRACK_ARTWORK, DEFAULT_ARTIST_IMAGE } from '../../utils/imageFallback'

const API_URL = '/api/songs'

const categoryMap = {
  '1': { id: 'trending-songs', title: 'Trending songs', type: 'song' },
  '2': { id: 'popular-artists', title: 'Popular artists', type: 'artist' },
  '3': { id: 'popular-albums', title: 'Popular albums', type: 'song' },
  '4': { id: 'popular-radio', title: 'Popular radio', type: 'song' },
  '5': { id: 'featured-charts', title: 'Featured Charts', type: 'song' },
  'trending-songs': { id: 'trending-songs', title: 'Trending songs', type: 'song' },
  'popular-artists': { id: 'popular-artists', title: 'Popular artists', type: 'artist' },
  'popular-albums': { id: 'popular-albums', title: 'Popular albums', type: 'song' },
  'popular-radio': { id: 'popular-radio', title: 'Popular radio', type: 'song' },
  'featured-charts': { id: 'featured-charts', title: 'Featured Charts', type: 'song' },
}

const PAGE_SIZE = 20

const CategorySessionView = () => {
  const { id } = useParams() // URL: /session/:id
  const navigate = useNavigate()
  const { playTrack, togglePlay, isTrackActive, isTrackPlaying } = usePlayer()

  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [error, setError] = useState(null)
  const [hoveredCard, setHoveredCard] = useState(null)

  const observerRef = useRef(null)
  const sentinelRef = useRef(null)

  const categoryInfo = categoryMap[id] || { id, title: id ? id.replace(/-/g, ' ') : 'Session', type: 'song' }
  const categoryId = categoryInfo.id
  const title = categoryInfo.title
  const isArtistCategory = categoryInfo.type === 'artist'

  // Fetch initial page
  useEffect(() => {
    let isMounted = true
    const fetchInitialData = async () => {
      try {
        setLoading(true)
        setError(null)
        setPage(1)

        if (isArtistCategory) {
          // Dynamic Jamendo artist fetch
          const { artists: fetchedArtists, hasMore: more } = await fetchArtists('', 1, PAGE_SIZE)
          if (!isMounted) return
          setItems(fetchedArtists.map(a => ({
            _id: a.id,
            id: a.id,
            title: a.name,
            artist: a.role || 'Artist',
            imageUrl: a.image || a.imageUrl,
            isArtist: true,
          })))
          setHasMore(more)
          return
        }

        // 1. Fetch category songs from MongoDB or Jamendo trending
        let fetchedList = []
        let more = false
        const res = await fetch(`${API_URL}/category/${categoryId}`)
        const data = await res.json()
        if (!isMounted) return

        if (data.success && data.data && data.data.length > 0) {
          fetchedList = data.data
          // Also fetch Jamendo trending tracks if count is small
          if (fetchedList.length < 10) {
            try {
              const trendingRes = await fetch(`/api/v1/music/trending?limit=${PAGE_SIZE}&page=1`)
              const trendingData = await trendingRes.json()
              if (trendingData.success && trendingData.data?.length > 0) {
                // Avoid duplicate IDs
                const existingIds = new Set(fetchedList.map(s => String(s._id || s.id)))
                const additions = trendingData.data.filter(t => !existingIds.has(String(t.id)))
                fetchedList = [...fetchedList, ...additions]
                more = Boolean(trendingData.meta?.hasMore)
              }
            } catch (trendErr) {
              console.warn('Jamendo trending supplement error:', trendErr)
            }
          }
        } else {
          // Fallback directly to Jamendo trending
          const trendingRes = await fetch(`/api/v1/music/trending?limit=${PAGE_SIZE}&page=1`)
          const trendingData = await trendingRes.json()
          if (!isMounted) return
          if (trendingData.success) {
            fetchedList = trendingData.data || []
            more = Boolean(trendingData.meta?.hasMore)
          } else {
            setError(data.error || 'Failed to fetch tracks')
          }
        }

        if (isMounted) {
          setItems(fetchedList)
          setHasMore(more)
        }
      } catch (err) {
        if (isMounted) {
          console.warn('Category fetch error:', err)
          setError('Server connection failed. Make sure backend server is running.')
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    if (id) {
      fetchInitialData()
    }

    return () => { isMounted = false }
  }, [id, categoryId, isArtistCategory])

  // Load next page function (Infinite Scroll)
  const loadMoreData = useCallback(async () => {
    if (loading || loadingMore || !hasMore) return
    try {
      setLoadingMore(true)
      const nextPage = page + 1

      if (isArtistCategory) {
        const { artists: nextArtists, hasMore: more } = await fetchArtists('', nextPage, PAGE_SIZE)
        const formatted = nextArtists.map(a => ({
          _id: a.id,
          id: a.id,
          title: a.name,
          artist: a.role || 'Artist',
          imageUrl: a.image || a.imageUrl,
          isArtist: true,
        }))
        setItems(prev => [...prev, ...formatted])
        setPage(nextPage)
        setHasMore(more)
      } else {
        // Fetch next page of trending/category tracks from Jamendo API
        const res = await fetch(`/api/v1/music/trending?limit=${PAGE_SIZE}&page=${nextPage}`)
        const data = await res.json()
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          const existingIds = new Set(items.map(s => String(s._id || s.id)))
          const additions = data.data.filter(t => !existingIds.has(String(t.id)))
          setItems(prev => [...prev, ...additions])
          setPage(nextPage)
          setHasMore(Boolean(data.meta?.hasMore))
        } else {
          setHasMore(false)
        }
      }
    } catch (err) {
      console.warn('Error loading more category items:', err)
    } finally {
      setLoadingMore(false)
    }
  }, [loading, loadingMore, hasMore, page, isArtistCategory, items])

  // IntersectionObserver for Infinite Scrolling
  useEffect(() => {
    if (loading || !hasMore) return

    const currentSentinel = sentinelRef.current
    if (!currentSentinel) return

    if (observerRef.current) observerRef.current.disconnect()

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        loadMoreData()
      }
    }, {
      root: null,
      rootMargin: '200px',
      threshold: 0.1
    })

    observerRef.current.observe(currentSentinel)

    return () => {
      if (observerRef.current) observerRef.current.disconnect()
    }
  }, [loading, hasMore, loadMoreData])

  const handleCardClick = (song) => {
    if (isArtistCategory) return

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
      const queueList = items.map((s) => ({
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

  return (
    <div className="main-content category-view">
      <div className="category-header">
        <button className="back-btn" onClick={() => navigate('/')} aria-label="Back to Home">
          <i className="fa-solid fa-arrow-left" />
        </button>
        <h2>{title}</h2>
      </div>

      {loading && <p style={{ color: '#b3b3b3', padding: '20px 0' }}>Loading {isArtistCategory ? 'artists' : 'tracks'}...</p>}

      {error ? (
        <div className="error-container">
          <p>{error}</p>
        </div>
      ) : (
        <>
          <div className="cards-grid category-grid">
            {items.map((song) => {
              const songId = song._id || song.id
              const active = !isArtistCategory && isTrackActive(song)
              const playing = !isArtistCategory && isTrackPlaying(song)

              return (
                <div
                  key={`session-${songId}`}
                  className={`card ${isArtistCategory ? 'card--artist' : ''} ${active ? 'card--active' : ''}`}
                  onClick={() => handleCardClick(song)}
                  onMouseEnter={() => setHoveredCard(`session-${songId}`)}
                  onMouseLeave={() => setHoveredCard(null)}
                  style={{ cursor: isArtistCategory ? 'default' : 'pointer' }}
                >
                  <div className={`card-image-container ${isArtistCategory ? 'card-image-container--round' : ''}`}>
                    <img
                      src={song.imageUrl || song.image || (isArtistCategory ? DEFAULT_ARTIST_IMAGE : DEFAULT_TRACK_ARTWORK)}
                      alt={song.title}
                      className="card-image"
                      referrerPolicy="no-referrer"
                      onError={(e) => handleImageError(e, isArtistCategory ? DEFAULT_ARTIST_IMAGE : DEFAULT_TRACK_ARTWORK)}
                    />
                  </div>
                  {!isArtistCategory && (
                    <button
                      className={`play-btn ${
                        hoveredCard === `session-${songId}` || active ? 'play-btn--visible' : ''
                      }`}
                      aria-label={playing ? `Pause ${song.title}` : `Play ${song.title}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleCardClick(song)
                      }}
                    >
                      <i className={playing ? 'fa-solid fa-pause' : 'fa-solid fa-play'} />
                    </button>
                  )}
                  <div className="card-info">
                    <h3
                      className="card-title"
                      style={{ color: active ? '#d946ef' : '#ffffff' }}
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

          {/* Sentinel element for infinite scroll observer */}
          <div ref={sentinelRef} style={{ height: '40px', marginTop: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {loadingMore && (
              <p style={{ color: '#b3b3b3', fontSize: '0.875rem' }}>Loading more items...</p>
            )}
            {!hasMore && items.length > 0 && !loading && (
              <p style={{ color: '#777777', fontSize: '0.8rem' }}>You have reached the end.</p>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default CategorySessionView
