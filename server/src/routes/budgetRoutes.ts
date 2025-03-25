import express from 'express';
import { 
  createBudget, 
  getBudgets, 
  getBudgetById, 
  updateBudget, 
  deleteBudget 
} from '../controllers/budgetController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Budget routes
router.post('/', createBudget);
router.get('/', getBudgets);
router.get('/:id', getBudgetById);
router.put('/:id', updateBudget);
router.delete('/:id', deleteBudget);

export default router; 