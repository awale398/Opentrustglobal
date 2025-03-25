const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  projectName: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true
  },
  allocatedAmount: {
    type: Number,
    required: [true, 'Allocated amount is required'],
    min: 0
  },
  spentAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  governmentDepartment: {
    type: String,
    required: [true, 'Government department is required'],
    trim: true
  },
  status: {
    type: String,
    enum: ['planned', 'in-progress', 'completed', 'on-hold'],
    default: 'planned'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
budgetSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Budget', budgetSchema); 