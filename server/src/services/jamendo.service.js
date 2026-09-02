import axios from 'axios';

const JAMENDO_API_URL = 'https://api.jamendo.com/v3.0';

const sampleTracks = [
  {
    id: 1885448,
    jamendoTrackId: '1885448',
    name: 'Barsaat Ambient Flow',
    title: 'Barsaat Ambient Flow',
    artist_name: 'Banjaare, Roni',
    artistName: 'Banjaare, Roni',
    album_name: 'Monsoon Melodies',
    album_image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=60',
    artworkUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=60',
    audio: 'https://prod-1.storage.jamendo.com/?trackid=1885448&format=mp31&from=app-dev',
    audioUrl: 'https://prod-1.storage.jamendo.com/?trackid=1885448&format=mp31&from=app-dev',
    license_ccurl: 'https://creativecommons.org/licenses/by-nc-sa/3.0/',
    licenseUrl: 'https://creativecommons.org/licenses/by-nc-sa/3.0/',
    duration: 198,
    shareurl: 'https://www.jamendo.com/track/1885448',
    source: 'jamendo'
  },
  {
    id: 1890618,
    jamendoTrackId: '1890618',
    name: 'Kalyani Classical Vibe',
    title: 'Kalyani Classical Vibe',
    artist_name: 'ARJN, Shreya Ghoshal',
    artistName: 'ARJN, Shreya Ghoshal',
    album_name: 'Carnatic Fusion',
    album_image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=60',
    artworkUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=60',
    audio: 'https://prod-1.storage.jamendo.com/?trackid=1890618&format=mp31&from=app-dev',
    audioUrl: 'https://prod-1.storage.jamendo.com/?trackid=1890618&format=mp31&from=app-dev',
    license_ccurl: 'https://creativecommons.org/licenses/by-nc-sa/3.0/',
    licenseUrl: 'https://creativecommons.org/licenses/by-nc-sa/3.0/',
    duration: 215,
    shareurl: 'https://www.jamendo.com/track/1890618',
    source: 'jamendo'
  },
  {
    id: 1910232,
    jamendoTrackId: '1910232',
    name: 'Tera Mera Acoustic Ballad',
    title: 'Tera Mera Acoustic Ballad',
    artist_name: 'Mithoon, Pritam',
    artistName: 'Mithoon, Pritam',
    album_name: 'Film Ballads Live',
    album_image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&auto=format&fit=crop&q=60',
    artworkUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&auto=format&fit=crop&q=60',
    audio: 'https://prod-1.storage.jamendo.com/?trackid=1910232&format=mp31&from=app-dev',
    audioUrl: 'https://prod-1.storage.jamendo.com/?trackid=1910232&format=mp31&from=app-dev',
    license_ccurl: 'https://creativecommons.org/licenses/by-nc-sa/3.0/',
    licenseUrl: 'https://creativecommons.org/licenses/by-nc-sa/3.0/',
    duration: 242,
    shareurl: 'https://www.jamendo.com/track/1910232',
    source: 'jamendo'
  },
  {
    id: 1878341,
    jamendoTrackId: '1878341',
    name: 'Raga of Revenge EDM',
    title: 'Raga of Revenge EDM',
    artist_name: 'Anirudh Ravichander',
    artistName: 'Anirudh Ravichander',
    album_name: 'High Voltage Beats',
    album_image: 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=500&auto=format&fit=crop&q=60',
    artworkUrl: 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=500&auto=format&fit=crop&q=60',
    audio: 'https://prod-1.storage.jamendo.com/?trackid=1878341&format=mp31&from=app-dev',
    audioUrl: 'https://prod-1.storage.jamendo.com/?trackid=1878341&format=mp31&from=app-dev',
    license_ccurl: 'https://creativecommons.org/licenses/by-nc-sa/3.0/',
    licenseUrl: 'https://creativecommons.org/licenses/by-nc-sa/3.0/',
    duration: 180,
    shareurl: 'https://www.jamendo.com/track/1878341',
    source: 'jamendo'
  },
  {
    id: 1886616,
    jamendoTrackId: '1886616',
    name: 'Alaakaa Loova Synthwave',
    title: 'Alaakaa Loova Synthwave',
    artist_name: 'Sai Abhyankkar',
    artistName: 'Sai Abhyankkar',
    album_name: 'Retro Groove Express',
    album_image: 'https://images.unsplash.com/photo-1445985543470-41f30c31f81d?w=500&auto=format&fit=crop&q=60',
    artworkUrl: 'https://images.unsplash.com/photo-1445985543470-41f30c31f81d?w=500&auto=format&fit=crop&q=60',
    audio: 'https://prod-1.storage.jamendo.com/?trackid=1886616&format=mp31&from=app-dev',
    audioUrl: 'https://prod-1.storage.jamendo.com/?trackid=1886616&format=mp31&from=app-dev',
    license_ccurl: 'https://creativecommons.org/licenses/by-nc-sa/3.0/',
    licenseUrl: 'https://creativecommons.org/licenses/by-nc-sa/3.0/',
    duration: 205,
    shareurl: 'https://www.jamendo.com/track/1886616',
    source: 'jamendo'
  },
  {
    id: 1880424,
    jamendoTrackId: '1880424',
    name: 'FINE SHYT (Urban Pop)',
    title: 'FINE SHYT (Urban Pop)',
    artist_name: 'Guru Randhawa',
    artistName: 'Guru Randhawa',
    album_name: 'City Lights',
    album_image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=60',
    artworkUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=60',
    audio: 'https://prod-1.storage.jamendo.com/?trackid=1880424&format=mp31&from=app-dev',
    audioUrl: 'https://prod-1.storage.jamendo.com/?trackid=1880424&format=mp31&from=app-dev',
    license_ccurl: 'https://creativecommons.org/licenses/by-nc-sa/3.0/',
    licenseUrl: 'https://creativecommons.org/licenses/by-nc-sa/3.0/',
    duration: 175,
    shareurl: 'https://www.jamendo.com/track/1880424',
    source: 'jamendo'
  },
  {
    id: 1871239,
    jamendoTrackId: '1871239',
    name: 'Mann Mera Chillout',
    title: 'Mann Mera Chillout',
    artist_name: 'Gajendra Verma',
    artistName: 'Gajendra Verma',
    album_name: 'Sunset Melodies',
    album_image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500&auto=format&fit=crop&q=60',
    artworkUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500&auto=format&fit=crop&q=60',
    audio: 'https://prod-1.storage.jamendo.com/?trackid=1871239&format=mp31&from=app-dev',
    audioUrl: 'https://prod-1.storage.jamendo.com/?trackid=1871239&format=mp31&from=app-dev',
    license_ccurl: 'https://creativecommons.org/licenses/by-nc-sa/3.0/',
    licenseUrl: 'https://creativecommons.org/licenses/by-nc-sa/3.0/',
    duration: 210,
    shareurl: 'https://www.jamendo.com/track/1871239',
    source: 'jamendo'
  },
  {
    id: 1864195,
    jamendoTrackId: '1864195',
    name: 'Tere Naam Classic Strings',
    title: 'Tere Naam Classic Strings',
    artist_name: 'Udit Narayan',
    artistName: 'Udit Narayan',
    album_name: 'Golden Melodies',
    album_image: 'https://images.unsplash.com/photo-1485579149621-3123dd979885?w=500&auto=format&fit=crop&q=60',
    artworkUrl: 'https://images.unsplash.com/photo-1485579149621-3123dd979885?w=500&auto=format&fit=crop&q=60',
    audio: 'https://prod-1.storage.jamendo.com/?trackid=1864195&format=mp31&from=app-dev',
    audioUrl: 'https://prod-1.storage.jamendo.com/?trackid=1864195&format=mp31&from=app-dev',
    license_ccurl: 'https://creativecommons.org/licenses/by-nc-sa/3.0/',
    licenseUrl: 'https://creativecommons.org/licenses/by-nc-sa/3.0/',
    duration: 230,
    shareurl: 'https://www.jamendo.com/track/1864195',
    source: 'jamendo'
  },
  {
    id: 1858342,
    jamendoTrackId: '1858342',
    name: 'Kesariya Sunshine Mix',
    title: 'Kesariya Sunshine Mix',
    artist_name: 'Arijit Singh, Pritam',
    artistName: 'Arijit Singh, Pritam',
    album_name: 'Colors of Love',
    album_image: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=500&auto=format&fit=crop&q=60',
    artworkUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=500&auto=format&fit=crop&q=60',
    audio: 'https://prod-1.storage.jamendo.com/?trackid=1858342&format=mp31&from=app-dev',
    audioUrl: 'https://prod-1.storage.jamendo.com/?trackid=1858342&format=mp31&from=app-dev',
    license_ccurl: 'https://creativecommons.org/licenses/by-nc-sa/3.0/',
    licenseUrl: 'https://creativecommons.org/licenses/by-nc-sa/3.0/',
    duration: 220,
    shareurl: 'https://www.jamendo.com/track/1858342',
    source: 'jamendo'
  },
  {
    id: 1850124,
    jamendoTrackId: '1850124',
    name: 'Raataan Lambiyan Acoustic',
    title: 'Raataan Lambiyan Acoustic',
    artist_name: 'Jubin Nautiyal',
    artistName: 'Jubin Nautiyal',
    album_name: 'Night Serenades',
    album_image: 'https://images.unsplash.com/photo-1520523839898-507127043814?w=500&auto=format&fit=crop&q=60',
    artworkUrl: 'https://images.unsplash.com/photo-1520523839898-507127043814?w=500&auto=format&fit=crop&q=60',
    audio: 'https://prod-1.storage.jamendo.com/?trackid=1850124&format=mp31&from=app-dev',
    audioUrl: 'https://prod-1.storage.jamendo.com/?trackid=1850124&format=mp31&from=app-dev',
    license_ccurl: 'https://creativecommons.org/licenses/by-nc-sa/3.0/',
    licenseUrl: 'https://creativecommons.org/licenses/by-nc-sa/3.0/',
    duration: 195,
    shareurl: 'https://www.jamendo.com/track/1850124',
    source: 'jamendo'
  }
];

