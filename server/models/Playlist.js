import mongoose from 'mongoose';
import { trackSnapshotSchema } from './Favorite.js';

const playlistSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    artworkUrl: {
      type: String,
      default: '',
    },
    tracks: [
      {
        track: {
          type: trackSnapshotSchema,
          required: true,
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

export const Playlist = mongoose.model('Playlist', playlistSchema);
