import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types/custom';
import Transaction from '../models/Transaction';
import { generateAccessToken, initiateSTKPush, checkTransactionStatus } from '../services/mpesaService';

// Define valid status types
type PaymentStatus = 'completed' | 'failed' | 'pending';

export const initiatePayment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { amount, phoneNumber } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    // Generate access token
    const accessToken = await generateAccessToken();

    // Create a pending transaction
    const transaction = await Transaction.create({
      userId,
      amount,
      status: 'pending' as PaymentStatus,
      type: 'payment',
      phoneNumber
    });

    // Initiate STK Push
    const stkResponse = await initiateSTKPush(accessToken, amount, phoneNumber);

    // Update transaction with M-Pesa details
    transaction.merchantRequestId = stkResponse.MerchantRequestID;
    transaction.checkoutRequestId = stkResponse.CheckoutRequestID;
    await transaction.save();

    res.status(200).json({
      success: true,
      data: {
        transaction,
        checkoutRequestId: stkResponse.CheckoutRequestID
      }
    });
  } catch (error) {
    console.error('Payment initiation error:', error);
    res.status(500).json({ success: false, message: 'Failed to initiate payment' });
  }
};

export const getPaymentStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { transactionId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const transaction = await Transaction.findOne({
      _id: transactionId,
      userId
    });

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    // Check transaction status from M-Pesa
    const status = await checkTransactionStatus(transaction.merchantRequestId);
    transaction.status = status as PaymentStatus;
    await transaction.save();

    res.status(200).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({ success: false, message: 'Failed to get payment status' });
  }
};

export const updatePaymentStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { transactionId } = req.params;
    const { status } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    // Validate status
    if (!['completed', 'failed', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const transaction = await Transaction.findOneAndUpdate(
      { _id: transactionId, userId },
      { status: status as PaymentStatus },
      { new: true }
    );

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    res.status(200).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({ success: false, message: 'Failed to update payment status' });
  }
};

export const getTransactionHistory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const transactions = await Transaction.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: transactions
    });
  } catch (error) {
    console.error('Get transaction history error:', error);
    res.status(500).json({ success: false, message: 'Failed to get transaction history' });
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