const Entry = require('../models/Entry');

// @desc    Create a new budget entry
// @route   POST /api/entries
// @access  Public (for now, will be Private with auth)
const createEntry = async (req, res) => {
  try {
    const { date, category, subject, debit, credit } = req.body;

    // Basic validation
    if (debit < 0 || credit < 0) {
        return res.status(400).json({ message: 'Debit and Credit amounts cannot be negative.' });
    }
    // You could add a check here: if (debit === 0 && credit === 0) { /* return error */ }

    const entry = new Entry({
      date,
      category,
      subject,
      debit,
      credit
    });

    const createdEntry = await entry.save();
    res.status(201).json(createdEntry);
  } catch (error) {
    console.error('Error creating entry:', error.message);
    if (error.name === 'ValidationError') {
        return res.status(400).json({ message: 'Validation Error', errors: error.errors });
    }
    res.status(500).json({ message: 'Server error while creating entry' });
  }
};

// @desc    Get all budget entries
// @route   GET /api/entries
// @access  Public
const getEntries = async (req, res) => {
  try {
    const entries = await Entry.find({}).sort({ date: -1 }); // Sort by date descending
    res.status(200).json(entries);
  } catch (error) {
    console.error('Error fetching entries:', error.message);
    res.status(500).json({ message: 'Server error while fetching entries' });
  }
};

// @desc    Get a single budget entry by ID
// @route   GET /api/entries/:id
// @access  Public
const getEntryById = async (req, res) => {
  try {
    const entry = await Entry.findById(req.params.id);
    if (entry) {
      res.status(200).json(entry);
    } else {
      res.status(404).json({ message: 'Entry not found' });
    }
  } catch (error) {
    console.error(`Error fetching entry ${req.params.id}:`, error.message);
    if (error.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Entry not found (invalid ID format)' });
    }
    res.status(500).json({ message: 'Server error while fetching entry' });
  }
};

// @desc    Update a budget entry
// @route   PUT /api/entries/:id
// @access  Public
const updateEntry = async (req, res) => {
  try {
    const { date, category, subject, debit, credit } = req.body;

    // Basic validation
    if (debit < 0 || credit < 0) {
        return res.status(400).json({ message: 'Debit and Credit amounts cannot be negative.' });
    }

    const entry = await Entry.findById(req.params.id);

    if (entry) {
      entry.date = date || entry.date;
      entry.category = category || entry.category;
      entry.subject = subject !== undefined ? subject : entry.subject; // Allow empty string for subject
      entry.debit = debit !== undefined ? debit : entry.debit;
      entry.credit = credit !== undefined ? credit : entry.credit;

      const updatedEntry = await entry.save();
      res.status(200).json(updatedEntry);
    } else {
      res.status(404).json({ message: 'Entry not found' });
    }
  } catch (error) {
    console.error(`Error updating entry ${req.params.id}:`, error.message);
    if (error.name === 'ValidationError') {
        return res.status(400).json({ message: 'Validation Error', errors: error.errors });
    }
    if (error.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Entry not found (invalid ID format)' });
    }
    res.status(500).json({ message: 'Server error while updating entry' });
  }
};

// @desc    Delete a budget entry
// @route   DELETE /api/entries/:id
// @access  Public
const deleteEntry = async (req, res) => {
  try {
    const entry = await Entry.findById(req.params.id);

    if (entry) {
      // In Mongoose 5.x and earlier, entry.remove() was used.
      // In Mongoose 6.x and later, Model.deleteOne() or Model.findByIdAndDelete() are preferred ways to delete.
      // However, if you have the document instance, document.deleteOne() is the modern way.
      await entry.deleteOne(); 
      res.status(200).json({ message: 'Entry removed successfully' });
    } else {
      res.status(404).json({ message: 'Entry not found' });
    }
  } catch (error) {
    console.error(`Error deleting entry ${req.params.id}:`, error.message);
    if (error.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Entry not found (invalid ID format)' });
    }
    res.status(500).json({ message: 'Server error while deleting entry' });
  }
};

module.exports = {
  createEntry,
  getEntries,
  getEntryById,
  updateEntry,
  deleteEntry
}; 