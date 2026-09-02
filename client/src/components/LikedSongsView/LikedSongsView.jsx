import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePlayer } from '../../context/usePlayer'
import { useAuth } from '../../context/useAuth'
import { handleImageError, DEFAULT_TRACK_ARTWORK } from '../../utils/imageFallback'
import './LikedSongsView.css'

const formatDuration = (timeInSeconds) => {
  if (!timeInSeconds || isNaN(timeInSeconds) || timeInSeconds <= 0) return '3:15'
  const minutes = Math.floor(timeInSeconds / 60)
  const seconds = Math.floor(timeInSeconds % 60)
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
}

const formatRelativeDate = (dateString) => {
  if (!dateString) return 'Recently'
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return 'Recently'
    const now = new Date()
    const diffMs = now - date
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    if (diffDays <= 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return 'Recently'
  }
}

const LikedSongsView = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const {
    favoriteTracks,
    playTrack,
    togglePlay,
    isTrackActive,
    isTrackPlaying,
    toggleFavorite,
    isFavorite,
    currentTrack
  } = usePlayer()

  const [filterQuery, setFilterQuery] = useState('')

  // Filtered tracks according to search
  const displayedTracks = useMemo(() => {
    if (!filterQuery.trim()) return favoriteTracks
    const q = filterQuery.toLowerCase()
    return favoriteTracks.filter(
      (t) =>
        (t.title && t.title.toLowerCase().includes(q)) ||
        (t.artist && t.artist.toLowerCase().includes(q)) ||
        (t.artistName && t.artistName.toLowerCase().includes(q))
    )
  }, [favoriteTracks, filterQuery])

  // Total duration calculation
  const totalDurationFormatted = useMemo(() => {
    const totalSecs = displayedTracks.reduce((acc, curr) => acc + (curr.duration || 195), 0)
    const hours = Math.floor(totalSecs / 3600)
    const mins = Math.floor((totalSecs % 3600) / 60)
    if (hours > 0) {
      return `${hours} hr ${mins} min`
    }
    return `${mins} min`
  }, [displayedTracks])

  // Is any liked song currently playing
  const isLikedSongActive = currentTrack && displayedTracks.some((t) => t.id === currentTrack.id)
  const isLikedPlaying = isLikedSongActive && isTrackPlaying(currentTrack)

  const handlePlayAll = () => {
    if (displayedTracks.length === 0) return

    if (isLikedSongActive) {
      togglePlay()
    } else {
      playTrack(displayedTracks[0], displayedTracks)
    }
  }

  const handleTrackRowClick = (track) => {
    if (isTrackActive(track)) {
      togglePlay()
    } else {
      playTrack(track, displayedTracks)
    }
  }

  const userName = user?.name || user?.username || 'You'

  return (
    <div className="liked-songs-container" id="view-liked-songs">
      {/* Back button */}
      <button 
        className="liked-songs-back-btn" 
        onClick={() => navigate('/')}
        aria-label="Back to Home"
      >
        <i className="fa-solid fa-chevron-left" />
        <span>Back</span>
      </button>

      {/* Hero Header */}
      <div className="liked-songs-hero">
        <div className="liked-songs-art">
          <i className="fa-solid fa-heart" />
        </div>

        <div className="liked-songs-meta">
          <span className="liked-songs-type">Playlist</span>
          <h1 className="liked-songs-title">Liked Songs</h1>
          <div className="liked-songs-details">
            <span className="liked-songs-user">{userName}</span>
            <span className="liked-songs-dot">•</span>
            <span>{displayedTracks.length} {displayedTracks.length === 1 ? 'song' : 'songs'}</span>
            {displayedTracks.length > 0 && (
              <>
                <span className="liked-songs-dot">•</span>
                <span>{totalDurationFormatted}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="liked-songs-action-bar">
        <div className="liked-songs-action-left">
          <button
            className="liked-songs-play-all-btn"
            id="btn-play-liked-songs"
            onClick={handlePlayAll}
            disabled={displayedTracks.length === 0}
            title={isLikedPlaying ? 'Pause Liked Songs' : 'Play Liked Songs'}
            aria-label={isLikedPlaying ? 'Pause Liked Songs' : 'Play Liked Songs'}
          >
            <i className={isLikedPlaying ? 'fa-solid fa-pause' : 'fa-solid fa-play'} />
          </button>
        </div>

        {favoriteTracks.length > 0 && (
          <div className="liked-songs-action-right">
            <div className="liked-songs-search-box">
              <i className="fa-solid fa-magnifying-glass" />
              <input
                type="text"
                placeholder="Search in Liked Songs"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                id="input-filter-liked-songs"
              />
              {filterQuery && (
                <button
                  style={{ background: 'none', border: 'none', color: '#b3b3b3', cursor: 'pointer', padding: 0 }}
                  onClick={() => setFilterQuery('')}
                  title="Clear filter"
                >
                  <i className="fa-solid fa-xmark" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Song List Content */}
      {displayedTracks.length > 0 ? (
        <div className="liked-songs-table-wrapper">
          <table className="liked-songs-table">
            <thead>
              <tr>
                <th className="th-num">#</th>
                <th>Title</th>
                <th className="th-album">Artist / Source</th>
                <th className="th-date">Date Added</th>
                <th className="th-time"><i className="fa-regular fa-clock" title="Duration" /></th>
                <th className="th-actions"></th>
              </tr>
            </thead>
            <tbody>
              {displayedTracks.map((track, index) => {
                const trackId = track.id || track._id || track.jamendoTrackId
                const active = isTrackActive(track)
                const playing = isTrackPlaying(track)
                const liked = isFavorite(trackId)
                const artwork = track.artworkUrl || track.album_image || track.imageUrl || DEFAULT_TRACK_ARTWORK
                const title = track.title || track.name || 'Unknown Track'
                const artist = track.artist || track.artist_name || track.artistName || 'Unknown Artist'

                return (
                  <tr
                    key={`liked-track-${trackId}-${index}`}
                    className={`liked-song-row ${active ? 'row--active' : ''}`}
                    onClick={() => handleTrackRowClick(track)}
                    id={`liked-track-${trackId}`}
                  >
                    {/* Index / Play indicator */}
                    <td className="td-num">
                      {active ? (
                        playing ? (
                          <span className="liked-playing-indicator">
                            <i className="fa-solid fa-volume-high" />
                          </span>
                        ) : (
                          <span className="liked-playing-indicator">
                            <i className="fa-solid fa-pause" />
                          </span>
                        )
                      ) : (
                        <>
                          <span className="row-num-text">{index + 1}</span>
                          <span className="row-play-icon">
                            <i className="fa-solid fa-play" />
                          </span>
                        </>
                      )}
                    </td>

                    {/* Track Artwork & Title */}
                    <td className="td-title">
                      <img
                        src={artwork}
                        alt={title}
                        className="row-artwork"
                        referrerPolicy="no-referrer"
                        onError={(e) => handleImageError(e, DEFAULT_TRACK_ARTWORK)}
                      />
                      <div className="row-title-info">
                        <span className={`row-track-title ${active ? 'text--active' : ''}`} title={title}>
                          {title}
                        </span>
                        <span className="row-track-artist" title={artist}>
                          {artist}
                        </span>
                      </div>
                    </td>

                    {/* Album / Artist */}
                    <td className="td-album" title={artist}>
                      {artist}
                    </td>

                    {/* Date Added */}
                    <td className="td-date">
                      {formatRelativeDate(track.createdAt)}
                    </td>

                    {/* Duration */}
                    <td className="td-time">
                      {formatDuration(track.duration)}
                    </td>

                    {/* Heart Action */}
                    <td className="td-actions" onClick={(e) => e.stopPropagation()}>
                      <button
                        className={`row-heart-btn ${liked ? 'btn--unlike' : ''}`}
                        title={liked ? 'Remove from Liked Songs' : 'Save to Liked Songs'}
                        aria-label={liked ? 'Remove from Liked Songs' : 'Save to Liked Songs'}
                        onClick={() => toggleFavorite(track)}
                      >
                        <i className={liked ? 'fa-solid fa-heart' : 'fa-regular fa-heart'} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Empty State */
        <div className="liked-songs-empty">
          <div className="empty-heart-icon">
            <i className="fa-solid fa-heart-crack" />
          </div>
          <h2 className="empty-title">
            {filterQuery ? 'No matching liked songs found' : 'Songs you like will appear here'}
          </h2>
          <p className="empty-desc">
            {filterQuery
              ? `We couldn't find any liked song matching "${filterQuery}". Try searching for another track.`
              : 'Save songs by clicking the heart icon next to any song title or inside the player.'}
          </p>
          <button
            className="empty-btn"
            id="btn-explore-liked-empty"
            onClick={() => navigate('/')}
          >
            {filterQuery ? 'Clear search filter' : 'Explore music'}
          </button>
        </div>
      )}
    </div>
  )
}

export default LikedSongsView
