import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'
import { usePlayer } from '../../context/usePlayer'
import './LibraryView.css'

const LibraryView = () => {
  const navigate = useNavigate()
  const { user, token, isAuthenticated } = useAuth()
  const { favorites, favoriteTracks, playTrack } = usePlayer()

  const [filter, setFilter] = useState('all') // 'all', 'playlists', 'liked'
  const [playlists, setPlaylists] = useState([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newPlaylistName, setNewPlaylistName] = useState('')
  const [newPlaylistDesc, setNewPlaylistDesc] = useState('')
  const [creatingPlaylist, setCreatingPlaylist] = useState(false)

  useEffect(() => {
    let isMounted = true
    const loadPlaylists = async () => {
      if (!token) {
        if (isMounted) setPlaylists([])
        return
      }

      try {
        const res = await fetch('/api/v1/playlists', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        const data = await res.json()
        if (isMounted && data.success && Array.isArray(data.data)) {
          setPlaylists(data.data)
        }
      } catch (err) {
        console.warn('Error fetching playlists:', err)
      }
    }

    loadPlaylists()
    return () => {
      isMounted = false
    }
  }, [token])

  const handleCreatePlaylistSubmit = async (e) => {
    e.preventDefault()
    if (!newPlaylistName.trim() || !token) return

    try {
      setCreatingPlaylist(true)
      const res = await fetch('/api/v1/playlists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newPlaylistName.trim(),
          description: newPlaylistDesc.trim(),
        })
      })
      const data = await res.json()
      if (data.success && data.data) {
        setPlaylists(prev => [data.data, ...prev])
        setShowCreateModal(false)
        setNewPlaylistName('')
        setNewPlaylistDesc('')
      }
    } catch (err) {
      console.warn('Playlist creation failed:', err)
    } finally {
      setCreatingPlaylist(false)
    }
  }

  const handleDeletePlaylist = async (e, playlistId) => {
    e.stopPropagation()
    if (!token || !window.confirm('Delete this playlist?')) return

    try {
      const res = await fetch(`/api/v1/playlists/${playlistId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      const data = await res.json()
      if (data.success) {
        setPlaylists(prev => prev.filter(p => (p._id || p.id) !== playlistId))
      }
    } catch (err) {
      console.warn('Failed to delete playlist:', err)
    }
  }

  const handlePlayPlaylist = (e, playlist) => {
    e.stopPropagation()
    if (playlist.tracks && playlist.tracks.length > 0) {
      playTrack(playlist.tracks[0], playlist.tracks)
    }
  }

  return (
    <div className="mobile-library-view" role="main" aria-label="Your Music Library">
      {/* ── TOP APP-LIKE HEADER ── */}
      <div className="mobile-library-view__header">
        <div className="mobile-library-view__user-title">
          <div className="mobile-library-view__avatar">
            {isAuthenticated && user?.username ? (
              user.username.charAt(0).toUpperCase()
            ) : (
              <i className="fa-solid fa-user" />
            )}
          </div>
          <h1>Your Library</h1>
        </div>

        <div className="mobile-library-view__header-actions">
          <button
            className="mobile-library-view__add-btn"
            onClick={() => {
              if (!isAuthenticated) {
                navigate('/login')
              } else {
                setNewPlaylistName(`My Playlist #${playlists.length + 1}`)
                setNewPlaylistDesc('')
                setShowCreateModal(true)
              }
            }}
            aria-label="Create playlist"
            title="Create Playlist"
            id="btn-mobile-create-playlist"
          >
            <i className="fa-solid fa-plus" />
          </button>
        </div>
      </div>

      {/* ── FILTER PILLS ── */}
      <div className="mobile-library-view__pills">
        <button
          className={`mobile-library-pill ${filter === 'all' ? 'mobile-library-pill--active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button
          className={`mobile-library-pill ${filter === 'playlists' ? 'mobile-library-pill--active' : ''}`}
          onClick={() => setFilter('playlists')}
        >
          Playlists
        </button>
        <button
          className={`mobile-library-pill ${filter === 'liked' ? 'mobile-library-pill--active' : ''}`}
          onClick={() => setFilter('liked')}
        >
          Liked Songs
        </button>
      </div>

      {/* ── MAIN LIST ── */}
      <div className="mobile-library-view__list">
        {/* LIKED SONGS CARD */}
        {(filter === 'all' || filter === 'liked') && (
          <div
            className="mobile-library-item mobile-library-item--liked"
            onClick={() => navigate('/liked-songs')}
            role="button"
            tabIndex={0}
            id="mobile-item-liked-songs"
          >
            <div className="mobile-library-item__art mobile-library-item__art--liked">
              <i className="fa-solid fa-heart" />
            </div>

            <div className="mobile-library-item__info">
              <span className="mobile-library-item__title">Liked Songs</span>
              <span className="mobile-library-item__sub">
                <i className="fa-solid fa-thumbtack mobile-pinned-icon" /> Playlist • {favorites.length} {favorites.length === 1 ? 'song' : 'songs'}
              </span>
            </div>

            {favorites.length > 0 && (
              <button
                className="mobile-library-item__play-btn"
                onClick={(e) => {
                  e.stopPropagation()
                  if (favoriteTracks.length > 0) {
                    playTrack(favoriteTracks[0], favoriteTracks)
                  }
                }}
                aria-label="Play liked songs"
              >
                <i className="fa-solid fa-play" />
              </button>
            )}
          </div>
        )}

        {/* PLAYLIST ITEMS */}
        {(filter === 'all' || filter === 'playlists') && (
          <>
            {playlists.map((pl) => {
              const plId = pl._id || pl.id
              const trackCount = pl.tracks ? pl.tracks.length : 0

              return (
                <div
                  key={plId}
                  className="mobile-library-item"
                  onClick={() => navigate(`/playlist/${plId}`)}
                  role="button"
                  tabIndex={0}
                  id={`mobile-playlist-${plId}`}
                >
                  <div className="mobile-library-item__art">
                    <i className="fa-solid fa-music" />
                  </div>

                  <div className="mobile-library-item__info">
                    <span className="mobile-library-item__title">{pl.name}</span>
                    <span className="mobile-library-item__sub">
                      Playlist • {trackCount} {trackCount === 1 ? 'song' : 'songs'}
                    </span>
                  </div>

                  <div className="mobile-library-item__actions">
                    {trackCount > 0 && (
                      <button
                        className="mobile-library-item__play-btn"
                        onClick={(e) => handlePlayPlaylist(e, pl)}
                        aria-label="Play playlist"
                      >
                        <i className="fa-solid fa-play" />
                      </button>
                    )}
                    <button
                      className="mobile-library-item__delete-btn"
                      onClick={(e) => handleDeletePlaylist(e, plId)}
                      aria-label="Delete playlist"
                    >
                      <i className="fa-solid fa-trash-can" />
                    </button>
                  </div>
                </div>
              )
            })}
          </>
        )}

        {/* GUEST BANNER */}
        {!isAuthenticated && (
          <div className="mobile-library-guest-card">
            <div className="mobile-library-guest-card__icon">
              <i className="fa-solid fa-cloud-arrow-up" />
            </div>
            <h3>Sync your Library</h3>
            <p>Log in or sign up to create playlists, save favorites permanently, and access your music anywhere.</p>
            <div className="mobile-library-guest-card__buttons">
              <button
                className="mobile-library-btn mobile-library-btn--login"
                onClick={() => navigate('/login')}
              >
                Log In
              </button>
              <button
                className="mobile-library-btn mobile-library-btn--signup"
                onClick={() => navigate('/signup')}
              >
                Sign Up Free
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── CREATE PLAYLIST MODAL ── */}
      {showCreateModal && (
        <div className="mobile-modal-overlay-create" onClick={() => setShowCreateModal(false)}>
          <div className="mobile-create-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-create-sheet__handle" />
            <div className="mobile-create-sheet__header">
              <h3>Give your playlist a name</h3>
              <button
                className="mobile-create-sheet__close"
                onClick={() => setShowCreateModal(false)}
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            <form onSubmit={handleCreatePlaylistSubmit} className="mobile-create-sheet__form">
              <input
                type="text"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                placeholder="Playlist name"
                className="mobile-create-sheet__input"
                required
                autoFocus
              />
              <textarea
                value={newPlaylistDesc}
                onChange={(e) => setNewPlaylistDesc(e.target.value)}
                placeholder="Add an optional description"
                className="mobile-create-sheet__textarea"
                rows={2}
              />
              <div className="mobile-create-sheet__actions">
                <button
                  type="button"
                  className="mobile-create-sheet__cancel"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="mobile-create-sheet__submit"
                  disabled={creatingPlaylist || !newPlaylistName.trim()}
                >
                  {creatingPlaylist ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default LibraryView
