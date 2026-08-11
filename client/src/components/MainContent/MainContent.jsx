import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './MainContent.css'

const SHOW_ALL_THRESHOLD = 5
const API_URL = 'http://localhost:5000/api/songs'

const categories = [
  { index: 1, id: 'trending-songs', title: 'Trending songs' },
  { index: 2, id: 'popular-artists', title: 'Popular artists' },
  { index: 3, id: 'popular-albums', title: 'Popular albums' },
  { index: 4, id: 'popular-radio', title: 'Popular radio' },
  { index: 5, id: 'featured-charts', title: 'Featured Charts' },
]

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
    if (!loading && songs.length > 0) {
      categories.forEach((cat) => updateScrollState(cat.id))
    }
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
    // Navigate to /session/:id URL route using category index or id
    navigate(`/session/${identifier}`)
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

  return (
    <div className="main-content">
      {categories.map((category) => {
        // Filter songs for each category (defaulting to all songs for trending-songs)
        const categorySongs = category.id === 'trending-songs' 
          ? songs 
          : songs.filter((s) => s.category === category.id)

        if (categorySongs.length === 0 && category.id !== 'trending-songs') {
          return null
        }

        const currentSongs = categorySongs.length > 0 ? categorySongs : songs
        const hasShowAll = currentSongs.length > SHOW_ALL_THRESHOLD
        const scrollState = scrollPositions[category.id] || { canScrollLeft: false, canScrollRight: true }

        return (
          <section key={category.id} className="content-section">
            <div className="section-header">
              <h2 className="section-title-static">{category.title}</h2>
              {hasShowAll && (
                <div className="section-header-actions">
                  <button className="show-all-btn" onClick={() => handleShowAll(category.index)}>
                    Show all
                  </button>
                </div>
              )}
            </div>

            <div className="row-scroll-wrapper">
              {scrollState.canScrollLeft && (
                <button
                  className="scroll-btn scroll-btn--left"
                  onClick={() => scrollLeft(category.id)}
                  aria-label="Scroll left"
                >
                  <i className="fa-solid fa-chevron-left" />
                </button>
              )}

              <div
                className="cards-row"
                ref={(el) => (scrollContainersRef.current[category.id] = el)}
                onScroll={() => handleScroll(category.id)}
              >
                {currentSongs.map((song) => (
                  <div
                    key={`${category.id}-${song._id || song.id}`}
                    className="card"
                    onMouseEnter={() => setHoveredCard(`${category.id}-${song._id || song.id}`)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    <div className="card-image-container">
                      <img src={song.imageUrl || song.image} alt={song.title} className="card-image" />
                      <button
                        className={`play-btn ${
                          hoveredCard === `${category.id}-${song._id || song.id}` ? 'play-btn--visible' : ''
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
                  onClick={() => scrollRight(category.id)}
                  aria-label="Scroll right"
                >
                  <i className="fa-solid fa-chevron-right" />
                </button>
              )}
            </div>
          </section>
        )
      })}
    </div>
  )
}

export default MainContent
