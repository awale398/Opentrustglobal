import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
  userId: string;
  amount: number;
  phoneNumber: string;
  merchantRequestId: string;
  checkoutRequestId: string;
  status: 'pending' | 'completed' | 'failed';
  receiptUrl?: string;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema({
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  amount: {
    type: Number,
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  merchantRequestId: {
    type: String,
    required: true
  },
  checkoutRequestId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  receiptUrl: {
    type: String
  },
  errorMessage: {
    type: String
  }
}, {
  timestamps: true
});

// Index for faster queries
transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ merchantRequestId: 1 });

export default mongoose.model<ITransaction>('Transaction', transactionSchema); 