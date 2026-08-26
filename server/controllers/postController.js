const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');
const Post = require('../models/Post');
const Tag = require('../models/Tag');
const AppError = require('../utils/appError');
const { slugify, uniqueSlug } = require('../utils/slugify');

const excerptFromContent = (content) => {
  const plain = String(content || '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[#>*_`~\-\[\]]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return plain.slice(0, 250);
};

const resolveTags = async (tagNames = []) => {
  if (!Array.isArray(tagNames)) {
    throw new AppError('Tags must be an array of names', 400);
  }

  const names = [...new Set(tagNames.map((name) => String(name).trim().toLowerCase()).filter(Boolean))].slice(
    0,
    8
  );

  const tags = [];

  for (const name of names) {
    const tagSlug = slugify(name);
    let tag = await Tag.findOne({ name });
    if (!tag) {
      tag = await Tag.create({ name, slug: tagSlug });
    }
    tags.push(tag._id);
  }

  return tags;
};

const populatePost = (query) =>
  query.populate('author', 'name bio avatarUrl').populate('tags', 'name slug');

const getPosts = asyncHandler(async (req, res) => {
  const { search, tag } = req.query;
  const filter = { status: 'published' };

  if (search) {
    const escaped = String(search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.title = { $regex: escaped, $options: 'i' };
  }

  if (tag) {
    const foundTag = await Tag.findOne({
      $or: [{ slug: String(tag).toLowerCase() }, { name: String(tag).toLowerCase() }],
    });

    if (!foundTag) {
      return res.json({ success: true, data: [] });
    }

    filter.tags = foundTag._id;
  }

  const posts = await populatePost(Post.find(filter).sort({ createdAt: -1 }));

  res.json({
    success: true,
    data: posts,
  });
});

const getMyPosts = asyncHandler(async (req, res) => {
  const posts = await populatePost(Post.find({ author: req.user._id }).sort({ updatedAt: -1 }));

  res.json({
    success: true,
    data: posts,
  });
});

const getPostBySlug = asyncHandler(async (req, res) => {
  const post = await populatePost(Post.findOne({ slug: req.params.slug }));

  if (!post) {
    throw new AppError('Post not found', 404);
  }

  const isOwner = req.user && post.author._id.toString() === req.user._id.toString();

  if (post.status !== 'published' && !isOwner) {
    throw new AppError('Post not found', 404);
  }

  res.json({
    success: true,
    data: post,
  });
});

const createPost = asyncHandler(async (req, res) => {
  const { title, content, tags, coverImage, status } = req.body;

  if (!title || !String(title).trim()) {
    throw new AppError('Title is required', 400);
  }

  if (!content || !String(content).trim()) {
    throw new AppError('Content is required', 400);
  }

  const postStatus = status === 'published' ? 'published' : 'draft';
  const baseSlug = slugify(title);
  const slug = await uniqueSlug(Post, baseSlug);
  const tagIds = await resolveTags(tags || []);

  const post = await Post.create({
    title: String(title).trim(),
    slug,
    content,
    excerpt: excerptFromContent(content),
    coverImage: coverImage ? String(coverImage).trim() : '',
    status: postStatus,
    author: req.user._id,
    tags: tagIds,
  });

  const populated = await populatePost(Post.findById(post._id));

  res.status(201).json({
    success: true,
    data: populated,
  });
});

const updatePost = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Post not found', 404);
  }

  const post = await Post.findById(id);

  if (!post) {
    throw new AppError('Post not found', 404);
  }

  if (post.author.toString() !== req.user._id.toString()) {
    throw new AppError('You can only update your own posts', 403);
  }

  const { title, content, tags, coverImage, status } = req.body;

  if (title !== undefined) {
    if (!String(title).trim()) {
      throw new AppError('Title cannot be empty', 400);
    }
    post.title = String(title).trim();
    post.slug = await uniqueSlug(Post, slugify(post.title), post._id);
  }

  if (content !== undefined) {
    if (!String(content).trim()) {
      throw new AppError('Content cannot be empty', 400);
    }
    post.content = content;
    post.excerpt = excerptFromContent(content);
  }

  if (coverImage !== undefined) {
    post.coverImage = String(coverImage).trim();
  }

  if (status !== undefined) {
    if (!['draft', 'published'].includes(status)) {
      throw new AppError('Status must be draft or published', 400);
    }
    post.status = status;
  }

  if (tags !== undefined) {
    post.tags = await resolveTags(tags);
  }

  await post.save();

  const populated = await populatePost(Post.findById(post._id));

  res.json({
    success: true,
    data: populated,
  });
});

const deletePost = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Post not found', 404);
  }

  const post = await Post.findById(id);

  if (!post) {
    throw new AppError('Post not found', 404);
  }

  if (post.author.toString() !== req.user._id.toString()) {
    throw new AppError('You can only delete your own posts', 403);
  }

  await post.deleteOne();

  res.json({
    success: true,
    data: { id: post._id },
    message: 'Post deleted',
  });
});

module.exports = {
  getPosts,
  getMyPosts,
  getPostBySlug,
  createPost,
  updatePost,
  deletePost,
};
