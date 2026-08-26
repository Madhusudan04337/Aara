import express from 'express';
import { Playlist } from '../models/Playlist.js';

const router = express.Router();
const MOCK_USER_ID = '60d0fe4f5311236168a109ca';

// GET /api/v1/playlists
router.get('/', async (req, res) => {
  try {
    const playlists = await Playlist.find({ userId: MOCK_USER_ID }).sort({ updatedAt: -1 });
    res.json({ success: true, data: playlists });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/v1/playlists
router.post('/', async (req, res) => {
  try {
    const { name, description, artworkUrl } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Playlist name is required' });
    }
    const playlist = new Playlist({
      userId: MOCK_USER_ID,
      name,
      description,
      artworkUrl
    });
    await playlist.save();
    res.status(201).json({ success: true, data: playlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/v1/playlists/:playlistId - Rename playlist
router.patch('/:playlistId', async (req, res) => {
  try {
    const { name, description } = req.body;
    const playlist = await Playlist.findOneAndUpdate(
      { _id: req.params.playlistId, userId: MOCK_USER_ID },
      { name, description },
      { new: true }
    );
    if (!playlist) {
      return res.status(404).json({ success: false, message: 'Playlist not found' });
    }
    res.json({ success: true, data: playlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/v1/playlists/:playlistId - Delete playlist
router.delete('/:playlistId', async (req, res) => {
  try {
    const result = await Playlist.deleteOne({ _id: req.params.playlistId, userId: MOCK_USER_ID });
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'Playlist not found' });
    }
    res.json({ success: true, message: 'Playlist deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/v1/playlists/:playlistId/tracks - Add track
router.post('/:playlistId/tracks', async (req, res) => {
  try {
    const { track } = req.body;
    const playlist = await Playlist.findOne({ _id: req.params.playlistId, userId: MOCK_USER_ID });
    if (!playlist) {
      return res.status(404).json({ success: false, message: 'Playlist not found' });
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

    playlist.tracks.push({ track: trackSnapshot });
    await playlist.save();

    res.json({ success: true, data: playlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/v1/playlists/:playlistId/tracks/:trackId - Remove track from playlist
router.delete('/:playlistId/tracks/:trackId', async (req, res) => {
  try {
    const playlist = await Playlist.findOne({ _id: req.params.playlistId, userId: MOCK_USER_ID });
    if (!playlist) {
      return res.status(404).json({ success: false, message: 'Playlist not found' });
    }

    playlist.tracks = playlist.tracks.filter(
      (item) => item.track.jamendoTrackId !== req.params.trackId
    );
    await playlist.save();

    res.json({ success: true, data: playlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
