const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const AppError = require('../utils/appError');

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new AppError('Name, email, and password are required', 400);
  }

  if (String(password).length < 6) {
    throw new AppError('Password must be at least 6 characters', 400);
  }

  const exists = await User.findOne({ email: String(email).toLowerCase() });
  if (exists) {
    throw new AppError('An account with this email already exists', 400);
  }

  const user = await User.create({
    name: String(name).trim(),
    email: String(email).toLowerCase().trim(),
    password,
  });

  res.status(201).json({
    success: true,
    data: {
      user: user.toSafeObject(),
      token: generateToken(user._id),
    },
  });
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError('Email and password are required', 400);
  }

  const user = await User.findOne({ email: String(email).toLowerCase() }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }

  res.json({
    success: true,
    data: {
      user: user.toSafeObject(),
      token: generateToken(user._id),
    },
  });
});

const getMe = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: req.user.toSafeObject(),
  });
});

module.exports = { registerUser, loginUser, getMe };
