import { Request, Response } from 'express';
import { generateAccessToken, initiateSTKPush, checkTransactionStatus } from '../services/mpesaService';
import Transaction from '../models/Transaction';
import { AuthenticatedRequest } from '../types/custom';

export const initiatePayment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { amount, phoneNumber } = req.body;
    const userId = req.user.id; // From auth middleware

    // Generate access token
    const accessToken = await generateAccessToken();

    // Initiate STK Push
    const stkResponse = await initiateSTKPush(accessToken, amount, phoneNumber);

    // Create transaction record
    const transaction = new Transaction({
      userId,
      amount,
      phoneNumber,
      merchantRequestId: stkResponse.MerchantRequestID,
      checkoutRequestId: stkResponse.CheckoutRequestID,
      status: 'pending'
    });

    await transaction.save();

    res.status(200).json({
      success: true,
      message: 'Payment initiated successfully',
      checkoutRequestId: stkResponse.CheckoutRequestID
    });
  } catch (error) {
    console.error('Payment initiation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initiate payment',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getPaymentStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { transactionId } = req.params;
    const userId = req.user.id;

    const transaction = await Transaction.findOne({
      _id: transactionId,
      userId
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Check transaction status from M-Pesa
    const status = await checkTransactionStatus(transaction.merchantRequestId);

    // Update transaction status
    transaction.status = status;
    await transaction.save();

    res.status(200).json({
      success: true,
      status: transaction.status,
      receiptUrl: transaction.receiptUrl
    });
  } catch (error) {
    console.error('Payment status check error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check payment status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const updatePaymentStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { transactionId } = req.params;
    const { status } = req.body;

    // Validate status
    if (!['completed', 'failed', 'pending'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const transaction = await Transaction.findByIdAndUpdate(
      transactionId,
      { status: status as 'completed' | 'failed' | 'pending' },
      { new: true }
    );

    // ... rest of the code
  } catch (error) {
    // ... error handling
  }
};

export const getTransactionHistory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user.id;

    const transactions = await Transaction.find({ userId })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      transactions
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get transactions',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Helper function to get plan details
async function getPlanDetails(planId: string) {
  // This would typically come from your database
  const plans = {
    basic: { price: 1000 },
    premium: { price: 2500 },
    enterprise: { price: 5000 },
  };

  return plans[planId as keyof typeof plans] || null;
} 