const express = require('express');
const { body } = require('express-validator');
const importController = require('../controllers/import.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');

const router = express.Router();

const importValidation = [
  body('students').isArray({ min: 1 }).withMessage('Students array is required'),
  body('students.*.name').optional().notEmpty().withMessage('Student name is required'),
  body('defaultPassword').optional().isLength({ min: 6 }).withMessage('Default password must be at least 6 characters'),
  validate
];

router.use(authenticate);

router.post('/students', authorize(['admin', 'super_admin']), importValidation, importController.bulkImportStudents);
router.get('/history', authorize(['admin', 'super_admin']), importController.getImportHistory);
router.get('/:batchId', authorize(['admin', 'super_admin']), importController.getImportDetails);

module.exports = router;
