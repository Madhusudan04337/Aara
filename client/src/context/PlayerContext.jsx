import { useState, useRef, useEffect, useCallback } from 'react'
import { PlayerContext } from './playerContextDef'
import { useAuth } from './useAuth'

const normalizeTrack = (track) => {
  if (!track) return null
  const id = String(track.id || track._id || track.jamendoTrackId || '')
  return {
    id,
    jamendoTrackId: id,
    title: track.title || track.name || 'Unknown Track',
    artist: track.artist || track.artist_name || track.artistName || 'Unknown Artist',
    artworkUrl: track.artworkUrl || track.album_image || track.imageUrl || track.image || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500',
    audioUrl: track.audioUrl || track.audio || 'https://prod-1.storage.jamendo.com/?trackid=1885448&format=mp31&from=app-dev',
    licenseUrl: track.licenseUrl || track.license_ccurl || 'https://creativecommons.org/licenses/by-nc-sa/3.0/',
    duration: typeof track.duration === 'number' ? track.duration : 0,
    source: track.source || 'jamendo',
    raw: track
  }
}

export const PlayerProvider = ({ children }) => {
  const { token, user } = useAuth()
  const audioRef = useRef(null)
  const [currentTrack, setCurrentTrack] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem('aara_volume')
    return saved !== null ? parseFloat(saved) : 0.8
  })
  const [isMuted, setIsMuted] = useState(false)
  const [isShuffle, setIsShuffle] = useState(false)
  const [repeatMode, setRepeatMode] = useState('off') // 'off' | 'all' | 'one'
  const [queue, setQueue] = useState([])
  const [queueIndex, setQueueIndex] = useState(-1)
  const [favorites, setFavorites] = useState(() => {
    try {
      const storageKey = user?.id ? `aara_favorites_${user.id}` : 'aara_favorites_guest'
      const saved = localStorage.getItem(storageKey) || localStorage.getItem('aara_favorites')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // State refs to avoid stale closures in event listeners
  const stateRef = useRef({
    currentTrack,
    queue,
    queueIndex,
    repeatMode,
    isShuffle,
    currentTime,
  })

  useEffect(() => {
    stateRef.current = {
      currentTrack,
      queue,
      queueIndex,
      repeatMode,
      isShuffle,
      currentTime,
    }
  }, [currentTrack, queue, queueIndex, repeatMode, isShuffle, currentTime])

  const recordPlayHistory = useCallback(async (track) => {
    try {
      const headers = { 'Content-Type': 'application/json' }
      if (token) headers.Authorization = `Bearer ${token}`
      await fetch('/api/v1/history', {
        method: 'POST',
        headers,
        body: JSON.stringify({ track })
      })
    } catch (err) {
      console.warn('Failed to record play history:', err)
    }
  }, [token])

  // Play a specific track
  const playTrack = useCallback((track, newQueue = null) => {
    if (!track) return
    const normalized = normalizeTrack(track)
    if (!normalized || !normalized.audioUrl) return

    if (newQueue && Array.isArray(newQueue) && newQueue.length > 0) {
      const normalizedQueue = newQueue.map(normalizeTrack).filter(Boolean)
      setQueue(normalizedQueue)
      const index = normalizedQueue.findIndex(t => t.id === normalized.id)
      setQueueIndex(index !== -1 ? index : 0)
    }

    setCurrentTrack(normalized)
    setCurrentTime(0)
    setDuration(normalized.duration || 0)

    if (audioRef.current) {
      audioRef.current.src = normalized.audioUrl
      audioRef.current.currentTime = 0
      audioRef.current.play().then(() => {
        setIsPlaying(true)
        recordPlayHistory(normalized)
      }).catch(err => {
        console.warn('Autoplay failed or was blocked by browser:', err)
        setIsPlaying(false)
      })
    }
  }, [recordPlayHistory])

  const seekTo = useCallback((seconds) => {
    if (audioRef.current) {
      audioRef.current.currentTime = seconds
      setCurrentTime(seconds)
    }
  }, [])

  const nextTrack = useCallback(() => {
    const { queue: q, queueIndex: qIdx, repeatMode: rep, isShuffle: shuf, currentTrack: curr } = stateRef.current
    if (q.length === 0) return

    if (rep === 'one' && curr) {
      seekTo(0)
      if (audioRef.current) {
        audioRef.current.play().catch(console.warn)
      }
      return
    }

    let nextIndex
    if (shuf) {
      nextIndex = Math.floor(Math.random() * q.length)
    } else {
      nextIndex = qIdx + 1
      if (nextIndex >= q.length) {
        if (rep === 'all') {
          nextIndex = 0
        } else {
          setIsPlaying(false)
          return
        }
      }
    }

    setQueueIndex(nextIndex)
    const nextItem = q[nextIndex]
    if (nextItem) {
      playTrack(nextItem)
    }
  }, [playTrack, seekTo])

  const prevTrack = useCallback(() => {
    const { queue: q, queueIndex: qIdx, repeatMode: rep, currentTime: cTime } = stateRef.current
    if (cTime > 3) {
      seekTo(0)
      return
    }

    if (q.length === 0) return

    let prevIndex = qIdx - 1
    if (prevIndex < 0) {
      prevIndex = rep === 'all' ? q.length - 1 : 0
    }

    setQueueIndex(prevIndex)
    const prevItem = q[prevIndex]
    if (prevItem) {
      playTrack(prevItem)
    }
  }, [playTrack, seekTo])

  // Single persistent audio element
  useEffect(() => {
    const audio = new Audio()
    audio.preload = 'metadata'
    audio.volume = volume
    audioRef.current = audio

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
    }

    const onLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration)
      }
    }

    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)

    const onEnded = () => {
      const { repeatMode: rep, currentTrack: curr } = stateRef.current
      if (rep === 'one' && curr) {
        audio.currentTime = 0
        audio.play().catch(console.warn)
      } else {
        nextTrack()
      }
    }

    const onError = (e) => {
      console.warn('Audio playback error:', e)
      setIsPlaying(false)
    }

    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('loadedmetadata', onLoadedMetadata)
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('error', onError)

    return () => {
      audio.pause()
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('loadedmetadata', onLoadedMetadata)
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('error', onError)
    }
  }, [nextTrack, volume])

  // Sync volume with audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume
    }
    localStorage.setItem('aara_volume', String(volume))
  }, [volume, isMuted])

  // Sync favorites with user-scoped local storage
  useEffect(() => {
    const storageKey = user?.id ? `aara_favorites_${user.id}` : 'aara_favorites_guest'
    localStorage.setItem(storageKey, JSON.stringify(favorites))
  }, [favorites, user?.id])

  // Load initial favorites from backend API if authenticated or load guest storage
  useEffect(() => {
    let isCurrent = true
    const fetchFavorites = async () => {
      if (!token) {
        try {
          const guestSaved = localStorage.getItem('aara_favorites_guest') || localStorage.getItem('aara_favorites')
          if (guestSaved && isCurrent) {
            setFavorites(JSON.parse(guestSaved))
          } else if (isCurrent) {
            setFavorites([])
          }
        } catch {
          if (isCurrent) setFavorites([])
        }
        return
      }

      try {
        const res = await fetch('/api/v1/favorites', {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json()
        if (isCurrent && data.success && Array.isArray(data.data)) {
          const ids = data.data.map(item => String(item.track?.jamendoTrackId || item.track?.id || item._id))
          setFavorites(ids)
        }
      } catch (err) {
        console.warn('Could not fetch user favorites:', err)
      }
    }
    fetchFavorites()
    return () => {
      isCurrent = false
    }
  }, [token])

  const togglePlay = useCallback(() => {
    if (!audioRef.current || !currentTrack) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true)
      }).catch(err => {
        console.warn('Audio play request error:', err)
      })
    }
  }, [isPlaying, currentTrack])

  const setPlayerVolume = useCallback((val) => {
    const clamped = Math.max(0, Math.min(1, val))
    setVolume(clamped)
    if (clamped > 0 && isMuted) {
      setIsMuted(false)
    }
  }, [isMuted])

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev)
  }, [])

  const toggleShuffle = useCallback(() => {
    setIsShuffle(prev => !prev)
  }, [])

  const toggleRepeat = useCallback(() => {
    setRepeatMode(prev => {
      if (prev === 'off') return 'all'
      if (prev === 'all') return 'one'
      return 'off'
    })
  }, [])

  const toggleFavorite = useCallback(async (track) => {
    if (!track) return
    const norm = normalizeTrack(track)
    const id = norm.id

    const exists = favorites.includes(id)
    const updated = exists ? favorites.filter(fId => fId !== id) : [...favorites, id]
    setFavorites(updated)

    if (!token) return

    try {
      const headers = { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }

      if (exists) {
        await fetch(`/api/v1/favorites/${id}`, { method: 'DELETE', headers })
      } else {
        await fetch('/api/v1/favorites', {
          method: 'POST',
          headers,
          body: JSON.stringify({ track: norm })
        })
      }
    } catch (err) {
      console.warn('Favorite API sync failed:', err)
    }
  }, [favorites, token])

  const isFavorite = useCallback((trackId) => {
    return favorites.includes(String(trackId))
  }, [favorites])

  const isTrackActive = useCallback((track) => {
    if (!track || !currentTrack) return false
    const id = String(track.id || track._id || track.jamendoTrackId || '')
    return currentTrack.id === id
  }, [currentTrack])

  const isTrackPlaying = useCallback((track) => {
    return isTrackActive(track) && isPlaying
  }, [isTrackActive, isPlaying])

  const value = {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isShuffle,
    repeatMode,
    queue,
    queueIndex,
    favorites,
    playTrack,
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
    isTrackActive,
    isTrackPlaying,
  }

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  )
}

export default PlayerProvider
