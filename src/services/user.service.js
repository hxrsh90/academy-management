const userModel = require('../models/user.model');
const bcrypt = require('bcryptjs');
const { NotFoundError } = require('../middleware/error.middleware');

const SALT_ROUNDS = 10;

const findAll = async (filters, page, limit) => {
  return await userModel.findAll(filters, page, limit);
};

const findById = async (id) => {
  const user = await userModel.findById(id);
  if (!user) {
    throw new NotFoundError('User not found');
  }
  return user;
};

const create = async (data) => {
  const { email, mobile, password, role } = data;
  
  const existingUser = await userModel.findByMobile(mobile);
  if (existingUser) {
    throw new Error('Mobile number already registered');
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  return await userModel.create({
    email,
    mobile,
    passwordHash,
    role
  });
};

const update = async (id, data) => {
  const user = await userModel.findById(id);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  const updateData = {};
  if (data.email) updateData.email = data.email;
  if (data.status) updateData.status = data.status;
  if (data.password) updateData.password_hash = await bcrypt.hash(data.password, SALT_ROUNDS);

  return await userModel.update(id, updateData);
};

const remove = async (id) => {
  const user = await userModel.findById(id);
  if (!user) {
    throw new NotFoundError('User not found');
  }
  return await userModel.softDelete(id);
};

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove
};
