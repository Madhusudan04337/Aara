import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import '../MainContent/MainContent.css'
import { staticArtists } from '../../data/artistsData'
import { usePlayer } from '../../context/usePlayer'

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

const CategorySessionView = () => {
  const { id } = useParams() // URL: /session/:id
  const navigate = useNavigate()
  const { playTrack, togglePlay, isTrackActive, isTrackPlaying } = usePlayer()

  const [songs, setSongs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [hoveredCard, setHoveredCard] = useState(null)

  const categoryInfo = categoryMap[id] || { id, title: id ? id.replace(/-/g, ' ') : 'Session', type: 'song' }
  const categoryId = categoryInfo.id
  const title = categoryInfo.title
  const isArtistCategory = categoryInfo.type === 'artist'

  useEffect(() => {
    let isMounted = true
    const fetchCategorySongs = async () => {
      try {
        setLoading(true)
        setError(null)

        if (isArtistCategory) {
          // If Popular Artists category, render static artists list
          if (isMounted) {
            setSongs(staticArtists.map(a => ({ _id: a.id, title: a.name, artist: a.role, imageUrl: a.image })))
          }
          return
        }

        // Fetch category songs from backend or all songs fallback
        const res = await fetch(`${API_URL}/category/${categoryId}`)
        const data = await res.json()
        if (!isMounted) return

        if (data.success && data.data && data.data.length > 0) {
          setSongs(data.data)
        } else {
          const allRes = await fetch(API_URL)
          const allData = await allRes.json()
          if (!isMounted) return
          setSongs(allData.data || [])
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
      fetchCategorySongs()
    }

    return () => { isMounted = false }
  }, [id, categoryId, isArtistCategory])

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
      const queueList = songs.map((s) => ({
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

      {loading && <p style={{ color: '#b3b3b3', padding: '20px 0' }}>Loading tracks...</p>}

      {error ? (
        <div className="error-container">
          <p>{error}</p>
        </div>
      ) : (
        <div className="cards-grid category-grid">
          {songs.map((song) => {
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
                  <img src={song.imageUrl || song.image} alt={song.title} className="card-image" />
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
      )}
    </div>
  )
}

export default CategorySessionView
