const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tag name is required'],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: [40, 'Tag name cannot exceed 40 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Tag slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Tag', tagSchema);
