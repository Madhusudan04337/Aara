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
    id: 1895632,
    jamendoTrackId: '1895632',
    name: 'Summer Breeze Beats',
    title: 'Summer Breeze Beats',
    artist_name: 'Pritam, Arijit',
    artistName: 'Pritam, Arijit',
    album_name: 'Summer Vibes',
    album_image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&auto=format&fit=crop&q=60',
    artworkUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&auto=format&fit=crop&q=60',
    audio: 'https://prod-1.storage.jamendo.com/?trackid=1895632&format=mp31&from=app-dev',
    audioUrl: 'https://prod-1.storage.jamendo.com/?trackid=1895632&format=mp31&from=app-dev',
    license_ccurl: 'https://creativecommons.org/licenses/by-nc-sa/3.0/',
    licenseUrl: 'https://creativecommons.org/licenses/by-nc-sa/3.0/',
    duration: 204,
    shareurl: 'https://www.jamendo.com/track/1895632',
    source: 'jamendo'
  },
  {
    id: 1891234,
    jamendoTrackId: '1891234',
    name: 'Midnight Groove',
    title: 'Midnight Groove',
    artist_name: 'A.R. Rahman, Shreya',
    artistName: 'A.R. Rahman, Shreya',
    album_name: 'Mystic Night',
    album_image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&auto=format&fit=crop&q=60',
    artworkUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&auto=format&fit=crop&q=60',
    audio: 'https://prod-1.storage.jamendo.com/?trackid=1891234&format=mp31&from=app-dev',
    audioUrl: 'https://prod-1.storage.jamendo.com/?trackid=1891234&format=mp31&from=app-dev',
    license_ccurl: 'https://creativecommons.org/licenses/by-nc-sa/3.0/',
    licenseUrl: 'https://creativecommons.org/licenses/by-nc-sa/3.0/',
    duration: 232,
    shareurl: 'https://www.jamendo.com/track/1891234',
    source: 'jamendo'
  },
  {
    id: 1875522,
    jamendoTrackId: '1875522',
    name: 'Electric Horizon',
    title: 'Electric Horizon',
    artist_name: 'Vishal-Shekhar, Badshah',
    artistName: 'Vishal-Shekhar, Badshah',
    album_name: 'Velocity Nights',
    album_image: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=500&auto=format&fit=crop&q=60',
    artworkUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=500&auto=format&fit=crop&q=60',
    audio: 'https://prod-1.storage.jamendo.com/?trackid=1875522&format=mp31&from=app-dev',
    audioUrl: 'https://prod-1.storage.jamendo.com/?trackid=1875522&format=mp31&from=app-dev',
    license_ccurl: 'https://creativecommons.org/licenses/by-nc-sa/3.0/',
    licenseUrl: 'https://creativecommons.org/licenses/by-nc-sa/3.0/',
    duration: 188,
    shareurl: 'https://www.jamendo.com/track/1875522',
    source: 'jamendo'
  },
  {
    id: 1845120,
    jamendoTrackId: '1845120',
    name: 'Lo-Fi Chill Hop',
    title: 'Lo-Fi Chill Hop',
    artist_name: 'Anuv Jain',
    artistName: 'Anuv Jain',
    album_name: 'Bedroom Stories',
    album_image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=500&auto=format&fit=crop&q=60',
    artworkUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=500&auto=format&fit=crop&q=60',
    audio: 'https://prod-1.storage.jamendo.com/?trackid=1845120&format=mp31&from=app-dev',
    audioUrl: 'https://prod-1.storage.jamendo.com/?trackid=1845120&format=mp31&from=app-dev',
    license_ccurl: 'https://creativecommons.org/licenses/by-nc-sa/3.0/',
    licenseUrl: 'https://creativecommons.org/licenses/by-nc-sa/3.0/',
    duration: 178,
    shareurl: 'https://www.jamendo.com/track/1845120',
    source: 'jamendo'
  },
  {
    id: 1832100,
    jamendoTrackId: '1832100',
    name: 'Classical Symphony',
    title: 'Classical Symphony',
    artist_name: 'Udit Narayan, Alka',
    artistName: 'Udit Narayan, Alka',
    album_name: 'Timeless Melodies',
    album_image: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=500&auto=format&fit=crop&q=60',
    artworkUrl: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=500&auto=format&fit=crop&q=60',
    audio: 'https://prod-1.storage.jamendo.com/?trackid=1832100&format=mp31&from=app-dev',
    audioUrl: 'https://prod-1.storage.jamendo.com/?trackid=1832100&format=mp31&from=app-dev',
    license_ccurl: 'https://creativecommons.org/licenses/by-nc-sa/3.0/',
    licenseUrl: 'https://creativecommons.org/licenses/by-nc-sa/3.0/',
    duration: 250,
    shareurl: 'https://www.jamendo.com/track/1832100',
    source: 'jamendo'
  },
  {
    id: 1821050,
    jamendoTrackId: '1821050',
    name: 'Neon Dreams',
    title: 'Neon Dreams',
    artist_name: 'Jasleen Royal',
    artistName: 'Jasleen Royal',
    album_name: 'Synth Magic',
    album_image: 'https://images.unsplash.com/photo-1485579149621-3123dd979885?w=500&auto=format&fit=crop&q=60',
    artworkUrl: 'https://images.unsplash.com/photo-1485579149621-3123dd979885?w=500&auto=format&fit=crop&q=60',
    audio: 'https://prod-1.storage.jamendo.com/?trackid=1821050&format=mp31&from=app-dev',
    audioUrl: 'https://prod-1.storage.jamendo.com/?trackid=1821050&format=mp31&from=app-dev',
    license_ccurl: 'https://creativecommons.org/licenses/by-nc-sa/3.0/',
    licenseUrl: 'https://creativecommons.org/licenses/by-nc-sa/3.0/',
    duration: 202,
    shareurl: 'https://www.jamendo.com/track/1821050',
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

export const searchJamendoArtists = async (query = '', limit = 20, offset = 0) => {
  const clientId = process.env.JAMENDO_CLIENT_ID;
  if (clientId) {
    try {
      const response = await axios.get(`${JAMENDO_API_URL}/artists/`, {
        params: {
          client_id: clientId,
          format: 'json',
          namesearch: query || undefined,
          order: 'popularity_total',
          limit,
          offset,
          hasimage: true
        },
        timeout: 5000
      });

      if (response.data?.headers?.status === 'success' && response.data.results?.length > 0) {
        return response.data.results.map(artist => ({
          id: artist.id,
          name: artist.name,
          role: 'Artist',
          image: artist.image || `https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=60`,
          website: artist.website,
          joindate: artist.joindate,
          shareurl: artist.shareurl
        }));
      }
    } catch (err) {
      console.warn('Jamendo API artists search failed, using fallback artists:', err.message);
    }
  }

  // Fallback artist search / pagination
  const fallbackArtistsList = [
    { id: 1, name: 'Pritam', role: 'Artist', image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=60' },
    { id: 2, name: 'A.R. Rahman', role: 'Artist', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=60' },
    { id: 3, name: 'Arijit Singh', role: 'Artist', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&auto=format&fit=crop&q=60' },
    { id: 4, name: 'Sachin-Jigar', role: 'Artist', image: 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=500&auto=format&fit=crop&q=60' },
    { id: 5, name: 'Vishal-Shekhar', role: 'Artist', image: 'https://images.unsplash.com/photo-1445985543470-41f30c31f81d?w=500&auto=format&fit=crop&q=60' },
    { id: 6, name: 'Atif Aslam', role: 'Artist', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=60' },
    { id: 7, name: 'Badshah', role: 'Artist', image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500&auto=format&fit=crop&q=60' },
    { id: 8, name: 'Anirudh Ravichander', role: 'Artist', image: 'https://images.unsplash.com/photo-1485579149621-3123dd979885?w=500&auto=format&fit=crop&q=60' },
    { id: 9, name: 'Vishal Mishra', role: 'Artist', image: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=500&auto=format&fit=crop&q=60' },
    { id: 10, name: 'Udit Narayan', role: 'Artist', image: 'https://images.unsplash.com/photo-1520523839898-507127043814?w=500&auto=format&fit=crop&q=60' },
    { id: 11, name: 'Yo Yo Honey Singh', role: 'Artist', image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=60' },
    { id: 12, name: 'Shankar-Ehsaan-Loy', role: 'Artist', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=60' },
    { id: 13, name: 'Shreya Ghoshal', role: 'Artist', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&auto=format&fit=crop&q=60' },
    { id: 14, name: 'Jasleen Royal', role: 'Artist', image: 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=500&auto=format&fit=crop&q=60' },
    { id: 15, name: 'Amit Trivedi', role: 'Artist', image: 'https://images.unsplash.com/photo-1445985543470-41f30c31f81d?w=500&auto=format&fit=crop&q=60' },
    { id: 16, name: 'Sachet Tandon', role: 'Artist', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=60' },
    { id: 17, name: 'Alka Yagnik', role: 'Artist', image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500&auto=format&fit=crop&q=60' },
    { id: 18, name: 'Himesh Reshammiya', role: 'Artist', image: 'https://images.unsplash.com/photo-1485579149621-3123dd979885?w=500&auto=format&fit=crop&q=60' },
    { id: 19, name: 'Anuv Jain', role: 'Artist', image: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=500&auto=format&fit=crop&q=60' },
  ];

  if (query) {
    const q = query.toLowerCase();
    const filtered = fallbackArtistsList.filter(a => a.name.toLowerCase().includes(q));
    return filtered.slice(offset, offset + limit);
  }

  return fallbackArtistsList.slice(offset, offset + limit);
};
