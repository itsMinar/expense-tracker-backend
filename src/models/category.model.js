const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      maxlength: [50, 'Category name must be at most 50 characters'],
    },
    icon: {
      type: String,
      default: 'folder',
    },
    color: {
      type: String,
      default: '#6b7280',
    },
    type: {
      type: String,
      enum: ['expense', 'income', 'both'],
      default: 'expense',
    },
  },
  { timestamps: true }
);

categorySchema.index({ user: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Category', categorySchema);
