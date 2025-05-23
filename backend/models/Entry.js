const mongoose = require('mongoose');

const entrySchema = new mongoose.Schema({
  date: {
    type: Date,
    required: [true, 'Date is required']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: [true, 'Subject is required']
  },
  debit: {
    type: Number,
    required: [true, 'Debit amount is required'],
    default: 0,
    min: [0, 'Debit amount cannot be negative']
  },
  credit: {
    type: Number,
    required: [true, 'Credit amount is required'],
    default: 0,
    min: [0, 'Credit amount cannot be negative']
  },
  // Future enhancement: Add user association
  // user: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'User', // Assuming a User model
  //   required: true
  // }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt fields
});

// Ensure that for any entry, either debit or credit must be greater than 0 if both are provided, 
// but not necessarily (one can be 0). We can enforce more complex validation at controller level if needed.
// For now, individual min:0 on debit/credit handles basic cases.

const Entry = mongoose.model('Entry', entrySchema);

module.exports = Entry; 