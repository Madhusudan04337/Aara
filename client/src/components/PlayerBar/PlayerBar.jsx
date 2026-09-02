import { useNavigate } from 'react-router-dom'
import { usePlayer } from '../../context/usePlayer'
import TrackPlayer from '../TrackPlayer/TrackPlayer'
import './PlayerBar.css'

const PlayerBar = () => {
  const navigate = useNavigate()
  const { currentTrack } = usePlayer()

  return (
    <div className="player-bar" role="contentinfo">
      {currentTrack ? (
        <TrackPlayer />
      ) : (
        <aside>
          <div className="signup-bar">
            <div className="signup-desc">
              <p>Preview of Aara</p>
              <p>Sign up to get unlimited songs and podcasts with occasional ads. No credit card needed.</p>
            </div>
            <button
              className="btn btn--large"
              id="btn-signup-free"
              onClick={() => navigate('/signup')}
            >
              <span>Sign up free</span>
            </button>
          </div>
        </aside>
      )}
    </div>
  )
}

export default PlayerBar
