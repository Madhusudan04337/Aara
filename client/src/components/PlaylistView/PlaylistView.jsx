import { useState, useEffect, useMemo, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { usePlayer } from '../../context/usePlayer'
import { useAuth } from '../../context/useAuth'
import { handleImageError, DEFAULT_TRACK_ARTWORK } from '../../utils/imageFallback'
import '../LikedSongsView/LikedSongsView.css'

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

const PlaylistView = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { token, user } = useAuth()
  const {
    playTrack,
    togglePlay,
    isTrackActive,
    isTrackPlaying,
    toggleFavorite,
    isFavorite,
    currentTrack
  } = usePlayer()

  const [playlist, setPlaylist] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filterQuery, setFilterQuery] = useState('')

  const fetchPlaylist = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(`/api/v1/playlists/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
      const data = await res.json()
      if (data.success && data.data) {
        setPlaylist(data.data)
      } else {
        setError(data.message || 'Playlist not found')
      }
    } catch (err) {
      console.warn('Failed to load playlist:', err)
      setError('Unable to load playlist details')
    } finally {
      setLoading(false)
    }
  }, [id, token])

  useEffect(() => {
    if (id) {
      fetchPlaylist()
    }
  }, [id, fetchPlaylist])

  const tracks = useMemo(() => {
    if (!playlist || !playlist.tracks) return []
    return playlist.tracks.map((item) => {
      const raw = item.track || item
      const trackId = String(raw.jamendoTrackId || raw.id || item._id)
      return {
        ...raw,
        id: trackId,
        jamendoTrackId: trackId,
        addedAt: item.addedAt || item.createdAt
      }
    })
  }, [playlist])

  const displayedTracks = useMemo(() => {
    if (!filterQuery.trim()) return tracks
    const q = filterQuery.toLowerCase()
    return tracks.filter(
      (t) =>
        (t.title && t.title.toLowerCase().includes(q)) ||
        (t.artist && t.artist.toLowerCase().includes(q)) ||
        (t.artistName && t.artistName.toLowerCase().includes(q))
    )
  }, [tracks, filterQuery])

  const totalDurationFormatted = useMemo(() => {
    const totalSecs = displayedTracks.reduce((acc, curr) => acc + (curr.duration || 195), 0)
    const hours = Math.floor(totalSecs / 3600)
    const mins = Math.floor((totalSecs % 3600) / 60)
    if (hours > 0) return `${hours} hr ${mins} min`
    return `${mins} min`
  }, [displayedTracks])

  const isPlaylistActive = currentTrack && displayedTracks.some((t) => t.id === currentTrack.id)
  const isPlaylistPlaying = isPlaylistActive && isTrackPlaying(currentTrack)

  const handlePlayAll = () => {
    if (displayedTracks.length === 0) return
    if (isPlaylistActive) {
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

  if (loading) {
    return (
      <div className="liked-songs-container" style={{ padding: '2rem 0' }}>
        <p style={{ color: '#b3b3b3' }}>Loading playlist...</p>
      </div>
    )
  }

  if (error || !playlist) {
    return (
      <div className="liked-songs-container" style={{ padding: '2rem 0' }}>
        <button className="liked-songs-back-btn" onClick={() => navigate('/')}>
          <i className="fa-solid fa-chevron-left" />
          <span>Back to Home</span>
        </button>
        <p style={{ color: '#e74c3c' }}>{error || 'Playlist not found.'}</p>
      </div>
    )
  }

  return (
    <div className="liked-songs-container" id={`view-playlist-${id}`}>
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
      <div className="liked-songs-hero" style={{ background: 'linear-gradient(180deg, rgba(30, 80, 120, 0.85) 0%, rgba(15, 30, 50, 0.6) 100%)' }}>
        <div className="liked-songs-art" style={{ background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)' }}>
          <i className="fa-solid fa-music" />
        </div>

        <div className="liked-songs-meta">
          <span className="liked-songs-type">Playlist</span>
          <h1 className="liked-songs-title">{playlist.name}</h1>
          {playlist.description && (
            <p style={{ margin: '0.25rem 0', color: '#b3b3b3', fontSize: '0.9rem' }}>{playlist.description}</p>
          )}
          <div className="liked-songs-details">
            <span className="liked-songs-user">{user?.name || 'Playlist'}</span>
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
            id="btn-play-playlist"
            onClick={handlePlayAll}
            disabled={displayedTracks.length === 0}
            title={isPlaylistPlaying ? 'Pause Playlist' : 'Play Playlist'}
            aria-label={isPlaylistPlaying ? 'Pause Playlist' : 'Play Playlist'}
          >
            <i className={isPlaylistPlaying ? 'fa-solid fa-pause' : 'fa-solid fa-play'} />
          </button>
        </div>

        {tracks.length > 0 && (
          <div className="liked-songs-action-right">
            <div className="liked-songs-search-box">
              <i className="fa-solid fa-magnifying-glass" />
              <input
                type="text"
                placeholder="Search in playlist"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                id="input-filter-playlist-songs"
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
                    key={`pl-track-${trackId}-${index}`}
                    className={`liked-song-row ${active ? 'row--active' : ''}`}
                    onClick={() => handleTrackRowClick(track)}
                    id={`pl-track-${trackId}`}
                  >
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

                    <td className="td-album" title={artist}>
                      {artist}
                    </td>

                    <td className="td-date">
                      {formatRelativeDate(track.addedAt)}
                    </td>

                    <td className="td-time">
                      {formatDuration(track.duration)}
                    </td>

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
        <div className="liked-songs-empty">
          <div className="empty-heart-icon">
            <i className="fa-solid fa-music" />
          </div>
          <h2 className="empty-title">This playlist is empty</h2>
          <p className="empty-desc">Find more songs to add to this playlist.</p>
          <button className="empty-btn" onClick={() => navigate('/')}>
            Explore music
          </button>
        </div>
      )}
    </div>
  )
}

export default PlaylistView
