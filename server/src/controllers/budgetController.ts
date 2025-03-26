import { Response } from 'express';
import Budget from '../models/Budget';
import { AuthenticatedRequest } from '../types/custom';

// Create a new budget
export const createBudget = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const budget = await Budget.create({
      ...req.body,
      createdBy: req.user?.id // This will be set by the auth middleware
    });
    res.status(201).json({
      success: true,
      data: budget
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating budget'
    });
  }
};

// Get all budgets
export const getBudgets = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const budgets = await Budget.find().populate('createdBy', 'name email');
    res.json({
      success: true,
      data: budgets
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching budgets'
    });
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
    const budget = await Budget.findById(req.params.id);
    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    // Check if user is the creator or admin
    if (budget.createdBy.toString() !== req.user?.id && req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this budget'
      });
    }

    const updatedBudget = await Budget.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json({
      success: true,
      data: updatedBudget
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating budget'
    });
  }
};

// Delete a budget
export const deleteBudget = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const budget = await Budget.findById(req.params.id);
    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    // Check if user is the creator or admin
    if (budget.createdBy.toString() !== req.user?.id && req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this budget'
      });
    }

    await budget.deleteOne();

    res.json({
      success: true,
      message: 'Budget deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting budget'
    });
  }
}; 