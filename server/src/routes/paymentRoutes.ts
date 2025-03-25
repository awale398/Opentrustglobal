import express from 'express';
import { initiatePayment, checkPaymentStatus, getTransactions } from '../controllers/paymentController';
import { handleMpesaCallback } from '../controllers/mpesaCallbackController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// M-Pesa callback endpoint (no authentication required)
router.post('/mpesa/callback', handleMpesaCallback);

// Protected routes (require authentication)
router.use(authenticateToken);

// Initiate M-Pesa payment
router.post('/mpesa', initiatePayment);

// Check payment status
router.get('/status/:transactionId', checkPaymentStatus);

// Get user's transaction history
router.get('/transactions', getTransactions);

export default router; 