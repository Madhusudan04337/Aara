import express from 'express';
import mongoose from 'mongoose';
import { Favorite } from '../models/Favorite.js';
import { getUserIdFromReq } from './authRoutes.js';

const router = express.Router();
const fallbackFavorites = new Map();

// Helper to query MongoDB matching userId as ObjectId or string
const getMongoUserQuery = (userId) => {
  if (mongoose.Types.ObjectId.isValid(userId)) {
    return { $in: [userId, new mongoose.Types.ObjectId(userId)] };
  }
  return userId;
};

// GET /api/v1/favorites
router.get('/', async (req, res) => {
  const userId = getUserIdFromReq(req);
  if (!userId) {
    return res.json({ success: true, data: [] });
  }

  try {
    if (mongoose.connection.readyState === 1) {
      const favorites = await Favorite.find({ userId: getMongoUserQuery(userId) }).sort({ createdAt: -1 });
      return res.json({ success: true, data: favorites });
    }
  } catch (error) {
    console.warn('MongoDB favorites get failed, using memory:', error.message);
  }

  const userFavorites = Array.from(fallbackFavorites.values()).filter(
    (f) => String(f.userId) === String(userId)
  );
  res.json({ success: true, data: userFavorites });
});

// POST /api/v1/favorites
router.post('/', async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required to save favorites' });
    }

    const { track } = req.body;
    if (!track || (!track.jamendoTrackId && !track.id)) {
      return res.status(400).json({ success: false, message: 'Valid track details are required' });
    }

    const jamendoTrackId = String(track.jamendoTrackId || track.id);
    const trackSnapshot = {
      jamendoTrackId,
      title: track.title || track.name || 'Unknown Track',
      artistName: track.artistName || track.artist_name || track.artist || 'Unknown Artist',
      artist: track.artist || track.artistName || track.artist_name || 'Unknown Artist',
      artworkUrl: track.artworkUrl || track.album_image || track.imageUrl || track.image || '',
      audioUrl: track.audioUrl || track.audio || '',
      licenseUrl: track.licenseUrl || track.license_ccurl || '',
      duration: typeof track.duration === 'number' ? track.duration : 0,
      source: 'jamendo'
    };

    if (mongoose.connection.readyState === 1) {
      const favorite = await Favorite.findOneAndUpdate(
        { userId: getMongoUserQuery(userId), 'track.jamendoTrackId': jamendoTrackId },
        { userId, track: trackSnapshot },
        { upsert: true, new: true }
      );
      return res.status(201).json({ success: true, data: favorite });
    }

    const favKey = `${userId}_${jamendoTrackId}`;
    const favObj = { _id: `fav_${jamendoTrackId}`, userId, track: trackSnapshot, createdAt: new Date() };
    fallbackFavorites.set(favKey, favObj);
    res.status(201).json({ success: true, data: favObj });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/v1/favorites/:trackId
router.delete('/:trackId', async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    if (mongoose.connection.readyState === 1) {
      await Favorite.deleteOne({ userId: getMongoUserQuery(userId), 'track.jamendoTrackId': req.params.trackId });
      return res.json({ success: true, message: 'Favorite removed successfully' });
    }

    const favKey = `${userId}_${req.params.trackId}`;
    fallbackFavorites.delete(favKey);
    res.json({ success: true, message: 'Favorite removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
