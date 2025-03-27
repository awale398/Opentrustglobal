import { Request, Response } from 'express';
import Budget from '../models/Budget';
import { AuthenticatedRequest } from '../types/custom';

// Create a new budget
export const createBudget = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const budget = await Budget.create({
      ...req.body,
      createdBy: userId
    });

    res.status(201).json({
      success: true,
      data: budget
    });
  } catch (error) {
    console.error('Create budget error:', error);
    res.status(500).json({ success: false, message: 'Error creating budget' });
  }
};

// Get all budgets
export const getBudgets = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    // Fetch all budgets instead of filtering by createdBy
    const budgets = await Budget.find()
      .populate('createdBy', 'name email')
      .sort('-createdAt');

    res.json({
      success: true,
      count: budgets.length,
      data: budgets
    });
  } catch (error) {
    console.error('Get budgets error:', error);
    res.status(500).json({ success: false, message: 'Error fetching budgets' });
  }
};

// Get a single budget by ID
export const getBudgetById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const budget = await Budget.findById(req.params.id).populate('createdBy', 'name email');
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
      message: 'Error fetching budget'
    });
  }
};

// Update a budget
export const updateBudget = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const budget = await Budget.findOneAndUpdate(
      { _id: req.params.id, createdBy: userId },
      req.body,
      { new: true }
    );

    if (!budget) {
      return res.status(404).json({ success: false, message: 'Budget not found' });
    }

    res.json({
      success: true,
      data: budget
    });
  } catch (error) {
    console.error('Update budget error:', error);
    res.status(500).json({ success: false, message: 'Error updating budget' });
  }
};

// Delete a budget
export const deleteBudget = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const budget = await Budget.findOneAndDelete({
      _id: req.params.id,
      createdBy: userId
    });

    if (!budget) {
      return res.status(404).json({ success: false, message: 'Budget not found' });
    }

    res.json({
      success: true,
      message: 'Budget deleted successfully'
    });
  } catch (error) {
    console.error('Delete budget error:', error);
    res.status(500).json({ success: false, message: 'Error deleting budget' });
  }
}; 