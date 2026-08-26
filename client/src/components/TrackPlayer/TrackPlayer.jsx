function TrackPlayer({ track }) {
  if (!track) {
    return <p className="track-player-empty">Select a track to play.</p>;
  }

  const trackName = track.name || track.title || 'Unknown Track';
  const artistName = track.artist_name || track.artistName || 'Unknown Artist';
  const albumImage = track.album_image || track.artworkUrl;
  const audioUrl = track.audio || track.audioUrl;
  const licenseUrl = track.license_ccurl || track.licenseUrl;

  return (
    <div className="track-player-container">
      {albumImage && (
        <img
          src={albumImage}
          alt={`${trackName} album artwork`}
          width="180"
          className="track-player-img"
        />
      )}

      <div className="track-player-info">
        <h2 className="track-player-title">Track: {trackName}</h2>
        <p className="track-player-artist">Artist: {artistName}</p>
        <p className="track-player-attribution">Music provided by Jamendo</p>

        {audioUrl ? (
          <audio controls autoPlay key={audioUrl} preload="metadata" className="track-player-audio">
            <source src={audioUrl} type="audio/mpeg" />
            Your browser does not support audio playback.
          </audio>
        ) : (
          <p className="track-player-unavailable">Audio is unavailable for this track.</p>
        )}

        {licenseUrl && (
          <a
            href={licenseUrl}
            target="_blank"
            rel="noreferrer"
            className="track-player-license"
          >
            View license
          </a>
        )}
      </div>
    </div>
  );
}

export default TrackPlayer;
