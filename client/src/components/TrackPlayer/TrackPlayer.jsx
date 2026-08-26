function TrackPlayer({ track }) {
  if (!track) {
    return <p className="track-player-empty">Select a track to play.</p>;
  }

  return (
    <div className="track-player-container">
      {track.album_image && (
        <img
          src={track.album_image}
          alt={`${track.name} album artwork`}
          width="180"
          className="track-player-img"
        />
      )}

      <div className="track-player-info">
        <h2 className="track-player-title">{track.name}</h2>
        <p className="track-player-artist">{track.artist_name}</p>

        {track.audio ? (
          <audio controls autoPlay key={track.audio} preload="metadata" className="track-player-audio">
            <source src={track.audio} type="audio/mpeg" />
            Your browser does not support audio playback.
          </audio>
        ) : (
          <p className="track-player-unavailable">Audio is unavailable for this track.</p>
        )}

        {track.license_ccurl && (
          <a
            href={track.license_ccurl}
            target="_blank"
            rel="noreferrer"
            className="track-player-license"
          >
            View track license
          </a>
        )}
      </div>
    </div>
  );
}

export default TrackPlayer;
