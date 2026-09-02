import express from 'express';
import mongoose from 'mongoose';
import { History } from '../models/History.js';
import { getUserIdFromReq } from './authRoutes.js';

const router = express.Router();
const fallbackHistory = [];

const getMongoUserQuery = (userId) => {
  if (mongoose.Types.ObjectId.isValid(userId)) {
    return { $in: [userId, new mongoose.Types.ObjectId(userId)] };
  }
  return userId;
};

// GET /api/v1/history
router.get('/', async (req, res) => {
  const userId = getUserIdFromReq(req);
  if (!userId) {
    return res.json({ success: true, data: [] });
  }

  try {
    if (mongoose.connection.readyState === 1) {
      const history = await History.find({ userId: getMongoUserQuery(userId) })
        .sort({ playedAt: -1 })
        .limit(50);
      return res.json({ success: true, data: history });
    }
  } catch (error) {
    console.warn('MongoDB history get failed, using memory:', error.message);
  }

  const userHistory = fallbackHistory
    .filter((h) => String(h.userId) === String(userId))
    .slice(0, 50);
  res.json({ success: true, data: userHistory });
});

// POST /api/v1/history
router.post('/', async (req, res) => {
  try {
    const { track } = req.body;
    if (!track) {
      return res.status(400).json({ success: false, message: 'Track metadata is required' });
    }
    const userId = getUserIdFromReq(req);
    if (!userId) {
      // Unauthenticated playback doesn't persist to server history
      return res.json({ success: true, data: null, message: 'Unauthenticated playback' });
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

    if (mongoose.connection.readyState === 1) {
      const entry = new History({ userId, track: trackSnapshot });
      await entry.save();
      return res.status(201).json({ success: true, data: entry });
    }

    const historyObj = { _id: `hist_${Date.now()}`, userId, track: trackSnapshot, playedAt: new Date() };
    fallbackHistory.unshift(historyObj);
    res.status(201).json({ success: true, data: historyObj });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
