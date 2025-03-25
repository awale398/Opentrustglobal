import express from 'express';
import authRoutes from './authRoutes';
import budgetRoutes from './budgetRoutes';
import fraudDetectionRoutes from './fraudDetectionRoutes';

const router = express.Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/budgets', budgetRoutes);
router.use('/fraud', fraudDetectionRoutes);

export default router; 