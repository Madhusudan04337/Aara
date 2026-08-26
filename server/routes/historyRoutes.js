import express from 'express';
import { History } from '../models/History.js';
import { authMiddleware } from './authRoutes.js';

const router = express.Router();
const MOCK_USER_ID = '60d0fe4f5311236168a109ca';

// GET /api/v1/history
router.get('/', async (req, res) => {
  try {
    const userId = req.headers.authorization ? req.user?.userId : MOCK_USER_ID;
    const history = await History.find({ userId: userId || MOCK_USER_ID })
      .sort({ playedAt: -1 })
      .limit(50);
    res.json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/v1/history
router.post('/', async (req, res) => {
  try {
    const { track } = req.body;
    if (!track) {
      return res.status(400).json({ success: false, message: 'Track metadata is required' });
    }
    const userId = req.headers.authorization ? req.user?.userId : MOCK_USER_ID;
    const jamendoTrackId = String(track.jamendoTrackId || track.id);

    const trackSnapshot = {
      jamendoTrackId,
      title: track.title || track.name,
      artistName: track.artistName || track.artist_name,
      artworkUrl: track.artworkUrl || track.album_image,
      audioUrl: track.audioUrl || track.audio,
      licenseUrl: track.licenseUrl || track.license_ccurl,
      source: 'jamendo'
    };

    const entry = new History({ userId: userId || MOCK_USER_ID, track: trackSnapshot });
    await entry.save();

    res.status(201).json({ success: true, data: entry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
