const express = require('express');
const { body } = require('express-validator');
const studentController = require('../controllers/student.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');

const router = express.Router();

const createValidation = [
  body('mobile').notEmpty().matches(/^\d{10}$/).withMessage('Invalid mobile number'),
  body('password').optional().isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('dateOfBirth').optional().isISO8601().withMessage('Invalid date of birth'),
  body('gender').optional().isIn(['male', 'female', 'other']).withMessage('Invalid gender'),
  validate
];

const updateValidation = [
  body('firstName').optional().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().notEmpty().withMessage('Last name cannot be empty'),
  body('gender').optional().isIn(['male', 'female', 'other']).withMessage('Invalid gender'),
  body('skillLevel').optional().isIn(['beginner', 'intermediate', 'advanced']).withMessage('Invalid skill level'),
  body('enrollmentStatus').optional().isIn(['active', 'paused', 'graduated', 'dropout']).withMessage('Invalid status'),
  validate
];

router.use(authenticate);

router.get('/', authorize(['admin', 'super_admin']), studentController.list);
router.post('/', authorize(['admin', 'super_admin']), createValidation, studentController.create);
router.get('/:id', authorize(['admin', 'super_admin', 'coach', 'student']), studentController.getById);
router.put('/:id', authorize(['admin', 'super_admin']), updateValidation, studentController.update);
router.delete('/:id', authorize(['admin', 'super_admin']), studentController.remove);
router.get('/:id/classes', authorize(['admin', 'super_admin', 'coach', 'student']), studentController.getClasses);
router.get('/:id/attendance', authorize(['admin', 'super_admin', 'coach', 'student']), studentController.getAttendance);
router.get('/:id/payments', authorize(['admin', 'super_admin', 'student', 'parent']), studentController.getPayments);

module.exports = router;
