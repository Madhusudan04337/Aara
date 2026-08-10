import { v2 as cloudinary } from 'cloudinary'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import multer from 'multer'
import dotenv from 'dotenv'

dotenv.config()

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Storage for cover images
const imageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'aara_images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  },
})

// Storage for audio files (.mp3, .wav, .m4a, .ogg)
const audioStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'aara_audio',
    resource_type: 'video', // Cloudinary uses resource_type: 'video' or 'raw' for audio/video files
    allowed_formats: ['mp3', 'wav', 'm4a', 'ogg', 'aac'],
  },
})

export const uploadImage = multer({ storage: imageStorage })
export const uploadAudio = multer({ storage: audioStorage })

// Multer middleware handling both 'image' and 'audio' files in a single request
export const uploadSongFiles = multer({
  storage: new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
      if (file.fieldname === 'audio') {
        return {
          folder: 'aara_audio',
          resource_type: 'video', // Required by Cloudinary for audio files
          allowed_formats: ['mp3', 'wav', 'm4a', 'ogg', 'aac'],
        }
      }
      return {
        folder: 'aara_images',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      }
    },
  }),
}).fields([
  { name: 'image', maxCount: 1 },
  { name: 'audio', maxCount: 1 },
])

export { cloudinary }
