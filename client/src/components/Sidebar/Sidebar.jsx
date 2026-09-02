import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'
import { usePlayer } from '../../context/usePlayer'
import './Sidebar.css'

const Sidebar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { token, isAuthenticated } = useAuth()
  const { favorites, favoriteTracks, playTrack } = usePlayer()

  const [sidebarWidth, setSidebarWidth] = useState(320)
  const [isResizing, setIsResizing] = useState(false)
  const [showCreateMenu, setShowCreateMenu] = useState(false)
  const [showAuthTooltip, setShowAuthTooltip] = useState(false)
  
  // Playlist state
  const [playlists, setPlaylists] = useState([])
  const [loadingPlaylists, setLoadingPlaylists] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newPlaylistName, setNewPlaylistName] = useState('')
  const [newPlaylistDesc, setNewPlaylistDesc] = useState('')
  const [creatingPlaylist, setCreatingPlaylist] = useState(false)

  const sidebarRef = useRef(null)

  const MIN_WIDTH = 320
  const MAX_WIDTH = 380

  const startResizing = (e) => {
    e.preventDefault()
    setIsResizing(true)
  }

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return
      
      let newWidth = e.clientX
      if (sidebarRef.current) {
        const sidebarLeft = sidebarRef.current.getBoundingClientRect().left
        newWidth = e.clientX - sidebarLeft
      }

      if (newWidth < MIN_WIDTH) newWidth = MIN_WIDTH
      if (newWidth > MAX_WIDTH) newWidth = MAX_WIDTH

      setSidebarWidth(newWidth)
    }

    const handleMouseUp = () => {
      if (isResizing) {
        setIsResizing(false)
      }
    }

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing])

  useEffect(() => {
    let isMounted = true
    const loadPlaylists = async () => {
      if (!token) {
        if (isMounted) setPlaylists([])
        return
      }

      try {
        setLoadingPlaylists(true)
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
      } finally {
        if (isMounted) setLoadingPlaylists(false)
      }
    }

    loadPlaylists()
    return () => {
      isMounted = false
    }
  }, [token])

  const handleCreateClick = () => {
    setShowCreateMenu(prev => !prev)
    setShowAuthTooltip(false)
  }

  const handleCreatePlaylistAction = () => {
    setShowCreateMenu(false)
    if (!isAuthenticated) {
      setShowAuthTooltip(true)
    } else {
      setNewPlaylistName(`My Playlist #${playlists.length + 1}`)
      setNewPlaylistDesc('')
      setShowCreateModal(true)
    }
  }

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
      }
    } catch (err) {
      console.warn('Playlist creation failed:', err)
    } finally {
      setCreatingPlaylist(false)
    }
  }

  const handleDeletePlaylist = async (e, playlistId) => {
    e.stopPropagation()
    if (!token || !window.confirm('Are you sure you want to delete this playlist?')) return

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
    <aside 
      className={`sidebar ${isResizing ? 'resizing' : ''}`} 
      ref={sidebarRef}
      style={{ width: `${sidebarWidth}px` }}
      aria-label="Your Library"
    >

      {/* Library Header */}
      <div className="library">
        <div className="library-header" style={{ position: 'relative' }}>
          <div className="library-title" onClick={() => navigate('/')}>
            <i className="fa-solid fa-book-open" aria-hidden="true" />
            <p>Your Library</p>
          </div>
          
          <button
            className={`library-add-btn ${showCreateMenu ? 'library-add-btn--active' : ''} ${sidebarWidth >= 345 ? 'library-add-btn--expanded' : ''}`}
            id="btn-library-add"
            aria-label="Create playlist or podcast"
            onClick={handleCreateClick}
          >
            <span className="library-add-btn__icon">
              {showCreateMenu ? (
                <>
                  <i className="fa-solid fa-xmark" aria-hidden="true" />
                  {sidebarWidth >= 345 && <span className="library-add-btn__text">Create</span>}
                </>
              ) : (
                <>
                  <i className="fa-solid fa-plus" aria-hidden="true" />
                  {sidebarWidth >= 345 && <span className="library-add-btn__text">Create</span>}
                </>
              )}
            </span>
          </button>

          {/* SPOTIFY-STYLE CREATE MENU DROPDOWN */}
          {showCreateMenu && (
            <div className="create-menu-dropdown">
              <div className="create-menu-item" onClick={handleCreatePlaylistAction}>
                <div className="create-menu-icon-wrapper">
                  <i className="fa-solid fa-music" />
                </div>
                <div className="create-menu-info">
                  <span className="create-menu-title">Playlist</span>
                  <span className="create-menu-desc">Create a playlist with songs or episodes</span>
                </div>
              </div>

              <div className="create-menu-item" onClick={handleCreatePlaylistAction}>
                <div className="create-menu-icon-wrapper">
                  <i className="fa-solid fa-circle-half-stroke" />
                </div>
                <div className="create-menu-info">
                  <span className="create-menu-title">Blend</span>
                  <span className="create-menu-desc">Combine your friends&apos; tastes into a playlist</span>
                </div>
              </div>

              <div className="create-menu-item" onClick={handleCreatePlaylistAction}>
                <div className="create-menu-icon-wrapper">
                  <i className="fa-solid fa-folder" />
                </div>
                <div className="create-menu-info">
                  <span className="create-menu-title">Folder</span>
                  <span className="create-menu-desc">Organize your playlists</span>
                </div>
              </div>
            </div>
          )}

          {/* BLUE CREATE PLAYLIST AUTH TOOLTIP */}
          {showAuthTooltip && !isAuthenticated && (
            <div className="create-auth-tooltip">
              <div className="create-auth-tooltip__arrow" />
              <h3 className="create-auth-tooltip__title">Create a playlist</h3>
              <p className="create-auth-tooltip__desc">Log in to create and share playlists.</p>
              <div className="create-auth-tooltip__actions">
                <button
                  className="create-auth-tooltip__btn-notnow"
                  onClick={() => setShowAuthTooltip(false)}
                >
                  Not now
                </button>
                <button
                  className="create-auth-tooltip__btn-login"
                  onClick={() => navigate('/login')}
                >
                  Log in
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Library Content */}
      <div className="library-content">
        <div className="box-music">
          <div className="content-scroll">

            {isAuthenticated ? (
              <div className="user-library-list">
                {/* Liked Songs Entry */}
                <div 
                  className={`sidebar-playlist-item ${location.pathname === '/liked-songs' || location.pathname === '/collection/tracks' ? 'sidebar-playlist-item--active' : ''}`} 
                  id="item-liked-songs"
                  onClick={() => navigate('/liked-songs')}
                  title="View Liked Songs"
                >
                  <div className="sidebar-playlist-art sidebar-playlist-art--liked">
                    <i className="fa-solid fa-heart" />
                  </div>
                  <div className="sidebar-playlist-info">
                    <span className="sidebar-playlist-name">Liked Songs</span>
                    <span className="sidebar-playlist-meta">
                      <i className="fa-solid fa-thumbtack sidebar-pinned-icon" /> Playlist • {favorites.length} {favorites.length === 1 ? 'song' : 'songs'}
                    </span>
                  </div>
                  {favorites.length > 0 && (
                    <div className="sidebar-playlist-actions">
                      <button
                        className="sidebar-playlist-play-btn"
                        title="Play Liked Songs"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (favoriteTracks.length > 0) {
                            playTrack(favoriteTracks[0], favoriteTracks)
                          }
                        }}
                      >
                        <i className="fa-solid fa-play" />
                      </button>
                    </div>
                  )}
                </div>

                {/* User Created Playlists */}
                {playlists.map((pl) => {
                  const plId = pl._id || pl.id
                  const trackCount = pl.tracks ? pl.tracks.length : 0
                  const isPlActive = location.pathname === `/playlist/${plId}`
                  return (
                    <div 
                      key={plId} 
                      className={`sidebar-playlist-item ${isPlActive ? 'sidebar-playlist-item--active' : ''}`}
                      id={`item-playlist-${plId}`}
                      onClick={() => navigate(`/playlist/${plId}`)}
                      title={pl.name}
                    >
                      <div className="sidebar-playlist-art">
                        <i className="fa-solid fa-music" />
                      </div>
                      <div className="sidebar-playlist-info">
                        <span className="sidebar-playlist-name">{pl.name}</span>
                        <span className="sidebar-playlist-meta">
                          Playlist • {trackCount} {trackCount === 1 ? 'song' : 'songs'}
                        </span>
                      </div>
                      <div className="sidebar-playlist-actions">
                        {trackCount > 0 && (
                          <button
                            className="sidebar-playlist-play-btn"
                            title="Play playlist"
                            onClick={(e) => handlePlayPlaylist(e, pl)}
                          >
                            <i className="fa-solid fa-play" />
                          </button>
                        )}
                        <button
                          className="sidebar-playlist-delete-btn"
                          title="Delete playlist"
                          onClick={(e) => handleDeletePlaylist(e, plId)}
                        >
                          <i className="fa-solid fa-trash-can" />
                        </button>
                      </div>
                    </div>
                  )
                })}

                {playlists.length === 0 && !loadingPlaylists && (
                  <div className="playlist" id="card-create-first-playlist">
                    <div className="playlist-content">
                      <span className="title">Create your first playlist</span>
                      <br />
                      <span className="desc">It&apos;s easy, we&apos;ll help you</span>
                    </div>
                    <div>
                      <button
                        className="btn"
                        id="btn-create-first-playlist"
                        onClick={handleCreatePlaylistAction}
                      >
                        <span>Create playlist</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Liked Songs for Guest if they have liked songs */}
                {favorites.length > 0 && (
                  <div className="user-library-list" style={{ marginBottom: '1rem' }}>
                    <div 
                      className={`sidebar-playlist-item ${location.pathname === '/liked-songs' ? 'sidebar-playlist-item--active' : ''}`} 
                      id="item-liked-songs-guest"
                      onClick={() => navigate('/liked-songs')}
                      title="View Liked Songs"
                    >
                      <div className="sidebar-playlist-art sidebar-playlist-art--liked">
                        <i className="fa-solid fa-heart" />
                      </div>
                      <div className="sidebar-playlist-info">
                        <span className="sidebar-playlist-name">Liked Songs</span>
                        <span className="sidebar-playlist-meta">
                          <i className="fa-solid fa-thumbtack sidebar-pinned-icon" /> Playlist • {favorites.length} {favorites.length === 1 ? 'song' : 'songs'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Create Playlist Card for Guest */}
                <div className="playlist" id="card-create-playlist">
                  <div className="playlist-content">
                    <span className="title">Create your first playlist</span>
                    <br />
                    <span className="desc">It&apos;s easy, we&apos;ll help you</span>
                  </div>
                  <div>
                    <button
                      className="btn"
                      id="btn-create-playlist"
                      onClick={handleCreatePlaylistAction}
                    >
                      <span>Create playlist</span>
                    </button>
                  </div>
                </div>

                {/* Browse Podcasts Card */}
                <div className="playlist" id="card-browse-podcasts">
                  <div className="playlist-content">
                    <span className="title">Let&apos;s find some podcasts to follow</span>
                    <br />
                    <span className="desc">We&apos;ll keep you updated on new episodes</span>
                  </div>
                  <div className="playlist-add-btn">
                    <button className="btn" id="btn-browse-podcasts">
                      <span>Browse podcasts</span>
                    </button>
                  </div>
                </div>
              </>
            )}

          </div>
        </div>

        {/* Library Footer */}
        <footer className="library-footer">
          <div className="footer-links">
            <div className="footer-links__list">
              <span className="footer-links__item">Legal</span>
              <span className="footer-links__item">Safety &amp; Privacy Center</span>
              <span className="footer-links__item">Privacy Policy</span>
              <span className="footer-links__item">Cookies</span>
              <span className="footer-links__item">About Ads</span>
              <span className="footer-links__item">Accessibility</span>
            </div>
            <div>
              <a
                className="footer-links__external"
                href="https://www.spotify.com/legal/cookies-policy/"
                target="_blank"
                rel="noopener noreferrer"
                draggable="false"
              >
                Cookies
              </a>
            </div>
          </div>

          <div className="language-selector">
            <button className="lang-btn" id="btn-language" aria-label="Change language">
              <span className="material-symbols-outlined">language</span>
              <span>English</span>
            </button>
          </div>
        </footer>
      </div>

      {/* Resize Handle */}
      <div 
        className="sidebar-resize-handle" 
        onMouseDown={startResizing}
        title="Drag to resize sidebar"
      />

      {/* Create Playlist Modal */}
      {showCreateModal && (
        <div className="sidebar-modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="sidebar-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sidebar-modal-header">
              <h3>Create Playlist</h3>
              <button 
                className="sidebar-modal-close"
                onClick={() => setShowCreateModal(false)}
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>
            <form onSubmit={handleCreatePlaylistSubmit} className="sidebar-modal-form">
              <div className="sidebar-modal-field">
                <label htmlFor="playlist-name-input">Name</label>
                <input
                  id="playlist-name-input"
                  type="text"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="My Playlist"
                  required
                  autoFocus
                />
              </div>
              <div className="sidebar-modal-field">
                <label htmlFor="playlist-desc-input">Description</label>
                <textarea
                  id="playlist-desc-input"
                  value={newPlaylistDesc}
                  onChange={(e) => setNewPlaylistDesc(e.target.value)}
                  placeholder="Give your playlist a catchy description"
                  rows={3}
                />
              </div>
              <div className="sidebar-modal-actions">
                <button
                  type="button"
                  className="sidebar-modal-cancel"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="sidebar-modal-submit"
                  disabled={creatingPlaylist || !newPlaylistName.trim()}
                >
                  {creatingPlaylist ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </aside>
  )
}

export default Sidebar
