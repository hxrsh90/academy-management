const reportService = require('../services/report.service');

const getDashboard = async (req, res, next) => {
  try {
    const stats = await reportService.getDashboardStats();
    res.json({
      success: true,
      data: stats,
      message: 'Dashboard stats retrieved successfully'
    });
  } catch (error) {
    next(error);
  }
};

const getAttendanceReport = async (req, res, next) => {
  try {
    const { from_date, to_date, class_id, student_id } = req.query;
    const report = await reportService.getAttendanceReport({ fromDate: from_date, toDate: to_date, classId: class_id, studentId: student_id });
    res.json({
      success: true,
      data: report,
      message: 'Attendance report retrieved successfully'
    });
  } catch (error) {
    next(error);
  }
};

const getPaymentReport = async (req, res, next) => {
  try {
    const { from_date, to_date } = req.query;
    const report = await reportService.getPaymentReport(from_date, to_date);
    res.json({
      success: true,
      data: report,
      message: 'Payment report retrieved successfully'
    });
  } catch (error) {
    next(error);
  }
};

const getEnrollmentReport = async (req, res, next) => {
  try {
    const { from_date, to_date } = req.query;
    const report = await reportService.getEnrollmentReport(from_date, to_date);
    res.json({
      success: true,
      data: report,
      message: 'Enrollment report retrieved successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard,
  getAttendanceReport,
  getPaymentReport,
  getEnrollmentReport
};
