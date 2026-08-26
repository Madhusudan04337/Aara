import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import songRoutes from './routes/songRoutes.js'
import musicRoutes from "./routes/music.routes.js";
import favoriteRoutes from "./routes/favoriteRoutes.js";
import playlistRoutes from "./routes/playlistRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import historyRoutes from "./routes/historyRoutes.js";

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/music", musicRoutes);
app.use("/api/v1/favorites", favoriteRoutes);
app.use("/api/v1/playlists", playlistRoutes);
app.use("/api/v1/history", historyRoutes);
app.use('/api/songs', songRoutes)

app.get('/', (req, res) => {
  res.send('Aara Spotify Clone API Server Running')
})

// Start server first
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

// Connect to MongoDB asynchronously
const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    console.warn('⚠️ MONGODB_URI is not set in .env file!')
    return
  }
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of hanging
    })
    console.log(`MongoDB Connected: ${conn.connection.host}`)
  } catch (error) {
    console.error(`⚠️ MongoDB Connection Warning: ${error.message}`)
  }
}

connectDB()

