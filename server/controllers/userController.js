const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Post = require('../models/Post');
const AppError = require('../utils/appError');

const getUserProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('User not found', 404);
  }

  const user = await User.findById(id);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const posts = await Post.find({ author: user._id, status: 'published' })
    .populate('tags', 'name slug')
    .populate('author', 'name bio avatarUrl')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: {
      user: {
        _id: user._id,
        name: user.name,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
      },
      posts,
    },
  });
});

const updateMe = asyncHandler(async (req, res) => {
  const { name, bio, avatarUrl } = req.body;
  const user = await User.findById(req.user._id);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (name !== undefined) {
    if (!String(name).trim()) {
      throw new AppError('Name cannot be empty', 400);
    }
    user.name = String(name).trim();
  }

  if (bio !== undefined) {
    if (String(bio).length > 200) {
      throw new AppError('Bio cannot exceed 200 characters', 400);
    }
    user.bio = String(bio);
  }

  if (avatarUrl !== undefined) {
    user.avatarUrl = String(avatarUrl).trim();
  }

  await user.save();

  res.json({
    success: true,
    data: user.toSafeObject(),
  });
});

module.exports = { getUserProfile, updateMe };
