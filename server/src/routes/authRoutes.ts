import express from 'express';
import { register, login, logout, getProfile } from '../controllers/authController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.post('/logout', logout);
router.get('/profile', protect, getProfile);

export default router; 