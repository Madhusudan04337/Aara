import express from 'express';
import { searchJamendoTracks, getJamendoTrackById } from '../services/jamendo.service.js';

const router = express.Router();

// Memory Cache object
const searchCache = new Map();
const CACHE_TTL = 300 * 1000; // 5 minutes

// GET /api/v1/music/search?q=query&limit=20&page=1
router.get('/search', async (req, res) => {
  try {
    const query = req.query.q?.trim() || req.query.query?.trim() || '';
    const limit = Math.min(Number(req.query.limit) || 20, 50);
    const page = Number(req.query.page) || 1;
    const offset = (page - 1) * limit;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query parameter q is required',
      });
    }

    const cacheKey = `${query}:${limit}:${offset}`;
    const cached = searchCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return res.json({
        success: true,
        data: cached.data,
        meta: { page, limit, cached: true },
      });
    }

    const tracks = await searchJamendoTracks(query, limit, offset);
    
    // Store in cache
    searchCache.set(cacheKey, { timestamp: Date.now(), data: tracks });

    res.json({
      success: true,
      data: tracks,
      meta: { page, limit, count: tracks.length },
    });
  } catch (error) {
    console.error('Jamendo Search Error:', error.message);
    res.status(502).json({
      success: false,
      message: 'Unable to fetch music from Jamendo API',
      error: error.message,
    });
  }
});

// GET /api/v1/music/tracks/:id
router.get('/tracks/:id', async (req, res) => {
  try {
    const track = await getJamendoTrackById(req.params.id);
    if (!track) {
      return res.status(404).json({ success: false, message: 'Track not found' });
    }
    res.json({ success: true, data: track });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
