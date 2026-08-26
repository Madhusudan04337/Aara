import mongoose from 'mongoose';
import { trackSnapshotSchema } from './Favorite.js';

const historySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    track: {
      type: trackSnapshotSchema,
      required: true,
    },
    playedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

historySchema.index({ userId: 1, playedAt: -1 });

export const History = mongoose.model('History', historySchema);
