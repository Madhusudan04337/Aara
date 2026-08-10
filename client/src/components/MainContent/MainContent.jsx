import { useState, useRef, useEffect } from 'react'
import './MainContent.css'

const SHOW_ALL_THRESHOLD = 5
const API_URL = 'http://localhost:5000/api/songs'

const MainContent = () => {
  const [songs, setSongs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [hoveredCard, setHoveredCard] = useState(null)
  const [activeCategory, setActiveCategory] = useState(null)
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
    if (!loading && songs.length > 0) {
      updateScrollState('trending-songs')
    }
  }, [loading, songs, activeCategory])

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

  if (loading) {
    return (
      <div className="main-content">
        <div className="loading-container">
          <p>Loading songs from database...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="main-content">
        <div className="error-container">
          <p>{error}</p>
        </div>
      </div>
    )
  }

  // If a category view ("Show all") is selected, render full grid view page
  if (activeCategory === 'trending-songs') {
    return (
      <div className="main-content category-view">
        <div className="category-header">
          <h2>Trending songs</h2>
        </div>

        <div className="cards-grid category-grid">
          {songs.map((song) => (
            <div
              key={`full-${song._id || song.id}`}
              className="card"
              onMouseEnter={() => setHoveredCard(`full-${song._id || song.id}`)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="card-image-container">
                <img src={song.imageUrl || song.image} alt={song.title} className="card-image" />
                <button
                  className={`play-btn ${
                    hoveredCard === `full-${song._id || song.id}` ? 'play-btn--visible' : ''
                  }`}
                  aria-label={`Play ${song.title}`}
                >
                  <i className="fa-solid fa-play" />
                </button>
              </div>
              <div className="card-info">
                <h3 className="card-title" title={song.title}>{song.title}</h3>
                <p className="card-subtitle" title={song.artist}>{song.artist}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const hasShowAll = songs.length > SHOW_ALL_THRESHOLD
  const scrollState = scrollPositions['trending-songs'] || { canScrollLeft: false, canScrollRight: true }

  return (
    <div className="main-content">
      <section className="content-section">
        <div className="section-header">
          {hasShowAll ? (
            <h2 className="section-title-link" onClick={() => setActiveCategory('trending-songs')}>
              Trending songs
            </h2>
          ) : (
            <h2 className="section-title-static">Trending songs</h2>
          )}
          {hasShowAll && (
            <div className="section-header-actions">
              <button className="show-all-btn" onClick={() => setActiveCategory('trending-songs')}>
                Show all
              </button>
            </div>
          )}
        </div>

        <div className="row-scroll-wrapper">
          {scrollState.canScrollLeft && (
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
                  <button
                    className={`play-btn ${
                      hoveredCard === `trending-${song._id || song.id}` ? 'play-btn--visible' : ''
                    }`}
                    aria-label={`Play ${song.title}`}
                  >
                    <i className="fa-solid fa-play" />
                  </button>
                </div>
                <div className="card-info">
                  <h3 className="card-title" title={song.title}>{song.title}</h3>
                  <p className="card-subtitle" title={song.artist}>{song.artist}</p>
                </div>
              </div>
            ))}
          </div>

          {scrollState.canScrollRight && (
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
    </div>
  )
}

export default MainContent
