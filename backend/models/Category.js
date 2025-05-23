const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    unique: true // Assuming category names should be unique
  },
  // Future enhancement: Add user association
  // user: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'User',
  //   required: true
  // }
}, {
  timestamps: true
});

// If we associate categories with users, the unique constraint might need to be a compound index (user, name)

const Category = mongoose.model('Category', categorySchema);

module.exports = Category; 