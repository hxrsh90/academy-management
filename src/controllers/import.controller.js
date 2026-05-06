const importService = require('../services/import.service');
const { logger } = require('../utils/logger');

const bulkImportStudents = async (req, res, next) => {
  try {
    const { students, defaultPassword } = req.body;
    
    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_DATA',
        message: 'Students array is required'
      });
    }

    logger.info('Starting bulk student import', { 
      count: students.length, 
      user: req.user.id 
    });

    const result = await importService.bulkImportStudents(
      students, 
      defaultPassword || 'student123',
      req.user.id
    );

    logger.info('Bulk import completed', {
      successful: result.successful,
      failed: result.failed,
      batchId: result.batchId
    });

    res.status(201).json({
      success: true,
      data: result,
      message: `Import completed: ${result.successful} successful, ${result.failed} failed`
    });
  } catch (error) {
    logger.error('Bulk import failed', { error: error.message });
    next(error);
  }
};

const getImportHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const history = await importService.getImportHistory(parseInt(page), parseInt(limit));
    
    res.json({
      success: true,
      data: history,
      message: 'Import history retrieved successfully'
    });
  } catch (error) {
    next(error);
  }
};

const getImportDetails = async (req, res, next) => {
  try {
    const { batchId } = req.params;
    const details = await importService.getImportDetails(batchId);
    
    res.json({
      success: true,
      data: details,
      message: 'Import details retrieved successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  bulkImportStudents,
  getImportHistory,
  getImportDetails
};
