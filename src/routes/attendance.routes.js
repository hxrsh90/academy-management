const express = require('express');
const { body } = require('express-validator');
const attendanceController = require('../controllers/attendance.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');

const router = express.Router();

const createValidation = [
  body('classId').isInt().withMessage('Class ID must be a number'),
  body('studentId').isInt().withMessage('Student ID must be a number'),
  body('date').isISO8601().withMessage('Invalid date'),
  body('status').isIn(['present', 'absent', 'late', 'excused']).withMessage('Invalid status'),
  validate
];

const bulkValidation = [
  body('classId').isInt().withMessage('Class ID must be a number'),
  body('date').isISO8601().withMessage('Invalid date'),
  body('records').isArray({ min: 1 }).withMessage('Records must be a non-empty array'),
  validate
];

const updateValidation = [
  body('status').isIn(['present', 'absent', 'late', 'excused']).withMessage('Invalid status'),
  validate
];

router.use(authenticate);

router.get('/', authorize(['admin', 'super_admin', 'coach']), attendanceController.list);
router.post('/', authorize(['admin', 'super_admin', 'coach']), createValidation, attendanceController.create);
router.post('/bulk', authorize(['admin', 'super_admin', 'coach']), bulkValidation, attendanceController.bulkCreate);
router.get('/class', authorize(['admin', 'super_admin', 'coach']), attendanceController.getClassAttendance);
router.get('/stats', authorize(['admin', 'super_admin', 'coach', 'student']), attendanceController.getStudentStats);
router.get('/:id', authorize(['admin', 'super_admin', 'coach']), attendanceController.getById);
router.put('/:id', authorize(['admin', 'super_admin', 'coach']), updateValidation, attendanceController.update);
router.delete('/:id', authorize(['admin', 'super_admin']), attendanceController.remove);

module.exports = router;
