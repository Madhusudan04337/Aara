import express from 'express';
import { Favorite } from '../models/Favorite.js';

const router = express.Router();

// Temporary mock user ID for testing guest / authenticated favorites without full OAuth
const MOCK_USER_ID = '60d0fe4f5311236168a109ca';

// GET /api/v1/favorites
router.get('/', async (req, res) => {
  try {
    const favorites = await Favorite.find({ userId: MOCK_USER_ID }).sort({ createdAt: -1 });
    res.json({ success: true, data: favorites });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/v1/favorites
router.post('/', async (req, res) => {
  try {
    const { track } = req.body;
    if (!track || (!track.jamendoTrackId && !track.id)) {
      return res.status(400).json({ success: false, message: 'Valid track details are required' });
    }

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

    const favorite = await Favorite.findOneAndUpdate(
      { userId: MOCK_USER_ID, 'track.jamendoTrackId': jamendoTrackId },
      { userId: MOCK_USER_ID, track: trackSnapshot },
      { upsert: true, new: true }
    );

    res.status(201).json({ success: true, data: favorite });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/v1/favorites/:trackId
router.delete('/:trackId', async (req, res) => {
  try {
    await Favorite.deleteOne({ userId: MOCK_USER_ID, 'track.jamendoTrackId': req.params.trackId });
    res.json({ success: true, message: 'Favorite removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
