import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import '../MainContent/MainContent.css'

const API_URL = 'http://localhost:5000/api/songs'

const categoryMap = {
  '1': { id: 'trending-songs', title: 'Trending songs' },
  '2': { id: 'popular-artists', title: 'Popular artists' },
  '3': { id: 'popular-albums', title: 'Popular albums' },
  '4': { id: 'popular-radio', title: 'Popular radio' },
  '5': { id: 'featured-charts', title: 'Featured Charts' },
  'trending-songs': { id: 'trending-songs', title: 'Trending songs' },
  'popular-artists': { id: 'popular-artists', title: 'Popular artists' },
  'popular-albums': { id: 'popular-albums', title: 'Popular albums' },
  'popular-radio': { id: 'popular-radio', title: 'Popular radio' },
  'featured-charts': { id: 'featured-charts', title: 'Featured Charts' },
}

const CategorySessionView = () => {
  const { id } = useParams() // URL: /session/:id
  const navigate = useNavigate()
  const [songs, setSongs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showLoading, setShowLoading] = useState(false)
  const [error, setError] = useState(null)
  const [hoveredCard, setHoveredCard] = useState(null)

  const categoryInfo = categoryMap[id] || { id, title: id.replace(/-/g, ' ') }
  const categoryId = categoryInfo.id
  const title = categoryInfo.title

  useEffect(() => {
    let timer

    const fetchCategorySongs = async () => {
      try {
        setLoading(true)
        setShowLoading(false)

        // Only show "Loading..." text if request takes longer than 300ms
        timer = setTimeout(() => {
          setShowLoading(true)
        }, 300)

        const res = await fetch(`${API_URL}/category/${categoryId}`)
        const data = await res.json()
        if (data.success) {
          setSongs(data.data)
        } else {
          const allRes = await fetch(API_URL)
          const allData = await allRes.json()
          setSongs(allData.data || [])
        }
      } catch (err) {
        setError('Server connection failed. Make sure backend server is running.')
      } finally {
        clearTimeout(timer)
        setLoading(false)
        setShowLoading(false)
      }
    }

    if (id) {
      fetchCategorySongs()
    }

    return () => clearTimeout(timer)
  }, [id, categoryId])

  return (
    <div className="main-content category-view">
      <div className="category-header">
        <button className="back-btn" onClick={() => navigate('/')} aria-label="Back to Home">
          <i className="fa-solid fa-arrow-left" />
        </button>
        <h2>{title}</h2>
      </div>

      {error ? (
        <div className="error-container">
          <p>{error}</p>
        </div>
      ) : (
        <div className="cards-grid category-grid">
          {songs.map((song) => (
            <div
              key={`session-${song._id || song.id}`}
              className="card"
              onMouseEnter={() => setHoveredCard(`session-${song._id || song.id}`)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="card-image-container">
                <img src={song.imageUrl || song.image} alt={song.title} className="card-image" />
                <button
                  className={`play-btn ${
                    hoveredCard === `session-${song._id || song.id}` ? 'play-btn--visible' : ''
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
      )}
    </div>
  )
}

export default CategorySessionView
