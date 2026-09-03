const ARTISTS_API_URL = '/api/v1/music/artists'

export const fallbackArtists = [
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
  { id: 19, name: 'Anuv Jain', role: 'Artist', image: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=500&auto=format&fit=crop&q=60' }
]

export const fetchArtists = async (query = '', page = 1, limit = 20) => {
  try {
    const url = `${ARTISTS_API_URL}?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
    const response = await fetch(url)
    const data = await response.json()

    if (data.success && Array.isArray(data.data)) {
      return {
        artists: data.data,
        hasMore: Boolean(data.meta?.hasMore),
        total: data.meta?.count || data.data.length
      }
    }
  } catch (err) {
    console.warn('Failed to fetch artists from API, using fallback data:', err)
  }

  // Fallback implementation if API request fails or returns unsuccessful status
  let filtered = fallbackArtists
  if (query) {
    const q = query.toLowerCase()
    filtered = fallbackArtists.filter(a => a.name.toLowerCase().includes(q))
  }

  const offset = (page - 1) * limit
  const sliced = filtered.slice(offset, offset + limit)
  return {
    artists: sliced,
    hasMore: offset + limit < filtered.length,
    total: filtered.length
  }
}

export default fallbackArtists
