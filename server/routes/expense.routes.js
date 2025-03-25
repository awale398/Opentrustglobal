const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Expense = require('../models/Expense');
const Budget = require('../models/Budget');
const { protect, authorize } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(protect);

// Get all expenses
router.get('/', async (req, res) => {
  try {
    const expenses = await Expense.find()
      .populate('budgetId', 'projectName governmentDepartment')
      .populate('createdBy', 'name email')
      .sort('-date');

    res.json({
      success: true,
      count: expenses.length,
      data: expenses
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching expenses', 
      error: error.message 
    });
  }
});

// Get expenses by budget ID
router.get('/budget/:budgetId', async (req, res) => {
  try {
    const expenses = await Expense.find({ budgetId: req.params.budgetId })
      .populate('createdBy', 'name email')
      .sort('-date');

    res.json({
      success: true,
      count: expenses.length,
      data: expenses
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching expenses', 
      error: error.message 
    });
  }
});

// Add new expense - Admin only
router.post('/', [
  authorize('admin'),
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('budgetId').notEmpty().withMessage('Budget ID is required'),
  body('date').optional().isISO8601().toDate().withMessage('Invalid date format')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    // Check if budget exists and has sufficient funds
    const budget = await Budget.findById(req.body.budgetId);
    if (!budget) {
      return res.status(404).json({ 
        success: false, 
        message: 'Budget not found' 
      });
    }

    const remainingBudget = budget.allocatedAmount - budget.spentAmount;
    if (req.body.amount > remainingBudget) {
      return res.status(400).json({ 
        success: false,
        message: 'Expense amount exceeds remaining budget',
        remainingBudget
      });
    }

    // Create expense
    const expense = await Expense.create({
      ...req.body,
      createdBy: req.user.id
    });

    // Update budget spent amount
    budget.spentAmount += req.body.amount;
    await budget.save();

    await expense.populate('createdBy', 'name email');
    await expense.populate('budgetId', 'projectName governmentDepartment');

    res.status(201).json({
      success: true,
      data: expense
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error creating expense', 
      error: error.message 
    });
  }
});

// Update expense - Admin only
router.put('/:id', [
  authorize('admin'),
  body('amount').optional().isNumeric().withMessage('Amount must be a number'),
  body('description').optional().trim().notEmpty().withMessage('Description cannot be empty'),
  body('date').optional().isISO8601().toDate().withMessage('Invalid date format')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    let expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ 
        success: false, 
        message: 'Expense not found' 
      });
    }

    // If amount is being updated, check budget constraints
    if (req.body.amount && req.body.amount !== expense.amount) {
      const budget = await Budget.findById(expense.budgetId);
      const amountDifference = req.body.amount - expense.amount;
      const remainingBudget = budget.allocatedAmount - budget.spentAmount;

      if (amountDifference > remainingBudget) {
        return res.status(400).json({ 
          success: false,
          message: 'New expense amount exceeds remaining budget',
          remainingBudget
        });
      }

      // Update budget spent amount
      budget.spentAmount += amountDifference;
      await budget.save();
    }

    expense = await Expense.findByIdAndUpdate(
      req.params.id,
      { ...req.body, lastUpdatedBy: req.user.id },
      { new: true, runValidators: true }
    )
    .populate('createdBy', 'name email')
    .populate('budgetId', 'projectName governmentDepartment');

    res.json({
      success: true,
      data: expense
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error updating expense', 
      error: error.message 
    });
  }
});

// Delete expense - Admin only
router.delete('/:id', authorize('admin'), async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ 
        success: false, 
        message: 'Expense not found' 
      });
    }

    // Update budget spent amount
    const budget = await Budget.findById(expense.budgetId);
    budget.spentAmount -= expense.amount;
    await budget.save();

    await expense.remove();

    res.json({
      success: true,
      message: 'Expense deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting expense', 
      error: error.message 
    });
  }
});

module.exports = router; 