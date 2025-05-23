const express = require('express');
const router = express.Router();
const {
  createEntry,
  getEntries,
  getEntryById,
  updateEntry,
  deleteEntry
} = require('../controllers/entryController');

// /api/entries
router.route('/')
  .post(createEntry) 
  .get(getEntries);

// /api/entries/:id
router.route('/:id')
  .get(getEntryById)
  .put(updateEntry)
  .delete(deleteEntry);

module.exports = router; 