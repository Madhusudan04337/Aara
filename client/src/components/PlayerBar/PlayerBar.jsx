import TrackPlayer from '../TrackPlayer/TrackPlayer'
import '../TrackPlayer/TrackPlayer.css'
import './PlayerBar.css'

const PlayerBar = ({ currentTrack }) => {
  return (
    <div className="player-bar" role="contentinfo">
      {currentTrack ? (
        <TrackPlayer track={currentTrack} />
      ) : (
        <aside>
          <div className="signup-bar">
            <div className="signup-desc">
              <p>Preview of Aara</p>
              <p>Sign up to get unlimited songs and podcasts with occasional ads. No credit card needed.</p>
            </div>
            <button className="btn btn--large" id="btn-signup-free">
              <span>Sign up free</span>
            </button>
          </div>
        </aside>
      )}
    </div>
  )
}

export default PlayerBar
