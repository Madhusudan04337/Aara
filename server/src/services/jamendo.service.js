import axios from 'axios';

const JAMENDO_API_URL = 'https://api.jamendo.com/v3.0';

export const searchJamendoTracks = async (query, limit = 20, offset = 0) => {
  const clientId = process.env.JAMENDO_CLIENT_ID;
  const response = await axios.get(`${JAMENDO_API_URL}/tracks/`, {
    params: {
      client_id: clientId,
      format: 'json',
      search: query,
      limit,
      offset,
      include: 'licenses'
    },
    timeout: 10000
  });

  if (response.data?.headers?.status === 'success') {
    return response.data.results.map(track => ({
      id: track.id,
      jamendoTrackId: String(track.id),
      name: track.name,
      title: track.name,
      artist_name: track.artist_name,
      artistName: track.artist_name,
      album_name: track.album_name,
      album_image: track.album_image || track.image,
      artworkUrl: track.album_image || track.image,
      audio: track.audio,
      audioUrl: track.audio,
      license_ccurl: track.license_ccurl || 'https://creativecommons.org/licenses/by-nc-sa/3.0/',
      licenseUrl: track.license_ccurl || 'https://creativecommons.org/licenses/by-nc-sa/3.0/',
      duration: track.duration,
      shareurl: track.shareurl,
      source: 'jamendo'
    }));
  }
  
  throw new Error(response.data?.headers?.error_message || 'Jamendo API call failed');
};

export const getJamendoTrackById = async (trackId) => {
  const clientId = process.env.JAMENDO_CLIENT_ID;
  const response = await axios.get(`${JAMENDO_API_URL}/tracks/`, {
    params: {
      client_id: clientId,
      format: 'json',
      id: trackId,
      include: 'licenses'
    },
    timeout: 10000
  });

  if (response.data?.headers?.status === 'success' && response.data.results.length > 0) {
    const track = response.data.results[0];
    return {
      id: track.id,
      jamendoTrackId: String(track.id),
      name: track.name,
      title: track.name,
      artist_name: track.artist_name,
      artistName: track.artist_name,
      album_name: track.album_name,
      album_image: track.album_image || track.image,
      artworkUrl: track.album_image || track.image,
      audio: track.audio,
      audioUrl: track.audio,
      license_ccurl: track.license_ccurl || 'https://creativecommons.org/licenses/by-nc-sa/3.0/',
      licenseUrl: track.license_ccurl || 'https://creativecommons.org/licenses/by-nc-sa/3.0/',
      duration: track.duration,
      shareurl: track.shareurl,
      source: 'jamendo'
    };
  }
  
  return null;
};

export const getTrendingJamendoTracks = async (limit = 20, offset = 0) => {
  const clientId = process.env.JAMENDO_CLIENT_ID;
  const response = await axios.get(`${JAMENDO_API_URL}/tracks/`, {
    params: {
      client_id: clientId,
      format: 'json',
      order: 'popularity_week',
      limit,
      offset,
      include: 'licenses'
    },
    timeout: 10000
  });

  if (response.data?.headers?.status === 'success') {
    return response.data.results.map(track => ({
      id: track.id,
      jamendoTrackId: String(track.id),
      name: track.name,
      title: track.name,
      artist_name: track.artist_name,
      artistName: track.artist_name,
      album_name: track.album_name,
      album_image: track.album_image || track.image,
      artworkUrl: track.album_image || track.image,
      audio: track.audio,
      audioUrl: track.audio,
      license_ccurl: track.license_ccurl || 'https://creativecommons.org/licenses/by-nc-sa/3.0/',
      licenseUrl: track.license_ccurl || 'https://creativecommons.org/licenses/by-nc-sa/3.0/',
      duration: track.duration,
      shareurl: track.shareurl,
      source: 'jamendo'
    }));
  }
  
  throw new Error(response.data?.headers?.error_message || 'Jamendo API call failed');
};
