import { useState, useEffect } from 'react'
import { usePlayer } from '../../context/usePlayer'
import './LiveView.css'

const LIVE_STATIONS = [
  {
    id: 'station-lofi',
    name: 'Aara Lo-Fi 24/7',
    tagline: 'Chill beats to relax / study / code to',
    genre: 'Lo-Fi Hip-Hop & Chillhop',
    listeners: 3842,
    gradient: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
    icon: 'fa-mug-hot',
    searchQuery: 'lofi chill beats',
    host: 'DJ Luna',
    badge: 'STUDY & CHILL'
  },
  {
    id: 'station-synthwave',
    name: 'Neon Horizons FM',
    tagline: 'Retro analog synths, darkwave & night driving',
    genre: 'Synthwave & Retrowave',
    listeners: 2190,
    gradient: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
    icon: 'fa-vr-cardboard',
    searchQuery: 'synthwave retrowave',
    host: 'NeonRider',
    badge: 'NIGHT DRIVE'
  },
  {
    id: 'station-focus',
    name: 'Deep Focus & Flow State',
    tagline: 'Binaural ambient soundscapes for max productivity',
    genre: 'Ambient & Drone',
    listeners: 2950,
    gradient: 'linear-gradient(135deg, #10b981, #0ea5e9)',
    icon: 'fa-brain',
    searchQuery: 'ambient focus study',
    host: 'MindWave Studio',
    badge: 'DEEP WORK'
  },
  {
    id: 'station-jazz',
    name: 'Midnight Velvet Jazz',
    tagline: 'Smooth saxophone, acoustic double bass & rain sounds',
    genre: 'Jazz & Soul Lounge',
    listeners: 1475,
    gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
    icon: 'fa-saxophone',
    searchQuery: 'jazz lounge acoustic',
    host: 'Miles Blue',
    badge: 'LATE NIGHT'
  },
  {
    id: 'station-club',
    name: 'Club Aara 24/7 EDM',
    tagline: 'Non-stop progressive house, melodic techno & drops',
    genre: 'Dance & EDM',
    listeners: 4320,
    gradient: 'linear-gradient(135deg, #d946ef, #3b82f6)',
    icon: 'fa-bolt',
    searchQuery: 'edm dance house',
    host: 'Viper Sounds',
    badge: 'HIGH ENERGY'
  },
  {
    id: 'station-acoustic',
    name: 'Coffeehouse Acoustic Live',
    tagline: 'Warm acoustic guitars, intimate vocals & indie folk',
    genre: 'Acoustic & Indie Folk',
    listeners: 1180,
    gradient: 'linear-gradient(135deg, #f97316, #ef4444)',
    icon: 'fa-guitar',
    searchQuery: 'acoustic indie folk',
    host: 'Sarah & The Strings',
    badge: 'UNPLUGGED'
  }
]

const UPCOMING_SCHEDULE = [
  {
    id: 'sch-1',
    time: '8:00 PM EST',
    title: 'Sunset Acoustic Live Session',
    artist: 'Maya Lin & The Wandering Echoes',
    station: 'Coffeehouse Acoustic Live',
    date: 'Tonight'
  },
  {
    id: 'sch-2',
    time: '10:30 PM EST',
    title: 'Cyberpunk Odyssey Live DJ Set',
    artist: 'NeonRider 84',
    station: 'Neon Horizons FM',
    date: 'Tonight'
  },
  {
    id: 'sch-3',
    time: '4:00 PM EST',
    title: 'Sunday Morning Coffee & Vinyl',
    artist: 'Miles Blue Quartet',
    station: 'Midnight Velvet Jazz',
    date: 'Tomorrow'
  }
]

const EMOJI_REACTIONS = ['❤️', '🔥', '🎧', '✨', '⚡', '💃']

