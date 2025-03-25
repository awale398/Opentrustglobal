import express from 'express';
import { getFraudReports, analyzeBudget } from '../controllers/fraudDetectionController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Logging middleware for fraud routes
router.use((req, res, next) => {
  console.log(`[Fraud Routes] ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});

// Get all fraud reports
router.get('/reports', authenticateToken, getFraudReports);

// Analyze a specific budget for fraud
router.post('/analyze/:id', authenticateToken, analyzeBudget);

export default router; 