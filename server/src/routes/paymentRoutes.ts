import express from 'express';
import { protect } from '../middleware/auth';
import {
  initiatePayment,
  getPaymentStatus,
  updatePaymentStatus,
  getTransactionHistory
} from '../controllers/paymentController';
import { handleMpesaCallback } from '../controllers/mpesaCallbackController';

const router = express.Router();

// Protect all routes
router.use(protect);

// M-Pesa callback endpoint (no authentication required)
router.post('/mpesa/callback', handleMpesaCallback);

router.post('/initiate', initiatePayment);
router.get('/status/:transactionId', getPaymentStatus);
router.put('/status/:transactionId', updatePaymentStatus);
router.get('/history', getTransactionHistory);

export default router; 