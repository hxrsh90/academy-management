const express = require('express');
const { body } = require('express-validator');
const paymentController = require('../controllers/payment.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');

const router = express.Router();

const createValidation = [
  body('studentId').isInt().withMessage('Student ID must be a number'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('paymentDate').isISO8601().withMessage('Invalid payment date'),
  body('paymentMode').isIn(['cash', 'upi', 'card', 'bank_transfer']).withMessage('Invalid payment mode'),
  body('feeType').isIn(['monthly', 'quarterly', 'admission', 'uniform', 'event', 'other']).withMessage('Invalid fee type'),
  validate
];

const updateValidation = [
  body('amount').optional().isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('paymentMode').optional().isIn(['cash', 'upi', 'card', 'bank_transfer']).withMessage('Invalid payment mode'),
  body('feeType').optional().isIn(['monthly', 'quarterly', 'admission', 'uniform', 'event', 'other']).withMessage('Invalid fee type'),
  body('status').optional().isIn(['paid', 'pending', 'overdue', 'refunded']).withMessage('Invalid status'),
  validate
];

router.use(authenticate);

router.get('/', authorize(['admin', 'super_admin', 'student', 'parent']), paymentController.list);
router.post('/', authorize(['admin', 'super_admin']), createValidation, paymentController.create);
router.get('/pending', authorize(['admin', 'super_admin']), paymentController.getPendingDues);
router.get('/revenue', authorize(['admin', 'super_admin']), paymentController.getRevenueStats);
router.get('/:id', authorize(['admin', 'super_admin', 'student', 'parent']), paymentController.getById);
router.put('/:id', authorize(['admin', 'super_admin']), updateValidation, paymentController.update);
router.delete('/:id', authorize(['admin', 'super_admin']), paymentController.remove);

module.exports = router;
