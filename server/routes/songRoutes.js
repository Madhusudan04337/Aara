import express from 'express'
import mongoose from 'mongoose'
import { Song } from '../models/Song.js'
import { uploadSongFiles, cloudinary } from '../config/cloudinary.js'

const router = express.Router()

const defaultSongs = [
  { _id: 'mock-1', title: 'Barsaat', artist: 'Banjaare, Roni', category: 'trending-songs', categoryIndex: 1, imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=60', audioUrl: 'https://prod-1.storage.jamendo.com/?trackid=1885448&format=mp31&from=app-dev' },
  { _id: 'mock-2', title: 'KALYANI (with Shreya Ghoshal) - Remix', artist: 'ARJN, KDS, FIFTY4, Shreya Ghoshal', category: 'trending-songs', categoryIndex: 1, imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=60', audioUrl: 'https://prod-1.storage.jamendo.com/?trackid=1890618&format=mp31&from=app-dev' },
  { _id: 'mock-3', title: 'Tera Mera Rishta Continues (Film Ballad)', artist: 'Mithoon, Pritam, Mustafa Zahid, Sayeed Quadri', category: 'trending-songs', categoryIndex: 1, imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&auto=format&fit=crop&q=60', audioUrl: 'https://prod-1.storage.jamendo.com/?trackid=1910232&format=mp31&from=app-dev' },
  { _id: 'mock-4', title: 'Raga of Revenge', artist: 'Anirudh Ravichander', category: 'trending-songs', categoryIndex: 1, imageUrl: 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=500&auto=format&fit=crop&q=60', audioUrl: 'https://prod-1.storage.jamendo.com/?trackid=1878341&format=mp31&from=app-dev' },
  { _id: 'mock-5', title: 'Alaakaa Loova (From "OM Chapter 1:..."', artist: 'Sai Abhyankkar, Rokesh', category: 'trending-songs', categoryIndex: 1, imageUrl: 'https://images.unsplash.com/photo-1445985543470-41f30c31f81d?w=500&auto=format&fit=crop&q=60', audioUrl: 'https://prod-1.storage.jamendo.com/?trackid=1886616&format=mp31&from=app-dev' },
  { _id: 'mock-6', title: 'FINE SHYT', artist: 'Guru Randhawa, Yashvi Desai', category: 'trending-songs', categoryIndex: 1, imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=60', audioUrl: 'https://prod-1.storage.jamendo.com/?trackid=1880424&format=mp31&from=app-dev' },
  { _id: 'mock-7', title: 'Mann Mera', artist: 'Gajendra Verma', category: 'trending-songs', categoryIndex: 1, imageUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500&auto=format&fit=crop&q=60', audioUrl: 'https://prod-1.storage.jamendo.com/?trackid=1871239&format=mp31&from=app-dev' },
  { _id: 'mock-8', title: 'Tere Naam', artist: 'Udit Narayan, Salman Khan', category: 'trending-songs', categoryIndex: 1, imageUrl: 'https://images.unsplash.com/photo-1485579149621-3123dd979885?w=500&auto=format&fit=crop&q=60', audioUrl: 'https://prod-1.storage.jamendo.com/?trackid=1864195&format=mp31&from=app-dev' },
  { _id: 'mock-9', title: 'Kesariya', artist: 'Arijit Singh, Pritam', category: 'trending-songs', categoryIndex: 1, imageUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=500&auto=format&fit=crop&q=60', audioUrl: 'https://prod-1.storage.jamendo.com/?trackid=1858342&format=mp31&from=app-dev' },
  { _id: 'mock-10', title: 'Raataan Lambiyan', artist: 'Jubin Nautiyal, Asees Kaur', category: 'trending-songs', categoryIndex: 1, imageUrl: 'https://images.unsplash.com/photo-1520523839898-507127043814?w=500&auto=format&fit=crop&q=60', audioUrl: 'https://prod-1.storage.jamendo.com/?trackid=1850124&format=mp31&from=app-dev' },
]

// GET /api/songs - Fetch all songs
router.get('/', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const { category } = req.query
      const query = category ? { category } : {}
      const songs = await Song.find(query).sort({ createdAt: -1 })
      if (songs && songs.length > 0) {
        return res.status(200).json({ success: true, count: songs.length, data: songs })
      }
    }
  } catch (error) {
    console.warn('MongoDB query failed, using fallback songs:', error.message)
  }

  res.status(200).json({
    success: true,
    count: defaultSongs.length,
    data: defaultSongs,
  })
})

// GET /api/songs/category/:categoryId - Fetch songs for a specific category
router.get('/category/:categoryId', async (req, res) => {
  const { categoryId } = req.params
  try {
    if (mongoose.connection.readyState === 1) {
      const isNumeric = !isNaN(Number(categoryId))
      const query = isNumeric 
        ? { categoryIndex: Number(categoryId) } 
        : { category: categoryId }

      let songs = await Song.find(query).sort({ createdAt: -1 })
      if (songs.length === 0 && (categoryId === '1' || categoryId === 'trending-songs')) {
        songs = await Song.find().sort({ createdAt: -1 })
      }
      if (songs && songs.length > 0) {
        return res.status(200).json({ success: true, categoryId, count: songs.length, data: songs })
      }
    }
  } catch (error) {
    console.warn('Category query fallback:', error.message)
  }

  res.status(200).json({
    success: true,
    categoryId,
    count: defaultSongs.length,
    data: defaultSongs,
  })
})

// POST /api/songs - Upload image & audio files
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

    if (mongoose.connection.readyState === 1) {
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
      return res.status(201).json({ success: true, data: song })
    } else {
      const newSong = {
        _id: `mock-${Date.now()}`,
        title,
        artist,
        category: category || 'trending-songs',
        imageUrl: imageFile.path || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500',
        audioUrl: audioFile ? audioFile.path : '',
      }
      defaultSongs.unshift(newSong)
      return res.status(201).json({ success: true, data: newSong })
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// DELETE /api/songs/:id
router.delete('/:id', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const song = await Song.findById(req.params.id)
      if (!song) {
        return res.status(404).json({ success: false, error: 'Song not found' })
      }
      if (song.imagePublicId && cloudinary.uploader) {
        await cloudinary.uploader.destroy(song.imagePublicId)
      }
      if (song.audioPublicId && cloudinary.uploader) {
        await cloudinary.uploader.destroy(song.audioPublicId, { resource_type: 'video' })
      }
      await song.deleteOne()
      return res.status(200).json({ success: true, message: 'Song deleted successfully' })
    }

    const index = defaultSongs.findIndex(s => s._id === req.params.id)
    if (index !== -1) {
      defaultSongs.splice(index, 1)
      return res.status(200).json({ success: true, message: 'Song deleted successfully' })
    }
    return res.status(404).json({ success: false, error: 'Song not found' })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

export default router
