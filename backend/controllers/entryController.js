const Entry = require('../models/Entry');
const Category = require('../models/Category'); // For validation if needed
const Subject = require('../models/Subject');   // For validation if needed

// @desc    Create a new budget entry
// @route   POST /api/entries
// @access  Public (for now, will be Private with auth)
const createEntry = async (req, res) => {
  try {
    const { date, categoryId, subjectId, debit, credit, subject: subjectName, category: categoryName } = req.body;

    // Validate that categoryId and subjectId are provided and are valid ObjectIds
    // For now, the model schema will do basic required validation.
    // More advanced validation (e.g., checking if the Subject belongs to the Category) can be added.

    // Basic validation
    if (debit < 0 || credit < 0) {
        return res.status(400).json({ message: 'Debit and Credit amounts cannot be negative.' });
    }

    const entry = new Entry({
      date,
      category: categoryId, // Expecting ObjectId from frontend
      subject: subjectId,   // Expecting ObjectId from frontend
      debit,
      credit
    });

    const createdEntry = await entry.save();
    // Populate category and subject details before sending response
    const populatedEntry = await Entry.findById(createdEntry._id).populate('category', 'name').populate('subject', 'name');
    res.status(201).json(populatedEntry);

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
    // Populate category and subject names when fetching entries
    const entries = await Entry.find({})
                               .populate('category', 'name') // field to populate, fields to select from populated doc
                               .populate('subject', 'name')
                               .sort({ date: -1 }); 
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
    const entry = await Entry.findById(req.params.id)
                             .populate('category', 'name')
                             .populate('subject', 'name');
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
    const { date, categoryId, subjectId, debit, credit, subject: subjectName, category: categoryName } = req.body;

    if (debit !== undefined && debit < 0) {
        return res.status(400).json({ message: 'Debit amount cannot be negative.' });
    }
    if (credit !== undefined && credit < 0) {
        return res.status(400).json({ message: 'Credit amount cannot be negative.' });
    }

    const entry = await Entry.findById(req.params.id);

    if (entry) {
      entry.date = date || entry.date;
      entry.category = categoryId || entry.category; // Expecting ObjectId
      entry.subject = subjectId || entry.subject;   // Expecting ObjectId
      entry.debit = debit !== undefined ? debit : entry.debit;
      entry.credit = credit !== undefined ? credit : entry.credit;

      const savedEntry = await entry.save();
      const updatedEntry = await Entry.findById(savedEntry._id).populate('category', 'name').populate('subject', 'name');
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