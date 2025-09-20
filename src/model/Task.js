const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [100, 'Task title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  status: {
    type: String,
    enum: {
      values: ['todo', 'inProgress', 'done'],
      message: 'Status must be either todo, inProgress, or done'
    },
    default: 'todo'
  },
  dueDate: {
    type: Date,
    validate: {
      validator: function (value) {
        return !value || value > Date.now();
      },
      message: 'Due date must be in the future'
    }
  },
  beekeeper: {
    type: mongoose.Schema.ObjectId,
    ref: 'Beekeeper',
    required: [true, 'Task must belong to a beekeeper']
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

// Update updatedAt automatically
taskSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Add compound index for query optimization
taskSchema.index({ beekeeper: 1, status: 1 });

module.exports = mongoose.model('Task', taskSchema);
