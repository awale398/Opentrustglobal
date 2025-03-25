import { Request, Response } from 'express';
import Budget from '../models/Budget';
import { FraudDetectionService } from '../services/FraudDetectionService';

const fraudDetectionService = new FraudDetectionService();

// Get fraud reports for all budgets
export const getFraudReports = async (req: Request, res: Response) => {
  try {
    const budgets = await Budget.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    const reports = budgets.map(budget => {
      const riskScore = fraudDetectionService.calculateRiskScore(budget);
      const fraudFlags = fraudDetectionService.identifyFraudFlags(budget);
      const spendingVariance = Math.abs(budget.spentAmount - budget.allocatedAmount) / budget.allocatedAmount;
      const transactionFrequency = budget.spentAmount / budget.allocatedAmount;
      const allocationDeviation = Math.abs(budget.spentAmount - budget.allocatedAmount) / budget.allocatedAmount;
      const historicalComparison = fraudDetectionService['compareWithHistoricalData'](budget);

      return {
        budgetId: budget._id,
        projectName: budget.projectName,
        department: budget.department,
        allocatedAmount: budget.allocatedAmount,
        spentAmount: budget.spentAmount,
        riskScore,
        fraudFlags,
        spendingVariance,
        transactionFrequency,
        allocationDeviation,
        historicalComparison,
        lastAnalysisDate: new Date(),
        status: budget.status
      };
    });

    res.json({
      success: true,
      data: reports
    });
  } catch (error) {
    console.error('Error generating fraud reports:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating fraud reports',
      errors: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Analyze a specific budget for fraud
export const analyzeBudget = async (req: Request, res: Response) => {
  try {
    const budget = await Budget.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    const riskScore = fraudDetectionService.calculateRiskScore(budget);
    const fraudFlags = fraudDetectionService.identifyFraudFlags(budget);
    const spendingVariance = Math.abs(budget.spentAmount - budget.allocatedAmount) / budget.allocatedAmount;
    const transactionFrequency = budget.spentAmount / budget.allocatedAmount;
    const allocationDeviation = Math.abs(budget.spentAmount - budget.allocatedAmount) / budget.allocatedAmount;
    const historicalComparison = fraudDetectionService['compareWithHistoricalData'](budget);

    // Update the budget with fraud analysis results
    budget.fraudAnalysis = {
      riskScore,
      fraudFlags,
      lastAnalysisDate: new Date(),
      spendingVariance,
      transactionFrequency,
      allocationDeviation,
      historicalComparison
    };

    await budget.save();

    res.json({
      success: true,
      data: {
        budgetId: budget._id,
        projectName: budget.projectName,
        department: budget.department,
        allocatedAmount: budget.allocatedAmount,
        spentAmount: budget.spentAmount,
        riskScore,
        fraudFlags,
        spendingVariance,
        transactionFrequency,
        allocationDeviation,
        historicalComparison,
        lastAnalysisDate: new Date(),
        status: budget.status
      }
    });
  } catch (error) {
    console.error('Error analyzing budget:', error);
    res.status(500).json({
      success: false,
      message: 'Error analyzing budget',
      errors: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Helper functions for fraud analysis
function calculateRiskScore(budget: any): number {
  // Implement risk score calculation logic
  return Math.random() * 100;
}

function identifyFraudFlags(budget: any): string[] {
  // Implement fraud flag identification logic
  return [];
}

function calculateSpendingVariance(budget: any): number {
  // Implement spending variance calculation
  return 0;
}

function calculateTransactionFrequency(budget: any): number {
  // Implement transaction frequency calculation
  return 0;
}

function calculateAllocationDeviation(budget: any): number {
  // Implement allocation deviation calculation
  return 0;
}

function calculateHistoricalComparison(budget: any): number {
  // Implement historical comparison calculation
  return 0;
} 