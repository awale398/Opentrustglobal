const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: 0
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  date: {
    type: Date,
    default: Date.now,
    required: true
  },
  budgetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Budget',
    required: [true, 'Budget ID is required']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

// Update budget's spent amount when expense is created
expenseSchema.post('save', async function() {
  const Budget = this.model('Budget');
  const budget = await Budget.findById(this.budgetId);
  
  if (budget) {
    budget.spentAmount += this.amount;
    await budget.save();
  }
});

module.exports = mongoose.model('Expense', expenseSchema); 