const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed'],
      default: 'pending',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    deadline: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Virtual: isOverdue
taskSchema.virtual('isOverdue').get(function () {
  if (this.status === 'completed') return false;
  if (!this.deadline) return false;
  return new Date() > new Date(this.deadline);
});

// Set completedAt when status changes to completed
taskSchema.pre('save', function (next) {
  if (this.isModified('status') && this.status === 'completed') {
    this.completedAt = new Date();
  }
  if (this.isModified('status') && this.status !== 'completed') {
    this.completedAt = undefined;
  }
  next();
});

module.exports = mongoose.model('Task', taskSchema);
