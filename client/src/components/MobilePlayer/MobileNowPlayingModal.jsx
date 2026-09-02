import { useState, useRef, useEffect } from 'react'
import { usePlayer } from '../../context/usePlayer'
import { handleImageError, DEFAULT_TRACK_ARTWORK } from '../../utils/imageFallback'
import './MobileNowPlayingModal.css'

const formatTime = (timeInSeconds) => {
  if (isNaN(timeInSeconds) || timeInSeconds < 0) return '0:00'
  const minutes = Math.floor(timeInSeconds / 60)
  const seconds = Math.floor(timeInSeconds % 60)
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
}

const MobileNowPlayingModal = ({ isOpen, onClose }) => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isShuffle,
    repeatMode,
    togglePlay,
    seekTo,
    setPlayerVolume,
    toggleMute,
    nextTrack,
    prevTrack,
    toggleShuffle,
    toggleRepeat,
    toggleFavorite,
    isFavorite,
    queue,
    queueIndex
  } = usePlayer()

  const [isSeeking, setIsSeeking] = useState(false)
  const [seekValue, setSeekValue] = useState(0)
  const [showQueue, setShowQueue] = useState(false)
  const [touchStartY, setTouchStartY] = useState(null)
  const [touchMoveY, setTouchMoveY] = useState(0)
  const modalRef = useRef(null)

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen || !currentTrack) return null

  const isLiked = isFavorite(currentTrack.id)
  const trackName = currentTrack.title || 'Unknown Track'
  const artistName = currentTrack.artist || 'Unknown Artist'
  const albumImage = currentTrack.artworkUrl || DEFAULT_TRACK_ARTWORK
  const licenseUrl = currentTrack.licenseUrl

  const progressPercent = duration > 0 ? ((isSeeking ? seekValue : currentTime) / duration) * 100 : 0
  const volumePercent = isMuted ? 0 : volume * 100

  const handleSeekChange = (e) => {
    const newTime = parseFloat(e.target.value)
    setSeekValue(newTime)
  }

  const handleSeekStart = () => {
    setIsSeeking(true)
    setSeekValue(currentTime)
  }

  const handleSeekEnd = () => {
    setIsSeeking(false)
    seekTo(seekValue)
  }

  // Swipe down to dismiss handler
  const handleTouchStart = (e) => {
    setTouchStartY(e.touches[0].clientY)
  }

  const handleTouchMove = (e) => {
    if (touchStartY === null) return
    const currentY = e.touches[0].clientY
    const deltaY = currentY - touchStartY
    if (deltaY > 0) {
      setTouchMoveY(deltaY)
    }
  }

  const handleTouchEnd = () => {
    if (touchMoveY > 120) {
      onClose()
    }
    setTouchStartY(null)
    setTouchMoveY(0)
  }

  return (
    <div
      className="mobile-modal-overlay"
      ref={modalRef}
      style={{
        transform: touchMoveY > 0 ? `translateY(${touchMoveY}px)` : 'translateY(0)',
        transition: touchMoveY > 0 ? 'none' : 'transform 0.28s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Now Playing"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background ambient blur effect */}
      <div
        className="mobile-modal__ambient-bg"
        style={{ backgroundImage: `url(${albumImage})` }}
      />
      <div className="mobile-modal__backdrop-gradient" />

      <div className="mobile-modal__container">
        {/* ── TOP HEADER ── */}
        <div className="mobile-modal__header">
          <button
            className="mobile-modal__minimize-btn"
            onClick={onClose}
            aria-label="Minimize now playing"
            id="btn-player-minimize"
          >
            <i className="fa-solid fa-chevron-down" />
          </button>

          <div className="mobile-modal__header-info">
            <span className="mobile-modal__context-label">PLAYING FROM</span>
            <span className="mobile-modal__context-source">
              {currentTrack.source === 'jamendo' ? 'Jamendo Music Library' : 'Trending Hits'}
            </span>
          </div>

          <button
            className={`mobile-modal__queue-toggle-btn ${showQueue ? 'mobile-modal__queue-toggle-btn--active' : ''}`}
            onClick={() => setShowQueue(prev => !prev)}
            aria-label="Toggle Queue"
            title="Queue"
            id="btn-player-queue"
          >
            <i className="fa-solid fa-list-ul" />
          </button>
        </div>

        {/* ── MAIN CONTENT (ALBUM ART OR QUEUE) ── */}
        {showQueue ? (
          <div className="mobile-modal__queue-view">
            <div className="mobile-modal__queue-header">
              <h3>Now Playing Queue</h3>
              <span>{queue.length} tracks</span>
            </div>
            <div className="mobile-modal__queue-list">
              {queue.map((track, idx) => {
                const isCurrent = idx === queueIndex || track.id === currentTrack.id
                return (
                  <div
                    key={`q-${track.id}-${idx}`}
                    className={`mobile-modal__queue-item ${isCurrent ? 'mobile-modal__queue-item--active' : ''}`}
                    onClick={() => {
                      seekTo(0)
                      // play this queue item
                    }}
                  >
                    <span className="mobile-queue-idx">{idx + 1}</span>
                    <img
                      src={track.artworkUrl || DEFAULT_TRACK_ARTWORK}
                      alt={track.title}
                      className="mobile-queue-thumb"
                      onError={(e) => handleImageError(e, DEFAULT_TRACK_ARTWORK)}
                    />
                    <div className="mobile-queue-meta">
                      <span className="mobile-queue-title">{track.title}</span>
                      <span className="mobile-queue-artist">{track.artist}</span>
                    </div>
                    {isCurrent && (
                      <i className="fa-solid fa-volume-high mobile-queue-active-icon" />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="mobile-modal__artwork-container">
            <div className={`mobile-modal__artwork-wrapper ${isPlaying ? 'mobile-modal__artwork-wrapper--playing' : ''}`}>
              <img
                src={albumImage}
                alt={`${trackName} cover artwork`}
                className="mobile-modal__artwork"
                referrerPolicy="no-referrer"
                onError={(e) => handleImageError(e, DEFAULT_TRACK_ARTWORK)}
              />
            </div>
          </div>
        )}

        {/* ── TRACK INFO & FAVORITE ── */}
        <div className="mobile-modal__track-info">
          <div className="mobile-modal__titles">
            <h1 className="mobile-modal__track-title" title={trackName}>
              {trackName}
            </h1>
            <p className="mobile-modal__track-artist" title={artistName}>
              {artistName}
            </p>
          </div>

          <button
            className={`mobile-modal__heart-btn ${isLiked ? 'mobile-modal__heart-btn--active' : ''}`}
            onClick={() => toggleFavorite(currentTrack)}
            aria-label={isLiked ? 'Remove from favorites' : 'Add to favorites'}
            id="btn-player-modal-heart"
          >
            <i className={isLiked ? 'fa-solid fa-heart' : 'fa-regular fa-heart'} />
          </button>
        </div>

        {/* ── SCRUBBER & TIMELINE ── */}
        <div className="mobile-modal__timeline">
          <div className="mobile-modal__slider-container">
            <input
              type="range"
              min="0"
              max={duration || 100}
              step="0.1"
              value={isSeeking ? seekValue : currentTime}
              onChange={handleSeekChange}
              onTouchStart={handleSeekStart}
              onTouchEnd={handleSeekEnd}
              onMouseDown={handleSeekStart}
              onMouseUp={handleSeekEnd}
              className="mobile-modal__slider"
              aria-label="Track progress"
            />
            <div
              className="mobile-modal__slider-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="mobile-modal__time-labels">
            <span>{formatTime(isSeeking ? seekValue : currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* ── PRIMARY PLAYBACK CONTROLS ── */}
        <div className="mobile-modal__controls">
          <button
            className={`mobile-modal__ctrl-btn ${isShuffle ? 'mobile-modal__ctrl-btn--active' : ''}`}
            onClick={toggleShuffle}
            aria-label={isShuffle ? 'Disable shuffle' : 'Enable shuffle'}
            title="Shuffle"
          >
            <i className="fa-solid fa-shuffle" />
          </button>

          <button
            className="mobile-modal__ctrl-btn mobile-modal__ctrl-btn--skip"
            onClick={prevTrack}
            aria-label="Previous song"
          >
            <i className="fa-solid fa-backward-step" />
          </button>

          <button
            className="mobile-modal__play-pause-btn"
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            id="btn-player-modal-play"
          >
            <i className={isPlaying ? 'fa-solid fa-pause' : 'fa-solid fa-play'} />
          </button>

          <button
            className="mobile-modal__ctrl-btn mobile-modal__ctrl-btn--skip"
            onClick={nextTrack}
            aria-label="Next song"
          >
            <i className="fa-solid fa-forward-step" />
          </button>

          <button
            className={`mobile-modal__ctrl-btn ${repeatMode !== 'off' ? 'mobile-modal__ctrl-btn--active' : ''}`}
            onClick={toggleRepeat}
            aria-label={`Repeat mode: ${repeatMode}`}
          >
            <i className="fa-solid fa-repeat" />
            {repeatMode === 'one' && <span className="mobile-modal__repeat-one">1</span>}
          </button>
        </div>

        {/* ── BOTTOM UTILITY ACTIONS ── */}
        <div className="mobile-modal__footer-actions">
          {licenseUrl ? (
            <a
              href={licenseUrl}
              target="_blank"
              rel="noreferrer"
              className="mobile-modal__license-btn"
            >
              <i className="fa-solid fa-shield-halved" />
              <span>Jamendo CC License</span>
            </a>
          ) : (
            <div />
          )}

          <div className="mobile-modal__volume-box">
            <button
              className="mobile-modal__mute-btn"
              onClick={toggleMute}
              aria-label={isMuted || volume === 0 ? 'Unmute' : 'Mute'}
            >
              <i
                className={
                  isMuted || volume === 0
                    ? 'fa-solid fa-volume-xmark'
                    : volume < 0.5
                    ? 'fa-solid fa-volume-low'
                    : 'fa-solid fa-volume-high'
                }
              />
            </button>
            <div className="mobile-modal__vol-slider-wrap">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={(e) => setPlayerVolume(parseFloat(e.target.value))}
                className="mobile-modal__vol-slider"
                aria-label="Volume slider"
              />
              <div
                className="mobile-modal__vol-fill"
                style={{ width: `${volumePercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MobileNowPlayingModal
