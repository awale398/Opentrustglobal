const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Budget = require('../models/Budget');
const { protect, authorize } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(protect);

// Get all budgets
router.get('/', async (req, res) => {
  try {
    const budgets = await Budget.find()
      .populate('createdBy', 'name email')
      .sort('-createdAt');
    res.json({
      success: true,
      count: budgets.length,
      data: budgets
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching budgets', 
      error: error.message 
    });
  }
});

// Get single budget
router.get('/:id', async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id)
      .populate('createdBy', 'name email');
    
    if (!budget) {
      return res.status(404).json({ 
        success: false, 
        message: 'Budget not found' 
      });
    }

    res.json({
      success: true,
      data: budget
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching budget', 
      error: error.message 
    });
  }
});

// Create new budget - Admin only
router.post('/', [
  authorize('admin'),
  body('projectName').trim().notEmpty().withMessage('Project name is required'),
  body('allocatedAmount').isNumeric().withMessage('Allocated amount must be a number'),
  body('governmentDepartment').trim().notEmpty().withMessage('Government department is required'),
  body('status').isIn(['planned', 'in-progress', 'completed', 'on-hold']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const budget = await Budget.create({
      ...req.body,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      data: budget
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error creating budget', 
      error: error.message 
    });
  }
});

// Update budget - Admin only
router.put('/:id', [
  authorize('admin'),
  body('projectName').optional().trim().notEmpty().withMessage('Project name cannot be empty'),
  body('allocatedAmount').optional().isNumeric().withMessage('Allocated amount must be a number'),
  body('governmentDepartment').optional().trim().notEmpty().withMessage('Government department cannot be empty'),
  body('status').optional().isIn(['planned', 'in-progress', 'completed', 'on-hold']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    let budget = await Budget.findById(req.params.id);
    
    if (!budget) {
      return res.status(404).json({ 
        success: false, 
        message: 'Budget not found' 
      });
    }

    budget = await Budget.findByIdAndUpdate(
      req.params.id, 
      { ...req.body, lastUpdatedBy: req.user.id }, 
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: budget
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error updating budget', 
      error: error.message 
    });
  }
});

// Delete budget - Admin only
router.delete('/:id', authorize('admin'), async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);
    
    if (!budget) {
      return res.status(404).json({ 
        success: false, 
        message: 'Budget not found' 
      });
    }

    await budget.remove();

    res.json({
      success: true,
      message: 'Budget deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting budget', 
      error: error.message 
    });
  }
});

module.exports = router; 