import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import '../MainContent/MainContent.css'
import { staticArtists } from '../../data/artistsData'

const API_URL = 'http://localhost:5000/api/songs'

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

const CategorySessionView = () => {
  const { id } = useParams() // URL: /session/:id
  const navigate = useNavigate()
  const [songs, setSongs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [hoveredCard, setHoveredCard] = useState(null)

  const categoryInfo = categoryMap[id] || { id, title: id.replace(/-/g, ' '), type: 'song' }
  const categoryId = categoryInfo.id
  const title = categoryInfo.title
  const isArtistCategory = categoryInfo.type === 'artist'

  useEffect(() => {
    const fetchCategorySongs = async () => {
      try {
        setLoading(true)
        setError(null)

        if (isArtistCategory) {
          // If Popular Artists category, render static artists list
          setSongs(staticArtists.map(a => ({ _id: a.id, title: a.name, artist: a.role, imageUrl: a.image })))
          setLoading(false)
          return
        }

        // Fetch category songs from backend or all songs fallback
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
        setLoading(false)
      }
    }

    if (id) {
      fetchCategorySongs()
    }
  }, [id, categoryId, isArtistCategory])

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
              className={`card ${isArtistCategory ? 'card--artist' : ''}`}
              onMouseEnter={() => setHoveredCard(`session-${song._id || song.id}`)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className={`card-image-container ${isArtistCategory ? 'card-image-container--round' : ''}`}>
                <img src={song.imageUrl || song.image} alt={song.title} className="card-image" />
              </div>
              <button
                className={`play-btn ${
                  hoveredCard === `session-${song._id || song.id}` ? 'play-btn--visible' : ''
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
      )}
    </div>
  )
}

export default CategorySessionView
