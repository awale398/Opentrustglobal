import mongoose, { Schema, Document } from 'mongoose';

export interface IBudget extends Document {
  projectName: string;
  department: string;
  allocatedAmount: number;
  spentAmount: number;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'completed' | 'cancelled';
  description: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  fraudAnalysis?: {
    riskScore: number;
    fraudFlags: string[];
    lastAnalysisDate: Date;
    spendingVariance: number;
    transactionFrequency: number;
    allocationDeviation: number;
    historicalComparison: {
      previousYear: number;
      currentYear: number;
      variance: number;
    };
  };
}

const budgetSchema = new Schema({
  projectName: {
    type: String,
    required: true,
    trim: true
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  allocatedAmount: {
    type: Number,
    required: true,
    min: 0
  },
  spentAmount: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fraudAnalysis: {
    riskScore: {
      type: Number,
      min: 0,
      max: 100
    },
    fraudFlags: [{
      type: String
    }],
    lastAnalysisDate: Date,
    spendingVariance: Number,
    transactionFrequency: Number,
    allocationDeviation: Number,
    historicalComparison: {
      previousYear: Number,
      currentYear: Number,
      variance: Number
    }
  }
}, {
  timestamps: true
});

export default mongoose.model<IBudget>('Budget', budgetSchema); 