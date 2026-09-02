import { useState, useEffect, useMemo } from 'react'
import { usePlayer } from '../../context/usePlayer'
import { handleImageError, DEFAULT_TRACK_ARTWORK } from '../../utils/imageFallback'
import './BrowseView.css'

const GENRE_CATEGORIES = [
  { id: 'pop', name: 'Pop Hits', color: 'linear-gradient(135deg, #ec4899, #8b5cf6)', icon: 'fa-music', desc: 'The biggest pop anthems and chart toppers', query: 'pop' },
  { id: 'lofi', name: 'Chill & Lo-Fi', color: 'linear-gradient(135deg, #06b6d4, #3b82f6)', icon: 'fa-mug-hot', desc: 'Mellow beats, study sessions, and rain vibes', query: 'lofi chill' },
  { id: 'electronic', name: 'EDM & Dance', color: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', icon: 'fa-bolt', desc: 'High-energy festival anthems and club drops', query: 'electronic dance' },
  { id: 'hiphop', name: 'Hip-Hop & Rap', color: 'linear-gradient(135deg, #f97316, #ef4444)', icon: 'fa-drum', desc: 'Heavy 808s, lyrical fire, and urban rhythms', query: 'hiphop' },
  { id: 'rock', name: 'Rock & Alternative', color: 'linear-gradient(135deg, #ef4444, #991b1b)', icon: 'fa-guitar', desc: 'Raw guitar riffs, energetic solos, and grunge', query: 'rock' },
  { id: 'ambient', name: 'Ambient & Relax', color: 'linear-gradient(135deg, #6366f1, #a855f7)', icon: 'fa-cloud', desc: 'Atmospheric soundscapes for sleep and meditation', query: 'ambient' },
  { id: 'acoustic', name: 'Acoustic & Folk', color: 'linear-gradient(135deg, #d97706, #b45309)', icon: 'fa-tree', desc: 'Organic vocals, acoustic guitars, and coffeehouse', query: 'acoustic' },
  { id: 'jazz', name: 'Jazz & Soul', color: 'linear-gradient(135deg, #10b981, #047857)', icon: 'fa-compact-disc', desc: 'Smooth saxophones, blue notes, and evening warmth', query: 'jazz' },
  { id: 'workout', name: 'Workout & Fitness', color: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', icon: 'fa-dumbbell', desc: 'High BPM pump-up tracks for gym & cardio', query: 'workout' },
  { id: 'focus', name: 'Deep Focus & Study', color: 'linear-gradient(135deg, #64748b, #334155)', icon: 'fa-brain', desc: 'Instrumental music to boost deep work productivity', query: 'focus instrumental' },
  { id: 'synthwave', name: 'Synthwave & Retro', color: 'linear-gradient(135deg, #d946ef, #8b5cf6)', icon: 'fa-vr-cardboard', desc: '80s analog synthesizers and neon night drives', query: 'synthwave' },
  { id: 'classical', name: 'Classical & Piano', color: 'linear-gradient(135deg, #94a3b8, #475569)', icon: 'fa-feather', desc: 'Timeless orchestral melodies and solo piano', query: 'classical piano' }
]

const MOOD_FILTERS = [
  { id: 'all', label: 'All Moods', icon: 'fa-compass' },
  { id: 'focus', label: 'Focus & Study', icon: 'fa-brain', query: 'focus' },
  { id: 'chill', label: 'Chill & Relax', icon: 'fa-mug-hot', query: 'chill' },
  { id: 'workout', label: 'Workout Energy', icon: 'fa-dumbbell', query: 'workout' },
  { id: 'party', label: 'Party Vibes', icon: 'fa-champagne-glasses', query: 'party' },
  { id: 'night', label: 'Late Night Drive', icon: 'fa-moon', query: 'night' },
  { id: 'romantic', label: 'Romantic & Cozy', icon: 'fa-heart', query: 'love' }
]

const DECADE_CARDS = [
  { id: '80s', title: '80s Synth & Pop', subtitle: 'Neon synths & timeless grooves', gradient: 'linear-gradient(135deg, #f43f5e, #8b5cf6)', query: '80s' },
  { id: '90s', title: '90s Throwback', subtitle: 'Grunge, eurodance & golden hip-hop', gradient: 'linear-gradient(135deg, #0ea5e9, #6366f1)', query: '90s' },
  { id: '2000s', title: '2000s Nostalgia', subtitle: 'Millennium pop, R&B & punk rock', gradient: 'linear-gradient(135deg, #10b981, #0284c7)', query: '2000s' },
  { id: 'future', title: 'Modern Hits & Beyond', subtitle: 'Today’s chart toppers & viral sounds', gradient: 'linear-gradient(135deg, #f59e0b, #ec4899)', query: 'future modern' }
]

const BrowseView = () => {
  const { allTracks, playTrack, currentTrack, isPlaying, toggleFavorite, isFavorite } = usePlayer()

  const [selectedCategory, setSelectedCategory] = useState(null)
  const [activeMood, setActiveMood] = useState('all')
  const [categoryTracks, setCategoryTracks] = useState([])
  const [loadingCategory, setLoadingCategory] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Load tracks when a category is selected
  useEffect(() => {
    if (!selectedCategory) {
      setCategoryTracks([])
      return
    }

    let isMounted = true
    const fetchCategoryTracks = async () => {
      try {
        setLoadingCategory(true)
        const query = selectedCategory.query || selectedCategory.name
        const res = await fetch(`/api/v1/music/search?q=${encodeURIComponent(query)}&limit=25`)
        const data = await res.json()
        if (isMounted) {
          if (data.success && data.data && data.data.length > 0) {
            setCategoryTracks(data.data)
          } else {
            // Fallback from allTracks in player
            const fallback = (allTracks || []).filter(t => 
              (t.category || '').toLowerCase().includes(query.toLowerCase()) ||
              (t.title || '').toLowerCase().includes(query.toLowerCase())
            )
            setCategoryTracks(fallback)
          }
        }
      } catch (err) {
        console.warn('Failed to load category tracks:', err)
        if (isMounted) setCategoryTracks(allTracks || [])
      } finally {
        if (isMounted) setLoadingCategory(false)
      }
    }

    fetchCategoryTracks()
    return () => { isMounted = false }
  }, [selectedCategory, allTracks])

  // Filtered categories based on search input or active mood
  const displayedCategories = useMemo(() => {
    return GENRE_CATEGORIES.filter(cat => {
      const matchSearch = searchTerm.trim() === '' || 
        cat.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        cat.desc.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchMood = activeMood === 'all' || 
        cat.id.includes(activeMood) || 
        cat.query.includes(activeMood) || 
        activeMood.includes(cat.id)

      return matchSearch && (activeMood === 'all' || matchMood)
    })
  }, [searchTerm, activeMood])

  const handlePlayCategory = (tracks, startIndex = 0) => {
    if (!tracks || tracks.length === 0) return
    const trackToPlay = tracks[startIndex]
    playTrack(trackToPlay, tracks)
  }

  return (
    <div className="browse-view" id="browse-view-root">
      {/* ── Browse Hero Section ── */}
      <div className="browse-view__hero">
        <div className="browse-view__hero-badge">
          <i className="fa-solid fa-layer-group" />
          <span>Catalog & Genres</span>
        </div>
        <h1 className="browse-view__title">Browse Everything</h1>
        <p className="browse-view__subtitle">
          Discover music across 12+ sonic genres, hand-curated activity moods, and vintage eras.
        </p>

        {/* Search / Filter Input */}
        <div className="browse-view__search-bar">
          <i className="fa-solid fa-magnifying-glass" />
          <input
            type="text"
            placeholder="Filter genres, moods, or soundscapes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            id="input-browse-filter"
          />
          {searchTerm && (
            <button className="browse-view__search-clear" onClick={() => setSearchTerm('')}>
              <i className="fa-solid fa-xmark" />
            </button>
          )}
        </div>
      </div>

      {/* ── Mood Chips Bar ── */}
      <div className="browse-view__mood-chips" role="tablist" aria-label="Mood filters">
        {MOOD_FILTERS.map(mood => (
          <button
            key={mood.id}
            className={`browse-view__mood-chip ${activeMood === mood.id ? 'browse-view__mood-chip--active' : ''}`}
            onClick={() => {
              setActiveMood(mood.id)
              setSelectedCategory(null)
            }}
            id={`mood-chip-${mood.id}`}
          >
            <i className={`fa-solid ${mood.icon}`} />
            <span>{mood.label}</span>
          </button>
        ))}
      </div>

      {/* ── Selected Category Details Drawer / Section ── */}
      {selectedCategory && (
        <div className="browse-view__category-modal" id="browse-category-details">
          <div className="browse-view__category-header" style={{ background: selectedCategory.color }}>
            <div className="browse-view__category-header-info">
              <button 
                className="browse-view__back-btn" 
                onClick={() => setSelectedCategory(null)}
                title="Back to all genres"
              >
                <i className="fa-solid fa-arrow-left" /> Back to All Categories
              </button>
              <div className="browse-view__category-header-badge">
                <i className={`fa-solid ${selectedCategory.icon}`} />
                <span>GENRE SPOTLIGHT</span>
              </div>
              <h2 className="browse-view__category-header-title">{selectedCategory.name}</h2>
              <p className="browse-view__category-header-desc">{selectedCategory.desc}</p>
              
              <div className="browse-view__category-actions">
                <button 
                  className="browse-view__play-all-btn"
                  onClick={() => handlePlayCategory(categoryTracks, 0)}
                  disabled={categoryTracks.length === 0 || loadingCategory}
                  id="btn-category-play-all"
                >
                  <i className="fa-solid fa-play" />
                  <span>Play {selectedCategory.name}</span>
                </button>
                <span className="browse-view__track-count">
                  {categoryTracks.length} tracks available
                </span>
              </div>
            </div>
          </div>

          <div className="browse-view__category-tracks">
            {loadingCategory ? (
              <div className="browse-view__loading">
                <div className="browse-view__spinner" />
                <p>Loading {selectedCategory.name} tracks...</p>
              </div>
            ) : categoryTracks.length === 0 ? (
              <div className="browse-view__empty">
                <i className="fa-solid fa-music" />
                <p>No tracks found for this category.</p>
              </div>
            ) : (
              <div className="browse-view__track-list">
                {categoryTracks.map((track, idx) => {
                  const isCurrent = currentTrack && (currentTrack.id === track.id || currentTrack.jamendoTrackId === track.id)
                  const isCurrentlyPlaying = isCurrent && isPlaying
                  const favorite = isFavorite(track.id)

                  return (
                    <div 
                      key={track.id || idx}
                      className={`browse-view__track-row ${isCurrent ? 'browse-view__track-row--active' : ''}`}
                      onClick={() => handlePlayCategory(categoryTracks, idx)}
                    >
                      <div className="browse-view__track-number">
                        {isCurrentlyPlaying ? (
                          <div className="browse-view__playing-bars">
                            <span /><span /><span />
                          </div>
                        ) : (
                          <span>{idx + 1}</span>
                        )}
                      </div>

                      <div className="browse-view__track-art-box">
                        <img 
                          src={track.artworkUrl || track.album_image || track.imageUrl || DEFAULT_TRACK_ARTWORK} 
                          alt={track.title}
                          onError={handleImageError}
                        />
                        <button className="browse-view__row-play-btn" aria-label="Play track">
                          <i className={`fa-solid ${isCurrentlyPlaying ? 'fa-pause' : 'fa-play'}`} />
                        </button>
                      </div>

                      <div className="browse-view__track-info">
                        <span className="browse-view__track-name">{track.title || track.name}</span>
                        <span className="browse-view__track-artist">{track.artist || track.artist_name || 'Unknown Artist'}</span>
                      </div>

                      <div className="browse-view__track-right">
                        <button
                          className={`browse-view__like-btn ${favorite ? 'browse-view__like-btn--active' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleFavorite(track)
                          }}
                          aria-label={favorite ? 'Unlike' : 'Like'}
                        >
                          <i className={`fa-${favorite ? 'solid' : 'regular'} fa-heart`} />
                        </button>

                        <span className="browse-view__track-duration">
                          {track.duration ? `${Math.floor(track.duration / 60)}:${String(Math.floor(track.duration % 60)).padStart(2, '0')}` : '3:20'}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Main Genre Grid ── */}
      {!selectedCategory && (
        <>
          <section className="browse-view__section">
            <div className="browse-view__section-header">
              <h2>Browse Genres</h2>
              <span className="browse-view__section-count">{displayedCategories.length} Categories</span>
            </div>

            <div className="browse-view__grid">
              {displayedCategories.map(category => (
                <div
                  key={category.id}
                  className="browse-view__card"
                  style={{ background: category.color }}
                  onClick={() => setSelectedCategory(category)}
                  id={`genre-card-${category.id}`}
                  role="button"
                  tabIndex={0}
                >
                  <div className="browse-view__card-content">
                    <h3 className="browse-view__card-title">{category.name}</h3>
                    <p className="browse-view__card-desc">{category.desc}</p>
                  </div>
                  <div className="browse-view__card-icon-wrap">
                    <i className={`fa-solid ${category.icon}`} />
                  </div>
                  <div className="browse-view__card-shine" />
                </div>
              ))}
            </div>
          </section>

          {/* ── Decades & Era Section ── */}
          <section className="browse-view__section">
            <div className="browse-view__section-header">
              <h2>Decades of Sound</h2>
              <span className="browse-view__section-count">Time Machine</span>
            </div>

            <div className="browse-view__decades-grid">
              {DECADE_CARDS.map(decade => (
                <div
                  key={decade.id}
                  className="browse-view__decade-card"
                  style={{ background: decade.gradient }}
                  onClick={() => {
                    setSelectedCategory({
                      id: decade.id,
                      name: decade.title,
                      desc: decade.subtitle,
                      color: decade.gradient,
                      icon: 'fa-compact-disc',
                      query: decade.query
                    })
                  }}
                  id={`decade-card-${decade.id}`}
                  role="button"
                  tabIndex={0}
                >
                  <div className="browse-view__decade-badge">RETRO WAVE</div>
                  <h3 className="browse-view__decade-title">{decade.title}</h3>
                  <p className="browse-view__decade-desc">{decade.subtitle}</p>
                  <button className="browse-view__decade-play-btn">
                    <i className="fa-solid fa-play" /> Explore Era
                  </button>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  )
}

export default BrowseView
