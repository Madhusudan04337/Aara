import mongoose from 'mongoose'

const songSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    artist: {
      type: String,
      required: true,
      trim: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    audioUrl: {
      type: String,
    },
    imagePublicId: {
      type: String,
    },
    audioPublicId: {
      type: String,
    },
    category: {
      type: String,
      default: 'trending-songs',
      index: true, // MongoDB Index on string category slug
    },
    categoryIndex: {
      type: Number,
      default: 1,
      index: true, // MongoDB Index on numeric category ID (1, 2, 3, etc.)
    },
  },
  { timestamps: true }
)

// Compound Index: Optimizes fetching songs by category sorted by newest first
songSchema.index({ category: 1, createdAt: -1 })
songSchema.index({ categoryIndex: 1, createdAt: -1 })

export const Song = mongoose.model('Song', songSchema)
