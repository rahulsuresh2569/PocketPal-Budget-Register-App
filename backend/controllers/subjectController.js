const Subject = require('../models/Subject');
const Category = require('../models/Category'); // Needed to validate category existence
const Entry = require('../models/Entry'); // Needed for delete checks

// @desc    Create a new subject for a category
// @route   POST /api/subjects
// @access  Public (for now)
const createSubject = async (req, res) => {
  try {
    const { name, categoryId } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'Subject name is required.' });
    }
    if (!categoryId) {
      return res.status(400).json({ message: 'Category ID is required to create a subject.' });
    }

    // Check if category exists
    const parentCategory = await Category.findById(categoryId);
    if (!parentCategory) {
      return res.status(404).json({ message: 'Parent category not found.' });
    }

    const newSubject = new Subject({
      name: name.trim(),
      category: categoryId
    });

    const savedSubject = await newSubject.save();
    res.status(201).json(savedSubject);
  } catch (error) {
    console.error('Error creating subject:', error.message);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation Error', errors: error.errors });
    }
    if (error.code === 11000) { // Compound unique index violation
      return res.status(409).json({ message: `Subject name '${req.body.name.trim()}' already exists in this category.` });
    }
    res.status(500).json({ message: 'Server error while creating subject' });
  }
};

// @desc    Get all subjects, optionally filtered by categoryId
// @route   GET /api/subjects
// @route   GET /api/subjects?categoryId=...
// @access  Public
const getSubjects = async (req, res) => {
  try {
    const receivedCategoryId = req.query.categoryId;
    console.log(`[getSubjects] Received categoryId from query: '${receivedCategoryId}', type: ${typeof receivedCategoryId}`);

    let query = {};
    // Ensure categoryId is a non-empty string before applying the filter
    if (receivedCategoryId && typeof receivedCategoryId === 'string' && receivedCategoryId.trim().length > 0) {
      query.category = receivedCategoryId.trim();
      console.log(`[getSubjects] Applying filter for category: ${query.category}`);
    } else {
      console.log('[getSubjects] No valid categoryId provided or categoryId is empty, will fetch all subjects (if any).');
      // If no categoryId, query remains empty {}, so all subjects will be fetched.
      // Depending on requirements, you might want to return an error or empty array if categoryId is expected but invalid.
    }

    console.log(`[getSubjects] Executing Subject.find() with query:`, JSON.stringify(query));
    const subjects = await Subject.find(query).populate('category', 'name').sort({ name: 1 });
    console.log(`[getSubjects] Found ${subjects.length} subjects with the query.`);

    res.status(200).json(subjects);
  } catch (error) {
    console.error('[getSubjects] Error fetching subjects:', error.message);
    res.status(500).json({ message: 'Server error while fetching subjects' });
  }
};

// @desc    Get a single subject by its ID
// @route   GET /api/subjects/:id
// @access  Public
const getSubjectById = async (req, res) => {
    try {
        const subject = await Subject.findById(req.params.id).populate('category', 'name');
        if (subject) {
            res.status(200).json(subject);
        } else {
            res.status(404).json({ message: 'Subject not found' });
        }
    } catch (error) {
        console.error(`Error fetching subject ${req.params.id}:`, error.message);
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Subject not found (invalid ID format)' });
        }
        res.status(500).json({ message: 'Server error while fetching subject' });
    }
};


// @desc    Update a subject
// @route   PUT /api/subjects/:id
// @access  Public
const updateSubject = async (req, res) => {
  try {
    const { name, categoryId } = req.body; // categoryId might not be updatable, or handled carefully
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'Subject name is required for update.' });
    }

    const subject = await Subject.findById(req.params.id);

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    subject.name = name.trim();
    // If allowing category change, ensure new categoryId is valid:
    // if (categoryId && subject.category.toString() !== categoryId) {
    //   const parentCategory = await Category.findById(categoryId);
    //   if (!parentCategory) return res.status(404).json({ message: 'New parent category not found.' });
    //   subject.category = categoryId;
    // }

    const updatedSubject = await subject.save();
    res.status(200).json(updatedSubject);
  } catch (error) {
    console.error(`Error updating subject ${req.params.id}:`, error.message);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation Error', errors: error.errors });
    }
    if (error.code === 11000) {
      return res.status(409).json({ message: `Another subject with this name already exists in the category.` });
    }
     if (error.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Subject not found (invalid ID format)' });
    }
    res.status(500).json({ message: 'Server error while updating subject' });
  }
};

// @desc    Delete a subject
// @route   DELETE /api/subjects/:id
// @access  Public
const deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    // Check if any entries are using this subject
    const entryUsingSubject = await Entry.findOne({ subject: subject._id });
    if (entryUsingSubject) {
      return res.status(400).json({ 
        message: 'Cannot delete subject as it is currently in use by entries. Please reassign or delete those entries first.' 
      });
    }

    await subject.deleteOne();
    res.status(200).json({ message: 'Subject removed successfully' });
  } catch (error) {
    console.error(`Error deleting subject ${req.params.id}:`, error.message);
    if (error.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Subject not found (invalid ID format)' });
    }
    res.status(500).json({ message: 'Server error while deleting subject' });
  }
};

module.exports = {
  createSubject,
  getSubjects,
  getSubjectById,
  updateSubject,
  deleteSubject
}; 