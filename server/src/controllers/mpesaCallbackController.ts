import { Request, Response } from 'express';
import { ITransaction } from '../models/Transaction';
import Transaction from '../models/Transaction';
import crypto from 'crypto';

interface MpesaCallback {
  Body: {
    stkCallback: {
      MerchantRequestID: string;
      CheckoutRequestID: string;
      ResultCode: number;
      ResultDesc: string;
      CallbackMetadata?: {
        Item: Array<{
          Name: string;
          Value: any;
        }>;
      };
    };
  };
}

export const handleMpesaCallback = async (req: Request, res: Response) => {
  try {
    const callback: MpesaCallback = req.body;
    const { stkCallback } = callback.Body;

    // Find the transaction
    const transaction = await Transaction.findOne({
      mpesaRequestId: stkCallback.MerchantRequestID,
    });

    if (!transaction) {
      console.error('Transaction not found for callback:', stkCallback.MerchantRequestID);
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Update transaction status based on result code
    if (stkCallback.ResultCode === 0) {
      // Payment successful
      transaction.status = 'completed';

      // Extract receipt URL from callback metadata
      if (stkCallback.CallbackMetadata) {
        const receiptItem = stkCallback.CallbackMetadata.Item.find(
          item => item.Name === 'ReceiptURL'
        );
        if (receiptItem) {
          transaction.receiptUrl = receiptItem.Value;
        }
      }
    } else {
      // Payment failed
      transaction.status = 'failed';
      transaction.errorMessage = stkCallback.ResultDesc;
    }

    await transaction.save();

    // Log the callback for debugging
    console.log('M-Pesa callback processed:', {
      transactionId: transaction._id,
      status: transaction.status,
      resultCode: stkCallback.ResultCode,
    });

    // Send success response to M-Pesa
    res.status(200).json({
      ResultCode: 0,
      ResultDesc: 'Success',
    });
  } catch (error) {
    console.error('Error processing M-Pesa callback:', error);
    res.status(500).json({
      ResultCode: 1,
      ResultDesc: 'Failed to process callback',
    });
  }
}; 