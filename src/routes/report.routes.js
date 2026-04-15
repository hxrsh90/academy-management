const express = require('express');
const reportController = require('../controllers/report.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);
router.use(authorize(['admin', 'super_admin']));

router.get('/dashboard', reportController.getDashboard);
router.get('/attendance', reportController.getAttendanceReport);
router.get('/payments', reportController.getPaymentReport);
router.get('/enrollment', reportController.getEnrollmentReport);

module.exports = router;
