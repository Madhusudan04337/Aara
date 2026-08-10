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
    },
  },
  { timestamps: true }
)

export const Song = mongoose.model('Song', songSchema)
