import mongoose from 'mongoose'
import { v2 as cloudinary } from 'cloudinary'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { Song } from './models/Song.js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const initialSongs = [
  { file: 'imgi_1_ab67616d00001e025be30e0d058181d80d470511.jpg', title: 'Barsaat', artist: 'Banjaare, Roni' },
  { file: 'imgi_2_ab67616d00001e020c8806717b030da10e9fd336.jpg', title: 'KALYANI (with Shreya Ghoshal) - Remix', artist: 'ARJN, KDS, FIFTY4, Shreya Ghoshal' },
  { file: 'imgi_3_ab67616d00001e021d5e5118400187e7421295d0.jpg', title: 'Tera Mera Rishta Continues (Film Ballad)', artist: 'Mithoon, Pritam, Mustafa Zahid, Sayeed Quadri' },
  { file: 'imgi_4_ab67616d00001e02e0807b4138d187c74233853b.jpg', title: 'Raga of Revenge', artist: 'Anirudh Ravichander' },
  { file: 'imgi_5_ab67616d00001e02fef330e9cdf8aec080a46ba2.jpg', title: 'Alaakaa Loova (From "OM Chapter 1:..."', artist: 'Sai Abhyankkar, Rokesh' },
  { file: 'imgi_6_ab67616d00001e024c2798e247fd768c8eec464b.jpg', title: 'FINE SHYT', artist: 'Guru Randhawa, Yashvi Desai' },
  { file: 'imgi_7_ab67616d00001e02c9388d52281101181ecb4ea4.jpg', title: 'Mann Mera', artist: 'Gajendra Verma' },
  { file: 'imgi_8_ab67616d00001e02fddfffec51b4580acae727c1.jpg', title: 'Tere Naam', artist: 'Udit Narayan, Salman Khan' },
  { file: 'imgi_9_ab67616d00001e028fa95e3e74799cb0b2a1fb57.jpg', title: 'Kesariya', artist: 'Arijit Singh, Pritam' },
  { file: 'imgi_10_ab67616d00001e02e46086c3ce781b0f2d0b089f.jpg', title: 'Raataan Lambiyan', artist: 'Jubin Nautiyal, Asees Kaur' },
]

const seedDB = async () => {
  try {
    if (!process.env.MONGODB_URI || !process.env.CLOUDINARY_CLOUD_NAME) {
      console.error('Error: Please fill in your .env file with MongoDB & Cloudinary credentials before running seed.')
      process.exit(1)
    }

    await mongoose.connect(process.env.MONGODB_URI)
    console.log('MongoDB connected for seeding...')

    // Clear existing songs
    await Song.deleteMany({})
    console.log('Cleared existing Song documents.')

    for (const song of initialSongs) {
      const filePath = path.join(__dirname, '../client/src/assets', song.file)
      console.log(`Uploading ${song.title}...`)

      const uploadRes = await cloudinary.uploader.upload(filePath, {
        folder: 'aara_songs',
      })

      const newSong = new Song({
        title: song.title,
        artist: song.artist,
        category: 'trending-songs',
        categoryIndex: 1,
        imageUrl: uploadRes.secure_url,
        imagePublicId: uploadRes.public_id,
      })

      await newSong.save()
      console.log(`Saved ${song.title} to MongoDB!`)
    }

    console.log('🎉 Seeding finished successfully!')
    process.exit(0)
  } catch (error) {
    console.error('Seeding error:', error)
    process.exit(1)
  }
}

seedDB()
