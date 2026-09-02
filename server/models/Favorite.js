import mongoose from 'mongoose';

export const trackSnapshotSchema = new mongoose.Schema(
  {
    jamendoTrackId: {
      type: String,
      required: true,
    },
    title: String,
    artistName: String,
    artist: String,
    artworkUrl: String,
    audioUrl: String,
    licenseUrl: String,
    duration: Number,
    source: {
      type: String,
      default: 'jamendo',
    },
  },
  { _id: false }
);

const favoriteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    track: {
      type: trackSnapshotSchema,
      required: true,
    },
  },
  { timestamps: true }
);

favoriteSchema.index(
  { userId: 1, 'track.jamendoTrackId': 1 },
  { unique: true }
);

export const Favorite = mongoose.model('Favorite', favoriteSchema);
