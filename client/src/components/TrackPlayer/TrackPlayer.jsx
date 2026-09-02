import { useState, useRef } from 'react'
import { usePlayer } from '../../context/usePlayer'
import { handleImageError, DEFAULT_TRACK_ARTWORK } from '../../utils/imageFallback'
import MobileNowPlayingModal from '../MobilePlayer/MobileNowPlayingModal'
import './TrackPlayer.css'

const formatTime = (timeInSeconds) => {
  if (isNaN(timeInSeconds) || timeInSeconds < 0) return '0:00'
  const minutes = Math.floor(timeInSeconds / 60)
  const seconds = Math.floor(timeInSeconds % 60)
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
}

function TrackPlayer() {
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
  } = usePlayer()

  const [isSeeking, setIsSeeking] = useState(false)
  const [seekValue, setSeekValue] = useState(0)
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false)
  const progressBarRef = useRef(null)

  if (!currentTrack) {
    return null
  }

  const isLiked = isFavorite(currentTrack.id)
  const trackName = currentTrack.title || 'Unknown Track'
  const artistName = currentTrack.artist || 'Unknown Artist'
  const albumImage = currentTrack.artworkUrl
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

  const handleVolumeChange = (e) => {
    setPlayerVolume(parseFloat(e.target.value))
  }

  const handleHeartClick = (e) => {
    e.stopPropagation()
    toggleFavorite(currentTrack)
  }

  const handlePlayClick = (e) => {
    e.stopPropagation()
    togglePlay()
  }

  return (
    <>
      {/* ── MOBILE MINI-PLAYER (Visible on mobile/tablet screens < 865px) ── */}
      <div 
        className="mobile-mini-player" 
        onClick={() => setIsMobileModalOpen(true)}
        role="button"
        tabIndex={0}
        aria-label={`Now playing ${trackName} by ${artistName}. Tap to expand.`}
      >
        <div className="mobile-mini-player__content">
          <div className="mobile-mini-player__art-box">
            <img
              src={albumImage || DEFAULT_TRACK_ARTWORK}
              alt={trackName}
              className="mobile-mini-player__art"
              referrerPolicy="no-referrer"
              onError={(e) => handleImageError(e, DEFAULT_TRACK_ARTWORK)}
            />
          </div>

          <div className="mobile-mini-player__info">
            <span className="mobile-mini-player__title">{trackName}</span>
            <span className="mobile-mini-player__artist">{artistName}</span>
          </div>

          <div className="mobile-mini-player__actions">
            <button
              className={`mobile-mini-player__btn ${isLiked ? 'mobile-mini-player__btn--liked' : ''}`}
              onClick={handleHeartClick}
              aria-label={isLiked ? 'Remove favorite' : 'Add favorite'}
            >
              <i className={isLiked ? 'fa-solid fa-heart' : 'fa-regular fa-heart'} />
            </button>

            <button
              className="mobile-mini-player__play-btn"
              onClick={handlePlayClick}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              <i className={isPlaying ? 'fa-solid fa-pause' : 'fa-solid fa-play'} />
            </button>
          </div>
        </div>

        {/* Micro progress line on the bottom of mini-player */}
        <div className="mobile-mini-player__progress-track">
          <div
            className="mobile-mini-player__progress-bar"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* ── FULL SCREEN MOBILE MODAL ── */}
      <MobileNowPlayingModal
        isOpen={isMobileModalOpen}
        onClose={() => setIsMobileModalOpen(false)}
      />

      {/* ── DESKTOP STANDARD BOTTOM BAR PLAYER (Visible on screens >= 865px) ── */}
      <div className="track-player-bar desktop-only-player" role="region" aria-label="Audio player">
        {/* ── LEFT: TRACK INFO ── */}
        <div className="track-player-bar__left">
          {albumImage ? (
            <img
              src={albumImage}
              alt={`${trackName} cover`}
              className="track-player-bar__cover"
              referrerPolicy="no-referrer"
              onError={(e) => handleImageError(e, DEFAULT_TRACK_ARTWORK)}
            />
          ) : (
            <div className="track-player-bar__cover-placeholder">
              <i className="fa-solid fa-music" />
            </div>
          )}

          <div className="track-player-bar__meta">
            <span className="track-player-bar__title" title={trackName}>
              {trackName}
            </span>
            <span className="track-player-bar__artist" title={artistName}>
              {artistName}
            </span>
          </div>

          <button
            className={`track-player-bar__fav-btn ${isLiked ? 'track-player-bar__fav-btn--active' : ''}`}
            onClick={handleHeartClick}
            aria-label={isLiked ? 'Remove from favorites' : 'Add to favorites'}
            title={isLiked ? 'Saved to Favorites' : 'Save to Favorites'}
          >
            <i className={isLiked ? 'fa-solid fa-heart' : 'fa-regular fa-heart'} />
          </button>
        </div>

        {/* ── CENTER: PLAYBACK CONTROLS & TIMELINE ── */}
        <div className="track-player-bar__center">
          <div className="track-player-bar__controls">
            <button
              className={`track-player-bar__control-btn ${isShuffle ? 'track-player-bar__control-btn--active' : ''}`}
              onClick={toggleShuffle}
              title={isShuffle ? 'Disable shuffle' : 'Enable shuffle'}
              aria-label="Shuffle"
            >
              <i className="fa-solid fa-shuffle" />
            </button>

            <button
              className="track-player-bar__control-btn"
              onClick={prevTrack}
              title="Previous"
              aria-label="Previous track"
            >
              <i className="fa-solid fa-backward-step" />
            </button>

            <button
              className="track-player-bar__play-btn"
              onClick={togglePlay}
              title={isPlaying ? 'Pause' : 'Play'}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              <i className={isPlaying ? 'fa-solid fa-pause' : 'fa-solid fa-play'} />
            </button>

            <button
              className="track-player-bar__control-btn"
              onClick={nextTrack}
              title="Next"
              aria-label="Next track"
            >
              <i className="fa-solid fa-forward-step" />
            </button>

            <button
              className={`track-player-bar__control-btn ${repeatMode !== 'off' ? 'track-player-bar__control-btn--active' : ''}`}
              onClick={toggleRepeat}
              title={`Repeat: ${repeatMode}`}
              aria-label="Repeat"
            >
              <i className="fa-solid fa-repeat" />
              {repeatMode === 'one' && <span className="track-player-bar__repeat-one">1</span>}
            </button>
          </div>

          <div className="track-player-bar__timeline">
            <span className="track-player-bar__time">
              {formatTime(isSeeking ? seekValue : currentTime)}
            </span>

            <div className="track-player-bar__slider-wrapper" ref={progressBarRef}>
              <input
                type="range"
                min="0"
                max={duration || 100}
                step="0.1"
                value={isSeeking ? seekValue : currentTime}
                onChange={handleSeekChange}
                onMouseDown={handleSeekStart}
                onTouchStart={handleSeekStart}
                onMouseUp={handleSeekEnd}
                onTouchEnd={handleSeekEnd}
                className="track-player-bar__slider"
                aria-label="Track progress"
              />
              <div
                className="track-player-bar__slider-progress"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <span className="track-player-bar__time">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* ── RIGHT: ATTRIBUTION & VOLUME ── */}
        <div className="track-player-bar__right">
          {licenseUrl && (
            <a
              href={licenseUrl}
              target="_blank"
              rel="noreferrer"
              className="track-player-bar__license-tag"
              title="Creative Commons licensed via Jamendo"
            >
              <span>Jamendo CC</span>
            </a>
          )}

          <div className="track-player-bar__volume-container">
            <button
              className="track-player-bar__control-btn"
              onClick={toggleMute}
              aria-label={isMuted || volume === 0 ? 'Unmute' : 'Mute'}
              title={isMuted ? 'Unmute' : 'Mute'}
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

            <div className="track-player-bar__volume-slider-wrapper">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="track-player-bar__volume-slider"
                aria-label="Volume control"
              />
              <div
                className="track-player-bar__volume-progress"
                style={{ width: `${volumePercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default TrackPlayer
