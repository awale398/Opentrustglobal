const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Budget = require('../models/Budget');
const Expense = require('../models/Expense');

// Get total government spending summary
router.get('/', protect, async (req, res) => {
  try {
    // Get overall budget summary
    const budgetSummary = await Budget.aggregate([
      {
        $group: {
          _id: null,
          totalAllocated: { $sum: '$allocatedAmount' },
          totalSpent: { $sum: '$spentAmount' },
          totalBudgets: { $sum: 1 }
        }
      }
    ]);

    // Get department-wise summary
    const departmentSummary = await Budget.aggregate([
      {
        $group: {
          _id: '$governmentDepartment',
          allocated: { $sum: '$allocatedAmount' },
          spent: { $sum: '$spentAmount' },
          budgetCount: { $sum: 1 }
        }
      },
      {
        $project: {
          department: '$_id',
          allocated: 1,
          spent: 1,
          budgetCount: 1,
          utilizationRate: {
            $multiply: [
              { $divide: ['$spent', '$allocated'] },
              100
            ]
          }
        }
      },
      { $sort: { allocated: -1 } }
    ]);

    // Get status-wise summary
    const statusSummary = await Budget.aggregate([
      {
        $group: {
          _id: '$status',
          allocated: { $sum: '$allocatedAmount' },
          spent: { $sum: '$spentAmount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Get recent expenses
    const recentExpenses = await Expense.find()
      .sort('-date')
      .limit(5)
      .populate('budgetId', 'projectName governmentDepartment')
      .populate('createdBy', 'name');

    res.json({
      success: true,
      data: {
        overall: budgetSummary[0] || {
          totalAllocated: 0,
          totalSpent: 0,
          totalBudgets: 0
        },
        departmentSummary,
        statusSummary,
        recentExpenses
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error generating reports', error: error.message });
  }
});

// Get department-specific report
router.get('/department/:department', protect, async (req, res) => {
  try {
    const department = req.params.department;

    const departmentData = await Budget.aggregate([
      {
        $match: { governmentDepartment: department }
      },
      {
        $group: {
          _id: null,
          totalAllocated: { $sum: '$allocatedAmount' },
          totalSpent: { $sum: '$spentAmount' },
          projectCount: { $sum: 1 }
        }
      }
    ]);

    const projects = await Budget.find({ governmentDepartment: department })
      .select('projectName allocatedAmount spentAmount status')
      .sort('-createdAt');

    res.json({
      success: true,
      data: {
        summary: departmentData[0] || {
          totalAllocated: 0,
          totalSpent: 0,
          projectCount: 0
        },
        projects
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error generating department report', error: error.message });
  }
});

// Get monthly expenditure data
router.get('/monthly', protect, async (req, res) => {
  try {
    const monthlyData = await Expense.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          amount: { $sum: '$amount' }
        }
      },
      {
        $project: {
          _id: 0,
          month: {
            $concat: [
              { $toString: '$_id.year' },
              '-',
              { $toString: '$_id.month' }
            ]
          },
          amount: 1
        }
      },
      { $sort: { month: 1 } }
    ]);

    // Calculate cumulative amounts
    let cumulativeAmount = 0;
    const dataWithCumulative = monthlyData.map(item => ({
      ...item,
      cumulativeAmount: (cumulativeAmount += item.amount)
    }));

    res.json({
      success: true,
      data: dataWithCumulative
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error generating monthly report', 
      error: error.message 
    });
  }
});

module.exports = router; 