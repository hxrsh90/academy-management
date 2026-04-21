const express = require('express');
const { body } = require('express-validator');
const classController = require('../controllers/class.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');

const router = express.Router();

const createValidation = [
  body('name').notEmpty().withMessage('Class name is required'),
  body('sportType').optional().notEmpty().withMessage('Sport type is required'),
  body('dayOfWeek').optional().isIn(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday', 'multiple']).withMessage('Invalid day of week'),
  body('startTime').optional().notEmpty().withMessage('Start time is required'),
  body('endTime').optional().notEmpty().withMessage('End time is required'),
  body('capacity').optional().isInt({ min: 1 }).withMessage('Capacity must be at least 1'),
  body('coachId').custom((value) => {
    if (value === '' || value === undefined || value === null) return true;
    if (!isNaN(parseInt(value))) return true;
    throw new Error('Coach ID must be a number');
  }),
  body('batchId').custom((value) => {
    if (value === '' || value === undefined || value === null) return true;
    if (!isNaN(parseInt(value))) return true;
    throw new Error('Batch ID must be a number');
  }),
  body('skillLevel').optional().isIn(['beginner', 'intermediate', 'advanced', 'all']).withMessage('Invalid skill level'),
  validate
];

const updateValidation = [
  body('name').optional().notEmpty().withMessage('Class name cannot be empty'),
  body('dayOfWeek').optional().isIn(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday', 'multiple']).withMessage('Invalid day of week'),
  body('capacity').optional().isInt({ min: 1 }).withMessage('Capacity must be at least 1'),
  body('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
  body('batchId').custom((value) => {
    if (value === '' || value === undefined || value === null) return true;
    if (!isNaN(parseInt(value))) return true;
    throw new Error('Batch ID must be a number');
  }),
  validate
];

router.use(authenticate);

router.get('/', authorize(['admin', 'super_admin', 'coach', 'student']), classController.list);
router.post('/', authorize(['admin', 'super_admin']), createValidation, classController.create);
router.get('/:id', authorize(['admin', 'super_admin', 'coach', 'student']), classController.getById);
router.put('/:id', authorize(['admin', 'super_admin']), updateValidation, classController.update);
router.delete('/:id', authorize(['admin', 'super_admin']), classController.remove);
router.get('/:id/students', authorize(['admin', 'super_admin', 'coach']), classController.getStudents);
router.post('/:id/students', authorize(['admin', 'super_admin']), classController.addStudent);
router.delete('/:id/students/:studentId', authorize(['admin', 'super_admin']), classController.removeStudent);

module.exports = router;
