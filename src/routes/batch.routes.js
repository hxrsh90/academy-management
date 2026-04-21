const express = require('express');
const { body } = require('express-validator');
const batchController = require('../controllers/batch.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');

const router = express.Router();

const createValidation = [
  body('name').notEmpty().withMessage('Batch name is required'),
  body('sportType').optional().notEmpty().withMessage('Sport type is required'),
  body('capacity').optional().isInt({ min: 1 }).withMessage('Capacity must be at least 1'),
  body('coachId').optional().isInt().withMessage('Coach ID must be a number'),
  body('skillLevel').optional().isIn(['beginner', 'intermediate', 'advanced', 'all']).withMessage('Invalid skill level'),
  validate
];

const updateValidation = [
  body('name').optional().notEmpty().withMessage('Batch name cannot be empty'),
  body('capacity').optional().isInt({ min: 1 }).withMessage('Capacity must be at least 1'),
  body('status').optional().isIn(['active', 'inactive', 'completed']).withMessage('Invalid status'),
  validate
];

router.use(authenticate);

// Only admin/super_admin can create/update/delete batches
router.get('/', authorize(['admin', 'super_admin', 'coach']), batchController.list);
router.post('/', authorize(['admin', 'super_admin']), createValidation, batchController.create);
router.get('/:id', authorize(['admin', 'super_admin', 'coach']), batchController.getById);
router.put('/:id', authorize(['admin', 'super_admin']), updateValidation, batchController.update);
router.delete('/:id', authorize(['super_admin']), batchController.remove);

// Student management for batches
router.get('/:id/students', authorize(['admin', 'super_admin', 'coach']), batchController.getStudents);
router.post('/:id/students', authorize(['admin', 'super_admin']), batchController.addStudent);
router.delete('/:id/students/:studentId', authorize(['admin', 'super_admin']), batchController.removeStudent);

// Get classes for batch
router.get('/:id/classes', authorize(['admin', 'super_admin', 'coach']), batchController.getClasses);

module.exports = router;
