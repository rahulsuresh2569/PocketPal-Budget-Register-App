const express = require('express');
const router = express.Router();
const {
  createSubject,
  getSubjects,
  getSubjectById,
  updateSubject,
  deleteSubject
} = require('../controllers/subjectController');

// Base path: /api/subjects

router.route('/')
  .post(createSubject)
  .get(getSubjects); // Handles both all subjects and ?categoryId=...

router.route('/:id')
  .get(getSubjectById)
  .put(updateSubject)
  .delete(deleteSubject);

module.exports = router; 