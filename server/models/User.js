import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    avatarUrl: {
      type: String,
      default: '',
    },
    preferences: {
      theme: { type: String, default: 'dark' },
      autoplay: { type: Boolean, default: true },
      preferredGenres: [String],
    },
  },
  { timestamps: true }
);

export const User = mongoose.model('User', userSchema);
