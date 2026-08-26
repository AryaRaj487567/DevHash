const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [160, 'Title cannot exceed 160 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    excerpt: {
      type: String,
      default: '',
      maxlength: [250, 'Excerpt cannot exceed 250 characters'],
    },
    coverImage: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tag',
      },
    ],
  },
  { timestamps: true }
);

postSchema.index({ title: 'text' });
postSchema.index({ status: 1, createdAt: -1 });

const populateAuthor = { path: 'author', select: 'name bio avatarUrl' };
const populateTags = { path: 'tags', select: 'name slug' };

postSchema.statics.publishedQuery = function publishedQuery() {
  return this.find({ status: 'published' })
    .populate(populateAuthor)
    .populate(populateTags)
    .sort({ createdAt: -1 });
};

module.exports = mongoose.model('Post', postSchema);
