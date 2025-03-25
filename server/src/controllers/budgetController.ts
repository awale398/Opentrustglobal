import { Request, Response } from 'express';
import Budget from '../models/Budget';

// Create a new budget
export const createBudget = async (req: Request, res: Response) => {
  try {
    const budget = new Budget({
      ...req.body,
      createdBy: req.user.id // This will be set by the auth middleware
    });
    await budget.save();
    
    // Populate the createdBy field with user details
    const populatedBudget = await Budget.findById(budget._id)
      .populate('createdBy', 'name email')
      .lean();

    res.status(201).json({
      success: true,
      data: populatedBudget,
      message: 'Budget created successfully'
    });
  } catch (error) {
    console.error('Error creating budget:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error creating budget',
      errors: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get all budgets
export const getBudgets = async (req: Request, res: Response) => {
  try {
    const budgets = await Budget.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: budgets
    });
  } catch (error) {
    console.error('Error fetching budgets:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching budgets',
      errors: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get a single budget by ID
export const getBudgetById = async (req: Request, res: Response) => {
  try {
    const budget = await Budget.findOne({
      _id: req.params.id,
      createdBy: req.user.id
    }).populate('createdBy', 'name email');

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    res.json(budget);
  } catch (error) {
    console.error('Error fetching budget:', error);
    res.status(500).json({ message: 'Error fetching budget' });
  }
};

// Update a budget
export const updateBudget = async (req: Request, res: Response) => {
  try {
    const budget = await Budget.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.id },
      req.body,
      { new: true }
    );

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    res.json(budget);
  } catch (error) {
    console.error('Error updating budget:', error);
    res.status(500).json({ message: 'Error updating budget' });
  }
};

// Delete a budget
export const deleteBudget = async (req: Request, res: Response) => {
  try {
    const budget = await Budget.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user.id
    });

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    res.json({ message: 'Budget deleted successfully' });
  } catch (error) {
    console.error('Error deleting budget:', error);
    res.status(500).json({ message: 'Error deleting budget' });
  }
}; 