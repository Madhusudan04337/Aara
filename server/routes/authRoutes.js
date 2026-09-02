import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { User } from '../models/User.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'aara_jwt_secret_key_123';

// In-memory fallback users store
const fallbackUsers = new Map();

// Auth middleware helper
export const getUserIdFromReq = (req) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      if (token && token !== 'null' && token !== 'undefined') {
        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded.userId || decoded.id || null;
      }
    }
  } catch {
    // Token verification failed or expired
  }
  return null;
};

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authentication token required' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

// POST /api/v1/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    const emailKey = email.toLowerCase();
    const passwordHash = await bcrypt.hash(password, 10);

    if (mongoose.connection.readyState === 1) {
      const existingUser = await User.findOne({ email: emailKey });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Email is already registered' });
      }

      const user = new User({ name, email: emailKey, passwordHash });
      await user.save();

      const token = jwt.sign({ userId: user._id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });

      return res.status(201).json({
        success: true,
        data: {
          token,
          user: { id: user._id, name: user.name, email: user.email, preferences: user.preferences }
        }
      });
    }

    // Fallback in-memory
    if (fallbackUsers.has(emailKey)) {
      return res.status(400).json({ success: false, message: 'Email is already registered' });
    }

    const userId = `user_${Date.now()}`;
    const userObj = { id: userId, name, email: emailKey, passwordHash, preferences: { theme: 'dark', autoplay: true } };
    fallbackUsers.set(emailKey, userObj);

    const token = jwt.sign({ userId, email: emailKey, name }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      success: true,
      data: {
        token,
        user: { id: userId, name, email: emailKey, preferences: userObj.preferences }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/v1/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const emailKey = email.toLowerCase();

    if (mongoose.connection.readyState === 1) {
      const user = await User.findOne({ email: emailKey });
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const token = jwt.sign({ userId: user._id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });

      return res.json({
        success: true,
        data: {
          token,
          user: { id: user._id, name: user.name, email: user.email, preferences: user.preferences }
        }
      });
    }

    // Fallback in-memory
    let userObj = fallbackUsers.get(emailKey);
    if (!userObj) {
      // Auto-provision demo account for quick local preview
      const passwordHash = await bcrypt.hash(password, 10);
      userObj = { id: `user_${Date.now()}`, name: email.split('@')[0], email: emailKey, passwordHash, preferences: { theme: 'dark', autoplay: true } };
      fallbackUsers.set(emailKey, userObj);
    } else {
      const isMatch = await bcrypt.compare(password, userObj.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
    }

    const token = jwt.sign({ userId: userObj.id, email: userObj.email, name: userObj.name }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      data: {
        token,
        user: { id: userObj.id, name: userObj.name, email: userObj.email, preferences: userObj.preferences }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/v1/auth/me
router.get('/me', authMiddleware, async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const user = await User.findById(req.user.userId).select('-passwordHash');
      if (user) {
        return res.json({ success: true, data: user });
      }
    }

    const userObj = Array.from(fallbackUsers.values()).find(u => u.id === req.user.userId || u.email === req.user.email);
    if (userObj) {
      const { passwordHash, ...rest } = userObj;
      return res.json({ success: true, data: rest });
    }

    res.json({ success: true, data: { id: req.user.userId, name: req.user.name, email: req.user.email } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/v1/auth/logout
router.post('/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

export default router;
