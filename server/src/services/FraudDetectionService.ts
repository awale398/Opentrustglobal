import { IBudget } from '../models/Budget';

interface RiskScore {
  score: number;
  factors: string[];
}

interface Anomaly {
  type: string;
  severity: 'high' | 'medium' | 'low';
  description: string;
}

export class FraudDetectionService {
  private readonly HIGH_RISK_THRESHOLD = 70;
  private readonly MEDIUM_RISK_THRESHOLD = 50;
  private readonly SPENDING_VARIANCE_THRESHOLD = 0.3; // 30% variance
  private readonly RAPID_SPENDING_THRESHOLD = 0.8; // 80% spent in first quarter
  private readonly ALLOCATION_DEVIATION_THRESHOLD = 0.2; // 20% deviation

  public identifyFraudFlags(budget: IBudget): string[] {
    const anomalies = this.detectAnomalies(budget);
    const flags: string[] = [];

    // Categorize anomalies by severity
    anomalies.forEach(anomaly => {
      if (anomaly.severity === 'high') {
        flags.push(`High Risk: ${anomaly.description}`);
      } else if (anomaly.severity === 'medium') {
        flags.push(`Medium Risk: ${anomaly.description}`);
      }
    });

    return flags;
  }

  public calculateRiskScore(budget: IBudget): number {
    const anomalies = this.detectAnomalies(budget);
    let totalScore = 0;

    // Weight anomalies by severity
    anomalies.forEach(anomaly => {
      switch (anomaly.severity) {
        case 'high':
          totalScore += 30;
          break;
        case 'medium':
          totalScore += 20;
          break;
        case 'low':
          totalScore += 10;
          break;
      }
    });

    // Add spending variance score
    const spendingVariance = this.calculateSpendingVariance(budget);
    if (spendingVariance > this.SPENDING_VARIANCE_THRESHOLD) {
      totalScore += 20;
    }

    // Add transaction frequency score
    const transactionFrequency = this.calculateTransactionFrequency(budget);
    if (transactionFrequency > 0.8) {
      totalScore += 15;
    }

    // Add allocation deviation score
    const allocationDeviation = this.calculateAllocationDeviation(budget);
    if (allocationDeviation > this.ALLOCATION_DEVIATION_THRESHOLD) {
      totalScore += 15;
    }

    return Math.min(totalScore, 100);
  }

  private detectAnomalies(budget: IBudget): Anomaly[] {
    const anomalies: Anomaly[] = [];

    // Check for unusual spending patterns
    const spendingVariance = this.calculateSpendingVariance(budget);
    if (spendingVariance > this.SPENDING_VARIANCE_THRESHOLD) {
      anomalies.push({
        type: 'spending_variance',
        severity: 'high',
        description: `Unusual spending variance detected (${(spendingVariance * 100).toFixed(1)}%)`
      });
    }

    // Check for rapid spending
    const rapidSpending = this.checkRapidSpending(budget);
    if (rapidSpending) {
      anomalies.push({
        type: 'rapid_spending',
        severity: 'high',
        description: 'Rapid spending detected in early project phase'
      });
    }

    // Check for allocation deviations
    const allocationDeviation = this.calculateAllocationDeviation(budget);
    if (allocationDeviation > this.ALLOCATION_DEVIATION_THRESHOLD) {
      anomalies.push({
        type: 'allocation_deviation',
        severity: 'medium',
        description: `Significant deviation from allocated budget (${(allocationDeviation * 100).toFixed(1)}%)`
      });
    }

    return anomalies;
  }

  private calculateSpendingVariance(budget: IBudget): number {
    const expectedSpending = this.calculateExpectedSpending(budget);
    return Math.abs(budget.spentAmount - expectedSpending) / budget.allocatedAmount;
  }

  private calculateExpectedSpending(budget: IBudget): number {
    const startDate = new Date(budget.startDate);
    const endDate = new Date(budget.endDate);
    const today = new Date();

    const totalDuration = endDate.getTime() - startDate.getTime();
    const elapsedDuration = today.getTime() - startDate.getTime();

    return (elapsedDuration / totalDuration) * budget.allocatedAmount;
  }

  private checkRapidSpending(budget: IBudget): boolean {
    const startDate = new Date(budget.startDate);
    const endDate = new Date(budget.endDate);
    const today = new Date();

    const totalDuration = endDate.getTime() - startDate.getTime();
    const elapsedDuration = today.getTime() - startDate.getTime();
    const elapsedPercentage = elapsedDuration / totalDuration;

    return budget.spentAmount / budget.allocatedAmount > this.RAPID_SPENDING_THRESHOLD && elapsedPercentage < 0.25;
  }

  private calculateTransactionFrequency(budget: IBudget): number {
    // This is a simplified version. In a real application, you would track actual transactions
    return budget.spentAmount / budget.allocatedAmount;
  }

  private calculateAllocationDeviation(budget: IBudget): number {
    return Math.abs(budget.spentAmount - budget.allocatedAmount) / budget.allocatedAmount;
  }

  private compareWithHistoricalData(budget: IBudget): { previousYear: number; currentYear: number; variance: number } {
    // This is a placeholder. In a real application, you would fetch historical data
    return {
      previousYear: budget.allocatedAmount * 0.9,
      currentYear: budget.allocatedAmount,
      variance: 0.1
    };
  }
} 