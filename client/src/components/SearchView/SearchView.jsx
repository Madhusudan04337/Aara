import { useState, useMemo } from 'react'
import { usePlayer } from '../../context/usePlayer'
import { handleImageError, DEFAULT_TRACK_ARTWORK } from '../../utils/imageFallback'
import './SearchView.css'

const GENRE_CATEGORIES = [
  { id: 'pop', name: 'Pop', color: '#8d67ab', icon: 'fa-music' },
  { id: 'hiphop', name: 'Hip-Hop', color: '#ba5d07', icon: 'fa-drum' },
  { id: 'rock', name: 'Rock', color: '#e91429', icon: 'fa-guitar' },
  { id: 'lofi', name: 'Chill & Lo-Fi', color: '#477d95', icon: 'fa-mug-hot' },
  { id: 'electronic', name: 'Electronic / EDM', color: '#1e3264', icon: 'fa-bolt' },
  { id: 'ambient', name: 'Ambient & Relax', color: '#503750', icon: 'fa-cloud' },
  { id: 'acoustic', name: 'Acoustic', color: '#bc5900', icon: 'fa-tree' },
  { id: 'jazz', name: 'Jazz & Blues', color: '#27856a', icon: 'fa-compact-disc' },
  { id: 'workout', name: 'Workout', color: '#0d73ec', icon: 'fa-dumbbell' },
  { id: 'focus', name: 'Focus & Study', color: '#777777', icon: 'fa-brain' },
  { id: 'sleep', name: 'Sleep', color: '#1e3264', icon: 'fa-moon' },
  { id: 'party', name: 'Party', color: '#af2896', icon: 'fa-champagne-glasses' }
]

const SearchView = () => {
  const { allTracks, playTrack, currentTrack, isPlaying, togglePlay, toggleFavorite, isFavorite } = usePlayer()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGenre, setSelectedGenre] = useState(null)

  const filteredTracks = useMemo(() => {
    let list = allTracks || []

    if (selectedGenre) {
      const genreLower = selectedGenre.toLowerCase()
      list = list.filter(track => {
        const title = (track.title || '').toLowerCase()
        const artist = (track.artist || '').toLowerCase()
        const category = (track.category || '').toLowerCase()
        return (
          category.includes(genreLower) ||
          title.includes(genreLower) ||
          artist.includes(genreLower)
        )
      })
    }

    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase().trim()
      list = list.filter(track => {
        const title = (track.title || '').toLowerCase()
        const artist = (track.artist || '').toLowerCase()
        const category = (track.category || '').toLowerCase()
        return (
          title.includes(query) ||
          artist.includes(query) ||
          category.includes(query)
        )
      })
    }

    return list
  }, [allTracks, searchTerm, selectedGenre])

  const handleTrackClick = (track) => {
    if (currentTrack && currentTrack.id === track.id) {
      togglePlay()
    } else {
      playTrack(track, filteredTracks.length > 0 ? filteredTracks : allTracks)
    }
  }

  const handleSelectGenre = (genre) => {
    if (selectedGenre === genre.name) {
      setSelectedGenre(null)
    } else {
      setSelectedGenre(genre.name)
      setSearchTerm('')
    }
  }

  return (
    <div className="search-view" role="main" aria-label="Search and explore music">
      {/* ── SEARCH HEADER & BAR ── */}
      <div className="search-view__header">
        <h1 className="search-view__title">Search</h1>

        <div className="search-view__input-wrapper">
          <i className="fa-solid fa-magnifying-glass search-view__search-icon" />
          <input
            type="text"
            placeholder="What do you want to listen to?"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              if (selectedGenre) setSelectedGenre(null)
            }}
            className="search-view__input"
            id="mobile-search-input"
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
          />
          {searchTerm && (
            <button
              className="search-view__clear-btn"
              onClick={() => setSearchTerm('')}
              aria-label="Clear search"
            >
              <i className="fa-solid fa-xmark" />
            </button>
          )}
        </div>

        {/* Selected genre pill if active */}
        {selectedGenre && (
          <div className="search-view__active-filter">
            <span>Filter: <strong>{selectedGenre}</strong></span>
            <button onClick={() => setSelectedGenre(null)} aria-label="Remove filter">
              <i className="fa-solid fa-xmark" />
            </button>
          </div>
        )}
      </div>

      {/* ── SEARCH RESULTS OR BROWSE TILES ── */}
      {searchTerm.trim() || selectedGenre ? (
        <div className="search-view__results-section">
          <div className="search-view__results-header">
            <h2>{selectedGenre ? `Songs in ${selectedGenre}` : `Results for "${searchTerm}"`}</h2>
            <span className="search-view__result-count">{filteredTracks.length} songs found</span>
          </div>

          {filteredTracks.length === 0 ? (
            <div className="search-view__empty-state">
              <i className="fa-solid fa-magnifying-glass search-view__empty-icon" />
              <h3>No results found for &quot;{searchTerm || selectedGenre}&quot;</h3>
              <p>Please make sure your words are spelled correctly, or use fewer or different keywords.</p>
              <button
                className="search-view__reset-btn"
                onClick={() => {
                  setSearchTerm('')
                  setSelectedGenre(null)
                }}
              >
                Browse all categories
              </button>
            </div>
          ) : (
            <div className="search-view__track-list">
              {filteredTracks.map((track, index) => {
                const isCurrent = currentTrack && currentTrack.id === track.id
                const isLiked = isFavorite(track.id)

                return (
                  <div
                    key={`search-${track.id}-${index}`}
                    className={`search-view__track-item ${isCurrent ? 'search-view__track-item--active' : ''}`}
                    onClick={() => handleTrackClick(track)}
                    id={`search-item-${track.id}`}
                  >
                    <div className="search-view__track-art-wrap">
                      <img
                        src={track.artworkUrl || DEFAULT_TRACK_ARTWORK}
                        alt={track.title}
                        className="search-view__track-art"
                        referrerPolicy="no-referrer"
                        onError={(e) => handleImageError(e, DEFAULT_TRACK_ARTWORK)}
                      />
                      <button
                        className="search-view__item-play-overlay"
                        aria-label={isCurrent && isPlaying ? 'Pause' : 'Play'}
                      >
                        <i className={isCurrent && isPlaying ? 'fa-solid fa-pause' : 'fa-solid fa-play'} />
                      </button>
                    </div>

                    <div className="search-view__track-meta">
                      <span className={`search-view__track-name ${isCurrent ? 'search-view__track-name--active' : ''}`}>
                        {track.title}
                      </span>
                      <span className="search-view__track-sub">
                        {track.artist} {track.category ? `• ${track.category}` : ''}
                      </span>
                    </div>

                    <div className="search-view__track-actions">
                      <button
                        className={`search-view__fav-btn ${isLiked ? 'search-view__fav-btn--active' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleFavorite(track)
                        }}
                        aria-label={isLiked ? 'Remove favorite' : 'Add favorite'}
                      >
                        <i className={isLiked ? 'fa-solid fa-heart' : 'fa-regular fa-heart'} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="search-view__browse-section">
          <h2 className="search-view__browse-title">Browse all</h2>
          <div className="search-view__genre-grid">
            {GENRE_CATEGORIES.map((genre) => (
              <div
                key={genre.id}
                className="search-view__genre-card"
                style={{ backgroundColor: genre.color }}
                onClick={() => handleSelectGenre(genre)}
                role="button"
                tabIndex={0}
                id={`genre-card-${genre.id}`}
              >
                <span className="search-view__genre-name">{genre.name}</span>
                <div className="search-view__genre-icon-box">
                  <i className={`fa-solid ${genre.icon}`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default SearchView
