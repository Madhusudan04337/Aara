import express from 'express'
import { Song } from '../models/Song.js'
import { uploadSongFiles, cloudinary } from '../config/cloudinary.js'

const router = express.Router()

// GET /api/songs - Fetch all songs (with fallback if DB connection fails)
router.get('/', async (req, res) => {
  try {
    const songs = await Song.find().sort({ createdAt: -1 })
    res.status(200).json({ success: true, count: songs.length, data: songs })
  } catch (error) {
    console.error('Database query error:', error.message)
    // Return empty array gracefully instead of 500 server crash
    res.status(200).json({
      success: true,
      count: 0,
      data: [],
      warning: 'Database connection offline or unreachable. Please check internet connection & MongoDB URI.',
    })
  }
})

// POST /api/songs - Upload image & audio files to Cloudinary and save details to MongoDB
router.post('/', uploadSongFiles, async (req, res) => {
  try {
    const { title, artist, category } = req.body

    if (!title || !artist) {
      return res.status(400).json({ success: false, error: 'Title and artist are required' })
    }

    const imageFile = req.files?.image ? req.files.image[0] : null
    const audioFile = req.files?.audio ? req.files.audio[0] : null

    if (!imageFile) {
      return res.status(400).json({ success: false, error: 'Image file is required' })
    }

    const song = new Song({
      title,
      artist,
      category: category || 'trending-songs',
      imageUrl: imageFile.path,
      imagePublicId: imageFile.filename,
      audioUrl: audioFile ? audioFile.path : '',
      audioPublicId: audioFile ? audioFile.filename : '',
    })

    await song.save()

    res.status(201).json({ success: true, data: song })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// DELETE /api/songs/:id - Delete song metadata & Cloudinary assets
router.delete('/:id', async (req, res) => {
  try {
    const song = await Song.findById(req.params.id)
    if (!song) {
      return res.status(404).json({ success: false, error: 'Song not found' })
    }

    if (song.imagePublicId) {
      await cloudinary.uploader.destroy(song.imagePublicId)
    }

    if (song.audioPublicId) {
      await cloudinary.uploader.destroy(song.audioPublicId, { resource_type: 'video' })
    }

    await song.deleteOne()

    res.status(200).json({ success: true, message: 'Song deleted successfully' })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

export default router
