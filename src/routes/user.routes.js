const express = require('express');
const { body } = require('express-validator');
const userController = require('../controllers/user.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');

const router = express.Router();

const updateValidation = [
  body('email').optional().isEmail().withMessage('Invalid email'),
  body('status').optional().isIn(['active', 'inactive', 'suspended']).withMessage('Invalid status'),
  validate
];

const createValidation = [
  body('email').optional().isEmail().withMessage('Invalid email'),
  body('mobile').notEmpty().matches(/^\d{10}$/).withMessage('Invalid mobile number'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('role').isIn(['admin', 'coach', 'parent']).withMessage('Invalid role'),
  validate
];

router.use(authenticate);

router.get('/', authorize(['admin', 'super_admin']), userController.list);
router.post('/', authorize(['super_admin']), createValidation, userController.create);
router.get('/:id', authorize(['admin', 'super_admin']), userController.getById);
router.put('/:id', authorize(['admin', 'super_admin']), updateValidation, userController.update);
router.delete('/:id', authorize(['super_admin']), userController.remove);

module.exports = router;
