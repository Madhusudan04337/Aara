import express from 'express';
import mongoose from 'mongoose';
import { Playlist } from '../models/Playlist.js';
import { getUserIdFromReq } from './authRoutes.js';

const router = express.Router();
const fallbackPlaylists = new Map();

// Helper to query MongoDB matching userId as ObjectId or string
const getMongoUserQuery = (userId) => {
  if (mongoose.Types.ObjectId.isValid(userId)) {
    return { $in: [userId, new mongoose.Types.ObjectId(userId)] };
  }
  return userId;
};

// GET /api/v1/playlists
router.get('/', async (req, res) => {
  const userId = getUserIdFromReq(req);
  if (!userId) {
    return res.json({ success: true, data: [] });
  }

  try {
    if (mongoose.connection.readyState === 1) {
      const playlists = await Playlist.find({ userId: getMongoUserQuery(userId) }).sort({ updatedAt: -1 });
      return res.json({ success: true, data: playlists });
    }
  } catch (error) {
    console.warn('MongoDB playlist get failed, using memory:', error.message);
  }

  const userPlaylists = Array.from(fallbackPlaylists.values()).filter(
    (p) => String(p.userId) === String(userId)
  );
  res.json({ success: true, data: userPlaylists });
});

// POST /api/v1/playlists
router.post('/', async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required to create a playlist' });
    }

    const { name, description, artworkUrl } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Playlist name is required' });
    }

    if (mongoose.connection.readyState === 1) {
      const playlist = new Playlist({
        userId,
        name: name.trim(),
        description: description || '',
        artworkUrl: artworkUrl || ''
      });
      await playlist.save();
      return res.status(201).json({ success: true, data: playlist });
    }

    const playlistId = `pl_${Date.now()}`;
    const playlistObj = {
      _id: playlistId,
      userId,
      name: name.trim(),
      description: description || '',
      artworkUrl: artworkUrl || '',
      tracks: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    fallbackPlaylists.set(playlistId, playlistObj);
    res.status(201).json({ success: true, data: playlistObj });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/v1/playlists/:playlistId
router.get('/:playlistId', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const playlist = await Playlist.findById(req.params.playlistId);
      if (playlist) {
        return res.json({ success: true, data: playlist });
      }
    }

    const playlist = fallbackPlaylists.get(req.params.playlistId);
    if (playlist) {
      return res.json({ success: true, data: playlist });
    }
    return res.status(404).json({ success: false, message: 'Playlist not found' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/v1/playlists/:playlistId
router.patch('/:playlistId', async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const { name, description, artworkUrl } = req.body;
    if (mongoose.connection.readyState === 1) {
      const playlist = await Playlist.findOneAndUpdate(
        { _id: req.params.playlistId, userId: getMongoUserQuery(userId) },
        { 
          ...(name ? { name: name.trim() } : {}),
          ...(description !== undefined ? { description } : {}),
          ...(artworkUrl !== undefined ? { artworkUrl } : {})
        },
        { new: true }
      );
      if (!playlist) {
        return res.status(404).json({ success: false, message: 'Playlist not found' });
      }
      return res.json({ success: true, data: playlist });
    }

    const playlist = fallbackPlaylists.get(req.params.playlistId);
    if (!playlist || String(playlist.userId) !== String(userId)) {
      return res.status(404).json({ success: false, message: 'Playlist not found' });
    }
    if (name) playlist.name = name.trim();
    if (description !== undefined) playlist.description = description;
    if (artworkUrl !== undefined) playlist.artworkUrl = artworkUrl;
    playlist.updatedAt = new Date();
    res.json({ success: true, data: playlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/v1/playlists/:playlistId
router.delete('/:playlistId', async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    if (mongoose.connection.readyState === 1) {
      const result = await Playlist.deleteOne({ _id: req.params.playlistId, userId: getMongoUserQuery(userId) });
      if (result.deletedCount === 0) {
        return res.status(404).json({ success: false, message: 'Playlist not found' });
      }
      return res.json({ success: true, message: 'Playlist deleted successfully' });
    }

    const playlist = fallbackPlaylists.get(req.params.playlistId);
    if (!playlist || String(playlist.userId) !== String(userId)) {
      return res.status(404).json({ success: false, message: 'Playlist not found' });
    }
    fallbackPlaylists.delete(req.params.playlistId);
    res.json({ success: true, message: 'Playlist deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/v1/playlists/:playlistId/tracks
router.post('/:playlistId/tracks', async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const { track } = req.body;
    if (!track) {
      return res.status(400).json({ success: false, message: 'Track details are required' });
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
      const playlist = await Playlist.findOne({ _id: req.params.playlistId, userId: getMongoUserQuery(userId) });
      if (!playlist) {
        return res.status(404).json({ success: false, message: 'Playlist not found' });
      }
      playlist.tracks.push({ track: trackSnapshot, addedAt: new Date() });
      await playlist.save();
      return res.json({ success: true, data: playlist });
    }

    const playlist = fallbackPlaylists.get(req.params.playlistId);
    if (!playlist || String(playlist.userId) !== String(userId)) {
      return res.status(404).json({ success: false, message: 'Playlist not found' });
    }
    playlist.tracks.push({ track: trackSnapshot, addedAt: new Date() });
    playlist.updatedAt = new Date();
    res.json({ success: true, data: playlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/v1/playlists/:playlistId/tracks/:trackId
router.delete('/:playlistId/tracks/:trackId', async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    if (mongoose.connection.readyState === 1) {
      const playlist = await Playlist.findOne({ _id: req.params.playlistId, userId: getMongoUserQuery(userId) });
      if (!playlist) {
        return res.status(404).json({ success: false, message: 'Playlist not found' });
      }
      playlist.tracks = playlist.tracks.filter(
        (item) => item.track.jamendoTrackId !== req.params.trackId
      );
      await playlist.save();
      return res.json({ success: true, data: playlist });
    }

    const playlist = fallbackPlaylists.get(req.params.playlistId);
    if (!playlist || String(playlist.userId) !== String(userId)) {
      return res.status(404).json({ success: false, message: 'Playlist not found' });
    }
    playlist.tracks = playlist.tracks.filter(
      (item) => item.track.jamendoTrackId !== req.params.trackId
    );
    playlist.updatedAt = new Date();
    res.json({ success: true, data: playlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
