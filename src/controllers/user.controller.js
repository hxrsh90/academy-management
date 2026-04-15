const userService = require('../services/user.service');

const list = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, role, status, search } = req.query;
    const filters = { role, status, search };
    const result = await userService.findAll(filters, parseInt(page), parseInt(limit));
    res.json({
      success: true,
      data: result.users,
      meta: { page: result.page, limit, total: result.total, totalPages: result.totalPages },
      message: 'Users retrieved successfully'
    });
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await userService.findById(parseInt(id));
    res.json({
      success: true,
      data: user,
      message: 'User retrieved successfully'
    });
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const user = await userService.create(req.body);
    res.status(201).json({
      success: true,
      data: user,
      message: 'User created successfully'
    });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await userService.update(parseInt(id), req.body);
    res.json({
      success: true,
      data: user,
      message: 'User updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    await userService.remove(parseInt(id));
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  list,
  getById,
  create,
  update,
  remove
};
