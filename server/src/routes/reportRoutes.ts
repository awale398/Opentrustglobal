import express from 'express';
import { protect, authorize } from '../middleware/auth';
import Budget from '../models/Budget';

const router = express.Router();

// Protect all routes
router.use(protect);

// Get department summary reports
router.get('/', async (req, res) => {
  try {
    const budgets = await Budget.find().populate('createdBy', 'name email');
    
    // Group budgets by department
    const departmentSummary = budgets.reduce((acc: any[], budget) => {
      const existing = acc.find(item => item.department === budget.department);
      if (existing) {
        existing.allocated += budget.allocatedAmount;
        existing.spent += budget.spentAmount;
        existing.budgetCount += 1;
        existing.utilizationRate = (existing.spent / existing.allocated) * 100;
      } else {
        acc.push({
          department: budget.department,
          allocated: budget.allocatedAmount,
          spent: budget.spentAmount,
          budgetCount: 1,
          utilizationRate: (budget.spentAmount / budget.allocatedAmount) * 100
        });
      }
      return acc;
    }, []);

    res.json({
      success: true,
      departmentSummary
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating reports'
    });
  }
});

// Get monthly expenditure data
router.get('/monthly', async (req, res) => {
  try {
    const budgets = await Budget.find().sort({ createdAt: 1 });
    
    // Group by month and calculate cumulative amounts
    const monthlyData = budgets.reduce((acc: any[], budget) => {
      const month = budget.createdAt.toISOString().slice(0, 7); // Format: YYYY-MM
      const existing = acc.find(item => item.month === month);
      
      if (existing) {
        existing.amount += budget.spentAmount;
        existing.cumulativeAmount = acc.reduce((sum, item) => sum + item.amount, 0);
      } else {
        acc.push({
          month,
          amount: budget.spentAmount,
          cumulativeAmount: acc.reduce((sum, item) => sum + item.amount, 0) + budget.spentAmount
        });
      }
      
      return acc;
    }, []);

    res.json({
      success: true,
      data: monthlyData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating monthly data'
    });
  }
});

export default router; 