export const searchJamendoTracks = async (query, limit = 20, offset = 0) => {
  const clientId = process.env.JAMENDO_CLIENT_ID;
  if (clientId) {
    try {
      const response = await axios.get(`${JAMENDO_API_URL}/tracks/`, {
        params: {
          client_id: clientId,
          format: 'json',
          search: query,
          limit,
          offset,
          include: 'licenses'
        },
        timeout: 5000
      });

      if (response.data?.headers?.status === 'success' && response.data.results?.length > 0) {
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
    } catch (err) {
      console.warn('Jamendo API search failed, using fallback tracks:', err.message);
    }
  }

  // Fallback matching query
  const q = query ? query.toLowerCase() : '';
  const filtered = sampleTracks.filter(t => 
    t.title.toLowerCase().includes(q) ||
    t.artistName.toLowerCase().includes(q) ||
    t.album_name.toLowerCase().includes(q)
  );

  return (filtered.length > 0 ? filtered : sampleTracks).slice(offset, offset + limit);
};

export const getJamendoTrackById = async (trackId) => {
  const clientId = process.env.JAMENDO_CLIENT_ID;
  if (clientId) {
    try {
      const response = await axios.get(`${JAMENDO_API_URL}/tracks/`, {
        params: {
          client_id: clientId,
          format: 'json',
          id: trackId,
          include: 'licenses'
        },
        timeout: 5000
      });

      if (response.data?.headers?.status === 'success' && response.data.results?.length > 0) {
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
    } catch (err) {
      console.warn('Jamendo API getById failed, using fallback:', err.message);
    }
  }

  return sampleTracks.find(t => String(t.id) === String(trackId)) || sampleTracks[0];
};

export const getTrendingJamendoTracks = async (limit = 20, offset = 0) => {
  const clientId = process.env.JAMENDO_CLIENT_ID;
  if (clientId) {
    try {
      const response = await axios.get(`${JAMENDO_API_URL}/tracks/`, {
        params: {
          client_id: clientId,
          format: 'json',
          order: 'popularity_week',
          limit,
          offset,
          include: 'licenses'
        },
        timeout: 5000
      });

      if (response.data?.headers?.status === 'success' && response.data.results?.length > 0) {
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
    } catch (err) {
      console.warn('Jamendo API trending failed, using fallback tracks:', err.message);
    }
  }

  return sampleTracks.slice(offset, offset + limit);
};
