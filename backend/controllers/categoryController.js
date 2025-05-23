const Category = require('../models/Category');

// @desc    Create a new category
// @route   POST /api/categories
// @access  Public (for now)
const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || name.trim() === '') {
        return res.status(400).json({ message: 'Category name is required.' });
    }

    const newCategory = new Category({ name: name.trim() });
    const savedCategory = await newCategory.save();
    res.status(201).json(savedCategory);
  } catch (error) {
    console.error('Error creating category:', error.message);
    if (error.name === 'ValidationError') {
        return res.status(400).json({ message: 'Validation Error', errors: error.errors });
    }
    // Handle unique constraint violation (duplicate key error)
    if (error.code === 11000) { // MongoDB duplicate key error code
        return res.status(409).json({ message: 'Category name already exists.' }); // 409 Conflict
    }
    res.status(500).json({ message: 'Server error while creating category' });
  }
};

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({}).sort({ name: 1 }); // Sort by name ascending
    res.status(200).json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error.message);
    res.status(500).json({ message: 'Server error while fetching categories' });
  }
};

// @desc    Get a single category by ID
// @route   GET /api/categories/:id
// @access  Public
const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (category) {
      res.status(200).json(category);
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  } catch (error) {
    console.error(`Error fetching category ${req.params.id}:`, error.message);
    if (error.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Category not found (invalid ID format)' });
    }
    res.status(500).json({ message: 'Server error while fetching category' });
  }
};

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Public
const updateCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || name.trim() === '') {
        return res.status(400).json({ message: 'Category name is required for update.' });
    }

    const category = await Category.findById(req.params.id);

    if (category) {
      category.name = name.trim();
      const updatedCategory = await category.save();
      res.status(200).json(updatedCategory);
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  } catch (error) {
    console.error(`Error updating category ${req.params.id}:`, error.message);
    if (error.name === 'ValidationError') {
        return res.status(400).json({ message: 'Validation Error', errors: error.errors });
    }
    if (error.code === 11000) {
        return res.status(409).json({ message: 'Another category with this name already exists.' });
    }
    if (error.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Category not found (invalid ID format)' });
    }
    res.status(500).json({ message: 'Server error while updating category' });
  }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Public
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (category) {
      // TODO: Consider what happens to entries using this category. 
      // Option 1: Prevent deletion if category is in use.
      // Option 2: Set entries' category to a default (e.g., 'Uncategorized') or null.
      // Option 3: Delete entries (cascade delete - potentially dangerous without warning).
      // For now, we just delete the category.
      
      // Example check (Option 1 - needs Entry model imported):
      // const Entry = require('../models/Entry');
      // const entriesUsingCategory = await Entry.findOne({ category: category.name });
      // if (entriesUsingCategory) {
      //   return res.status(400).json({ message: 'Cannot delete category as it is currently in use by entries.' });
      // }

      await category.deleteOne();
      res.status(200).json({ message: 'Category removed successfully' });
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  } catch (error) {
    console.error(`Error deleting category ${req.params.id}:`, error.message);
    if (error.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Category not found (invalid ID format)' });
    }
    res.status(500).json({ message: 'Server error while deleting category' });
  }
};

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
}; 