const LiveView = () => {
  const { playTrack, isPlaying } = usePlayer()
  const reactionIdRef = useRef(0)
  const [activeStation, setActiveStation] = useState(LIVE_STATIONS[0])
  const [activeStationTracks, setActiveStationTracks] = useState([])
  const [loadingStation, setLoadingStation] = useState(false)
  const [reactions, setReactions] = useState([])
  const [reminderToast, setReminderToast] = useState(null)
  const [listenerCounts, setListenerCounts] = useState(() => {
    const initial = {}
    LIVE_STATIONS.forEach(s => { initial[s.id] = s.listeners })
    return initial
  })

  // Fluctuate listener numbers slightly to simulate real-time live listeners
  useEffect(() => {
    const interval = setInterval(() => {
      setListenerCounts(prev => {
        const updated = { ...prev }
        LIVE_STATIONS.forEach(s => {
          const delta = Math.floor(Math.random() * 7) - 3
          updated[s.id] = Math.max(100, (updated[s.id] || s.listeners) + delta)
        })
        return updated
      })
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  // Load stream tracks for the current active radio station
  useEffect(() => {
    let isMounted = true
    const fetchStationTracks = async () => {
      try {
        setLoadingStation(true)
        const res = await fetch(`/api/v1/music/search?q=${encodeURIComponent(activeStation.searchQuery)}&limit=30`)
        const data = await res.json()
        if (isMounted) {
          if (data.success && data.data && data.data.length > 0) {
            setActiveStationTracks(data.data)
          } else {
            const trending = await fetch('/api/v1/music/trending?limit=30')
            const tData = await trending.json()
            if (isMounted && tData.success) {
              setActiveStationTracks(tData.data || [])
            }
          }
        }
      } catch (err) {
        console.warn('Failed to fetch live station tracks:', err)
      } finally {
        if (isMounted) setLoadingStation(false)
      }
    }

    fetchStationTracks()
    return () => { isMounted = false }
  }, [activeStation])

  const handleTuneIn = (station) => {
    setActiveStation(station)
    if (activeStationTracks && activeStationTracks.length > 0) {
      // Pick random starting track for live radio effect
      const randomIndex = Math.floor(Math.random() * activeStationTracks.length)
      playTrack(activeStationTracks[randomIndex], activeStationTracks)
    }
  }

  const handleSendReaction = (emoji) => {
    reactionIdRef.current += 1
    const nextId = reactionIdRef.current
    const positions = [25, 38, 50, 62, 75, 42, 58, 30, 70]
    const leftPos = positions[nextId % positions.length]
    const newReaction = {
      id: nextId,
      emoji,
      left: leftPos
    }
    setReactions(prev => [...prev, newReaction])
    setTimeout(() => {
      setReactions(prev => prev.filter(r => r.id !== nextId))
    }, 2000)
  }

  const handleSetReminder = (sessionTitle) => {
    setReminderToast(`Reminder set for "${sessionTitle}"!`)
    setTimeout(() => setReminderToast(null), 3500)
  }

  return (
    <div className="live-view" id="live-view-root">
      {/* ── Live Radio Hero Lounge ── */}
      <div className="live-view__hero" style={{ background: activeStation.gradient }}>
        <div className="live-view__hero-overlay" />
        <div className="live-view__hero-content">
          <div className="live-view__live-badge">
            <span className="live-view__live-dot" />
            <span>24/7 LIVE STREAM</span>
          </div>

          <h1 className="live-view__hero-title">{activeStation.name}</h1>
          <p className="live-view__hero-tagline">{activeStation.tagline}</p>

          <div className="live-view__hero-stats">
            <div className="live-view__stat-item">
              <i className="fa-solid fa-users" />
              <span>{(listenerCounts[activeStation.id] || activeStation.listeners).toLocaleString()} Listening Now</span>
            </div>
            <div className="live-view__stat-divider" />
            <div className="live-view__stat-item">
              <i className="fa-solid fa-headset" />
              <span>Host: {activeStation.host}</span>
            </div>
            <div className="live-view__stat-divider" />
            <div className="live-view__stat-item">
              <i className="fa-solid fa-compact-disc" />
              <span>{activeStation.genre}</span>
            </div>
          </div>

          <div className="live-view__hero-controls">
            <button 
              className="live-view__tune-in-btn"
              onClick={() => handleTuneIn(activeStation)}
              disabled={loadingStation}
              id="btn-live-tune-in"
            >
              <i className="fa-solid fa-radio" />
              <span>{isPlaying ? 'TUNE IN TO STATION' : 'START LIVE STREAM'}</span>
            </button>

            <div className="live-view__reaction-bar">
              <span className="live-view__reaction-label">Send Vibe:</span>
              <div className="live-view__reaction-buttons">
                {EMOJI_REACTIONS.map(emoji => (
                  <button
                    key={emoji}
                    className="live-view__reaction-btn"
                    onClick={() => handleSendReaction(emoji)}
                    aria-label={`Send ${emoji} reaction`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Floating live reactions */}
        <div className="live-view__floating-reactions">
          {reactions.map(r => (
            <span
              key={r.id}
              className="live-view__floating-emoji"
              style={{ left: `${r.left}%` }}
            >
              {r.emoji}
            </span>
          ))}
        </div>
      </div>

      {/* ── Stations Grid ── */}
      <section className="live-view__section">
        <div className="live-view__section-header">
          <div>
            <h2>Live Radio Stations</h2>
            <p className="live-view__section-subtitle">24/7 curated non-stop music broadcasts with live listener communities</p>
          </div>
          <span className="live-view__live-ticker">
            <span className="live-view__live-dot" /> 6 Stations Online
          </span>
        </div>

        <div className="live-view__stations-grid">
          {LIVE_STATIONS.map(station => {
            const isSelected = activeStation.id === station.id
            const currentCount = listenerCounts[station.id] || station.listeners

            return (
              <div
                key={station.id}
                className={`live-view__station-card ${isSelected ? 'live-view__station-card--active' : ''}`}
                onClick={() => handleTuneIn(station)}
                id={`station-card-${station.id}`}
                role="button"
                tabIndex={0}
              >
                <div className="live-view__station-card-top" style={{ background: station.gradient }}>
                  <div className="live-view__station-badge">{station.badge}</div>
                  <div className="live-view__station-icon">
                    <i className={`fa-solid ${station.icon}`} />
                  </div>
                  {isSelected && isPlaying && (
                    <div className="live-view__station-visualizer">
                      <span /><span /><span /><span />
                    </div>
                  )}
                </div>

                <div className="live-view__station-card-body">
                  <div className="live-view__station-card-header">
                    <h3 className="live-view__station-name">{station.name}</h3>
                    <div className="live-view__station-listeners">
                      <i className="fa-solid fa-user" />
                      <span>{currentCount.toLocaleString()}</span>
                    </div>
                  </div>
                  <p className="live-view__station-tagline">{station.tagline}</p>
                  
                  <div className="live-view__station-footer">
                    <span className="live-view__station-host">
                      <i className="fa-solid fa-microphone-lines" /> {station.host}
                    </span>
                    <button className="live-view__station-play-btn">
                      <i className="fa-solid fa-play" /> Tune In
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── Scheduled Live Broadcasts ── */}
      <section className="live-view__section">
        <div className="live-view__section-header">
          <div>
            <h2>Upcoming Live Sessions</h2>
            <p className="live-view__section-subtitle">Live DJ sets, guest artist takeovers, and acoustic premieres</p>
          </div>
        </div>

        <div className="live-view__schedule-list">
          {UPCOMING_SCHEDULE.map(item => (
            <div key={item.id} className="live-view__schedule-card">
              <div className="live-view__schedule-time-box">
                <span className="live-view__schedule-date">{item.date}</span>
                <span className="live-view__schedule-time">{item.time}</span>
              </div>

              <div className="live-view__schedule-info">
                <span className="live-view__schedule-station">{item.station}</span>
                <h4 className="live-view__schedule-title">{item.title}</h4>
                <span className="live-view__schedule-artist">Featuring {item.artist}</span>
              </div>

              <button 
                className="live-view__reminder-btn"
                onClick={() => handleSetReminder(item.title)}
                id={`btn-remind-${item.id}`}
              >
                <i className="fa-regular fa-bell" />
                <span>Remind Me</span>
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Toast notification */}
      {reminderToast && (
        <div className="live-view__toast" role="alert">
          <i className="fa-solid fa-check-circle" />
          <span>{reminderToast}</span>
        </div>
      )}
    </div>
  )
}

export default LiveView
