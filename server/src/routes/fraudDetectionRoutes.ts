import express from 'express';
import { protect, authorize } from '../middleware/auth';
import {
  getFraudReports,
  analyzeBudget
} from '../controllers/fraudDetectionController';

const router = express.Router();

// Protect all routes
router.use(protect);

// Get all fraud reports
router.get('/reports', authorize('admin'), getFraudReports);

// Analyze a specific budget for fraud
router.post('/analyze/:id', authorize('admin'), analyzeBudget);

export default router; 