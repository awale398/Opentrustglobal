import express from 'express';
import { protect, authorize } from '../middleware/auth';
import {
  getBudgets,
  getBudgetById,
  createBudget,
  updateBudget,
  deleteBudget
} from '../controllers/budgetController';

const router = express.Router();

// Protect all routes
router.use(protect);

// Get all budgets
router.get('/', getBudgets);

// Get single budget
router.get('/:id', getBudgetById);

// Create budget (admin only)
router.post('/', authorize('admin'), createBudget);

// Update budget (admin only)
router.put('/:id', authorize('admin'), updateBudget);

// Delete budget (admin only)
router.delete('/:id', authorize('admin'), deleteBudget);

export default router; 