import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import songRoutes from './routes/songRoutes.js'
import musicRoutes from './src/routes/music.routes.js'
import favoriteRoutes from './routes/favoriteRoutes.js'
import playlistRoutes from './routes/playlistRoutes.js'
import authRoutes from './routes/authRoutes.js'
import historyRoutes from './routes/historyRoutes.js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')
const clientDir = path.resolve(rootDir, 'client')

const app = express()
const PORT = process.env.PORT || 3000

// CRITICAL: fail fast on Mongoose commands if DB is offline
mongoose.set('bufferCommands', false)

// Middleware
app.use(cors())
app.use(express.json())

// API Routes
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/music', musicRoutes)
app.use('/api/v1/favorites', favoriteRoutes)
app.use('/api/v1/playlists', playlistRoutes)
app.use('/api/v1/history', historyRoutes)
app.use('/api/songs', songRoutes)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'Aara Spotify Clone' })
})

// Database offline graceful error handler
app.use((err, req, res, next) => {
  if (err.name === 'MongooseError' || err.name === 'MongoNetworkError' || (err.message && err.message.includes('buffering timed out'))) {
    console.warn('[AI Studio] Database offline — returning mock fallback response')
    if (req.method === 'GET') {
      return res.json(req.path.endsWith('s') || req.path.endsWith('s/') ? [] : {})
    }
    return res.status(503).json({ error: 'Service temporarily unavailable (database offline)' })
  }
  next(err)
})

async function start() {
  // Vite Dev Server or Production Static Serving
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite')
    const vite = await createViteServer({
      root: clientDir,
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: 3000,
        hmr: false,
      },
      appType: 'spa',
    })
    app.use(vite.middlewares)
  } else {
    const distDir = path.resolve(clientDir, 'dist')
    app.use(express.static(distDir))
    app.use((req, res, next) => {
      if (req.method === 'GET' && !req.path.startsWith('/api')) {
        res.sendFile(path.resolve(distDir, 'index.html'))
      } else {
        next()
      }
    })
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Aara Web Player running on port ${PORT}`)
  })
}

// Connect to MongoDB asynchronously if configured
const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    console.warn('⚠️ MONGODB_URI not provided — running with in-memory fallback store')
    return
  }
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    })
    console.log(`MongoDB Connected: ${conn.connection.host}`)
  } catch (error) {
    console.warn(`⚠️ MongoDB Connection: ${error.message} — using in-memory fallbacks`)
  }
}

connectDB()
start()
