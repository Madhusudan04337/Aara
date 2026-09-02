import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePlayer } from '../../context/usePlayer'
import { handleImageError, DEFAULT_TRACK_ARTWORK } from '../../utils/imageFallback'
import './SongAuthPosterModal.css'

const SongAuthPosterModal = () => {
  const navigate = useNavigate()
  const { authPosterTrack, isAuthPosterOpen, closeAuthPoster } = usePlayer()
  const [downloadToast, setDownloadToast] = useState(false)

  // Close on Escape key press
  useEffect(() => {
    if (!isAuthPosterOpen) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeAuthPoster()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isAuthPosterOpen, closeAuthPoster])

  if (!isAuthPosterOpen || !authPosterTrack) return null

  const handleSignUp = () => {
    // Store pending track so user can auto-play after signup
    try {
      sessionStorage.setItem('aara_pending_track', JSON.stringify(authPosterTrack))
    } catch {
      // ignore
    }
    closeAuthPoster()
    navigate('/signup')
  }

  const handleLogIn = () => {
    // Store pending track so user can auto-play after login
    try {
      sessionStorage.setItem('aara_pending_track', JSON.stringify(authPosterTrack))
    } catch {
      // ignore
    }
    closeAuthPoster()
    navigate('/login')
  }

  const handleDownloadApp = () => {
    setDownloadToast(true)
    setTimeout(() => {
      setDownloadToast(false)
    }, 3500)
  }

  const artwork = authPosterTrack.artworkUrl || authPosterTrack.album_image || authPosterTrack.imageUrl || DEFAULT_TRACK_ARTWORK
  const trackTitle = authPosterTrack.title || 'Unknown Track'
  const artistName = authPosterTrack.artist || 'Unknown Artist'

  return (
    <div 
      className="song-auth-modal" 
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="song-auth-modal-title"
      onClick={closeAuthPoster}
      id="song-auth-poster-dialog"
    >
      <div 
        className="song-auth-modal__wrapper" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Main Card Container */}
        <div className="song-auth-modal__card" id="song-auth-card">
          {/* Left: Track Poster Artwork */}
          <div className="song-auth-modal__art-column">
            <div className="song-auth-modal__art-container">
              <img
                src={artwork}
                alt={`${trackTitle} cover`}
                className="song-auth-modal__artwork"
                onError={handleImageError}
              />
              <div className="song-auth-modal__art-overlay">
                <div className="song-auth-modal__track-info">
                  <span className="song-auth-modal__track-title" title={trackTitle}>
                    {trackTitle}
                  </span>
                  <span className="song-auth-modal__track-artist" title={artistName}>
                    {artistName}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Auth Action Prompt */}
          <div className="song-auth-modal__content-column">
            <h2 id="song-auth-modal-title" className="song-auth-modal__headline">
              Start listening with a free Aara account
            </h2>

            <div className="song-auth-modal__actions">
              <button
                type="button"
                className="song-auth-modal__btn-primary"
                onClick={handleSignUp}
                id="btn-auth-poster-signup"
              >
                Sign up free
              </button>

              <button
                type="button"
                className="song-auth-modal__btn-secondary"
                onClick={handleDownloadApp}
                id="btn-auth-poster-download"
              >
                Download app
              </button>
            </div>

            <div className="song-auth-modal__footer">
              <span className="song-auth-modal__footer-text">
                Already have an account?{' '}
                <button
                  type="button"
                  className="song-auth-modal__link-btn"
                  onClick={handleLogIn}
                  id="btn-auth-poster-login"
                >
                  Log in
                </button>
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Centered Close Button */}
        <div className="song-auth-modal__bottom-bar">
          <button
            type="button"
            className="song-auth-modal__close-btn"
            onClick={closeAuthPoster}
            id="btn-auth-poster-close"
            aria-label="Close dialog"
          >
            Close
          </button>
        </div>
      </div>

      {/* Download App Toast Notification */}
      {downloadToast && (
        <div className="song-auth-modal__toast" role="status">
          <i className="fa-solid fa-circle-check" aria-hidden="true" />
          <span>Aara is running as a Progressive Web App. You can install it directly to your home screen!</span>
        </div>
      )}
    </div>
  )
}

export default SongAuthPosterModal
